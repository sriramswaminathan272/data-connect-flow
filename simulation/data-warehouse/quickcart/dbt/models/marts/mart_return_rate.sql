{{
  config(
    materialized = 'table',
    partition_by = {'field': 'order_month', 'data_type': 'date'},
    cluster_by = ['l1_category', 'seller_tier'],
    tags = ['mart', 'returns']
  )
}}

-- ── Return Rate Attribution — Category × Seller × Logistics Breakdown ─────────
--
-- Owned by: Arjun Shah (Growth Analytics)
-- Purpose:  8.3% blended platform return rate is above category benchmark.
--           This model disaggregates by category, seller tier, courier, and reason
--           to identify where the rate spike is coming from.
--
-- Key finding hypothesis (see Arjun's return_rate_attribution.py):
--   Fashion and Beauty have 2x platform average — likely catalogue quality issues.
--   Electronics returns driven by "not_as_described" → images and specs problem.
--   CoD orders have 3x return rate of prepaid.
-- ─────────────────────────────────────────────────────────────────────────────

with returns as (
    select * from {{ ref('int_return_attribution') }}
),

order_items as (
    select
        order_item_id,
        item_revenue_inr,
        l1_category,
        l2_category,
        seller_id,
        seller_tier,
        payment_method,
        order_placed_at,
        delivery_state,
        delivery_city
    from {{ ref('int_order_items_enriched') }}
),

-- All delivered items as denominator
delivered_items as (
    select
        date_trunc(date(order_placed_at), month)    as order_month,
        l1_category,
        l2_category,
        seller_tier,
        payment_method,
        delivery_state,
        count(1)                                    as delivered_item_count,
        sum(item_revenue_inr)                       as delivered_gmv_inr
    from order_items
    where item_status = 'delivered'
    group by 1, 2, 3, 4, 5, 6
),

-- Returns aggregated to same grain
return_agg as (
    select
        date_trunc(date(r.order_placed_at), month)  as order_month,
        r.l1_category,
        r.l2_category,
        r.seller_tier,
        oi.payment_method,
        oi.delivery_state,
        r.return_reason,
        r.return_bucket,
        r.primary_responsibility,
        r.courier_partner,

        count(1)                                    as return_count,
        sum(r.item_revenue_inr)                     as return_gmv_inr,
        sum(r.platform_return_cost_inr)             as platform_return_cost_inr,
        sum(case when r.is_seller_penalty_eligible then 1 else 0 end) as penalty_eligible_count,
        avg(r.days_to_return)                       as avg_days_to_return

    from returns r
    left join order_items oi using (order_item_id)
    group by 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
),

joined as (
    select
        d.order_month,
        d.l1_category,
        d.l2_category,
        d.seller_tier,
        d.payment_method,
        d.delivery_state,
        coalesce(r.return_reason, 'no_return')      as return_reason,
        coalesce(r.return_bucket, 'no_return')      as return_bucket,
        coalesce(r.primary_responsibility, 'none')  as primary_responsibility,
        coalesce(r.courier_partner, 'none')         as courier_partner,

        d.delivered_item_count,
        d.delivered_gmv_inr,
        coalesce(r.return_count, 0)                 as return_count,
        coalesce(r.return_gmv_inr, 0)               as return_gmv_inr,
        coalesce(r.platform_return_cost_inr, 0)     as platform_return_cost_inr,
        coalesce(r.penalty_eligible_count, 0)       as penalty_eligible_count,
        coalesce(r.avg_days_to_return, null)        as avg_days_to_return,

        -- Rate metrics
        round(coalesce(r.return_count, 0) * 100.0
            / nullif(d.delivered_item_count, 0), 2) as return_rate_pct,

        round(coalesce(r.return_gmv_inr, 0) * 100.0
            / nullif(d.delivered_gmv_inr, 0), 2)   as return_gmv_rate_pct

    from delivered_items d
    left join return_agg r using (order_month, l1_category, l2_category, seller_tier, payment_method, delivery_state)
)

select * from joined
