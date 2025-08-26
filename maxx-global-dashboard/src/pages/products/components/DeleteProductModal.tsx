// src/pages/products/components/DeleteProductModal.tsx
import type { ProductRow } from "../../../types/product";

type Props = {
  target: ProductRow | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteProductModal({
  target,
  onCancel,
  onConfirm,
}: Props) {
  if (!target) return null;

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Ürünü Sil</h5>
              <button type="button" className="btn-close" onClick={onCancel} />
            </div>
            <div className="modal-body">
              <p>
                <strong>{target.name}</strong> adlı ürünü silmek istediğinize
                emin misiniz?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={onCancel}>
                Vazgeç
              </button>
              <button className="btn btn-danger" onClick={onConfirm}>
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
