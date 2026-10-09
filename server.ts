import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(dataDir, 'photo-uploads');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, { fallthrough: false }));

const wishesFilePath = path.join(dataDir, 'wishes.json');
const memoriesFilePath = path.join(dataDir, 'memories.json');
const photoMimeExtensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const maxPhotoSizeBytes = 8 * 1024 * 1024;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Seed default wishes if none exist
const defaultWishes = [
  {
    id: 'wish-1',
    name: 'Your Love 💖',
    relationship: 'Girlfriend forever',
    message: 'Happy 21st Birthday to my sweetest bbyyy Ayu! 🧁♉ You are my strongest, most loyal Taurus bull and my favorite Moolank 4 magic man. Thank you for protecting me, loving me so hard, and being my home. May this year give you everything your heart desires — I am right beside you always. 💖✨',
    sticker: '💖',
    theme: 'rose',
    likes: 99,
    createdAt: '2026-10-12T23:30:00.000Z',
  },
  {
    id: 'wish-2',
    name: 'Mom & Dad',
    relationship: 'Family',
    message: 'On October 13th, 2005, you came into our lives, our strong little boy, and made the whole world brighter. We are so endlessly proud of the handsome, hardworking, kind man you have grown to be. Happy Birthday beta! 💖',
    sticker: '🎂',
    theme: 'gold',
    likes: 45,
    createdAt: '2026-10-13T00:05:00.000Z',
  },
  {
    id: 'wish-3',
    name: 'Best Buddy',
    relationship: 'Childhood Friend',
    message: 'Happy Birthday bhai ♉! From our stupid childhood days to turning 21 today — you\'ve always been the most loyal, solid guy in the crew. Hope this year brings you all the bikes, games, success and happiness you deserve. Party hard! 🎉🏍️',
    sticker: '🎉',
    theme: 'lavender',
    likes: 23,
    createdAt: '2026-10-13T00:30:00.000Z',
  },
  {
    id: 'wish-4',
    name: 'Squad',
    relationship: 'College Friends',
    message: 'Happy Birthday Ayush bhai! 🎂 The Taurus rock of our group, Moolank 4 legend with that magnetic Rahu aura. May 21 bring you endless vibes, trips, success, and all the happiness. Treat pending! 🍕🔥',
    sticker: '🔥',
    theme: 'mint',
    likes: 31,
    createdAt: '2026-10-13T08:00:00.000Z',
  },
];

// Seed default year-wise memories if none exist
const defaultMemories = [
  {
    id: 'mem-2005',
    year: 2005,
    age: 0,
    title: 'The Arrival of Our Taurus Boy',
    caption: 'Born October 13, 2005 — a tiny baby boy with strong lungs and the calmest Taurus eyes, already ruling the room. ♉🔮',
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    date: 'October 13, 2005',
    tag: 'Birth',
  },
  {
    id: 'mem-2006',
    year: 2006,
    age: 1,
    title: 'First Steps & First Cake Smash',
    caption: 'One whole year of giggles, wobbly first steps, and face-planting into his very first birthday cake.',
    imageUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80',
    date: 'October 13, 2006',
    tag: 'Milestone',
  },
  {
    id: 'mem-2011',
    year: 2011,
    age: 6,
    title: 'Little Superhero Days',
    caption: 'Caped crusader, toy-car collector, cricket-in-the-gully kid — already showing that Taurus stubbornness and big protective heart.',
    imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    date: 'October 2011',
    tag: 'Childhood',
  },
  {
    id: 'mem-2015',
    year: 2015,
    age: 10,
    title: 'Double Digits - Big 10',
    caption: 'Turned 10! Bike rides with the boys, video game marathons, and the first hints of that signature Ayush smile.',
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    date: 'October 13, 2015',
    tag: 'Birthday',
  },
  {
    id: 'mem-2021',
    year: 2021,
    age: 16,
    title: 'Sweet Sixteen',
    caption: 'Sixteen, already styled, already the most loyal friend in the group, already stealing hearts without trying. 💫',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    date: 'October 13, 2021',
    tag: 'Teen Years',
  },
  {
    id: 'mem-2023',
    year: 2023,
    age: 18,
    title: 'Eighteen & Unstoppable',
    caption: 'Stepping into manhood with Taurus strength, Rahu magnetism, and a Venusian softness only the lucky ones get to see.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    date: 'October 13, 2023',
    tag: 'Adulthood',
  },
  {
    id: 'mem-2026',
    year: 2026,
    age: 21,
    title: 'Chapter Twenty-One: Taurus King',
    caption: 'Twenty-one years of my favorite person. 21 candles burning bright for you tonight bbyyy — forever your biggest fan. 🧁♉💖',
    imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
    date: 'October 13, 2026',
    tag: '21st Birthday',
  },
];

