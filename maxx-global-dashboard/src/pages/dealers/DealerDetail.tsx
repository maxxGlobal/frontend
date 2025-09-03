// src/pages/dealers/DealerDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import type { Dealer, DealerUserLite } from "../../types/dealer";
import api from "../../lib/api";
import EditDealerUserModal from "../dealers/components/EditDealerUserModal"; // ✅ mevcut modalı kullanıyoruz

export default function DealerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);

  // modal state
  const [editUser, setEditUser] = useState<DealerUserLite | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/dealers/${id}`);
        setDealer(res.data.data ?? res.data); // backend response uyumlu
      } catch (e: any) {
        Swal.fire("Hata", "Bayi bilgileri yüklenemedi", "error");
        navigate("/dealers"); // geri dön
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  async function handleDeleteUser(userId: number) {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kullanıcı silinecek",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/users/${userId}`);
      Swal.fire("Başarılı", "Kullanıcı silindi", "success");

      setDealer((prev) =>
        prev
          ? { ...prev, users: prev.users?.filter((u) => u.id !== userId) ?? [] }
          : prev
      );
    } catch (e: any) {
      Swal.fire("Hata", "Kullanıcı silinemedi", "error");
    }
  }

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Yükleniyor</span>
        </div>
      </div>
    );
  }

  if (!dealer) return null;

  return (
    <div className="sherah-page-inner sherah-default-bg sherah-border p-4">
      <h2 className="mb-3">{dealer.name}</h2>

      <div className="mb-4">
        <p>
          <strong>Telefon (Sabit):</strong> {dealer.fixedPhone ?? "-"}
        </p>
        <p>
          <strong>Telefon (Mobil):</strong> {dealer.mobilePhone ?? "-"}
        </p>
        <p>
          <strong>Email:</strong> {dealer.email ?? "-"}
        </p>
        <p>
          <strong>Adres:</strong> {dealer.address ?? "-"}
        </p>
        <p>
          <strong>Durum:</strong> {dealer.status ?? "-"}
        </p>
        <p>
          <strong>Para Birimi:</strong> {dealer.preferredCurrency ?? "-"}
        </p>
      </div>

      <h4>Bayi Kullanıcıları</h4>
      {dealer.users && dealer.users.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Email</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {dealer.users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName ?? `${u.firstName} ${u.lastName}`}</td>
                <td>{u.email}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => setEditUser(u)}
                  >
                    <i className="fa-regular fa-pen-to-square"></i> Güncelle
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    <i className="fa-solid fa-trash"></i> Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="alert alert-info">
          Bu bayiye ait kullanıcı bulunamadı.
        </div>
      )}

      {/* Güncelleme Modalı */}
      {editUser && (
        <EditDealerUserModal
          target={editUser}
          onClose={() => setEditUser(null)}
          onSaved={(updated) => {
            setDealer((prev) =>
              prev
                ? {
                    ...prev,
                    users: prev.users?.map((u) =>
                      u.id === updated.id ? updated : u
                    ),
                  }
                : prev
            );
            setEditUser(null);
          }}
        />
      )}
    </div>
  );
}
