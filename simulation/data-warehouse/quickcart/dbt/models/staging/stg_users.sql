{{
  config(
    materialized = 'view',
    tags = ['staging', 'users']
  )
}}

with source as (
    select * from {{ source('raw', 'users') }}
),

renamed as (
    select
        user_id,
        created_at                               as registered_at,
        city,
        state,
        pincode,
        is_plus_member,
        acquisition_channel,
        referrer_user_id,

        -- derived cohort fields
        date_trunc(date(created_at), month)      as registration_month,
        date_trunc(date(created_at), week)       as registration_week,
        date_diff(current_date, date(created_at), day) as days_since_registration,

        -- tenure buckets used in LTV models
        case
            when date_diff(current_date, date(created_at), day) <= 7  then 'new_0_7d'
            when date_diff(current_date, date(created_at), day) <= 30 then 'new_8_30d'
            when date_diff(current_date, date(created_at), day) <= 90 then 'early_31_90d'
            when date_diff(current_date, date(created_at), day) <= 365 then 'established_91_365d'
            else 'mature_365d_plus'
        end as tenure_bucket,

        _loaded_at

    from source
    where user_id is not null
)

select * from renamed
