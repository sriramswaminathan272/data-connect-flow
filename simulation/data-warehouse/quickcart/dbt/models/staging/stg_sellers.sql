{{
  config(
    materialized = 'view',
    tags = ['staging', 'sellers']
  )
}}

with source as (
    select * from {{ source('raw', 'sellers') }}
),

renamed as (
    select
        seller_id,
        display_name                       as seller_name,
        legal_name,
        gstin,
        pan_hash,
        city                               as seller_city,
        state                              as seller_state,
        pincode                            as seller_pincode,
        tier                               as current_tier,
        account_status,
        onboarded_at,

        -- derived
        date_diff(current_date, date(onboarded_at), day) as days_on_platform,
        case
            when account_status = 'active' then true
            else false
        end as is_active,

        _loaded_at

    from source
    where seller_id is not null
)

select * from renamed
