---
name: Clarion
colors:
  surface: '#faf9f8'
  surface-dim: '#dadad9'
  surface-bright: '#faf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f2'
  surface-container: '#eeeeed'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e1'
  on-surface: '#1a1c1c'
  on-surface-variant: '#464553'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f0f0'
  outline: '#777584'
  outline-variant: '#c8c4d5'
  surface-tint: '#544fc0'
  primary: '#1f108e'
  on-primary: '#ffffff'
  primary-container: '#3730a3'
  on-primary-container: '#a9a7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#511c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#752c00'
  on-tertiary-container: '#fe9562'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3b35a7'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb694'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7a3003'
  background: '#faf9f8'
  on-background: '#1a1c1c'
  surface-variant: '#e3e2e1'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  metadata:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar_width: 280px
  max_content_width: 1200px
  gutter: 24px
  margin_mobile: 16px
  margin_desktop: 40px
  stack_sm: 8px
  stack_md: 16px
  stack_lg: 32px
---

## Brand & Style
The design system is built for an AI-curated news environment that prioritizes editorial authority and cognitive ease. The brand personality is "The Discerning Curator"—intelligent, objective, and calm. 

The visual style blends **Modern Minimalism** with **Editorial Sophistication**. It leverages a high-contrast typographic hierarchy to distinguish between curated content and functional UI. The aesthetic is defined by its "ink-on-paper" feel, utilizing generous whitespace and a restricted color palette to reduce decision fatigue. Precision is communicated through thin 1px borders and a systematic grid, while approachable "rounded-xl" surfaces prevent the interface from feeling overly clinical.

## Colors
The palette is centered on a warm, high-readability foundation. 

- **Primary (Deep Indigo):** Reserved strictly for interactive affordances (links, primary buttons) and active states.
- **Surface (Off-White):** The `#FDFCFB` background reduces eye strain compared to pure white, mimicking premium newsprint.
- **Ink (Near-Black):** Used for primary text to ensure maximum WCAG AAA contrast.
- **Semantic Accents:** Subdued versions of Green, Gray, and Red are used for sentiment analysis and status badges, ensuring they inform without distracting from the news content.

For the dark variant, the surface shifts to `#121212`, and the "Ink" text becomes `#F3F4F6`.

## Typography
This design system employs a dual-typeface strategy to separate narrative from interface.

- **Source Serif 4:** Used for headlines and long-form article titles. It provides the authoritative, literary weight required for news.
- **Hanken Grotesk:** Used for the UI framework, body copy, and metadata. Its contemporary, sharp geometry ensures clarity in dense information environments like sidebars and data-heavy feeds.

**Guidelines:**
- Use `display-lg` exclusively for featured story headers.
- All labels and category tags should use `label-sm` with slight tracking for professional polish.
- Body copy should never drop below 16px to maintain accessibility.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid grid**. 

- **Navigation:** A persistent 280px left sidebar anchors the experience, providing immediate access to categories and AI-saved feeds.
- **Content Area:** The main feed utilizes a max-width of 1200px to prevent line lengths from becoming unreadable on ultra-wide monitors.
- **Grid:** A 12-column grid is used for the desktop dashboard. Cards typically span 4 columns (3-up) or 6 columns (2-up).
- **Responsive:** On mobile, the sidebar collapses into a bottom navigation bar or a hamburger menu, and margins reduce to 16px. Spacing follows a strict 8px base unit to ensure rhythmic consistency.

## Elevation & Depth
In alignment with the professional aesthetic, this design system eschews heavy shadows in favor of **Tonal Layering and Thin Outlines**.

- **Surfaces:** Use `#FFFFFF` for cards against the `#FDFCFB` background to create a subtle "lift."
- **Borders:** All cards, dividers, and input fields utilize a 1px solid border in `#E5E7EB`.
- **Shadows:** Only used for floating elements (e.g., dropdowns, modals). Use a single, highly diffused shadow: `0 4px 20px rgba(0, 0, 0, 0.05)`.
- **Depth Hierarchy:** The sidebar is visually separated by a 1px vertical border rather than a shadow, maintaining a flat, editorial feel.

## Shapes
The shape language balances structural rigor with modern approachability.

- **Cards & Containers:** Use `rounded-xl` (1.5rem / 24px) to soften the information-dense layout.
- **Search & Interactive Pills:** The search bar and sentiment indicators use a full "pill" radius to distinguish them from content containers.
- **Buttons:** Follow the standard `rounded-lg` (1rem / 16px) for a balanced appearance.

## Components
- **Buttons:** Primary buttons are solid Deep Indigo (`#3730A3`) with white text. Secondary buttons use a 1px border with no fill.
- **Search Bar:** A persistent pill-shaped input with a subtle `#F3F4F6` fill and a magnifying glass icon.
- **Sentiment Pills:** Small, rounded-full badges used for AI analysis (e.g., "Bullish," "Neutral," "Skeptical"). These use low-saturation background tints with high-saturation text of the same hue.
- **News Cards:** Must include a serif headline, a Hanken Grotesk summary, a metadata row (source + time), and a sentiment indicator in the top-right corner.
- **Sidebar Items:** Clear, typographic links with 12px of vertical padding. Active states are indicated by a 3px vertical Indigo line on the left edge.
- **Input Fields:** 1px border, 12px internal padding, using `body-md` typography.