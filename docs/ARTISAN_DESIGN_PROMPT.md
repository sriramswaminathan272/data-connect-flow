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

*Artisan Design Prompt v1.0 — May 2026*  
*Feed this entire document to your design tool. All screens are connected. Build them as a system, not individually.*
