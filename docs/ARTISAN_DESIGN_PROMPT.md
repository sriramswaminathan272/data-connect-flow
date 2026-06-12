# Artisan — Complete Design Prompt for Claude Design / v0

**Use this prompt in full. It is self-contained.**  
**Stack: React + shadcn/ui + Tailwind CSS + Framer Motion**  
**Target: Desktop-first (Electron DMG for Mac), min-width 1280px**

---

## WHAT YOU ARE BUILDING

Artisan is an AI work surface for knowledge workers. It learns their tools, infers their role, and surfaces the right action before they know they need it. It also offers to teach users to do everything it does — so they can eventually leave. The design must carry both of those ideas simultaneously: a product that is deeply capable and genuinely trying to make itself unnecessary.

**Design inspiration: Spotify.** Dark background, single vivid accent, progressive personalisation made visible, persistent context bar (like Now Playing), cards that get smarter over time.

**Emotional arc across the product:** Starts cold and precise (scan, evidence). Becomes warm and personal as context builds (buds glowing, constellation forming). Ends as a self-portrait of professional capability.

---

## DESIGN SYSTEM

### Colour Palette

```
--background:       #FFFFFF / #F8FAFC (slate-50)
--dark-surface:     #020617 (slate-950)  ← hero cards, overlays, Now Watching bar
--primary:          #4F46E5 (indigo-600) ← CTAs, active states, progress
--primary-hover:    #4338CA (indigo-700)
--primary-light:    #EEF2FF (indigo-50)  ← selected states, light accents

--bud-review:       #7C3AED (violet-600) ← current capability buds
--bud-spec:         #4F46E5 (indigo-600)
--bud-handoff:      #D97706 (amber-600)
--bud-feedback:     #92400E (amber-800)
--bud-ship:         #059669 (emerald-600) ← new capability buds
--bud-code:         #0D9488 (teal-600)
--bud-analytics:    #0891B2 (cyan-600)

--success:          #10B981 (emerald-500)
--warning:          #F59E0B (amber-500)
--error:            #EF4444 (red-500)

--text-primary:     #0F172A (slate-900)
--text-secondary:   #64748B (slate-500)
--text-tertiary:    #94A3B8 (slate-400)
--text-on-dark:     #FFFFFF
--text-on-dark-2:   #C7D2FE (indigo-200)
--text-on-dark-3:   #94A3B8 (slate-400)

--border:           #E2E8F0 (slate-200)
--border-focus:     #6366F1 (indigo-400)
```

### Typography (Inter, all weights)

```
Display:   32px / weight 600 / slate-900 or white    (screen headlines)
Title:     22–26px / weight 600 / slate-900           (section titles)
Subtitle:  18–20px / weight 600 / slate-900           (card titles large)
Card:      14–16px / weight 600 / slate-900           (card titles)
Body:      13–14px / weight 400 / slate-600           (body copy)
Small:     12px / weight 400 / slate-500              (meta, captions)
Label:     11px / weight 500 / uppercase / tracking-wide / slate-400  (section labels)
Mono:      13px / monospace / slate-300 on dark       (code, traces)
```

### Spacing

```
Base unit: 4px
Component padding: 16–24px
Card padding: 16–20px
Section gap: 24–32px
Grid gap: 12–16px
```

### Border Radius

```
Full round (pills/chips): 9999px
Cards: 12px (rounded-xl)
Buttons: 10px (rounded-lg)
Input fields: 8px (rounded-lg)
Bud orbs: 50% (full circle)
Device frames: 24px
```

### Shadows

```
Card default:  0 1px 3px rgba(0,0,0,0.08)
Card hover:    0 4px 12px rgba(79,70,229,0.12)
Overlay:       0 20px 60px rgba(0,0,0,0.40)
Bud active:    0 0 24px rgba(79,70,229,0.35)  ← indigo glow for buds
Bud new:       0 0 24px rgba(5,150,105,0.35)  ← emerald glow for new buds
```

---

## COMPONENT LIBRARY

### Trust Marker
Three visual states. Always shown on every card. Never hidden.

```
Verified:    ● solid emerald-500 dot  + "Source: [tool] · verified"   12px slate-400
Inferred:    ◐ half amber-500 dot     + "Source: [tool] · inferred"   12px slate-400
Suggested:   ○ hollow slate-400 dot   + "Based on answers · suggested" 12px slate-400
```

### Capability Card (standard)
```
Container: rounded-xl border border-slate-200 bg-white p-4
  hover: border-indigo-200 shadow-[0_4px_12px_rgba(79,70,229,0.12)] transition-all 150ms

Row 1: Tool/project tags — rounded bg-slate-100 text-slate-500 px-2 py-0.5 text-xs
       Project tag — rounded bg-indigo-50 text-indigo-600 text-xs font-medium
Row 2: Title — 14px semibold slate-900
Row 3: Body — 12px slate-500 line-clamp-3
Row 4: CTA — icon + label, 12px semibold indigo-600
       Bud icon top-right — 16px orb, color-coded
Row 5: Trust marker — bottom, 11px
```

### Hero Card (dark, full-width)
```
Container: rounded-2xl border border-indigo-800
           bg-gradient-to-br from-indigo-950 to-indigo-900 p-6 text-white

Stat pills row: flex gap-3
  Each pill: bg-white/10 border border-white/10 rounded-lg px-3 py-2
    Value: 16px bold white
    Label: 11px indigo-200

Title: 20px semibold white mb-2
Body:  14px indigo-100 leading-relaxed mb-5
Footer row:
  CTA button: bg-white text-indigo-700 rounded-lg px-4 py-2 text-sm font-semibold
              hover: bg-indigo-50 transition-colors
              ArrowRight icon 16px
  Trust source: 12px indigo-300 right-aligned
```

### Bud Orb
```
Wrapper: relative inline-flex items-center justify-center

Orb (Active state):
  w-16 h-16 rounded-full
  Background: bud-specific gradient (e.g. violet-500 to violet-700)
  Box shadow: 0 0 24px rgba(bud-color, 0.40)
  Animation: slow heartbeat pulse, scale 1.0→1.04→1.0, 3s ease-in-out, infinite
  Icon: 28px white, centered

Orb (Growing state):
  Same but shadow opacity 0.25
  Animation: gentle float, translateY -3px→0→-3px, 4s ease-in-out

Orb (Seed/Dormant — new cap):
  w-12 h-12 rounded-full
  Background: slate-700
  Border: 2px dashed slate-500
  Animation: slow shimmer sweep, 6s linear infinite
    (linear-gradient sweep from left to right, 15% opacity white)
  Icon: 20px slate-400

Orb (Mastered):
  w-20 h-20 rounded-full
  Background: bud gradient
  Shadow: 0 0 40px rgba(bud-color, 0.55)
  Rotating ring: 4 small dots orbiting at 20px radius, 8s linear infinite
```

### Now Watching Bar (persistent bottom)
```
Position: fixed bottom-0 left-0 right-0 z-50
Height: 52px
Background: slate-950
Border-top: 1px solid slate-800

Content: flex items-center px-6 justify-between
  Left: eye icon (16px slate-400) + text (13px slate-300)
        "Watching [context] · [signal] · [time]"
  Right: chevron-up icon, tap to expand

Expanded state:
  Height: 280px
  Shows: active buds, current monitoring context,
         next expected event, last Artisan action
  Slide up with spring: 400ms
```

### Voice Input Bar (Ship Mode)
```
Container: flex gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700

Microphone button: w-10 h-10 rounded-full
  Listening: bg-indigo-600, pulsing ring animation
  Idle: bg-slate-700

Waveform: flex-1 h-8 — animated bars when listening, flat when idle
          bars: indigo-400, staggered height animation

Recent commands: flex gap-1.5 mt-2
  Each: rounded-full bg-slate-800 text-slate-300 text-xs px-2.5 py-1
```

### Report/Trace Cite (inline in Release Assistant)
```
Screenshot cite: w-60 h-40 rounded-lg overflow-hidden border border-slate-700
  Overlay: bottom strip with device info, 11px slate-400

Code cite: rounded-lg bg-slate-900 p-3
  Lines: 6 max, syntax highlighted, line numbers in slate-600
  "Show more" link if truncated

Voice cite: flex gap-3 items-center rounded-lg bg-slate-900 p-3
  Waveform thumbnail (24px height)
  Transcript text: 13px slate-300 italic
  Timestamp: 11px slate-500
  Play button: 28px rounded-full bg-indigo-600
```

---

## SCREEN 1 — FIRST LAUNCH

**Emotional intent:** Calm authority. A professional tool introducing itself. No excitement, no feature lists.

```
Full screen. Background: slate-950.
Centered column, max-width: 400px, vertically centered.

Top:
  Artisan logo (48×48 indigo-600 rounded-xl + white Sparkles icon)
  mt: 0 (vertically centered group)

Headline: "Hello. I'm Artisan."
  32px / 600 / white / mt-6

Subhead: "I learn how you work so you don't have to explain yourself."
  16px / 400 / slate-400 / mt-2 / max-w-xs / text-center

Permission card (mt-10):
  rounded-2xl bg-slate-900 border border-slate-800 p-6
  
  Icon row: Finder + Claude + Folder icons, 24px slate-500, gap-3
  Title: "One permission. That's all."  14px / 600 / white / mt-4
  Body: "Artisan reads your local files and Claude Code sessions
         to build your workspace profile. Nothing leaves your machine."
        13px / slate-400 / mt-2 / leading-relaxed
  
  Button (mt-6): "Grant file access →"
    w-full h-12 rounded-xl bg-indigo-600 text-white text-sm font-semibold
    hover: bg-indigo-700 transition-colors
  
  Fine print (mt-3): "Revoke in Settings at any time."
    11px slate-500 text-center
```

---

## SCREEN 2 — SCAN (Recognition Building)

**Emotional intent:** Intelligence made visible. The user watches Artisan discovering their world.

```
Full screen. Background: white.

Header (fixed, 64px, bg-white, border-b border-slate-100):
  Left: Artisan logo (32px) + "Artisan" (16px semibold slate-900)
  Right: Stage indicator — "1 Scan ──●── 2 Learn ────── 3 Discover"
    Completed: rounded-full bg-indigo-100 text-indigo-600
    Active: rounded-full bg-indigo-600 text-white
    Future: text-slate-400

Main content (max-w-560 mx-auto pt-16):
  Headline: "Finding your world."  28px / 600 / slate-900
  Subhead: "Scanning your machine and connected tools."  14px slate-500 mt-1

  Integration grid (mt-8, 2×2, gap-4):
    Each card (rounded-xl border border-slate-200 bg-white p-5):
      Header row: logo (32px rounded-lg colored bg) + name (13px semibold) + status (12px slate-400)
      
      Scan progress bar (h-1 rounded-full mt-4):
        Scanning: animated indigo bar sweeping L→R, 1.2s linear, bg-slate-100
        Complete: solid bg-indigo-500 w-full

      Tool tags row (mt-3, flex-wrap gap-1.5):
        Each tag fades in staggered 200ms:
          rounded-full bg-indigo-50 text-indigo-700 text-xs px-2.5 py-0.5

      Scan state text (12px):
        Scanning: slate-400 "Scanning..."
        Found: emerald-600 "14 tools found" + CheckCircle2 icon

  Live counter (mt-6, text-center):
    "17 tools found across your workspace"
    18px / 500 / slate-700
    Number animates up in real-time

  Claude Code sessions card (conditional, mt-4):
    Slides up 8px + fade when detected
    rounded-xl bg-indigo-50 border border-indigo-200 p-4
    Left: purple Sparkles icon 20px
    Text: "Found your Claude Code history. 847 sessions."
    Tags: session names as small chips

  Persona inference chip (appears after all scans complete, 800ms delay):
    Slides up 8px, spring animation 400ms
    rounded-full bg-indigo-50 border border-indigo-200 px-4 py-2
    ActivityIcon + persona name + "Inferred" amber badge

  Continue button (mt-8):
    w-full max-w-xs mx-auto h-12 rounded-xl bg-indigo-600 text-white
    "Continue →"
```

---

## SCREEN 3 — INTERVIEW

**Emotional intent:** Conversational but efficient. Q3 is the hinge — it must feel different enough to make the user pause.

```
Same header. Stage 2 active.
Main content: max-w-480 mx-auto pt-16.

Progress segments (flex gap-1.5 mb-8):
  5 × h-1 rounded-full flex-1
  Completed: bg-indigo-500
  Current: bg-indigo-300
  Future: bg-slate-200
  Counter "3 / 5": 12px slate-400 ml-2 shrink-0

Question (mb-6):
  h2: 22px / 600 / slate-900 / leading-snug
  Subtext: 13px slate-500 mt-1

Answer areas:

  TEXT type:
    Textarea: min-h-28 resize-none rounded-lg border border-slate-200
              focus: border-indigo-400 ring-2 ring-indigo-400/20
              14px text / slate-300 placeholder
    ⌘+Enter hint: 11px slate-400 text-right mt-2

  CHIPS type:
    Container: min-h-12 p-3 rounded-lg border border-slate-200 bg-white
      flex-wrap gap-2
      Chip: rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium
            px-2.5 py-1 flex items-center gap-1
            × button: hover:text-indigo-600
    Text input + Add button row below
    Low-confidence chips: dashed border border-slate-300 text-slate-500
      hover: border-indigo-300 text-indigo-600

  CHOICE type:
    Stack of 3 buttons (gap-2):
      Default: border border-slate-200 bg-white rounded-xl px-4 py-3.5
               text-sm text-slate-700
      Selected: border-indigo-400 bg-indigo-50 text-indigo-900 font-medium
      Transition: 150ms

Actions (flex justify-between mt-6):
  Skip: SkipForward icon + "Skip", text-sm text-slate-400 hover:text-slate-600
  Next: bg-indigo-600 text-white rounded-lg px-5 h-10 text-sm font-semibold
        ChevronRight icon

Q3 SPECIAL TREATMENT — "What's one thing you wish you never had to touch again?"
  Question text: identical treatment BUT placeholder copy includes meta examples
  "e.g. Writing the weekly status update... or even filling out forms like this one"
  This plants the seed for the genie trigger.
```

---

## SCREEN 4 — GENIE MOMENT (TRIGGERED AT Q3)

**Emotional intent:** The product just solved its own onboarding. Delight + relief. Must feel intentional, not accidental.

```
OVERLAY: fixed inset-0 z-50
  Background: bg-slate-950/85 backdrop-blur-sm
  The interview screen is visible but blurred behind it.
  Transition in: backdrop-blur ramps from 0 to blur-sm over 300ms

CONTENT: absolute centered, no card/border, pure centered text

— PHASE 1 (0 → 1800ms) —

Logo cluster (relative 56px):
  Inner: w-14 h-14 rounded-xl bg-indigo-600, Sparkles icon 28px white, centered
  Outer ring: absolute inset-0 rounded-xl border-2 border-indigo-400
              animation: ping, opacity 0.30

Text (mt-6, text-center):
  "Okay."          → 28px / 600 / white
  "Working on it." → 22px / 400 / indigo-300 / mt-1

Dots (mt-5, flex gap-2 justify-center):
  3 × w-1.5 h-1.5 rounded-full bg-indigo-400
  animation: bounce, staggered 150ms each

— PHASE 2 (1800ms → 3800ms) —
Cross-fade from Phase 1, 300ms

Checkmark (56px):
  w-14 h-14 rounded-xl bg-emerald-500
  CheckCircle2 icon 32px white

Text (mt-5, text-center):
  "Fixed it."   → 32px / 600 / white
  "I already have everything I need.
   You won't have to answer this again."
  → 14px / slate-400 / max-w-xs / leading-relaxed / mt-2

Source card (mt-6, w-96 rounded-xl bg-slate-900 p-4):
  4 rows, each staggered fade-in 180ms apart:
    CheckCircle2 16px emerald-400 + text 14px slate-300
    "Found 14 tools from your integrations"
    "Detected active projects from Drive"
    "Inferred work patterns from your usage"
    "Skipping the rest of this interview"

— AT 3800ms —
Full-screen white flash (200ms) → fade into Screen 5
```

---

## SCREEN 5 — PERSONALIZATION (Stage 3)

**Emotional intent:** Discovery. "I didn't know it could know this." The hero card must feel like it was written for this specific person today.

