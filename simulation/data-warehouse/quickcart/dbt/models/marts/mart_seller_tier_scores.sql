{{
  config(
    materialized = 'table',
    partition_by = {'field': 'score_date', 'data_type': 'date'},
    cluster_by = ['seller_id'],
    tags = ['mart', 'sellers', 'tier_model']
  )
}}

-- ── Seller Tier Model — Multi-dimensional Score ──────────────────────────────
--
-- Owned by: Arjun Shah (Growth Analytics) / Meera Nair (PM, Seller Platform)
-- Recalibrated: Q3 2024 — first rebuild in 2 years
-- Previous model: single-dimension GMV threshold only
--
-- New model scores each seller across 5 dimensions (all normalised 0–100):
--   1. GMV Score       (30% weight) — absolute volume matters
--   2. Quality Score   (25% weight) — return rate, customer rating
--   3. SLA Score       (20% weight) — delivery time, breach rate
--   4. Reliability     (15% weight) — cancellation rate, dispute rate
--   5. Catalogue Score (10% weight) — active SKUs, listing quality
--
-- Tier assignment:
--   Gold:   composite ≥ 75  AND  GMV_30d ≥ ₹5L
--   Silver: composite ≥ 50  OR   GMV_30d ≥ ₹1L
--   Bronze: all others
--   At Risk: composite < 30 (triggers seller success outreach)
--
-- Output: 1.2M rows (all active sellers on the platform)
-- ─────────────────────────────────────────────────────────────────────────────

with rolling as (
    select * from {{ ref('int_seller_rolling_metrics') }}
    where date = (select max(date) from {{ ref('int_seller_rolling_metrics') }})
),

sellers as (
    select
        seller_id,
        seller_name,
        seller_city,
        seller_state,
        current_tier    as legacy_tier,
        is_active,
        onboarded_at,
        days_on_platform
    from {{ ref('stg_sellers') }}
    where is_active = true
),

-- Catalogue quality from product listings
catalogue as (
    select
        seller_id,
        count(distinct product_id)                                   as active_product_count,
        count(distinct category_id)                                  as category_breadth,
        avg(case when is_active then 1.0 else 0.0 end) * 100         as listing_active_pct
    from {{ source('raw', 'products') }}
    group by 1
),

-- Normalise each dimension to 0-100
scored as (
    select
        r.seller_id,
        r.date                                   as score_date,

        -- raw metrics
        r.gmv_30d_inr,
        r.gmv_90d_inr,
        r.orders_30d,
        r.return_rate_30d_pct,
        r.cancellation_rate_30d_pct,
        r.sla_breach_rate_30d_pct,
        r.rating_30d_avg,
        r.delivery_days_30d_avg,
        c.active_product_count,
        c.category_breadth,
        c.listing_active_pct,

        -- 1. GMV Score (log-scaled — avoids top-seller dominance)
        -- Maps: ₹0 → 0, ₹1L/mo → 40, ₹5L/mo → 70, ₹20L+ → 100
        least(100, greatest(0,
            case
                when r.gmv_30d_inr <= 0         then 0
                when r.gmv_30d_inr < 10000      then round(r.gmv_30d_inr / 10000.0 * 20, 1)
                when r.gmv_30d_inr < 100000     then 20 + round(log10(r.gmv_30d_inr / 10000.0)     / log10(10) * 30, 1)
                when r.gmv_30d_inr < 500000     then 50 + round(log10(r.gmv_30d_inr / 100000.0)    / log10(5)  * 20, 1)
                else                                 70 + round(least(1, log10(r.gmv_30d_inr / 500000.0) / log10(40)) * 30, 1)
            end
        ))                                                           as gmv_score,

        -- 2. Quality Score — lower return rate = higher score; penalise > 18%
        greatest(0, 100
            - (r.return_rate_30d_pct * 4)                           -- -4 pts per 1% return rate
            + greatest(0, (r.rating_30d_avg - 3.0) * 20)            -- +20 pts for 4.0 rating, +40 for 5.0
        )                                                            as quality_score,

        -- 3. SLA Score
        greatest(0, 100
            - (r.sla_breach_rate_30d_pct * 5)                       -- -5 pts per 1% SLA breach
            - greatest(0, (r.delivery_days_30d_avg - 3.0) * 10)     -- -10 pts per day above 3-day standard
        )                                                            as sla_score,

        -- 4. Reliability Score
        greatest(0, 100
            - (r.cancellation_rate_30d_pct * 6)                     -- -6 pts per 1% cancellation
        )                                                            as reliability_score,

        -- 5. Catalogue Score
        greatest(0, least(100,
            coalesce(c.listing_active_pct, 0) * 0.5                 -- up to 50 pts for active listings %
            + least(30, coalesce(c.active_product_count, 0) / 10.0) -- up to 30 pts per 10 active products
            + least(20, coalesce(c.category_breadth, 0) * 4)        -- up to 20 pts for category spread
        ))                                                           as catalogue_score

    from rolling r
    left join sellers   s using (seller_id)
    left join catalogue c using (seller_id)
),

final as (
    select
        seller_id,
        score_date,

        -- dimension scores
        round(gmv_score,          1)   as gmv_score,
        round(quality_score,      1)   as quality_score,
        round(sla_score,          1)   as sla_score,
        round(reliability_score,  1)   as reliability_score,
        round(catalogue_score,    1)   as catalogue_score,

        -- composite weighted score
        round(
            gmv_score         * 0.30
          + quality_score     * 0.25
          + sla_score         * 0.20
          + reliability_score * 0.15
          + catalogue_score   * 0.10
        , 1)                           as composite_score,

        -- raw metrics for downstream drilldown
        gmv_30d_inr,
        gmv_90d_inr,
        orders_30d,
        return_rate_30d_pct,
        cancellation_rate_30d_pct,
        sla_breach_rate_30d_pct,
        rating_30d_avg,
        delivery_days_30d_avg,
        active_product_count,
        category_breadth,

        -- tier assignment (new model)
        case
            when (
                    gmv_score * 0.30 + quality_score * 0.25 + sla_score * 0.20
                    + reliability_score * 0.15 + catalogue_score * 0.10
                 ) >= 75
             and gmv_30d_inr >= {{ var('seller_tier_gold_gmv_threshold') }}
            then 'gold'
            when (
                    gmv_score * 0.30 + quality_score * 0.25 + sla_score * 0.20
                    + reliability_score * 0.15 + catalogue_score * 0.10
                 ) >= 50
              or gmv_30d_inr >= {{ var('seller_tier_silver_gmv_threshold') }}
            then 'silver'
            when (
                    gmv_score * 0.30 + quality_score * 0.25 + sla_score * 0.20
                    + reliability_score * 0.15 + catalogue_score * 0.10
                 ) < 30
            then 'at_risk'
            else 'bronze'
        end                            as new_tier

    from scored
)

select * from final
