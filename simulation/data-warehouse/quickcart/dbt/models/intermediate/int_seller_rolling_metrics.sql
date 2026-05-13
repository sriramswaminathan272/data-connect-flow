{{
  config(
    materialized = 'ephemeral',
    tags = ['intermediate', 'sellers']
  )
}}

-- Rolling 30-day and 90-day aggregations per seller.
-- These are the primary inputs to the Seller Tier Model (mart_seller_tier_scores).
-- Recomputed daily by the seller_gmv_daily_refresh DAG.

with daily as (
    select * from {{ ref('stg_seller_performance_daily') }}
),

rolling as (
    select
        seller_id,
        date,

        -- 30-day rolling window
        sum(gmv_inr) over (
            partition by seller_id
            order by date
            rows between 29 preceding and current row
        ) as gmv_30d_inr,

        sum(orders_count) over (
            partition by seller_id
            order by date
            rows between 29 preceding and current row
        ) as orders_30d,

        sum(return_count) over (
            partition by seller_id
            order by date
            rows between 29 preceding and current row
        ) as returns_30d,

        sum(sla_breach_count) over (
            partition by seller_id
            order by date
            rows between 29 preceding and current row
        ) as sla_breaches_30d,

        sum(cancellation_count) over (
            partition by seller_id
            order by date
            rows between 29 preceding and current row
        ) as cancellations_30d,

        avg(customer_rating_avg) over (
            partition by seller_id
            order by date
            rows between 29 preceding and current row
        ) as rating_30d_avg,

        avg(avg_delivery_days) over (
            partition by seller_id
            order by date
            rows between 29 preceding and current row
        ) as delivery_days_30d_avg,

        -- 90-day rolling window (for tier recalibration)
        sum(gmv_inr) over (
            partition by seller_id
            order by date
            rows between 89 preceding and current row
        ) as gmv_90d_inr,

        sum(orders_count) over (
            partition by seller_id
            order by date
            rows between 89 preceding and current row
        ) as orders_90d,

        sum(return_count) over (
            partition by seller_id
            order by date
            rows between 89 preceding and current row
        ) as returns_90d,

        -- day count (to avoid dividing by zero for new sellers)
        row_number() over (partition by seller_id order by date) as active_days

    from daily
),

with_derived as (
    select
        seller_id,
        date,
        gmv_30d_inr,
        gmv_90d_inr,
        orders_30d,
        orders_90d,
        returns_30d,
        returns_90d,
        sla_breaches_30d,
        cancellations_30d,
        rating_30d_avg,
        delivery_days_30d_avg,
        active_days,

        -- derived rate metrics
        case when orders_30d > 0
             then round(returns_30d     / orders_30d * 100, 2) else 0 end as return_rate_30d_pct,
        case when orders_30d > 0
             then round(cancellations_30d / orders_30d * 100, 2) else 0 end as cancellation_rate_30d_pct,
        case when orders_30d > 0
             then round(sla_breaches_30d / orders_30d * 100, 2) else 0 end as sla_breach_rate_30d_pct,

        -- monthly GMV annualised for tier threshold comparisons
        round(gmv_30d_inr * (365.0 / 30), 0) as gmv_annualised_inr

    from rolling
)

select * from with_derived