```
Same header. Stage 3 active.
Main content: max-w-640 mx-auto pt-12 pb-16.

SECTION A — HEADER
  Headline: "Here's what I see. Here's what I can do."
    26px / 600 / slate-900
  Subhead: "Found Figma, Linear, Notion + 14 more across your connected sources."
    13px slate-500 mt-1

  Persona row (mt-4, flex items-center gap-3):
    Persona chip: rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1.5
      flex gap-1.5 items-center
      PersonaIcon 14px indigo-600 + name 13px indigo-700 font-medium
      "Inferred" badge: bg-amber-100 text-amber-700 text-xs rounded px-1.5
    
    Correction link: Edit3 icon 12px + "Not right?" 12px slate-400
      hover: text-slate-600
    
    Correction panel (expanded, mt-3):
      flex-wrap gap-1.5
      Other persona pills: rounded-full border border-slate-300 text-xs px-3 py-1.5
        hover: border-indigo-400 text-indigo-700

SECTION B — HERO CARD
  [See Hero Card component above]
  Full-width. mt-6.
  Stat pills animate count-up on mount, 600ms ease-out.
  Card fades in with translateY(-8px) → translateY(0), 500ms.

GENIE VARIANT HERO CARD:
  Title: "You said you hate setup forms. We agree."
  Stats: "14 tools scanned" · "0 more questions" · "never again"
  Body: "So we skipped the rest. I scanned your connected tools and
         learned everything I needed without asking. You'll never fill
         out an onboarding form again — Artisan updates its model
         from what you actually do, not what you say you do."
  CTA: "See what I already know →"
  Trust source: "Your integrations · no manual input required"

SECTION C — CAPABILITY PREVIEW (first 3 buds)
  Label: "YOUR CAPABILITY BUDS" — 11px slate-400 uppercase tracking-wide mt-8 mb-3
  
  3 bud orbs in a row (gap-4):
    Each: flex-col items-center
    Orb: Growing state (56px)
    Name: 12px slate-600 mt-2
    Status: 11px slate-400
  
  Below: 3 seed orbs showing new buds in a row
    Dimmer, dashed ring, "unlocking soon" text

SECTION D — MORE CAPABILITIES
  Label: "BECAUSE YOU'RE ON A SPRINT DEADLINE" — 11px slate-400 uppercase mt-8 mb-3
  2-col grid (gap-3): capability cards
  [See Capability Card component]

SECTION E — FOOTER
  border-t border-slate-100 mt-8 pt-6
  flex justify-between items-center gap-4

  Left: "Every card references something from your tools.
         Nothing is generic. Cards update as you use Artisan."
    11px slate-400 max-w-xs

  Right: "Start using Artisan →"
    lg button bg-indigo-600 text-white rounded-xl px-6 h-11
    ChevronRight icon

NOW WATCHING BAR — FIRST APPEARANCE
  Slides up from below at the same moment as the footer
  Spring animation: 400ms cubic-bezier(0.34, 1.56, 0.64, 1)
  "👁 Watching Sprint PROJ-Q2 · 2 blocked · Standup in 47m"
```

---

## SCREEN 6 — ARTISAN WORKSPACE

**Emotional intent:** Calm intelligence. The user is mid-work and Artisan is already watching. Not overwhelming — one important thing at a time.

```
LAYOUT: 3-column desktop (1280px+)
  Left sidebar: 220px fixed
  Center feed: flex-1 max-w-2xl
  Right panel: 280px

LEFT SIDEBAR (bg-white border-r border-slate-100):
  Logo row (p-4 pb-2): 32px logo + "Artisan" 15px semibold
  
  Nav items (px-3 gap-0.5):
    [Today] [Projects] [Tools] [Settings]
    Each: rounded-lg px-3 py-2 text-sm
    Active: bg-indigo-50 text-indigo-700 font-medium
    Hover: bg-slate-50 text-slate-700
  
  Divider mt-auto
  
  Bottom section (p-4):
    Persona chip: small, current persona
    
    RS consequence (mt-2):
      Not a number. A sentence.
      "You delegated 4 tasks this week ↑"
      12px slate-500
      Spark icon + trend arrow

CENTER FEED:
  Date header: "Friday, May 23" 12px slate-400 + "Good morning, Meera" 16px slate-700 mt-1
  
  Proactive card (border-l-4 border-indigo-500 rounded-r-xl bg-indigo-50 p-4 mt-4):
    Label: "BEFORE YOUR 9:30 STANDUP" 10px indigo-500 uppercase tracking-wide
    Title: "2 tickets stuck in review." 18px slate-900 semibold
    Body: 13px slate-600 mt-1
    CTA: "Summarise for standup →" 13px indigo-600 font-medium mt-3
    Trust: "Source: Linear · verified" 11px slate-400 mt-2

  Task cards (mt-4 space-y-3):
    [See Capability Card component, task variant]
    State pill variants:
      DETECTED: amber-100 text-amber-700
      ACTIVE:   indigo-100 text-indigo-700
      AWAITING: slate-100 text-slate-600
      CLOSED:   green-50 text-green-700

RIGHT PANEL (border-l border-slate-100 p-4):
  "WHAT CHANGED" 11px slate-400 uppercase mb-3
  Delta items (space-y-3):
    Each: flex gap-2.5
      Dot: w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5
      Text: 13px slate-700
      Source: 11px slate-400

  "NEXT RITUAL" (mt-6):
    Countdown: "Standup in 47 minutes"
    12px slate-500

BOTTOM: Now Watching Bar (persistent, from Screen 5 onward)
```

---

## SCREEN 7 — SHIP MODE

**Emotional intent:** Focus and precision. The user is building something. Real-time feedback creates confidence.

```
LAYOUT: 3-panel horizontal
  Panel 1 (280px): Bud sidebar
  Panel 2 (flex-1): Canvas
  Panel 3 (360px): Live device

PANEL 1 — BUD SIDEBAR (bg-slate-950 text-white):
  "ACTIVE BUDS" 10px slate-400 uppercase p-4 pb-2

  Active bud orbs (p-4 space-y-4):
    Each: flex items-center gap-3
      Orb: 40px, active state with glow
      Col: name 13px white, status 11px slate-400

  Loop arc visualization:
    Between connected buds: animated dashed line
    Arrow direction shows flow
    Color: source bud color
    Width: 1-3px based on loop strength

PANEL 2 — CANVAS (bg-slate-950):
  Top: Figma thumbnail (source frame, 200px height, rounded-lg)
       "Source" label 11px slate-500 mb-2

  Code area (flex-1 bg-[#0D1117] rounded-lg p-4 mt-4 font-mono):
    Syntax highlighted, 13px
    Line numbers: slate-600
    Diff highlight (changed lines): bg-yellow-900/30 border-l-2 border-yellow-400

  Voice input bar (bottom, mt-4):
    [See Voice Input Bar component]
    Recent command chips above

PANEL 3 — LIVE DEVICE (bg-slate-900 flex flex-col items-center p-6):
  Device toggle (mb-4): [Android] [iOS] [Web] — pill selector
  
  Device frame:
    Outer: slate-700 rounded-[32px] border-4, 270×580px
    Screen: white rounded-[28px] overflow-hidden
    Hot-reload indicator: spinning indigo dot top-right of frame
  
  Trust strip (fixed to bottom of device):
    32px height bg-slate-900/90 backdrop-blur
    flex gap-3 px-3 items-center
    Trust markers: ● ◐ ○ with labels
  
  Action bar (mt-6 flex gap-2):
    [Try dark mode] [Smaller screen] [Undo] buttons
    bg-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs
    
    "Ship it →" button:
    bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-semibold
    ArrowRight icon

REHEARSAL MODE (triggered before first ship):
  Overlay on device panel: bg-slate-950/90
  Title: "Rehearsal" 16px white semibold
  5 scenario rows:
    Each: flex items-center gap-3
      State: spinning (running) | ✓ emerald | ✗ red
      Name: 13px slate-300
      Screenshot: 60×40px thumbnail on complete
  "1 item to review" link if any warnings
```

---

## SCREEN 8 — BUD BOARD (Skill Constellation)

**Emotional intent:** Self-portrait. Looking at your professional universe. Reflective, not operational.

```
Full-screen view, accessed from sidebar.

Background: bg-slate-950 (dark — this is the identity surface)

Header (p-6 pb-4):
  "YOUR CAPABILITIES" 12px slate-400 uppercase
  Name + persona: "Vagisha · Designer" 20px white semibold mt-1

CONSTELLATION CANVAS (flex-1):
  SVG/Canvas layer for arcs and connections
  Position: absolute, fills the space

  ZONE 1 — YOUR WORK TODAY (upper area):
    Label: "Your work today" 11px slate-400 uppercase (at zone top)
    
    Current buds (3-across, centered):
      Each bud card (flex-col items-center gap-2):
        Orb: [see Bud Orb component, appropriate state]
        Name: 13px slate-300 semibold
        Status: 11px slate-500 (e.g. "● Active · 3× this week")
        Last used: 11px slate-600

  ZONE DIVIDER:
    Subtle gradient: from transparent to slate-800/50 to transparent
    Width: full, height 1px, mt-8 mb-8

  ZONE 2 — YOUR NEW RANGE (lower area):
    Label: "Your new range" 11px slate-400 uppercase
    
    New cap buds (3-across, centered):
      Orb: Seed state (see Bud Orb)
      Progress bar (mt-2): h-1 rounded-full bg-slate-700
        Fill: bud color, % based on unlock progress
      Unlock text: "3 handoffs away" 11px slate-500

  LOOP ARCS (SVG, absolute positioned):
    Between connected buds: animated dashed path
    stroke-dasharray + stroke-dashoffset animation (flow effect)
    Color: source bud color, 40% opacity
    Hover: tooltip "Your 12 reviews trained this bud"

BUD DETAIL PANEL (slides up on tap, 400ms spring):
  Position: fixed bottom-0, full width, max-h-[70vh]
  bg-slate-950 rounded-t-3xl border-t border-slate-800 p-6

  Drag handle: w-8 h-1 rounded-full bg-slate-700 mx-auto mb-4

  Bud orb: 80px, centered, full state with glow
  Name: 22px white semibold mt-3
  Status: colored badge

  Section "What this bud does for you": 3 bullet points, 13px slate-300
  Section "Recent activity": timeline (5 items), 12px slate-400
  Section "How to unlock" (new buds only):
    Progress bar with specific checkmarks:
      ✓ or ○ + condition text + completion state
  Section "What becomes possible":
    1 paragraph, 13px indigo-200, italic
    "Once this bud is active, you ship components to production yourself."
```

---

## SCREEN 9 — RELEASE AI ASSISTANT

**Emotional intent:** Confidence through evidence. Every answer is backed by a trace. Nothing is opinion.

```
LAYOUT: 2-panel (chat left, evidence right)

CHAT PANEL (560px):
  Header: PR title + bud icon + trust confidence score
    "94% of claims in this release are trace-verified" 12px emerald-600

  Pre-answered questions (collapsible, mb-4):
    bg-slate-50 rounded-xl p-4 border border-slate-200
    "Artisan pre-answered the likely questions:"
    5 rows: ● icon + question + "Yes, [trace]" + "[see →]"
    Items: verified = emerald dot, inferred = amber dot

  Conversation thread:
    AI messages: left-aligned, bg-slate-50 rounded-xl p-4 max-w-[85%]
      Text + inline evidence previews (screenshot/code/voice)
      Confidence: small ● or ◐ before message
    User messages: right-aligned, bg-indigo-600 text-white rounded-xl p-3

  Inline evidence preview:
    Screenshot: 240×160px rounded-lg inline mt-2
    Code: dark bg rounded-lg p-2 mt-2, 6-line max
    Voice: flex gap-2 items-center, waveform + transcript
    Each: "[Expand →]" link

  Input (fixed bottom of panel):
    "Ask about this release..." placeholder
    Send button: indigo-600 rounded-lg

EVIDENCE PANEL (auto-updates, flex-1):
  Tabs: [Screenshots] [Video] [Code] [Tests] [Decisions]
  bg-slate-950 text-white

  Large evidence view:
    Screenshot: full width, rounded-xl
    Video: player with timeline scrubber
      Timestamps linked from AI responses seek here
    Code diff: full diff with line numbers
    Test matrix: 5 rows × devices, pass/fail chips

  Timeline scrubber (bottom):
    Full session timeline, seekable
    Markers at each significant trace
    Hover: tooltip with trace type + timestamp
```

---

## SCREEN 10 — D90 ASSESSMENT + GRADUATION

**THE D90 ASSESSMENT:**
```
Full-screen. bg-white. Max-w-640 mx-auto pt-16.

Header:
  "90-Day Assessment" 12px indigo-500 uppercase tracking-wide
  "Vagisha — May 23, 2026" 26px slate-900 semibold mt-1
  "Here's where you are. Here's the honest decision." 14px slate-500 mt-2

Assessment table (mt-8):
  rounded-2xl border border-slate-200 overflow-hidden
  
  Header row: bg-slate-50 text-slate-500 uppercase 11px
    [Bud] [IS Now] [Target] [Gap] [Verdict]
  
  Data rows (p-4, border-b border-slate-100):
    Bud name + colored dot
    IS bar: h-1.5 rounded-full bg-slate-200 with colored fill, % width
    Target: 0.80
    Gap: colored (green if ✓, amber if close, red if far)
    Verdict: "Graduated ✓" | "2 weeks" | "12+ months"

Honest recommendation block (mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200):
  Recommendation text: 14px slate-700 leading-relaxed
  Math section (bg-white rounded-xl p-4 mt-4 border border-slate-200):
    Ship Bud math:
    "Your hourly value: ₹2,500/hr"
    "Hours to reach IS 0.80: ~380 hrs"
    "Opportunity cost: ₹9,50,000"
    "This isn't laziness. This is math."
    12px slate-500

Actions (mt-6 flex gap-3):
  "Accept recommendation" — primary button
  "See full math" — outline button
  "Decide myself" — ghost button
```

**THE GRADUATION MOMENT:**
```
Full-screen takeover. bg-slate-950.
Centered content. No container/card.

Bud orb: 80px, full glow, Mastered state (with orbiting dots)

"You don't need us for this anymore."
  28px / 600 / white / mt-6

Body (mt-4, max-w-sm text-center):
  "You ran 47 design reviews over 10 weeks.
   Your last 5 matched Artisan quality at 91%.
   You catch WCAG issues, spacing, hierarchy.
   You are the reviewer now."
  14px slate-400 leading-relaxed

Spacer

"We're removing ourselves from your review flow.
 You won't see Artisan suggestions on reviews
 unless you ask."
  13px slate-500 mt-4

"This is what we were built to do."
  14px indigo-300 italic mt-2

CTA (mt-8):
  "Continue without us →"
  bg-white text-indigo-700 rounded-xl px-8 h-12 font-semibold

Fine print (mt-4): "Settings to re-enable at any time." 11px slate-600
```

---

## MOTION SYSTEM

```
NAMED TRANSITIONS

scan-reveal:
  Tool tag appears: opacity 0→1 + translateY(-4px)→0, 200ms ease-out
  Stagger: 150ms between each tool

persona-inference:
  Chip slides: translateY(8px)→0 + opacity 0→1, 400ms spring
  Spring: cubic-bezier(0.34, 1.56, 0.64, 1)

question-advance:
  Current Q: translateX(0)→translateX(-48px) + opacity 0, 250ms ease-in
  Next Q: translateX(48px)→translateX(0) + opacity 1, 280ms ease-out
  Gap: 30ms

genie-overlay-in:
  backdrop-filter: blur(0px)→blur(8px), 300ms linear
  Content: opacity 0→1 + scale 0.96→1.0, 400ms ease-out

genie-phase-transition:
  Phase 1 out: opacity 1→0 + scale 1.0→0.94, 300ms ease-in
  Phase 2 in: opacity 0→1 + translateY(8px)→0, 400ms ease-out

genie-source-stagger:
  Each row: opacity 0→1 + translateX(-6px)→0, 200ms ease-out
  Stagger: 180ms

genie-to-stage3:
  White flash: bg-white opacity 0→1, 200ms ease-in
  Fade to Stage 3: opacity 1→0 (white) + Stage 3 fade in, 500ms

hero-card-mount:
  translateY(-12px)→0 + opacity 0→1, 500ms ease-out
  Stat count-up: 0→value, 600ms ease-out (requestAnimationFrame)

bud-active-pulse:
  scale: 1.0→1.04→1.0, 3s ease-in-out, infinite

bud-seed-shimmer:
  linear-gradient sweep: 0%→100% offset, 6s linear, infinite
  Gradient: transparent→white(15%)→transparent

bud-formation (compound):
  Source orbs: translateX/Y toward center, 1500ms ease-in-out
  Flash at merge: bg-white opacity 0→0.6→0, 200ms
  New orb expand: scale 0→1 + opacity 0→1, 800ms ease-out
  Particle burst: 8 dots expand outward, fade, 600ms

loop-arc-flow:
  stroke-dashoffset: animated continuously, 3s linear, infinite
  Direction: source→target

now-watching-first-appear:
  translateY(52px)→0, spring 400ms cubic-bezier(0.34,1.56,0.64,1)

now-watching-expand:
  height: 52px→280px, 400ms spring

voice-processing:
  Waveform bars: random height 30–100%, stagger 50ms, continuous
  Code diff highlight: bg-yellow-900/30 fade in, 300ms
  Emulator hot-reload dot: spin while loading, disappear on complete

milestone-card-appear:
  translateY(20px)→0 + opacity 0→1, 500ms ease-out
  Persists at top of feed

graduation-takeover:
  Slide up full screen: translateY(100%)→0, 500ms spring
```

