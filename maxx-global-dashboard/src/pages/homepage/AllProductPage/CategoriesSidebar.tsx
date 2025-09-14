// src/pages/AllProductPage/CategoriesSidebar.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listAllCategories } from "../../../services/categories/listAll";
import {
  buildCategoryTree,
  type CatNode,
} from "../../../services/categories/buildTree";

function collectDescendantsIds(node: CatNode): number[] {
  const out: number[] = [node.id];
  if (node.children?.length) {
    for (const ch of node.children) out.push(...collectDescendantsIds(ch));
  }
  return out;
}

function NodeItem({
  node,
  onPick,
  selectedId,
}: {
  node: CatNode;
  onPick: (node: CatNode) => void;
  selectedId: number | null;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!node.children?.length;

  // seçiliyse veya seçilen kategori bu node’un altındaysa highlight
  const isActive = selectedId === node.id;

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup={hasChildren ? "true" : undefined}
        onClick={() => {
          onPick(node);
          if (hasChildren) setOpen((v) => !v);
        }}
        className={`w-full flex justify-between items-center px-3 h-9 text-left rounded transition-colors
          ${
            isActive
              ? "bg-blue-100 font-semibold text-blue-700"
              : "hover:bg-gray-100"
          }
          ${open && !isActive ? "bg-gray-50" : ""}`}
      >
        <span className="truncate text-sm">{node.name}</span>
        {hasChildren && (
          <span
            className={`transition-transform duration-200 ${
              open ? "rotate-90" : ""
            }`}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 6 9"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-current"
            >
              <rect
                x="1.498"
                y="0.818"
                width="5.785"
                height="1.285"
                transform="rotate(45 1.498 0.818)"
              />
              <rect
                x="5.59"
                y="4.909"
                width="5.785"
                height="1.285"
                transform="rotate(135 5.59 4.909)"
              />
            </svg>
          </span>
        )}
      </button>

      {hasChildren && open && (
        <ul className="pl-3 border-l ml-1">
          {node.children!.map((ch) => (
            <NodeItem
              key={ch.id}
              node={ch}
              onPick={onPick}
              selectedId={selectedId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CategoriesSidebar() {
  const [tree, setTree] = useState<CatNode[]>([]);
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const catParam = sp.get("cat");
  const selectedCatId = catParam && catParam !== "0" ? Number(catParam) : null;

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const flat = await listAllCategories({ signal: controller.signal });
        setTree(buildCategoryTree(flat));
      } catch (e) {
        console.error(e);
      }
    })();
    return () => controller.abort();
  }, []);

  const handlePick = (node: CatNode) => {
    const ids = collectDescendantsIds(node);
    const params = new URLSearchParams(sp.toString());
    params.set("cat", String(node.id));
    params.set("cats", ids.join(","));
    navigate(`/homepage/all-product?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAll = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete("cat");
    params.delete("cats");
    navigate(`/homepage/all-product?${params.toString()}`);
  };

  return (
    <div className="bg-white p-3 rounded-md mb-4 shadow-sm">
      <h4 className="text-sm font-semibold mb-2">Kategoriler</h4>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            onClick={clearAll}
            className={`w-full text-left px-3 h-9 rounded transition-colors 
              ${
                selectedCatId == null
                  ? "bg-blue-100 font-semibold text-blue-700"
                  : "hover:bg-gray-100"
              }`}
          >
            Tümü
          </button>
        </li>

        {tree.map((root) => (
          <NodeItem
            key={root.id}
            node={root}
            onPick={handlePick}
            selectedId={selectedCatId}
          />
        ))}
      </ul>
    </div>
  );
}