function readWishes() {
  if (!fs.existsSync(wishesFilePath)) {
    fs.writeFileSync(wishesFilePath, JSON.stringify(defaultWishes, null, 2), 'utf-8');
  }

  const wishes = JSON.parse(fs.readFileSync(wishesFilePath, 'utf-8'));
  if (!Array.isArray(wishes)) {
    throw new Error('The wishes data must be an array.');
  }
  return wishes;
}

function saveWishes(wishes: any[]) {
  fs.writeFileSync(wishesFilePath, JSON.stringify(wishes, null, 2), 'utf-8');
}

function readMemories() {
  try {
    if (!fs.existsSync(memoriesFilePath)) {
      fs.writeFileSync(memoriesFilePath, JSON.stringify(defaultMemories, null, 2), 'utf-8');
      return defaultMemories;
    }
    const data = fs.readFileSync(memoriesFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading memories:', err);
    return defaultMemories;
  }
}

function saveMemories(memories: any[]) {
  fs.writeFileSync(memoriesFilePath, JSON.stringify(memories, null, 2), 'utf-8');
}

function removeUploadedPhoto(imageUrl: string) {
  if (!imageUrl.startsWith('/uploads/')) return;
  const fileName = path.basename(imageUrl);
  if (fileName !== imageUrl.slice('/uploads/'.length)) return;
  const filePath = path.join(uploadsDir, fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// API Routes
app.post('/api/photos', (req, res) => {
  const { dataUrl } = req.body;
  if (typeof dataUrl !== 'string') {
    return res.status(400).json({ error: 'Choose an image file to upload.' });
  }

  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) {
    return res.status(400).json({ error: 'Use a JPEG, PNG, WebP, or GIF image.' });
  }

  const [, mimeType, encodedImage] = match;
  const image = Buffer.from(encodedImage, 'base64');
  if (image.length === 0 || image.length > maxPhotoSizeBytes) {
    return res.status(400).json({ error: 'Photos must be smaller than 8 MB.' });
  }
  const validImageSignature =
    (mimeType === 'image/jpeg' && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff) ||
    (mimeType === 'image/png' && image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
    (mimeType === 'image/webp' && image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP') ||
    (mimeType === 'image/gif' && ['GIF87a', 'GIF89a'].includes(image.toString('ascii', 0, 6)));
  if (!validImageSignature) {
    return res.status(400).json({ error: 'The selected file is not a valid image.' });
  }

  const fileName = `${randomUUID()}${photoMimeExtensions[mimeType]}`;
  fs.writeFileSync(path.join(uploadsDir, fileName), image, { flag: 'wx' });
  res.status(201).json({ imageUrl: `/uploads/${fileName}` });
});

// Tiny probe used by the frontend: when this answers with JSON, the write features
// (wishes, uploads, Gemini) are live. On a static-only deploy it 404s and the UI
// falls back to saving in the browser instead of erroring out.
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    writable: true,
    gemini: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_API_KEY),
  });
});

app.get('/api/wishes', (_req, res) => {
  try {
    const wishes = readWishes();
    wishes.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
    res.json({ wishes });
  } catch (err) {
    console.error('Error loading wishes:', err);
    res.status(500).json({ error: 'Wishes are unavailable. Check the server logs for details.' });
  }
});

