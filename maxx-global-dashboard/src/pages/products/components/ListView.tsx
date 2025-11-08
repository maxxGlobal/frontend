import type { PageResponse } from "../../../types/paging";
import type { ProductRow } from "../../../types/product";

type Props = {
  data: PageResponse<ProductRow>;
  canManage?: boolean;
  onEdit?: (p: ProductRow) => void;
  onView?: (p: ProductRow) => void;
  onAskDelete?: (p: ProductRow) => void;
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

export default function ProductsListView({
  data,
  canManage,
  onEdit,
  onView,
  onAskDelete,
  onRestore,
}: Props) {
  if (!data?.content?.length) {
    return <div className="text-muted">Kayıt bulunamadı.</div>;
  }

  return (
    <div className="row">
      {data.content.map((p) => {
        const img = pickImageUrl(p.primaryImageUrl);

        const canOpen = !!onView;
        const openDetail = () => onView && onView(p);

        return (
          <div className="col-xxl-3 col-lg-4 col-md-6 col-12" key={p.id}>
            <div
              className={`d-flex align-items-center gap-2 p-2 border rounded sherah-default-bg mg-top-20 ${
                canOpen ? "pg-clickable" : ""
              }`}
              style={{ 
                cursor: canOpen ? "pointer" : "default",
                minHeight: "70px",
                transition: "all 0.2s ease"
              }}
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
              onMouseEnter={(e) => {
                if (canOpen) {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (canOpen) {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {/* Sol taraf - Resim */}
              <div style={{ flexShrink: 0 }}>
                <img
                  src={img}
                  alt={p.name}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    borderRadius: "6px"
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== window.location.origin + PUBLIC_FALLBACK) {
                      target.onerror = null;
                      target.src = PUBLIC_FALLBACK;
                    }
                  }}
                />
              </div>

              {/* Sağ taraf - İsim ve aksiyonlar */}
              <div className="d-flex flex-column justify-content-between flex-grow-1" style={{ minWidth: 0 }}>
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h6 
                      className="mb-0 text-truncate" 
                      title={p.name}
                      style={{ fontSize: "0.9rem", fontWeight: 600 }}
                    >
                      {p.name}
                    </h6>
                    <small className="text-muted d-block text-truncate" style={{ fontSize: "0.75rem" }}>
                      {p.code}
                    </small>
                  </div>
                  
                  {/* Durum badge'leri */}
                  <div className="d-flex gap-1" style={{ flexShrink: 0 }}>
                    {p.isActive ? (
                      <span className="badge bg-success-subtle text-success" style={{ fontSize: "0.65rem" }}>
                        Aktif
                      </span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger" style={{ fontSize: "0.65rem" }}>
                        Pasif
                      </span>
                    )}
                  </div>
                </div>

                {/* Aksiyon butonları */}
                {canManage && (
                  <div className="d-flex gap-1 mt-1">
                    {onView && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(p);
                        }}
                        title="Detay"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    )}
                    
                    {onEdit && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(p);
                        }}
                        title="Düzenle"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                    )}

                    {onAskDelete && p.isActive && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskDelete(p);
                        }}
                        title="Sil"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}

                    {onRestore && !p.isActive && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning"
                        style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore(p);
                        }}
                        title="Geri Yükle"
                      >
                        <i className="fa-solid fa-rotate-left"></i>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}