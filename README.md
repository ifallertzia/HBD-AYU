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