---

## CONNECTIVE LAYER — RULES

These rules make Artisan feel like one continuous relationship, not separate screens.

```
1. NOW WATCHING BAR
   - First appears at end of Stage 3 (with spring animation)
   - Never disappears after that
   - Always shows something: never empty
   - Reflects the active bud and current monitoring context
   - "👁 Review Bud active · Design crit in 2h" not generic text

2. CONTEXT THREAD
   - Hero card from Stage 3 = first card in workspace Day 1 feed
   - Tool names from scan appear as tags on every card, forever
   - Interview answers are quoted in card copy ("You mentioned X...")
   - Persona chip visible in all screens after onboarding

3. BUD THREAD
   - Small bud icon (16px orb, color-coded) appears top-right of every card
   - Tap goes to bud detail
   - Bud in Now Watching bar = the most active bud

4. BELIEF THREAD
   - B3 milestone card: "First time you used an Artisan output without editing it."
   - B4 milestone card: "You initiated a workflow before Artisan suggested it."
   - B5 milestone card: compound bud formation screen
   - Each persists in feed as evidence of progression

5. TRUST THREAD
   - Trust markers never disappear — on every card, every output
   - Confidence level shown on Release AI Assistant answers
   - Trace citations in every AI response
   - The "verified" dot is always emerald. Always.
```

---

## DESIGN GUARDRAILS

```
1. Never show a number without its consequence.
   Bad:  "RS: 0.44"
   Good: "You delegated 4 tasks this week ↑"

2. Never use "More capabilities" as a section label.
   Bad:  "More capabilities"
   Good: "Because you're on a sprint deadline"

3. Never show a card without a trust marker.
   Every card. Every output. No exceptions.

4. Never hard-cut between onboarding and workspace.
   The hero card from Stage 3 must be in the workspace feed.

5. The Now Watching bar is never empty.
   "Watching your inbox for action items" is acceptable.
   Blank is not.

6. Trust markers must be visually distinct by type.
   ● verified / ◐ inferred / ○ suggested — always in this form.

7. The graduation screen has no animation beyond the orb.
   No confetti. No "Congratulations!" in exclamation.
   One pulse on the metric card. That's it.

8. New bud discovery whisper cards are non-blocking.
   They slide up 48px at the bottom. Auto-dismiss in 8 seconds.
   Never a modal. Never a notification dot.

9. The D90 assessment shows math, not feelings.
   "380 hours. ₹9,50,000 opportunity cost."
   Not "This is a complex skill to develop."

10. Artisan's voice is lowercase in informal contexts.
    UI labels: uppercase tracking-wide (section headers)
    Artisan speaking: sentence case, no exclamation marks
    Trust markers: all lowercase
```

---

## SCREEN 11 — CAPABILITY GAP ASSESSMENT

```
Purpose: Shown when a user taps into a bud and considers Track A (coaching).
Displayed before any purchase decision. This is the honest math screen.
Artisan must show the gap before the user commits.

Layout: Single-column, max-width 640px, centred

─────────────────────────────────────────────────
HEADER (40px top padding)

  [← Back to Buds]                               
  
  "Can you match us?"                             ← 32px semibold, slate-900
  Capability: Ship Mode — UI to Production        ← 14px slate-500
  
─────────────────────────────────────────────────
GAP ASSESSMENT CARD (white, shadow-lg, rounded-2xl, p-8)

  Artisan's current quality on this bud:          ← 12px label, slate-500, tracking-wide uppercase
  ████████████████████ 94%                        ← progress bar, indigo-600, 8px height
  
  Your observed quality (from bud history):       ← 12px label, slate-500, tracking-wide uppercase
  ████████░░░░░░░░░░░░ 38%                        ← progress bar, amber-500, 8px height
  
  Gap to close: 56 percentage points             ← 16px, slate-700

  ─────────────────── divider ───────────────────

  HOURS TO CLOSE THE GAP                         ← 12px label, slate-500, uppercase
  
  Observed practice needed:       180 hrs
  Assisted practice needed:       120 hrs
  Independent practice needed:     80 hrs
  ─────────────────────────────────────
  Total learning investment:      380 hrs         ← 18px semibold, slate-900
  
  At 10 hrs/week:                 38 weeks        ← 14px, slate-600
  At 20 hrs/week:                 19 weeks        ← 14px, slate-600

─────────────────────────────────────────────────
OPPORTUNITY COST BLOCK (bg-amber-50, border-l-4 border-amber-400, rounded-xl, p-6)

  "The honest math"                               ← 14px semibold, amber-800
  
  Your billing rate (from context):  ₹2,500 / hr  ← 13px, amber-700
  Hours to invest:                   380 hrs
  Opportunity cost:                  ₹9,50,000     ← 20px semibold, amber-900
  
  Artisan SaaS for 38 weeks:         ₹76,000       ← 13px, amber-700
  
  The math favours Track B by:       ₹8,74,000     ← 16px semibold, amber-900

─────────────────────────────────────────────────
ARTISAN RECOMMENDATION (bg-slate-900, rounded-2xl, p-6, mt-6)

  ● verified · Source: bud history + billing context  ← 11px, slate-400
  
  "Track B is the rational economic choice."          ← 18px semibold, white
  
  "380 hours of learning costs you ₹9,50,000 in
  opportunity. Track B costs ₹76,000 over the
  same period. Unless your goal is independence
  beyond this role, staying is smarter."
                                                      ← 14px, slate-300, leading-relaxed
  
  "If independence is the goal regardless of cost,
  Track A is available. We'll show you the exact
  curriculum before you begin."
                                                      ← 14px, slate-400, leading-relaxed

─────────────────────────────────────────────────
CTA ROW (mt-8, flex gap-3, justify-end)

  [View Track A curriculum →]   ← ghost button, slate-600
  [Stay on Track B]             ← filled, indigo-600

─────────────────────────────────────────────────
FOOTNOTE

  "Numbers calculated from your bud history and
  calendar context. Source: observed sessions · verified"
                                                    ← 11px, slate-400, text-centre
```

---

## SCREEN 12 — TRACK SELECTION (TWO CONTRACTS)

```
Purpose: After the user has seen the gap assessment, they choose their track.
This is a contract screen, not a pricing page. Two honest offers, no dark patterns.

Layout: Split panel, full viewport, 2×50% columns on desktop / stacked on mobile

─────────────────────────────────────────────────
HEADER (centred, above both panels)

  "Two ways to work with Artisan."                ← 28px semibold, slate-900
  "Both are honest. Both generate results. 
   Your call."                                    ← 15px, slate-500, mt-1

─────────────────────────────────────────────────
LEFT PANEL — TRACK A (bg-white, border border-slate-200, rounded-2xl, p-8)

  [COACHING]                                      ← 11px chip, bg-violet-100, text-violet-700
  
  "Graduate from us."                             ← 24px semibold, slate-900
  
  "You want to own this skill. We teach you the
  exact moves. At IS ≥ 0.80, you graduate.
  You can cancel. We celebrate."                  ← 14px, slate-500, leading-relaxed
  
  ─── What's included ───────────────────────────
  
  ✓ Observed practice sessions (guided)           ← 13px, slate-700, gap-2.5 list
  ✓ Assisted practice with feedback
  ✓ Independent practice + calibration
  ✓ Graduation test (IS benchmark)
  ✓ IS dashboard per bud, updated weekly
  ✓ Exit any time — no lock-in
  
  ─── Timeline ──────────────────────────────────
  
  Ship Bud:    38 weeks @ 10 hrs/week             ← 13px, slate-600
  Review Bud:  12 weeks @ 10 hrs/week
  Predict Bud: 16 weeks @ 10 hrs/week
  
  ─── Price ─────────────────────────────────────
  
  ₹8,999 / month                                  ← 22px semibold, slate-900
  Fixed. No usage billing.                        ← 12px, slate-500
  
  [Start Track A →]                               ← full-width button, violet-600

RIGHT PANEL — TRACK B (bg-slate-950, rounded-2xl, p-8)

  [RELIANCE]                                      ← 11px chip, bg-indigo-900, text-indigo-300
  
  "Own us."                                       ← 24px semibold, white
  
  "You delegated the decision. New capabilities
  exist that didn't before. The RS keeps climbing.
  The math said staying was smarter. You agreed." ← 14px, slate-400, leading-relaxed
  
  ─── What's included ───────────────────────────
  
  ✓ All buds, active immediately                  ← 13px, slate-300, gap-2.5 list
  ✓ Proactive surface — Artisan initiates
  ✓ Full trace + Release AI Assistant
  ✓ RS + IS tracking (honest mirror)
  ✓ D90 honest assessment (with coaching offer)
  ✓ Coaching track always available
  
  ─── Current RS impact ─────────────────────────
  
  "You delegated 8 features this month."          ← 13px, slate-400
  "Artisan caught 4 things before you did."       ← 13px, slate-400
  "Last Tuesday: shipped something impossible
   in April."                                     ← 13px, slate-400
  
  ─── Price ─────────────────────────────────────
  
  ₹5,999 / month                                  ← 22px semibold, white
  Per seat. Billed monthly.                       ← 12px, slate-500
  
  [Stay on Track B →]                             ← full-width button, indigo-600

─────────────────────────────────────────────────
FOOTER (centred, below both panels, mt-6)

  "You can switch tracks at any time. There is no
  right answer. The Reliance Score measures outcomes,
  not loyalty."                                   ← 12px, slate-400, italic, text-centre
```

---

## SCREEN 13 — COACHING CURRICULUM VIEW (PER BUD)

```
Purpose: Shown after Track A selection, or accessible from bud detail.
Shows the exact 10-week curriculum for a specific bud. No promises, just the map.

Context header (matches bud colour — violet for Review, teal for Ship, etc.)

─────────────────────────────────────────────────
BUD IDENTITY ROW (p-6 bg-bud-colour/10)

  ◎ Ship Mode                                     ← 24px semibold, slate-900
  UI to Production · New Bud                      ← 13px, slate-500
  
  Your IS: 38%   Target: 80%   Gap: 42pp          ← 3 pills, 12px, spaced evenly

─────────────────────────────────────────────────
CURRICULUM TIMELINE (vertical, numbered weeks)

  Each week row:
    Week number    Phase label       Status
    ─────────────────────────────────────────────
    1–2            Observe           [Active]       ← 14px semibold, status chip
    3–4            Observe           [Upcoming]
    5–6            Assisted          [Upcoming]
    7–8            Independent       [Upcoming]
    9–10           Graduation Test   [Upcoming]

  Active row: bg-indigo-50, border-l-4 border-indigo-500, rounded-r-xl
  Upcoming row: bg-white, border-l-4 border-slate-200, rounded-r-xl
  Completed row: bg-emerald-50, border-l-4 border-emerald-400, rounded-r-xl
  
  Each row expanded (tapped): shows
    - What you do this week (2–3 sentences)
    - What Artisan does
    - How IS is measured this week
    - Session count target
    - Estimated hours

─────────────────────────────────────────────────
CURRENT WEEK DETAIL (shown inline, always visible)

  Week 1–2 · Observe                              ← 16px semibold, slate-900
  
  "Watch how Artisan handles 5 Ship Mode tasks.
  Your job: approve or reject. No prompting needed.
  IS is measured by how often your approval matches
  Artisan's confidence score."                    ← 14px, slate-600, leading-relaxed
  
  Sessions this week: 3 of 4 complete             ← progress, emerald
  Hours logged: 6 of 8 hrs                        ← progress, indigo
  IS this week: 41% → 44%                         ← small delta chip, emerald
  
  [Start session 4 →]                             ← indigo button

─────────────────────────────────────────────────
IS TREND CHART (below curriculum)

  Line chart, 10 weeks on X-axis
  Y-axis: 0%–100% IS
  Dashed line at 80% (graduation threshold)
  Solid line: actual IS trend
  Projected line (dashed, lighter): if pace maintained
  Annotation at intersection: "Projected graduation: Week 9"

─────────────────────────────────────────────────
COACHING NOTE (bottom, bg-slate-50, rounded-xl, p-5)

  "If your IS reaches 80% before Week 9, you graduate
  early. If it stalls, Artisan adjusts the curriculum.
  You will not be told you're behind. You will be
  shown what to practice."                        ← 13px, slate-500, italic
```

---

## SCREEN 14 — IS SCORE IN WORKSPACE (SIDEBAR + BUD DETAIL)

```
Purpose: The Independence Score must be visible alongside the Reliance Score
in the workspace, without dominating. It is the honest mirror.

─────────────────────────────────────────────────
WORKSPACE SIDEBAR — SCORE BLOCK (at top of left rail)

  Two scores, side by side, equal visual weight:

  ┌──────────────────┬──────────────────┐
  │   Reliance       │   Independence   │
  │      0.62        │      0.44        │ ← 28px semibold, slate-900
  │   RS · today     │   IS · avg buds  │ ← 11px, slate-400
  └──────────────────┴──────────────────┘

  Below the pair, one consequence line (not both scores):
  "You delegated 8 features this month."          ← 13px, slate-600
  This alternates weekly between RS and IS consequences.
  
  Not shown:
    — Progress bars on these numbers
    — Delta arrows (only in weekly digest)
    — Raw formula breakdown
    
  Shown only in D90 / coaching view:
    — Breakdown by dimension
    — Component weights
    — Historical trend

─────────────────────────────────────────────────
BUD DETAIL PANEL — IS CHIP (per bud)

  Each bud in bud board has its IS chip:
  
  ◎ Review Bud          [Active]
  IS: 67%  ↑ 4pp this week                       ← small chip, emerald-600
  
  On tap → expands to per-bud IS breakdown:
    Observed quality:    71%
    Unaided attempts:    63%
    Calibration match:   68%
    ─────────────────────────────────────
    IS this week:        67%  ↑ from 63%
    Target to graduate:  80%
    At current pace:     +6 weeks
  
  [View coaching track →]                         ← ghost button, 12px

─────────────────────────────────────────────────
WEEKLY DIGEST — IS MENTION (in Now Watching / digest card)

  "Your IS on Review Bud reached 67% — up 4 points
  this week. 13 points from graduation."          ← 13px, slate-700
  Source: bud sessions · verified   ●             ← 11px trust marker
  
  This card does not appear every week.
  It appears when IS changes by ≥ 3pp in either direction.
  Regression surfaces more urgently:
  "Your IS on Ship Bud dropped 5pp this week."   ← amber-700
```

---

## SCREEN 15 — RELEASE INTELLIGENCE SYSTEM

