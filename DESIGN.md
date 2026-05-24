---
version: alpha
name: ihatepdf-design-analysis
description: |
  A local-first, client-side, developer-centric terminal-native PDF tool suite. Rendered entirely in monospaced typography with fallback to IBM Plex Mono, using a warm cream canvas in light mode and dark ink canvas in dark mode. Employs 4px-radius borders, bracketed ASCII markers (like `[+]`, `[-]`, `[x]`, `[✓]`, `[!]`), and an ASCII block-letter banner for branding. Features fully responsive layouts, client-side WebAssembly (WASM) processing, and strict offline-first integrity constraints.

colors:
  primary: "#201d1d"
  on-primary: "#fdfcfc"
  ink: "#201d1d"
  ink-deep: "#0f0000"
  charcoal: "#302c2c"
  body: "#424245"
  mute: "#646262"
  stone: "#6e6e73"
  ash: "#9a9898"
  canvas: "#fdfcfc"
  surface-soft: "#f8f7f7"
  surface-card: "#f1eeee"
  surface-dark: "#201d1d"
  surface-dark-elevated: "#302c2c"
  hairline: "rgba(15,0,0,0.12)"
  hairline-strong: "#646262"
  on-dark: "#fdfcfc"
  on-dark-mute: "#9a9898"
  accent: "#007aff"
  accent-hover: "#0056b3"
  accent-active: "#004085"
  warning: "#ff9f0a"
  warning-hover: "#cc7f08"
  warning-active: "#995f06"
  danger: "#ff3b30"
  danger-hover: "#d70015"
  danger-active: "#a50011"
  success: "#30d158"

typography:
  display-xl:
    fontFamily: var(--font-mono)
    fontSize: 38px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0
  heading-md:
    fontFamily: var(--font-mono)
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.15em
  body-md:
    fontFamily: var(--font-mono)
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-strong:
    fontFamily: var(--font-mono)
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0
  caption-md:
    fontFamily: var(--font-mono)
    fontSize: 14px
    fontWeight: 400
    lineHeight: 2
    letterSpacing: 0

rounded:
  none: 0px
  sm: 4px
  md: 4px
  lg: 4px
  xl: 4px
  "2xl": 4px

spacing:
  xxs: 1px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 64px

components:
  announcement-strip:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.caption-md}"
    padding: 8px 16px
  logo-ascii:
    fontFamily: var(--font-mono)
    textColor: "{colors.ink}"
    fontSize: "clamp(4px, 1.7vw, 14px)"
  category-header:
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
    textTransform: uppercase
  tool-card:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline}"
    borderColorHover: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 24px
  file-dropzone:
    backgroundColor: "{colors.surface-soft}"
    backgroundColorHover: "{colors.surface-card}"
    borderColor: "{colors.hairline-strong}"
    rounded: "{rounded.sm}"
    padding: 48px
  progress-indicator:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 32px
  success-indicator:
    backgroundColor: "{colors.surface-soft}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.sm}"
    padding: 32px
---

## Overview

ihatepdf is a local-first, client-side, developer-centric terminal-native web tool suite designed to manipulate, edit, split, merge, convert, and protect PDF files entirely inside the user's web browser. The visual identity of ihatepdf comes from a strict, minimalist developer-centric aesthetic: the entire site reads like a terminal-native dashboard, styled with bracketed ASCII indicators like `[+]`, `[-]`, `[x]`, `[✓]`, `[!]` in place of graphical icons, bordered layout containers with a uniform `4px` corner radius (`rounded-sm`), and a massive, dynamic block-ASCII wordmark defining the brand header.

Every single operation is executed on the client-side via lightweight JS engines or WebAssembly (WASM). No data is ever uploaded to a remote server. The layout, headers, buttons, inputs, and utilities reinforce this promise of local data integrity and high performance through clean typographic structures and an ultra-functional layout design.

**Key Characteristics:**
- **100% Monospaced Typography:** Every element sits in a clean, robust monospaced font stack prioritizing high legibility and a terminal feel.
- **Robust Light/Dark Modes:** Full, reactive compatibility with user system preferences. The background transitions dynamically from warm cream (`#fdfcfc`) in light mode to near-black ink (`#201d1d`) in dark mode.
- **ASCII Iconography & Accents:** Brackets (`[+]`, `[-]`, `[x]`, `[✓]`, `[!]`) are treated as interactive and visual glyphs, replacing standard SVG icon packs.
- **ASCII Progress Indicator:** Operations show a customized CLI-like progress bar `[████████░░░░░░░░]` to mirror real terminal loading steps.
- **WASM Client-Side Integrity:** The announcement strip at the top explicitly and clearly states: "All the files are processed locally. No server uploads. Ever."
- **Strict Layout Boundaries:** Thin 1px borders (`border-hairline`) cleanly split sections, tool groups, staging cards, and results.

