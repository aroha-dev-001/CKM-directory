---
name: immersive-3d-admin
description: Build only the dedicated admin/studio panel for a 3D immersive walk. Use for /immersive-3d-admin.
---

Build a **dedicated admin studio** for a scroll-driven 3D walk. Do not put this HUD on the public marketing page.

Deliver a `studio/` (or equivalent) that:

- Loads the same `walk.config.json` the public player uses.
- Shows a grouped panel: World, Camera, Motion, Focus, Plates, Shards, Particles, Copy rail, Navigation, A11y. Every JSON leaf is a control.
- Live-applies sliders to the 3D walk. Toggle with `H`.
- Import JSON, Export JSON, Reset to defaults. Export filename `<project>.walk.json`.
- Runs with `python3 studio/serve.py` (uncommon port, bind 0.0.0.0).
- Includes `build_static.py` (or equivalent) so the studio can be deployed as its **own** password-protected static host. Do not use a temporary Cloudflare quick tunnel as the product.

Document the publish pipeline: export JSON → replace the player's `walk.config.json` → deploy the player only.

If no player exists yet, scaffold a minimal live preview inside the studio that reads the same config, and tell them to run `/immersive-3d-page` for the public site.
