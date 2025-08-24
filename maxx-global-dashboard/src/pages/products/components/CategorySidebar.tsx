type CategoryItem = { id: string | number; name: string; count?: number };

type Props = {
  items: CategoryItem[];
  selectedId?: string | number | null;
  onSelect: (c: CategoryItem | null) => void; // null = tümü
};

export default function CategorySidebar({
  items,
  selectedId,
  onSelect,
}: Props) {
  return (
    <div className="col-xxl-3 col-lg-4 col-12">
      <div className="sherah-product-sidebar sherah-default-bg mg-top-30">
        <h4 className="sherah-product-sidebar__title sherah-border-btm">
          Product Categories
        </h4>
        <ul className="sherah-product-sidebar__list">
          <li className={!selectedId ? "active" : ""}>
            <button className="w-100 text-start" onClick={() => onSelect(null)}>
              <span>
                <i className="fa-solid fa-chevron-right"></i>Tümü
              </span>
            </button>
          </li>

          {items.map((c) => (
            <li key={c.id} className={c.id === selectedId ? "active" : ""}>
              <button className="w-100 text-start" onClick={() => onSelect(c)}>
                <span>
                  <i className="fa-solid fa-chevron-right"></i>
                  {c.name}
                </span>
                {typeof c.count === "number" && (
                  <span className="count">{c.count}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
