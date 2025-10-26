import { useEffect, useMemo, useState } from "react";

type GifItem = {
  path: string;      // /category/xxx.gif
  title?: string;
  tags?: string[];
  category?: string;
  size?: number;
};

export default function GifPicker(props: { onSelect: (url: string) => void }) {
  const [all, setAll] = useState<GifItem[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    fetch("/gifs/index.json?_=" + Date.now())
      .then(r => r.json())
      .then(data => setAll(data.items || []))
      .catch(() => setAll([]));
  }, []);

  const list = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return all
      .filter(it => (cat === "all" ? true : it.category === cat))
      .filter(it => {
        if (!keyword) return true;
        const hay = (it.title || "") + " " + (it.tags || []).join(" ") + " " + it.path;
        return hay.toLowerCase().includes(keyword);
      })
      .slice(0, limit);
  }, [all, q, cat, limit]);

  return (
    <div className="gif-picker">
      <div className="gif-toolbar" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select value={cat} onChange={e => setCat(e.target.value)}>
          <option value="all">All</option>
          <option value="reactions">Reactions</option>
          <option value="stickers">Stickers</option>
          <option value="artists">Artists</option>
          <option value="entertainment">Entertainment</option>
          <option value="sports">Sports</option>
        </select>
        <input
          placeholder="Search local GIFs (title/tags/file)"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={limit} onChange={e => setLimit(parseInt(e.target.value))}>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
      </div>

      <div className="gif-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
        gap: 8,
        maxHeight: 420,
        overflow: "auto",
        paddingRight: 4
      }}>
        {list.map((it, i) => {
          const src = `/gifs${it.path}`; // path already begins with /{category}/...
          return (
            <img
              key={i}
              loading="lazy"
              src={src}
              onError={(e) => (e.currentTarget.style.display = "none")}
              style={{ width: "100%", height: 96, objectFit: "cover", borderRadius: 8, cursor: "pointer" }}
              title={it.title || it.path}
              onClick={() => props.onSelect(src)}
            />
          );
        })}
      </div>
      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Powered by GIPHY (local cached)</div>
    </div>
  );
}
