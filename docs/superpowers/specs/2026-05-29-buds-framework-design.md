# Buds Framework — Design Spec

**Date:** 2026-05-29
**Status:** Draft for review
**Branch:** `claude/brave-mccarthy-Sk3ID`

## Personas

- **Magisha** — PM / designer. Drives changes through Vageesh. Wants to ship product without writing code.
- **Vageesh** — LLM coding agent. Authors PRs on Magisha's behalf. Needs a current, accurate world-model of the codebase.
- **Amit** — engineering manager. Holds merge authority. Trust target for every bot-authored PR. Cares about quality, latency, system fit, and not getting paged at 2am.

## Goals

1. Extend the Mastery Tier journey to cover the full PM-driven-by-AI loop, from hypothesis to post-merge insight.
2. Make every bot-authored PR carry the evidence Amit needs to trust it — by default, without him asking.
3. Auto-route PRs by risk so cheap changes ship cheap and expensive changes get the attention they need.
4. Compound: the system gets cheaper for trusted areas and people over time, without lowering the engineering bar.

## Non-goals

- Replacing engineering review for high-risk or novel-area changes.
- A general-purpose CI replacement. This sits on top of CI, it does not replace it.
- Removing Amit from the loop. Amit's attention is the scarce resource being optimized, not eliminated.

## Architecture: Phases × Capabilities

Four phases, three buds each. The mastery tier the user sees is *the phase mastered*, not the individual bud — a bud is the unit of progress within a phase.

```
 UNDERSTAND        BUILD             EARN TRUST          SHIP & OBSERVE
 (Magisha-owned)   (Magisha-owned)   (Amit signs off)    (Amit-trusted)
 ───────────────────────────────────────────────────────────────────────
 Hypothesis Bud    Design Bud        Test Bud            Stage Bud
 Explorer Bud      Review Bud        Confidence Bud      Ship Bud
 Architect Bud     Code Bud                              Insight Bud
```

The handoff line sits between Build and Earn Trust. Above it, Magisha is in control. Below it, Vageesh has to convince Amit.

---

## Bud Specifications

### UNDERSTAND phase

#### Hypothesis Bud — vibes → falsifiable goal

**Input:** Magisha's natural-language want (*"users seem to drop off in onboarding"*).
**Output:** a **Hypothesis Card** containing:
- The claim (one sentence)
- The measurable signal (which event, which metric)
- Expected magnitude and time window (*"completion rises ≥8% within 2 weeks"*)
- Falsification condition (*"if <3%, hypothesis is dead"*)

Forces shape onto vibes before they become work. Every downstream bud is operating on this card; without it they operate on fog.

#### Explorer Bud — hypothesis → evidence pack

Reads both **code and data warehouse**. Produces a two-pane **Evidence Pack**:
- *"What we already know"* — current metric value, code paths that touch it, recent changes in the area, who shipped them, what reverts happened.
- *"What we'd need to find out"* — open queries (executed inline against the warehouse via the existing `HypothesisTesting` page + SQL notebook), gaps in instrumentation, missing event coverage.

**Adversarial data-cuts suggestion:** Explorer invokes a brainstorming + adversarial-questioning loop (a Grill-Me-style skill) to generate candidate data cuts ranked by their power to confirm or falsify the hypothesis: *"by device class? by signup source? by cohort week? by time-of-day?"* Cuts are bounded by the warehouse's actual event taxonomy — no cuts proposed that the data can't serve.

#### Architect Bud — system oracle, with two faces

This bud is bigger than the others. It has both a per-PR reactive face and a continuous ambient face.

**Reactive face — per-PR:**
- Answers grill questions for a specific proposed change (see Confidence Bud).
- Returns a **Fit Map**: modules involved, invariants at risk, suggested boundary, ADR-conflict flag.
- Estimates prospective blast radius before code is written, so Hypothesis-stage decisions can be re-shaped while cheap.

**Continuous face — ambient:**
- Maintains a **living, interactive system-design view** — moving flowcharts of the architecture, updated automatically as PRs land.
- Vageesh reads this view to keep its world-model current. Every PR is reasoned against the *current* system, not a stale snapshot.
- Magisha and Amit can browse the view any time: *"what does the system look like now vs. last month? which subsystems have churned? where are the new boundaries?"*

The continuous face is the cure for Vageesh's worst failure mode: opening a PR that ignores a module shipped last week.

---

### BUILD phase

Design Bud / Review Bud / Code Bud — existing model. Design produces an approach with tradeoffs; Review applies adversarial critique to the design; Code writes the change. No structural changes proposed here. If the spec process surfaces gaps once the trust-side buds are built, revisit.

---

### EARN TRUST phase

#### Test Bud

Mechanical regression coverage. Cheap, deterministic, runs on every PR.

