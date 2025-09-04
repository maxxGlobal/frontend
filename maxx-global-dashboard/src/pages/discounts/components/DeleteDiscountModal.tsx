import { useState } from "react";
import Swal from "sweetalert2";
import type { Discount } from "../../../types/discount";
import { deleteDiscount } from "../../../services/discounts/delete";

type Props = {
  target: Discount;
  onClose: () => void;
  onDeleted: () => void; // listeyi yenilemek için
};

export default function DeleteDiscountModal({
  target,
  onClose,
  onDeleted,
}: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    try {
      setDeleting(true);
      await deleteDiscount(target.id);
      Swal.fire("Başarılı", "İndirim silindi", "success");
      onDeleted();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "İndirim silinemedi";
      Swal.fire("Hata", msg, "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      role="dialog"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Silme Onayı</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>
              <strong>{target.name}</strong> adlı indirimi silmek istediğinize
              emin misiniz?
            </p>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={deleting}
            >
              Vazgeç
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Siliniyor..." : "Evet, Sil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
