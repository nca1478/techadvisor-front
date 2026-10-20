---
name: TechAdvisor Signal Lab
description: Dark premium laboratory storefront where one volt signal drives conversion and cyan carries the advisor.
colors:
  volt: "#c9f24b"
  volt-hover: "#d9f973"
  volt-active: "#aecf35"
  volt-subtle: "#1d2612"
  volt-ink: "#0c1106"
  ink: "#0a0e13"
  panel: "#11161d"
  panel-raise: "#182029"
  paper: "#edf1f5"
  muted: "#9fb0be"
  line: "#232d38"
  line-strong: "#324052"
  signal-cyan: "#22d3ee"
  signal-cyan-bright: "#67e8f9"
  signal-cyan-ink: "#062830"
  success: "#4ade80"
  success-subtle: "#0f2a1c"
  warning: "#fbbf24"
  warning-subtle: "#2e230b"
  danger: "#fb7185"
  danger-subtle: "#331016"
typography:
  display:
    fontFamily: "Chakra Petch, Arial Narrow, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Chakra Petch, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  price:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.01em"
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  sm: "0.375rem"
  md: "0.625rem"
  lg: "0.875rem"
  xl: "1.25rem"
spacing:
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.volt}"
    textColor: "{colors.volt-ink}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.volt-hover}"
    textColor: "{colors.volt-ink}"
    rounded: "{rounded.lg}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
  badge:
    backgroundColor: "{colors.volt-subtle}"
    textColor: "{colors.volt}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    height: "40px"
---

# Design System: TechAdvisor Signal Lab

## Overview

**Creative North Star: "Signal Lab"**

A deep-ink laboratory bench for buying tech fast. The ground is near-black ink, panels lift one tonal step, and a single volt-lime signal marks everything that converts: price, primary action, focus. A second signal, cyan, belongs exclusively to the RAG advisor — citations, assistant identity, links — so shoppers learn that cyan means cited evidence and volt means buy. Typography pairs a squared technical display voice with a quiet body workhorse and a tabular mono reserved for data. Motion is one exponential ease-out, never bounce; empty states are first-class panels, not afterthoughts. A light lab variant replays the same world on paper for daylight, switched at runtime via [data-theme].

**Key Characteristics:**
- Dark-first ink ground, never pure black; muted tones tinted from the ink hue.
- One conversion signal (volt), one advisor signal (cyan); they never compete.
- Display type with instrument character; prices in tabular mono.
- Flat panels at rest; glow and lift respond to state.
- Tactile and confident components with visible focus and motion-safe delight.

## Colors

