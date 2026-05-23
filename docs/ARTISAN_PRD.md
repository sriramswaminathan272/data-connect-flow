# Artisan — Product Requirements Document

**Version:** 0.3
**Branch:** `claude/artisan-onboarding-surface-3T4Dd`
**Status:** In Progress
**Last Updated:** 2026-05-23

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Personas](#2-personas)
3. [Three-Stage Onboarding](#3-three-stage-onboarding)
4. [Day-in-Life Journeys](#4-day-in-life-journeys)
5. [Field-to-Matrix](#5-field-to-matrix)
6. [Behavioral Design Layer](#6-behavioral-design-layer)
7. [Stage 3 Hero Card Design](#7-stage-3-hero-card-design)
8. [Artisan as Trained Subordinate — Vagisha Trust-Building Bot](#8-artisan-as-trained-subordinate--vagisha-trust-building-bot)
9. [Data Schema](#9-data-schema)
10. [Integration Layer](#10-integration-layer)
11. [Open-Source Integration Map](#11-open-source-integration-map)
12. [Success Metrics](#12-success-metrics)

---

## 1. Product Vision

Artisan is an AI work surface that learns your tools, infers your role, and surfaces the right action before you know you need it. It is not a chat interface or a command-line tool — it is a daily work surface that sits between a knowledge worker and their tool stack.

### Core Positioning

| What Artisan Is | What Artisan Is Not |
|---|---|
| A daily work surface | A chat interface |
| A role-aware intelligence layer | A command-line tool |
| A proactive action surface | A passive assistant |
| A tool-stack bridge | A standalone app |

### YC Narrative Frame: The "First 8 Minutes" Problem

Most AI tools take too long to deliver first value. A user signs up, completes a lengthy onboarding, and still cannot point to a single concrete output that saved them time. Artisan must deliver a **specific, personalised, useful output within the onboarding session itself** — within the first 8 minutes of a user's experience.

The first 8 minutes are not setup time. They are the product.

**The promise:** By the time a user finishes connecting their first two tools and answers five contextual questions, Artisan surfaces one card that is immediately, demonstrably useful for that specific person on that specific day.

### Design Principles

- **Inference over configuration** — Artisan infers role and context from tool signals; it does not ask users to fill in profiles.
- **Proactive over reactive** — Artisan initiates at the right moment; it does not wait to be queried.
- **Evidence over assertion** — every piece of intelligence shown carries a trust marker indicating its source.
- **Ritual over feature** — the goal is to become a daily habit, not a feature used occasionally.

---

## 2. Personas

Artisan is designed around five primary knowledge worker personas. Each persona is defined by their tool stack, their primary pain, and the emotional hook that makes Artisan compelling to them.

### 2.1 PM — Meera

| Attribute | Detail |
|---|---|
| **Name** | Meera |
| **Role** | Product Manager |
| **Primary Tool Stack** | Jira, Confluence, Slack, Google Meet, Notion |
| **Primary Pain** | Constant context-switching between sprint tracking, stakeholder updates, and async decisions. Meetings consume the day; strategic thinking happens at 9pm. |
| **Primary Emotional Hook** | "Finally, something that reads across all my tools and tells me what actually needs my attention today." |
| **Defining Moment** | Walking into a sprint planning meeting and already knowing which tickets are blocked, why, and who is the blocker — without opening Jira. |

### 2.2 Analyst — Arjun

| Attribute | Detail |
|---|---|
| **Name** | Arjun |
| **Role** | Business / Data Analyst |
| **Primary Tool Stack** | Google Sheets, Looker / Metabase, Slack, SQL, Notion |
| **Primary Pain** | Repetitive data pulls for ad-hoc requests that interrupt deep analysis work. The same five stakeholders ask for the same five numbers in slightly different formats. |
| **Primary Emotional Hook** | "I want to do real analysis, not be a human CSV exporter." |
| **Defining Moment** | A stakeholder asks for last week's numbers in Slack; Artisan has already drafted the reply with the current figures attached. |

### 2.3 Marketing Manager — Vikram

| Attribute | Detail |
|---|---|
| **Name** | Vikram |
| **Role** | Marketing Manager |
| **Primary Tool Stack** | HubSpot, Google Analytics, Canva, Slack, Notion, Mailchimp |
| **Primary Pain** | Campaign performance is scattered across five platforms. Attributing what worked requires manual aggregation every Monday morning. |
| **Primary Emotional Hook** | "Tell me what to double down on before I waste budget on another week of the wrong channel." |
| **Defining Moment** | Monday morning brief is already waiting — campaign delta, best-performing asset, recommended next action — before the weekly sync call. |

### 2.4 Designer — Hemant / Vagisha

| Attribute | Detail |
|---|---|
| **Names** | Hemant (IC Designer), Vagisha (Senior / Lead Designer) |
| **Role** | Product Designer |
| **Primary Tool Stack** | Figma, Notion, Slack, Loom, Linear |
| **Primary Pain** | Design review cycles are slow. Feedback is scattered across Figma comments, Slack threads, and Loom recordings. Decisions are hard to trace. |
| **Primary Emotional Hook** | "I want every reviewer to show up prepared. I'm tired of re-explaining context that's already in the file." |
| **Defining Moment** | Before a design crit, every invited reviewer has already seen the brief, the constraints, and the three questions that need decisions — surfaced by Artisan automatically. |

### 2.5 Sales — Shubham

| Attribute | Detail |
|---|---|
| **Name** | Shubham |
| **Role** | Account Executive / Sales |
| **Primary Tool Stack** | Salesforce / HubSpot CRM, Gmail, Google Calendar, Gong / Chorus, LinkedIn |
| **Primary Pain** | Prep time for discovery and demo calls is high. CRM hygiene is a constant guilt. Post-call follow-up degrades under pressure. |
| **Primary Emotional Hook** | "Walk me into every call knowing what the prospect cares about, what we said last time, and what the next step should be." |
| **Defining Moment** | 5 minutes before a demo call, a brief card surfaces with company context, last interaction summary, and a suggested opening line tailored to recent news. |

---

## 3. Three-Stage Onboarding

Onboarding is not setup — it is the first proof-of-value delivery. All three stages must be completable in under 8 minutes.

### Stage 1 — Connect

**Purpose:** Establish the data foundation. Give Artisan read access to the tools the user already uses.

**What it collects:**
- OAuth connections to integrated tools (Jira, Notion, Slack, Google Workspace, HubSpot, Figma, Linear, etc.)
- Metadata-only read: calendar events, ticket statuses, document titles, message threads (not full content unless explicitly granted)
- Tool presence signal — which tools exist in the stack, which are used heavily vs. lightly

**What it produces:**
- A ranked tool-stack map showing Artisan's coverage of the user's workflow
- An initial role inference (e.g., "Based on your tools, you appear to be a PM or engineering lead")
- A readiness score indicating how much personalisation is possible with current connections

**UX Notes:**
- Maximum 2 clicks per tool connection
- Show a live "coverage bar" that grows as tools are connected — immediate visual reward
- At least one tool connection must be completable in under 60 seconds

### Stage 2 — Interview

**Purpose:** Validate and refine the role inference. Collect context that cannot be inferred from tools alone.

**What it collects:**
- Role confirmation or correction (select from inferred options or free-text)
- Current top 3 priorities (free-text, max 2 sentences each)
- Recurring pain: "What is the one thing you do every week that you wish you didn't have to?"
- Collaboration pattern: primarily async or meeting-heavy?
- Pre-fill from connected tools where possible (e.g., calendar density infers meeting-heavy)

**What it produces:**
- A persona-matched profile with confidence levels
- Pre-populated context for Stage 3 hero card generation
- A personalisation readiness assessment: "Artisan can begin briefing you on [X, Y, Z]"

**UX Notes:**
- Maximum 5 questions
- Every question that can be pre-answered from tool data must be pre-answered and presented for confirmation, not asked from scratch
- Questions are conversational, not form-fields

### Stage 3 — Personalization

**Purpose:** Deliver the first concrete, personalised output. The "wow moment."

**What it collects:**
- User confirmation of the hero card relevance ("Is this useful? Yes / Tweak it / Not relevant")
- Feedback signal on the first output — this becomes the first training data point for the user's model

**What it produces:**
- One persona-specific hero card with real data from connected tools
- A suggested first daily ritual (e.g., "Check your Morning Read at 7:45am")
- An explanation of how the card was generated (trust markers, data sources)

**UX Notes:**
- The hero card must contain at least one data point that is specific to today and specific to this user
- The card must be immediately actionable — it contains a primary CTA
- The "how was this made?" explanation is available but not forced

---

## 4. Day-in-Life Journeys

For each persona, the journey describes the current reality ("Today's Grind"), the Artisan unlock, and the future state ("Tomorrow's Superpower"). The frame is the **full-stack builder transformation**: Artisan does not add a tool to the stack — it upgrades the entire stack simultaneously.

### 4.1 PM — Meera

**Today's Grind**

| Time | Activity |
|---|---|
| 8:00am | Opens Jira to check sprint status before standup |
| 8:20am | Checks Slack for overnight messages; finds three threads needing responses |
| 8:45am | Standup — discovers two blockers that weren't in Jira |
| 9:30am | Confluence document for stakeholder update needs to be written from scratch |
| 2:00pm | Back-to-back planning meetings with no prep time between |
| 5:30pm | Finally begins the actual strategic work that was planned for 10am |

**The Artisan Unlock**

Artisan reads across Jira, Slack, and Confluence overnight. At 7:45am, Meera's Morning Read is waiting: two blockers identified from Slack threads that haven't been filed as tickets, a draft stakeholder update pre-generated from sprint velocity data, and a 5-minute pre-meeting brief for today's planning session.

**Tomorrow's Superpower**

Meera walks into standup having already resolved one blocker via an async Slack nudge Artisan drafted. The stakeholder update writes itself. Strategic thinking time moves from 5:30pm to 2:00pm.

### 4.2 Analyst — Arjun

**Today's Grind**

| Time | Activity |
|---|---|
| 9:00am | Five ad-hoc data requests waiting in Slack from overnight |
| 9:45am | Pulls the same weekly metrics for the third time this month |
| 11:00am | Deep analysis work begins — interrupted at 11:20am by an urgent Slack message |
| 12:00pm | Lunch eaten at desk while completing a "quick" data pull |
| 3:00pm | Realizes the dashboard is showing stale data; spends 45 minutes debugging |
| 5:00pm | The analysis that was the actual goal of the day remains unfinished |

**The Artisan Unlock**

Artisan detects recurring query patterns and pre-caches the five most-requested metrics. When a stakeholder pings for last week's numbers, Artisan surfaces a draft reply with the current figures. The "urgent" interrupt at 11:20am becomes a 30-second confirmation instead of a 40-minute task.

**Tomorrow's Superpower**

Arjun's deep analysis work is protected. Ad-hoc requests are handled by Artisan-drafted responses. Dashboard staleness is flagged before Arjun opens it.

### 4.3 Marketing Manager — Vikram

**Today's Grind**

| Time | Activity |
|---|---|
| 8:30am | Monday morning: manually pulls performance data from GA, HubSpot, Mailchimp |
| 9:30am | Builds a slide with last week's numbers for the weekly sync |
| 10:00am | Weekly sync — team debates which channel is working with no shared data |
| 2:00pm | Campaign brief writing begins from scratch |
| 4:00pm | Realizes the email campaign had a tracking link issue; can't measure correctly |
| 5:00pm | Budget allocation decision needed by tomorrow; no clean attribution data |

**The Artisan Unlock**

By Sunday night, Artisan has aggregated campaign performance across all channels. Monday morning brief is waiting with last week's delta, best-performing asset, anomaly flag (the tracking link issue), and a recommended budget reallocation for the week.

**Tomorrow's Superpower**

Vikram walks into the Monday sync with a shared brief that the whole team has already seen. Decisions are made in 20 minutes instead of 60. Budget moves faster.

### 4.4 Designer — Hemant / Vagisha

**Today's Grind**

| Time | Activity |
|---|---|
| 9:00am | Design crit at 10am; sends Figma link to Slack at 9:50am |
| 10:00am | Half the reviewers haven't opened the file; 20 minutes re-explaining context |
| 11:00am | Feedback is collected in Figma comments, Slack thread, and one Loom video |
| 2:00pm | Tries to write up design decisions; can't find where specific feedback came from |
| 3:30pm | Developer asks about a design decision that was discussed in a Loom nobody saved |
| 5:00pm | Decision log is incomplete; the rationale for three choices is lost |

**The Artisan Unlock**

Before the design crit, Artisan sends each reviewer a brief card with the Figma link, the three decisions that need input, and the constraints. During the crit, the Recording Bot captures decisions and attributions. Afterward, the ReviewTrace is auto-populated with every decision, its source, and the reviewer who made it.

**Tomorrow's Superpower**

Every design decision is traceable. Developers get answers in seconds. Design reviews become shorter because reviewers arrive prepared.

### 4.5 Sales — Shubham

**Today's Grind**

| Time | Activity |
|---|---|
| 8:00am | Three calls today; needs prep for each — opens Salesforce, Gmail, LinkedIn |
| 8:30am | Prep for 9am call takes 25 minutes; still feels underprepared |
| 9:00am | Discovery call — scrambling to find previous call notes mid-conversation |
| 11:00am | Post-call: CRM update takes 15 minutes; follow-up email takes another 10 |
| 2:00pm | Demo call — prospect asks about a use case that wasn't in the prep notes |
| 5:00pm | End of day: CRM is 2 calls behind; follow-ups are queued for tomorrow |

**The Artisan Unlock**

At T-5 minutes before each call, Artisan surfaces a brief card: company context, last interaction summary, open questions from the previous call, and a suggested opening line based on recent news. Post-call, Artisan drafts the CRM update and follow-up email from the call transcript.

**Tomorrow's Superpower**

Shubham enters every call prepared. CRM hygiene is automatic. Follow-ups go out the same day. Prep time drops from 25 minutes to 5 minutes per call.

---

## 5. Field-to-Matrix

The Field-to-Matrix maps the key moments in each persona's day across eight dimensions: Time, Field Reality, Cognitive Load, Emotional State, Artisan Intervention, Emotional Resolution, Habit Hook, and Data Signal.

### 5.1 PM — Meera

| Time | Field Reality | Cognitive Load | Emotional State | Artisan Intervention | Emotional Resolution | Habit Hook | Data Signal |
|---|---|---|---|---|---|---|---|
| 7:45am | Opens phone before coffee | High — scanning 3 apps | Anxious / reactive | Morning Read card in Artisan | Relief — single surface | "Check Artisan first" | Morning open time, first-action app |
| 8:45am | Standup — blockers surface | High — real-time synthesis | Frustrated / unprepared | Pre-standup brief with blocker flag | Confident / prepared | Brief becomes pre-standup ritual | Blocker detection lead time |
| 12:00pm | Stakeholder update due | Very high — writing from scratch | Pressured / behind | Draft update pre-generated | Accomplished in 10 minutes | Update review becomes ritual | Doc generation acceptance rate |
| 2:00pm | Back-to-back meetings | High — no transition time | Depleted / scattered | Pre-meeting brief at T-5 | Grounded / contextual | Brief = meeting prep habit | Brief open rate, meeting prep time delta |
| 5:15pm | End of day — what moved? | Medium | Uncertain / unresolved | EOD Close card — what moved today | Closed / resolved | EOD check becomes shutdown ritual | EOD engagement rate |

### 5.2 Analyst — Arjun

| Time | Field Reality | Cognitive Load | Emotional State | Artisan Intervention | Emotional Resolution | Habit Hook | Data Signal |
|---|---|---|---|---|---|---|---|
| 9:00am | 5 ad-hoc requests in Slack | High — context-switching | Overwhelmed / defensive | Artisan drafts 3 of 5 responses | Relief — protected time | Draft review replaces manual pulls | Response draft acceptance rate |
| 11:00am | Deep analysis interrupted | Very high — broken flow | Resentful / distracted | Artisan handles "urgent" reply | Flow protected | Interrupt shield becomes trusted | Interrupt handling rate |
| 3:00pm | Dashboard showing stale data | High — debugging | Frustrated / wasted time | Staleness flag before manual discovery | Proactive / in control | Anomaly alerts replace manual checks | Anomaly detection accuracy |
| 5:00pm | Core analysis unfinished | High — guilt / backlog | Defeated | EOD Close shows actual vs. planned | Calibrated / reset | EOD review becomes planning tool | Plan completion delta |

### 5.3 Marketing Manager — Vikram

| Time | Field Reality | Cognitive Load | Emotional State | Artisan Intervention | Emotional Resolution | Habit Hook | Data Signal |
|---|---|---|---|---|---|---|---|
| 8:30am Monday | Manual aggregation from 4 platforms | Very high | Tedious / mechanical | Weekly brief pre-built | Energized / strategic | Monday brief replaces manual pull | Brief generation time vs. manual |
| 10:00am | Weekly sync with no shared baseline | High — debating without data | Frustrated | Shared brief everyone has seen | Aligned / decisive | Sync prep becomes shared ritual | Sync duration delta |
| 4:00pm | Tracking issue discovered | High — damage control | Anxious | Artisan flags anomaly + impact estimate | Contained / informed | Anomaly alerts become trusted | Anomaly flag lead time |
| 5:00pm | Budget decision with bad attribution | Very high | Uncertain / risky | Attribution-best-available summary | Decisive despite uncertainty | Attribution summary replaces instinct | Attribution confidence score |

### 5.4 Designer — Hemant / Vagisha

| Time | Field Reality | Cognitive Load | Emotional State | Artisan Intervention | Emotional Resolution | Habit Hook | Data Signal |
|---|---|---|---|---|---|---|---|
| 9:50am | Sends Figma link 10 minutes before crit | High — last-minute prep | Stressed / rushed | Pre-crit brief sent to reviewers | Confident / prepared | Brief becomes crit-prep ritual | Reviewer brief open rate |
| 10:00am | Re-explaining context to unprepared reviewers | Very high | Frustrated / repetitive | Brief pre-answered the context | Efficient / respected | Review time drops | Crit time delta |
| Post-meeting | Feedback scattered across platforms | High — aggregation | Overwhelmed | ReviewTrace auto-populated | Organized / traceable | Trace review becomes habit | Decision capture completeness |
| 3:30pm | Developer asks about lost Loom decision | High — archaeology | Anxious / uncertain | ReviewTrace serves the answer instantly | Reliable / authoritative | Artisan = source of truth | Decision retrieval time |

### 5.5 Sales — Shubham

| Time | Field Reality | Cognitive Load | Emotional State | Artisan Intervention | Emotional Resolution | Habit Hook | Data Signal |
|---|---|---|---|---|---|---|---|
| 8:00am | Prep for 3 calls across 4 tools | Very high | Anxious / scattered | Call briefs waiting for all 3 | Calm / prepared | Brief review replaces manual prep | Prep time delta per call |
| T-5min | Last-minute scan for context | High | Nervous / underprepared | T-5 card with opening line | Confident / sharp | T-5 card becomes pre-call ritual | T-5 card open rate |
| Post-call | CRM update + follow-up email | High | Drained / reluctant | CRM draft + email draft from transcript | Efficient / complete | Draft review replaces manual entry | CRM update time delta |
| 5:00pm | 2 calls behind on CRM | Medium | Guilty / behind | EOD Close — CRM health card | Clean / resolved | EOD CRM check becomes closure ritual | CRM lag time delta |

---

## 6. Behavioral Design Layer

Artisan is designed to become a habit, not just a feature. The behavioral layer applies the Hooked model (Nir Eyal) to create internal triggers, investment loops, and variable rewards that make Artisan part of the user's daily rhythm.

### 6.1 The Hooked Model Applied

| Hook Stage | Artisan Implementation |
|---|---|
| **Trigger (External)** | Push notification / calendar block for Morning Read; pre-meeting notification at T-5 |
| **Trigger (Internal)** | "I need to know what's happening" → Artisan becomes the reflex, not Slack |
| **Action** | Open Artisan; glance at Morning Read; check pre-meeting brief |
| **Variable Reward** | Sometimes the card has a critical flag. Sometimes it reveals a pattern. Sometimes it has already resolved something. |
| **Investment** | Every confirmation ("This was useful") and correction ("Not relevant") trains the model; the product gets smarter the more you use it |

### 6.2 The Four Rituals

Artisan is built around four named rituals. Each has a specific time window, a named card type, and a designed emotional payoff.

#### Morning Read — 7:45am

- **Trigger:** Push notification; also surfaces on first Artisan open
- **Content:** What moved overnight, flagged items that need attention today, one proactive action suggestion
- **Emotional Design:** Replace morning anxiety (scanning 3 apps) with morning clarity (one surface)
- **Variable Reward Element:** Occasionally surfaces an insight that isn't urgent but is strategically interesting — "did you know your top Jira contributor hasn't commented in 5 days?"

#### Pre-Meeting Brief — T-5 minutes

- **Trigger:** Calendar integration fires notification 5 minutes before any meeting with >1 attendee
- **Content:** Meeting context, attendee history, open items from previous related meetings, one suggested opening move
- **Emotional Design:** Replace "I should have prepped for this" with "I already know what I need to know"
- **Variable Reward Element:** Occasionally includes a piece of information about an attendee or topic that is unexpectedly relevant

#### Capture — Post-Meeting

- **Trigger:** Calendar event end + automatic recording/transcript availability
- **Content:** Draft decisions log, action items with suggested owners, follow-up message drafts
- **Emotional Design:** Replace post-meeting admin guilt with instant closure
- **Variable Reward Element:** Occasionally surfaces a decision from this meeting that contradicts a decision from 3 weeks ago — "Flag: this conflicts with the decision made in the April 12 sync"

#### EOD Close — 5:15pm

- **Trigger:** Time-based (configurable); also triggered by "end of day" inferred from calendar clearing
- **Content:** What moved today vs. what was planned, unresolved items carried forward, one thing to note for tomorrow morning
- **Emotional Design:** Replace "did I actually do anything today?" with structured closure
- **Variable Reward Element:** Occasionally shows a streak ("3 days in a row of clearing your blocker backlog before EOD") or a delta ("Your standup prep time dropped 40% this week")

### 6.3 Variable Reward Design

Variable rewards are not random. They are designed around three reward types:

| Reward Type | Description | Example |
|---|---|---|
| **Tribe** | Social proof or recognition within the user's context | "Your design crit had the highest reviewer prep rate this quarter" |
| **Hunt** | Discovery of something unexpected but valuable | "Slack analysis shows a recurring blocker pattern you haven't filed as a risk" |
| **Self** | Progress, mastery, completion | "You've resolved 4 of your 5 weekly blockers before Thursday for the first time" |

Each ritual is designed to deliver at least one reward of each type per week.

### 6.4 Trust Marker Visual Language

Every piece of intelligence shown in Artisan carries a trust marker — a visual indicator of how the information was derived. This is critical for user trust and for calibrating when to act vs. when to verify.

| Marker | Color | Meaning |
|---|---|---|
| **Verified** | Green dot | Directly read from a connected tool's structured data (e.g., Jira ticket status = "Blocked") |
| **Inferred** | Amber dot | Derived by Artisan from patterns across data (e.g., "This person is likely the blocker based on thread activity") |
| **Suggested** | Blue dot | Artisan-generated recommendation with no direct data backing (e.g., "Consider following up with this stakeholder") |

Trust markers appear inline with each data point, not just at the card level. Users can tap any trust marker to see its source.

### 6.5 The Four Scenarios Where Artisan Initiates

Artisan sends proactive notifications in exactly four scenarios — never more, never arbitrary:

| Scenario | Trigger Condition | Notification Type |
|---|---|---|
| **Ritual Window** | Time-based trigger for Morning Read / EOD Close | Soft notification — "Your Morning Read is ready" |
| **Meeting Imminent** | Calendar event starting in T-5 minutes | Medium notification — "Brief for [Meeting Name] ready" |
| **Anomaly Detected** | Data signal deviates from established baseline by >2σ | High-priority flag — "Something unexpected: [summary]" |
| **Action Required** | A tracked item has been unresolved past its expected resolution window | Reminder — "[Item] has been open for [X] days — still relevant?" |

Artisan does not send motivational nudges, generic tips, or unsolicited suggestions outside these four scenarios.

---

## 7. Stage 3 Hero Card Design

The hero card is the first concrete output Artisan delivers at the end of onboarding. It must feel specific, personal, and immediately useful. Generic cards are a product failure.

### 7.1 Card Anatomy

Every hero card contains:

```
┌─────────────────────────────────────────────┐
│  [Role Icon]  [Persona-matched headline]     │
│                                              │
│  [Temporal hook copy]                        │
│                                              │
│  [Stat pill 1]  [Stat pill 2]  [Stat pill 3] │
│                                              │
│  [Primary insight — 2 sentences max]         │
│                                              │
│  [Trust source attribution line]             │
│                                              │
│  [Primary CTA button]  [Secondary: How?]     │
└─────────────────────────────────────────────┘
```

### 7.2 Per-Persona Hero Cards

#### PM — Meera

**Headline:** Your sprint has 2 hidden blockers — here's what to say before your standup

**Temporal Hook:** "Before your standup"

**Stat Pills:**
- `2 unresolved blockers` (Verified — Jira)
- `1 at-risk ticket` (Inferred — Jira + Slack)
- `Standup in 38 min` (Verified — Calendar)

**Primary Insight:** Two tickets marked In Progress have had no updates in 3 days and the assigned engineers haven't mentioned them in Slack. They are likely blocked but haven't been flagged. Artisan has drafted a check-in message for each.

**Trust Source Attribution:** From Jira sprint data + Slack channel analysis (last 72h)

**Primary CTA:** Review draft check-ins

---

#### Analyst — Arjun

**Headline:** 3 of your 5 Slack data requests this week were the same query

**Temporal Hook:** "Before engineering finds them"

**Stat Pills:**
- `3 duplicate requests` (Verified — Slack)
- `42 min/week recoverable` (Inferred — activity pattern)
- `1 auto-reply draft ready` (Suggested — Artisan)

**Primary Insight:** The weekly active users query appears in 3 different Slack threads with minor variations. Artisan has built a self-serve response template. Next time the question appears, you can reply in one click.

**Trust Source Attribution:** From Slack thread analysis (last 30 days)

**Primary CTA:** Review auto-reply template

---

#### Marketing Manager — Vikram

**Headline:** Your email campaign outperformed paid by 3.2x — here's why it won't last

**Temporal Hook:** "Before your Monday sync"

**Stat Pills:**
- `3.2x email vs. paid CTR` (Verified — Mailchimp + GA)
- `Open rate plateauing` (Inferred — trend analysis)
- `Budget reallocation window: this week` (Suggested — Artisan)

**Primary Insight:** Email is outperforming paid search this week, but open rates have flattened for 3 consecutive sends — a leading indicator of list fatigue. The window to reallocate budget to capitalize on email's current edge while refreshing the list is this week.

**Trust Source Attribution:** From Mailchimp campaign data + Google Analytics (last 21 days)

**Primary CTA:** See reallocation recommendation

---

#### Designer — Vagisha

**Headline:** Your last 3 design reviews averaged 47 minutes of re-explaining context

**Temporal Hook:** "Before your next design crit"

**Stat Pills:**
- `47 min avg context re-explain` (Inferred — meeting transcripts)
- `62% reviewers arrived unprepared` (Inferred — Figma open data)
- `Next crit: Thursday 2pm` (Verified — Calendar)

**Primary Insight:** Across your last 3 design crits, an average of 47 minutes was spent re-explaining constraints and prior decisions that were already documented in Figma or Notion. Artisan can generate a pre-crit brief for Thursday's session that reviewers receive 24 hours in advance.

**Trust Source Attribution:** From Calendar + Figma activity logs + meeting transcripts

**Primary CTA:** Generate Thursday's pre-crit brief

---

#### Sales — Shubham

**Headline:** Your 2pm call — here's what Infosys cares about right now

**Temporal Hook:** "5 minutes before your call"

**Stat Pills:**
- `Last contact: 12 days ago` (Verified — CRM)
- `3 open questions from last call` (Verified — Gong)
- `Recent news: Q3 hiring freeze` (Verified — web signal)

**Primary Insight:** Your last call ended with three unresolved questions about integration complexity. The prospect's LinkedIn shows a recent post about Q3 budget constraints — the hiring freeze context is directly relevant to your ROI framing. Artisan has drafted an opening that addresses both.

**Trust Source Attribution:** From Salesforce + Gong transcript + LinkedIn signal

**Primary CTA:** Review call brief + opening line

---

## 8. Artisan as Trained Subordinate — Vagisha Trust-Building Bot

The Trust-Building Bot represents Artisan's most sophisticated capability demonstration: not just surfacing information, but proving to a skeptical power user (Vagisha) that Artisan can function as a prepared, reliable subordinate — one who does the work before being asked and can show their work when questioned.

### 8.1 The Design Review Workflow (8 Steps)

The design review workflow is the primary use case for Vagisha and follows this sequence:

```
Step 1: Design file published in Figma
        ↓
Step 2: Artisan detects new file / major revision via Figma API
        ↓
Step 3: Artisan generates design brief (constraints, goals, 3 decisions needed)
        ↓
Step 4: Brief sent to invited reviewers 24h before crit
        ↓
Step 5: Recording Bot joins design crit call
        ↓
Step 6: Real-time transcription + decision tagging during call
        ↓
Step 7: Post-call: ReviewTrace auto-populated
        ↓
Step 8: Decision log shared with team; Figma comments updated with attribution
```

### 8.2 The Trust-Building Flow

The trust-building flow is the sequence of interactions that moves Vagisha from skeptic to advocate. It follows five phases:

**Phase 1 — Capability Announcement**
Artisan does not pitch itself. It announces a specific, concrete capability in the context of work already happening: "I noticed you have a design crit on Thursday. I can prepare a brief for your reviewers. Want to see what it would look like?"

**Phase 2 — Evidence Surface**
Before Vagisha asks "can it do this?", Artisan demonstrates it can — by generating a draft brief from the actual Figma file, with the actual constraints, and the actual three questions that need decisions. The evidence is specific to this design, not generic.

**Phase 3 — Pre-Answered Expert Questions**
Artisan anticipates the questions a skeptical expert would ask about its output and answers them proactively:
- "How did you determine these are the three decisions that need input?" → Source trace shown
- "What if a reviewer hasn't seen the prior context?" → Brief includes prior context summary
- "How do you handle conflicting feedback?" → ReviewTrace flags conflicts; Vagisha resolves

**Phase 4 — Trace Availability**
Every output Artisan produces in the design workflow is traceable. Vagisha can tap any element of the ReviewTrace and see exactly which source (transcript timestamp, Figma comment, Notion doc section) produced it. Nothing is asserted without evidence.

**Phase 5 — Calibration Loop**
After the first review cycle, Artisan surfaces a calibration prompt: "The brief I generated for Thursday's crit — was it accurate? Were the three questions the right ones?" Vagisha's response directly adjusts the brief generation model for future reviews.

### 8.3 The ReviewTrace Data Model

```typescript
interface ReviewTrace {
  reviewId: string;
  designFileId: string;         // Figma file ID
  designFileVersion: string;    // Figma version at time of review
  reviewDate: ISO8601;

  decisions: Decision[];
  openQuestions: Question[];
  conflicts: Conflict[];
  participants: Participant[];
}

interface Decision {
  decisionId: string;
  summary: string;              // 1-2 sentence description
  madeBy: Participant;          // attributed reviewer
  madeAt: ISO8601;
  sourceType: 'transcript' | 'figma_comment' | 'slack' | 'notion';
  sourceRef: string;            // timestamp, comment ID, or doc section
  trustMarker: 'verified' | 'inferred';
  relatedDesignComponent?: string;  // Figma node ID if applicable
  conflictsWith?: string[];     // decisionIds that conflict
}

interface Question {
  questionId: string;
  text: string;
  askedBy: Participant;
  status: 'open' | 'resolved' | 'deferred';
  resolution?: string;
  resolvedAt?: ISO8601;
}

interface Conflict {
  conflictId: string;
  decisionIds: string[];        // the two (or more) conflicting decisions
  description: string;
  resolvedBy?: Participant;
  resolution?: string;
}

interface Participant {
  participantId: string;
  name: string;
  role: string;
  attended: boolean;
  briefOpened: boolean;         // did they open the pre-crit brief?
  briefOpenedAt?: ISO8601;
}
```

### 8.4 The Two-Sided Assessment Architecture

The design review pipeline uses two specialized bots:

#### Recording Bot

**Role:** Passive observer during the design crit call

**Capabilities:**
- Joins calendar-linked call (Google Meet / Zoom) automatically
- Performs real-time transcription
- Tags utterances with speaker identification
- Flags potential decision moments (phrases like "let's go with", "we've decided", "I think we should") for human review
- Does not intervene in the meeting

**Output:** Raw transcript + decision-candidate timestamp log

#### Assessment Bot

**Role:** Post-call processor and ReviewTrace generator

**Capabilities:**
- Ingests Recording Bot output
- Cross-references with Figma file, Notion brief, and prior ReviewTraces for the same project
- Classifies flagged moments as: Decision / Question / Action Item / Context
- Resolves ambiguous attributions using speaker ID + conversation context
- Generates the ReviewTrace
- Flags conflicts with prior decisions
- Drafts Figma comment updates with decision attribution

**Output:** Completed ReviewTrace + draft Figma annotations + conflict flags for Vagisha review

The two-sided architecture keeps the meeting experience clean (Recording Bot is invisible) while ensuring the post-meeting output is high-quality and fully traced (Assessment Bot does the heavy lifting after the fact).

---

## 9. Data Schema

### 9.1 Behavioral Events

All user interactions with Artisan generate structured behavioral events that feed into the model training pipeline.

```typescript
// Core event schema
interface ArtisanEvent {
  eventId: string;
  userId: string;
  sessionId: string;
  timestamp: ISO8601;
  eventType: EventType;
  payload: Record<string, unknown>;
  source: 'user' | 'system' | 'integration';
}

type EventType =
  // Onboarding
  | 'onboarding.stage1.tool_connected'
  | 'onboarding.stage2.question_answered'
  | 'onboarding.stage3.hero_card_shown'
  | 'onboarding.stage3.hero_card_cta_clicked'
  | 'onboarding.stage3.hero_card_dismissed'
  | 'onboarding.stage3.hero_card_feedback'

  // Ritual engagement
  | 'ritual.morning_read.opened'
  | 'ritual.morning_read.item_acted_on'
  | 'ritual.pre_meeting_brief.opened'
  | 'ritual.pre_meeting_brief.opened_late'   // opened after meeting started
  | 'ritual.capture.reviewed'
  | 'ritual.capture.item_edited'
  | 'ritual.eod_close.opened'
  | 'ritual.eod_close.dismissed'

  // Trust marker interactions
  | 'trust.marker.tapped'
  | 'trust.marker.source_viewed'

  // Card interactions
  | 'card.cta.primary_clicked'
  | 'card.cta.secondary_clicked'
  | 'card.feedback.positive'
  | 'card.feedback.negative'
  | 'card.feedback.corrected'   // user corrects an inference

  // Integration events
  | 'integration.tool.connected'
  | 'integration.tool.disconnected'
  | 'integration.data.synced'
  | 'integration.anomaly.detected'
```

### 9.2 Computed Signals

Four key computed signals are derived from behavioral events and integration data. These signals are the primary inputs to Artisan's personalization and prioritization models.

#### Context Depth Score (CDS)

Measures how well Artisan knows the user — how many tools are connected, how much data has been processed, and how many training signals have been received.

```
CDS = (tools_connected × 0.3)
    + (days_of_data × 0.2)
    + (feedback_events × 0.3)
    + (correction_events × 0.2)

Range: 0–100
D7 target: >40
D30 target: >70
```

#### Morning Ritual Score (MRS)

Measures consistency of Morning Read engagement as a leading indicator of habit formation.

```
MRS = (morning_reads_opened / morning_reads_delivered) × 100
    × recency_weight  // more recent opens weighted higher

Range: 0–100
Target: >60 at D14
Churn risk signal: MRS < 20 at D7
```

#### Shadow Tool Score (STS)

Measures whether Artisan is replacing the user's previous tool-checking behavior (the "shadow tools" they were using before Artisan).

```
STS = 1 - (shadow_tool_opens_post_artisan / shadow_tool_opens_pre_artisan)

Range: 0–1 (higher = more displacement)
Healthy signal: STS > 0.3 at D30
Computed from: browser activity, mobile app usage (where available)
```

#### Habit Streak

A simple consecutive-day engagement counter, surfaced in the EOD Close ritual as a variable reward.

```
habit_streak = consecutive_days where:
  morning_read.opened OR
  pre_meeting_brief.opened OR
  eod_close.opened
```

### 9.3 ML Training Signals

| Signal | Description | Used For |
|---|---|---|
| `hero_card_cta_clicked` | User clicked primary CTA on hero card | Card relevance model |
| `hero_card_feedback.negative` | User marked card as not relevant | Persona model recalibration |
| `card.feedback.corrected` | User corrected an inference | Trust marker accuracy improvement |
| `ritual.morning_read.item_acted_on` | User acted on a Morning Read item | Item prioritization model |
| `ritual.pre_meeting_brief.opened_late` | Brief opened after meeting started | Notification timing model |
| `integration.anomaly.detected` + follow-up action | User acted on anomaly flag | Anomaly relevance model |
| `trust.marker.source_viewed` | User inspected a trust source | Trust transparency demand signal |

---

## 10. Integration Layer

### 10.1 Dynamo V2 / Clarity MCP Server Mapping

Artisan's integration layer is built on the Clarity MCP Server, which abstracts tool-specific APIs into a unified capability surface. The mapping below shows which Clarity MCP tools power which Artisan capabilities.

| Artisan Capability | Clarity MCP Tool | Underlying Integration | Data Type |
|---|---|---|---|
| Sprint blocker detection | `clarity.jira.sprint_health` | Jira REST API | Ticket status, assignee activity |
| Stakeholder update draft | `clarity.confluence.doc_draft` | Confluence API | Page templates, sprint data |
| Slack blocker inference | `clarity.slack.thread_analysis` | Slack Events API | Thread activity, mention patterns |
| Campaign performance brief | `clarity.analytics.aggregation` | GA4 + HubSpot API | Campaign metrics, delta computation |
| Pre-meeting brief | `clarity.calendar.meeting_context` | Google Calendar API | Event metadata, attendee history |
| Call prep card | `clarity.crm.account_context` | Salesforce / HubSpot API | Account history, open opportunities |
| Design crit brief | `clarity.figma.file_summary` | Figma REST API | File version, component changes |
| ReviewTrace generation | `clarity.transcript.decision_extract` | Meet / Zoom transcript API | Speaker-attributed transcript |
| Anomaly detection | `clarity.signals.anomaly_detect` | Any connected integration | Time-series deviation |
| CRM draft update | `clarity.crm.activity_draft` | Salesforce / HubSpot API | Call transcript → CRM fields |

### 10.2 MCP Tunnel Architecture for Enterprise

Enterprise customers require that no raw data leaves their network. Artisan supports a local MCP tunnel architecture:

```
[User's Tool Stack]
       ↓
[Clarity MCP Tunnel Agent — runs on-premise]
       ↓  (sends only structured signals, never raw content)
[Artisan Cloud — personalization + card generation]
       ↓
[Artisan Client — web / mobile]
```

**Tunnel Agent responsibilities:**
- Authenticates to on-premise tools using local credentials
- Extracts structured signals (ticket counts, thread metadata, calendar events) without forwarding raw content
- Applies org-defined data classification rules before transmission
- Caches signals locally for 24h to support offline operation

**What never leaves the tunnel:**
- Email body content
- Document full text
- Call recordings or raw transcripts
- PII beyond what is required for attribution (name + role)

**What the tunnel sends:**
- Aggregated metrics (ticket counts, velocity, response times)
- Metadata (titles, statuses, timestamps, assignees)
- Structured decision outputs from on-premise Assessment Bot
- Behavioral event signals (anonymized by default)

---

## 11. Open-Source Integration Map

Artisan is designed with a first-class integration path for open-source alternatives to the commercial SaaS tools most knowledge workers use. The three anchor open-source integrations are: **Twenty CRM**, **AppFlowy**, and **Cal.com**.

### 11.1 Integration Map

| Dimension | Twenty CRM | AppFlowy | Cal.com |
|---|---|---|---|
| **Integration Layer** | REST API + webhook | REST API + real-time sync | REST API + webhook |
| **Tool Discovery Signal** | Self-hosted CRM presence on network scan; Twenty-specific API response headers | AppFlowy workspace metadata; self-hosted document structure | Cal.com booking page pattern; self-hosted calendar API endpoint |
| **Interview Stage Pre-fill** | Pull open opportunities, recent contact activity, pipeline stage | Pull recent documents, workspace structure, tag taxonomy | Pull calendar density, recurring meeting patterns, availability windows |
| **Personalization Card** | "Your pipeline has X deals with no activity in 14 days" | "Your most-accessed workspace is [X] — Artisan can brief you before each session" | "You have X discovery calls this week — briefs ready for all of them" |
| **Daily Brief Delta** | Deal activity changes since last brief; new contacts added | Document updates in watched workspaces; new collaborative edits | Upcoming meetings for next 24h; new bookings since last brief |
| **Task Lifecycle Source** | Opportunity stages → task triggers (e.g., deal moves to Proposal → trigger follow-up brief) | Document status changes → brief triggers | Meeting booked → automatic pre-meeting brief trigger |
| **Trust Marker** | Verified: direct API read from Twenty CRM instance | Verified: direct API read from AppFlowy instance | Verified: direct API read from Cal.com instance |
| **MCP Opportunity** | `clarity.twenty.pipeline_health` — wraps Twenty CRM API for pipeline signal extraction | `clarity.appflowy.workspace_summary` — wraps AppFlowy API for document signal extraction | `clarity.calcom.meeting_context` — wraps Cal.com API for calendar signal extraction |
| **Self-Hosted Advantage** | Full data residency; no HubSpot/Salesforce licensing cost; API without rate limits | Full document privacy; no Notion data sharing; local vector search on documents | Full calendar privacy; no Google Calendar data sharing; custom booking workflows |
| **Persona Best Fit** | Sales (Shubham) — primary CRM workflow; also PM for stakeholder tracking | PM (Meera), Designer (Vagisha), Analyst (Arjun) — document-heavy workflows | All personas — universal calendar integration; especially Sales for booking-driven workflows |

### 11.2 Self-Hosted Stack Configuration

For users running the full open-source stack, Artisan's recommended self-hosted configuration is:

```yaml
# artisan-self-hosted.yml
integrations:
  crm:
    provider: twenty
    endpoint: https://crm.internal.company.com
    auth: api_key

  documents:
    provider: appflowy
    endpoint: https://docs.internal.company.com
    auth: oauth2

  calendar:
    provider: calcom
    endpoint: https://cal.internal.company.com
    auth: api_key

mcp_tunnel:
  enabled: true
  data_residency: local
  transmission_mode: structured_signals_only

artisan_cloud:
  endpoint: https://api.artisan.ai
  auth: org_token
  features:
    personalization: true
    card_generation: true
    anomaly_detection: true
```

---

## 12. Success Metrics

Success for Artisan is measured across three horizons: onboarding (Day 1), early retention (Day 7), and habit formation (Day 30).

### 12.1 Onboarding Metrics (Day 1)

| Metric | Definition | Target |
|---|---|---|
| **Stage 1 Completion Rate** | % of users who connect at least 1 tool | >85% |
| **Stage 2 Completion Rate** | % of users who complete the Interview stage | >70% |
| **Stage 3 Completion Rate** | % of users who reach the hero card | >65% |
| **Onboarding Duration** | Median time from signup to hero card display | <8 minutes |
| **Hero Card CTA Click Rate** | % of users who click the primary CTA on the hero card | >40% |
| **Wow Moment Conversion Rate** | % of users who click CTA AND return within 24h | >30% |

### 12.2 Early Retention Metrics (Day 7)

| Metric | Definition | Target |
|---|---|---|
| **D7 Retention** | % of users active on Day 7 | >45% |
| **Context Depth Score at D7** | Median CDS across active users at Day 7 | >40 |
| **Morning Ritual Score at D7** | % of users with MRS > 60 at Day 7 | >25% |
| **Capability Card CTR** | % of capability cards that result in a primary CTA click | >35% |
| **Trust Marker Interaction Rate** | % of users who tap at least one trust marker in first 7 days | >20% |

### 12.3 Habit Formation Metrics (Day 30)

| Metric | Definition | Target |
|---|---|---|
| **D30 Retention** | % of users active on Day 30 | >30% |
| **Context Depth Score at D30** | Median CDS across active users at Day 30 | >70 |
| **Shadow Tool Score at D30** | % of users with STS > 0.3 at Day 30 | >35% |
| **Morning Ritual Score at D30** | % of users with MRS > 60 at Day 30 | >40% |
| **Habit Streak at D30** | Median habit streak for retained users at Day 30 | >12 days |
| **Stage 3 Wow Moment to D30 Retention** | % of users who clicked hero card CTA and are retained at D30 | >55% |

### 12.4 Quality Metrics

| Metric | Definition | Target |
|---|---|---|
| **Inference Accuracy** | % of role inferences confirmed correct by users | >80% |
| **Card Correction Rate** | % of cards where user corrects an inference | <15% |
| **Trust Marker Dispute Rate** | % of trust markers disputed (user says source is wrong) | <5% |
| **Anomaly False Positive Rate** | % of anomaly flags dismissed as not relevant | <25% |
| **ReviewTrace Completeness** | % of decisions in a design crit captured in ReviewTrace | >80% |

### 12.5 Metric Hierarchy

```
Primary (board-level):
  D30 Retention → target: 30%
  Wow Moment Conversion Rate → target: 30%

Secondary (growth-level):
  Stage 3 Completion Rate
  Hero Card CTA CTR
  Context Depth Score D7

Tertiary (product-level):
  Morning Ritual Score
  Shadow Tool Score
  Inference Accuracy
  ReviewTrace Completeness
```

---

*Document ends. Version 0.3. For questions on this PRD, refer to the Artisan product thread.*
