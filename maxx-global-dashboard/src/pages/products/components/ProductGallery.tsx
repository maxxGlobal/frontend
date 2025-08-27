// ProductGallery.tsx
import React, { useMemo, useState } from "react";

type ImgItem = { id: number | string; url: string; isPrimary?: boolean };

const PLACEHOLDER = "/img/resim-yok.jpg"; // kendi yolunu doğrula

type Props = {
  name?: string | null;
  images?: ImgItem[]; // product.images
  primaryImageUrl?: string | null;
};

export default function ProductGallery({
  name,
  images,
  primaryImageUrl,
}: Props) {
  // Görsel listesi: images varsa onu kullan, yoksa primaryImageUrl’i tek öğe yap
  const list = useMemo<ImgItem[]>(() => {
    if (images && images.length > 0) return images.filter((i) => !!i.url);
    if (primaryImageUrl)
      return [{ id: "primary", url: primaryImageUrl, isPrimary: true }];
    return [];
  }, [images, primaryImageUrl]);

  // İlk aktif index: primary varsa o, yoksa 0
  const initialIdx = useMemo(() => {
    const prim = list.findIndex((x) => x.isPrimary);
    return prim >= 0 ? prim : 0;
  }, [list]);

  const [activeIdx, setActiveIdx] = useState<number>(initialIdx);

  if (list.length === 0) {
    // tamamen boşsa tek placeholder göster
    return (
      <div className="product-gallery">
        <div className="product-details-image">
          <ul
            className="nav-pills nav flex-nowrap product-thumbs"
            role="tablist"
          >
            <li className="single-thumbs" role="presentation">
              <img src={PLACEHOLDER} alt="thumb" />
            </li>
          </ul>
          <div className="main-preview-image">
            <div className="tab-content product-image">
              <div className="tab-pane fade show active" role="tabpanel">
                <div className="single-product-image">
                  <img
                    src={PLACEHOLDER}
                    alt={name || "product"}
                    onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {/* product details image */}
      <div className="product-details-image">
        {/* thumbs */}
        <ul
          className="nav-pills nav flex-nowrap product-thumbs"
          id="pills-tab"
          role="tablist"
        >
          {list.map((img, idx) => {
            const isActive = idx === activeIdx;
            const tabId = `pills-${idx}`;
            return (
              <li
                className="single-thumbs"
                role="presentation"
                key={img.id ?? idx}
              >
                {/* a + data-bs-toggle görünümü korunuyor; davranış React ile */}
                <a
                  className={isActive ? "active" : ""}
                  id={`${tabId}-tab`}
                  href={`#${tabId}`}
                  role="tab"
                  aria-controls={tabId}
                  aria-selected={isActive}
                  data-bs-toggle="pill"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveIdx(idx);
                  }}
                  title="Önizleme"
                >
                  <img
                    src={img.url || PLACEHOLDER}
                    alt="thumbs"
                    onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/* main preview */}
        <div className="main-preview-image">
          <div className="tab-content product-image" id="pills-tabContent">
            {list.map((img, idx) => {
              const isActive = idx === activeIdx;
              const tabId = `pills-${idx}`;
              return (
                <div
                  className={`tab-pane fade ${isActive ? "show active" : ""}`}
                  id={tabId}
                  role="tabpanel"
                  aria-labelledby={`${tabId}-tab`}
                  key={`pane-${img.id ?? idx}`}
                >
                  <div className="single-product-image">
                    <img
                      src={img.url || PLACEHOLDER}
                      alt={name || "product"}
                      onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* /product details image */}
    </div>
  );
}
