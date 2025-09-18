// src/pages/homepage/components/Navbar/index.tsx (senin dosyana göre yol)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Arrow from "../../../Helpers/icons/Arrow";
import { listAllCategories } from "../../../../../services/categories/listAll";
import { getMedicalIcon } from "../../../../../assets/icons/MedicalIcons";
import {
  buildCategoryTree,
  type CatNode,
} from "../../../../../services/categories/buildTree";

// --- yardımcılar
function findNodeById(nodes: CatNode[], id: number): CatNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const f = findNodeById(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

function collectDescendantsIds(node: CatNode): number[] {
  const out: number[] = [node.id];
  if (node.children?.length) {
    for (const ch of node.children) out.push(...collectDescendantsIds(ch));
  }
  return out;
}

// ---- Helper: all descendants count (for height animation fallback)
function countNodes(nodes: CatNode[]): number {
  let c = 0;
  const walk = (arr: CatNode[]) => {
    for (const n of arr) {
      c += 1;
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return c;
}

export default function Navbar({ className }: { className?: string }) {
  const [categoryToggle, setToggle] = useState(false);
  const [roots, setRoots] = useState<CatNode[]>([]);
  const [elementsSize, setSize] = useState("0px");
  const listRef = useRef<HTMLUListElement | null>(null);
  const navigate = useNavigate();

  // Kategorileri yükle (sadece kökler)
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const flat = await listAllCategories({ signal: controller.signal });
        const tree = buildCategoryTree(flat);
        setRoots(tree);
      } catch (e) {}
    })();
    return () => controller.abort();
  }, []);

  // Dropdown yükseklik ölçümü
  useEffect(() => {
    if (categoryToggle) {
      const el = listRef.current;
      if (el) setSize(`${el.scrollHeight}px`);
      else setSize(`${Math.max(1, countNodes(roots)) * 42}px`);
    } else {
      setSize("0px");
    }
  }, [categoryToggle, roots]);

  const handlePick = (id: number) => {
    const node = findNodeById(roots, id);
    const ids = node ? collectDescendantsIds(node) : [id];

    setToggle(false);
    const params = new URLSearchParams();
    params.set("cat", String(id));
    params.set("cats", ids.join(","));
    navigate(`/homepage/all-product?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalItems = useMemo(() => roots.length, [roots]);

  return (
    <div
      className={`nav-widget-wrapper w-full bg-qh2-green h-[60px] relative z-30 ${
        className || ""
      }`}
    >
      <div className="container-x mx-auto h-full">
        <div className="w-full h-full relative">
          <div className="w-full h-full flex justify-between items-center">
            <div className="category-and-nav flex xl:space-x-7 space-x-3 items-center">
              <div className="category w-[270px] h-[53px] bg-white px-5 rounded-t-md mt-[6px] relative">
                <button
                  onClick={() => setToggle((v) => !v)}
                  type="button"
                  aria-expanded={categoryToggle}
                  className="w-full h-full flex justify-between items-center"
                >
                  <div className="flex space-x-3 items-center">
                    <span className="text-qblack">
                      <svg
                        className="fill-current"
                        width="14"
                        height="9"
                        viewBox="0 0 14 9"
                      >
                        <rect width="14" height="1" />
                        <rect y="8" width="14" height="1" />
                        <rect y="4" width="10" height="1" />
                      </svg>
                    </span>
                    <span className="text-sm font-600 text-qblacktext">
                      Tüm Kategoriler
                    </span>
                  </div>
                  <div
                    className={`transition-transform ${
                      categoryToggle ? "rotate-180" : ""
                    }`}
                  >
                    <Arrow
                      width="5.78538"
                      height="1.28564"
                      className="fill-current text-qblacktext"
                    />
                  </div>
                </button>

                {categoryToggle && (
                  <div
                    className="fixed top-0 left-0 w-full h-full -z-10"
                    onClick={() => setToggle(false)}
                  />
                )}

                <div
                  className="category-dropdown w-full absolute left-0 top-[53px] overflow-hidden"
                  style={{ height: elementsSize }}
                >
                  <ul
                    ref={listRef}
                    className="categories-list bg-white py-1 max-h-[70vh] overflow-auto"
                  >
                    <li>
                      <button
                        type="button"
                        className="w-full flex justify-between items-center px-5 h-10 hover:bg-qh2-green transition-all duration-300 ease-in-out cursor-pointer text-qblack hover:text-white"
                        onClick={() => {
                          setToggle(false);
                          navigate("/homepage/all-product");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <div className="flex items-center space-x-6">
                          <span>
                            <svg
                              className="fill-current"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                            >
                              <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm-1 5v4H7a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0v-4h4a1 1 0 0 0 0-2h-4V7a1 1 0 0 0-2 0z" />
                            </svg>
                          </span>
                          <span className="text-xs font-400">Tümü</span>
                        </div>
                        <div>
                          <Arrow className="fill-current w-2 h-3" />
                        </div>
                      </button>
                    </li>
                    {roots.map((n) => {
                      return (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => handlePick(n.id)}
                            className="w-full categories-btn flex justify-between items-center px-5 h-10 bg-white hover:bg-qh2-green transition-all duration-300 ease-in-out cursor-pointer text-qblack hover:text-white"
                            title={n.name}
                          >
                            <div className="flex items-center space-x-6">
                              <span>{getMedicalIcon(n.name, "w-4 h-4")}</span>
                              <span className="text-xs font-400 text-start line-clamp-1">
                                {n.name}
                              </span>
                            </div>
                            <div>
                              <Arrow className="fill-current w-2 h-3" />
                            </div>
                          </button>
                        </li>
                      );
                    })}

                    {totalItems === 0 && (
                      <li className="px-5 py-3 text-xs text-gray-500">
                        Kategori bulunamadı.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="nav">
                <ul className="nav-wrapper flex xl:space-x-10 space-x-5">
                  <li>
                    <Link to="/homepage">
                      <span className="flex items-center text-sm text-white font-600 cursor-pointer transition hover:text-qyellow">
                        <span>Anasayfa</span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/homepage/all-product">
                      <span className="flex items-center text-sm text-white font-600 cursor-pointer transition hover:text-qyellow">
                        <span>Ürünlerimiz</span>
                      </span>
                    </Link>
                  </li>

                  <li>
                    <Link to="/homepage/about">
                      <span className="flex items-center text-sm text-white font-600 cursor-pointer transition hover:text-qyellow">
                        <span>Hakkımızda</span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/homepage/contact">
                      <span className="flex items-center text-sm text-white font-600 cursor-pointer transition hover:text-qyellow">
                        <span>İletişim</span>
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="become-seller-btn w-[161px] h-[40px]">
              <Link to="/homepage/my-orders">
                <div className="yellow-btn flex justify-center items-center cursor-pointer h-full rounded-sm">
                  <div className="flex space-x-2 items-center">
                    <span className="text-sm font-600 text-white">
                      Sipariş Geçmişi
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
