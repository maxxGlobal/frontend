import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  listProductImages,
  uploadProductImages,
  deleteProductImage,
  setPrimaryProductImage,
  type ProductImage,
} from "../../services/products/images";

const MySwal = withReactContent(Swal);

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

    let primaryFound = false;
    const normalized = list.map((img) => {
      const isPrimary = !!img.isPrimary && !primaryFound;
      if (isPrimary) primaryFound = true;
      return { ...img, isPrimary };
    });

    setImages(normalized);
  }

  useEffect(() => {
    refresh();
  }, [productId]);

  async function handleUpload() {
    if (productId == null) {
      MySwal.fire({
        icon: "error",
        title: "Geçersiz ürün ID",
        confirmButtonText: "Tamam",
      });
      return;
    }
    if (!files.length) return;

    try {
      setBusy(true);
      await uploadProductImages(productId, files);
      setFiles([]);

      await refresh();

      MySwal.fire({
        icon: "success",
        title: "Yükleme Başarılı!",
        text: "Dosyalar başarıyla yüklendi.",
        confirmButtonText: "Tamam",
      });
    } catch (e: any) {
      MySwal.fire({
        icon: "error",
        title: "Hata",
        text: e?.response?.data?.message || e?.message || "Yüklenemedi.",
        confirmButtonText: "Tamam",
      });
    } finally {
      setBusy(false);
    }
  }

  if (productId == null) {
    return <div className="alert alert-danger m-3">Geçersiz ürün ID.</div>;
  }
  const pid = productId;

  return (
    <div className="product-form-box sherah-border">
      <h3 className="sherah-card__title py-3">Ürün Resimleri</h3>
      <div className="row">
        <div className="col-lg-4">
          <div className="mb-3">
            <label className="form-label">Yeni Resim Yükle</label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="form-control lg:w-50 h-auto"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            <button
              className="sherah-btn sherah-btn__primary bg-primary mt-3"
              disabled={busy || files.length === 0}
              onClick={handleUpload}
            >
              {busy ? "Yükleniyor…" : "Yükle"}
            </button>
          </div>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-muted">Henüz resim yok.</div>
      ) : (
        <div className="form-group">
          <div className="image-upload-group row ms-0">
            {images.map((img) => (
              <div
                key={img.id}
                className="image-upload-group__single border p-3 rounded-3 col-lg-3 col-md-12 col-12"
              >
                <div className="d-grid">
                  <img src={img.imageUrl} alt="" className="card-img-top" />
                  <div className="card-body d-flex flex-column gap-2">
                    {img.isPrimary ? (
                      <button
                        className="btn btn-sm btn-outline-success"
                        disabled
                      >
                        Kapak Resmi
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={async () => {
                          await setPrimaryProductImage(pid, img.id);
                          await refresh();
                          MySwal.fire({
                            icon: "success",
                            title: "Başarılı",
                            text: "Kapak resmi güncellendi.",
                            confirmButtonText: "Tamam",
                          });
                        }}
                      >
                        Kapak Resmi Yap
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={async () => {
                        await deleteProductImage(pid, img.id);
                        await refresh();
                        MySwal.fire({
                          icon: "success",
                          title: "Silindi",
                          text: "Resim başarıyla silindi.",
                          confirmButtonText: "Tamam",
                        });
                      }}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
