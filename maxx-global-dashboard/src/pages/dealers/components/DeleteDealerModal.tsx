// src/pages/dealers/components/DeleteDealerModal.tsx
import type { DealerRow } from "../../../types/dealer";

type Props = {
  target: DealerRow | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteDealerModal({
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
              <h5 className="modal-title">Bayi Sil</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                aria-label="Kapat"
              />
            </div>
            <div className="modal-body">
              <p className="mb-0">
                <strong>{target.name}</strong> bayiyi silmek istiyor musunuz?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={onCancel}>
                Vazgeç
              </button>
              <button className="btn btn-success" onClick={onConfirm}>
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