## Colors

ihatepdf utilizes a dynamic, responsive color ladder that supports both light and dark systems cleanly, mapped via native `@theme` configurations.

### Color Table

| Token Name | Light Mode Hex | Dark Mode Hex | Intent / Context |
|---|---|---|---|
| `{colors.primary}` / `{colors.ink}` | `#201d1d` | `#fdfcfc` | Body text, titles, navigation elements, primary button background |
| `{colors.on-primary}` | `#fdfcfc` | `#201d1d` | Text rendered on dark background elements, primary CTA label |
| `{colors.ink-deep}` | `#0f0000` | `#ffffff` | Hover state for primary buttons, active deep pressing |
| `{colors.charcoal}` | `#302c2c` | `#e5e2e2` | Slightly softer text, descriptive inline sentences |
| `{colors.body}` | `#424245` | `#c7c4c4` | Standard descriptive prose, card metadata description |
| `{colors.mute}` | `#646262` | `#8a8787` | Subtle footer copyright, secondary list stats, subheadings |
| `{colors.stone}` | `#6e6e73` | `#86868b` | Utility separators, least-emphasis hints, inactive steps |
| `{colors.ash}` | `#9a9898` | `#646262` | Disabled texts, placeholders, inactive buttons |
| `{colors.canvas}` | `#fdfcfc` | `#201d1d` | Main page canvas background, primary card surfaces |
| `{colors.surface-soft}` | `#f8f7f7` | `#262323` | Default background for dropzones, alternating rows |
| `{colors.surface-card}` | `#f1eeee` | `#2d2929` | Dragover state highlights, file badges, helper cards |
| `{colors.surface-dark}` | `#201d1d` | `#121010` | Top announcement strip background, terminal block headers |
| `{colors.hairline}` | `rgba(15,0,0,0.12)` | `rgba(253,252,252,0.12)` | Standard thin 1px dividers and card boundaries |
| `{colors.hairline-strong}` | `#646262` | `#8a8787` | Dropzone dashed borders, strong sections |
| `{colors.accent}` | `#007aff` | `#007aff` | Dynamic action links, informational highlights |
| `{colors.danger}` | `#ff3b30` | `#ff3b30` | Destructive clear actions, file deletion indicators, errors |
| `{colors.success}` | `#30d158` | `#30d158` | Completion checkmarks, successful task highlights |

## Typography

### Font Family
- **Monospaced Font Stack:** `--font-mono` is defined with the absolute fallback ladder: `"Berkeley Mono"`, `"IBM Plex Mono"`, `"JetBrains Mono"`, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace.
- **IBM Plex Mono** is loaded directly as an external web dependency to guarantee that all non-developer users receive a highly polished, uniformly sized monospaced output.

### Typography Hierarchy

- **Display / Logo:** Dynamic, scaled block-ASCII text sizing using viewport metrics (`clamp(4px, 1.7vw, 14px)`) to fit different screen widths natively.
- **Heading MD (`18px` / `tracking-widest`):** Used for tool categories (e.g. `ORGANIZE & MANAGE`) and individual feature names inside `FeatureHeader`.
- **Body MD (`16px`):** General description prose, text inside inputs, file cards, dropzone labels.
- **Body Strong (`16px` / Bold):** Button labels, active CTA text, emphasis statements.
- **Caption MD (`12px-14px`):** Small details, file sizes, footer copyright text, warning hints, index indicators.

## Layout & Rhythm

### Grid Columns & Containers
- **Content Max-Width:** Clamped uniformly at `max-w-6xl` (1152px) with horizontal padding of `px-4` to present a clean, balanced layout on ultra-wide screens.
- **Toolbox Categories:** Arranged in dynamic responsive grids: `grid sm:grid-cols-2 lg:grid-cols-3 gap-6`. This creates a dense, readable dashboard of tools on desktop while smoothly collapsing to a single list on mobile.
- **Rhythmic Gaps:** The layout respects generous vertical spacing using Tailwind's `space-y-16` or `py-16` between tool sections to keep the austere visual structure from feeling cramped.