- Auto-writes regression tests for behaviors the PR claims to change.
- Auto-runs adjacent suites (call-graph-aware: every test depending on changed modules).
- Flake check: touched suites re-run 3× independently; any flake is marked unstable, not silently retried into green.

#### Confidence Bud — the trust artifact

For every PR Vageesh opens, Confidence Bud emits a single **Confidence Card**. The Card is the entirety of what Amit needs to make a merge decision.

##### Card top — risk score + tier badge

A score 0–100 and one of four tier badges (Low / Medium / High / Block). The score is transparent and inspectable; clicking it reveals every input that produced it.

##### Card body — nine panels

| # | Panel | Contents | What Amit gets from it |
|---|---|---|---|
| 1 | **Blast radius** | Files touched, modules affected, downstream consumers (call-graph aware). | Bounds the worry. |
| 2 | **Regression lock** | Each changed behavior → new test pinning it. Each unchanged behavior → existing tests touching that path, all green. | "What you changed vs. what you preserved." |
| 3 | **Coverage delta** | Net coverage change + new uncovered branches. | Catches "happy-path-tested only." |
| 4 | **Flake check** | Touched suites re-run 3×; flaky? Marked. | Bot can't hide flakes. |
| 5 | **Visual diff** (UI only) | Before/after screenshots, side-by-side. | Direction (a)'s "seeing things side by side." |
| 6 | **Adjacent suites** | All tests depending on changed modules, all green. | "Did you break something far away?" |
| 7 | **Performance** | Query plan diffs, new external calls (with caching), p50/p95/p99 deltas on touched endpoints (load-tested in Stage), N+1 detection, bundle size delta, render perf delta, memory allocation delta in hot paths, new background jobs. | Answers the latency question Amit always thinks about. |
| 8 | **Code Quality** | Cyclomatic complexity delta per touched function, type-coverage delta (new `any`/`unknown`), dependency additions (maintainer health, CVE check, license), dead code introduced, **pattern fit** (*"diverges from existing pattern in `src/components/DatabaseConnector.tsx` — was that intentional?"*), test quality score (assertions per test, mock-vs-real ratio, parameterized vs hardcoded). | Catches the lazy/sloppy/duplicative PR that passes tests but rots the codebase. |
| 9 | **Grill Transcript** | The full internal adversarial Q&A Vageesh ran before opening the PR. Architect Bud answered every question with codebase citations. Skim mode shows bottom-line answers; expand to read the full exchange. | The questions Amit would ask, already answered. |

##### Grill-Me mechanics (panel 9 in detail)

Before opening the PR, Vageesh runs an internal pre-flight against the **grill bank**:
- **Canonical questions** (always asked): Does this change auth? DB schema? Public API? Error handling? Rollback path? N+1 / sync calls / unbounded external requests? Index/cache/rate-limiter bypasses? Latency regressions? Existing-pattern adherence?
- **Codebase-specific questions** (derived from project state — e.g., *"this app uses Lovable's SQL notebook pattern; does this PR honor it?"*).
- **Amit-specific questions** — every novel question Amit has ever raised in a past PR comment is captured and added to the bank. After N PRs the bot is asking the questions Amit actually asks, not generic ones.

Each question is answered by Architect Bud (since it owns the system model). Citations to specific files, ADRs, or past PRs accompany every answer.

##### Risk score formula

```
risk = w₁  · files_in_critical_paths
     + w₂  · distance_to_known_invariants
     + w₃  · uncovered_changed_lines
     + w₄  · flaky_suite_count
     + w₅  · past_revert_rate_for_area
     + w₆  · first_time_in_module_bonus
     + w₇  · p99_delta_on_hot_paths
     + w₈  · query_plan_regression
     + w₉  · pattern_deviation_score
     + w₁₀ · complexity_delta
     + w₁₁ · dependency_risk_score
     + w₁₂ · grill_unanswered_or_low_confidence
```

All inputs are inspectable in the Card. All weights are Amit-tunable per repo. `past_revert_rate_for_area` and `first_time_in_module_bonus` decay over time as Vageesh accumulates a track record.

##### Routing tiers

| Tier | Range | Behavior |
|---|---|---|
| **Low** | 0–30 | Auto-merge on green Card. Daily digest to Amit, no per-PR ping. |
| **Medium** | 31–60 | Card pings Amit. Glance target <30s. Approves or escalates. |
| **High** | 61–85 | Full review. Vageesh treated as a junior contributor. |
| **Block** | >85 | PR is not opened. Escalated back to Magisha: *"this needs human design before I attempt code."* Prevents review-of-the-doomed. |

Thresholds are Amit-tunable.

---

### SHIP & OBSERVE phase

#### Stage Bud — preview env + side-by-side

When the Confidence Card passes thresholds, Stage spins up a real preview environment.

