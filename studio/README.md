# Walk studio (dedicated admin)

This is the **admin config panel** for a 3D immersive walk. It is **not** the public site.

The public player reads `dist/bean-to-cup.walk.json` and has no HUD.

## Apply an exported JSON to production

1. Replace `dist/bean-to-cup.walk.json` with your export (`bean-to-cup.walk.json`).
2. Deploy only `dist/` (the companion Vercel project).

```bash
cp ~/Downloads/bean-to-cup.walk.json dist/bean-to-cup.walk.json
# then commit + deploy dist
```

Or:

```bash
python3 scripts/apply_walk_json.py ~/Downloads/bean-to-cup.walk.json
```

## Run the admin locally (no Cloudflare)

```bash
python3 studio/serve.py
```

Open `http://127.0.0.1:43192/studio/bean-to-cup/`. Press **H**. Export JSON, then apply as above.

## Dedicated admin URL for a client (permanent, not trycloudflare)

Build a static bundle and deploy it as a **second** host (Vercel/Netlify), with password protection:

```bash
python3 studio/build_static.py
# deploy studio/dist-site as its own project, e.g.
#   cd studio/dist-site && npx vercel --prod --yes
```

Do not merge this folder into the public companion `outputDirectory`.

## New client walks

Use `/immersive-3d` (builds player + studio) or the two prompts:

- `/immersive-3d-page` — public 3D walk only
- `/immersive-3d-admin` — dedicated studio/admin only