app.post('/api/wishes', (req, res) => {
  const { name, relationship, message, sticker, theme } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }

  const newWish = {
    id: `wish-${randomUUID()}`,
    name: name.trim().slice(0, 60),
    relationship:
      typeof relationship === 'string' ? relationship.trim().slice(0, 40) || 'Friend' : 'Friend',
    message: message.trim().slice(0, 1000),
    sticker: typeof sticker === 'string' ? sticker : '🧁',
    theme: typeof theme === 'string' ? theme : 'rose',
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    const wishes = readWishes();
    wishes.unshift(newWish);
    saveWishes(wishes);
    res.status(201).json({ wish: newWish });
  } catch (err) {
    console.error('Error saving wish:', err);
    res.status(500).json({ error: 'Your wish could not be saved. Check the server logs for details.' });
  }
});

app.post('/api/wishes/:id/like', (req, res) => {
  const { id } = req.params;
  try {
    const wishes = readWishes();
    const target = wishes.find((wish: any) => wish.id === id);
    if (!target) return res.status(404).json({ error: 'Wish not found.' });
    target.likes = (target.likes || 0) + 1;
    saveWishes(wishes);
    res.json({ success: true, likes: target.likes });
  } catch (err) {
    console.error('Error liking wish:', err);
    res.status(500).json({ error: 'Could not like this wish right now.' });
  }
});

app.delete('/api/wishes/:id', (req, res) => {
  const { id } = req.params;
  try {
    const wishes = readWishes().filter((wish: any) => wish.id !== id);
    saveWishes(wishes);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting wish:', err);
    res.status(500).json({ error: 'Could not delete this wish right now.' });
  }
});

// Yearly memories / pictures
app.get('/api/memories', (req, res) => {
  const memories = readMemories();
  // Sort by year ascending
  memories.sort((a: any, b: any) => a.year - b.year);
  res.json({ memories });
});

app.post('/api/memories', (req, res) => {
  const { year, title, caption, imageUrl, date, tag } = req.body;
  const parsedYear = parseInt(year, 10);
  if (isNaN(parsedYear) || typeof title !== 'string' || !title.trim() || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return res.status(400).json({ error: 'Year, title, and imageUrl are required.' });
  }

  const memories = readMemories();
  const age = Math.max(0, parsedYear - 2005);
  const newMemory = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    year: parsedYear,
    age,
    title: title.trim().slice(0, 80),
    caption: typeof caption === 'string' ? caption.trim().slice(0, 500) : '',
    imageUrl: imageUrl.trim(),
    date: typeof date === 'string' && date.trim() ? date.trim().slice(0, 80) : `October 7, ${parsedYear}`,
    tag: typeof tag === 'string' && tag.trim() ? tag.trim().slice(0, 40) : 'Memory',
  };

  memories.push(newMemory);
  saveMemories(memories);
  res.status(201).json({ memory: newMemory });
});

app.put('/api/memories/:id', (req, res) => {
  const { id } = req.params;
  const { imageUrl, title, caption, year, tag, date } = req.body;
  const memories = readMemories();
  const target = memories.find((m: any) => m.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Memory not found' });
  }
  const previousImageUrl = target.imageUrl;
  if (typeof imageUrl === 'string' && imageUrl.trim()) target.imageUrl = imageUrl.trim();
  if (title) target.title = title.trim();
  if (caption !== undefined) target.caption = caption.trim();
  if (year) {
    target.year = parseInt(year, 10);
    target.age = Math.max(0, target.year - 2005);
  }
  if (tag) target.tag = tag;
  if (date) target.date = date;
  saveMemories(memories);
  if (target.imageUrl !== previousImageUrl) removeUploadedPhoto(previousImageUrl);
  res.json({ memory: target });
});

app.delete('/api/memories/:id', (req, res) => {
  const { id } = req.params;
  let memories = readMemories();
  const target = memories.find((memory: any) => memory.id === id);
  if (!target) return res.status(404).json({ error: 'Memory not found' });
  memories = memories.filter((m: any) => m.id !== id);
  saveMemories(memories);
  removeUploadedPhoto(target.imageUrl);
  res.json({ success: true });
});

