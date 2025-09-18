// src/components/CategoriesSidebar.tsx
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

type NodeItemProps = {
  node: CatNode;
  onPick: (node: CatNode) => void;
  selectedId: number | null;
  openNodeId: number | null;
  setOpenNodeId: (id: number | null) => void;
};

function NodeItem({
  node,
  onPick,
  selectedId,
  openNodeId,
  setOpenNodeId,
}: NodeItemProps) {
  const hasChildren = !!node.children?.length;
  const isActive = selectedId === node.id;
  const isOpen = openNodeId === node.id;

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          onPick(node);
          if (hasChildren) {
            // Parent kategoriye tıklayınca aç/kapat
            setOpenNodeId(isOpen ? null : node.id);
          } else {
            // Alt kategoriye tıklandığında parent açık kalsın (openNodeId değişmesin)
          }
        }}
        className={`w-full flex justify-between items-center px-3 h-9 text-left rounded transition-colors
          ${
            isActive
              ? "bg-qh2-green font-semibold text-white"
              : "hover:bg-gray-100"
          }
          ${isOpen && !isActive ? "bg-gray-200" : ""}`}
      >
        <span className="truncate text-sm">{node.name}</span>
        {hasChildren && (
          <span
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
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
                x="1.5"
                y="0.8"
                width="5.8"
                height="1.3"
                transform="rotate(45 1.5 0.8)"
              />
              <rect
                x="5.6"
                y="4.9"
                width="5.8"
                height="1.3"
                transform="rotate(135 5.6 4.9)"
              />
            </svg>
          </span>
        )}
      </button>

      {hasChildren && isOpen && (
        <ul className="pl-3 border-l ml-1">
          {node.children!.map((ch) => (
            <NodeItem
              key={ch.id}
              node={ch}
              onPick={onPick}
              selectedId={selectedId}
              openNodeId={openNodeId}
              setOpenNodeId={setOpenNodeId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CategoriesSidebar() {
  const [tree, setTree] = useState<CatNode[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openNodeId, setOpenNodeId] = useState<number | null>(null);

  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const catParam = sp.get("cat");
  const searchParam = sp.get("search");
  const selectedCatId =
    searchParam && searchParam.trim() !== ""
      ? null
      : catParam && catParam !== "0"
      ? Number(catParam)
      : null;

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const flat = await listAllCategories({ signal: controller.signal });
        setTree(buildCategoryTree(flat));
      } catch (e) {}
    })();
    return () => controller.abort();
  }, []);

  const handlePick = (node: CatNode) => {
    const ids = collectDescendantsIds(node);
    const params = new URLSearchParams(sp.toString());

    params.delete("search");
    params.set("cat", String(node.id));
    params.set("cats", ids.join(","));

    navigate(`/homepage/all-product?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileOpen(false);
  };

  const clearAll = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete("cat");
    params.delete("cats");
    params.delete("search");
    navigate(`/homepage/all-product?${params.toString()}`);
    setMobileOpen(false);
    setOpenNodeId(null);
  };

  return (
    <div className="bg-white rounded-md mb-4 shadow-sm">
      <button
        type="button"
        className="w-full lg:hidden flex justify-between items-center px-3 py-3 text-sm font-semibold border-2 border-[#2D6F6D] rounded"
        onClick={() => setMobileOpen((v) => !v)}
      >
        Kategoriler
        <span
          className={`transition-transform ${mobileOpen ? "rotate-90" : ""}`}
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 6 9"
            xmlns="http://www.w3.org/2000/svg"
            className="fill-current"
          >
            <rect
              x="1.5"
              y="0.8"
              width="5.8"
              height="1.3"
              transform="rotate(45 1.5 0.8)"
            />
            <rect
              x="5.6"
              y="4.9"
              width="5.8"
              height="1.3"
              transform="rotate(135 5.6 4.9)"
            />
          </svg>
        </span>
      </button>

      <div className={`${mobileOpen ? "block" : "hidden"} lg:block p-3`}>
        <h4 className="text-sm font-semibold mb-2 hidden lg:block">
          Kategoriler
        </h4>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={clearAll}
              className={`w-full truncate text-sm text-left px-3 h-9 rounded transition-colors 
                ${
                  selectedCatId == null && !searchParam
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
              openNodeId={openNodeId}
              setOpenNodeId={setOpenNodeId}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
