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
const PORT = 3000;

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
    name: 'Aria & Lily',
    relationship: 'Best Friends Forever',
    message: 'Happy 20th Birthday our sweetest Cupcake! May your year be as bright, radiant, and gentle as your Libra soul. Keep shining your Venusian warmth everywhere you go! 🧁✨',
    sticker: '🧁',
    theme: 'rose',
    likes: 12,
    createdAt: '2026-10-06T18:30:00.000Z',
  },
  {
    id: 'wish-2',
    name: 'Mom & Dad',
    relationship: 'Family',
    message: 'On October 7th, 2006 at 11:30 PM, you came into our lives and made the entire world softer and sweeter. We are so endlessly proud of the beautiful, thoughtful woman you have grown to be. Happy Birthday darling!',
    sticker: '💖',
    theme: 'gold',
    likes: 19,
    createdAt: '2026-10-06T20:15:00.000Z',
  },
  {
    id: 'wish-3',
    name: 'Leo',
    relationship: 'Childhood Friend',
    message: 'Happy Birthday to the most stylish Libra alive! Hope you get endless cupcakes, sweetest memories, and all the happiness this world has to offer.',
    sticker: '🎉',
    theme: 'lavender',
    likes: 7,
    createdAt: '2026-10-07T00:01:00.000Z',
  },
  {
    id: 'wish-4',
    name: 'Maya',
    relationship: 'Soul Sister',
    message: 'Blowing 20 virtual candles with you today! May every single wish you make tonight come true. You deserve the sweetest chapter ahead! 🌸🕯️',
    sticker: '🕯️',
    theme: 'peach',
    likes: 9,
    createdAt: '2026-10-07T08:20:00.000Z',
  },
];

// Seed default year-wise memories if none exist
const defaultMemories = [
  {
    id: 'mem-2006',
    year: 2006,
    age: 0,
    title: 'The Sweet Arrival',
    caption: 'Born at 11:30 PM on a crisp autumn Saturday night. October 7, 2006. A tiny blessing with a heart of gold.',
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    date: 'October 7, 2006',
    tag: 'Birth',
  },
  {
    id: 'mem-2007',
    year: 2007,
    age: 1,
    title: 'First Cupcake & Baby Steps',
    caption: 'One whole year of giggles, curious wide eyes, and tasting the first swirl of vanilla strawberry frosting.',
    imageUrl: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80',
    date: 'October 7, 2007',
    tag: 'Milestone',
  },
  {
    id: 'mem-2012',
    year: 2012,
    age: 6,
    title: 'Kindergarten & Fairytales',
    caption: 'Wearing pretty bows, drawing colorful rainbows, and dreaming up enchanted kingdoms.',
    imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    date: 'October 2012',
    tag: 'Childhood',
  },
  {
    id: 'mem-2016',
    year: 2016,
    age: 10,
    title: 'Double Digits Celebration',
    caption: 'Turned 10! Balloon bouquets, best friends sleepover, and non-stop laughter.',
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    date: 'October 7, 2016',
    tag: 'Birthday',
  },
  {
    id: 'mem-2022',
    year: 2022,
    age: 16,
    title: 'Sweet Sixteen',
    caption: '16 candles on the cake, sparkling fairy lights, and dreams blooming into reality.',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    date: 'October 7, 2022',
    tag: 'Sweet 16',
  },
  {
    id: 'mem-2024',
    year: 2024,
    age: 18,
    title: 'Eighteen & Free',
    caption: 'Stepping into adulthood with grace, aesthetic wonder, and endless curiosity.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    date: 'October 7, 2024',
    tag: 'Adulthood',
  },
  {
    id: 'mem-2026',
    year: 2026,
    age: 20,
    title: 'Chapter Twenty: Golden Bloom',
    caption: 'Two whole decades of wonder, kindness, and beauty. 20 candles burning bright for you tonight!',
    imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
    date: 'October 7, 2026',
    tag: '20th Birthday',
  },
];

