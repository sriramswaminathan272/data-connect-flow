{{
  config(
    materialized = 'view',
    tags = ['staging', 'orders']
  )
}}

with source as (
    select * from {{ source('raw', 'orders') }}
),

renamed as (
    select
        -- keys
        order_id,
        user_id,
        session_id,

        -- timestamps
        order_placed_at,

        -- status
        order_status,

        -- financials (convert paise → rupees)
        total_mrp           / 100.0  as total_mrp_inr,
        total_selling_price / 100.0  as total_selling_price_inr,
        coupon_discount     / 100.0  as coupon_discount_inr,

        -- derived
        coupon_code,
        (total_mrp - total_selling_price) / 100.0 as total_discount_inr,
        case
            when total_mrp > 0
            then round(100.0 * (total_mrp - total_selling_price) / total_mrp, 2)
            else 0
        end as discount_pct,

        -- delivery
        delivery_pincode,
        delivery_city,
        delivery_state,

        -- payment
        payment_method,
        is_plus_order,
        acquisition_channel,

        -- meta
        _loaded_at

    from source
    where order_id is not null
)

select * from renamed