## Shapes & Radii

- **Uniform 4px Border Radius:** `rounded-sm` (4px) is utilized on every structured box (cards, dropzones, buttons, input fields, process panels, file badges, error indicators). 
- **0px Radius (`rounded-none`):** Reserved for raw layouts, header bars, horizontal lines, and block boundaries.

## Core Components

### 1. Announcement Strip
A high-contrast banner spanning the top of the browser viewport. Its role is highly narrative, ensuring immediate assurance of local-first privacy.
- **Styles:** `bg-surface-dark text-on-dark text-center py-2 text-xs font-bold uppercase tracking-wider border-b border-hairline`

### 2. Block-ASCII Header Logo
An expansive monospaced ASCII rendering of the `ihatepdf` title centered in the page layout. It adjusts automatically using dynamic CSS styling to prevent layout overflow on smaller widths.
- **Sizing:** `fontSize: "clamp(4px, 1.7vw, 14px)", lineHeight: "0.8"`

### 3. Category Sections
Each category group has a clear text header and a separating 1px horizontal rule.
- **Styles:** `text-lg font-bold uppercase tracking-widest text-ink` followed by `<hr className="border-t border-hairline" />`.

### 4. Interactive Tool Cards
Clickable link blocks in the toolbox grid. On hover, they highlight with custom border outlines.
- **Styles:** `bg-canvas border border-hairline hover:border-ink rounded-sm transition-colors`. Uses a left-aligned bracket marker indicating the nature of the tool (e.g. `[+]`, `[-]`, `[x]`).

### 5. File Dropzones (Single & Multi)
Primary interface handlers for document staging. Built with dashed borders and hover states.
- **Styles:** `border border-dashed p-12 text-center cursor-pointer transition-colors rounded-sm`. Matches dragging states by swapping to `border-ink bg-surface-card` dynamically.

### 6. File List Rows
Staged documents are displayed with index bubbles, filename text, file sizes, reordering controls (▲ / ▼), and individual removal buttons (✕).
- **Styles:** `flex items-center gap-3 bg-canvas p-3 rounded-sm border border-hairline transition-colors`.

### 7. ASCII Progress Indicators
Used to visually communicate live WASM or JS processing tasks. Includes status descriptions, percentage figures, and a custom text bar loader.
- **Bar Syntax:** `[████████████░░░░░░░░░░░░]` made with `█` (filled) and `░` (empty) character strings.

### 8. Success Panels
Presented when the local client operation is completed. Features a checkmark logo `[✓]`, file size details, and action-oriented buttons.
- **Action Buttons:** A primary solid background button `[+] Download PDF` (`bg-primary text-on-primary`) paired with a neutral outline button `Try Another` (`border border-ink text-ink bg-canvas`).

## Do's and Don'ts

### Do
- **Keep everything 100% monospaced.** Do not allow proportional fonts or sans-serif typography anywhere.
- **Use bracketed indicators** like `[+]`, `[-]`, `[✓]`, `[!]` to represent buttons, indicators, and labels.
- **Align elements** flush with 1px hairline dividers (`border-hairline`) or standard border outlines.
- **Support dark mode natively.** Ensure background, cards, text, and form inputs look perfect in both modes.
- **Enforce the local-only promise.** Keep all WASM tasks sequential (avoid concurrency crashes), completely client-side, and highly responsive.

### Don't
- **Never load custom graphical icons** or SVG icon libraries if simple ASCII-characters or simple icons (such as standard unicode symbols like ▲, ▼, ✕, ⚙) can represent them.
- **Never add dropshadows, gradients, or heavy atmospheric styling.** The canvas must look completely flat and structural, relying on subtle borders and layout spacing.
- **Do not wrap heavy browser-side tasks in Promise.all.** Run PDF compression, merging, or page manipulations sequentially to avoid causing memory exceptions or browser crashes.

## Responsive Strategy

- **Dynamic Wordmark:** Responsive logo resizing is achieved by setting `fontSize: "clamp(4px, 1.7vw, 14px)"` directly on the `<pre>` container.
- **Responsive Grids:** Tool layouts use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` to automatically stack components depending on the screen width.
- **Footer Structure:** Left-aligned copyright year and right-aligned uppercase underlined link to GitHub collapse gracefully on small breakpoints.
