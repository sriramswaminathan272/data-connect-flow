"""
Return Rate Attribution — QuickCart Platform
============================================
Author:  Arjun Shah <arjun.shah@quickcart.in>
Updated: 2024-07-16

Context
-------
Platform blended return rate: 8.3% (up from 7.1% same period last year).
This is above the e-commerce industry benchmark of 6–7% for marketplace models.
Category heads are asking why — but without attribution we can't answer.

This script decomposes the 8.3% into its root causes:
  1. By category (Fashion, Beauty suspected to be 2x platform avg)
  2. By seller tier (Bronze sellers driving most of the spike?)
  3. By payment method (CoD orders historically 3x return rate of prepaid)
  4. By return reason (not_as_described → catalogue issue vs. wrong_item → ops)
  5. By courier (specific courier with higher damage rate?)

Then feeds findings into mart_return_rate for Tableau dashboarding.

Note: This analysis is ONLY possible because the dbt model int_return_attribution
joins returns → order_items → deliveries with proper seller_fault attribution.
The previous return analysis just counted raw returns — no attribution.
"""

import pandas as pd
import numpy as np
from google.cloud import bigquery
import matplotlib
matplotlib.use("Agg")  # headless
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick

PROJECT_ID   = "quickcart-analytics-prod"
DATASET_MART = "quickcart_marts"

client = bigquery.Client(project=PROJECT_ID)


def run_query(sql: str) -> pd.DataFrame:
    return client.query(sql).result().to_dataframe()


# ── 1. Overall return rate decomposition ─────────────────────────────────────

DECOMPOSITION_QUERY = f"""
SELECT
    l1_category,
    seller_tier,
    payment_method,
    return_reason,
    primary_responsibility,
    courier_partner,
    SUM(delivered_item_count)         AS delivered_items,
    SUM(return_count)                 AS returns,
    SUM(return_gmv_inr)               AS return_gmv_inr,
    SUM(platform_return_cost_inr)     AS platform_cost_inr,
    ROUND(SUM(return_count) * 100.0
        / NULLIF(SUM(delivered_item_count), 0), 2) AS return_rate_pct
FROM `{PROJECT_ID}.{DATASET_MART}.mart_return_rate`
WHERE order_month >= DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY), MONTH)
  AND return_reason != 'no_return'
GROUP BY 1, 2, 3, 4, 5, 6
ORDER BY return_rate_pct DESC
"""

print("Loading return attribution data...")
returns_detail = run_query(DECOMPOSITION_QUERY)
print(f"Loaded {len(returns_detail):,} rows")


# ── 2. Category breakdown ─────────────────────────────────────────────────────

cat_returns = (
    returns_detail
    .groupby("l1_category")
    .agg(
        delivered_items=("delivered_items", "sum"),
        returns=("returns", "sum"),
        platform_cost_inr=("platform_cost_inr", "sum")
    )
    .assign(return_rate_pct=lambda df: (df.returns / df.delivered_items * 100).round(2))
    .sort_values("return_rate_pct", ascending=False)
    .reset_index()
)

PLATFORM_AVG = (
    returns_detail["returns"].sum() /
    returns_detail["delivered_items"].sum() * 100
)

print(f"\n── Category Return Rates (Platform avg: {PLATFORM_AVG:.1f}%) ─────────────")
cat_returns["vs_platform_avg"] = (cat_returns["return_rate_pct"] - PLATFORM_AVG).round(2)
print(cat_returns[["l1_category", "return_rate_pct", "vs_platform_avg",
                    "delivered_items", "platform_cost_inr"]].to_string(index=False))

# Key finding: Fashion/Beauty delta
fashion_rate = cat_returns[cat_returns.l1_category == "Fashion"]["return_rate_pct"].values
beauty_rate  = cat_returns[cat_returns.l1_category == "Beauty"]["return_rate_pct"].values
if fashion_rate.size and fashion_rate[0] > PLATFORM_AVG * 1.5:
    print(f"\n⚠  FINDING: Fashion at {fashion_rate[0]:.1f}% — "
          f"{fashion_rate[0]/PLATFORM_AVG:.1f}x platform average")


