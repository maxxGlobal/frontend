import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { listNotificationTypes } from "../../services/notifications/listTypes";
import { adminBroadcast } from "../../services/notifications/broadcast";
import { listSimpleDealers } from "../../services/dealers/listSimple";
import { listRoleSummaries } from "../../services/roles";
import { listActiveUsers } from "../../services/users/list";

import type {
  NotificationType,
  AdminBroadcastRequest,
} from "../../types/notifications";

const MySwal = withReactContent(Swal);

type DealerOpt = { value: number; label: string };
type RoleOpt = { value: string; label: string }; // targetRole STRING
type TypeOption = { value: string; label: string; group: string };
type UserOpt = { value: number; label: string };

// PRIORITY select tipi
type Priority = "LOW" | "MEDIUM" | "HIGH";
type PriorityOpt = { value: Priority; label: string };
const PRIORITY_OPTIONS: PriorityOpt[] = [
  { value: "LOW", label: "LOW" },
  { value: "MEDIUM", label: "MEDIUM" },
  { value: "HIGH", label: "HIGH" },
];

export default function AdminBroadcastPanel() {
  // temel alanlar
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [typeName, setTypeName] = useState<string>("");

  const [relatedEntityId, setRelatedEntityId] = useState<number | undefined>();
  const [relatedEntityType, setRelatedEntityType] = useState<string>("");

  const [priority, setPriority] = useState<Priority | "">("");
  const [icon, setIcon] = useState<string>("");
  const [actionUrl, setActionUrl] = useState<string>("");
  const [data, setData] = useState<string>("");

  // hedefleme durumları (tek seçim kuralı)
  const [sendToAll, setSendToAll] = useState<boolean>(false);
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetDealerId, setTargetDealerId] = useState<number | undefined>();
  const [targetDealerIds, setTargetDealerIds] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserOpt[]>([]); // specificUserIds

  // lookups
  const [types, setTypes] = useState<NotificationType[]>([]);
  const [dealers, setDealers] = useState<DealerOpt[]>([]);
  const [roles, setRoles] = useState<RoleOpt[]>([]);
  const [userOptions, setUserOptions] = useState<UserOpt[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  // ilk yüklemeler
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [tps, dels, rls] = await Promise.all([
          listNotificationTypes(),
          listSimpleDealers(),
          listRoleSummaries(),
        ]);

        const sortedTypes = [...tps].sort((a, b) =>
          (a.displayName || a.name).localeCompare(b.displayName || b.name, "tr")
        );
        setTypes(sortedTypes);

        const dealerOpts: DealerOpt[] = dels
          .map((d: any) => ({ value: d.id, label: d.name }))
          .sort((a, b) => a.label.localeCompare(b.label, "tr"));
        setDealers(dealerOpts);

        const roleOpts: RoleOpt[] = rls
          .map((r: any) => ({
            value: r.name,
            label: r.displayName || r.name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label, "tr"));
        setRoles(roleOpts);

        if (sortedTypes.length && !typeName) setTypeName(sortedTypes[0].name);
      } catch (e: any) {
        console.error(e);
        MySwal.fire("Hata", e?.message || "Veriler yüklenemedi", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // aktif kullanıcılar (tek seferde büyük size ile)
  useEffect(() => {
    (async () => {
      try {
        const page = await listActiveUsers({
          page: 0,
          size: 1000,
          sortBy: "id",
          sortDirection: "desc", // tip güvenli
        });

        const rows: any[] = Array.isArray((page as any).content)
          ? (page as any).content
          : Array.isArray(page)
          ? (page as any)
          : [];

        const opts: UserOpt[] = rows
          .map((u: any) => {
            const name =
              [u.firstName, u.lastName].filter(Boolean).join(" ") ||
              u.username ||
              `User #${u.id}`;
            return { value: u.id, label: `${name} (ID: ${u.id})` };
          })
          .sort((a, b) => a.label.localeCompare(b.label, "tr"));

        setUserOptions(opts);
      } catch (e: any) {
        console.error(e);
        MySwal.fire("Hata", e?.message || "Kullanıcılar yüklenemedi", "error");
      }
    })();
  }, []);

  // type select
  const typeOptions: TypeOption[] = useMemo(
    () =>
      types.map((t) => ({
        value: t.name,
        label: t.displayName || t.name,
        group: t.category || "Genel",
      })),
    [types]
  );

  const selectedType = useMemo(
    () => typeOptions.find((o) => o.value === typeName) || null,
    [typeOptions, typeName]
  );

  // select değerleri
  const multiDealerSelectValue = useMemo(
    () => dealers.filter((d) => targetDealerIds.includes(d.value)),
    [dealers, targetDealerIds]
  );
  const singleDealerSelectValue = useMemo(
    () => dealers.find((d) => d.value === targetDealerId) || null,
    [dealers, targetDealerId]
  );
  const roleSelectValue = useMemo(
    () => roles.find((r) => r.value === targetRole) || null,
    [roles, targetRole]
  );
  const prioritySelectValue = useMemo<PriorityOpt | null>(
    () =>
      priority
        ? PRIORITY_OPTIONS.find((p) => p.value === priority) ?? null
        : null,
    [priority]
  );

  // yardımcı: diğer hedefleri sıfırla
  const resetAllTargetsExcept = (
    keep: "all" | "role" | "users" | "dealerOne" | "dealerMany"
  ) => {
    if (keep !== "all") setSendToAll(false);
    if (keep !== "role") setTargetRole("");
    if (keep !== "users") setSelectedUsers([]);
    if (keep !== "dealerOne") setTargetDealerId(undefined);
    if (keep !== "dealerMany") setTargetDealerIds([]);
  };

  async function handleSubmit() {
    if (posting) return; // re-entrancy guard

    try {
      if (!title.trim() || !message.trim()) {
        await MySwal.fire("Hata", "Başlık ve mesaj zorunludur.", "error");
        return;
      }
      if (!typeName) {
        await MySwal.fire("Hata", "Bir bildirim tipi seçiniz.", "error");
        return;
      }

      // 1) Mevcut state'ten NIHAI hedef değişkenlerini üret
      let finalSendToAll = sendToAll;
      let finalTargetRole = targetRole || undefined;
      let finalSpecificUserIds = selectedUsers.length
        ? selectedUsers.map((u) => u.value)
        : undefined;
      let finalTargetDealerId = targetDealerId || undefined;
      let finalTargetDealerIds = targetDealerIds.length
        ? targetDealerIds
        : undefined;

      // 2) Hedef yoksa sor → onaylarsa sadece bu fonksiyon kapsamındaki
      //    lokal değişkende sendToAll'ı true yap
      if (
        !finalSendToAll &&
        !finalTargetRole &&
        !finalSpecificUserIds &&
        !finalTargetDealerId &&
        !finalTargetDealerIds
      ) {
        const ok = await MySwal.fire(
          "Uyarı",
          "Herhangi bir hedef seçmediniz. Tüm kullanıcılara göndermek ister misiniz?",
          "warning"
        );
        if (!ok.isConfirmed) return;
        finalSendToAll = true;
      }

      // 3) Tek hedef kuralını NIHAI değerlere göre denetle
      const audienceCount = [
        finalSendToAll,
        !!finalTargetRole,
        !!finalSpecificUserIds,
        !!finalTargetDealerId,
        !!finalTargetDealerIds,
      ].filter(Boolean).length;

      if (audienceCount > 1) {
        await MySwal.fire(
          "Uyarı",
          "Lütfen tek bir hedef seçin (Tümü / Rol / Kullanıcı(lar) / Tekil Bayi / Çoklu Bayi).",
          "warning"
        );
        return;
      }

      // 4) sendToAll seçildiyse diğerlerini açıkça temizle (gürültüyü önle)
      if (finalSendToAll) {
        finalTargetRole = undefined;
        finalSpecificUserIds = undefined;
        finalTargetDealerId = undefined;
        finalTargetDealerIds = undefined;
      }

      // 5) Payload’u sadece bu NIHAI değişkenlerle kur
      const payload: AdminBroadcastRequest = {
        title: title.trim(),
        message: message.trim(),
        type: typeName,
        relatedEntityId: relatedEntityId ?? undefined,
        relatedEntityType: relatedEntityType || undefined,
        priority: priority || undefined, // "" ise undefined olur
        icon: icon || undefined,
        actionUrl: actionUrl || undefined,
        data: data || undefined,

        specificUserIds: finalSpecificUserIds,
        targetRole: finalTargetRole,
        targetDealerIds: finalTargetDealerIds,
        targetDealerId: finalTargetDealerId,
        sendToAll: finalSendToAll,
      };

      setPosting(true);

      // İstersen adminBroadcast'i {count} dönecek şekilde yazıp burada kullan
      await adminBroadcast(payload);

      await MySwal.fire("Başarılı", "Bildirim yayınlandı.", "success");

      // 6) Reset
      setTitle("");
      setMessage("");
      setRelatedEntityId(undefined);
      setRelatedEntityType("");
      setPriority("");
      setIcon("");
      setActionUrl("");
      setData("");
      setSendToAll(false);
      setTargetRole("");
      setSelectedUsers([]);
      setTargetDealerId(undefined);
      setTargetDealerIds([]);
    } catch (e: any) {
      console.error(e);
      await MySwal.fire(
        "Hata",
        e?.message || "Bildirim gönderilemedi",
        "error"
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="sherah-table p-0">
      <div className="dataTables_wrapper dt-bootstrap5 no-footer">
        <div className="row align-items-center mb-4 justify-content-between">
          <div className="col-sm-12 col-md-6">
            <h3 className="sherah-card__title py-3">
              Admin Broadcast Bildirim
            </h3>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor</span>
          </div>
        </div>
      ) : (
        <div className="card card-body">
          {/* Temel alanlar */}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Başlık</label>
              <input
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Yeni sipariş oluşturuldu"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tip</label>
              <Select<TypeOption, false>
                options={typeOptions}
                value={selectedType}
                onChange={(opt) => setTypeName(opt?.value ?? "")}
                getOptionLabel={(o) => o.label}
                getOptionValue={(o) => o.value}
                placeholder="Bildirim tipi seçiniz"
              />
            </div>

            <div className="col-12">
              <label className="form-label">Mesaj</label>
              <textarea
                className="form-control"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Kısa mesaj…"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Öncelik</label>
              <Select<PriorityOpt, false>
                options={PRIORITY_OPTIONS}
                value={prioritySelectValue}
                onChange={(opt) => setPriority(opt?.value ?? "")}
                isClearable
                placeholder="LOW / MEDIUM / HIGH"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Aksiyon Linki</label>
              <input
                className="form-control"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="Tıklanınca gidilecek URL"
              />
            </div>
          </div>

          {/* Hedefleme */}
          <hr className="my-4" />
          <h5>Hedefleme</h5>

          <div className="form-check mb-3">
            <input
              id="sendToAll"
              type="checkbox"
              className="form-check-input"
              checked={sendToAll}
              onChange={(e) => {
                const v = e.target.checked;
                setSendToAll(v);
                if (v) resetAllTargetsExcept("all"); // başka hedef bırakma
              }}
            />
            <label className="form-check-label" htmlFor="sendToAll">
              Tüm kullanıcılara gönder (sendToAll)
            </label>
          </div>

          {!sendToAll && (
            <>
              <div className="row g-3">
                {/* Rol */}
                <div className="col-md-6">
                  <label className="form-label">Rol</label>
                  <Select<RoleOpt, false>
                    options={roles}
                    value={roleSelectValue}
                    onChange={(opt) => {
                      setTargetRole(opt?.value ?? "");
                      if (opt?.value) resetAllTargetsExcept("role");
                    }}
                    isClearable
                    placeholder="Rol seçiniz (opsiyonel)"
                  />
                </div>

                {/* Kullanıcı(lar) */}
                <div className="col-md-6">
                  <label className="form-label">Kullanıcı</label>
                  <Select<UserOpt, true>
                    isMulti
                    options={userOptions}
                    value={selectedUsers}
                    onChange={(opts) => {
                      const arr = (opts ?? []) as UserOpt[];
                      setSelectedUsers(arr);
                      if (arr.length) resetAllTargetsExcept("users");
                    }}
                    placeholder="Kullanıcı seçiniz (birden fazla)"
                    isClearable
                  />
                </div>

                {/* Tekil bayi */}
                <div className="col-md-6">
                  <label className="form-label">Bayi (tekil)</label>
                  <Select<DealerOpt, false>
                    options={dealers}
                    value={singleDealerSelectValue}
                    onChange={(opt) => {
                      const id = opt ? (opt as DealerOpt).value : undefined;
                      setTargetDealerId(id);
                      if (id !== undefined) resetAllTargetsExcept("dealerOne");
                    }}
                    isClearable
                    placeholder="Tek bayi seçiniz (opsiyonel)"
                  />
                </div>

                {/* Çoklu bayi */}
                <div className="col-md-6">
                  <label className="form-label">Bayi (çoklu)</label>
                  <Select<DealerOpt, true>
                    options={dealers}
                    value={multiDealerSelectValue}
                    onChange={(opts) => {
                      const ids = Array.from(
                        new Set((opts as DealerOpt[]).map((o) => o.value))
                      );
                      setTargetDealerIds(ids);
                      if (ids.length) resetAllTargetsExcept("dealerMany");
                    }}
                    isMulti
                    placeholder="Birden fazla bayi seçiniz (opsiyonel)"
                  />
                </div>
              </div>
            </>
          )}

          <div className="text-end mt-4">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={posting}
              title="Yayınla"
            >
              {posting ? "Gönderiliyor…" : "Yayınla"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