```
Concept: Every decision made during Ship Mode is recorded as a trace.
Traces power a Release AI Assistant that answers any QA, EM, or PM question
with evidence, not opinion. The goal: zero-question releases.
PRs that explain themselves before anyone has to ask.

─────────────────────────────────────────────────
TRACE VIEWER — LAYOUT (2-panel, accessed from PR body or Artisan workspace)

  Left panel:  560px · Chat thread
  Right panel: auto · Evidence viewer (updates on every AI response)
  
─────────────────────────────────────────────────
LEFT PANEL — CHAT

  Thread of questions + AI answers, scrollable.
  Each AI response:
    Answer text (slate-900, 14px, leading-relaxed)
    
    Inline evidence previews (directly below the paragraph):
    
      Screenshot preview:
        240×160px · rounded-xl · shadow-sm
        Caption: "Pixel 7 · Portrait · Post-ship"  ← 11px, slate-400
      
      Video clip preview:
        Thumbnail (240×135px) + duration chip + ▶ play button overlay
        Tapping plays inline, expands right panel to video tab
      
      Code diff preview:
        Dark background · rounded-xl · 6 lines max · line numbers
        Line additions: emerald-800 bg · deletions: red-900 bg
        "View full diff →" if truncated
      
      Voice quote preview:
        Audio waveform (small, 200px wide, indigo bars)
        Transcript excerpt below, italic, slate-600
        Timestamp chip: "3:47 into session"
      
      Test result preview:
        Pass/fail chip (emerald/red) + scenario name
        "Scenario 2: Pixel 7 portrait — PASS"
    
    Confidence indicator below each answer:
      ● verified  — trace evidence exists, direct match
      ◐ inferred  — derived from trace context, no direct cite
    
    Expand button: "View full evidence →" → opens right panel to that trace

─────────────────────────────────────────────────
LEFT PANEL — PROACTIVE SECTION (top of chat, pre-loaded before first question)

  Header:
    "Artisan has pre-answered the most likely questions:"  ← 13px, slate-500, italic

  Pre-answer rows (accordion, closed by default, expandable):
  
    ● Was this tested on iOS?          → Yes. Scenario 2.    [see →]
    ● Does it match design system?     → Yes. 0 overrides.  [see →]
    ● What's the rollout risk?         → 🟢 Low. Flagged.    [see →]
    ● What changed visually?           → Before/after.       [see →]
    ● Who approved?                    → Vagisha, 14:47.     [see →]
    
    ● = verified trace evidence
    ◐ = inferred from context
    
    Each row on expand: shows inline evidence preview (same format as answers)
    [see →] taps to right panel for full evidence

─────────────────────────────────────────────────
RIGHT PANEL — EVIDENCE VIEWER

  Tabs (sticky at top):
    [Screenshots]  [Video]  [Code]  [Tests]  [Decisions]
  
  Default view: large render of the most recently cited evidence
  
  Screenshots tab:
    Grid: 2-column, each card clickable to full-screen
    Each: device label + timestamp + context note
    State indicator chip: before-ship / post-ship / emulator
  
  Video tab:
    Full-width player (16:9)
    Timeline scrubber with trace annotations (tappable markers)
    AI links to exact timestamps — "Jump to 3:47" clickable in chat
    Caption track: AI-generated transcript, synced
  
  Code tab:
    Full diff viewer: side-by-side or unified toggle
    Line-level annotations where AI made decisions (hover to see rationale)
    Confidence dots at file level: ● / ◐
  
  Tests tab:
    All 5 rehearsal scenarios listed
    Pass/fail per scenario, per device
    Tap to see screenshot + log for any scenario
  
  Decisions tab:
    Chronological log of every decision point
    Each: timestamp · what Artisan decided · why · confidence
    Voice commands that triggered decisions: inline playable clips
  
  Timeline scrubber (bottom of panel, persistent):
    Full session duration
    Colour-coded markers: voice commands (indigo), code changes (emerald),
    screenshots (amber), approvals (white)
    Seek to any point; evidence panel updates to match

─────────────────────────────────────────────────
REPORT TABS VIEW (within Release view, above chat panel)

  Tab bar:
    [QA Report]  [Eng Report]  [Frontend]  [Backend]  [PM Brief]
  
  Each report tab:
  
    Report confidence header:
      "94% of claims in this report are trace-verified."  ← 13px, slate-500
      Confidence bar (thin, indigo-600, full-width below header)
    
    Report body:
      Generated from traces, structured prose
      Every claim has an inline trace citation: [→] 
      Tapping [→] opens that trace in the evidence panel
    
    Footer:
      [Download PDF]  ← PDF includes embedded screenshots, 
                         confidence annotations, trace citations

─────────────────────────────────────────────────
PROGRESS DASHBOARD (separate view, accessible from workspace)

  Metric cards (4 across top, each rounded-xl, shadow-sm):
  
    Card 1: PRs raised
      Total / by Artisan / by engineers
      3 stacked mini-bars showing split
    
    Card 2: Errors caught
      Rehearsal vs. production ratio
      "4 caught in rehearsal, 0 reached production"
    
    Card 3: QA questions auto-answered
      Large number: "84%"
      Subtext: "347 of 413 questions this month"
    
    Card 4: Zero-question releases
      Count + trend arrow
      "3 this month ↑ from 1"
      Milestone annotation if first one: "First: May 23."

  Confidence trend chart (below cards):
    Line chart, 4 weeks on X-axis
    Y-axis: % QA questions auto-answered (0–100)
    Goal line: 90% (dashed, indigo-400, labelled)
    Annotation pinned at milestones:
      "First zero-question release" with date dot
  
  Release velocity chart:
    Bar chart: X = week, Y = releases + avg days to merge
    Bar fill colour by risk level:
      🟢 emerald-500 (low risk)
      🟡 amber-500   (medium)
      🔴 red-500     (high)
  
  Bud attribution table:
    Column: Bud name / releases / zero-Q releases / zero-Q rate
    Hover row: shows that bud's sparkline trend
    Sort by zero-Q rate descending (default)

─────────────────────────────────────────────────
MOTION + INTERACTION

  Trace cite in chat:
    Evidence panel slides to match cited evidence — 300ms ease-out
    Right panel tab switches with cross-fade — 150ms
  
  Video seek:
    Frame scrubs in real-time as handle drags
    AI timestamp links: panel seeks instantly on tap
  
  Pre-answered questions accordion:
    Expand: 200ms height animation, evidence preview fades in
    Evidence panel auto-updates to match hovered/open item
  
  New question asked:
    AI typing indicator: 3 dots animation, indigo
    Evidence panel updates BEFORE response text completes —
    user sees the evidence loading while the answer is composing
  
  Zero-question milestone:
    Dashboard card: single indigo pulse (box-shadow pulse, 600ms, once)
    No confetti. No pop-up.
    Annotation text appears: "First zero-question release. May 23."
  
  Confidence score animation:
    Runs in background as AI processes trace log
    Number increments from lower estimate to final — 800ms, eased
    Only plays once per session open

─────────────────────────────────────────────────
NON-NEGOTIABLES

1. Every AI answer cites a specific trace — never opinion.
   No answer without a [→] citation. No exceptions.

2. Confidence level shown on every answer.
   ● verified / ◐ inferred — always present, never hidden.

3. Video is seekable and AI links to exact timestamps.
   "Jump to 3:47" must work. Linking to full video is insufficient.

4. Pre-answered questions appear in PR body automatically.
   Zero human writing. Artisan generates before anyone asks.

5. Zero-question releases are counted and celebrated quietly.
   One pulse. A date. Nothing more.

6. Production traces close the loop back to the originating bud.
   24h/72h metrics (impressions, errors, engagement) feed back
   into the bud that shipped the feature. The bud learns.

7. The dashboard headline metric is always:
   "% of QA questions answered without a human."
   All other metrics are secondary. This is the company KPI.
```

---

---

## SCREEN 16 — FIX ABSTRACTION LAYER (UBIQUITOUS LANGUAGE)

```
Concept: When Artisan fixes a bug or modifies code, the PM never sees a raw diff.
Instead they see a flowchart in business language. The code is always available
behind a tap. When Artisan is stuck, an engineer can drop in with full context
already loaded — no reconstruction needed.

This is Eric Evans's Ubiquitous Language applied to AI output:
flowchart nodes ARE the code, named for the business domain.
Tap any node → you are in the code. Same thing, different zoom level.

─────────────────────────────────────────────────
LAYER 0 — FLOWCHART VIEW (PM default, always shown)

  Header:
    "Export breaks when rows > 5,000"         ← 20px semibold, slate-900
    Fixed · Row Limit Validation moved earlier ← 13px, emerald-600
    Source: ExportHandler.go · verified ●      ← 11px trust marker

  BEFORE / AFTER toggle (pill tabs, top-right of flowchart)

  Flowchart (DAG, top-to-bottom, centred):

    BEFORE state:
      [Export Request]
           ↓
      [Auth Check]              ✓ chip, emerald
           ↓
      [Fetch All Rows]          ✓ chip, emerald
           ↓
      [Row Limit Validation]    ✗ chip, red — node pulsing red border
           ↓ (greyed out, dashed line)
      [Generate CSV]            — unreachable

    AFTER state (switch toggle):
      [Export Request]
           ↓
      [Auth Check]              ✓ chip
           ↓
      [Row Limit Validation]    ✓ chip — moved node, glows emerald
           ↓
      [Fetch Rows (in limit)]   ✓ chip
           ↓
      [Generate CSV]            ✓ chip

    Node visual:
      rounded-2xl, white bg, shadow-sm, border border-slate-200
      120px wide, 44px tall, centred label — 13px semibold slate-900
      Status chip: top-right corner of node
      Tap indicator: subtle ↗ icon bottom-right — "tap to expand"

    Changed nodes:
      Highlight: indigo-50 bg, border-indigo-300
      Label: "Modified" chip — 10px, indigo-600

  Tap any node → inline expand below node (Layer 1)

─────────────────────────────────────────────────
LAYER 1 — ANNOTATED DIFF (tap "View code" on any node)

  Expands inline beneath the tapped node.
  Node gets a blue-left-border treatment to show it's open.

  Layout:
    Plain English description (above the diff):
      "Row Limit Validation now runs before rows are fetched.
       Previously, it checked the limit after the database call —
       meaning the expensive query still ran even if the export
       would be rejected."                        ← 13px, slate-600

    Code diff (dark bg, rounded-xl, max 20 lines):
      - func validateRowLimit(count int, tier string) error {   ← red-900 bg line
      + func validateRowLimit(req ExportRequest) error {        ← emerald-900 bg line
      +   if req.RowCount > tierLimits[req.UserTier] {
      +     return ErrRowLimitExceeded
            }

    Per-line annotation (hover/tap any line):
      Tooltip: "Previously passed raw count. Now passes full
      request so tier limits can be checked before the DB call."

    "View full file →" link if context > 20 lines

  Collapse: tap node again or tap [×]

─────────────────────────────────────────────────
LAYER 2 — ENGINEER HANDOFF (Artisan stuck / manual)

  Triggered automatically when Artisan has been on a fix > 10 min
  with no resolution. Also available always via [Needs human] button.
  
  Notification in Now Watching bar:
    ⚠  Artisan needs help — stuck on Export fix  [See context →]

  Full-screen handoff panel (bg-slate-950, text-white):

    TOP: What it's trying to fix
      "Export breaks when rows > 5,000"         ← 22px semibold, white
      ExportHandler.go · validateRowLimit()      ← 13px, slate-400

    APPROACHES TRIED (timeline, vertical):
      Approach A  Move validation before fetch
                  Result: ✓ fixed the break
                  But: TestExportWithPagination ✗ (now failing)

      Approach B  Add pagination fallback
                  Result: ✗ Conflict at ExportPaginator.go:L88
                  Reason: hardcoded row-order assumption

    WHERE IT'S STUCK (bg-amber-950, rounded-xl, p-5):
      "L88 has a hardcoded assumption about row order.
       Artisan cannot determine if row order is a contract
       or incidental without domain knowledge."
       
      "Question for engineer: Is row order guaranteed
       by the caller, or can ExportPaginator re-sort?"

    CONTEXT LOADED (pre-fetched, ready):
      ● ExportHandler.go         full file          [Open]
      ● ExportPaginator.go       L72–L103           [Open]
      ● TestExportWithPagination failing test        [Open]
      ● Code graph               4 callers mapped   [Open]

    CTA row:
      [Ask Artisan a question]    [Take over →]

    Take over: engineer claims the task. Artisan stays in
    context and answers questions. Session recorded as
    "human-assisted fix" in trace log.

─────────────────────────────────────────────────
PROGRESSIVE DISCLOSURE SUMMARY

  Layer 0  Flowchart          PM sees this. No code.
  Layer 1  Annotated diff     One tap. Code with plain English.
  Layer 2  Engineer handoff   Auto-triggered or manual. Full context.

  The abstraction is not a translation. It is a zoom level.
  The code is always there. The PM just doesn't need it by default.
```

---

## SCREEN 17 — LIVE QA AGENT

```
Concept: When Artisan applies a fix, a parallel QA agent spawns immediately
on the connected device or emulator. The PM watches it work in real-time.
They can ask it questions without pausing the run. They can inject test cases
mid-run. Trust comes from watching, not from reading a report.

─────────────────────────────────────────────────
LAYOUT — 2 PANEL (full viewport)

  Left panel (55%):   Device mirror — live emulator/phone screen
  Right panel (45%):  Agent activity feed + chat

─────────────────────────────────────────────────
LEFT PANEL — DEVICE MIRROR

  Full device frame (Pixel 7 or iPhone 15 silhouette)
  Content area: live screen of the emulator
  
  Overlay elements (non-blocking):
    Top-left chip:  "Pixel 7 · Android 14 · live"   ← 10px, white bg/70%
    Tap indicators: indigo ripple at each agent tap, 200ms
    
    Current action bar (bottom of device frame):
      "Tapping: Export button"                       ← 12px, white, bg-black/60%
      Updates in real-time with each agent action

  Device switcher (below frame, icon row):
    [Pixel 7 ●]  [iPhone 15]  [Tablet]  [+ Add device]
    Active device has indigo dot

─────────────────────────────────────────────────
RIGHT PANEL — AGENT ACTIVITY

  SCENARIO QUEUE (top 60% of panel):

    Header row:
      Running: Scenario 7 of 23                     ← 13px semibold, slate-700
      ✓ 6 passed  ● 1 running  ○ 5 queued  — 11 remaining
      
    Scenario list (scrollable):
      ✓ Scenario 1   Export 500 rows                emerald row, checkmark
      ✓ Scenario 2   Export 5,000 rows              emerald row
      ✓ Scenario 3   Empty export                   emerald row
      ✓ Scenario 4   Cancel mid-export              emerald row
      ✓ Scenario 5   Export with filters            emerald row
      ✓ Scenario 6   Auth token expired             emerald row
      ● Scenario 7   Export 10,000 rows             indigo row, pulse dot
      ○ Scenario 8   Timeout at 30s                 slate row, dimmed
      ○ Scenario 9   Special characters in field    slate row, dimmed
      ○ Scenario 10  Unicode field names [added]    slate row, dimmed + "added" chip
      
    Each scenario row:
      Left: status icon (✓ / ● / ○)
      Centre: scenario name
      Right: [screenshot] icon if completed — taps to open
      On hover (completed): preview thumbnail appears
      On tap (completed): opens screenshot/video in evidence panel

  CHAT (bottom 40% of panel):

    Thread, scrollable, newest at bottom:
      
      [PM]  14:23  did you test with unicode in field names?
      [QA]  14:23  Not yet. Adding as Scenario 10. Queued
                   after current run.
      [PM]  14:24  also test cancel mid-export
      [QA]  14:22  Already covered — Scenario 4. Passed.
                   [screenshot →]
      [PM]  14:25  what about timeout?
      [QA]  14:25  Scenario 8 is queued. Runs next.

    Input bar (bottom):
      [Ask the QA agent...]                [Send]
      "Add a test case or ask what's been covered"  ← placeholder subtext

─────────────────────────────────────────────────
BOTTOM STATUS BAR (full width, below both panels)

  ✓ 6 passed   ● 1 running   ○ 16 queued   ✗ 0 failed
  
  [Add scenario]   [Pause]   [Approve when complete]

  "Approve when complete": sets auto-merge if all pass with no failures.
  PM can walk away. Gets notified only if something fails.

─────────────────────────────────────────────────
NOW WATCHING BAR INTEGRATION

  While live QA runs in background:
  ● QA running · 7 of 23 · Export 10k    [Watch live →]
  
  On failure:
  ✗ QA failed · Scenario 12 · Timeout    [See failure →]  ← amber bar

─────────────────────────────────────────────────
QA TEAM JOIN FLOW

  QA engineer opens same session via shared link or workspace.
  They see identical live view.
  They can type in the same chat.
  Their questions are answered by the same agent.
  "Already covered" responses cite trace evidence directly.
  
  No handoff. No PDF. No Jira ticket. Same session.

─────────────────────────────────────────────────
TRUST MOMENT DESIGN

  The trust is not in the report. It is in the watching.
  
  PM experience:
    "I watched it tap Export on the device.
     I saw the row count hit 10,000 and it didn't break.
     I added two edge cases mid-run. Both passed.
     I approved the merge."
  
  This is the same trust as watching Apur test on his phone —
  except the QA agent ran 23 scenarios without anyone asking.

─────────────────────────────────────────────────
NON-NEGOTIABLES

1. The device mirror is live, not recorded.
   Trust comes from watching, not from believing.

2. Chat never pauses the agent.
   Questions answered inline. Queue updated without interruption.

3. "Already covered" cites the specific scenario and screenshot.
   Not "yes that was tested." → "Scenario 4. Passed. [screenshot →]"

4. Approve when complete is opt-in only.
   Never default. PM always makes the final call unless they set it.

5. Failed scenarios are never hidden.
   If Scenario 12 fails, it is the first thing visible. Red. Immediate.
   No softening. No "4 issues found" euphemism.
```

