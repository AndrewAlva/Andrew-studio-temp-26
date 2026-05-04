# Andrew Studio — Portfolio

Provisional portfolio showcasing projects from the past 5 years, built with Astro, Three.js, GLSL, and TypeScript.

## Stack

- [Astro](https://astro.build) — static site framework
- [Three.js](https://threejs.org) — 3D scenes and WebGL
- [GSAP](https://gsap.com) — animation
- TypeScript, vanilla CSS

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/AndrewAlva/Andrew-studio-temp-26.git
cd Andrew-studio-temp-26

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The site will be available at **http://localhost:4321**.

## Other commands

```bash
npm run build      # Production build → dist/
npm run preview    # Preview the production build locally
```

## Project structure

```
src/
  pages/           # index.astro (Home) and about.astro
  layouts/         # Layout.astro — shared shell
  components/      # Astro components (Nav, ContactModal, ProjectCard, etc.)
  scenes/          # Three.js scene classes (GlassCarouselScene, WindowScene)
  shaders/         # GLSL vertex and fragment shaders (.vert / .frag)
  utils/           # Shared utilities (raf, motion, cursor, time, modal, etc.)
  content/         # Astro content collections (projects, about)
  config/          # Site-wide constants
public/
  thumbnails/      # Project thumbnail images (add your own)
  window-photos/   # Time-of-day window photos for the About page (add your own)
  fonts/           # Fonts are loaded from Google Fonts — this dir is a placeholder
```

## Adding content

**Projects:** add a `.mdx` file to `src/content/projects/` following the schema in `src/content/config.ts`. Place the thumbnail image in `public/thumbnails/`.

**About page:** edit `src/content/about/index.mdx` with your bio, approach paragraphs, project types, clients, and awards.

**Window photos:** add photos to `public/window-photos/` and update `WindowScene.ts` with the correct filenames per time-of-day mood.

**Contact form:** replace `REPLACE_WITH_YOUR_ID` in `src/utils/formHandler.ts` with your [Formspree](https://formspree.io) form ID.