- Shareable preview URL (Magisha and Amit can poke it).
- **Side-by-side view**: prod vs. preview, same actions replayed, recorded video walkthroughs of the changed flows.
- For SQL / data changes: shadow-runs queries against prod data without writes.
- For UI: visual snapshot + Playwright-recorded interaction comparison.

The Stage URL is part of the Confidence Card. Amit's <30s glance can include a live poke of the change.

#### Ship Bud — merge + progressive rollout

Owns the rollout shape, not just the merge button.

| Tier | Rollout |
|---|---|
| Low | Merge + 100% rollout |
| Medium | Feature flag, % rollout, automatic guardrail metrics wired live |
| High | Same as Medium + automatic rollback if a guardrail breaches threshold within N hours |

Output is a **Ship Plan** (rollout shape, guardrail metric list, rollback trigger). The Plan is *part of* the Confidence Card. Amit is not approving "the code is correct" — he is approving "the code is correct *and* if it is wrong we will catch it within X hours and undo it cleanly."

#### Insight Bud — did the hypothesis actually pan out?

Watches the **falsification condition** set by Hypothesis Bud on day one. Post-rollout, emits a **Hypothesis Verdict**: *confirmed / inconclusive / falsified*, with the data backing it.

Every change the system shipped points back to the hypothesis that justified it. Audit-friendly.

**Compounding side effect:** verdicts become priors. The system learns which kinds of hypotheses Magisha tends to be right about. That feeds back into future risk scores — a PM with a track record of confirmed hypotheses earns lower `novelty_penalty` weighting on future PRs. The flywheel is real.

---

## Loop closure

```
Insight Verdict
    → updates priors
    → primes next Hypothesis Bud
    → Explorer Bud pulls past verdicts as evidence
    → Architect Bud's continuous view reflects shipped changes
    → Design Bud starts smarter
    → Code Bud has a current world-model from Architect
    → Grill bank includes Amit's latest questions
    → Confidence Card is sharper
    → Stage Bud previews against current architecture
    → Ship Bud rolls out
    → Insight Verdict closes again
```

Each cycle should reduce the cost of the next equivalent change in the same area.

---

## Mastery semantics

Per-bud, data-driven.

A bud is **Mastered** when its outputs consistently lead to **low-risk-score** downstream PRs (or, for buds that themselves emit PRs, when its PRs ship at the desired risk tier without human intervention for N consecutive runs in that area).

Mastery is *per-area*, not global. Vageesh can be "Mastered" at Test Bud for the onboarding subsystem while still "Locked" for billing — because billing PRs keep coming back with elevated risk scores.

---

## Open questions (to resolve in implementation planning)

1. **Mastery threshold N** — how many consecutive low-risk PRs in an area count as "Mastered"? Strawman: N=10, area-scoped.
2. **Default risk weights** — ship opinionated defaults or start all-equal and let Amit tune?
3. **Grill bank pruning** — questions from old/retired subsystems should age out. What's the decay function?
4. **Magisha override path** — can a PM override Vageesh's risk score in a real emergency? If yes, the override should itself be a trust event Amit sees.
5. **ADR mutation** — should an Insight Bud verdict that falsifies a hypothesis update the relevant Architectural Decision Record automatically, or just flag it for human update?
6. **Continuous Architect view tech** — moving flowcharts of evolving architecture is a real UI design problem. Mermaid/D2/custom canvas? Decide during plan, not now.
7. **Grill-Me skill** — is there a specific external skill the user has in mind (the *"grill me"* name they mentioned)? If yes, integrate it; if no, the adversarial loop is built on `brainstorming` + `systematic-debugging` from the vendored superpowers set.

---

## Implementation order (proposed)

The framework is large; ship in trust-line order, smallest-first:

1. **Confidence Card v0** — panels 1–6 (Blast radius, Regression lock, Coverage delta, Flake check, Visual diff, Adjacent suites). Manual review tier only — no auto-merge yet. Gets the artifact in front of Amit.
2. **Confidence Card v1** — add Performance and Code Quality panels (7, 8). Risk score live but routing still manual.
3. **Grill-Me v0** — panel 9 with canonical + codebase questions only. No Amit-learning yet.
4. **Risk-tiered routing** — Low/Medium/High/Block thresholds go live. Amit gains auto-merge tier.
5. **Architect Bud reactive face** — formalize the grill-answering oracle.
6. **Grill-Me v1** — Amit-question capture and learning.
7. **Stage Bud + Ship Bud** — preview environments + progressive rollout.
8. **Hypothesis Bud + Insight Bud** — falsification loop closes.
9. **Explorer Bud** — adversarial data-cut suggestions, warehouse integration.
10. **Architect Bud continuous face** — the moving-flowchart system-design view. The biggest piece; ship last when the rest of the loop is paying for it.

Each step lands a usable product on its own.
