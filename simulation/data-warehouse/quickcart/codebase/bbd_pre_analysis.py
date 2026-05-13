"""
Big Billion Days 2024 — Pre-Analysis: Category Readiness
=========================================================
Author:  Arjun Shah <arjun.shah@quickcart.in>
Updated: 2024-07-18

Context
-------
BBD deadline pulled forward to July 20. Category heads need three outputs:
  1. Undersupplied categories (supply gap vs. projected demand)
  2. Fashion GMV WoW trend (headline number for CEO deck)
  3. Electronics seller readiness (top 200 sellers by last BBD GMV)

This script pulls from the QuickCart DWH via BigQuery client.
Intermediate analysis is in Hive (Presto endpoint) — job: seller_gmv_daily_refresh.
Results pushed to Tableau data source: "BBD Readiness 2024".

Dependencies
------------
  pip install google-cloud-bigquery pandas pyarrow tableau-api-lib
  export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/quickcart-analytics.json

Hive connection uses SSH tunnel to presto-gateway.quickcart.in:8080.
"""

import os
import pandas as pd
from google.cloud import bigquery
from datetime import datetime, timedelta

# ── Config ───────────────────────────────────────────────────────────────────

PROJECT_ID    = "quickcart-analytics-prod"
DATASET_MART  = "quickcart_marts"
DATASET_STG   = "quickcart_staging"
BBD_YEAR      = 2024
REPORT_DATE   = datetime.now().strftime("%Y-%m-%d")

# BBD window from last year for demand baseline
LAST_BBD_START = "2023-10-04"
LAST_BBD_END   = "2023-10-10"

client = bigquery.Client(project=PROJECT_ID)


# ── Helper ───────────────────────────────────────────────────────────────────

def run_query(sql: str, job_id_prefix: str = "bbd_analysis") -> pd.DataFrame:
    job_config = bigquery.QueryJobConfig(
        labels={"team": "analytics", "project": "bbd_2024", "owner": "arjun_shah"}
    )
    job = client.query(sql, job_config=job_config)
    return job.result().to_dataframe()


# ── 1. Category Supply Gap ────────────────────────────────────────────────────

SUPPLY_GAP_QUERY = f"""
-- Pull from pre-computed BBD readiness mart
-- This mart is built by dbt model: mart_bbd_readiness (runs daily 6 AM)
SELECT
    l1_category,
    l2_category,
    category_name,
    available_units_now,
    units_sold_last_bbd,
    projected_bbd_demand_units,
    supply_gap_units,
    supply_coverage_ratio,
    active_seller_count,
    is_undersupplied,
    is_high_return_risk,
    had_fulfillment_issues_last_bbd,
    return_rate_last_bbd,
    gmv_last_bbd_inr / 1e7 AS gmv_last_bbd_cr  -- convert paise to Cr
FROM `{PROJECT_ID}.{DATASET_MART}.mart_bbd_readiness`
WHERE report_date = CURRENT_DATE()
ORDER BY is_undersupplied DESC, supply_coverage_ratio ASC
"""

print("Pulling supply gap analysis from mart_bbd_readiness...")
supply_gap = run_query(SUPPLY_GAP_QUERY)

# Flag categories needing urgent action
critical_gaps = supply_gap[
    (supply_gap["supply_coverage_ratio"] < 0.7) |
    (supply_gap["is_undersupplied"] == True)
].copy()

print(f"\nCritical supply gap categories: {len(critical_gaps)}")
print(critical_gaps[["l1_category", "l2_category", "supply_coverage_ratio", "supply_gap_units"]]
      .sort_values("supply_coverage_ratio")
      .head(15)
      .to_string(index=False))


# ── 2. Fashion GMV WoW Trend ─────────────────────────────────────────────────

FASHION_GMV_QUERY = f"""
-- Fashion category GMV — last 8 weeks WoW
-- Source: mart_orders (wide table, pre-joined with category hierarchy)
-- NOTE: 'Fashion' is L1. Includes: Clothing, Footwear, Accessories, Jewellery
WITH weekly AS (
    SELECT
        DATE_TRUNC(order_placed_at, WEEK) AS week_start,
        SUM(item_revenue_inr)             AS gmv_inr,
        COUNT(DISTINCT order_id)          AS order_count,
        COUNT(1)                          AS item_count,
        AVG(discount_pct)                 AS avg_discount_pct
    FROM `{PROJECT_ID}.{DATASET_MART}.mart_orders`
    WHERE l1_category = 'Fashion'
      AND order_status NOT IN ('cancelled', 'returned')
      AND order_placed_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY)
    GROUP BY 1
),
wow AS (
    SELECT
        week_start,
        gmv_inr,
        order_count,
        avg_discount_pct,
        LAG(gmv_inr) OVER (ORDER BY week_start) AS gmv_prev_week,
        ROUND(
            100.0 * (gmv_inr - LAG(gmv_inr) OVER (ORDER BY week_start))
            / NULLIF(LAG(gmv_inr) OVER (ORDER BY week_start), 0),
        1) AS gmv_wow_pct
    FROM weekly
)
SELECT * FROM wow ORDER BY week_start
"""