function readWishes() {
  try {
    if (!fs.existsSync(wishesFilePath)) {
      fs.writeFileSync(wishesFilePath, JSON.stringify(defaultWishes, null, 2), 'utf-8');
      return defaultWishes;
    }
    const data = fs.readFileSync(wishesFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading wishes:', err);
    return defaultWishes;
  }
}

function saveWishes(wishes: any[]) {
  try {
    fs.writeFileSync(wishesFilePath, JSON.stringify(wishes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving wishes:', err);
  }
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

app.get('/api/wishes', (req, res) => {
  const wishes = readWishes();
  res.json({ wishes });
});

app.post('/api/wishes', (req, res) => {
  const { name, relationship, message, sticker, theme } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }

  const wishes = readWishes();
  const newWish = {
    id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim().slice(0, 60),
    relationship: (relationship || 'Friend').trim().slice(0, 40),
    message: message.trim().slice(0, 1000),
    sticker: sticker || '🧁',
    theme: theme || 'rose',
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  wishes.unshift(newWish);
  saveWishes(wishes);
  res.status(201).json({ wish: newWish });
});

app.post('/api/wishes/:id/like', (req, res) => {
  const { id } = req.params;
  const wishes = readWishes();
  const target = wishes.find((w: any) => w.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Wish not found' });
  }
  target.likes = (target.likes || 0) + 1;
  saveWishes(wishes);
  res.json({ success: true, likes: target.likes });
});

app.delete('/api/wishes/:id', (req, res) => {
  const { id } = req.params;
  let wishes = readWishes();
  wishes = wishes.filter((w: any) => w.id !== id);
  saveWishes(wishes);
  res.json({ success: true });
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
  const age = Math.max(0, parsedYear - 2006);
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
    target.age = Math.max(0, target.year - 2006);
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

    const prompt = `Write a heartfelt and personal birthday wish for Koena, whose birthday is 7 October 2006 (born at 11:30 PM, Libra sun sign ruled by Venus, known fondly as "Cupcake" or "Koena").
Sender name: ${senderName || 'A friend'}
Relationship: ${relationship || 'Friend'}
Tone requested: ${tone || 'Sweet & poetic'} (can be sweet, poetic, witty, or nostalgic)
Additional details or inside memory: ${customNotes || 'None'}

Rules:
1. Make it warm, authentic, touching, and celebratory for Koena.
2. Mention her name Koena and something delightful about her grace, kindness, or sweet Libra energy.
3. Keep it between 2 to 4 sentences, ready to sign and share on her birthday guestbook.
4. Output only the wish text itself, without any introductory or concluding meta remarks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const wishText = response.text?.trim() || 'Wishing you the sweetest, most magical birthday dearest Koena! May your year be filled with love, laughter, and endless cupcakes! 🧁✨';
    res.json({ wishText });
  } catch (error: any) {
    console.error('Gemini generate-wish error:', error);
    res.status(500).json({
      error: 'Failed to generate wish with Gemini',
      fallback: 'Happy Birthday sweet Koena! May your year ahead be as lovely and luminous as your radiant spirit. 🧁✨',
    });
  }
});

// Gemini AI route: Astrological Oracle & Horoscope Reading
app.post('/api/gemini/oracle-reading', async (req, res) => {
  try {
    const { currentYear, focus } = req.body;
    const year = currentYear || 2026;

    const prompt = `Provide an astrological reading and Venusian blessing for Koena, born on 7 October 2006 at 11:30 PM (Sun in Libra, Moon in Aries, Venus ruled, Air element).
Current year/milestone: ${year} (Turning ${year - 2006} years old!).
Focus theme requested: ${focus || 'Love, Creativity, and Life Path'}.

Provide a response in JSON format with the following keys:
- cosmicBlessing: A 2-sentence poetic blessing from Venus and the stars addressing Koena.
- planetaryHighlights: An inspiring paragraph about Koena's current astrological cycle, growth, and natural harmonious talents.
- luckyElements: An array of 3 sweet tokens (e.g. lucky gem, scent, power flower).
- secretSuperpower: Her hidden strength according to her birth date and time (11:30 PM late night Libra).`;

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
        cosmicBlessing: 'May Venus shower your path with effortless beauty, radiant connections, and eternal joy as your new solar cycle begins.',
        planetaryHighlights: 'Born under the midnight harmony of Libra with the passionate pulse of an Aries moon, you possess the rare gift of balancing fierce ambition with gentle grace.',
        luckyElements: ['Pink Tourmaline', 'Sweet Peony Blossom', 'Champagne Amber'],
        secretSuperpower: 'The Midnight Diplomat: You instinctively understand people\'s hearts and turn any room into a haven of warmth.',
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
