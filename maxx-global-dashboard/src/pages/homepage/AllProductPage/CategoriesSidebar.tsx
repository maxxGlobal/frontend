// src/pages/AllProductPage/CategoriesSidebar.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listAllCategories } from "../../../services/categories/listAll";
import {
  buildCategoryTree,
  type CatNode,
} from "../../../services/categories/buildTree";

// seçilen nodun tüm altlarını topla (kendisi dahil)
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
  active,
}: {
  node: CatNode;
  onPick: (node: CatNode) => void;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!node.children?.length;

  return (
    <li>
      <button
        type="button"
        className={`w-full flex justify-between items-center px-3 h-9 text-left hover:bg-gray-100 rounded ${
          active ? "bg-gray-100 font-semibold" : ""
        }`}
        onClick={() => {
          onPick(node);
          if (hasChildren) setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup={hasChildren ? "true" : undefined}
      >
        <span className="truncate text-sm">{node.name}</span>
        {hasChildren && (
          <span className={`transition-transform ${open ? "rotate-90" : ""}`}>
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
              active={active && false}
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

  // aktiflik için tekil cat (UI highlight)
  const catParam = sp.get("cat");
  const selectedCatId = catParam && catParam !== "0" ? Number(catParam) : null;

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const flat = await listAllCategories({ signal: controller.signal });
        setTree(buildCategoryTree(flat));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Kategori listesi getirilemedi", e);
      }
    })();
    return () => controller.abort();
  }, []);

  const handlePick = (node: CatNode) => {
    // ana + tüm alt kırılımlar
    const ids = collectDescendantsIds(node);

    // mevcut diğer query'leri koru; cat ve cats'i set et
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
    <div className="bg-white p-3 rounded-md mb-4">
      <h4 className="text-sm font-semibold mb-2">Kategoriler</h4>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            onClick={clearAll}
            className={`w-full text-left px-3 h-9 rounded hover:bg-gray-100 ${
              selectedCatId == null ? "bg-gray-100 font-semibold" : ""
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
            active={selectedCatId === root.id}
          />
        ))}
      </ul>
    </div>
  );
}