print("\n\nFashion GMV — Week over Week trend:")
fashion_gmv = run_query(FASHION_GMV_QUERY)
print(fashion_gmv[["week_start", "gmv_inr", "gmv_wow_pct", "avg_discount_pct"]].to_string(index=False))

# Current week GMV and WoW change (headline number for CEO deck)
latest_week = fashion_gmv.iloc[-1]
print(f"\n>>> HEADLINE: Fashion GMV this week: ₹{latest_week['gmv_inr']/1e7:.1f}Cr "
      f"({latest_week['gmv_wow_pct']:+.1f}% WoW)")

if latest_week["gmv_wow_pct"] < -10:
    print("⚠  Fashion GMV down >10% WoW — flagging for category head review")


# ── 3. Electronics Seller Readiness ──────────────────────────────────────────

ELECTRONICS_SELLERS_QUERY = f"""
-- Top 200 Electronics sellers by last BBD GMV — check their current stock levels
WITH bbd_sellers AS (
    SELECT
        seller_id,
        seller_name,
        SUM(item_revenue_inr) AS bbd_gmv_inr,
        SUM(quantity)         AS bbd_units_sold,
        RANK() OVER (ORDER BY SUM(item_revenue_inr) DESC) AS gmv_rank
    FROM `{PROJECT_ID}.{DATASET_MART}.mart_orders`
    WHERE l1_category = 'Electronics'
      AND DATE(order_placed_at) BETWEEN '{LAST_BBD_START}' AND '{LAST_BBD_END}'
    GROUP BY 1, 2
    QUALIFY RANK() OVER (ORDER BY SUM(item_revenue_inr) DESC) <= 200
),
current_inventory AS (
    SELECT
        s.seller_id,
        SUM(i.quantity_on_hand - i.quantity_reserved) AS available_stock,
        COUNT(DISTINCT i.variant_id)                  AS active_skus
    FROM `{PROJECT_ID}.{DATASET_STG}.stg_sellers` s
    JOIN `quickcart_raw.inventory` i USING (seller_id)
    GROUP BY 1
),
current_tier AS (
    SELECT
        seller_id,
        new_tier,
        composite_score,
        gmv_30d_inr,
        return_rate_30d_pct
    FROM `{PROJECT_ID}.{DATASET_MART}.mart_seller_tier_scores`
    WHERE score_date = (SELECT MAX(score_date) FROM `{PROJECT_ID}.{DATASET_MART}.mart_seller_tier_scores`)
)
SELECT
    b.gmv_rank,
    b.seller_id,
    b.seller_name,
    ROUND(b.bbd_gmv_inr / 1e5, 1)     AS last_bbd_gmv_lakh,
    b.bbd_units_sold,
    ci.available_stock,
    ci.active_skus,
    ct.new_tier                        AS current_tier,
    ROUND(ct.composite_score, 1)       AS composite_score,
    ROUND(ct.gmv_30d_inr / 1e5, 1)    AS current_gmv_30d_lakh,
    ROUND(ct.return_rate_30d_pct, 1)  AS return_rate_pct,

    -- Flag sellers with low stock relative to last BBD demand
    CASE
        WHEN ci.available_stock < b.bbd_units_sold * 0.8 THEN 'NEEDS_INVENTORY_NUDGE'
        WHEN ci.available_stock < b.bbd_units_sold       THEN 'MONITOR'
        ELSE 'OK'
    END AS inventory_status,

    -- Flag sellers whose tier has dropped since last BBD
    CASE
        WHEN ct.return_rate_30d_pct > 15 THEN 'HIGH_RETURN_RISK'
        ELSE 'OK'
    END AS quality_status

FROM bbd_sellers b
LEFT JOIN current_inventory ci USING (seller_id)
LEFT JOIN current_tier      ct USING (seller_id)
ORDER BY b.gmv_rank
"""

print("\n\nElectronics Top-200 Seller Readiness:")
elec_sellers = run_query(ELECTRONICS_SELLERS_QUERY)
needs_nudge  = elec_sellers[elec_sellers["inventory_status"] == "NEEDS_INVENTORY_NUDGE"]
print(f"Sellers needing inventory nudge: {len(needs_nudge)} of 200")
print(needs_nudge[["gmv_rank", "seller_name", "last_bbd_gmv_lakh", "available_stock",
                    "bbd_units_sold", "current_tier"]].head(20).to_string(index=False))


# ── 4. Export to Tableau ──────────────────────────────────────────────────────

# Write outputs as CSVs for Tableau Hyper extract refresh
OUTPUT_DIR = "outputs/bbd_readiness"
os.makedirs(OUTPUT_DIR, exist_ok=True)

supply_gap.to_csv(f"{OUTPUT_DIR}/supply_gap_{REPORT_DATE}.csv", index=False)
fashion_gmv.to_csv(f"{OUTPUT_DIR}/fashion_gmv_wow_{REPORT_DATE}.csv", index=False)
elec_sellers.to_csv(f"{OUTPUT_DIR}/electronics_sellers_{REPORT_DATE}.csv", index=False)

print(f"\n✅  Analysis complete. CSVs written to {OUTPUT_DIR}/")
print(f"    Next step: refresh Tableau datasource 'BBD Readiness 2024' from these files.")
print(f"    Deadline: July 20 briefing with category heads (Pooja Krishnan organising).")
