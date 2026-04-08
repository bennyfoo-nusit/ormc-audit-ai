# NUS Application Design Principles Guide

> **Purpose:** This guide is consumed by GitHub Copilot and GitHub Sparks to generate prototypes that comply with NUS corporate identity, existing Figma design patterns, and Material Design 3 (M3) principles.
>
> **Last updated:** March 2026

---

## Table of Contents

1. [NUS Corporate Identity](#1-nus-corporate-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Logo Usage](#4-logo-usage)
5. [Layout & Spacing](#5-layout--spacing)
6. [Component Library (Material Design 3)](#6-component-library-material-design-3)
7. [Elevation & Surfaces](#7-elevation--surfaces)
8. [Interaction States](#8-interaction-states)
9. [Design Tokens](#9-design-tokens)
10. [UI Patterns from Figma Designs](#10-ui-patterns-from-figma-designs)
11. [Accessibility](#11-accessibility)
12. [Figma Design References](#12-figma-design-references)

---

## 1. NUS Corporate Identity

All NUS applications must reflect NUS brand identity consistently. The corporate identity system includes logos, colours, and typefaces that must be applied correctly across all materials.

### Key Principles

- The NUS brand must be present on all application screens (header/footer)
- Corporate colours must be used as the primary palette
- Approved typefaces must be used for all text content
- Co-branding guidelines must be followed when sub-logos (e.g., uNivUS) appear alongside the NUS logo

---

## 2. Color System

### 2.1 NUS Primary Colour Palette

| Name | Hex | RGB | Pantone | Usage |
|------|-----|-----|---------|-------|
| **NUS Orange** | `#EF7C00` | R239, G124, B0 | PMS 152 | Primary accent, CTAs, highlights, active states |
| **NUS Blue** | `#003D7C` | R0, G61, B124 | PMS 294 | Primary brand, headers, navigation, links |

### 2.2 NUS Secondary Colour Palette

| Name | Pantone | Usage |
|------|---------|-------|
| **NUS Gold** | PMS 872 | Special events, high-profile collateral only |
| **NUS Silver** | PMS 8420 | Special events, high-profile collateral only |

### 2.3 Extended UI Palette (derived from nus.edu.sg live site)

The following colour values are extracted from the live NUS corporate website CSS and mapped to M3 roles. **These take precedence** over generic M3 defaults when building NUS applications.

| M3 Role | Mapped Value | NUS Site Usage |
|---------|-------------|-------|
| `--md-sys-color-primary` | `#003D7C` (NUS Blue) | Primary actions, links, key components |
| `--md-sys-color-on-primary` | `#FFFFFF` | Text/icons on primary surfaces |
| `--md-sys-color-primary-container` | `#F8F8F8` | Cards, panels, navbar background |
| `--md-sys-color-on-primary-container` | `#003D7C` | Card subheadings, sub-navigation text |
| `--md-sys-color-secondary` | `#EF7C00` (NUS Orange) | Hover accents, CTAs, active nav links |
| `--md-sys-color-on-secondary` | `#FFFFFF` | Text/icons on secondary surfaces |
| `--md-sys-color-surface` | `#FFFFFF` | Page backgrounds, card surfaces |
| `--md-sys-color-surface-variant` | `#F6F6F6` | Alternate section backgrounds |
| `--md-sys-color-on-surface` | `#333333` | Body text, primary content |
| `--md-sys-color-on-surface-variant` | `#555555` | Secondary text, input text, descriptions |
| `--md-sys-color-outline` | `#E7E7E7` | Borders, dividers, navbar border |
| `--md-sys-color-outline-variant` | `#E0E0E0` | Subtle borders, card edges |
| `--md-sys-color-error` | `#B3261E` | Error states, validation messages |
| `--md-sys-color-on-error` | `#FFFFFF` | Text on error surfaces |
| `--md-sys-color-error-container` | `#F9DEDC` | Error container backgrounds |
| `--md-sys-color-background` | `#FFFFFF` | App background |

### 2.4 NUS Semantic UI Colours (from nus.edu.sg)

These colours are used for specific UI regions on the live NUS site:

| Element | Colour | Hex | Usage |
|---------|--------|-----|-------|
| **Body background** | White | `#FFFFFF` | Main page background |
| **Body text** | Dark grey | `#333333` | Primary body text |
| **Secondary text** | Medium grey | `#555555` | Input text, form controls |
| **Muted text** | Grey | `#999999` | Captions, helper text, footer text |
| **Link colour** | NUS Blue | `#003D7C` | Hyperlinks, subheadings |
| **Link hover** | Dark navy | `#001730` | Hovered links |
| **Navbar background** | Light grey | `#F8F8F8` | Navigation bar |
| **Navbar border** | Silver | `#E7E7E7` | Navbar bottom border |
| **Navbar text** | Grey | `#777777` | Navigation links (default) |
| **Navbar active text** | Dark grey | `#555555` | Active navigation links |
| **Navbar active bg** | Silver | `#E7E7E7` | Active navbar item background |
| **Card background** | White | `#FFFFFF` | Card surfaces |
| **Card title** | Dark grey | `#333333` | Card title text |
| **Card subheading** | NUS Blue | `#003D7C` | Card sub-heading text |
| **Card hover bg** | Light grey | `#EEEEEE` | Card/list item hover state |
| **Section alt bg** | Off-white | `#F6F6F6` | Alternating section backgrounds |
| **Section alt bg 2** | Off-white | `#F3F3F3` | Secondary alternating sections |
| **Breadcrumb bar** | Dark navy | `#002449` | Breadcrumb navigation strip |
| **Footer background** | Dark blue | `#003062` | Page footer |
| **Footer text** | Grey | `#999999` | Footer body text |
| **Footer link** | Grey | `#999999` | Footer links (default) |
| **Footer link hover** | White | `#FFFFFF` | Footer links (hovered) |
| **Sidebar hover** | Light grey | `#EEEEEE` | Sidebar item hover |
| **Orange accent** | NUS Orange | `#EF7C00` | Hover accents, active items |
| **Submit button bg** | Mid blue | `#366BA4` | Form submit buttons |
| **Accent link blue** | Mid blue | `#1A5796` | Tonal blue for secondary links |

### 2.5 Dark Theme

Apply M3 dark theme by inverting tonal values. NUS Blue and NUS Orange remain recognizable but tonally adjusted:

| M3 Dark Role | Value |
|-------------|-------|
| `--md-sys-color-primary` | `#A8C8E8` (lightened NUS Blue) |
| `--md-sys-color-secondary` | `#FFB870` (lightened NUS Orange) |
| `--md-sys-color-surface` | `#1C1B1F` |
| `--md-sys-color-on-surface` | `#E6E1E5` |
| `--md-sys-color-background` | `#1C1B1F` |

### 2.6 Colour Usage Rules

- **DO:** Use NUS Blue for primary navigation and header bars
- **DO:** Use NUS Orange for primary call-to-action buttons
- **DO:** Ensure sufficient contrast between logo and background (WCAG AA minimum)
- **DON'T:** Use patterned backgrounds behind the NUS logo
- **DON'T:** Change the logo colours to non-approved variants
- **DON'T:** Use NUS Gold/Silver for UI elements — these are for special print collateral only

---

## 3. Typography

### 3.1 Primary Typeface — Roboto

Roboto is the approved NUS primary typeface for web and digital content. It is freely available from Google Fonts and provides exceptional legibility across all screen sizes.

```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
```

### 3.2 Secondary Typefaces

| Typeface | Usage | Availability |
|----------|-------|-------------|
| **Roboto** | Web, digital, print (recommended) | Google Fonts (free) |
| **Frutiger** | Print stationery, signage, logos only | Licensed (restricted) |
| **Arial** | Administrative forms, letters, non-marketing | Standard system font |
| **Helvetica** | Limited web use | Standard macOS font |
| **Verdana / Tahoma** | General use | Standard system font |
| **Noto Serif** | Serif contexts | Google Fonts (free) |

### 3.3 M3 Type Scale

Apply the Material Design 3 type scale using Roboto. The scale has 5 roles with 3 sizes each (15 styles total):

| Role | Size | Font Size | Line Height | Weight | Usage |
|------|------|-----------|-------------|--------|-------|
| **Display** | Large | 57px | 64px | 400 | Hero sections, splash screens |
| **Display** | Medium | 45px | 52px | 400 | Large feature text |
| **Display** | Small | 36px | 44px | 400 | Section introductions |
| **Headline** | Large | 32px | 40px | 400 | Page titles |
| **Headline** | Medium | 28px | 36px | 400 | Section headings |
| **Headline** | Small | 24px | 32px | 400 | Card titles |
| **Title** | Large | 22px | 28px | 500 | App bar titles |
| **Title** | Medium | 16px | 24px | 500 | Tab labels, subsections |
| **Title** | Small | 14px | 20px | 500 | Small subsection titles |
| **Body** | Large | 16px | 24px | 400 | Primary body text |
| **Body** | Medium | 14px | 20px | 400 | Secondary body text |
| **Body** | Small | 12px | 16px | 400 | Captions |
| **Label** | Large | 14px | 20px | 500 | Button labels, prominent labels |
| **Label** | Medium | 12px | 16px | 500 | Form labels, navigation items |
| **Label** | Small | 11px | 16px | 500 | Annotations, helper text |

### 3.4 Typography Rules

- Use **Roboto** as the primary font family for all web/digital applications
- Follow the M3 type scale roles — do not invent arbitrary font sizes
- Use **weight 500 (Medium)** for interactive elements (buttons, labels)
- Use **weight 400 (Regular)** for body text
- Minimum body text size: **14px** for readability
- Line height should always be at least **1.4×** the font size

---

## 4. Logo Usage

### 4.1 Logo Composition

The NUS logo has two inseparable elements:
1. **Modernised coat of arms**
2. **NUS namestyle**

Both must always appear together. Never use the coat of arms alone.

### 4.2 Logo Variants

| Variant | Background | Usage |
|---------|-----------|-------|
| **Full colour** | White/light backgrounds | Default usage |
| **Reversed** | NUS Blue or NUS Orange backgrounds | White logo on brand backgrounds |
| **Black & white** | When colour is unavailable | Monochrome contexts |
| **Blue** | Light backgrounds | Single-colour contexts |
| **Keyline** | N/A | Embossing and foil stamping only |

### 4.3 Clear Space

- **Print:** 20% clear space around the logo on all sides
- **Web:** Clear space equal to the height of the letter "N" in the NUS namestyle
- **Web banner:** Clear space equal to 50% height of the letter "N"

### 4.4 Minimum Size

- **Horizontal logo (print):** Minimum width 20mm
- **Vertical logo (print):** Minimum height 20mm
- **Web:** Follow pixel-based minimum size guidelines from corporate identity documentation

### 4.5 Co-branding (e.g., uNivUS)

When co-branding with sub-logos (like uNivUS):
- NUS logo must appear alongside the sub-logo
- Use an approved co-branded logo layout
- Separate with a vertical divider line
- NUS entities are not permitted to create their own co-branded logos
- All sub-logos require approval from the NUS President

### 4.6 Incorrect Usage — Avoid

- Insufficient contrast between logo and background
- Boxing up the logo (logos should be placed in bars extending edge-to-edge)
- Changing the logo's colours to non-approved variants
- Non-proportional scaling (horizontal or vertical distortion)

---

## 5. Layout & Spacing

### 5.1 M3 Layout Principles

- Use layout to direct attention to the user's primary action
- Adapt layouts across **5 window size classes**: compact, medium, expanded, large, extra-large
- Build from established **canonical layouts** (list-detail, supporting pane, feed)
- Consider how spacing and layout parts work together

### 5.2 Window Size Classes (Breakpoints)

| Class | Width Range | Columns | Margins | Usage |
|-------|-----------|---------|---------|-------|
| **Compact** | < 600px | 4 | 16px | Mobile phones |
| **Medium** | 600–839px | 8 | 24px | Tablets portrait, foldables |
| **Expanded** | 840–1199px | 12 | 24px | Tablets landscape, small desktop |
| **Large** | 1200–1599px | 12 | 24px | Desktop |
| **Extra-large** | ≥ 1600px | 12 | 24px | Large monitors |

### 5.3 Spacing Scale

Use a consistent 4px base grid. Standard spacing values:

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | 4px | Tight spacing between related elements |
| `--spacing-sm` | 8px | Default spacing between inline elements |
| `--spacing-md` | 16px | Standard component padding |
| `--spacing-lg` | 24px | Section spacing, card padding |
| `--spacing-xl` | 32px | Large section gaps |
| `--spacing-2xl` | 48px | Page-level spacing |
| `--spacing-3xl` | 64px | Major section divisions |

### 5.4 Layout Terms

- **Column:** Vertical content blocks within a pane
- **Margin:** Space between screen edge and content
- **Pane:** Layout container housing components (fixed, flexible, floating, or semi-permanent)
- **Spacer:** Space between two panes
- **Drag handle:** Component that resizes panes

### 5.5 Application Layout Pattern (from Figma)

Based on the uNivUS Registration Portal design, standard NUS application layout:

```
┌─────────────────────────────────────────────┐
│ Header: [NUS Logo] | [Sub-brand Logo]       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐    ┌──────────────────┐   │
│  │ Content /    │    │ Hero Image /     │   │
│  │ Form Panel   │    │ Illustration     │   │
│  │ (Left)       │    │ (Right)          │   │
│  └──────────────┘    └──────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│ Footer: Legal notice / Copyright             │
└─────────────────────────────────────────────┘
```

- Desktop width: **1440px** (standard viewport)
- Header: **60px** height with logo area padded **60px** from left
- Content area: split layout with form/content on left, visual on right
- Footer: **79px** height with centered copyright text

---

## 6. Component Library (Material Design 3)

### 6.1 Component Categories

Use M3 components organized by purpose:

#### Action Components
| Component | Usage | Reference |
|-----------|-------|-----------|
| **Buttons** | Primary actions (filled), secondary actions (outlined/tonal) | [M3 Buttons](https://m3.material.io/components/buttons) |
| **FABs** | Primary floating action on screen | [M3 FABs](https://m3.material.io/components/floating-action-button) |
| **Extended FABs** | Primary action with label text | [M3 Extended FAB](https://m3.material.io/components/extended-fab) |
| **Icon Buttons** | Compact actions (toolbar, cards) | [M3 Icon Buttons](https://m3.material.io/components/icon-buttons) |
| **Segmented Buttons** | Toggle between 2-5 options | [M3 Segmented Buttons](https://m3.material.io/components/segmented-buttons) |

#### Containment Components
| Component | Usage | Reference |
|-----------|-------|-----------|
| **Cards** | Content containers with actions | [M3 Cards](https://m3.material.io/components/cards) |
| **Dialogs** | Critical information, confirmations | [M3 Dialogs](https://m3.material.io/components/dialogs) |
| **Bottom Sheets** | Supplementary content, actions | [M3 Bottom Sheets](https://m3.material.io/components/bottom-sheets) |
| **Side Sheets** | Persistent supplementary content | [M3 Side Sheets](https://m3.material.io/components/side-sheets) |
| **Divider** | Separate content sections | [M3 Divider](https://m3.material.io/components/divider) |

#### Communication Components
| Component | Usage | Reference |
|-----------|-------|-----------|
| **Badges** | Notification counts, status indicators | [M3 Badges](https://m3.material.io/components/badges) |
| **Progress Indicators** | Loading, task progress | [M3 Progress](https://m3.material.io/components/progress-indicators) |
| **Snackbar** | Brief feedback messages | [M3 Snackbar](https://m3.material.io/components/snackbar) |

#### Navigation Components
| Component | Usage | Reference |
|-----------|-------|-----------|
| **App Bars** | Top-level navigation and actions | [M3 App Bars](https://m3.material.io/components/app-bars) |
| **Navigation Bar** | Primary bottom navigation (mobile) | [M3 Navigation Bar](https://m3.material.io/components/navigation-bar) |
| **Navigation Drawer** | Full navigation menu | [M3 Navigation Drawer](https://m3.material.io/components/navigation-drawer) |
| **Navigation Rail** | Side navigation (tablet/desktop) | [M3 Navigation Rail](https://m3.material.io/components/navigation-rail) |
| **Tabs** | Content organization within a view | [M3 Tabs](https://m3.material.io/components/tabs) |

#### Selection Components
| Component | Usage | Reference |
|-----------|-------|-----------|
| **Checkbox** | Multi-select options | [M3 Checkbox](https://m3.material.io/components/checkbox) |
| **Radio Button** | Single-select from options | [M3 Radio Button](https://m3.material.io/components/radio-button) |
| **Switch** | Toggle binary settings | [M3 Switch](https://m3.material.io/components/switch) |
| **Chips** | Filters, selections, actions | [M3 Chips](https://m3.material.io/components/chips) |
| **Sliders** | Range/value selection | [M3 Sliders](https://m3.material.io/components/sliders) |
| **Date Pickers** | Date selection | [M3 Date Pickers](https://m3.material.io/components/date-pickers) |
| **Time Pickers** | Time selection | [M3 Time Pickers](https://m3.material.io/components/time-pickers) |

#### Text Input Components
| Component | Usage | Reference |
|-----------|-------|-----------|
| **Text Fields** | User text input (filled/outlined) | [M3 Text Fields](https://m3.material.io/components/text-fields) |
| **Search** | Search functionality | [M3 Search](https://m3.material.io/components/search) |

### 6.2 Button Hierarchy (NUS-branded)

```
Primary Action:   Filled Button    → NUS Blue (#003D7C) background, white text
Secondary Action: Outlined Button  → NUS Orange (#EF7C00) border, NUS Orange text
Tertiary Action:  Text Button      → NUS Blue text, no border
Destructive:      Filled Button    → Error (#B3261E) background, white text
```

### 6.3 Form Pattern (from Figma)

Standard NUS form fields follow this structure:

```
Label text (Label Medium, 12px, weight 500)
┌─────────────────────────────────────┐
│ Input value                          │  ← Outlined text field, 43px height
└─────────────────────────────────────┘
Helper/Error text (Body Small, 12px)
```

- Field width: full container width (e.g., 426px in form panel)
- Field height: **43px**
- Label position: above field
- Error text colour: `#B3261E` (M3 error)
- Date fields include a trailing calendar icon (`calendar_month`, 24×24px)

---

## 7. Elevation & Surfaces

### 7.1 M3 Elevation Levels

M3 uses tonal colour (not just shadows) to communicate elevation:

| Level | dp | Shadow | Usage |
|-------|-----|--------|-------|
| **Level 0** | 0dp | None | Page background, flat surfaces |
| **Level 1** | 1dp | Subtle | Cards at rest, navigation surfaces |
| **Level 2** | 3dp | Light | Elevated cards, app bars |
| **Level 3** | 6dp | Medium | FABs, navigation drawers |
| **Level 4** | 8dp | Pronounced | Menus, dialog containers |
| **Level 5** | 12dp | Strong | Modal overlays |

### 7.2 Elevation Rules

- Surfaces at higher elevation are tonally darker (light theme) or lighter (dark theme)
- Do **not** change default elevation of M3 components
- Components increase elevation by **1 level** on hover
- Use shadows only when needed for contrast — prefer tonal elevation
- Avoid using more than 3 elevation levels on a single screen

---

## 8. Interaction States

### 8.1 State Definitions

| State | Visual Indicator | Description |
|-------|-----------------|-------------|
| **Enabled** | Default appearance | Component is interactive and ready |
| **Disabled** | 38% opacity | Component is non-interactive |
| **Hover** | State layer at 8% opacity | Cursor placed over element |
| **Focused** | State layer at 10% opacity + focus ring | Element highlighted via keyboard/voice |
| **Pressed** | State layer at 10% opacity | User tap/click feedback |
| **Dragged** | State layer at 16% opacity + elevation increase | Element being moved |

### 8.2 State Layer Colours

State layers use the component's **on-colour** at reduced opacity:

```css
/* Example: Primary button states (Primary filled = NUS Orange #EF7C00) */
.btn-primary:hover    { background: color-mix(in srgb, #EF7C00 92%, white); }
.btn-primary:focus    { background: color-mix(in srgb, #EF7C00 90%, white); }
.btn-primary:active   { background: color-mix(in srgb, #EF7C00 88%, white); }
.btn-primary:disabled { opacity: 0.38; }
```

### 8.3 State Rules

- States must be applied consistently across all similar components
- Always support both pointer (mouse) and keyboard interaction states
- Disabled elements should have **38% opacity** and be non-interactive
- Combined states (e.g., selected + hover) layer their visual indicators

---

## 9. Design Tokens

### 9.1 Token Architecture (M3)

Material Design uses three classes of tokens:

1. **Reference tokens** (`md.ref.*`) — All available style options (palette, typefaces)
2. **System tokens** (`md.sys.*`) — Design decisions for the theme (colour roles, type scale)
3. **Component tokens** (`md.comp.*`) — Style properties for specific components

### 9.2 NUS Custom Tokens

```css
:root {
  /* === NUS Brand Tokens === */
  --nus-color-orange: #EF7C00;
  --nus-color-blue: #003D7C;
  --nus-color-gold: #866D4B; /* Approx. PMS 872 */
  --nus-color-silver: #A7A8AA; /* Approx. PMS 8420 */

  /* === Surface Tokens (from nus.edu.sg) === */
  --nus-surface-primary: #FFFFFF;
  --nus-surface-secondary: #F6F6F6;
  --nus-surface-tertiary: #F3F3F3;
  --nus-surface-elevated: #FFFFFF;
  --nus-surface-card: #FFFFFF;
  --nus-surface-card-hover: #EEEEEE;
  --nus-surface-navbar: #F8F8F8;
  --nus-surface-breadcrumb: #002449;
  --nus-surface-footer: #003062;
  --nus-surface-submit-btn: #366BA4;

  /* === Text Tokens (from nus.edu.sg) === */
  --nus-text-primary: #333333;
  --nus-text-secondary: #555555;
  --nus-text-muted: #999999;
  --nus-text-disabled: rgba(51, 51, 51, 0.38);
  --nus-text-on-primary: #FFFFFF;
  --nus-text-on-secondary: #FFFFFF;
  --nus-text-link: #003D7C;
  --nus-text-link-hover: #001730;
  --nus-text-heading: #333333;
  --nus-text-card-subheading: #003D7C;
  --nus-text-navbar: #777777;
  --nus-text-navbar-active: #555555;
  --nus-text-footer: #999999;
  --nus-text-footer-hover: #FFFFFF;
  --nus-text-error: #B3261E;

  /* === Border Tokens (from nus.edu.sg) === */
  --nus-border-default: #E7E7E7;
  --nus-border-subtle: #E0E0E0;
  --nus-border-navbar: #E7E7E7;
  --nus-border-focused: #003D7C;
  --nus-border-error: #B3261E;

  /* === Spacing Tokens === */
  --nus-spacing-xs: 4px;
  --nus-spacing-sm: 8px;
  --nus-spacing-md: 16px;
  --nus-spacing-lg: 24px;
  --nus-spacing-xl: 32px;
  --nus-spacing-2xl: 48px;

  /* === Border Radius Tokens === */
  --nus-radius-sm: 4px;
  --nus-radius-md: 8px;
  --nus-radius-lg: 12px;
  --nus-radius-xl: 16px;
  --nus-radius-full: 9999px;

  /* === Typography Tokens === */
  --nus-font-family-primary: 'Roboto', sans-serif;
  --nus-font-family-serif: 'Noto Serif', serif;

  /* === Elevation Tokens === */
  --nus-elevation-1: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
  --nus-elevation-2: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
  --nus-elevation-3: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3);
}
```

---

## 10. UI Patterns from Figma Designs

### 10.1 Application Header

From the uNivUS Registration Portal design:

```
[NUS Logo (133×61px)] | [Sub-brand Logo (131×35px)]
```

- Header padding: **60px** from left edge
- Logo divider: vertical line separating NUS logo and sub-brand
- Total header area: **296×61px**
- Position: top-left of viewport

### 10.2 Login / Authentication Screen

```
┌──────────────────────────────────────────────────────────┐
│ [Header: NUS + uNivUS logos]                             │
│                                                          │
│  ┌── Form Panel (426px wide) ──┐  ┌── Hero Image ──┐    │
│  │ "Hi, welcome!"              │  │ (748×976px)     │    │
│  │ Description text            │  │ Full-height     │    │
│  │                             │  │ illustration    │    │
│  │ [Application Number]        │  │ or photo        │    │
│  │ [Date of Birth 📅]          │  └─────────────────┘    │
│  │ [reCAPTCHA]                 │                         │
│  │ [Submit Button]             │                         │
│  └─────────────────────────────┘                         │
│                                                          │
│ [Footer: Legal notice + Copyright]                       │
└──────────────────────────────────────────────────────────┘
```

### 10.3 Welcome / Greeting Screen

```
┌──────────────────────────────────────────────────────────┐
│ [Header: NUS + uNivUS logos]                             │
│                                                          │
│              "Hi, [Name]!"                               │
│         Description text (centered)                      │
│                                                          │
│         [Illustration (422×481px)]                       │
│                                                          │
│         [ Get Started Button (320×48px) ]                │
│                                                          │
│ [Footer: Legal notice + Copyright]                       │
└──────────────────────────────────────────────────────────┘
```

### 10.4 Form Validation States

**Valid state:**
- Default outlined text field appearance
- No helper text or green indicator

**Error state:**
- Red border on text field
- Error message below field: Body Small (12px), colour `#B3261E`
- Example: "Invalid! Please enter a valid application number."

### 10.5 Footer Pattern

```
Property of NUS and for authorised users only. By continuing to use this
application which is governed by the NUS Acceptable Use Policy, you represent
that you are an authorised user.
© Copyright 2001–{CURRENT_YEAR} National University of Singapore. All Rights Reserved.
```

- Height: **79px**
- Text: centered, Body Small
- Background: matches page or uses surface-variant

### 10.6 Decorative Background

- Wave/curve decorative elements at the bottom of the viewport
- Uses subtle gradient fills
- Does not interfere with content readability

---

## 11. Accessibility

### 11.1 WCAG Compliance

All NUS applications must meet **WCAG 2.1 AA** minimum:

| Criterion | Requirement |
|-----------|-------------|
| **Text contrast** | Minimum 4.5:1 for normal text, 3:1 for large text |
| **Interactive elements** | Minimum 3:1 contrast against adjacent colours |
| **Focus indicators** | Visible focus ring on all interactive elements |
| **Touch targets** | Minimum 48×48px for mobile, 44×44px for desktop |
| **Text resize** | Content must remain usable at 200% zoom |
| **Colour independence** | Never use colour alone to convey information |

### 11.2 NUS-specific Accessibility Notes

- NUS Orange (`#EF7C00`) on white has a contrast ratio of ~3.3:1 — use only for **large text** (18px+) or non-text elements
- NUS Blue (`#003D7C`) on white has a contrast ratio of ~8.5:1 — safe for all text sizes
- For body text on white backgrounds, prefer NUS Blue or dark neutrals
- Always provide text labels alongside colour-coded status indicators

### 11.3 M3 Contrast Levels

M3 supports three levels of contrast:
- **Standard contrast** — default for most users
- **Medium contrast** — increased readability
- **High contrast** — maximum accessibility

---

## 12. Figma Design References

### Mosaic Designs (Design System)

| Screen | Figma URL |
|--------|-----------|
| Component Library | [node 1508:139](https://www.figma.com/design/9UHWarRi1z6ErimkAdiFhv/Mosaic-Designs?node-id=1508-139) |
| Additional Components | [node 2350:295](https://www.figma.com/design/9UHWarRi1z6ErimkAdiFhv/Mosaic-Designs?node-id=2350-295) |
| Base Styles | [node 10:2](https://www.figma.com/design/9UHWarRi1z6ErimkAdiFhv/Mosaic-Designs?node-id=10-2) |
| Form Patterns | [node 1111:548](https://www.figma.com/design/9UHWarRi1z6ErimkAdiFhv/Mosaic-Designs?node-id=1111-548) |
| Navigation Patterns | [node 1321:627](https://www.figma.com/design/9UHWarRi1z6ErimkAdiFhv/Mosaic-Designs?node-id=1321-627) |

### uNivUS Registration Portal

| Screen | Figma URL |
|--------|-----------|
| All Screens | [node 0:1](https://www.figma.com/design/mFWBi8lHELYgnEK8FaQ7vu/uNivUS-Registration-Portal?node-id=0-1) |

### Material Design 3 References

| Topic | URL |
|-------|-----|
| Components | [m3.material.io/components](https://m3.material.io/components) |
| Foundations | [m3.material.io/foundations](https://m3.material.io/foundations) |
| Color System | [m3.material.io/styles/color/overview](https://m3.material.io/styles/color/overview) |
| Typography | [m3.material.io/styles/typography/overview](https://m3.material.io/styles/typography/overview) |
| Elevation | [m3.material.io/styles/elevation/overview](https://m3.material.io/styles/elevation/overview) |
| Layout | [m3.material.io/foundations/layout](https://m3.material.io/foundations/layout/understanding-layout/overview) |
| Interaction States | [m3.material.io/foundations/interaction-states](https://m3.material.io/foundations/interaction-states) |
| Design Tokens | [m3.material.io/foundations/design-tokens](https://m3.material.io/foundations/design-tokens/overview) |

---

## Quick Reference Card

```
NUS Blue:       #003D7C    (headers, navigation, links, primary)
NUS Orange:     #EF7C00    (CTAs, accent, secondary actions)
Error:          #B3261E    (validation errors)
Font:           Roboto (300/400/500/700)
Base grid:      4px
Breakpoints:    600 / 840 / 1200 / 1600 px
Desktop width:  1440px
Field height:   43px
Button height:  43-48px
Touch target:   48×48px minimum
Contrast:       WCAG AA (4.5:1 text, 3:1 large/UI)
```
