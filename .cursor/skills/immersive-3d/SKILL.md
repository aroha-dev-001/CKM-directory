---
name: immersive-3d
description: Scaffold or tune a standalone scroll-driven 3D immersive walk. Use when building a new corridor of stills, a walk.config.json, a parameter HUD, or camera/fog/plate/copy-rail controls. Never attach to an unrelated existing app.
---

# Immersive 3D walk

Read `walk.config.schema.json` in this skill folder before writing config. The agent prompt at `~/.cursor/agents/immersive-3d.md` is the product contract.

## Isolation

New folder or repo only. Do not patch a host marketing site, design system, or deploy project unless the user names it.

## Files to create

- `walk.config.json` — all knobs; matches the schema
- `index.html` — sticky `#reel`, spacer, copy rail, canvas, HUD root
- `walk.css` — rail vs stage layout; HUD panel
- `walk.js` — preload → WebGL corridor (Three.js r149+ from a vendored or CDN build) or 2D fallback
- `hud.js` — generates controls from config keys; export/import JSON
- `README.md` — run locally (`python3 -m http.server` or Vite on an uncommon port)

## Layout

Desktop: copy rail on `copyRail.side` (default left), plates at `plates.baseX` on the other side. Mobile: rail as bottom gradient, `baseXMobile` / `rightBiasMobile`. Focus changes opacity and a small idle drift only — never multiply `baseX` toward 0.

## HUD

Toggle `H`. One control per schema leaf. Group by World, Camera, Plates, Shards, Copy rail, Motion, Theme, A11y. Beats editor: list with still URL, titles, body, lore, z, hold. Export downloads `walk.config.json`.

## Motion

`t = clamp(scroll / (scrollHeight - viewport))`. Apply `motion.easing`. Beat focus uses `focusSharpness` and `focusWidth`. Spacer height = `world.scrollHeightVh`.

## Don't

- Slide decks (full-viewport swap with no z travel)
- Stacked overlapping copy cards
- 2D context then WebGL on the same canvas
- Hardcoded colors or camera numbers outside JSON
