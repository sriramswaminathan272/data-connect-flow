{{
  config(
    materialized = 'view',
    tags = ['staging', 'returns']
  )
}}

with source as (
    select * from {{ source('raw', 'returns') }}
),

renamed as (
    select
        return_id,
        order_item_id,
        order_id,
        seller_id,
        return_reason,
        return_type,
        return_status,
        initiated_at,
        pickup_at,
        quality_check_result,
        seller_fault,

        -- derived
        case return_reason
            when 'wrong_item'         then 'seller_error'
            when 'damaged'            then 'logistics_or_seller_error'
            when 'quality_issue'      then 'seller_error'
            when 'size_mismatch'      then 'catalogue_error'
            when 'not_as_described'   then 'catalogue_error'
            when 'changed_mind'       then 'customer_choice'
            else 'other'
        end as return_bucket,

        case
            when seller_fault = true then 'seller'
            when return_reason in ('damaged') then 'logistics'
            when return_reason in ('changed_mind') then 'customer'
            else 'platform'
        end as primary_responsibility,

        date_diff(date(pickup_at), date(initiated_at), day) as days_to_pickup,

        _loaded_at

    from source
    where return_id is not null
)

select * from renamed
