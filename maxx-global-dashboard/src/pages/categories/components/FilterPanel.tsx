// src/pages/categories/components/FilterPanel.tsx
type Props = {
  q: string;
  setQ: (v: string) => void;
  activeOnly: boolean;
  setActiveOnly: (v: boolean) => void;
  size: number;
  onChangeSize: (v: number) => void;
  onRefresh: () => void;
};

export default function FilterPanel({
  q,
  setQ,
  activeOnly,
  setActiveOnly,
}: Props) {
  return (
    <div className="filter-panel">
      <div className="filter-top">
        <div className="filter-switch">
          <span className="label">Sadece Aktifler</span>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="onlyActive"
              checked={activeOnly}
              onChange={() => setActiveOnly(!activeOnly)}
            />
          </div>
        </div>
      </div>

      <div className="input-group input-group-sm filter-search flex-nowrap">
        <span className="input-group-text">
          <i className="fa-solid fa-magnifying-glass" />
        </span>
        <input
          type="search"
          className="form-control sherah-wc__form-input"
          placeholder="Kategori ara…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button
            type="button"
            className="btn btn-clear"
            onClick={() => setQ("")}
            title="Temizle"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>
    </div>
  );
}
