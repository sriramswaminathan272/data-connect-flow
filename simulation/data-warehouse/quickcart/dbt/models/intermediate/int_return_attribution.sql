{{
  config(
    materialized = 'ephemeral',
    tags = ['intermediate', 'returns']
  )
}}

-- Joins returns with order_items, seller, and delivery to attribute each return
-- to its primary responsible party and cause bucket.
-- Used by mart_return_rate and the return_rate_attribution Hive job.

with returns as (
    select * from {{ ref('stg_returns') }}
),

order_items as (
    select
        order_item_id,
        order_id,
        seller_id,
        product_id,
        variant_id,
        selling_price_inr,
        item_revenue_inr,
        l1_category,
        l2_category,
        seller_tier,
        seller_city,
        order_placed_at,
        delivery_state
    from {{ ref('int_order_items_enriched') }}
),

deliveries as (
    select
        order_id,
        seller_id,
        courier_partner,
        delivered_at,
        date_diff(date(delivered_at), date(pickup_at), day) as actual_delivery_days,
        delivery_attempts
    from {{ source('raw', 'deliveries') }}
    where delivery_status = 'delivered'
),

attributed as (
    select
        r.return_id,
        r.order_item_id,
        r.order_id,
        r.seller_id,
        r.return_reason,
        r.return_bucket,
        r.primary_responsibility,
        r.return_type,
        r.return_status,
        r.quality_check_result,
        r.seller_fault,
        r.initiated_at,
        r.days_to_pickup,

        -- order item context
        oi.product_id,
        oi.variant_id,
        oi.selling_price_inr,
        oi.item_revenue_inr,
        oi.l1_category,
        oi.l2_category,
        oi.seller_tier,
        oi.seller_city,
        oi.order_placed_at,
        oi.delivery_state,

        -- delivery context
        d.courier_partner,
        d.actual_delivery_days,
        d.delivery_attempts,

        -- refund cost to platform
        case
            when r.primary_responsibility = 'seller'   then oi.item_revenue_inr
            when r.primary_responsibility = 'logistics' then oi.item_revenue_inr * 0.5
            when r.primary_responsibility = 'customer'  then 0
            else oi.item_revenue_inr * 0.2
        end as platform_return_cost_inr,

        -- is this a penalty-eligible return for the seller?
        case
            when r.seller_fault = true
             and r.quality_check_result = 'approved'
            then true
            else false
        end as is_seller_penalty_eligible,

        -- days from order to return initiation (proxy for product satisfaction)
        date_diff(date(r.initiated_at), date(oi.order_placed_at), day) as days_to_return

    from returns r
    left join order_items oi using (order_item_id)
    left join deliveries  d  using (order_id, seller_id)
)

select * from attributed
