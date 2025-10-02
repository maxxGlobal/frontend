import { useState } from "react";
import type { CatNode } from "../../../services/categories/buildTree";

interface CategorySidebarProps {
  items: CatNode[];
  selectedId: number | null;
  onSelect: (cat: CatNode | null) => void;
}

export default function CategorySidebar({
  items,
  selectedId,
  onSelect,
}: CategorySidebarProps) {
  return (
    <div className="sherah-product-sidebar sherah-default-bg mg-top-30">
      <h4 className="sherah-product-sidebar__title sherah-border-btm">
        Ürün Kategorileri
      </h4>
      <ul className="sherah-product-sidebar__list category-sidebar">
        <li
          className={`category-item ${selectedId === null ? "active" : ""}`}
          onClick={() => onSelect(null)}
        >
          <span>
            <i className="fa-solid fa-chevron-right"></i>Tümü
          </span>
        </li>
        {items.map((cat) => (
          <CategoryNode
            key={cat.id}
            node={cat}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}

function CategoryNode({
  node,
  selectedId,
  onSelect,
}: {
  node: CatNode;
  selectedId: number | null;
  onSelect: (cat: CatNode) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li>
      <div
        className={`category-item ${selectedId === node.id ? "active" : ""}`}
        onClick={() => {
          onSelect(node);
          if (node.children.length > 0) {
            setExpanded((prev) => !prev);
          }
        }}
      >
        <span>
          <i
            className={`fa-solid ${
              expanded ? "fa-chevron-down" : "fa-chevron-right"
            }`}
          ></i>
          {node.name}
        </span>
      </div>
      {expanded && node.children.length > 0 && (
        <ul className="category-list nested">
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
