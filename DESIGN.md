---
name: Bit Bladi
description: Dark, gold-lit storefront for a South Sudanese restaurant — bilingual EN/AR, WhatsApp ordering
colors:
  gold: "#d9a441"
  gold-bright: "#f0c45c"
  ink: "#120b07"
  ink-soft: "#4a3a2c"
  muted: "#7a6a58"
  brown: "#24150d"
  brown-warm: "#3a2112"
  cream: "#f5efe3"
  light-cream: "#fbf7ef"
  sand: "#e9ddc9"
  surface: "#fbf7ef"
  line: "rgba(23, 18, 14, 0.12)"
  line-gold: "rgba(217, 164, 65, 0.28)"
typography:
  hero:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 700
    letterSpacing: "-0.035em"
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontWeight: 400
    letterSpacing: "normal"
  arabic:
    fontFamily: "Tajawal, Segoe UI, sans-serif"
    fontWeight: 400
    letterSpacing: "normal"
  eyebrow:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontWeight: 600
    fontSize: "0.72rem"
    letterSpacing: "0.22em"
rounded:
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
  "2xl": "1.5rem"
  full: "999px"
spacing:
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  section: "5rem"
components:
  button-accent:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0.75rem 1.6rem"
  button-accent-hover:
    backgroundColor: "{colors.gold-bright}"
    textColor: "{colors.ink}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    rounded: "{rounded.full}"
    padding: "0.75rem 1.5rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.full}"
    padding: "0.7rem 1.5rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0.6rem 1rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.7rem 0.9rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
---

# Design System: Bit Bladi

## Overview

**Creative North Star: "The Sofra After Dark"**

Bit Bladi is the South Sudanese *sofra* — the shared table — seen at night. The room
goes to near-black, warm browns (`ink #120b07`, `brown #24150d`, `brown-warm #3a2112`),
and a single pool of gold light (`gold #d9a441`) falls across it. Food glows on that
darkness; the interface recedes to hold it. Between the dark grounds, warm cream
"rooms" (`cream`, `light-cream`, `sand`) open up so the eye rests and dish
photography reads bright and appetizing. It is an editorial food story lit by
lantern-gold, not a delivery app.

The system alternates deliberately: dark section, cream section, dark section — and
text color follows the ground it stands on (cream type on dark, ink type on cream).
Playfair Display sets an appetite-forward, hospitable serif voice; Hanken Grotesk
keeps prices, menus, and forms fast and legible; Tajawal carries Arabic as a full
equal in the same warmth. Gold is the one accent — used as light, sparingly, so it
always means "here." Everything is soft-cornered: pill controls, rounded cards,
gentle two-step shadows on the cream rooms and gold hairlines on the dark grounds.

This is a Persuade-leaning storefront where real dish photography leads and the UI
frames it. The retired terracotta "Warm Sofra" look is an explicit anti-reference:
no clay/orange accent, no all-cream daytime palette. The admin CMS stays outside
this world — neutral zinc/white, functional — so the warmth is spent entirely on
the customer.

**Key Characteristics:**
- Dark browns and near-black as the room; a single gold accent as the light.
- Deliberate dark ↔ cream section rhythm; text color flips with the ground.
- Editorial Playfair serif + Hanken body; Arabic (Tajawal) is a first-class peer.
- Gold used as light, not paint — CTAs, eyebrows, active state, hairlines only.
- Soft everywhere: pill buttons, rounded cards; real food photography leads.

## Colors

A lantern-lit, appetite-forward palette: warm dark grounds hold the room, cream
surfaces open the rests, and a single gold directs every action.

