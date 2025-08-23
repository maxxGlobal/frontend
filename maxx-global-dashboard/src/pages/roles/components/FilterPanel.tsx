// src/pages/roles/components/FilterPanel.tsx
type Props = {
  q: string;
  setQ: (v: string) => void;
};

export default function FilterPanel({ q, setQ }: Props) {
  return (
    <div id="sherah-table__vendor_filter" className="filter-panel">
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
          onChange={(e) => setQ(e.target.value)}
          aria-controls="sherah-table__vendor"
        />
        {q && (
          <button
            type="button"
            className="btn btn-clear"
            onClick={() => {
              setQ("");
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
