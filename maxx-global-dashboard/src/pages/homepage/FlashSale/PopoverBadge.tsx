import { useEffect, useRef, useState } from "react";

type Item = { id: number; name?: string };

interface Props {
  products?: Item[];
  dealers?: Item[];
}

export default function PopoverBadge({ products = [], dealers = [] }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const productCount = products.length;
  const dealerCount = dealers.length;

  // dışarı tıklandığında kapat
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timerRef.current = window.setTimeout(() => setOpen(false), 150);
  };

  const btnText = `${productCount ? `${productCount} ürün` : ""}${
    dealerCount ? `${productCount ? " / " : ""}${dealerCount} bayi` : ""
  }`;

  return (
    <div
      ref={wrapperRef}
      className="inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className="px-2 py-1 rounded border border-emerald-600 text-emerald-600
                   text-xs font-medium hover:bg-emerald-50"
      >
        {btnText || "0"}
      </button>

      {open && (
        <div
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className="fixed z-50 mt-2 w-64 max-h-64 overflow-auto 
                     bg-white border border-gray-200 rounded-md shadow-xl p-3 text-sm"
          style={{
            top: `${
              wrapperRef.current?.getBoundingClientRect().bottom ?? 0 + 8
            }px`,
            left: `${
              (wrapperRef.current?.getBoundingClientRect().left ?? 0) +
              (wrapperRef.current?.offsetWidth ?? 0) / 2
            }px`,
            transform: "translateX(-50%)",
          }}
        >
          {productCount > 0 && (
            <div className="mb-3">
              <p className="font-semibold mb-4 text-gray-700">
                Ürünler ({productCount})
              </p>
              <div className="flex flex-wrap gap-1">
                {products.map((p) => (
                  <span
                    key={p.id}
                    className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dealerCount > 0 && (
            <div>
              <p className="font-semibold mb-4 text-gray-700">
                Bayiler ({dealerCount})
              </p>
              <div className="flex flex-wrap gap-1">
                {dealers.map((d) => (
                  <span
                    key={d.id}
                    className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs"
                  >
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
