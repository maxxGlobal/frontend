// src/pages/dealers/components/EditDealerUserModal.tsx
import { useState } from "react";
import Swal from "sweetalert2";
import type { DealerUserLite } from "../../../types/dealer";
import { updateUserLite } from "../../../services/users/updateLite";

type Props = {
  target: DealerUserLite;
  onClose: () => void;
  onSaved: (updated: DealerUserLite) => void;
};

export default function EditDealerUserModal({
  target,
  onClose,
  onSaved,
}: Props) {
  const [firstName, setFirstName] = useState(target.firstName);
  const [lastName, setLastName] = useState(target.lastName);
  const [email, setEmail] = useState(target.email);

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      const updated = await updateUserLite(target.id, {
        firstName,
        lastName,
        email,
      });
      Swal.fire("Başarılı", "Kullanıcı güncellendi", "success");
      onSaved(updated);
      onClose();
    } catch (e: any) {
      Swal.fire(
        "Hata",
        e?.response?.data?.message ?? "Güncelleme başarısız",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {" "}
      <div className="modal show d-block z-3">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Kullanıcı Güncelle</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Ad</label>
                <input
                  className="form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Soyad</label>
                <input
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Kapat
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