---

## SCREEN 18 — TASK INITIATION BRIEF + PLAYBOOKS

```
Concept: Before any task is delegated to Artisan, a 4-field brief is captured.
This brief becomes the task's trace header — cited in every QA question,
every report tab, every release. Recurring work becomes a Playbook: a frozen
brief that runs with one tap. The longer you use Artisan, the less you explain.

─────────────────────────────────────────────────
TASK INITIATION BRIEF — THE 4-FIELD FORM

  Triggered when PM taps [New task] or [Delegate to Artisan]
  
  Appears as a bottom sheet (not a modal, not a new page):
    slides up 60% of viewport, backdrop blur, dismissible

  Header:
    "What are we doing?"                          ← 18px semibold, slate-900
    4 fields. Artisan fills what it can from context.

  FIELD 1: What
    Label: "What are we doing?"
    Pre-filled if possible from context:
      "Fix export bug — rows > 5,000 cause crash"
    Editable single line, 16px, slate-900

  FIELD 2: Why
    Label: "Why does it matter?"
    Pre-filled if possible:
      "Sprint ends Friday. Meera is blocked."
    Editable single line

  FIELD 3: Where
    Label: "Where does it live?"
    Pre-filled from detected context:
      "Linear #EXP-441 · ExportHandler.go · Figma frame [link]"
    Multi-source chips: each source is a removable chip
    [+ Add source] for manual additions

  FIELD 4: Done when
    Label: "Done when?"
    Not pre-filled — always requires PM input:
      placeholder: "e.g. PR merged and passes emulator on Pixel 7"
    This becomes the QA pass condition.
    If left blank, Artisan asks before starting.

  Footer:
    [Start →]      [Save as Playbook]

─────────────────────────────────────────────────
PLAYBOOKS VIEW (accessible from workspace sidebar)

  What Playbooks are:
    Frozen task briefs for recurring work.
    One tap to run. Artisan fills the Where from current context.
    The brief is the Playbook — nothing else to configure.

  Layout: card grid (2 columns, 280px cards)

    Each Playbook card:
      Icon (auto-assigned from task type)
      Title: "Weekly sprint review"              ← 14px semibold
      Last run: "3 days ago"                     ← 12px, slate-400
      Run count: "Used 12 times"                 ← 12px, slate-400
      Status chip: [Active] / [Draft]
      
      [Run now →]   [Edit]   [···]
      
    Special card: [+ New Playbook]
      Dimmed, dashed border, centred + icon

  Playbook examples (seeded by persona):
    PM:       "Weekly sprint review", "Stakeholder status email",
              "Ticket triage from Linear backlog"
    Designer: "Design review against component library",
              "Ship approved frame to staging"
    Analyst:  "Weekly pipeline report", "Predict next week's numbers"

─────────────────────────────────────────────────
RESUME WITHOUT RE-EXPLAINING

  When a task is interrupted and resumed:

    Task card in workspace shows:
      [Export fix — Export 10k rows]
      Paused 2 hrs ago · QA at Scenario 7       ← 12px, slate-500
      [Resume →]

    Resume tap: re-opens exactly where left off.
      Live QA agent picks up from Scenario 7.
      Brief is loaded — no re-entry.
      Chat history intact.

    Now Watching bar while paused:
      ○ Paused · Export fix · Scenario 7 of 23   [Resume →]

─────────────────────────────────────────────────
BRIEF → TRACE HEADER CONNECTION

  Once a task brief is submitted, it becomes the trace header
  for everything that follows:

    Every QA question: "Context: Sprint ends Friday. Meera blocked."
    Every report tab header: shows the brief fields as metadata
    Release AI Assistant: references "Done when" as the pass condition
    Engineer handoff: brief is the first thing shown

  This is why "Done when" is required. It IS the QA pass condition.
  If it's blank, nothing else knows when to stop.

─────────────────────────────────────────────────
NON-NEGOTIABLES

1. "Done when" is never skipped.
   If PM leaves it blank, Artisan prompts before starting.
   "What does done look like? This is your QA pass condition."

2. Where is always pre-filled from context.
   Artisan reads Linear, Figma, Notion before showing the form.
   PM confirms, not enters.

3. Playbooks run from one tap.
   No configuration screen. The saved brief IS the Playbook.
   Artisan fills Where from current context at run time.

4. Resume is always available.
   No task is ever "lost." Paused state persists indefinitely.
   Now Watching bar shows paused tasks, not just active ones.

5. The brief is the contract.
   Every downstream artifact (trace, QA report, handoff) cites it.
   Changing the brief mid-task creates a new trace entry.
```

---

## CONNECTIVE THREADS — UPDATED (v1.2)

```
The following 7 threads connect all 18 screens into a single system:

THREAD 1 — THE NOW WATCHING BAR
  Persistent bottom bar. Present on every screen after onboarding.
  States: active task / QA running / paused / watching inbox / stuck
  Never empty. Taps into the relevant screen.

THREAD 2 — THE BELIEF ARC (B0 → B5)
  Screen 1: B0 — "AI can't do my real work"
  Screen 2: B1 — "It knows my tools"
  Screen 3/4: B2 — "It surfaced something I missed"
  Screen 5: B3 — "It drafted something I'd have written"
  Screen 7/16/17: B4 — "I review its work instead of doing it myself"
  Screen 10B/11: B5 — "I am a different professional now"

THREAD 3 — THE CONTEXT THREAD
  Every screen shows what Artisan knows.
  Scan → Interview → Brief → Trace → KB buckets → RS context score.
  Context compounds. It never resets.

THREAD 4 — THE BUD THREAD
  Every task connects to a bud.
  Bud grows through use.
  IS is measured per session.
  Compound buds emerge at mastery.

THREAD 5 — THE TRUST THREAD
  Trust markers on every card. ● / ◐ / ○ — always.
  Flowchart → Annotated diff → Engineer handoff.
  QA agent → Live device → Approved merge.
  Each layer adds evidence. Nothing is asserted without citation.

THREAD 6 — THE TRACE THREAD
  Every action generates a trace.
  Brief → Fix → QA run → Approval → Production metrics.
  Release AI Assistant answers any question from trace evidence.
  Zero-question releases are the KPI.

THREAD 7 — THE DUAL TRACK THREAD
  RS and IS are always visible (paired, equal weight).
  D90 shows honest math.
  Track A or B is always the user's choice.
  Graduation is celebrated quietly.
  Reliance is chosen, not imposed.
```

---

*Artisan Design Prompt v1.2 — June 2026*

**18 screens. 7 connective threads. One system.**

Feed this entire document to Claude Design. Build all screens as a connected system.
The Now Watching bar, the trust markers, and the belief arc must be consistent across every screen.
Do not design any screen in isolation.

**Screen index:**
```
01  First Launch                    09  Release AI Assistant
02  Scan (Recognition)              10  D90 Assessment + Graduation
03  Interview                       11  Capability Gap Assessment
04  Genie Moment                    12  Track Selection (Two Contracts)
05  Personalization                 13  Coaching Curriculum per Bud
06  Artisan Workspace               14  IS Score in Workspace
07  Ship Mode                       15  Release Intelligence System
08  Bud Board (Skill Constellation) 16  Fix Abstraction Layer (Ubiquitous Language)
                                    17  Live QA Agent
                                    18  Task Initiation Brief + Playbooks

PM CODE SHIPPING JOURNEY (Screens 19–30)
19  Feasibility Card                25  Live Build Feed + Decision Log
20  Requirements Discovery          26  Self-Correction Summary
21  Data Discovery                  27  PM Correction Loop (Emulator)
22  Spec Card                       28  Evidence Stack (Fear Cards)
23  Handoff Decision Point          29  Safety Net
24  Engineer Review Card            30  Ship Moment

POST-SHIP + ONGOING (Screens 31–40)
31  Deploy Confirmation + First User   36  Comparative Performance
32  24h Performance Report             37  Impact Attribution (14 days)
33  Error Alert + Rollback             38  PM Portfolio
34  Regression Detection               39  Stakeholder Card (shareable)
35  Dependency Health                  40  Learning Card

STAKEHOLDER TRUST VIEWS (Screens 41–46)
41  Engineering Manager View       44  Business Manager View
42  QA Manager View                45  Design Lead View
43  Developer View                 46  On-Call Engineer View
```

---

## THE PM CODE SHIPPING JOURNEY

```
Trust is built in sequence. You cannot skip rungs.

Rung 1  UNDERSTANDING    "I know what it's building"        → Screens 19–22
Rung 2  APPROACH         "I know how it's thinking"         → Screen 23–24
Rung 3  SIGHT            "I can see it working"             → Screens 25–27
Rung 4  EVIDENCE         "I have proof it works"            → Screen 28
Rung 5  SAFETY           "I know the exit if it breaks"     → Screen 29
Rung 6  OWNERSHIP        "I chose to ship this"             → Screen 30
```

---

## SCREEN 19 — FEASIBILITY CARD

```
Trigger: PM types or speaks a feature idea. Before the brief form.
Purpose: Artisan proves 60% already exists. Converts "1000 lines" fear
         into "180 new lines." Sets expectation before commitment.

Layout: Card, max-width 560px, centred, white bg, shadow-lg, rounded-2xl

─────────────────────────────────────────────────
HEADER
  "Can we build this?"                          ← 22px semibold, slate-900
  Expert Picks                                  ← 14px, slate-500

COMPLEXITY SIGNAL
  ████████████████░░░░  Level 2 of 5            ← bar + label
  "Similar to FeaturedBrands (March 14).
   Same pattern. Took 5 min. 0 regressions."   ← comparison to past build

WHAT'S ALREADY DONE
  ✓ Recommendations API   exists, stable (v2.3)
  ✓ Card component        in your design system
  ✓ WishlistButton        built, tested
  "Artisan is building on existing work.
   Not starting from scratch."

WHAT'S NEW
  · ExpertPicksStrip    ~180 lines (new component)
  · editorial_score     first time exposed to frontend
  Estimated new code:   ~180 lines of 1,040 total (17%)

RISK SIGNAL
  ◐ editorial_score never used in frontend
    "Low risk. Null-safe fallback will be added."

ESTIMATE
  Build time:      4–6 minutes
  Engineer needed: No (optional review available)

CTA ROW
  [Brief it →]    [I want engineer review from the start]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. "What's already done" always leads. Fear reduction before excitement.
2. Complexity is Level 1–5, not high/medium/low. Numbered = specific.
3. Past similar build is always cited when one exists. Familiarity = trust.
4. Estimated new lines shown. Not total lines. New lines only.
```

---

## SCREEN 20 — REQUIREMENTS DISCOVERY

```
Purpose: Artisan proves it understood most of it from context.
Asks only what it genuinely cannot determine. Max 3 questions.
Feels like: "smart colleague who read the brief before the meeting."

Layout: Single column, max-width 560px

─────────────────────────────────────────────────
HEADER
  "A few things I'm not sure about."            ← 20px semibold, slate-900
  "I've already pulled what I could from context." ← 13px, slate-500

WHAT I ALREADY KNOW (from context — shown first)
  ● Expert Picks goes on the home screen
    Source: Figma frame HP-07 · verified
  ● Using existing Recommendations API
    Source: Linear EXP-441 · verified
  ● Users can save picks to wishlist
    Source: PRD section 4.2 · inferred ◐

QUESTIONS (max 3, one at a time or all visible)

  Q1  "Who curates the 'expert' picks?"
      [Editorial team]  [Algorithm]  [Both]  [I'll decide]

  Q2  "What happens if there are no picks to show?"
      [Hide the section]  [Show placeholder]  [Your call]

FOOTER
  "These are the only things I need.
   Everything else I'll decide and tell you."   ← 12px, slate-400

─────────────────────────────────────────────────
NON-NEGOTIABLES
1. "What I already know" always appears before questions.
   Artisan demonstrates competence before asking for help.
2. Maximum 3 questions. If more are needed, Artisan makes
   a decision and flags it in the spec for PM to override.
3. "Your call" is always an option. PM can delegate any decision.
4. Each question is one tap — not open text. Faster, lower friction.
```

---

## SCREEN 21 — DATA DISCOVERY

```
Purpose: Artisan reads the Figma frame. Maps every visual element
to a data source. Surfaces unresolved ones before build starts.
This catches bugs before a line is written.

Layout: 2-panel. Left: annotated Figma. Right: data resolution panel.

─────────────────────────────────────────────────
LEFT PANEL (55%) — ANNOTATED FIGMA FRAME

  Figma frame rendered, read-only, full fidelity.
  Numbered dots on each data-bearing element:
    ①  Product image
    ②  Product title
    ③  Expert name
    ④  Expert score          ← amber dot: needs PM input
    ⑤  Save button state
    ⑥  "Trending" badge      ← red dot: doesn't exist

  Tapping a dot → highlights matching row in right panel

RIGHT PANEL (45%) — DATA RESOLUTION

  Header row:
    6 needed  ✓ 3 resolved  ⚑ 1 question  ✗ 1 missing  ◐ 1 inferred

  RESOLUTION ROWS (one per data point):

  ① Product image
     product_thumbnail_url · ProductAPI.getById()
     ● Used in 14 existing places — reusing
     "Zero extra API cost."

  ② Product title
     product_name · ProductAPI.getById()
     ● Same call as ①. No additional request.

  ③ Expert name
     editorial_author.display_name · CMS schema
     ◐ Inferred — never used in frontend before
     "Is this the right field?"
     [Yes]  [Different field]  [I'll check]

  ④ Expert score
     ⚑ NEEDS YOUR CALL — two candidates:
     recommendation_score  → powers Similar Items
     editorial_score       → in CMS, never exposed
     "These are different things. Which is expert score?"
     [recommendation_score]  [editorial_score]  [Both]

  ⑤ Save button state
     wishlist_item_ids[] · WishlistAPI.getUserItems()
     ● Already fetched on home screen — reusing same call
     ⚑ Dependency note: 2 other components use this endpoint
     [Reuse shared ← recommended]  [Separate call]

  ⑥ Trending badge
     ✗ DOESN'T EXIST in API or CMS
     "I see it in Figma. No data source found."
     [Omit from this build]
     [Stub it — backend creates later]
     [Define as: editorial_score > 85]

─────────────────────────────────────────────────
FOOTER (after all resolved)
  [Everything resolved → Continue to spec]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Every Figma element with data gets a dot. No unmapped elements.
2. The "DOESN'T EXIST" row is shown in red, never softened.
3. Dependency consequences shown for reuse decisions.
   "2 other components use this" = explicit, always.
4. PM can't proceed with unresolved ⚑ items.
   They must make a call or delegate ("your call") to Artisan.
```

---

## SCREEN 22 — SPEC CARD