Restrained strategy: tinted ink neutrals plus volt for conversion and cyan for the advisor. A light lab theme mirrors the same signal semantics on a paper ground (#f2f4f6) for daylight reading — volt deepened for contrast, header/footer keeping the ink shell; dark remains canonical.

### Primary
- **Volt Signal** (#c9f24b): price figures, primary CTA, focus rings, winning comparison cells. Hover (#d9f973), active (#aecf35), subtle ground (#1d2612), ink text (#0c1106).

### Secondary
- **Advisor Cyan** (#22d3ee): RAG identity — citations, assistant marker, links (#67e8f9, hover #a5f3fc). Never used for purchase actions.

### Neutral
- **Ink** (#0a0e13): page ground.
- **Panel** (#11161d): cards and raised surfaces.
- **Panel Raise** (#182029): sticky summaries, assistant bubbles, skeleton ground.
- **Paper** (#edf1f5): primary copy (≈15:1 on ink).
- **Muted** (#9fb0be): secondary copy (≈7:1 on ink), always tinted, never gray.
- **Line** (#232d38): borders; **Line Strong** (#324052): emphasis borders, scrollbars.
- **Success** (#4ade80), **Warning** (#fbbf24), **Danger** (#fb7185) with subtle grounds for badges and alerts.

### Named Rules
**The Two Signals Rule.** Volt converts, cyan evidences. A screen element carries one signal at most; cyan never prices or sells.
**The Tinted Muted Rule.** Secondary text is tinted from the ink hue. Flat gray on color is a defect.

## Typography

**Display Font:** Chakra Petch (with Arial Narrow fallback)
**Body Font:** Inter (with system-ui fallback)
**Label/Mono Font:** JetBrains Mono (prices, specs, quantities, badges)

**Character:** Squared lab-instrument display over a neutral workhorse body; mono speaks only data, never decoration.

### Hierarchy
- **Display** (semibold 600, 2.25rem–3.75rem, 1.02–1.05): hero and page titles. Uppercase reserved for short thesis headlines.
- **Headline** (semibold 600, 1.5rem–2.25rem, 1.05–1.1): section titles.
- **Title** (semibold 600, 1.125rem–1.25rem, snug): card and panel titles.
- **Body** (regular 400, 1rem, 1.6): copy, 65–75ch measure.
- **Price** (semibold 600, 1.25rem–1.875rem mono tabular, 1.0): every amount on screen.
- **Label** (medium 500, 0.6875rem mono, 0.1em tracking, uppercase): badges, readouts, eyebrows.

### Named Rules
**The Price Voice Rule.** Amounts are always mono tabular. A price set in body type is unfinished.
**The Heading Weight Rule.** Headings carry their own weight; kickers and eyebrow labels above them are banned.

## Layout

Centered container with a tight/loose section rhythm: dense groups separated generously, more space above a heading than below it. Product grids lift cards on hover; tables scroll horizontally on mobile with sticky intent. Sticky elements (compare bar, cart summary) pin within their column on desktop and stack on mobile. One spacing scale (12/16/24) via the Stack primitive; no ad-hoc gaps.

## Elevation & Depth

Hybrid: tonal layering by default, glow on state. Panels rest flat on ink; the primary CTA carries a volt glow, winning comparison cells sit on volt ground, and the active gallery thumb glows volt. Motion (140/240/480ms, exponential ease-out) is the second depth cue: image zoom, add-to-cart pop, skeleton shimmer — all disabled under reduced-motion.

### Shadow Vocabulary (if applicable)
- **Volt glow** (`box-shadow: 0 0 0 1px rgb(201 242 75 / 0.35), 0 8px 24px -8px rgb(201 242 75 / 0.55)`): primary CTA at rest, intensified on hover (ring 0.5, 0 10px 32px glow).
- **Panel lift** (`box-shadow: 0 6px 18px rgb(0 0 0 / 0.45)`): raised cards and dialogs.
- **Deep** (`box-shadow: 0 18px 48px rgb(0 0 0 / 0.5)`): floating advisor entry, overlays.

### Named Rules (optional)
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadow and glow answer state changes only.

## Shapes

Softly squared lab geometry: small controls (8–10px radius), panels (14–20px), pills reserved for dots and count badges. Borders are 1px tonal lines, strengthened for emphasis; tone-tinted borders (volt, cyan, status) signal meaning. No hard offset shadows, no gradient text, no glass decoration. Icons are drawn SVG strokes, never emoji.

## Components

### Buttons
- **Shape:** softly squared (14px radius — rounded-lg), three sizes (32/40/48px height).
- **Primary:** volt ground with volt-ink text and glow; hover brightens, active presses to 0.98 scale.
- **Hover / Focus:** 150ms lab ease on color, border, shadow and transform; 2px volt focus ring with 3px offset.
- **Secondary:** panel ground with strong-line border, brightens toward raise on hover. **Danger / Ghost / Link** follow status and text roles.

### Chips (if used)
- **Style:** mono uppercase micro-labels on tinted grounds with tone borders and a signal dot.
- **State:** compare selection rides checkboxes; advisor history rides a native select.

### Cards / Containers
- **Corner Style:** extra-large (20px); dashed variant marks empty states.
- **Background:** panel, raise for sticky and inset emphasis.
- **Shadow Strategy:** flat at rest per the Flat-By-Default Rule.
- **Border:** 1px tonal line; never nested — sections compose with dividers and spacing.
- **Internal Padding:** 16px default, 24px comfortable, none for media-led cards.

### Inputs / Fields
- **Style:** panel ground, strong-line border, 10px radius, 40px height; caret and placeholder in system tones.
- **Focus:** volt ring; compare input shifts its border to volt.
- **Error / Disabled:** destructive text with alert role; disabled controls drop to half opacity without pointer events.

### Navigation
- **Style, typography, default/hover/active states, mobile treatment.** Header rides the ink ground with icon links and a mono count badge on the cart; categories scroll horizontally on mobile; admin sections use secondary buttons with the primary marking the active route.

### Price (signature pattern)
- **Style:** mono tabular figures, tight tracking, volt at totals.
- **Usage:** card amounts, buy-box hero figures, cart lines and summaries, compare cells, admin KPIs and table totals — always from server data, never generated.

### Advisor Citation (signature component)
- **Style:** cyan mono markers on cyan-tinted grounds with cyan snippet links; winning comparison cells pair volt ground with success badges.

## Do's and Don'ts

Concrete visual guardrails grounded in the implementation.

### Do:
- **Do** price every amount in mono tabulars via the price voice.
- **Do** reserve volt for conversion and cyan for evidence on every screen.
- **Do** theme browser surfaces (selection, caret, scrollbar, focus) from the palette.
- **Do** draw icons as SVG; keep the star glyph for ratings where it is content.
- **Do** honor reduced-motion across zoom, pop, shimmer and smooth scroll.

### Don't:
- **Don't** nest cards; compose sections with dividers and spacing.
- **Don't** set display type in Inter or body type in the mono face.
- **Don't** use emoji as icons, gradient text, glass decoration, or bounce easing.
- **Don't** write kickers above headings or number sections that carry no sequence.
- **Don't** let the LLM invent prices, stock, or guarantees — data comes from SQL or cited chunks.
