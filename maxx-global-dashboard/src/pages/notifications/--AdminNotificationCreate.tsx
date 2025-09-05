// src/pages/notifications/AdminNotificationCreate.tsx
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { listNotificationTypes } from "../../services/notifications/listTypes";
import { createAdminNotification } from "../../services/notifications/--createAdmin";
import { listSimpleDealers } from "../../services/dealers/listSimple";

import type {
  NotificationType,
  CreateAdminNotificationRequest,
} from "../../types/notifications";

const MySwal = withReactContent(Swal);

type DealerSimple = { id: number; name: string };

export default function AdminNotificationCreate() {
  const [loading, setLoading] = useState(false);

  // lookups
  const [types, setTypes] = useState<NotificationType[]>([]);
  const [dealers, setDealers] = useState<DealerSimple[]>([]);

  // form state
  const [dealerId, setDealerId] = useState<number | undefined>(undefined);
  const [typeName, setTypeName] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [relatedEntityId, setRelatedEntityId] = useState<string>("");
  const [relatedEntityType, setRelatedEntityType] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [actionUrl, setActionUrl] = useState<string>("");
  const [dataJson, setDataJson] = useState<string>("");

  // load lookups
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [tps, dls] = await Promise.all([
          listNotificationTypes(),
          listSimpleDealers(),
        ]);
        // alfabetik sıralama
        tps.sort((a, b) =>
          (a.displayName || a.name).localeCompare(b.displayName || b.name, "tr")
        );
        dls.sort((a, b) => a.name.localeCompare(b.name, "tr"));

        setTypes(tps);
        setDealers(dls);
      } catch (e: any) {
        console.error(e);
        MySwal.fire("Hata", e?.message || "Veriler yüklenemedi", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dealerOptions = useMemo(
    () => dealers.map((d) => ({ value: d.id, label: d.name })),
    [dealers]
  );
  const typeOptions = useMemo(
    () =>
      types.map((t) => ({
        value: t.name,
        label: t.displayName || t.name,
      })),
    [types]
  );

  function toNull(v: string) {
    const s = (v ?? "").trim();
    return s === "" ? null : s;
  }
  function toNullNum(v: string) {
    const s = (v ?? "").trim();
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // basic validation
    if (!dealerId) {
      MySwal.fire("Hata", "Bayi seçiniz.", "error");
      return;
    }
    if (!typeName) {
      MySwal.fire("Hata", "Bildirim tipi seçiniz.", "error");
      return;
    }
    if (!title.trim()) {
      MySwal.fire("Hata", "Başlık giriniz.", "error");
      return;
    }
    if (!message.trim()) {
      MySwal.fire("Hata", "Mesaj giriniz.", "error");
      return;
    }

    let dataPayload: string | null = toNull(dataJson);
    // data alanına JSON yazmak isteyebilirsiniz; bozuksa string olarak geçeriz.
    // JSON zorunlu değilse aşağıyı yorumlayabilirsiniz.
    // try { if (dataPayload) JSON.parse(dataPayload); } catch { /* string olarak gider */ }

    const payload: CreateAdminNotificationRequest = {
      dealerId,
      title: title.trim(),
      message: message.trim(),
      type: typeName,
      relatedEntityId: toNullNum(relatedEntityId),
      relatedEntityType: toNull(relatedEntityType),
      priority: toNull(priority),
      icon: toNull(icon),
      actionUrl: toNull(actionUrl),
      data: dataPayload,
    };

    try {
      setLoading(true);
      const created = await createAdminNotification(payload);
      await MySwal.fire(
        "Başarılı",
        `${created?.length ?? 0} bildirim oluşturuldu.`,
        "success"
      );
      // formu temizle
      setTitle("");
      setMessage("");
      setRelatedEntityId("");
      setRelatedEntityType("");
      setPriority("");
      setIcon("");
      setActionUrl("");
      setDataJson("");
    } catch (e: any) {
      MySwal.fire("Hata", e?.message || "Bildirim oluşturulamadı", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        <div className="row align-items-center mb-4 justify-content-between">
          <div className="col-sm-12 col-md-6">
            <h3 className="sherah-card__title py-3">Admin Bildirim Oluştur</h3>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-3">
        <div className="row g-3">
          {/* Dealer */}
          <div className="col-md-6">
            <label className="form-label">Bayi</label>
            <Select
              options={dealerOptions}
              value={
                dealerId
                  ? dealerOptions.find((o) => o.value === dealerId) ?? null
                  : null
              }
              onChange={(opt) => setDealerId(opt?.value)}
              isDisabled={loading}
              placeholder="Bayi seçiniz"
            />
          </div>

          {/* Type */}
          <div className="col-md-6">
            <label className="form-label">Bildirim Tipi</label>
            <Select
              options={typeOptions}
              value={
                typeName
                  ? typeOptions.find((o) => o.value === typeName) ?? null
                  : null
              }
              onChange={(opt) => setTypeName(opt?.value || "")}
              isDisabled={loading}
              placeholder="Tip seçiniz"
            />
          </div>

          {/* Title */}
          <div className="col-md-6">
            <label className="form-label">Başlık</label>
            <input
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              placeholder="Örn: Yeni sipariş oluşturuldu"
            />
          </div>

          {/* Message */}
          <div className="col-md-6">
            <label className="form-label">Mesaj</label>
            <input
              className="form-control"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              placeholder="Mesaj içeriği"
            />
          </div>

          {/* Optional fields */}
          {/* <div className="col-md-3">
            <label className="form-label">Related Entity ID</label>
            <input
              type="number"
              className="form-control"
              value={relatedEntityId}
              onChange={(e) => setRelatedEntityId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Related Entity Type</label>
            <input
              className="form-control"
              value={relatedEntityType}
              onChange={(e) => setRelatedEntityType(e.target.value)}
              disabled={loading}
              placeholder="Order, Product, vs."
            />
          </div> */}

          <div className="col-md-3">
            <label className="form-label">Priority</label>
            <input
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={loading}
              placeholder="low | normal | high ..."
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Icon</label>
            <input
              className="form-control"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={loading}
              placeholder="fa-solid fa-bell"
            />
          </div>

          {/* <div className="col-md-6">
            <label className="form-label">Action URL</label>
            <input
              className="form-control"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              disabled={loading}
              placeholder="Örn: /orders/123"
            />
          </div> */}

          {/* <div className="col-md-6">
            <label className="form-label">Data (JSON ya da metin)</label>
            <input
              className="form-control"
              value={dataJson}
              onChange={(e) => setDataJson(e.target.value)}
              disabled={loading}
              placeholder='{"key":"value"}'
            />
          </div> */}
        </div>

        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Oluştur"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={loading}
            onClick={() => {
              setDealerId(undefined);
              setTypeName("");
              setTitle("");
              setMessage("");
              setRelatedEntityId("");
              setRelatedEntityType("");
              setPriority("");
              setIcon("");
              setActionUrl("");
              setDataJson("");
            }}
          >
            Temizle
          </button>
        </div>
      </form>
    </div>
  );
}
