import { useState, useRef, useEffect } from "react";
import type { ProductVariantSummary } from "../../types/discount";

type Props = {
  items: ProductVariantSummary[];
};

export default function PopoverBadgeVariant({ items }: Props) {
  const [show, setShow] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !popoverRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setShow(false);
      }
    };
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [show]);

  if (!items || items.length === 0) {
    return <span className="text-muted">-</span>;
  }

  const count = items.length;
 
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <span
        ref={triggerRef}
        className="badge bg-primary"
        style={{ cursor: "pointer" }}
        onClick={() => setShow((prev) => !prev)}
        title={`${count} varyant`}
      >
        {count} Varyant
      </span>

      {show && (
        <div
          ref={popoverRef}
          className="card shadow-lg"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "4px",
            zIndex: 9999,
            minWidth: "280px",
            maxWidth: "400px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <div className="card-header bg-primary text-white py-2">
            <strong>Varyantlar ({count})</strong>
          </div>
          <div className="card-body p-2">
            <table className="table table-sm table-hover mb-0">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Boyut</th>
                  <th>SKU</th>
                  <th className="text-end">Stok</th>
                </tr>
              </thead>
              <tbody>
                {items.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <small className="text-truncate d-block" style={{ maxWidth: "120px" }}>
                        {v.productName}
                      </small>
                    </td>
                    <td>
                      <small>{v.size || "-"}</small>
                    </td>
                    <td>
                      <small>{v.sku || "-"}</small>
                    </td>
                    <td className="text-end">
                      <small>{v.stockQuantity ?? "-"}</small>
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