### Primary
- **Lantern Gold** (#d9a441): The one accent and the system's "light." Primary CTAs
  (`btn-accent`), eyebrows, active nav, links, focus, dot/indicator active state,
  gold hairlines, icon accents, cart badge. Because it is the only accent, its
  restraint keeps it meaning "here."
- **Bright Gold** (#f0c45c): The lifted/hover shade of gold — `btn-accent` hover and
  the brightest highlight in gold gradients.

### Neutral — Dark grounds
- **Ink** (#120b07): Near-black warm brown. Primary text on cream, the darkest
  section ground (hero overlay, Reviews, footer), and the `btn-primary` fill.
- **Brown** (#24150d): Dark brown section ground (feature strip, About panel) — a
  step warmer/lighter than ink for tonal layering.
- **Brown Warm** (#3a2112): The warmest brown — inner panels and cards on dark
  grounds (e.g. the rating-summary panel), gradient warmth.

### Neutral — Cream rooms
- **Cream** (#f5efe3): The lit "room" background and the default text color on dark
  grounds.
- **Light Cream** (#fbf7ef): Slightly brighter room background and the `surface`
  value for cards/inputs that must sit cleanly above cream.
- **Sand** (#e9ddc9): Deeper warm surface for zoning, image placeholders, and
  progress-bar tracks on cream.
- **Surface** (#fbf7ef): Card/input fill (identical to Light Cream) that reads as a
  clean panel over the cream room.

### Neutral — Type & lines
- **Ink Soft** (#4a3a2c): Secondary text and field labels on cream.
- **Muted** (#7a6a58): Tertiary text, captions, metadata, counts on cream.
- **Line** (rgba(23,18,14,0.12)): Warm hairline borders/dividers on cream rooms.
- **Line Gold** (rgba(217,164,65,0.28)): Gold hairline borders on dark grounds
  (`btn-outline`, panels, arrow controls).

### Named Rules
**The Gold-as-Light Rule.** Gold is the only accent and behaves like light: CTAs,
eyebrows, links, active state, focus, and hairlines. Never introduce a second
accent hue; for extra emphasis shift the brown tone or brighten to `gold-bright`,
never add a new color.
**The Warm-Neutral Rule.** There is no cool or neutral gray in the customer UI.
Every ground, border, and muted tone is warm — ink/brown over cream. Never a cool
`#ccc`/`#888`.
**The Ground-Contrast Rule.** Text color derives from the ground it sits on: cream
(and cream/85 for secondary) on dark grounds, ink (and ink-soft/muted) on cream.
The navbar obeys this too — ink text while transparent over the light hero, cream
once the bar turns dark on scroll.

## Typography

**Display Font:** Playfair Display (with Georgia, serif fallback)
**Body Font:** Hanken Grotesk (with system-ui, sans-serif fallback)
**Arabic Font:** Tajawal (with Segoe UI fallback) — all RTL display and body

**Character:** A high-contrast editorial serif carries appetite and hospitality;
a clean modern grotesk keeps menus, prices, and forms fast. Headings tuck in tight
(negative tracking) so the serif reads as composed editorial rather than decorative.

### Hierarchy
- **Hero** (Playfair 700, `tracking-hero` −0.035em, `text-5xl`→`text-7xl`): Homepage
  hero headline only; the accented word (e.g. "of Home") is set in gold.
- **Display** (Playfair 700, −0.02em, `text-wrap: balance`): Section headings (`text-4xl`
  →`text-5xl`), card and dish titles, review names — anything using `.font-display`.
- **Body** (Hanken 400): Descriptions, paragraphs, UI text; secondary copy on dark
  grounds runs at cream/70–85.
- **Eyebrow** (Hanken 600, 0.72rem, uppercase, `letter-spacing 0.22em`, gold): The
  small gold kicker above section headings (`.eyebrow`), often flanked by gold rules.
- **Numeric** (`.tnum`, tabular-nums): Prices, ratings, counts — align as figures.

### Named Rules
**The Eyebrow Rule.** Every major section opens with a gold uppercase eyebrow
(0.22em tracking) above the Playfair heading; on centered sections it is flanked by
two short gold hairlines. It is the system's section signature.
**The Arabic-Peer Rule.** In RTL both display and body switch to Tajawal (display at
700) and layout uses logical properties (`start/end`, `ms/me`, `ps/pe`). Arabic is
never smaller or lighter than Latin.
**The Tabular-Price Rule.** Every price, rating, and count carries `.tnum`. Prices
are KES.

## Layout

Centered editorial column: `.container-x` caps content at 80rem and centers it with
`margin-inline: auto`; horizontal padding is 1.25rem on mobile, 2rem at ≥768px.
Sections breathe vertically (`py-20`→`py-24`, ~5rem). The defining move is the
**alternating ground rhythm** — full-bleed dark sections (hero, feature strip,
About, Reviews, footer) interleave with cream rooms (Featured, Menu preview), each
full-width with its content in the centered column. Editorial two-column splits
(text beside cards, or text beside a full-bleed photo half) collapse to a single
stacked column on mobile. Mobile-first throughout, and fully RTL-mirrored via
logical properties.

## Elevation & Depth

Hybrid by ground. On cream rooms, depth is a warm two-step soft shadow used
sparingly and mostly as a response to state. On dark grounds, depth comes from
**tonal brown layering** (ink → brown → brown-warm) and **gold hairlines**, plus
faint gold blur "glow" pools — not black drop shadows. All shadow color is warm
ink, never neutral black.

### Shadow Vocabulary
- **Soft** (`box-shadow: 0 1px 2px rgba(23,18,14,0.05), 0 10px 34px rgba(23,18,14,0.07)`):
  Resting elevation for cards/panels on cream.
- **Lift** (`box-shadow: 0 12px 44px rgba(23,18,14,0.16)`): Hover/active elevation and
  floating surfaces (cart drawer, dialogs, review modal).

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest; `Soft` is the most a resting
cream card gets, and `Lift` appears only on hover or for surfaces floating over the
page.
**The Dark-Depth Rule.** On dark grounds, never reach for a black shadow. Separate
layers with a warmer brown step and a `line-gold` hairline, and suggest light with a
low-opacity gold blur, not elevation.

## Shapes

Soft-cornered throughout. Controls are fully pill-shaped (`999px`): buttons, nav
items, chips, pagination dots, icon buttons. Cards use 1rem (`rounded-2xl`); large
panels, image cards, and dialogs use 1.5rem (`rounded-3xl`); inputs use 0.75rem
(`md`). Borders are single hairlines — warm `line` on cream, `line-gold` on dark.
Section grounds themselves are hard-edged full-bleed bands; all interactive and
content surfaces inside them are rounded. There are no hard rectangular corners in
the customer-facing UI.

## Components

### Buttons
- **Shape:** Fully pill (`999px`), inline-flex, 0.5rem gap, weight 600; `scale(0.97)`
  on `:active`, opacity 0.55 when disabled.
- **Accent** (`btn-accent`): Gold fill (#d9a441), ink text — the loud order/action CTA
  (Order Now, Add a Review, See the menu). Hover brightens to `gold-bright` (#f0c45c).
- **Outline** (`btn-outline`): Transparent with a `line-gold` hairline; text color is
  `inherit` so it adapts to its ground (cream on dark, ink on cream). Hover shifts the
  border to solid gold with a 12% gold wash. The quiet secondary (View Full Menu,
  Learn More, Open in Maps).
- **Primary** (`btn-primary`): Ink fill, cream text — reserved for dark WhatsApp CTA
  contexts.
- **Ghost** (`btn-ghost`): Transparent, ink text, `line` hairline, lighter padding.

### Cards / Containers
- **Corner Style:** 1rem (`rounded-2xl`) for standard cards; 1.5rem (`rounded-3xl`)
  for image cards, review cards, and dialogs.
- **Background:** `surface`/`light-cream` on cream rooms; `brown-warm` at low opacity
  with a `line-gold` border on dark grounds.
- **Shadow Strategy:** `Soft` at rest on cream, `Lift` on hover (see Elevation);
  tonal + hairline on dark (see The Dark-Depth Rule).
- **Internal Padding:** ~1.25rem–2.25rem (`md`→`p-9`) depending on prominence.

### Inputs / Fields
- **Style** (`.field-input`): `surface` fill, warm `line` hairline, 0.75rem radius;
  label above in Ink Soft, 600, 0.82rem.
- **Focus:** Border shifts to gold + a 3px soft gold glow
  (`box-shadow: 0 0 0 3px rgba(178,58,19,0.15)`); no default outline. On dark grounds
  (newsletter) the field is a translucent cream well with a `focus-within` gold border.

### Navigation
- **Style:** Sticky bar, cream logo/gold tagline. **Transparent over the homepage hero
  (ink text), solid `brown/95` with a `line-gold` bottom border once scrolled or on any
  other route (cream text).** Links are `.font-display`-adjacent Hanken 500; hover →
  gold; the Order Now CTA is a gold `btn-accent`. Mobile collapses to a full-screen
  `brown` overlay. Fully mirrored in RTL (chevrons via `rtl:-scale-x-100`).

### Review Carousel (signature)
Single centered review card (`surface`, `rounded-3xl`) on the dark Reviews ground,
with faint stacked cards behind for depth, a `brown-warm` rating-summary panel
beside it (average, gold stars, gold distribution bars), gold-hairline circular
prev/next controls, and gold pagination dots. Autoplays every 5s, pauses on
hover/focus/hidden-tab, respects reduced motion, and mirrors in RTL.

## Do's and Don'ts

### Do:
- **Do** alternate dark grounds and cream rooms, and set text color from the ground
  (cream on dark, ink on cream) — including the scroll-aware navbar.
- **Do** open every section with a gold uppercase eyebrow (0.22em) above the Playfair
  heading (The Eyebrow Rule).
- **Do** keep gold as the only accent and use it like light — CTAs, active state,
  focus, hairlines (The Gold-as-Light Rule).
- **Do** keep every control pill-shaped and every card soft-cornered (1rem / 1.5rem).
- **Do** give Arabic full parity — Tajawal, logical properties, mirrored layout.
- **Do** put `.tnum` on all prices, ratings, and counts.
- **Do** convey depth on dark grounds with tonal brown + gold hairlines, not black
  shadow (The Dark-Depth Rule); honor `prefers-reduced-motion`.

### Don't:
- **Don't** reintroduce the retired terracotta/clay accent or an all-cream daytime
  palette — that world is an anti-reference.
- **Don't** add a second accent hue; brighten to `gold-bright` or shift the brown tone.
- **Don't** use any cool/neutral gray; all neutrals are warm ink/brown over cream.
- **Don't** put ink text on a dark ground or cream text on a cream room — contrast
  follows the ground.
- **Don't** use hard rectangular corners on interactive or content surfaces.
- **Don't** bleed the customer world into the admin CMS — it stays neutral zinc/white.
- **Don't** hardcode the WhatsApp number, currency, prices, or copy in components; it
  all comes from CMS settings.
