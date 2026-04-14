# UI Spec

Date: 2026-04-14
Project: DevChell Portfolio

## Direction

Rebuild the portfolio as a cleaner editorial interface with code-native accents,
using the original Figma only as loose structural reference.

## Visual Principles

- Reduce hard borders and section dividers in favor of soft surfaces and shadow.
- Keep the code language intentional: mono type for `</DevChell>`, About code view,
  and Contact simulator only.
- Use a warm off-white canvas in light mode and a restrained graphite palette in dark mode.
- Let content breathe through spacing, but avoid oversized dead zones.
- Make every large element earn its footprint.

## Layout Contract

- Navbar: floating pill shell, softer presence, clear active state, never obscures sections.
- Hero: two-column desktop, stacked mobile, with one text block and one code support card.
- About: one clean reading card plus one code card, visually balanced.
- Projects: screenshot first, metadata second; project name, stack badges, CTA, and summary
  must keep stable positions even when titles vary in length.
- Contact: must behave like a code simulator, not a decorative form next to code.
- Footer: compact, light, and secondary.

## Typography

- UI copy uses the main sans font.
- Code contexts use mono font with readable line-height and restrained syntax color.
- Headings should feel bold and sharp, but not oversized for the viewport.

## Interaction

- Free scroll, smooth transitions, visible hover states.
- Section reveal animations stay subtle.
- Carousels and CTAs must remain obvious on both desktop and mobile.

## Quality Bar

- Desktop, tablet, and mobile all keep the same visual hierarchy.
- No element may drift into another role because of content length.
- The page should feel designed, not merely arranged.
