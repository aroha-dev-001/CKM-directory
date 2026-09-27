# Walk studio (dedicated admin)

This is the **admin config panel** for a 3D immersive walk. It is **not** the public site.

The saved config is `studio/bean-to-cup.walk.json`. The live `/bean-to-cup` page does **not** read it: that page is the scroll-driven flight in `components/walk/` (scrollcraft engine), not this 3D walk. Treat the studio as a design tool for a future 3D player.

## Save an exported JSON

```bash
python3 scripts/apply_walk_json.py ~/Downloads/bean-to-cup.walk.json
```

## Run the admin locally (no Cloudflare)

```bash
python3 studio/serve.py
```

Open `http://127.0.0.1:43192/studio/bean-to-cup/`. Press **H**. **Save config** writes `studio/bean-to-cup.walk.json`; **Export JSON** downloads it.

## Dedicated admin URL for a client (permanent, not trycloudflare)

Build a static bundle and deploy it as a **second** host (Vercel/Netlify), with password protection:

```bash
python3 studio/build_static.py
# deploy studio/dist-site as its own project, e.g.
#   cd studio/dist-site && npx vercel --prod --yes
```

Do not merge this folder into the public companion build (`out/`).

## New client walks

Use `/immersive-3d` (builds player + studio) or the two prompts:

- `/immersive-3d-page`, public 3D walk only
- `/immersive-3d-admin`, dedicated studio/admin only
