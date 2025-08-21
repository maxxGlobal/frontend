import type { DealerSummary } from "../../../types/dealer";

type Props = {
  dealers: DealerSummary[];
  dealerId: number | "";
  setDealerId: (v: number | "") => void;
  activeOnly: boolean;
  setActiveOnly: (v: boolean) => void;
  q: string;
  setQ: (v: string) => void;
  selectedDealerName: string;
  setPage: (p: number) => void;
};

export default function FilterPanel({
  dealers,
  dealerId,
  setDealerId,
  activeOnly,
  setActiveOnly,
  q,
  setQ,
  selectedDealerName,
  setPage,
}: Props) {
  return (
    <div id="sherah-table__vendor_filter" className="filter-panel">
      {/* Üst satır */}
      <div className="filter-top">
        <div className="input-group input-group-sm filter-select has-caret">
          <div className="dropdown">
            <button
              className="btn btn-sm btn-light d-flex align-items-center gap-2 dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fa-solid fa-store text-muted" />
              <span>{selectedDealerName}</span>
            </button>
            <ul className="dropdown-menu shadow-sm">
              <li>
                <button
                  className={`dropdown-item ${dealerId === "" ? "active" : ""}`}
                  onClick={() => {
                    setDealerId("");
                    setPage(0);
                  }}
                >
                  Tümü
                </button>
              </li>
              {dealers.map((d) => (
                <li key={d.id}>
                  <button
                    className={`dropdown-item ${
                      dealerId === d.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setDealerId(d.id);
                      setPage(0);
                    }}
                  >
                    {d.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="filter-switch">
          <span className="label">Aktif Kullanıcılar</span>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="onlyActive"
              checked={activeOnly}
              onChange={() => {
                setActiveOnly(!activeOnly);
                setPage(0);
              }}
            />
          </div>
        </div>
      </div>

      {/* Alt satır: arama */}
      <div className="input-group input-group-sm filter-search flex-nowrap">
        <span className="input-group-text">
          <i className="fa-solid fa-magnifying-glass" />
        </span>
        <input
          type="search"
          className="form-control sherah-wc__form-input"
          placeholder="Ad, soyad, e-posta, telefon, adres…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          aria-controls="sherah-table__vendor"
        />
        {q && (
          <button
            type="button"
            className="btn btn-clear"
            onClick={() => {
              setQ("");
              setPage(0);
            }}
            title="Temizle"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>
    </div>
  );
}
