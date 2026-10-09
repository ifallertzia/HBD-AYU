# cupcakeee

a birthday site for ayush 🧁

## The photo wall

Every picture in `public/photos/ayush/` shows up in two places:

- **Normal mode** — the photos drift sideways behind the whole site in three dim,
  blurred marquee rows (opposite directions, different speeds). Pure CSS, no JavaScript
  timers, and it respects `prefers-reduced-motion`.
- **Photo Mode** — the 📸 button (floating pill, navbar, hero, and the gallery header all
  have one) hides the site completely and puts the pictures on a dark stage: the photo pops
  forward, then slides itself away every ~5s. Drag/swipe, `←`/`→`, `space` to pause,
  `s` to shuffle, `Esc` to exit, plus an "All Photos" grid of the full set.

### Adding more photos

```bash
# drop the files anywhere, e.g. a folder called "photos ayush", then:
npm run photos            # or: node scripts/prepare-photos.mjs "photos ayush"
```

That renames them to `ayu-01.jpg`, `ayu-02.jpg`, … inside `public/photos/ayush/`,
builds small previews in `public/photos/ayush/thumbs/` (used by the background wall and
the filmstrip — the stage always uses the full-size file), and regenerates
`public/photos/ayush/manifest.json`. No restart or rebuild needed for the app itself.

### Captions

The manifest is hand-editable — give a picture a nicer name or a caption and Photo Mode
shows it on the Polaroid frame (re-running `npm run photos` keeps your titles):

```json
{
  "id": "ayu-01",
  "file": "ayu-01.jpg",
  "src": "/photos/ayush/ayu-01.jpg",
  "thumb": "/photos/ayush/thumbs/ayu-01.jpg",
  "title": "First day at the beach",
  "caption": "Ayu, age 6, refusing to leave the water 🌊"
}
```

## Deploying

### Vercel (static frontend — the default)

`vercel.json` pins this up: framework **Vite**, build **`npm run build`**, output **`dist`**.
Import the repo in Vercel (or run `vercel` in the project) and that's the whole setup —
no env vars needed, and the site is fully working: photo wall, Photo Mode, gallery and
wish wall all read static files.

A static host has no Express process behind it, so the app detects that on load
(`GET /api/health`) and switches its write features to saving in the visitor's browser:

| Feature | Vercel static | With the Node server |
| --- | --- | --- |
| Photo wall + Photo Mode (all of `public/photos/ayush`) | ✅ | ✅ |
| Yearly gallery from `public/memories.json` | ✅ | ✅ (live from `/api/memories`) |
| Wish wall reads `public/wishes.json` | ✅ | ✅ (live from `/api/wishes`) |
| Posting / liking a wish | ✅ saved on that device | ✅ saved for everyone |
| Uploading photos from the site | ➖ off, with a note | ✅ |
| Gemini oracle & Magic Wish Helper | ➖ hidden (the Oracle falls back to its written reading) | ✅ with `GEMINI_API_KEY` |

So nobody ever sees a "could not save" error on the static deploy — the buttons that need
a server are either hidden or explain themselves.

Want the writes to be shared too? Two options:

1. Deploy the same repo anywhere that runs a Node process (`npm run dev` / `npm start`,
   port from `$PORT`) — the Express server then serves `dist` in `NODE_ENV=production`.
2. Keep Vercel and set `GEMINI_API_KEY` in *Project → Settings → Environment Variables*
   plus a `rewrites` rule pointing `/api/*` at that server (or move `data/*.json` to Vercel
   Blob/KV — the storage is the only part that can't live on Vercel's read-only filesystem).

### Local

```bash
npm install
npm run dev      # http://localhost:3000  (Express + Vite, all features live)
npm run build    # production bundle in dist/
npm run lint     # tsc --noEmit
```
