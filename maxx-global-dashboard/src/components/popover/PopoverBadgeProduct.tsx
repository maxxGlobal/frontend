// src/components/PopoverBadge.tsx
import { useRef, useState } from "react";

type PopoverBadgeProductProps = {
  items: { id: number; name?: string }[];
  badgeType: "product" | "category";
};

export default function PopoverBadgeProduct({
  items,
  badgeType,
}: PopoverBadgeProductProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const count = items?.length ?? 0;
  if (count === 0) return <span className="text-muted">-</span>;

  const label = badgeType === "product" ? "Ürünler" : "Kategoriler";
  return (
    <div ref={wrapperRef} className="position-relative d-inline-block">
      <button
        type="button"
        className="bg-success border-0"
        style={{ padding: "0.35rem 0.5rem", cursor: "pointer", fontSize: 12 }}
        onClick={() => setOpen((s) => !s)}
      >
        {label} ({count})
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
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong className="small mb-0 text-secondary">
              {label} ({count})
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