```
Purpose: Artisan builds the spec from brief + discovery.
PM confirms before a single line is written.
Every line is editable. This is the cheapest correction moment.

Layout: Single column, card, scrollable

─────────────────────────────────────────────────
HEADER
  Expert Picks                                  ← 24px semibold
  "Confirm before I start. Every line is editable." ← 13px, slate-500

USER STORY (editable)
  "As a home screen visitor, I want to see expert-
   curated picks so I can discover high-quality
   products I'd trust."

ACCEPTANCE CRITERIA (numbered, each tappable to edit)
  1. Strip renders on home screen, position 3
  2. Loads in < 1.2s on 4G connection
  3. Shows editorial picks (from CMS) when available,
     algorithmic (recommendation_score) as fallback
  4. Each pick: image, title, expert name, save button
  5. Trending badge: editorial_score > 85 (Meera's call)
  6. Empty state: section hidden
  7. Passes on Pixel 7, iPhone 15, iPad

OUT OF SCOPE (explicit — Artisan generated)
  ✗ Existing product cards
  ✗ Checkout flow
  ✗ Login / auth
  ✗ Payment processing
  ✗ 31 other files [expand to see list]

OPEN DECISIONS ARTISAN WILL MAKE
  · Animation: will use existing fade-in from Hero section
  · Card width: will match ProductCard (168px)
  · Error handling: null-safe fallback on editorial_score
  "These are my defaults. Tap any to override."

DATA SOURCES (from Screen 21)
  product_name/image  → ProductAPI.getById()      ✓
  expert_name         → editorial_author (CMS)    ✓
  expert_score        → editorial_score           ✓
  save state          → WishlistAPI shared call   ✓
  trending            → score > 85 rule           ✓

CTA ROW
  [This is right — start building →]  [Change something]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. "Out of scope" list is always visible, never collapsed by default.
   The PM's regression fear is answered before build starts.
2. Every acceptance criterion is numbered. PM can say
   "change criterion 3" and Artisan knows exactly what.
3. Data sources shown in full — PM can see the data map they built.
4. "Start building" is blocked until all ⚑ data items are resolved.
```

---

## SCREEN 23 — HANDOFF DECISION POINT

```
Purpose: After spec is confirmed, PM chooses who owns the build.
This is a routing screen, not a settings screen. Three honest paths.

Layout: Three option cards, vertically stacked

─────────────────────────────────────────────────
HEADER
  "Ready to build. Who should own this?"        ← 20px semibold, slate-900
  Expert Picks · Level 2 · Est. 4–6 min         ← context strip

OPTION CARDS (tap to select, then Proceed)

  ┌─────────────────────────────────────────────┐
  │ ◉  Artisan builds                [selected] │
  │    I build it. You review. No engineer.     │
  │    Est. 4–6 min                             │
  └─────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────┐
  │ ○  Engineer reviews spec first, I build     │
  │    I send Apur the spec + approach.         │
  │    Build starts when he approves.           │
  │    Est. +30 min (depends on Apur)           │
  └─────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────┐
  │ ○  Engineer builds, I assist                │
  │    Full context handed to Apur.             │
  │    He builds. I answer questions + test.   │
  └─────────────────────────────────────────────┘

ARTISAN SIGNAL (only shown when confidence is high)
  "Artisan recommends: Artisan builds
   Confidence: High · No critical path touches
   Similar to FeaturedBrands build (March 14)"  ← 12px, slate-500

  [Proceed →]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. No default is pre-selected unless Artisan has high confidence.
   Low-confidence builds: no recommendation, PM chooses freely.
2. Time estimate shown for each path. Honest about engineer wait time.
3. Artisan's recommendation shown as signal, not pressure.
   PM can always choose a different path with zero friction.
```

---

## SCREEN 24 — ENGINEER REVIEW CARD

```
Purpose: What the engineer sees when PM asks for spec review.
Everything needed to make a decision, nothing extra.
Sent to engineer's workspace (or Slack integration).

Layout: Card, max-width 600px (designed for Slack/email embed too)

─────────────────────────────────────────────────
HEADER
  [ARTISAN → APUR]                    10:23 AM
  "Meera asked if you'd review this before build.
   No urgency — build waits until you respond."

FEATURE SUMMARY
  Feature:    Expert Picks
  What:       Horizontal strip on home screen,
              editorial + algorithmic picks, save to wishlist
  New files:  2 (ExpertPicksStrip, ExpertPicksCard)
  Modified:   1 (HomeScreen.tsx, +3 lines)
  New code:   ~280 lines estimated

APPROACH (flowchart, 4 nodes)
  [Home Screen] → [ExpertPicksStrip] → [ExpertPicksCard] → [WishlistButton]

DATA SOURCES CONFIRMED
  product data    → ProductAPI.getById()        ✓ Meera confirmed
  expert_name     → editorial_author (CMS)      ✓
  expert_score    → editorial_score             ✓ Meera chose this
  save state      → WishlistAPI.getUserItems()  ✓ shared call
  trending badge  → score > 85 rule             ✓ Meera's call

ARTISAN CONFIDENCE
  ████████████████░░░░ High
  "No critical path touches. Data confirmed.
   Approach matches existing scroll patterns."

KNOWN RISKS (honest)
  · editorial_score never exposed to frontend
    (Artisan will add null-safe fallback)
  · WishlistAPI shared — 2 other components affected

RESPONSE OPTIONS

  [✓ Looks good — build it]

  [Suggest a change]             ← opens inline comment on any line
  [Flag a concern]               ← routes back to PM + Artisan
  [I'll build this myself →]     ← engineer takes over

─────────────────────────────────────────────────
RESPONSE PATHS:

PATH A — "Looks good":
  Build starts. PM notified: "Apur approved. Building now."
  Trace entry: "Spec reviewed: Apur Sharma · Approved · 10:31 AM"

PATH B — "Suggest a change":
  Engineer comments inline. Artisan updates spec.
  PM sees delta (before/after, 2 lines). Confirms. Build starts.
  Trace entry: "Spec modified: Apur Sharma · change cited"

PATH C — "Flag a concern":
  Routes to PM + Artisan simultaneously. Three options shown.
  PM decides. Build proceeds or holds.
  Trace entry: "Concern flagged: Apur Sharma · PM decision logged"

PATH D — "I'll build this myself":
  Full context auto-loaded for engineer. Artisan moves to assist.
  PM sees: "Apur is building Expert Picks. Artisan is assisting."
  Every line attributed: engineer-written vs. Artisan-generated.
  Trace records who did what throughout.
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Build waits — clearly stated at top of card. No pressure to respond.
2. "Flag a concern" routes to PM, not just Artisan.
   Concerns are the PM's decision, not Artisan's.
3. In Path D: attribution is line-level.
   "Engineer wrote" vs. "Artisan generated" is always visible.
```

---

## SCREEN 25 — LIVE BUILD FEED + DECISION LOG

```
Purpose: While code is being generated, PM sees work happening —
in business language, not function names. Converts the black box
into a visible process. Watching competent work = trust.

Layout: Single column, live feed, newest entry at top

─────────────────────────────────────────────────
HEADER
  Building Expert Picks                         ← 20px semibold
  ████████████████░░░░ 71%    ~18 seconds left  ← progress bar

LIVE NUMBERS (update every few seconds)
  New lines written:    247    Reused: 741 (75%)
  Files touched:        3      Files untouched: 844
  Custom CSS:           0      Token overrides: 0

DECISION LOG (live feed, newest first)

  ◎ Trying approach B for scroll behaviour      ← IN PROGRESS, indigo pulse
    "Approach A conflicted with sticky header
     at scroll depth > 200px. Switching."
    [Why approach A failed →]                   ← expandable

  ✓ Empty state: section hidden                 ← DONE, emerald
    "Per spec. Matches your FeaturedBrands
     empty state pattern."

  ✓ Animation: fade-in, 200ms                  ← DONE
    "Reused from Hero section. No custom CSS."

  ✓ Card width: 168px                          ← DONE
    "Matched ProductCard. 0 token overrides."

  ⚑ editorial_score fallback added             ← DECISION, tappable
    "Null-safe. Falls back to recommendation_
     score when editorial_score is absent.
     Tested in Scenario 7."
    [Override this →]                           ← PM can redirect

WHAT I FIXED MYSELF                            ← collapsed, expandable
  3 self-corrections — tap to see
  [▸ Show]

─────────────────────────────────────────────────
DECISION ROW TYPES:
  ◎ IN PROGRESS  indigo pulse dot
  ✓ DONE         emerald check
  ⚑ DECISION     amber — PM can override, or ignore to accept default
  ✗ SELF-FIXED   shown in collapsed "What I fixed myself" section

NON-NEGOTIABLES
1. Business language only in the log. No function names, no file paths.
   File paths available behind "tap to expand" on every row.
2. ⚑ DECISION rows are not prompts — PM does not have to respond.
   Silence = acceptance. Tap = redirect.
3. Progress bar never jumps backward. If a self-correction
   adds time, the bar slows — it does not regress.
4. "What I fixed myself" is always present but never auto-expanded.
   The PM can choose to see it. It is never hidden permanently.
```

---

## SCREEN 26 — SELF-CORRECTION SUMMARY

```
Purpose: After build, before evidence stack. The most important
trust screen in the entire journey. Artisan shows everything
it caught and fixed without PM intervention.

This is the B4 belief moment: "I review its work
instead of doing it myself" — because it already reviewed itself.

Layout: Single column, dark surface card + light sub-cards

─────────────────────────────────────────────────
HEADER (bg-slate-900, rounded-2xl, p-6)
  "Here's what happened while you weren't looking." ← 22px semibold, white
  "Everything I caught and fixed before you saw it." ← 14px, slate-400

SELF-CORRECTIONS (3)

  Each row: emerald check + title + explanation
  ─────────────────────────────────────────────────
  ✓ Card title overflow at 32 characters
    "My first version truncated at 24. Caught it
     against the acceptance criteria. Fixed to 32."
    Source: spec criterion 4 · verified ●

  ✓ editorial_score → null on non-editorial products
    "The null-safe fallback wasn't triggering.
     Caught in my own test run. Fixed before QA."
    Source: Artisan test run · Scenario 7 · verified ●

  ✓ Approach A broke scroll at depth > 200px
    "Caught in emulator run before first render.
     Switched to Approach B. You saw Approach B."
    Source: emulator rehearsal · verified ●

DECISIONS I MADE FOR YOU (5) — collapsed by default
  [▸ Show 5 decisions]
  · Animation: fade-in 200ms  · Card width: 168px
  · Trending: score > 85      · Test coverage: 89%
  · Token compliance: 100%

YOUR CORRECTIONS (from emulator loop) (8)
  · Title: 16px → 14px
  · Expert name: default → slate-500
  · Card height: 220px → 248px
  [▸ Show 5 more]

  "These 8 corrections have been noted.
   The next similar build will need fewer."      ← 12px, slate-400, italic

CTA
  [See evidence →]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Self-corrections are NEVER framed as failures.
   Frame: "I checked my own work. I found 3 things. I fixed them."
   Not: "I made 3 mistakes."
2. Every self-correction cites its source (spec criterion, test run, emulator).
   Not assertion — evidence.
3. PM corrections are shown and acknowledged as taste data.
   "The next build will need fewer" closes the skill loop.
4. This screen cannot be skipped. It is the trust moment.
```

---

## SCREEN 27 — PM CORRECTION LOOP (EMULATOR)

```
Purpose: PM sees the first render and directs changes in real-time.
Each correction is a data point for the Ship Bud's taste model.
Trust is built by the speed and accuracy of each correction cycle.

Layout: Left: device emulator (live). Right: correction chat.

─────────────────────────────────────────────────
LEFT PANEL — DEVICE MIRROR (live, first render)
  Device frame: Pixel 7
  Live render of ExpertPicksStrip on home screen
  Tap indicators on any element → voice/type correction

RIGHT PANEL — CORRECTION THREAD

  Artisan: "First render ready. Pixel 7, portrait."
           [screenshot thumbnail]

  PM:      "The card title is too big."
  Artisan: "Changing 16px → 14px."
           [renders in 2.3s]
           "Done. Still readable at 3 cards visible." ← proactive check

  PM:      "Expert name should be grey."
  Artisan: "Using slate-500. Matches your
            author byline in BlogCard."
           [renders in 1.8s]

  PM:      "Cards feel a bit short."
  Artisan: "Going from 220px → 248px.
            Checking scroll behaviour..."
           [renders in 3.1s]
           "Height works. No clip on 3-card view."

  PM:      [40 seconds silence, scrolling]
  Artisan: [waits — no prompt, no "Are you happy?"]

  PM:      "That's it."
  Artisan: "Noted. 8 corrections logged for
            your Ship Bud calibration."

─────────────────────────────────────────────────
BOTTOM BAR
  Correction 5 of session    Ship Bud: learning   [Done →]

─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Artisan never prompts during silence. PM thinks at their own pace.
2. Every correction gets a proactive downstream check.
   "Cards 1px taller — scroll still works" is always verified.
3. Speed target: < 3 seconds per correction cycle.
   If slower, show "rendering..." — never a frozen screen.
4. Artisan cites pattern source for every decision.
   "Matches BlogCard" anchors to the existing system, not invention.
5. Correction count shown but never as pressure.
   "Correction 5" not "5 corrections so far."
```

---

## SCREEN 28 — EVIDENCE STACK (FEAR CARDS)

```
Purpose: After build and corrections — four cards, each answering
one specific PM fear. PM reads top to bottom and stops when satisfied.
Nobody reads all four on a good day.

Layout: Four expandable cards, vertically stacked

─────────────────────────────────────────────────
HEADER
  "Expert Picks is ready."                      ← 22px semibold, slate-900
  "Here's the evidence."                        ← 14px, slate-500

FEAR CARD 1 — "Does it look right?"
  [expanded by default]
  Figma spec vs. implementation:    0px deviation
  Figma frame: HP-07 v3.2          ↔  [side-by-side →]
  Token overrides:                  0
  Hardcoded values:                 0
  Breakpoints: Mobile ✓  Tablet ✓  Desktop ✓

FEAR CARD 2 — "Does it work?"
  [expanded by default]
  QA scenarios:   23   ✓ 23 passed   ✗ 0 failed
  Devices:        Pixel 7 ✓   iPhone 15 ✓   iPad ✓
  Load time:      0.87s   (target: < 1.2s) ✓
  [Watch QA run →]

FEAR CARD 3 — "Did it break anything?"
  [collapsed — expands on tap]
  Regression suite:    47 tests   ✓ 47 passed
  Files touched:       3 of 847   (844 untouched)
  Critical paths:      Login ✓  Checkout ✓  Payment ✓

FEAR CARD 4 — "Is the code good?"
  [collapsed]
  Reuse ratio:         75%   (Artisan wrote 247 new lines)
  Test coverage:       89%   (standard: 80%)
  Custom CSS:          0
  Pattern compliance:  100%  (matches FeaturedBrands)
  Self-corrections:    3     [see what was fixed →]
  Spec reviewer:       Apur Sharma · approved · 10:31 AM

CTA ROW
  [See safety net →]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Cards 1 and 2 are expanded by default.
   PM sees visual proof and QA result immediately.
2. Cards 3 and 4 collapsed — regression and code quality
   for the PM who wants to go deeper.
3. "Did it break anything?" uses the word "anything" — wide frame.
   PM's fear is broad. The answer must match that breadth.
4. Every number has a source. No assertion without citation.
```

---

## SCREEN 29 — SAFETY NET

```
Purpose: PM needs to see the exit before approving the entry.
This screen exists because no feature ships without a rollback plan.
Calm register. Not a warning. A promise.

Layout: Single column, white bg

─────────────────────────────────────────────────
HEADER
  "Before you ship — your safety net."          ← 20px semibold, slate-900

FEATURE FLAG (primary safety)
  Expert Picks is behind: expert_picks_v1        ← monospace chip, slate-900
  Toggle off: 2 clicks. 2 seconds. No deploy.   ← the key line
  Users see previous home screen instantly.
  No engineer required.                         ← critical for PM confidence

ROLLBACK (secondary safety)
  If the flag isn't enough:
  Full rollback in 90 seconds.
  Artisan handles it. One button.
  [See rollback plan →]

WHO KNOWS
  On-call this week:   Apur Sharma               ← from calendar context
  Artisan will page:   if error rate > 0.1%
  You'll see:          alert in Now Watching bar first

WHAT ARTISAN WATCHES (72 hours)
  ◎ Error rate    alert if > 0.1%
  ◎ Load time     alert if > 1.5s
  ◎ Impressions   report at 24h
  ◎ Save rate     report at 72h

CTA ROW
  [Ship it →]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. "No engineer required" must appear on this screen.
   The PM's exit must be self-service.
2. Threshold for alert (0.1%) is always shown.
   PM knows what triggers a page, not just "Artisan is watching."
3. On-call engineer named from real context.
   "Apur Sharma" not "your on-call engineer."
4. This screen cannot be skipped.
```

