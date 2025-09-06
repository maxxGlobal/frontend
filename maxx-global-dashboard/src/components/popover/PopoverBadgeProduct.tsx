// src/components/PopoverBadge.tsx
import { useEffect, useRef, useState } from "react";

type Item = { id: number; name?: string; description?: string | null };

export default function PopoverBadge({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const onEnter = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setOpen(true);
  };
  const onLeave = () => {
    timerRef.current = window.setTimeout(() => setOpen(false), 120);
  };

  const count = items?.length ?? 0;

  return (
    <div
      ref={wrapperRef}
      className="position-relative d-inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        type="button"
        className="bg-success border-0"
        style={{
          padding: "0.35rem 0.5rem",
          cursor: count ? "pointer" : "default",
          fontSize: 12,
        }}
        onClick={() => count && setOpen((s) => !s)}
      >
        {count} ürün
      </button>

      {open && count > 0 && (
        <div
          className="shadow-sm"
          style={{
            position: "absolute",
            top: "125%",
            left: 0,
            minWidth: 260,
            maxWidth: 520,
            maxHeight: 280,
            overflow: "auto",
            background: "#fff",
            border: "1px solid #e6e6e6",
            borderRadius: 10,
            padding: "10px 12px",
            zIndex: 50,
          }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong className="small mb-0 text-secondary">
              Ürünler ({count})
            </strong>
            <button
              type="button"
              className="btn btn-sm bg-danger"
              onClick={() => setOpen(false)}
            >
              Kapat
            </button>
          </div>

          <div className="d-flex flex-wrap gap-1">
            {items.map((p) => (
              <span
                key={p.id}
                className="badge bg-secondary-subtle text-secondary border rounded-pill small"
                style={{ padding: "0.3rem 0.45rem" }}
                title={p.name}
              >
                {p.name ?? `#${p.id}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
