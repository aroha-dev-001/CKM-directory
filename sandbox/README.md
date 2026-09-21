# Bean to Cup sandbox

Admin HUD for the immersive walk. **Not on the live website.** Vercel still ships only `dist/`.

## Run

```bash
python3 sandbox/serve.py
```

Open `http://127.0.0.1:43191/sandbox/bean-to-cup/`.

Press **H** or **Admin** to show the panel. Sliders cover world, camera, motion, focus, plates, shards, particles, copy rail, and navigation. **Export JSON** when a setting should later move into production. Tweaks persist in this browser (`localStorage`).