---

## SCREEN 30 — SHIP MOMENT

```
Purpose: A moment of ownership. Not a confirmation dialog.
PM shipped something. That is a professional milestone.
Calm. Factual. Transferring ownership without transferring blame.

Layout: Full screen, dark surface (bg-slate-950), centred

─────────────────────────────────────────────────
[centred, vertically centred, maximum 6 lines]

  You're shipping Expert Picks.                 ← 32px semibold, white

  23 scenarios passed.                          ← 16px, slate-300, mt-4
  47 regressions clear.
  Feature flag is live.
  Apur reviewed the spec.


  This is yours.                                ← 14px, slate-400, italic, mt-6


              [Ship it →]                       ← indigo-600, large, centred, mt-8


  "Artisan monitors for 72 hours.               ← 11px, slate-500, bottom
   You'll hear from us only if something
   needs attention."
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. "This is yours." — two words. They transfer ownership.
   Not credit ("you built this") and not disclaimer ("AI built this").
   The PM made the decisions. This is the consequence.
2. No animation beyond the page load. No confetti. No sound.
3. The four facts above "This is yours" are evidence, not celebration.
   Factual. Lowercase. No exclamation marks.
4. [Ship it →] is the only CTA on this screen.
   No "cancel", no "go back." The PM committed at Screen 29.
```

---

## POST-SHIP + ONGOING SCREENS

---

## SCREEN 31 — DEPLOY CONFIRMATION + FIRST USER MOMENT

```
Two beats. Separated by 2–4 minutes.

BEAT 1 — Deploy (30 seconds after ship)
─────────────────────────────────────────────────
  [dark card, centred]
  Expert Picks is live.                         ← 22px semibold, white
  
  Feature flag: ON · 5% of users               ← staged rollout
  Deploy time:  23 seconds
  Rollback:     available (2 seconds)
  Artisan is watching.                          ← 13px, slate-400

BEAT 2 — First User (2–4 min after deploy)
─────────────────────────────────────────────────
  [quiet card, slides up in Now Watching bar area]
  
  First user just saw Expert Picks.             ← 14px, slate-700
  
  Load time:   0.81s  ✓
  Errors:      0      ✓
  Device:      Pixel 6 (first real device seen)
  
  "No action needed."                           ← 12px, slate-400
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Beat 2 never reads "Congratulations." It reads "First user just saw."
   Evidence, not celebration.
2. The first real device is always named. Not "a user" — Pixel 6.
   Specificity = credibility.
3. "No action needed" closes the loop. PM doesn't need to do anything.
```

---

## SCREEN 32 — 24H PERFORMANCE REPORT

```
Three layers. PM reads until satisfied and stops.

─────────────────────────────────────────────────
  Expert Picks · 24 hours                       ← header

LAYER 1: IS IT WORKING?  (always expanded)
  Error rate:   0.02%   ✓  (threshold: 0.1%)
  Load time:    0.84s   ✓  (target: < 1.2s)
  Uptime:       100%    ✓
  Flag status:  ON · no incidents

LAYER 2: IS IT DOING WHAT YOU INTENDED?  (expanded)
  Users who saw Expert Picks:     2,847
  Tapped a pick:                    412  (14.5%)
  Saved a pick:                     203  (7.1%)
  Returned same session:            891  (31%)

LAYER 3: DID IT MOVE THE METRIC?  (collapsed, measuring)
  Purchase rate impact:   measuring...
  Session depth:          measuring...
  "Check back in 7 days."                       ← 12px, slate-400

FOOTER
  Source: Analytics API + Artisan trace · verified ●
  [Share this report →]   [Full breakdown →]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Layer 1 is the PM's first read. Green = stop reading.
   If Layer 1 is amber or red, it expands automatically and
   the report leads with the problem, not the metrics.
2. Layer 3 never shows a partial number with a confidence caveat.
   It either shows a verified number or "measuring."
   No "~23% (est.)" — that false precision destroys trust.
```

---

## SCREEN 33 — ERROR ALERT + ROLLBACK EXPERIENCE

```
Two states: alert and recovery.

ALERT STATE (Now Watching bar turns amber)
─────────────────────────────────────────────────
  Now Watching: ✗ Expert Picks · 0.3% errors · above threshold  [See now →]

ALERT DETAIL SCREEN
  "Error rate crossed 0.1% threshold."          ← 20px, amber-900
  Expert Picks · 0.3% of loads failing
  Started: 14 minutes ago
  Affected: ~8 users per hour

  WHAT'S FAILING
  "TypeError: editorial_score is null on
   non-editorial products. Fallback not firing."
  Artisan's read: "Fixable without reshipping."

  YOUR OPTIONS (3 cards)

  ┌─────────────────────────────────────────────┐
  │  Toggle the flag               ← recommended│
  │  Expert Picks hidden instantly.             │
  │  2 seconds. No deploy needed.               │
  │  [Toggle off now →]                         │
  └─────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────┐
  │  Artisan fixes it (hot-patch)               │
  │  ~3 min. Re-runs Scenario 7 before push.   │
  │  [Fix it →]                                 │
  └─────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────┐
  │  Page Apur                                  │
  │  Send him full context. He decides.         │
  │  [Page Apur →]                              │
  └─────────────────────────────────────────────┘

ROLLBACK STATE (after flag toggle)
─────────────────────────────────────────────────
  Expert Picks is off.                          ← 22px semibold, slate-900
  
  Users see previous home screen.
  Propagation: complete (2 seconds)
  Error rate: 0%  ← live, animates to zero
  
  Affected total: ~8 users
  "This was caught early. 8 of 2,847 saw the error." ← evidence, not comfort

  Artisan is diagnosing the null-safe fallback.
  Fix ready for your review when done.
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. PM sees the alert BEFORE anyone messages them.
   Now Watching bar is the primary channel. Always.
2. "Toggle the flag" is always option 1. Self-service exit first.
3. Rollback screen uses past tense: "Users see previous screen."
   The problem is already solved by the time this renders.
4. "8 of 2,847" reframes the error. Not a crisis — a caught edge case.
```

---

## SCREEN 34 — REGRESSION DETECTION

```
Trigger: A change to a shared dependency is detected in any
environment (staging, PR, production). Artisan catches it
before the PM or engineer has to.

Now Watching bar:
  ◐ Expert Picks may be affected by a recent API change  [Check →]

DETAIL SCREEN
─────────────────────────────────────────────────
  "A change was made to ProductAPI 3 hours ago.
   Expert Picks uses this endpoint."            ← 20px semibold, slate-900

  WHAT CHANGED
  product_thumbnail_url renamed → product_image_url
  ProductAPI v2.3 → v2.4
  Change is in staging (not yet in production)

  IMPACT ON EXPERT PICKS
  Images will fail to load.
  Scenario 1 (existing test) would now fail.

  WHY ARTISAN CAUGHT THIS
  ● Expert Picks uses product_thumbnail_url  (traced to build)
  ● ProductAPI changelog detected            (Artisan monitors)
  ● Staging test suite: Scenario 1 now failing

  OPTIONS
  [Artisan fixes the field name — 2 min →]
  [Page Apur →]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Caught in staging, before production. This is always emphasised.
   "Not yet in production" is the headline frame.
2. Why Artisan caught it is always shown. Not magic — traced.
3. Fix is one tap. No brief required — this is maintenance, not new build.
```

---

## SCREEN 35 — DEPENDENCY HEALTH (PASSIVE)

```
Lives in workspace sidebar. Passive. PM never has to ask.

WORKSPACE SIDEBAR — Feature Health section

  Expert Picks           ✓ Healthy
  FeaturedBrands         ✓ Healthy
  Wishlist redesign      ⚑ Dependency change pending  ← amber

  [Expert Picks ↓] expanded:
    Last error:          18 days ago (resolved)
    API dependencies:    3 of 3 healthy
    Shared calls:        WishlistAPI (monitored)
    Design tokens:       all current
    Test coverage:       89% (stable)
    Next check:          in 4 hours

─────────────────────────────────────────────────
NON-NEGOTIABLES
1. This panel is always visible in the workspace sidebar.
   Never requires navigation to find.
2. ⚑ items in amber appear immediately with no animation.
   Subtlety is for good news. Amber is direct.
3. "Next check: in 4 hours" tells PM Artisan is actively watching.
   Not "last checked: X ago" — that reads as passive.
```

---

## SCREEN 36 — COMPARATIVE PERFORMANCE

```
Shown at 7-day mark alongside the 24h report.

─────────────────────────────────────────────────
  Expert Picks · 7 days · How it compares

  Save rate        7.1%  ↑ vs. FeaturedBrands 4.2%    +69%
  Return same day  31%   ↑ vs. home avg 24%            +29%
  Load time        0.84s ✓ top 20% of home features

  "Expert Picks is outperforming the section
   it replaced on every metric."               ← one-line verdict first

  Source: Analytics · 7-day A/B window · verified ●
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Verdict first, data second. Always.
2. Comparison is always to a named feature or baseline.
   "vs. FeaturedBrands 4.2%" not "vs. average."
3. This card surfaces only if performance is above baseline.
   Below baseline: honest framing (Screen 32, Layer 2).
```

---

## SCREEN 37 — IMPACT ATTRIBUTION (14 DAYS)

```
─────────────────────────────────────────────────
  Expert Picks · 14 days · Did it move the metric?

  Purchase rate (users who saw Expert Picks):
    +23% vs. control group                    ← 28px, emerald-700, bold

  Session depth:     +1.4 pages per session   ← 16px, emerald-600
  Repeat visits:     +8% (7-day)              ← 16px, emerald-600

  "Expert Picks is driving measurable purchase
   behaviour. The editorial curation model is
   working."                                  ← verdict. Product judgment validated.

  Source: Analytics · A/B test · 14-day · verified ●

  [Share with stakeholders →]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. "The idea worked" is implied, never stated.
   "The editorial curation model is working" = product judgment validated.
   Artisan does not say "great idea."
2. +23% is the largest text on the screen.
   That number is what the PM worked toward. It deserves the emphasis.
```

---

## SCREEN 38 — PM PORTFOLIO

```
Accessible from profile. The B5 moment made visible over time.

─────────────────────────────────────────────────
  Meera Iyer · Product Manager                 ← identity

  "6 features shipped in 90 days
   that required an engineering sprint before." ← B5 statement

  TABLE
  Feature             Shipped    Impact              Status
  Expert Picks        Jun 12     +23% purchase       ✓ Healthy
  Pricing page        May 28     +14% conversion     ✓ Healthy
  Save flow v2        May 14     +31% saves          ✓ Healthy
  Browse filters      Apr 30     measuring           ✓ Healthy
  Wishlist share      Apr 19     +8% shares          ✓ Healthy
  Hero redesign       Apr 7      —                   ⚑ Flag off

  SUMMARY ROW
  6 features shipped
  0 production errors (1 rollback, caught early)
  Avg time to ship: 5.4 minutes
  Sprint equivalent: ~18 days saved

  [Share this →]   [See full traces →]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. "That required an engineering sprint before" is the key line.
   Not "features built" — features that were previously impossible.
2. Rollback shown honestly: "1 rollback, caught early."
   Not hidden. The portfolio is a record, not a highlight reel.
3. Sprint equivalent calculated and shown.
   This is the business case in one number.
```

---

## SCREEN 39 — STAKEHOLDER CARD (SHAREABLE)

```
PM shares this with manager, EM, or team.
Designed to work as a Slack embed, email, or PDF.
Self-contained. No login required to read.

┌──────────────────────────────────────────────┐
│  Expert Picks                                │
│  Shipped June 12 · Meera Iyer (PM)           │
│                                              │
│  +23% purchase rate (14-day A/B)             │
│  2,847 users · first 24 hours                │
│  0 production errors                         │
│                                              │
│  Spec reviewed by:  Apur Sharma              │
│  QA: 23 scenarios, all passed               │
│  Rollback: available in 2 seconds            │
│                                              │
│  Source: Artisan trace · verified ●          │
│  [Full trace →]                              │
└──────────────────────────────────────────────┘

NON-NEGOTIABLES
1. "Spec reviewed by: Apur Sharma" is on this card.
   The accountability chain is part of the shareable record.
2. Rollback availability is on this card.
   Business stakeholders read this as: "there is an exit."
3. Verified dot (●) is on this card.
   Every claim here is trace-backed, not asserted.
```

---

## SCREEN 40 — LEARNING CARD

```
Shown at 30 days. Closes the skill loop.
Connects this build back to the Ship Bud's growth.

─────────────────────────────────────────────────
  "What Expert Picks taught me about your taste."

  YOUR PREFERENCES (now calibrated)
  · Card title: 14px (you corrected from 16px)
  · Expert name: slate-500 (you corrected from default)
  · Card height: 248px (you corrected from 220px)
  · You prefer editorial over algorithmic when both available
  · You ask for height adjustments on 4 of 5 home screen builds

  "The next home screen feature will need
   3 corrections, not 8."

  SHIP BUD UPDATE
  IS this month:  44% → 49%  (+5pp)
  Calibration:    improving — 8 more sessions to next threshold
  At this pace:   graduation in ~14 months

  [View Ship Bud →]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Preferences are stated as observations, not instructions.
   "You corrected from 16px" not "you prefer 14px."
   Artisan learned from observation, not configuration.
2. The IS improvement is shown in this card, not separately.
   The correction history IS the IS progress. They are the same thing.
```

---

## STAKEHOLDER TRUST VIEWS

```
Architecture: One trace. Six views.
The same evidence, filtered for each stakeholder's first question.
No one reads the raw trace. Everyone gets their view.

Every view shares:
  · The Accountability Chain component (see below)
  · Source citations (● verified / ◐ inferred)
  · [Ask Artisan →] — any question, answered from the trace

THE "ARTISAN RESPECTS YOUR ROLE" PRINCIPLE
Every stakeholder view starts from this position:
Artisan is not replacing you. It is doing the work that lets you
do your job better.

  Stakeholder     Old world                         With Artisan
  ─────────────────────────────────────────────────────────────────
  EM              Reviewing code for 2 hours,       PR explains every decision
                  asking PM what decisions           with a cited source
                  were made
  
  QA Manager      Writing test cases from           Starting from 23 pre-run
                  scratch, chasing coverage          scenarios, adding what's missing
  
  Developer       Maintaining code with no           Ask Artisan any question about
                  context on decisions               any line, get cited evidence
  
  Business Mgr    Asking "how did this get           Seeing the accountability
                  shipped?" after the fact           chain before it ships
  
  Design Lead     Comparing Figma to                 Pre-computed overlay showing
                  implementation pixel by pixel      0px deviation
  
  On-call Eng     Debugging blind at 2am             Pre-written runbook with known
                                                     failure modes
```

---

## STAKEHOLDER FEAR HIERARCHIES

