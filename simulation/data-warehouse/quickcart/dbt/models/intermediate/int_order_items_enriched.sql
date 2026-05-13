{{
  config(
    materialized = 'ephemeral',
    tags = ['intermediate', 'orders']
  )
}}

-- Joins order items with their parent order, seller context, and product category.
-- This is the canonical "fat item" record used by mart_orders and return attribution.

with order_items as (
    select * from {{ ref('stg_order_items') }}
),

orders as (
    select
        order_id,
        user_id,
        order_placed_at,
        order_status,
        delivery_city,
        delivery_state,
        delivery_pincode,
        payment_method,
        acquisition_channel,
        is_plus_order,
        coupon_code
    from {{ ref('stg_orders') }}
),

sellers as (
    select
        seller_id,
        seller_name,
        seller_city,
        seller_state,
        current_tier,
        is_active
    from {{ ref('stg_sellers') }}
),

products as (
    select
        product_id,
        category_id,
        brand_id,
        title        as product_title
    from {{ source('raw', 'products') }}
),

categories as (
    select
        category_id,
        name         as category_name,
        path         as category_path,
        level
    from {{ source('raw', 'categories') }}
),

-- Find L1 and L2 category for each product
category_l1 as (
    select category_id, name as l1_category
    from {{ source('raw', 'categories') }}
    where level = 1
),

enriched as (
    select
        -- item keys
        oi.order_item_id,
        oi.order_id,
        oi.product_id,
        oi.variant_id,
        oi.seller_id,

        -- order context
        o.user_id,
        o.order_placed_at,
        o.order_status,
        o.delivery_city,
        o.delivery_state,
        o.delivery_pincode,
        o.payment_method,
        o.acquisition_channel,
        o.is_plus_order,
        o.coupon_code,

        -- item financials
        oi.quantity,
        oi.mrp_inr,
        oi.selling_price_inr,
        oi.discount_inr,
        oi.discount_pct,
        oi.item_revenue_inr,
        oi.platform_take_inr,
        oi.coupon_discount_inr,
        oi.item_status,
        oi.promised_delivery_at,

        -- seller
        s.seller_name,
        s.seller_city,
        s.current_tier                as seller_tier,

        -- product + category
        p.product_title,
        p.category_id,
        c.category_name,
        c.category_path,

        -- extract L1 from path (first segment)
        split(c.category_path, '/')[safe_offset(0)] as l1_category,
        split(c.category_path, '/')[safe_offset(1)] as l2_category,

        -- convenience flags
        case when oi.item_status = 'delivered'          then true else false end as is_delivered,
        case when oi.item_status = 'cancelled'          then true else false end as is_cancelled

    from order_items oi
    left join orders    o   using (order_id)
    left join sellers   s   using (seller_id)
    left join products  p   using (product_id)
    left join categories c  using (category_id)
)

select * from enriched
