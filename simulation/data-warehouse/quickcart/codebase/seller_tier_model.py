"""
Seller Tier Model Revamp — QuickCart Q3 2024
============================================
Author:  Arjun Shah <arjun.shah@quickcart.in>
PM Lead: Meera Nair <meera.nair@quickcart.in>
Updated: 2024-07-15

Context
-------
The current Gold/Silver/Bronze tier model hasn't been recalibrated in 2 years.
It uses a single dimension: trailing 90-day GMV threshold.
Problems:
  - High-GMV sellers with terrible return rates remain Gold
  - Good small sellers stuck in Bronze with no path to upgrade
  - Sellers game the system by GMV-padding with self-refunds

New Model: Multi-dimensional score (5 dimensions, as implemented in mart_seller_tier_scores)
See dbt model: models/marts/mart_seller_tier_scores.sql

This script:
  1. Validates the new score distribution vs. legacy tiers
  2. Identifies sellers whose tier would change (impact analysis for PM)
  3. Checks for sellers gaming return rate (anomaly detection)
  4. Produces the final tier assignment file for Meera's review

Scope: 1.2M active sellers
"""

import pandas as pd
import numpy as np
from google.cloud import bigquery
from scipy import stats

PROJECT_ID   = "quickcart-analytics-prod"
DATASET_MART = "quickcart_marts"
DATASET_STG  = "quickcart_staging"

client = bigquery.Client(project=PROJECT_ID)


def run_query(sql: str) -> pd.DataFrame:
    return client.query(sql).result().to_dataframe()


# ── 1. Load new tier scores ───────────────────────────────────────────────────

NEW_SCORES_QUERY = f"""
SELECT
    t.seller_id,
    s.seller_name,
    s.seller_city,
    s.seller_state,
    s.legacy_tier,
    t.new_tier,
    t.composite_score,
    t.gmv_score,
    t.quality_score,
    t.sla_score,
    t.reliability_score,
    t.catalogue_score,
    t.gmv_30d_inr,
    t.gmv_90d_inr,
    t.orders_30d,
    t.return_rate_30d_pct,
    t.cancellation_rate_30d_pct,
    t.sla_breach_rate_30d_pct,
    t.rating_30d_avg,
    s.days_on_platform
FROM `{PROJECT_ID}.{DATASET_MART}.mart_seller_tier_scores` t
JOIN `{PROJECT_ID}.{DATASET_STG}.stg_sellers` s USING (seller_id)
WHERE t.score_date = (
    SELECT MAX(score_date)
    FROM `{PROJECT_ID}.{DATASET_MART}.mart_seller_tier_scores`
)
"""

print("Loading new tier scores (1.2M sellers)...")
scores = run_query(NEW_SCORES_QUERY)
print(f"Loaded {len(scores):,} sellers")


# ── 2. Tier transition analysis ───────────────────────────────────────────────

scores["tier_change"] = scores.apply(
    lambda r: f"{r['legacy_tier']} → {r['new_tier']}"
    if r["legacy_tier"] != r["new_tier"] else "no_change",
    axis=1
)

transitions = scores.groupby("tier_change").agg(
    seller_count=("seller_id", "count"),
    avg_gmv_30d=("gmv_30d_inr", "mean"),
    avg_composite_score=("composite_score", "mean")
).reset_index().sort_values("seller_count", ascending=False)

print("\n── Tier Transition Summary ──────────────────────────────────────────")
print(transitions.to_string(index=False))

# Highlight sellers dropping from Gold
gold_drops = scores[
    (scores["legacy_tier"] == "gold") & (scores["new_tier"] != "gold")
].copy()
print(f"\n⚠  Gold sellers dropping tier: {len(gold_drops):,}")
print(gold_drops.groupby("new_tier")[["seller_id", "gmv_30d_inr", "return_rate_30d_pct"]]
      .describe().to_string())


# ── 3. Score distribution validation ─────────────────────────────────────────

print("\n── Score Distribution by Dimension ─────────────────────────────────")
score_cols = ["composite_score", "gmv_score", "quality_score",
              "sla_score", "reliability_score", "catalogue_score"]

print(scores[score_cols].describe().round(1).to_string())

# Check for score compression (bad: if P25 and P75 are too close)
for col in score_cols:
    iqr = scores[col].quantile(0.75) - scores[col].quantile(0.25)
    if iqr < 10:
        print(f"⚠  {col}: low variance (IQR={iqr:.1f}) — may need recalibration")


# ── 4. Gaming detection — return rate anomalies ───────────────────────────────

