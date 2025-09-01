type Props = {
  q: string;
  setQ: (v: string) => void;
  activeOnly: boolean;
  setActiveOnly: (v: boolean) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  size: number;
  onChangeSize: (v: number) => void;
  onRefresh: () => void;
};

export default function FilterPanel({
  q,
  setQ,
  activeOnly,
  setActiveOnly,
  inStockOnly,
  setInStockOnly,
  size,
  onChangeSize,
  onRefresh,
}: Props) {
  return (
    <div className="filter-panel">
      <div className="filter-top">
        <div className="filter-switch me-3">
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
        <div className="filter-switch">
          <span className="label">Sadece Stokta</span>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="onlyStock"
              checked={inStockOnly}
              onChange={() => setInStockOnly(!inStockOnly)}
            />
          </div>
        </div>
      </div>

      <div className="input-group input-group-sm filter-search flex-nowrap mt-2">
        <span className="input-group-text">
          <i className="fa-solid fa-magnifying-glass" />
        </span>
        <input
          type="search"
          className="form-control sherah-wc__form-input"
          placeholder="Ürün adı / kodu ara…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button className="btn btn-clear" onClick={() => setQ("")}>
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>
    </div>
  );
}
