/**
 * Photo wall prep — run with: npm run photos
 *
 * 1. (optional) Ingests a drop folder of photos (default: "photos ayush") into
 *    public/photos/ayush/ with clean, URL-safe names: ayu-01.jpg, ayu-02.jpg ...
 * 2. Writes public/photos/ayush/manifest.json  → used by the app (src + thumb + original name).
 * 3. Writes public/photos/ayush/thumbs/ayu-NN.jpg → small, dim-friendly copies for the
 *    scrolling background wall and the photo-mode filmstrip (skipped if `sharp` isn't installed).
 *
 * Safe to re-run: existing entries keep their name/caption mapping, new files get the next index.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const photoDir = path.join(root, 'public/photos/ayush');
const thumbDir = path.join(photoDir, 'thumbs');
const manifestPath = path.join(photoDir, 'manifest.json');
const dropDir = path.join(root, process.argv[2] || 'photos ayush');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const THUMB_WIDTH = 420;
const THUMB_QUALITY = 62;

fs.mkdirSync(photoDir, { recursive: true });

const cleanName = (file) => path.basename(file).replace(/\.[^.]+$/, '').replace(/\s+/g, ' ').trim();

/** Auto filenames (ayu-07) read badly as captions, so give them a friendly label instead. */
const friendlyTitle = (file) => {
  const match = /^ayu-(\d+)/i.exec(path.basename(file, path.extname(file)));
  return match ? `Memory No. ${String(Number(match[1])).padStart(2, '0')}` : cleanName(file);
};

/** Placeholder titles we generated ourselves — safe to overwrite on the next run. */
const isPlaceholderTitle = (title) =>
  !title ||
  /^ayu-\d+$/i.test(title) ||
  /^Memory No\. \d+$/i.test(title) ||
  /^WhatsApp Image/i.test(title);

const isImage = (file) => IMAGE_EXT.has(path.extname(file).toLowerCase());

// ---- 1. ingest the drop folder, if it still exists -------------------------------------------
if (fs.existsSync(dropDir) && path.resolve(dropDir) !== path.resolve(photoDir)) {
  const incoming = fs
    .readdirSync(dropDir)
    .filter(isImage)
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  for (const file of incoming) {
    const taken = new Set(fs.readdirSync(photoDir));
    let n = 1;
    let base;
    do {
      base = `ayu-${String(n).padStart(2, '0')}.jpg`;
      n += 1;
    } while (taken.has(base));
    fs.renameSync(path.join(dropDir, file), path.join(photoDir, base));
    console.log(`  ✓ ${file}  →  public/photos/ayush/${base}`);
  }
}

// ---- 2. build the manifest ---------------------------------------------------------------------
const previous = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : [];
const knownByFile = new Map(previous.map((entry) => [entry.file, entry]));

const files = fs
  .readdirSync(photoDir)
  .filter(isImage)
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

const manifest = files.map((file, index) => {
  const prior = knownByFile.get(file);
  return {
    id: `ayu-${String(index + 1).padStart(2, '0')}`,
    file,
    src: `/photos/ayush/${file}`,
    thumb: `/photos/ayush/thumbs/${file}`,
    // Hand-written titles/captions in manifest.json are preserved across runs.
    title: isPlaceholderTitle(prior?.title) ? friendlyTitle(file) : prior.title,
    ...(isPlaceholderTitle(prior?.caption) ? {} : { caption: prior.caption }),
  };
});

// ---- 3. thumbs (best effort — app falls back to full-size files when absent) -------------------
let thumbsWritten = 0;
try {
  const { default: sharp } = await import('sharp');
  fs.mkdirSync(thumbDir, { recursive: true });
  for (const entry of manifest) {
    const target = path.join(thumbDir, entry.file);
    if (fs.existsSync(target) && fs.statSync(target).size > 0) continue;
    await sharp(path.join(photoDir, entry.file))
      .rotate()
      .resize({ width: THUMB_WIDTH, height: THUMB_WIDTH, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
      .toFile(target);
    thumbsWritten += 1;
  }
} catch (err) {
  console.warn(`  ! skipping thumbs (${err.message}). App will use full-size photos everywhere.`);
  fs.rmSync(thumbDir, { recursive: true, force: true });
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `\n${manifest.length} photos → public/photos/ayush/manifest.json` +
    (thumbsWritten ? `, ${thumbsWritten} new thumb(s)` : ''),
);
