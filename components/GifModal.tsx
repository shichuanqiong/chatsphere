import { useEffect, useMemo, useRef, useState } from "react";

type GifItem = {
  path: string;      // like /reactions/xxx.gif
  title?: string;
  tags?: string[];
  category?: string;
  size?: number;
};

interface GifModalProps {
  onSelectGif: (url: string) => void;
  onClose: () => void;
}

export default function GifModal({ onSelectGif, onClose }: GifModalProps) {
  const [open, setOpen] = useState(true);
  const [all, setAll] = useState<GifItem[]>([]);
  const [q, setQ] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use BASE_URL so it works on any deploy path
  const base = (import.meta as any).env.BASE_URL || "/";

  useEffect(() => {
    fetch(`${base}gifs/index.json?_=${Date.now()}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setAll(Array.isArray(data.items) ? data.items : []))
      .catch(() => setAll([]));
  }, [base]);

  useEffect(() => {
    inputRef.current?.focus();
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); onClose(); } };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  // Show all if no keyword; if filtered empty, fall back to all
  const list = useMemo(() => {
    const baseList = all.slice(0, 500);
    const keyword = q.trim().toLowerCase();
    if (!keyword) return baseList;
    const filtered = baseList.filter(it => {
      const hay = `${it.title || ""} ${(it.tags || []).join(" ")} ${it.path}`;
      return hay.toLowerCase().includes(keyword);
    });
    return filtered.length ? filtered : baseList;
  }, [all, q]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) { setOpen(false); onClose(); }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12
      }}
    >
      <div
        style={{
          width: "min(820px, 92vw)",
          height: "min(56vh, 640px)",
          background: "rgba(20,24,28,0.96)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            ref={inputRef}
            placeholder="Search GIFs (title / tags / file)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, height: 32, borderRadius: 8, outline: "none", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", padding: "0 10px", fontSize: 14 }}
          />
          <button onClick={() => { setOpen(false); onClose(); }} style={{ height: 32, padding: "0 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff" }}>
            Close
          </button>
        </div>

        <div style={{ padding: 10, overflow: "auto" }}>
          {list.length === 0 && (
            <div style={{opacity:0.7, fontSize:13, padding:10}}>
              No GIFs found. Make sure <code>public/gifs/index.json</code> exists and has items, then reload.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: 8 }}>
            {list.map((it, i) => {
              const src = `${base}gifs${it.path}`; // it.path starts with "/"
              return (
                <img
                  key={i}
                  loading="lazy"
                  src={src}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  style={{ width: "100%", height: 96, objectFit: "cover", borderRadius: 10, cursor: "pointer" }}
                  title={it.title || it.path}
                  onClick={() => { onSelectGif(src); setOpen(false); onClose(); }}
                />
              );
            })}
          </div>
        </div>

        <div style={{ padding: "6px 12px", fontSize: 11, opacity: 0.6, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          Powered by GIPHY (local cached)
        </div>
      </div>
    </div>
  );
}
