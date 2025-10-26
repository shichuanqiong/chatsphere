
// Fetch 5x100 GIFs from GIPHY and save locally under /public/gifs
// Usage:
//   node scripts/fetch_gifs.mjs
//
// Env:
//   GIPHY_API_KEY (optional) - will override default

import fs from 'fs';
import path from 'path';
import process from 'process';
import fetch from 'node-fetch';
import pLimit from 'p-limit';

const API_KEY = process.env.GIPHY_API_KEY || 'JFdX3lxuFAXiFNvxqQHZjU4z7YXR760k';
const ROOT = path.resolve(process.cwd());
const OUT_DIR = path.join(ROOT, 'public', 'gifs');
const INDEX_PATH = path.join(OUT_DIR, 'index.json');

if (!API_KEY) {
  console.error('Missing GIPHY_API_KEY');
  process.exit(1);
}

const LIMIT_PER_CATEGORY = 100; // number of GIFs per category
const CONCURRENCY = 6;          // parallel downloads

// Category → query list
const QUERIES = {
  reactions: [
    'reaction', 'meme', 'facepalm', 'shrug', 'applause', 'lol', 'omg', 'clap', 'no', 'yes',
    'thumbs up', 'cry', 'angry', 'mind blown', 'dance', 'eyeroll', 'awkward', 'fail', 'win'
  ],
  entertainment: [
    'movie reaction', 'tv show reaction', 'sitcom reaction', 'laugh track', 'dramatic', 'surprised scene',
    'celebrity reaction', 'talk show moment', 'applause audience', 'wow moment'
  ],
  sports: [
    'soccer celebration', 'basketball dunk celebrate', 'baseball home run celebrate', 'tennis point celebrate',
    'goalkeeper save celebrate', 'touchdown dance', 'sport fans cheer', 'coach reaction', 'referee reaction'
  ],
  stickers: [
    'sticker yay', 'sticker ok', 'sticker love', 'sticker omg', 'sticker clap', 'sticker lol', 'sticker sad',
    'sticker angry', 'sticker wow', 'sticker thumbsup', 'sticker hi', 'sticker bye'
  ],
  artists: [
    'loop animation', 'abstract loop', 'minimal animation', 'line art animation', 'geometric animation',
    'neon loop', 'glitch loop', 'pixel art animation', 'handdrawn loop', 'monochrome animation'
  ]
};

// Endpoints
const SEARCH_GIFS = 'https://api.giphy.com/v1/gifs/search';
const SEARCH_STICKERS = 'https://api.giphy.com/v1/stickers/search';

// Helper to ensure dirs
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function giphySearch(category, query, limit = 50, offset = 0) {
  const isSticker = (category === 'stickers');
  const endpoint = isSticker ? SEARCH_STICKERS : SEARCH_GIFS;
  const params = new URLSearchParams({
    api_key: API_KEY,
    q: query,
    limit: String(limit),
    offset: String(offset),
    rating: 'g',   // family friendly
    lang: 'en'
  });
  const url = `${endpoint}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GIPHY error ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

function pickUrl(item) {
  const imgs = item.images || {};
  // Prefer medium-size GIF to keep quality while not too heavy
  return imgs.downsized_medium?.url
      || imgs.fixed_height?.url
      || imgs.fixed_height_small?.url
      || imgs.preview_gif?.url
      || imgs.original?.url
      || item.url;
}
  return imgs.fixed_height_small?.url
      || imgs.fixed_height?.url
      || imgs.preview_gif?.url
      || item.url; // fallback
}

async function downloadTo(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download fail ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // decide extension
  const ctype = res.headers.get('content-type') || '';
  let ext = '.gif';
  if (ctype.includes('image/webp')) ext = '.webp';
  else if (ctype.includes('image/png')) ext = '.png';
  else if (ctype.includes('image/jpeg')) ext = '.jpg';
  // adjust filePath extension
  filePath = filePath.replace(/\.[a-z0-9]+$/i, ext);
  fs.writeFileSync(filePath, buf);
  return { size: fs.statSync(filePath).size, filePath };
}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buf);
  return fs.statSync(filePath).size;
}

function sanitize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function collectCategory(category) {
  console.log(`\n[Category] ${category}`);
  const outDir = path.join(OUT_DIR, category);
  ensureDir(outDir);

  const queries = QUERIES[category];
  const target = LIMIT_PER_CATEGORY;
  const seen = new Set();
  const results = [];

  let qIndex = 0;
  while (results.length < target && qIndex < queries.length) {
    const q = queries[qIndex++];
    // Pull pages until enough
    let offset = 0;
    while (results.length < target && offset < 1000) {
      const remaining = target - results.length;
      const pageLimit = Math.min(50, remaining);
      const items = await giphySearch(category, q, pageLimit, offset);
      if (!items.length) break;
      for (const it of items) {
        const id = it.id;
        if (seen.has(id)) continue;
        seen.add(id);
        const u = pickUrl(it);
        if (!u) continue;
        results.push({
          id,
          url: u,
          title: it.title || '',
          tags: [category, ...q.split(' ')].filter(Boolean),
          source: 'giphy',
          giphy_url: it.url
        });
        if (results.length >= target) break;
      }
      offset += items.length;
    }
  }
  console.log(`Collected: ${results.length} for ${category}`);
  return results.slice(0, target);
}

async function run() {
  ensureDir(OUT_DIR);
  const limit = pLimit(CONCURRENCY);

  const categories = ['reactions','entertainment','sports','stickers','artists'];
  const meta = [];
  for (const cat of categories) {
    const arr = await collectCategory(cat);

    // Download
    const outDir = path.join(OUT_DIR, cat);
    const tasks = arr.map((item, i) => limit(async () => {
      const ext = '.gif';
      const base = String(i+1).padStart(3, '0') + '_' + sanitize(item.title || 'gif');
      const file = path.join(outDir, base + ext);
      try {
        const size = await downloadTo(item.url, file);
        meta.push({
          id: item.id,
          path: `/artists/$/{base}${ext}`.replace('{cat}', cat),
          size: dl.size,
          title: item.title,
          tags: item.tags,
          category: cat,
          source: item.source,
          giphy_url: item.giphy_url
        });
        console.log(`[saved] ${file} (${Math.round(size/1024)} KB)`);
      } catch (e) {
        console.warn('[skip]', e.message);
      }
    }));

    await Promise.all(tasks);
  }

  // Write index.json
  const idx = {
    generated_at: new Date().toISOString(),
    categories: ['reactions','entertainment','sports','stickers','artists'],
    items: meta
  };
  fs.writeFileSync(INDEX_PATH, JSON.stringify(idx, null, 2));
  console.log('\n[OK] Wrote', INDEX_PATH);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