// Gemini AI route: Generate personalized birthday wish
app.post('/api/gemini/generate-wish', async (req, res) => {
  try {
    const { senderName, tone, relationship, customNotes } = req.body;

    const prompt = `Write a heartfelt and personal birthday wish for Ayush (lovingly called "Ayu" or "bbyyy" by his girlfriend), whose birthday is 13 October 2005. He is a Taurus sun sign (♉), moolank 4 ruled by Rahu 🔮 — a loyal, grounded, magnetic guy with a Venusian soft heart.
Sender name: ${senderName || 'A friend'}
Relationship: ${relationship || 'Friend'}
Tone requested: ${tone || 'Sweet & poetic'} (can be sweet, loving, poetic, witty, nostalgic, or playful-boyfriend-vibe)
Additional details or inside memory: ${customNotes || 'None'}

Rules:
1. Make it warm, authentic, touching, and celebratory for a boy (use he/him pronouns).
2. Mention his name Ayush (or Ayu/bbyyy if tone is romantic) and something delightful about his Taurus loyalty, his protective warmth, his Rahu magnetism, or his Venusian charm.
3. Keep it between 2 to 4 sentences, ready to sign and share on his birthday guestbook.
4. Output only the wish text itself, without any introductory or concluding meta remarks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const wishText = response.text?.trim() || 'Wishing you the sweetest, most magical birthday bbyyy Ayush! 🧁♉ May your year be filled with love, laughter, endless adventures, and all the success your Moolank 4 magic can attract. ✨';
    res.json({ wishText });
  } catch (error: any) {
    console.error('Gemini generate-wish error:', error);
    res.status(500).json({
      error: 'Failed to generate wish with Gemini',
      fallback: 'Happy Birthday bbyyy Ayush! ♉🔮 May your Taurus year ahead be as strong, warm, and wonderful as you are. Love you always! 🧁✨',
    });
  }
});

// Gemini AI route: Astrological Oracle & Horoscope Reading
app.post('/api/gemini/oracle-reading', async (req, res) => {
  try {
    const { currentYear, focus } = req.body;
    const year = currentYear || 2026;

    const prompt = `Provide an astrological reading and Venusian+Rahu blessing for Ayush (boyfriend / "bbyyy"), born on 13 October 2005 (Sun in Taurus ♉ — Earth sign, Fixed modality, ruled by Venus, moolank 4 ruled by Rahu). Use he/him pronouns.
Current year/milestone: ${year} (Turning ${year - 2005} years old!).
Focus theme requested: ${focus || 'Love, Success, Creativity, and Life Path'}.

Provide a response in JSON format with the following keys:
- cosmicBlessing: A 2-sentence poetic blessing from Venus, Rahu, and the stars addressing Ayush ("bbyyy").
- planetaryHighlights: An inspiring paragraph about Ayush's current astrological cycle, his Taurus loyalty & strength, his Moolank 4 magnetism & unconventional genius, and his growth ahead.
- luckyElements: An array of 3 tokens (lucky gem like Gomed/Hessonite or Emerald, scent, power flower, or lucky item).
- secretSuperpower: His hidden strength according to his Taurus sun + Moolank 4 Rahu birth chart.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ reading: parsed });
  } catch (error: any) {
    console.error('Gemini oracle error:', error);
    res.json({
      reading: {
        cosmicBlessing: 'May Venus bless your path with loyal love, rich pleasures, and quiet abundance; may Rahu ignite your magnetic aura so every dream you chase magnetically finds its way to you, bbyyy ♉.',
        planetaryHighlights: 'Born a steady Taurus bull with Moolank 4 Rahu fire in his veins, you blend the reliability of Earth with a revolutionary, magnetic mind that breaks rules and builds empires. Your 20th solar cycle activates deep personal power — your loyalty is your superpower, your taste is your brand, and your quiet determination moves mountains.',
        luckyElements: ['Gomed (Hessonite)', 'Sandalwood Scent', 'Deep Rose & Royal Blue'],
        secretSuperpower: 'The Immovable Force: when you love something or someone, nothing can shake you — and your Rahu-charged intuition sees shortcuts and opportunities others miss entirely.',
      },
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`cupcakeee server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