# Sellers with suspiciously low return rates vs. their category peers
# A seller in Fashion with 0.1% returns while category average is 12% → suspicious
CATEGORY_RETURN_RATES_QUERY = f"""
-- Category-level return rates for benchmarking
SELECT
    l1_category,
    ROUND(AVG(return_rate_30d_pct), 2) AS category_avg_return_rate,
    PERCENTILE_CONT(return_rate_30d_pct, 0.25) OVER (PARTITION BY l1_category) AS p25,
    PERCENTILE_CONT(return_rate_30d_pct, 0.75) OVER (PARTITION BY l1_category) AS p75
FROM `{PROJECT_ID}.{DATASET_MART}.mart_seller_tier_scores` t
JOIN `{PROJECT_ID}.{DATASET_STG}.stg_sellers` s USING (seller_id)
JOIN (
    SELECT seller_id, l1_category
    FROM `{PROJECT_ID}.{DATASET_MART}.mart_orders`
    WHERE order_placed_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    GROUP BY 1, 2
) cat USING (seller_id)
WHERE score_date = (SELECT MAX(score_date) FROM `{PROJECT_ID}.{DATASET_MART}.mart_seller_tier_scores`)
GROUP BY 1
"""

# Sellers with returns that look "too good" — may be not processing them properly
suspicious_return_sellers = scores[
    (scores["return_rate_30d_pct"] < 0.5) &  # under 0.5% returns
    (scores["orders_30d"] > 100) &             # with meaningful volume
    (scores["gmv_30d_inr"] > 50000)            # ₹50K+ GMV/month
].copy()

print(f"\n── Potentially Gaming Return Rate ────────────────────────────────────")
print(f"Sellers with <0.5% returns AND >100 orders AND >₹50K GMV: "
      f"{len(suspicious_return_sellers):,}")
print("These should be reviewed by the Trust & Safety team before tier upgrade.")


# ── 5. Electronics tier scores (for Meera's July 20 briefing) ────────────────

ELECTRONICS_TIER_QUERY = f"""
SELECT
    t.seller_id,
    s.seller_name,
    s.seller_city,
    s.legacy_tier,
    t.new_tier,
    ROUND(t.composite_score, 1)          AS composite_score,
    ROUND(t.gmv_30d_inr / 1e5, 1)        AS gmv_30d_lakh,
    ROUND(t.return_rate_30d_pct, 1)      AS return_rate_pct,
    ROUND(t.rating_30d_avg, 2)           AS rating,
    t.orders_30d
FROM `{PROJECT_ID}.{DATASET_MART}.mart_seller_tier_scores` t
JOIN `{PROJECT_ID}.{DATASET_STG}.stg_sellers` s USING (seller_id)
JOIN (
    SELECT seller_id
    FROM `{PROJECT_ID}.{DATASET_MART}.mart_orders`
    WHERE l1_category = 'Electronics'
      AND order_placed_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    GROUP BY 1
) elec USING (seller_id)
WHERE score_date = (SELECT MAX(score_date) FROM `{PROJECT_ID}.{DATASET_MART}.mart_seller_tier_scores`)
ORDER BY t.gmv_30d_inr DESC
LIMIT 50000
"""

print("\nLoading Electronics seller tier scores...")
elec_scores = run_query(ELECTRONICS_TIER_QUERY)
print(f"Electronics sellers: {len(elec_scores):,}")

# Tier distribution for Electronics
tier_dist = elec_scores.groupby(["legacy_tier", "new_tier"]).size().unstack(fill_value=0)
print("\nElectronics tier transition matrix:")
print(tier_dist.to_string())


# ── 6. Export for Meera's review ──────────────────────────────────────────────

OUTPUT_PATH = "outputs/seller_tier_revamp"
import os
os.makedirs(OUTPUT_PATH, exist_ok=True)

# Full transition report
scores[scores["tier_change"] != "no_change"].to_csv(
    f"{OUTPUT_PATH}/tier_changes.csv", index=False
)

# Electronics scores (Meera needs these by end of month)
elec_scores.to_csv(f"{OUTPUT_PATH}/electronics_tier_scores.csv", index=False)

# At-risk sellers for proactive outreach
at_risk = scores[scores["new_tier"] == "at_risk"]
at_risk.to_csv(f"{OUTPUT_PATH}/at_risk_sellers.csv", index=False)

print(f"\n✅  Outputs written to {OUTPUT_PATH}/")
print(f"    tier_changes.csv     : {len(scores[scores['tier_change'] != 'no_change']):,} sellers")
print(f"    electronics_scores   : {len(elec_scores):,} sellers")
print(f"    at_risk_sellers.csv  : {len(at_risk):,} sellers (trigger success team outreach)")
print(f"\n    ⚠  Coordinate with Neha Singh before running on Hive — "
      f"seller_gmv_daily_refresh and Seller Tier DAGs share executor pool.")
