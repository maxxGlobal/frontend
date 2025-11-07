// src/components/popover/PopoverBadgeOrderItem.tsx
import { useEffect, useRef, useState } from "react";

type OrderItem = { 
  productId: number; 
  productName: string; 
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantSize: string;
  variantSku: string;
};

export default function PopoverBadgeOrderItem({ items }: { items: OrderItem[] }) {
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
        className="bg-success border-0 text-white rounded px-2 py-1"
        style={{
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
            minWidth: Math.min(300, 200 + count * 20), // Dinamik minimum genişlik
            width: "max-content", // İçeriğe göre genişlik
            maxWidth: 500,
            maxHeight: 350,
            overflow: "auto",
            background: "#fff",
            border: "1px solid #e6e6e6",
            borderRadius: 10,
            padding: "12px",
            zIndex: 50,
          }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong className="small mb-0 text-secondary">
              Sipariş Ürünleri ({count})
            </strong>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary border-0"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-sm table-borderless mb-0">
              <thead>
                <tr className="border-bottom">
                  <th className="small text-muted">Ürün</th>
                  <th className="small text-muted">Boy/Kod</th>
                  <th className="small text-muted text-center">Adet</th>
                  <th className="small text-muted text-end">Birim Fiyat</th>
                  <th className="small text-muted text-end">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId}>
                    <td>
                      <span 
                        className="small fw-medium text-dark"
                        title={item.productName}
                        style={{ 
                          display: 'block',
                          maxWidth: '150px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.productName}
                      </span>
                    </td>
                     <td className="text-center">
                      <span 
                        className="small fw-medium text-dark"
                        title={item.variantSize}
                        style={{ 
                          display: 'block',
                          maxWidth: '150px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.variantSize}/{item.variantSku}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-primary-subtle text-primary">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="text-end small">
                      {item.unitPrice.toFixed(2)} ₺
                    </td>
                    <td className="text-end small fw-medium">
                      {item.totalPrice.toFixed(2)} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}