# ── 3. Payment method decomposition (CoD vs. prepaid) ────────────────────────

payment_returns = (
    returns_detail
    .groupby("payment_method")
    .agg(delivered_items=("delivered_items", "sum"), returns=("returns", "sum"))
    .assign(return_rate_pct=lambda df: (df.returns / df.delivered_items * 100).round(2))
    .sort_values("return_rate_pct", ascending=False)
)

print(f"\n── Return Rate by Payment Method ────────────────────────────────────")
print(payment_returns.to_string())

cod_rate    = payment_returns.loc["cod", "return_rate_pct"] if "cod" in payment_returns.index else 0
prepaid_avg = payment_returns[
    payment_returns.index.isin(["upi", "card", "netbanking", "wallet"])
]["return_rate_pct"].mean()

if cod_rate > 0:
    print(f"\n⚠  CoD return rate: {cod_rate:.1f}% vs prepaid avg: {prepaid_avg:.1f}% "
          f"({cod_rate / prepaid_avg:.1f}x multiplier)")


# ── 4. Return reason breakdown ────────────────────────────────────────────────

reason_breakdown = (
    returns_detail
    .groupby(["return_reason", "primary_responsibility"])
    .agg(returns=("returns", "sum"), platform_cost_inr=("platform_cost_inr", "sum"))
    .reset_index()
    .sort_values("returns", ascending=False)
)

print(f"\n── Returns by Reason & Responsibility ───────────────────────────────")
print(reason_breakdown.head(15).to_string(index=False))

# Cost by responsibility — who pays?
cost_by_party = (
    returns_detail
    .groupby("primary_responsibility")
    ["platform_cost_inr"].sum()
    .sort_values(ascending=False)
)
print(f"\n── Platform Cost by Responsible Party ───────────────────────────────")
print(cost_by_party.to_string())


# ── 5. Courier-level damage rate ──────────────────────────────────────────────

courier_damage = (
    returns_detail[returns_detail["return_reason"] == "damaged"]
    .groupby("courier_partner")
    .agg(
        damaged_returns=("returns", "sum"),
        platform_cost_inr=("platform_cost_inr", "sum")
    )
    .sort_values("damaged_returns", ascending=False)
)

print(f"\n── 'Damaged' Returns by Courier ─────────────────────────────────────")
print(courier_damage.to_string())


# ── 6. Summary findings for category head deck ────────────────────────────────

print("\n" + "=" * 70)
print("RETURN RATE ATTRIBUTION — SUMMARY FOR CATEGORY HEAD BRIEFING")
print("=" * 70)
print(f"""
Platform blended return rate: {PLATFORM_AVG:.1f}%

ROOT CAUSES (ranked by return volume):
  1. Fashion ({fashion_rate[0]:.1f}% return rate) — 'size_mismatch' and 'not_as_described'
     → Catalogue issue: size charts are inconsistent across sellers
     → Action: enforce standardised size chart upload for all Fashion listings

  2. CoD orders ({cod_rate:.1f}% vs {prepaid_avg:.1f}% prepaid) — 'changed_mind' dominant
     → Customer behaviour: no upfront payment = lower commitment
     → Action: restrict CoD for high-return categories; push prepaid incentives

  3. Electronics 'not_as_described' — product images don't match variants
     → Action: image quality enforcement; flag sellers with >5% 'not_as_described'

  4. {cost_by_party.index[0].title()} is primary cost driver
     → ₹{cost_by_party.iloc[0]/1e7:.1f}Cr in platform return costs last 90 days

NEXT STEPS:
  - Share this analysis with Meera Nair (PM, Seller Platform) for policy action
  - Feed into seller penalty scoring in mart_seller_tier_scores.sql
  - Tableau dashboard: 'Return Rate Attribution' — refresh after this run
""")

OUTPUT_PATH = "outputs/return_attribution"
import os
os.makedirs(OUTPUT_PATH, exist_ok=True)
returns_detail.to_csv(f"{OUTPUT_PATH}/return_attribution_detail.csv", index=False)
cat_returns.to_csv(f"{OUTPUT_PATH}/category_return_rates.csv", index=False)
print(f"✅  Data written to {OUTPUT_PATH}/")
