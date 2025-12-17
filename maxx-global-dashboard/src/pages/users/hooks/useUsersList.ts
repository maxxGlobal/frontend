import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  type DealerSummary,
  getDealerSummaries,
} from "../../../services/--dealerService";
import {
  listUsers,
  searchUsers,
  listUsersByDealer,
  listActiveUsers,
} from "../../../services/users/list";
import { type PageRequest, type PageResponse } from "../../../types/paging";
import { type UserRow } from "../../../types/user";

const DEFAULTS = {
  page: 0,
  size: 10,
  sortBy: "firstName",
  sortDirection: "asc" as const,
};

function useDebounced<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function useUsersList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // filters & sorting
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) || DEFAULTS.page
  );
  const [size, setSize] = useState<number>(
    Number(searchParams.get("size")) || DEFAULTS.size
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") || DEFAULTS.sortBy
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    (searchParams.get("sortDirection") as "asc" | "desc") ||
      DEFAULTS.sortDirection
  );
  const [q, setQ] = useState<string>(searchParams.get("q") || "");
  const dq = useDebounced(q, 350);

  const [dealers, setDealers] = useState<DealerSummary[]>([]);
  const [dealerId, setDealerId] = useState<number | "">(
    Number(searchParams.get("dealerId")) || ""
  );
  const [activeOnly, setActiveOnly] = useState<boolean>(
    searchParams.get("active") === "1"
  );

  const [data, setData] = useState<PageResponse<UserRow> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // URL sync
  useEffect(() => {
    const params: Record<string, string> = {
      page: String(page),
      size: String(size),
      sortBy,
      sortDirection,
    };
    if (dq.trim()) params.q = dq.trim();
    if (dealerId) params.dealerId = String(dealerId);
    if (activeOnly) params.active = "1";
    setSearchParams(params, { replace: true });
  }, [
    page,
    size,
    sortBy,
    sortDirection,
    dq,
    dealerId,
    activeOnly,
    setSearchParams,
  ]);

  // dealers
  useEffect(() => {
    (async () => {
      try {
        const list = await getDealerSummaries();
        setDealers(list);
      } catch (e) {
        console.warn("Bayiler alınamadı", e);
      }
    })();
  }, []);

  // data
  useEffect(() => {
    const c = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const baseReq: PageRequest = { page, size, sortBy, sortDirection };

        if (activeOnly) {
          // service zaten PageResponse'a normalize ediyor
          const res = await listActiveUsers(baseReq, { signal: c.signal });
          // Eğer bayi filtresi yoksa, backend'den gelen sayfalama verisini aynen kullan.
          if (!dealerId) {
            if (!cancelled) setData(res);
            return;
          }

          // Bayiye göre filtre gerekiyorsa mevcut sayfadaki kayıtları daralt ve sayfalama değerlerini güncelle.
          const filtered = res.content.filter((u) => u.dealer?.id === Number(dealerId));
          const totalElements = filtered.length;
          const totalPages = Math.max(1, Math.ceil(totalElements / size));
          const paged: PageResponse<UserRow> = {
            ...res,
            totalElements,
            totalPages,
            content: filtered.slice(page * size, page * size + size),
          };
          if (!cancelled) setData(paged);
          return;
        }

        if (dealerId) {
          const res = await listUsersByDealer(
            { ...baseReq, dealerId: Number(dealerId) },
            { signal: c.signal }
          );
          if (!cancelled) setData(res);
          return;
        }

        const t = dq.trim();
        const res =
          t.length >= 3
            ? await searchUsers({ ...baseReq, q: t }, { signal: c.signal })
            : await listUsers(baseReq, { signal: c.signal });

        if (!cancelled) setData(res);
      } catch (e: any) {
        if (e.name === "CanceledError" || e.name === "AbortError") return;
        if (!cancelled) setError("Kullanıcılar yüklenirken bir hata oluştu.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      c.abort();
    };
  }, [page, size, sortBy, sortDirection, dq, dealerId, activeOnly, refreshKey]);

  // helpers
  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDirection("asc");
    }
    setPage(0);
  };

  const sortIcon = useMemo(
    () => (col: string) =>
      sortBy === col ? (sortDirection === "asc" ? "▲" : "▼") : "⇅",
    [sortBy, sortDirection]
  );

  const selectedDealerName =
    dealerId === ""
      ? "Tümü"
      : dealers.find((d) => d.id === dealerId)?.name ?? "Tümü";

  const fmtDate = (iso: string | number | Date) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  };

  const isActiveStatus = (s?: string | null) => {
    if (!s) return false;
    const t = s.trim().toLocaleUpperCase("tr-TR");
    return t === "ACTIVE" || t === "AKTIF" || t === "AKTİF";
  };

  const statusClass = (s?: string | null) =>
    isActiveStatus(s)
      ? "sherah-table__status sherah-color3 sherah-color3__bg--opactity"
      : "sherah-table__status sherah-color2 sherah-color2__bg--opactity";

  return {
    state: {
      page,
      size,
      sortBy,
      sortDirection,
      q,
      dq,
      dealers,
      dealerId,
      activeOnly,
      data,
      loading,
      error,
      selectedDealerName,
    },
    actions: {
      setPage,
      setSize,
      setSortBy,
      setSortDirection,
      setQ,
      setDealerId,
      setActiveOnly,
      toggleSort,
      sortIcon,
      refresh: () => setRefreshKey((k) => k + 1),
      onChangeSize: (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSize(Number(e.target.value));
        setPage(0);
      },
    },
    helpers: { fmtDate, statusClass },
  };
}
