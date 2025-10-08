import type { PageResponse } from "../../../types/paging";
import type { ProductRow } from "../../../types/product";

type Props = {
  data: PageResponse<ProductRow>;
  canManage?: boolean;
  onEdit?: (p: ProductRow) => void;
  onImages?: (p: ProductRow) => void;
  onView?: (p: ProductRow) => void;
  onAskDelete?: (p: ProductRow) => void;
  categoriesMap?: Record<number, string>;
  onRestore?: (p: ProductRow) => void;
};

const API = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

// ✅ DÜZELTME: Public folder'dan doğru path
const PUBLIC_FALLBACK = "/assets/img/resim-yok.jpg";

const pickImageUrl = (u?: string | null) => {
  if (!u || u.trim() === "") return PUBLIC_FALLBACK;
  if (/\/uploads?\//i.test(u)) return u.startsWith("http") ? u : `${API}${u}`;
  return PUBLIC_FALLBACK;
};

export default function ProductsGrid({
  data,
  canManage,
  onEdit,
  onImages,
  onView,
  onAskDelete,
  categoriesMap,
  onRestore,
}: Props) {
  if (!data?.content?.length) {
    return <div className="text-muted">Kayıt bulunamadı.</div>;
  }

  return (
    <div className="row">
      {data.content.map((p) => {
        const img = pickImageUrl(p.primaryImageUrl);
        const catLabel =
          p.categoryName ??
          (p.categoryId != null ? categoriesMap?.[p.categoryId] : undefined) ??
          "-";

        const canOpen = !!onView;
        const openDetail = () => onView && onView(p);

        return (
          <div className="col-xxl-4 col-lg-6 col-md-6 col-12" key={p.id}>
            <div
              className={`sherah-product-card sherah-product-card__v2 sherah-default-bg sherah-border mg-top-30 pg-card ${
                canOpen ? "pg-clickable" : ""
              }`}
              role={canOpen ? "button" : undefined}
              tabIndex={canOpen ? 0 : -1}
              onClick={canOpen ? openDetail : undefined}
              onKeyDown={
                canOpen
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDetail();
                      }
                    }
                  : undefined
              }
            >
              {/* ✅ DÜZELTME: onError ile sonsuz döngüyü önle */}
              <div className="sherah-product-card__img pg-img">
                <img
                  src={img}
                  alt={p.name}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    // Eğer zaten fallback'e set ettiyse, tekrar set etme
                    if (target.src !== window.location.origin + PUBLIC_FALLBACK) {
                      target.onerror = null; // ✅ Sonsuz döngüyü önle
                      target.src = PUBLIC_FALLBACK;
                    }
                  }}
                />
              </div>

              <div className="sherah-product-card__content sherah-dflex-column sherah-flex-gap-5">
                <h4 className="sherah-product-card__title mb-2" title={p.name}>
                  <a
                    className="sherah-pcolor text-decoration-none"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDetail();
                    }}
                  >
                    {p.name}
                  </a>
                </h4>

                <div className="small text-muted">
                  Kod: <strong>{p.code}</strong>
                </div>
                <div className="small text-muted">
                  Kategori: <strong>{catLabel}</strong>
                </div>
                <div className="small text-muted mb-3">
                  Stok: <strong>{p.stockQuantity ?? 0}</strong> adet
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  {p.isActive ? (
                    <span className="badge bg-success">Aktif</span>
                  ) : (
                    <span className="badge bg-danger">Pasif</span>
                  )}
                  {p.isInStock ? (
                    <span className="badge bg-success">Stokta</span>
                  ) : (
                    <span className="badge bg-danger">Stok Yok</span>
                  )}
                </div>

                <div className="pg-actions">
                  <div className="pg-row d-block">
                    {onView && (
                      <button
                        type="button"
                        className="btn-chip btn-emerald w-100 justify-content-center mb-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(p);
                        }}
                        aria-label="Detay"
                        title="Detay"
                      >
                        <i className="fa-regular fa-eye" />
                        <span>Detay</span>
                      </button>
                    )}

                    {onImages && (
                      <button
                        type="button"
                        className="btn-chip btn-indigo w-100 justify-content-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImages(p);
                        }}
                        aria-label="Resimler"
                        title="Resimler"
                      >
                        <i className="fa-regular fa-images" />
                        <span>Resimler</span>
                      </button>
                    )}
                  </div>

                  <div className="pg-row mt-2 gap-2 justify-content-center">
                    {canManage && onEdit && (
                      <button
                        type="button"
                        className="btn-chip btn-soft-mint"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(p);
                        }}
                        aria-label="Düzenle"
                        title="Düzenle"
                      >
                        <i className="fa-regular fa-pen-to-square" />
                        <span>Düzenle</span>
                      </button>
                    )}

                    {canManage && onAskDelete && (
                      <button
                        type="button"
                        className="btn-chip btn-soft-rose"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskDelete(p);
                        }}
                        aria-label="Sil"
                        title="Sil"
                      >
                        <i className="fa-regular fa-trash-can" />
                        <span>Sil</span>
                      </button>
                    )}

                    {canManage &&
                      onRestore &&
                      (p.status === "SİLİNDİ" || !p.isActive) && (
                        <button
                          type="button"
                          className="btn-icon-sq btn-warning-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestore(p);
                          }}
                          aria-label="Geri Yükle"
                          title="Geri Yükle"
                        >
                          <i className="fa-solid fa-rotate-left" />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}