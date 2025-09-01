import { type UserRow } from "../../../types/user";

type Props = {
  target: UserRow | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteUserModal({
  target,
  deleting,
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
        aria-labelledby="deleteModalLabel"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteModalLabel">
                Kullanıcıyı Sil
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Kapat"
                onClick={onCancel}
                disabled={deleting}
              />
            </div>
            <div className="modal-body">
              <p className="mb-0">
                <strong>
                  {target.firstName} {target.lastName}
                </strong>{" "}
                kullanıcısını silmek istiyor musunuz?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={onCancel}
                disabled={deleting}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={onConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />{" "}
                    Siliniyor…
                  </>
                ) : (
                  "Evet, Sil"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
