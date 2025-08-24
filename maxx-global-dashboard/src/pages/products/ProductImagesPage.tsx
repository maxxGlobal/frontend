import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  listProductImages,
  uploadProductImages,
  deleteProductImage,
  setPrimaryProductImage,
  type ProductImage,
} from "../../services/products/images";

export default function ProductImagesPage() {
  const params = useParams<{ productId?: string; id?: string }>();
  const productId = useMemo(() => {
    const raw = params.productId ?? params.id;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [params]);
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    if (productId == null) return;
    const list = await listProductImages(productId);
    setImages(list);
  }

  useEffect(() => {
    refresh();
  }, [productId]);

  async function handleUpload() {
    if (productId == null) {
      alert("Geçersiz ürün ID.");
      return;
    }
    if (!files.length) return;
    try {
      setBusy(true);
      await uploadProductImages(productId, files);
      setFiles([]);
      await refresh();
      alert("Yüklendi.");
    } catch (e: any) {
      alert(
        "Bir hata oluştu: " +
          (e?.response?.data?.message || e?.message || "Yüklenemedi.")
      );
    } finally {
      setBusy(false);
    }
  }
  if (productId == null) {
    return <div className="alert alert-danger m-3">Geçersiz ürün ID.</div>;
  }
  const pid = productId as number;

  return (
    <div className="col-lg-8">
      <h3 className="sherah-card__title py-3">Ürün Resimleri</h3>

      <div className="mb-3">
        <label className="form-label">Yeni Resim Yükle</label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="form-control"
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            setFiles(list);
          }}
        />
        <button
          className="btn btn-primary mt-2"
          disabled={busy || files.length === 0}
          onClick={handleUpload}
        >
          {busy ? "Yükleniyor…" : "Yükle"}
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-muted">Henüz resim yok.</div>
      ) : (
        <div className="row g-3">
          {images.map((img) => (
            <div className="col-md-3" key={img.id}>
              <div className="card h-100">
                <img src={img.imageUrl} className="card-img-top" />
                <div className="card-body d-flex flex-column gap-2">
                  {img.isPrimary && (
                    <span className="badge bg-success align-self-start">
                      Ana
                    </span>
                  )}
                  {!img.isPrimary && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={async () => {
                        await setPrimaryProductImage(pid, img.id);
                        refresh();
                      }}
                    >
                      Ana Yap
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={async () => {
                      await deleteProductImage(pid, img.id);
                      refresh();
                    }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
