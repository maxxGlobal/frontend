import type { PageResponse } from "../../../types/paging";
import type { ProductRow } from "../../../types/product";

type Props = {
  data: PageResponse<ProductRow>;
  canManage?: boolean;
  onEdit?: (p: ProductRow) => void;
  onImages?: (p: ProductRow) => void;
  onView?: (p: ProductRow) => void;
  onAskDelete?: (p: ProductRow) => void;
};

const API = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";
const PUBLIC_FALLBACK = "src/assets/img/resim-yok.jpg";

const toAbs = (u: string) => (u.startsWith("http") ? u : `${API}${u}`);
const isFromUploads = (u?: string | null) =>
  !!u && /\/uploads?\//i.test(String(u));
const pickImageUrl = (u?: string | null) => {
  // Eğer görsel yoksa doğrudan fallback dön
  if (!u || u.trim() === "") {
    return PUBLIC_FALLBACK;
  }

  // Eğer uploads klasöründen geliyorsa API ile birleştir
  if (/\/uploads?\//i.test(u)) {
    return u.startsWith("http") ? u : `${API}${u}`;
  }

  // Diğer tüm durumlarda fallback dön
  return PUBLIC_FALLBACK;
};

export default function ProductsGrid({
  data,
  canManage,
  onEdit,
  onImages,
  onView,
  onAskDelete,
}: Props) {
  if (!data?.content?.length) {
    return <div className="text-muted">Kayıt bulunamadı.</div>;
  }

  return (
    <div className="row">
      {data.content.map((p) => {
        const img = pickImageUrl(p.primaryImageUrl);

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
                    Kategori: <strong>{p.categoryName ?? "-"}</strong>
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
                        className="sherah-btn default"
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
                        className="sherah-btn"
                        onClick={() => onEdit(p)}
                        type="button"
                      >
                        Düzenle
                      </button>
                    )}
                    {canManage && onAskDelete && (
                      <button
                        className="sherah-btn default"
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
