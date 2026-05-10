# program.md — Options Trader Autoresearch Brief

## North Star Metric

**Day-30 Retention Rate after First Losing Trade**

Definition: % of users who place at least one more trade within 30 days of their first trade that closed with a negative realized P&L.

Baseline to beat: measure this on last 6 months of cohorts before any intervention.

---

## Why This Metric

A user's first loss is the single highest-churn moment in the options trading lifecycle.
Users who survive it and trade again are 4–6x more likely to become long-term active traders.
Every other metric (brokerage, DAU, feature adoption) improves downstream once this is solved.

---

## Fixed Experiment Window

- **Cohort definition**: Users whose first losing trade closed in the current calendar week
- **Intervention window**: Within 24 hours of the losing trade closing
- **Measurement window**: 30 days from the date of first loss
- **Minimum cohort size**: 200 users per experiment arm (halt if cohort is smaller)
- **No exceptions**: Do not extend measurement window. Day 30 is Day 30.

---

## Hypothesis Space (What Can Change)

Interventions are limited to:

| Category | Allowed Variants |
|---|---|
| Notification timing | Immediate (within 1h), Next morning (9am), Next session login |
| Message framing | Loss normalization ("83% of traders lose on their first trade"), Educational ("Here's what happened to your position"), Motivational ("Your edge builds with every trade"), Silent (control — no message) |
| Feature suggestion shown | Greeks explainer, Payoff chart, Paper trading mode, Risk calculator |
| Friction on next trade | None (control), Optional cooling-off prompt ("It's been 2 hours since your loss — continue?") |

**What cannot change**: Brokerage fees, margin rules, trade execution, compliance overlays.

---

## Research Loop (runs autonomously)

```
Week N:
  1. Pull cohort → users with first losing trade this week
  2. Assign intervention variant (rotate through hypothesis space)
  3. Log: user_id, loss_amount, loss_%, intervention_type, sent_at
  4. At Day 30: measure retention for each arm
  5. Record winning variant → carry forward into next week's default
  6. Losing variants → retired or modified
  7. Generate next hypothesis based on what worked
```

---

## Secondary Signals to Track (do not optimise for these directly)

These are diagnostic — they explain *why* the north star moved, not what to chase:

- Time-to-next-trade (days) — leading indicator of Day-30 retention
- Feature usage in the 7 days post-loss (are they learning or leaving?)
- Second trade P&L — did they revenge-trade or make a considered decision?
- App opens in 72h post-loss — passive engagement signal
- Support ticket raised post-loss — indicates frustration level

---

## Segment Cuts for Each Experiment Result

Always slice retention results by:

- Loss magnitude: <20% | 20–50% | >50% of premium lost
- Loss type: naked call/put vs. spread vs. covered
- User tenure: first week | first month | >1 month
- City tier: Tier 1 | Tier 2 | Tier 3
- Platform: app | web

A variant that works for >50% loss users may not work for <20% loss users. Segment before generalising.

---

## Definition of "Experiment Complete"

An experiment is complete when:
- Day-30 window has closed for the full cohort
- Retention rate calculated for each arm
- Winning arm is statistically significant (p < 0.05) OR cohort is exhausted
- Result logged: variant | cohort_size | retention_rate | p_value | next_action

---

## Questions This Research Loop Must Be Able to Answer (NL→SQL)

The SQL knowledge graph must be trained to answer all questions in `options_trader_training_data.csv`.
Schema reference is in `options_schema_documentation.md`.
