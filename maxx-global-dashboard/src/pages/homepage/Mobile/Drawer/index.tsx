import React, { useEffect, useMemo, useRef, useState } from "react";
import Compair from "../../Helpers/icons/Compair";
import ThinLove from "../../Helpers/icons/ThinLove";
import Close from "../../Helpers/icons/Close";
import Search from "../../Helpers/icons/Search";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { listAllCategories } from "../../../../services/categories/listAll";
import { medicalIcons } from "../../../../assets/icons/MedicalIcons";
import { getFavoriteCount } from "../../../../services/favorites/count";
import { BiChevronRight } from "react-icons/bi";
import { BiChevronDown } from "react-icons/bi";

import {
  buildCategoryTree,
  type CatNode,
} from "../../../../services/categories/buildTree";

type DrawerProps = {
  open?: boolean;
  action?: (value: string) => void;
  className?: string;
};

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

export default function Drawer({ className, open, action }: DrawerProps) {
  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["favoriteCount"],
    queryFn: getFavoriteCount,
    refetchInterval: 60_000,
  });
  const [categoryToggle, setToggle] = useState(false);
  const [roots, setRoots] = useState<CatNode[]>([]);
  const [elementsSize, setSize] = useState("0px");
  const listRef = useRef<HTMLUListElement | null>(null);
  const navigate = useNavigate();
  const [tab, setTab] = useState("category");
  // Kategorileri yükle (sadece kökler)
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const flat = await listAllCategories({ signal: controller.signal });
        const tree = buildCategoryTree(flat);
        setRoots(tree);
      } catch (e) {
        console.error("Kategori listesi getirilemedi", e);
      }
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
    <>
      <div
        className={`drawer-wrapper w-full  h-full relative block lg:hidden  ${
          className || ""
        }`}
      >
        {open && (
          <div
            onClick={action}
            className="w-full h-screen bg-black bg-opacity-40 z-40 left-0 top-0 fixed"
          ></div>
        )}
        <div
          className={`w-[280px] transition-all duration-300 ease-in-out h-screen overflow-y-auto overflow-x-hidden overflow-style-none bg-white fixed top-0 z-50 ${
            open ? "left-0" : "-left-[280px]"
          }`}
        >
          <div className="w-full px-5 mt-5 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-5 items-center">
                <div className="favorite relative">
                  <Link to="/homepage/favorites">
                    <span>
                      <ThinLove />
                    </span>
                  </Link>
                  {wishlistCount > 0 && (
                    <span className="w-[18px] h-[18px] rounded-full text-white bg-qh2-green absolute -top-2.5 -right-2.5 flex justify-center items-center text-[10px]">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={action} type="button">
                <Close />
              </button>
            </div>
          </div>
          <div className="w-full mt-5 px-5">
            <div className="search-bar w-full h-[34px]  flex ">
              <div className="flex-1 bg-white h-full border border-r-0 border-[#E9E9E9]">
                <input
                  type="text"
                  className="w-full text-xs h-full focus:outline-none foucus:ring-0 placeholder:text-qgraytwo pl-2.5 "
                  placeholder="Search Product..."
                />
              </div>
              <div className="w-[40px] h-full bg-qyellow flex justify-center items-center">
                <span>
                  <Search />
                </span>
              </div>
            </div>
          </div>
          <div className="w-full mt-5 px-5 flex items-center space-x-3">
            <span
              onClick={() => setTab("category")}
              className={`text-base font-semibold  ${
                tab === "category" ? "text-qblack" : "text-qgray"
              }`}
            >
              Kategoriler
            </span>
            <span className="w-[1px] h-[14px] bg-qgray"></span>
            <span
              onClick={() => setTab("menu")}
              className={`text-base font-semibold ${
                tab === "menu" ? "text-qblack" : "text-qgray "
              }`}
            >
              Ana Menü
            </span>
          </div>
          {tab === "category" ? (
            <div className=" mt-5 w-full hover:bg-transparent">
              <ul className="w-full">
                {/* Tümü seçeneği */}
                <li className="p-0">
                  <button
                    type="button"
                    onClick={() => {
                      setToggle(false);
                      navigate("/homepage/all-product");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full flex justify-between items-center px-5 h-12 bg-white hover:bg-qyellow transition-all duration-300 ease-in-out cursor-pointer"
                  >
                    <div className="flex items-center space-x-6">
                      <span>
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
                      <span className="text-sm font-400">Tümü</span>
                    </div>
                    <div>
                      <BiChevronRight />
                    </div>
                  </button>
                </li>
                {roots.map((n) => {
                  const Icon =
                    medicalIcons[n.id % medicalIcons.length] || medicalIcons[0];
                  return (
                    <li key={n.id} className="p-0">
                      <button
                        type="button"
                        onClick={() => handlePick(n.id)}
                        title={n.name}
                        className="w-full flex justify-between items-center px-5 h-12 bg-white hover:bg-qyellow transition-all duration-300 ease-in-out cursor-pointer"
                      >
                        <div className="flex items-center space-x-6">
                          <span>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="text-sm font-400 line-clamp-1">
                            {n.name}
                          </span>
                        </div>
                        <div>
                          <BiChevronRight />
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
          ) : (
            <div className="menu-item mt-5 w-full">
              <ul className="w-full">
                <li className="p-0 hover:bg-transparent">
                  <Link to="/homepage">
                    <div className="flex justify-between items-center px-5 h-12 bg-white hover:bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                      <div className="flex items-center space-x-6">
                        <span className="text-sm font-400">AnaSayfa</span>
                      </div>
                      <div>
                        <span>
                          <BiChevronRight />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
                <li className="p-0">
                  <Link to="/homepage/all-product">
                    <div className="flex justify-between items-center px-5 h-12 bg-white hover:bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                      <div className="flex items-center space-x-6">
                        <span className="text-sm font-400">Ürünlerimiz</span>
                      </div>
                      <div>
                        <span>
                          <BiChevronRight />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
                <li className="p-0">
                  <a href="#">
                    <div className=" flex justify-between items-center px-5 h-12 bg-white hover:bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                      <div className="flex items-center space-x-6">
                        <span className="text-sm font-400">Kurumsal</span>
                      </div>
                      <div>
                        <span>
                          <BiChevronDown />
                        </span>
                      </div>
                    </div>
                  </a>
                  <ul className="submenu-list ml-5">
                    <li className="p-0">
                      <Link to="/privacy-policy">
                        <div className=" flex justify-between items-center px-5 h-12 bg-white hover:bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                          <div className="flex items-center space-x-6">
                            <span className="text-sm font-400">Kvkk</span>
                          </div>
                          <div>
                            <span>
                              <BiChevronRight />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                    <li className="p-0">
                      <Link to="/faq">
                        <div className=" flex justify-between items-center px-5 h-12 bg-white hover:bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                          <div className="flex items-center space-x-6">
                            <span className="text-sm font-400">
                              Kalite Politamız
                            </span>
                          </div>
                          <div>
                            <span>
                              <BiChevronRight />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="p-0">
                  <Link to="/homepage/about">
                    <div className="flex justify-between items-center px-5 h-12 bg-white hover:bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                      <div className="flex items-center space-x-6">
                        <span className="text-sm font-400">Hakkımızda</span>
                      </div>
                      <div>
                        <span>
                          <BiChevronRight />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
                <li className="p-0">
                  <Link to="/homepage/contact">
                    <div className="flex justify-between items-center px-5 h-12 bg-white hover:bg-qyellow transition-all duration-300 ease-in-out cursor-pointer">
                      <div className="flex items-center space-x-6">
                        <span className="text-sm font-400">İletişim</span>
                      </div>
                      <div>
                        <span>
                          <BiChevronRight />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
