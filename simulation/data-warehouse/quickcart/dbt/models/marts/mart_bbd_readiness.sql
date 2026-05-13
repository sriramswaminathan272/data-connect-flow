{{
  config(
    materialized = 'table',
    tags = ['mart', 'category', 'bbd']
  )
}}

-- ── Big Billion Days Pre-Analysis — Category Readiness Report ─────────────────
--
-- Owned by:    Arjun Shah (Growth Analytics, Seller GMV & Category Performance)
-- For:         Category heads briefing, deadline July 20
-- BBD Year:    {{ var('bbd_year') }}
--
-- Answers:
--   1. Which categories are undersupplied (supply gap vs. last BBD demand)?
--   2. Which categories have price competitiveness gaps vs. Amazon?
--   3. Which sellers need inventory nudges to avoid stockouts?
--   4. Where is the return rate spike risk based on last BBD patterns?
--
-- Input: 365 days of order data + last year BBD orders + current inventory
-- ─────────────────────────────────────────────────────────────────────────────

with category_current_supply as (
    -- Current inventory position by category
    select
        p.category_id,
        c.category_name,
        split(c.category_path, '/')[safe_offset(0)]  as l1_category,
        split(c.category_path, '/')[safe_offset(1)]  as l2_category,
        sum(i.quantity_on_hand - i.quantity_reserved) as available_units,
        count(distinct i.seller_id)                   as active_seller_count,
        count(distinct p.product_id)                  as active_product_count
    from {{ source('raw', 'inventory') }} i
    join {{ source('raw', 'products') }}   p using (variant_id)
    join {{ source('raw', 'categories') }} c on p.category_id = c.category_id
    where i.quantity_on_hand > 0
    group by 1, 2, 3, 4
),

-- Last year BBD demand (first 7 days of sale, Oct window)
last_bbd_demand as (
    select
        oi.l1_category,
        oi.l2_category,
        oi.category_id,
        sum(oi.quantity)                              as units_sold_bbd,
        sum(oi.item_revenue_inr)                     as gmv_bbd_inr,
        sum(case when oi.is_delivered then 1 else 0 end)
            / nullif(count(1), 0) * 100              as fulfillment_rate_bbd_pct,
        avg(oi.discount_pct)                         as avg_discount_pct_bbd,
        count(1)                                     as order_items_count_bbd
    from {{ ref('int_order_items_enriched') }} oi
    -- Previous BBD window — parameterise year
    where date(oi.order_placed_at) between
              date({{ var('bbd_year') }} - 1, 10, 1)
          and date({{ var('bbd_year') }} - 1, 10, 7)
    group by 1, 2, 3
),

-- Current 30-day run-rate to project BBD demand
current_runrate as (
    select
        oi.l1_category,
        oi.l2_category,
        oi.category_id,
        sum(oi.quantity)          / 30.0             as avg_daily_units,
        sum(oi.item_revenue_inr)  / 30.0             as avg_daily_gmv_inr,
        avg(oi.discount_pct)                         as avg_discount_pct_current,
        -- Average BBD multiplier observed historically: 8-12x daily volume
        -- Assume conservative 8x for planning
        sum(oi.quantity) / 30.0 * 8 * 7              as projected_bbd_units_demand
    from {{ ref('int_order_items_enriched') }} oi
    where date(oi.order_placed_at) >= date_sub(current_date, interval 30 day)
    group by 1, 2, 3
),

-- Category-level return risk from prior year BBD data
category_return_risk as (
    select
        r.l1_category,
        r.l2_category,
        count(1)                                     as total_returns_bbd,
        sum(case when r.seller_fault then 1 else 0 end) as seller_fault_returns,
        avg(r.days_to_return)                        as avg_days_to_return,
        -- High return rate last BBD → risk flag
        count(1) * 1.0
            / nullif(sum(case when r.return_status = 'completed' then 1 else 0 end), 0)
                                                     as return_rate_bbd
    from {{ ref('int_return_attribution') }} r
    where date(r.order_placed_at) between
              date({{ var('bbd_year') }} - 1, 10, 1)
          and date({{ var('bbd_year') }} - 1, 10, 14)  -- include post-BBD returns
    group by 1, 2
),

final as (
    select
        coalesce(s.category_id, d.category_id, r2.l1_category)   as category_id,
        coalesce(s.category_name, d.l2_category)                  as category_name,
        coalesce(s.l1_category, d.l1_category)                    as l1_category,
        coalesce(s.l2_category, d.l2_category)                    as l2_category,

        -- Supply
        coalesce(s.available_units, 0)                            as available_units_now,
        coalesce(s.active_seller_count, 0)                        as active_seller_count,
        coalesce(s.active_product_count, 0)                       as active_product_count,

        -- Last BBD actual
        coalesce(d.units_sold_bbd, 0)                             as units_sold_last_bbd,
        coalesce(d.gmv_bbd_inr, 0)                                as gmv_last_bbd_inr,
        coalesce(d.fulfillment_rate_bbd_pct, 0)                   as fulfillment_rate_last_bbd_pct,
        coalesce(d.avg_discount_pct_bbd, 0)                       as avg_discount_last_bbd_pct,

        -- Projected demand
        coalesce(r.projected_bbd_units_demand, 0)                 as projected_bbd_demand_units,
        coalesce(r.avg_daily_gmv_inr * 8 * 7, 0)                  as projected_bbd_gmv_inr,

        -- Supply gap (negative = undersupplied)
        coalesce(s.available_units, 0)
            - coalesce(r.projected_bbd_units_demand, 0)           as supply_gap_units,

        -- Coverage ratio (1.0 = just enough, <0.8 = undersupplied alert)
        case
            when coalesce(r.projected_bbd_units_demand, 0) > 0
            then round(coalesce(s.available_units, 0)
                     / r.projected_bbd_units_demand, 2)
            else null
        end                                                       as supply_coverage_ratio,

        -- Price competitiveness gap (placeholder — needs Amazon price feed join)
        -- TODO: join with external.amazon_category_prices once feed is live
        null                                                       as price_gap_vs_amazon_pct,

        -- Return risk from last BBD
        coalesce(ret.return_rate_bbd, 0)                          as return_rate_last_bbd,
        coalesce(ret.seller_fault_returns, 0)                     as seller_fault_returns_last_bbd,

        -- Readiness flags
        case
            when coalesce(s.available_units, 0)
                   / nullif(r.projected_bbd_units_demand, 0) < 0.8
            then true else false
        end                                                       as is_undersupplied,
        case
            when coalesce(ret.return_rate_bbd, 0) > 0.15
            then true else false
        end                                                       as is_high_return_risk,
        case
            when coalesce(d.fulfillment_rate_bbd_pct, 100) < 85
            then true else false
        end                                                       as had_fulfillment_issues_last_bbd,

        current_date                                              as report_date

    from category_current_supply   s
    full join last_bbd_demand      d using (category_id)
    left join current_runrate      r using (category_id)
    left join category_return_risk ret
          on  coalesce(s.l2_category, d.l2_category) = ret.l2_category
          and coalesce(s.l1_category, d.l1_category) = ret.l1_category
)

select * from final
order by is_undersupplied desc, supply_gap_units asc
