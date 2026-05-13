{{
  config(
    materialized = 'view',
    tags = ['staging', 'orders']
  )
}}

with source as (
    select * from {{ source('raw', 'order_items') }}
),

renamed as (
    select
        order_item_id,
        order_id,
        product_id,
        variant_id,
        seller_id,
        quantity,

        -- financials
        mrp           / 100.0 as mrp_inr,
        selling_price / 100.0 as selling_price_inr,
        (mrp - selling_price) / 100.0                          as discount_inr,
        coupon_discount_allocated / 100.0                      as coupon_discount_inr,
        (selling_price * quantity) / 100.0                     as item_revenue_inr,
        (selling_price * platform_commission_rate / 100.0)
            * quantity / 100.0                                 as platform_take_inr,

        platform_commission_rate,

        case
            when mrp > 0
            then round(100.0 * (mrp - selling_price) / mrp, 2)
            else 0
        end as discount_pct,

        -- status
        item_status,
        promised_delivery_at,

        _loaded_at

    from source
    where order_item_id is not null
)

select * from renamed
