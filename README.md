# JJ Bassig · Portfolio

Personal portfolio for **Jj Sanchez Bassig**, aspiring full stack software engineer, BSIT 3rd year at Pamantasan ng Lungsod ng Pasig.

## Structure

```
portfolio/
├── index.html
├── assets/        images, fonts (Usual Regular and Semibold), favicon, resume.pdf
├── css/
│   ├── main.css         imports everything, in order
│   ├── variables.css    ALL design tokens (colors, type, spacing, padding, radius, shadow)
│   ├── reset.css
│   ├── animations.css   background, grain, glitch, reveal, cursor, intro
│   ├── layout.css       header (top bar / mobile tab bar), sections, footer
│   ├── components.css   buttons, link rows, modal
│   ├── sections.css     hero text, about, skills, projects, contact
│   └── robot.css        hero robot, unchanged, with its own scoped tokens
└── js/
```

## Design system

Follows `ux-ui-guidelines.md`. Everything is a token in `variables.css`.

- **Palette:** Tailwind CSS v4 default palette. Zinc for neutrals, Blue for the single accent. 60% `--bg`, 30% `--surface`, 10% `--accent`.
- **Type:** Usual, weights 400 and 600 only. Sizes: 16 (UI and meta), 20 (body copy, 18 on mobile), 24 (headings), plus one display size (hero name, project title), following Pixel Point.
- **Spacing:** 8px grid (`--sp-1` to `--sp-10`, 4px for tight gaps only).
- **Padding:** named tokens (`--padding-control`, `-cell`, `-menu`, `-card`, `-modal`, `-header`, `-page`).
- **Radius:** 8px (`--radius-md`) and 16px (`--radius-lg`).
- **Shadow:** one token, `--shadow-float`, used only on the modal.
- **No** glows, gradients, single-side borders, emojis or exclamation marks.
- **Navigation:** top bar on desktop, bottom tab bar on mobile (icons always paired with labels).
- **Tab title:** `Page | JJ Bassig`, follows the active section and the open project.

To change the look, edit `variables.css` only.

## The robot

`#heroFace` (hero) and the intro robot keep their shape and animations. Their CSS lives in `css/robot.css` (the intro robot's styles are injected by `js/intro.js`). Both take their colors from the site tokens (`--accent`, `--surface`, `--text`, `--muted`), so they match the palette in light and dark.

## Tech

Plain HTML, CSS and vanilla JS. External: Phosphor icons, three.js r134 and Vanta 0.5.24 (both pinned).
