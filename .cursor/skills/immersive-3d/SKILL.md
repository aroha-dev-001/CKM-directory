---
name: immersive-3d
description: Scaffold a public 3D immersive walk plus a dedicated studio/admin. Use for /immersive-3d, walk.config.json, or client 3D corridors. Public player has no HUD. Studio is a separate host.
---

# Immersive 3D

Read `walk.config.schema.json` if present. Follow `~/.cursor/agents/immersive-3d.md`.

## Split

| Surface | Path | HUD |
| --- | --- | --- |
| Public player | `index.html` or `dist/` | No. Fetches `walk.config.json`. |
| Studio | `studio/` | Yes. Import/export the same JSON. |

Publish: studio Export → replace player JSON → deploy player. Deploy studio separately (`studio/build_static.py`) with password protection. Not a trycloudflare URL.

## Player

Sticky canvas, Three.js plates, copy rail, preload then WebGL, 2D fallback, reduced motion.

## Studio

One control per config leaf. `H` toggles. Groups: World, Camera, Motion, Focus, Plates, Shards, Particles, Copy, Nav, A11y.

## Don't

- HUD on the public site
- Hardcoded camera numbers
- 2D then WebGL on the same canvas
- Nesting in an unrelated app
