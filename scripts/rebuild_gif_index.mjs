// Build public/gifs/index.json by scanning files (no network required)
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'gifs');
const INDEX = path.join(OUT_DIR, 'index.json');

const CATS = ['reactions','entertainment','sports','stickers','artists'];
const exts = new Set(['.gif','.webp','.png','.jpg','.jpeg']);

function scanDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  return files.filter(f => exts.has(path.extname(f).toLowerCase()));
}

const items = [];
for (const cat of CATS) {
  const dir = path.join(OUT_DIR, cat);
  const files = scanDir(dir);
  for (const f of files) {
    const p = `/${cat}/${f}`;
    items.push({ path: p, category: cat, title: f.replace(/[-_]/g,' ').replace(/\.[^.]+$/, ''), tags: [cat] });
  }
}

const data = { generated_at: new Date().toISOString(), categories: CATS, items };
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(INDEX, JSON.stringify(data, null, 2));
console.log(`[OK] Wrote ${INDEX} with ${items.length} items.`);
