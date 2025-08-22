// src/pages/roles/components/FilterPanel.tsx
type Props = {
  q: string;
  setQ: (v: string) => void;
};

export default function FilterPanel({ q, setQ }: Props) {
  return (
    <div
      className="input-group input-group-sm filter-search border border-1 flex-nowrap"
      style={{ maxWidth: 420 }}
    >
      <span className="input-group-text">
        <i className="fa-solid fa-magnifying-glass" />
      </span>
      <input
        type="search"
        className="form-control sherah-wc__form-input"
        placeholder="Rol adı ara…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {q && (
        <button
          type="button"
          className="btn btn-clear"
          title="Temizle"
          onClick={() => setQ("")}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      )}
    </div>
  );
}
