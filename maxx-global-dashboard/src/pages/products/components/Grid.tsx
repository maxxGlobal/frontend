import type { PageResponse } from "../../../types/paging";
import type { ProductRow } from "../../../types/product";

type Props = {
  data: PageResponse<ProductRow>;
  canManage?: boolean;
  onEdit?: (p: ProductRow) => void;
  onImages?: (p: ProductRow) => void;
  onView?: (p: ProductRow) => void;
  onAskDelete?: (p: ProductRow) => void;
  // id -> kategori adı fallback map'i
  categoriesMap?: Record<number, string>;
};

const API = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";
const PUBLIC_FALLBACK = "src/assets/img/resim-yok.jpg";

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
        console.log(p.categoryId);

        return (
          <div className="col-xxl-4 col-lg-6 col-md-6 col-12" key={p.id}>
            <div className="sherah-product-card sherah-product-card__v2 sherah-default-bg sherah-border mg-top-30">
              {/* Görsel */}
              <div className="sherah-product-card__img">
                <img
                  src={img}
                  alt={p.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = PUBLIC_FALLBACK;
                  }}
                />
              </div>

              {/* İçerik */}
              <div className="sherah-product-card__content sherah-dflex-column sherah-flex-gap-5">
                <h4 className="sherah-product-card__title" title={p.name}>
                  <a className="sherah-pcolor">{p.name}</a>
                </h4>

                <div className="sherah-product__bottom d-block">
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

                  <div className="sherah-button-group d-flex flex-wrap gap-2">
                    {onView && (
                      <button
                        className="sherah-btn sherah-btn__secondary"
                        onClick={() => onView(p)}
                        type="button"
                      >
                        Detay
                      </button>
                    )}
                    {onImages && (
                      <button
                        className="sherah-btn"
                        onClick={() => onImages(p)}
                        type="button"
                      >
                        Resimler
                      </button>
                    )}
                    {canManage && onEdit && (
                      <button
                        className="sherah-btn bg-success"
                        onClick={() => onEdit(p)}
                        type="button"
                      >
                        Düzenle
                      </button>
                    )}
                    {canManage && onAskDelete && (
                      <button
                        className="sherah-btn bg-danger"
                        onClick={() => onAskDelete(p)}
                        type="button"
                      >
                        Sil
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
