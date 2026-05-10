# Options Trading Platform — Schema Documentation

## Table: users

Stores one row per registered user.

| Column | Type | Description |
|---|---|---|
| user_id | VARCHAR | Primary key |
| age | INT | User age in years |
| city | VARCHAR | City of residence |
| city_tier | INT | 1 = metro, 2 = mid-size, 3 = small town |
| risk_category | VARCHAR | LOW / MEDIUM / HIGH — set during onboarding |
| kyc_date | DATE | Date KYC was completed |
| registration_date | DATE | Date account was created |
| platform | VARCHAR | Primary platform: APP or WEB |
| is_active | BOOLEAN | Whether account is currently active |

---

## Table: options_trades

One row per options trade (open or closed).

| Column | Type | Description |
|---|---|---|
| trade_id | VARCHAR | Primary key |
| user_id | VARCHAR | Foreign key → users |
| symbol | VARCHAR | Underlying stock/index (e.g., NIFTY, BANKNIFTY, RELIANCE) |
| strike_price | DECIMAL | Strike price of the contract |
| expiry_date | DATE | Contract expiry date |
| option_type | VARCHAR | CALL or PUT |
| position_type | VARCHAR | BUY or SELL |
| strategy | VARCHAR | NAKED / SPREAD / COVERED / STRADDLE / STRANGLE / IRON_CONDOR |
| premium_paid | DECIMAL | Premium per unit at entry (INR) |
| lot_size | INT | Number of lots traded |
| total_premium | DECIMAL | premium_paid × lot_size × contract_size |
| trade_date | DATETIME | When trade was opened |
| close_date | DATETIME | When trade was closed (NULL if still open) |
| realized_pnl | DECIMAL | Actual P&L on close (NULL if open). Negative = loss. |
| pnl_pct | DECIMAL | realized_pnl / total_premium × 100 |
| days_to_expiry | INT | DTE at trade entry |
| is_first_trade | BOOLEAN | TRUE if this is the user's first ever options trade |
| is_first_loss | BOOLEAN | TRUE if this is the user's first closed trade with negative P&L |

---

## Table: user_sessions

One row per app/web session.

| Column | Type | Description |
|---|---|---|
| session_id | VARCHAR | Primary key |
| user_id | VARCHAR | Foreign key → users |
| session_date | DATE | Date of session |
| session_start | DATETIME | Session start timestamp |
| session_end | DATETIME | Session end timestamp |
| platform | VARCHAR | APP or WEB |
| duration_mins | INT | Session length in minutes |
| screens_visited | INT | Number of distinct screens visited |

---

## Table: feature_usage

One row per feature interaction per user per day.

| Column | Type | Description |
|---|---|---|
| usage_id | VARCHAR | Primary key |
| user_id | VARCHAR | Foreign key → users |
| feature_name | VARCHAR | Name of feature used (see below) |
| used_at | DATETIME | Timestamp of usage |

Feature names include:
- `GREEKS_VIEWER` — viewed Delta/Gamma/Theta/Vega on a position
- `PAYOFF_CHART` — viewed P&L payoff diagram
- `PAPER_TRADING` — used paper trading simulator
- `RISK_CALCULATOR` — used margin/risk calculator
- `OPTION_CHAIN` — browsed option chain
- `STRATEGY_BUILDER` — used multi-leg strategy builder

---

## Table: interventions

One row per intervention sent to a user (used for A/B experiment tracking).

| Column | Type | Description |
|---|---|---|
| intervention_id | VARCHAR | Primary key |
| user_id | VARCHAR | Foreign key → users |
| cohort_week | DATE | Monday of the experiment week |
| intervention_type | VARCHAR | Notification timing variant |
| message_framing | VARCHAR | Message copy variant |
| feature_suggested | VARCHAR | Feature shown in the message |
| cooling_off_shown | BOOLEAN | Whether cooling-off prompt was shown |
| sent_at | DATETIME | When intervention was sent |
| opened_at | DATETIME | When user opened the notification (NULL if not opened) |
| next_trade_date | DATE | Date of next trade after intervention (NULL if none in 30 days) |
| day30_retained | BOOLEAN | TRUE if user placed any trade within 30 days of first loss |

---

## Table: watchlist

One row per symbol added to a user's watchlist.

| Column | Type | Description |
|---|---|---|
| watchlist_id | VARCHAR | Primary key |
| user_id | VARCHAR | Foreign key → users |
| symbol | VARCHAR | Symbol added |
| added_date | DATE | When added |
| removed_date | DATE | When removed (NULL if still on watchlist) |

---

## Table: alerts

One row per price/event alert set by a user.

| Column | Type | Description |
|---|---|---|
| alert_id | VARCHAR | Primary key |
| user_id | VARCHAR | Foreign key → users |
| symbol | VARCHAR | Symbol the alert is on |
| alert_type | VARCHAR | PRICE_TARGET / IV_SPIKE / EXPIRY_REMINDER |
| set_at | DATETIME | When alert was created |
| triggered_at | DATETIME | When alert fired (NULL if not yet triggered) |
| trade_placed_after | BOOLEAN | Whether a trade was placed within 1h of alert triggering |

---

## Key Relationships

```
users ──< options_trades
users ──< user_sessions
users ──< feature_usage
users ──< interventions
users ──< watchlist
users ──< alerts
```

## Notes for SQL Generation

- Use `is_first_loss = TRUE` to identify the cohort of users with their first losing trade
- Day-30 retention = `day30_retained = TRUE` in the interventions table OR calculated from options_trades
- "Active" in a period = has at least one session OR one trade in that period
- Loss magnitude buckets: `pnl_pct < -20` (small), `-20 to -50` (medium), `< -50` (large)
- Always filter closed trades with: `close_date IS NOT NULL`
