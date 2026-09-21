---
name: immersive-3d-page
description: Build only the public 3D immersive webpage (no admin HUD). Use for /immersive-3d-page.
---

Build a standalone scroll-driven 3D immersive **public player**. Do not attach it to an unrelated existing app.

Deliver:

- Numbered beat plan (stills, titles, body).
- `walk.config.json` with world, camera, motion, focus, plates, shards, particles, copyRail, nav, theme, beats, a11y.
- `index.html` + CSS + JS: sticky canvas, Three.js corridor of stills, copy rail opposite the plates, scroll `t` 0–1.
- Fetch `walk.config.json` at boot. No hardcoded camera/fog/plate numbers.
- Preload then WebGL; 2D fallback if init fails; never 2D then WebGL on the same canvas.
- Reduced-motion longread. Type stays readable (plates do not cover the rail).
- README: how to run locally on an uncommon port.

Do **not** include an admin HUD on this player. If they also need a studio, say to run `/immersive-3d-admin` or `/immersive-3d`.