```
Every stakeholder view is designed around a specific first question
and an underlying fear. Design must answer the first question
immediately — within the first 3 lines of the view.

─────────────────────────────────────────────────
ENGINEERING MANAGER

  First question:   "Did this meet our engineering standards?"
  Underlying fear:  "I'm responsible for code quality. A PM shipped
                     code. If it's bad, it's on me. I'll be cleaning
                     this up for months."
  Fear stack:
    1. Code quality — linting, complexity, coverage
    2. Pattern compliance — did it do things our way?
    3. Tech debt — does this create future work?
    4. Accountability — who is responsible if this breaks?
    5. Reviewability — can I understand this PR in 10 minutes?

─────────────────────────────────────────────────
QA MANAGER

  First question:   "What wasn't tested?"
  Underlying fear:  "Artisan will miss something obvious and my team
                     will be blamed for letting it through."
  Fear stack:
    1. Coverage gaps — what paths weren't run?
    2. Edge cases — did it test hard stuff or just the happy path?
    3. Repeatability — can we re-run these in our own pipeline?
    4. Regression — does this touch anything already passing?
    5. Independence — are Artisan's tests integrated with our CI?

─────────────────────────────────────────────────
SDE / DEVELOPER (who maintains this)

  First question:   "Can I understand this 6 months from now at 2am?"
  Underlying fear:  "I'm now on-call for code I didn't write and don't
                     understand. When it breaks, I'm debugging blind."
  Fear stack:
    1. Readability — is this code I can follow?
    2. Debuggability — are the failure modes documented?
    3. Pattern adherence — did it do something novel that breaks conventions?
    4. Ownership — am I responsible for code I didn't write?
    5. Explainability — can someone explain why every decision was made?

─────────────────────────────────────────────────
BUSINESS MANAGER

  First question:   "Is there an audit trail? Who approved this?"
  Underlying fear:  "A PM shipped to production without a sprint.
                     If something goes wrong, is this even sanctioned?"
  Fear stack:
    1. Accountability chain — who approved what, when
    2. Risk level — what's the blast radius if it breaks?
    3. Speed vs. safety — was anything cut to ship fast?
    4. Business impact — what was the return on this?
    5. Governance — does this follow our release process?

─────────────────────────────────────────────────
DESIGN LEAD

  First question:   "Does it match the spec pixel-for-pixel?"
  Underlying fear:  "Artisan interpreted my Figma and shipped
                     something that looks close but isn't right."
  Fear stack:
    1. Figma compliance — overlay: design vs. implementation
    2. Token usage — any hardcoded values? Any overrides?
    3. Responsive behaviour — does it hold on all breakpoints?
    4. Interaction fidelity — are animations and states correct?

─────────────────────────────────────────────────
ON-CALL ENGINEER

  First question:   "If this breaks at 2am, can I fix it without context?"
  Underlying fear:  "I'll be paged for an incident on code I've never
                     seen, built by an AI, with no one to call."
  Fear stack:
    1. Known failure modes — what are the documented ways this breaks?
    2. Rollback path — is there a fast, safe undo?
    3. Runbook — step-by-step: if X happens, do Y
    4. Key contacts — who knows most about this feature?
    5. Dependency map — what does this touch? What doesn't it?
```

---

## THE PR THAT EXPLAINS ITSELF (auto-generated per stakeholder)

```
When Artisan raises a PR, the body auto-generates a section for
each reviewer before they open a single file. No human writing.
Every claim is trace-backed.

PR: feat/expert-picks
─────────────────────────────────────────────────
FOR ENGINEERING MANAGER

  Code quality:       A  (ESLint: 0 errors, 0 warnings)
  Pattern compliance: 100%  (follows FeaturedBrands conventions)
  Test coverage:      89%  (team standard: 80%)
  New tech debt:      None detected
  Spec reviewed by:   Apur Sharma · June 12 · 10:31 AM

  "3 new files. Follows patterns from FeaturedBrands (March).
   Apur approved the approach before build started."

─────────────────────────────────────────────────
FOR QA MANAGER

  Scenarios run:    23  ✓ all passed
  Devices tested:   Pixel 7 · iPhone 15 · iPad
  Regression suite: 47 tests · 0 failures
  Known gaps:       Timeout > 60s (low risk, flagged)
                    Offline state (not in scope, documented)
  Re-run tests:     [One-click replay in CI →]

  "Happy path + 8 edge cases. 2 gaps flagged honestly.
   Tests exported to your pipeline format."

─────────────────────────────────────────────────
FOR DEVELOPER

  New components:    2  (ExpertPicksStrip, ExpertPicksCard)
  Pattern source:    FeaturedBrands.tsx (same structure)
  Shared endpoints:  WishlistAPI.getUserItems() (2 other callers)
  Known failure mode: editorial_score null on non-editorial products
                      → fallback: recommendation_score (tested Scenario 7)
  Ask Artisan:       [Chat with Release AI →]

  "Artisan can explain any line of this code.
   Decision log: 14 entries."

─────────────────────────────────────────────────
FOR BUSINESS MANAGER

  Approved by:       Meera Iyer (PM) · June 12 · 14:52
  Spec reviewed by:  Apur Sharma (Eng) · June 12 · 10:31
  QA:                23 scenarios · 0 failures
  Rollback:          Feature flag · 2 seconds · no deploy needed
  Risk level:        Low (no critical path touches)
  Sprint equivalent: 3 days → 6 minutes
  Audit trail:       [Full trace →]

─────────────────────────────────────────────────
FOR DESIGN LEAD

  Figma frame:     HP-07 · v3.2
  Pixel deviation: 0px on card layout
  Token overrides: 0
  Hardcoded values: 0
  Breakpoints:     Mobile ✓  Tablet ✓  Desktop ✓
  [Design overlay →]  Figma vs. implementation, opacity slider

─────────────────────────────────────────────────
NON-NEGOTIABLES FOR THE AUTO-GENERATED PR BODY

1. Every section is generated from trace — never human-written.
2. Every claim is cited. "0 errors" links to the lint report.
   "Apur Sharma" links to the review card with timestamp.
3. The PR body is the first thing each reviewer sees.
   It must answer their first question before they scroll.
4. Known gaps are always listed — for QA, for EM.
   A PR that hides gaps is a PR that destroys trust on discovery.
5. [Ask Artisan →] appears in every section.
   Any reviewer can ask any question and get a trace-backed answer.
```

---

## ACCOUNTABILITY CHAIN COMPONENT (shared, all views)

```
Persistent component. Top of every stakeholder view.
Answers: "Who is responsible for this?"

┌────────────────────────────────────────────────┐
│  ACCOUNTABILITY CHAIN                          │
│                                                │
│  Meera Iyer      Scoped + approved    14:52   │
│  Apur Sharma     Reviewed spec        10:31   │
│  Artisan         Built + self-tested  14:47   │
│  Artisan QA      23 scenarios         14:50   │
│  Meera Iyer      Final approval       14:52   │
│                                                │
│  Every decision in this build is documented.  │
│  [Full audit trail →]                          │
└────────────────────────────────────────────────┘

NON-NEGOTIABLES
1. Every human who touched this is named with timestamp.
2. Artisan's contribution is listed alongside humans — not hidden.
   "Artisan Built + self-tested" is a legitimate chain entry.
3. "Every decision is documented" is the trust claim.
   It must be linkable: [Full audit trail →] must go somewhere real.
```

---

## SCREEN 41 — ENGINEERING MANAGER VIEW

```
First question: "Did this meet our engineering standards?"
─────────────────────────────────────────────────
HEADLINE VERDICT
  ✓ Meets engineering standards                 ← first line, always

CODE QUALITY
  ESLint:            0 errors, 0 warnings
  Cyclomatic complexity: 12  (team avg: 18) ← below average = better
  Test coverage:     89%    (team standard: 80%)
  Type safety:       100%   (0 'any' types)

PATTERN COMPLIANCE
  "ExpertPicksCard follows the same structure as
   FeaturedBrandsCard (Apur, March 14). Same prop
   shape, same render pattern, same test structure."
  [Compare files side-by-side →]

TECH DEBT
  New debt introduced:   None detected
  Existing debt touched: 0 files
  New packages added:    0

WHAT A HUMAN REVIEWED
  Apur Sharma reviewed spec + data sources (10:31 AM)
  Flagged: editorial_score deprecation risk
  Resolved: Meera switched to recommendation_score

SELF-CORRECTIONS (Artisan's own review)
  3 issues caught before PM saw the build
  [See what was fixed →]

[Accountability Chain]
[Ask Artisan about any line of code →]
─────────────────────────────────────────────────
```

---

## SCREEN 42 — QA MANAGER VIEW

```
First question: "What wasn't tested?"
─────────────────────────────────────────────────
HEADLINE VERDICT
  ✓ 23 scenarios passed · 2 known gaps · both low risk

COVERAGE MAP (visual DAG)
  Tested paths: emerald
  Untested paths: amber (with risk label)
  [Full map →]

SCENARIOS BY TYPE
  Happy path:       ✓ Scenarios 1–5
  Error states:     ✓ Scenarios 6–11
  Edge cases:       ✓ Scenarios 12–19
  Device variants:  ✓ Scenarios 20–23

KNOWN GAPS (never hidden)
  ○ Timeout > 60s     Low risk · outside acceptance criteria
  ○ Offline state     Not in scope · documented in spec

REGRESSION
  47 existing tests: ✓ 47 passed
  Files touched: 3 of 847

RE-RUN IN YOUR PIPELINE
  [Export as JUnit]  [Export as Playwright]  [Export as Cypress]
  "Tests run in 4m 12s. Add to CI gate."

SESSION REPLAY
  [Full QA agent session — seekable →]
  23 scenarios · 47 minutes · every tap recorded

[Accountability Chain]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Known gaps are the first thing QA Manager looks for.
   They're listed before the passing scenarios. Honesty leads.
2. CI export is one tap. QA doesn't rewrite Artisan's tests.
   They extend them.
```

---

## SCREEN 43 — DEVELOPER VIEW

```
First question: "Can I understand and maintain this at 2am?"
─────────────────────────────────────────────────
HEADLINE VERDICT
  ✓ Debuggable · Pattern-compliant · Documented

WHAT WAS BUILT
  2 new components:
    ExpertPicksStrip  — container, handles API + empty state
    ExpertPicksCard   — presentational only, receives props

PATTERN SOURCE
  "Identical structure to FeaturedBrandsCard.
   If you know FeaturedBrands, you know this."
  [Open FeaturedBrandsCard side-by-side →]

KNOWN FAILURE MODES (pre-documented)
  1. editorial_score null on non-editorial products
     → fallback: recommendation_score (tested Scenario 7)
  2. WishlistAPI.getUserItems() is shared
     → 2 other components affected if this endpoint changes
     → if Expert Picks breaks, check SavedItems too

RUNBOOK (auto-generated)
  If Expert Picks fails to render:
    1. Check editorial_score API (null is expected, fallback handles it)
    2. Check WishlistAPI (shared — check SavedItems and WishlistWidget)
    3. Toggle feature flag (2 seconds, no deploy needed)

DECISION LOG
  14 decisions Artisan made during build
  Each: what, why, confidence, source
  [Browse decisions →]

ASK ARTISAN
  "What does line 47 do?"
  "Why did you choose this approach over X?"
  "What happens if the API times out?"
  → Answers from decision log. Not hallucination. Evidence.

[Accountability Chain]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Known failure modes are documented BEFORE the developer asks.
   "I might need this at 2am" is a design constraint, not an edge case.
2. Runbook is auto-generated, not manually written.
   Developer can edit it — Artisan generates the first version.
3. "Ask Artisan" answers cite trace sources.
   No ungrounded claims. Every answer is a trace lookup.
```

---

## SCREEN 44 — BUSINESS MANAGER VIEW

```
First question: "Is there an audit trail? Who approved this?"
─────────────────────────────────────────────────
HEADLINE VERDICT
  ✓ Approved · Documented · Low risk · Auditable

AUDIT TRAIL
  Meera Iyer        Scoped the feature      Jun 12, 09:41
  Apur Sharma       Reviewed spec           Jun 12, 10:31
  Artisan           Built and self-tested   Jun 12, 14:47
  Artisan QA        23 scenarios run        Jun 12, 14:50
  Meera Iyer        Approved the release    Jun 12, 14:52

RISK ASSESSMENT
  Risk level:         Low
  Critical paths:     Untouched (Login, Checkout, Payment)
  Rollback:           Feature flag · 2 seconds · self-service
  Error threshold:    Auto-alert if > 0.1%

SPEED vs. TRADITIONAL SPRINT
  This build:         6 minutes
  Sprint equivalent:  3 days (estimated)
  Cost difference:    significant — calculated on request

BUSINESS IMPACT (14-day)
  Purchase rate:    +23% vs. control
  Session depth:    +1.4 pages
  Repeat visits:    +8%

GOVERNANCE
  Release process:  Feature flag gating ✓
  QA sign-off:      23 scenarios, Artisan QA agent ✓
  Spec review:      Engineering (Apur Sharma) ✓
  PM approval:      Meera Iyer ✓

[Full audit trail →]   [Download PDF →]
─────────────────────────────────────────────────
```

---

## SCREEN 45 — DESIGN LEAD VIEW

```
First question: "Does it match the spec?"
─────────────────────────────────────────────────
HEADLINE VERDICT
  ✓ 0px deviation from Figma spec HP-07 v3.2

FIGMA COMPARISON
  [Side-by-side: Figma frame ↔ Implementation screenshot]
  Pixel deviation:    0px on card layout
  Pixel deviation:    0px on typography
  Pixel deviation:    0px on spacing

  [Overlay view →]  Design on top of implementation, opacity slider

TOKEN COMPLIANCE
  Token overrides:    0
  Hardcoded values:   0
  Custom CSS lines:   0
  "100% from your token system."

RESPONSIVE CHECK
  Mobile (375px):   ✓ [screenshot]
  Tablet (768px):   ✓ [screenshot]
  Desktop (1440px): ✓ [screenshot]

INTERACTION STATES
  Default:          ✓ [screenshot]
  Hover:            ✓ [screenshot]
  Saved state:      ✓ [screenshot]
  Empty state:      ✓ [screenshot]

ANIMATION
  Fade-in:    200ms (matched Hero section)
  Source:     HeroSection.tsx animation token
  Custom:     0 new animations added
─────────────────────────────────────────────────
```

---

## SCREEN 46 — ON-CALL ENGINEER VIEW

```
First question: "Can I fix this at 2am without context?"
─────────────────────────────────────────────────
HEADLINE
  IF THIS PAGES YOU:

STEP 1 — TOGGLE THE FLAG (try this first)
  Flag name:  expert_picks_v1
  Where:      Admin panel → Feature Flags → expert_picks_v1
  Effect:     Hidden instantly. 2 seconds. No deploy.
  Safe to do: Yes — always. At any time.

STEP 2 — CHECK THESE FIRST
  editorial_score API   most likely failure (null on non-editorial)
  WishlistAPI           shared with SavedItems and WishlistWidget
                        if broken, check all three together

STEP 3 — KNOWN ERROR PATTERNS
  "editorial_score null"     → fallback should fire. See Scenario 7 trace.
  "Images fail to load"      → ProductAPI field rename? Check v2.4 changelog.
  "Strip not rendering"      → HomeScreen.tsx integration (3 lines added)

STEP 4 — CONTACTS
  Feature owner:   Meera Iyer  (PM)
  Spec reviewer:   Apur Sharma (knows the approach decisions)
  Ask Artisan:     [Full context loaded — ask anything →]

ROLLBACK
  [Toggle flag off →]     2 seconds, self-service
  [Full rollback →]       90 seconds, Artisan-managed

FULL RUNBOOK    [Detailed steps →]
DECISION LOG    [Why every decision was made →]
TRACE           [Every action in the build →]
─────────────────────────────────────────────────
NON-NEGOTIABLES
1. Step 1 is always "toggle the flag." Self-service first.
2. Known error patterns are documented before any incident.
   On-call engineer reads this before they're ever paged.
3. "Ask Artisan" is always available.
   Artisan has full context. The on-call engineer doesn't need
   to find and wake up Meera at 2am.
```

---

## CONNECTIVE THREADS — UPDATED (v1.3)

```
8 threads connecting all 46 screens:

THREAD 1 — THE NOW WATCHING BAR
  Every screen. Never empty. Active / QA running / stuck /
  error alert / paused / regression detected.

THREAD 2 — THE BELIEF ARC (B0 → B5)
  Screen 1 (B0) → Screen 2 (B1) → Screens 3/4 (B2) →
  Screen 5 (B3) → Screens 19–30 (B4) → Screen 38 (B5)

THREAD 3 — THE CONTEXT THREAD
  Scan → Interview → Brief → Data Discovery → Trace →
  KB buckets → RS context score. Never resets.

THREAD 4 — THE BUD THREAD
  Every task → bud. Bud grows. IS measured per session.
  Correction loop feeds calibration. Learning Card closes loop.

THREAD 5 — THE TRUST THREAD
  Trust markers on every card. ● / ◐ / ○ always present.
  Fear cards → evidence stack → safety net → ship moment.
  Post-ship monitoring closes the trust loop.

THREAD 6 — THE TRACE THREAD
  Brief → Data → Spec → Build → Self-corrections →
  QA → Approval → Deploy → 24h → 72h → Impact.
  Every stakeholder view is a window into this same trace.

THREAD 7 — THE DUAL TRACK THREAD
  RS and IS always visible. D90 honest math.
  Track A or B is always the PM's choice.

THREAD 8 — THE ACCOUNTABILITY CHAIN THREAD
  Every stakeholder view shows the same chain.
  Meera → Apur → Artisan → QA → Meera.
  The chain is the answer to "who is responsible?"
  It appears on screens: 24, 41, 42, 43, 44, 45, 46.
```
