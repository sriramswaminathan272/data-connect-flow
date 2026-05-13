{{
  config(
    materialized = 'view',
    tags = ['staging', 'sellers']
  )
}}

-- Computed by Airflow DAG: seller_gmv_daily_refresh (runs 2 AM IST)
-- Source Hive tables: seller_orders_fact, seller_items_fact (partitioned by date)
-- Note: this view normalises the pre-agg layer so dbt models don't care
-- whether upstream ran on Hive or BigQuery

with source as (
    select * from {{ source('raw', 'seller_performance_daily') }}
),

renamed as (
    select
        perf_id,
        seller_id,
        date,

        -- financials
        gmv          / 100.0 as gmv_inr,
        orders_count,
        items_sold,

        -- quality signals
        return_count,
        round(return_rate * 100, 2)          as return_rate_pct,
        avg_delivery_days,
        sla_breach_count,
        cancellation_count,
        round(cancellation_rate * 100, 2)    as cancellation_rate_pct,
        customer_rating_avg,
        dispute_count,

        -- derived
        case
            when orders_count > 0
            then round(gmv / 100.0 / orders_count, 2)
            else 0
        end as avg_order_value_inr,

        _loaded_at

    from source
)

select * from renamed
