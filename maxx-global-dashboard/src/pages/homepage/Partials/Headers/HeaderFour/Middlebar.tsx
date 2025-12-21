import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useTranslation } from "react-i18next";

import Cart from "../../../Cart";
import ThinBag from "../../../Helpers/icons/ThinBag";
import ThinLove from "../../../Helpers/icons/ThinLove";
import Bell from "../../../Helpers/icons/Bell";
import SearchBox from "../../../Helpers/SearchBox";
import { getCurrentUser } from "../../../../../services/auth/authService";
const Logo = "/assets/img/medintera-logo.png";

import { getFavoriteCount } from "../../../../../services/favorites/count";
import {
  getUnreadCount,
  markAllNotificationsRead,
} from "../../../../../services/notifications/header";
import { listNotifications } from "../../../../../services/notifications/list";
import type { NotificationRow } from "../../../../../types/notifications";
import { useCart } from "../../../Helpers/CartContext";
import LanguageSwitcher from "../../../Helpers/LanguageSwitcher";

const MySwal = withReactContent(Swal);
const qkUnread = ["notifications", "unreadCount"];

export default function Middlebar({ className }: { className?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const formatTimeAgo = useMemo(
    () =>
      (iso?: string | null) => {
        if (!iso) return "";
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return t("header.notifications.timeAgo.justNow");
        if (mins < 60)
          return t("header.notifications.timeAgo.minutes", { count: mins });
        const hrs = Math.floor(mins / 60);
        if (hrs < 24)
          return t("header.notifications.timeAgo.hours", { count: hrs });
        return t("header.notifications.timeAgo.days", {
          count: Math.floor(hrs / 24),
        });
      },
    [t]
  );

  const { data: wishlistCount = 0 } = useQuery<number>({
    queryKey: ["favoriteCount"],
    queryFn: getFavoriteCount,
    refetchInterval: 60_000,
  });

  const { data: notificationCount = 0 } = useQuery<number>({
    queryKey: qkUnread,
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
  });

  const { items: cartItems, refresh: refreshCart } = useCart();
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const populateName = () => {
      const user = getCurrentUser();
      if (user?.firstName || user?.lastName) {
        setUserName([user.firstName, user.lastName].filter(Boolean).join(" "));
      } else {
        setUserName(null);
      }
    };

    populateName();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "user") {
        populateName();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadNotifications = async () => {
    if (loading || items.length > 0) return;
    try {
      setLoading(true);
      const res = await listNotifications();
      setItems(res.content ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = async () => {
    const confirm = await MySwal.fire({
      title: t("header.notifications.markAllTitle"),
      text: t("header.notifications.markAllBody"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("header.notifications.confirm"),
      cancelButtonText: t("header.notifications.cancel"),
    });
    if (!confirm.isConfirmed) return;

    try {
      setUpdating(true);
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));

      qc.setQueryData<number>(qkUnread, 0);
      await qc.invalidateQueries({ queryKey: qkUnread });

      await MySwal.fire(
        t("header.notifications.confirm"),
        t("header.notifications.success"),
        "success"
      );
    } catch (err: any) {
      await MySwal.fire(
        t("header.notifications.error"),
        err?.message ?? t("header.notifications.error"),
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleSearch = (q: string) => {
    if (q) navigate(`/homepage/all-product?search=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={`w-full h-[86px] bg-white ${className || ""}`}>
      <div className="container-x mx-auto h-full">
        <div className="relative h-full flex justify-between items-center">
          <Link to="/homepage">
            <img
              width={240}
              height={36}
              src={Logo}
              alt={t("header.logoAlt")}
            />
          </Link>

          <div className="w-[517px] h-[44px]">
            <SearchBox className="search-com" onSearch={handleSearch} />
          </div>

          <div className="flex gap-4 items-center">
            <LanguageSwitcher className="hidden md:flex" />
            {userName && (
              <div className="hidden lg:flex flex-col leading-4 text-right">
                <span className="text-[12px] text-gray-500">
                  {t("common.welcome")}
                </span>
                <span className="text-[13px] font-semibold text-qblack">
                  {userName}
                </span>
              </div>
            )}
            <div
              className="group relative py-4"
              onMouseEnter={loadNotifications}
            >
              <div className="cart relative cursor-pointer">
                <Link to="/homepage/notifications">
                  <Bell />
                </Link>
                {notificationCount > 0 && (
                  <span className="w-[18px] h-[18px] rounded-full bg-qh2-green absolute -top-2 -right-1 flex justify-center items-center text-[9px] text-white">
                    {notificationCount}
                  </span>
                )}
              </div>

              <div className="absolute -right-[45px] top-11 z-50 hidden group-hover:block">
                <div
                  style={{ boxShadow: "0px 15px 50px 0px rgba(0,0,0,0.14)" }}
                  className="w-[300px] bg-white border-t-[3px] rounded-xl overflow-hidden cart-wrapper"
                >
                  <div className="w-full h-full flex flex-col">
                    {items.length > 0 && (
                      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
                        <h3 className="text-qblack font-semibold">
                          {t("header.notifications.title")}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={handleMarkAll}
                            disabled={updating}
                            className="text-white bg-qh2-green border p-1 rounded py-0 cursor-pointer"
                            title={t("header.notifications.markAllTitle")}
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="product-items max-h-[310px] overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center">
                          {t("header.notifications.loading")}
                        </div>
                      ) : items.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          {t("header.notifications.empty")}
                        </div>
                      ) : (
                        <ul>
                          {items.map((n) => (
                            <li
                              key={n.id}
                              className={`flex items-start gap-2 px-4 py-3 border-b border-gray-100 transition ${
                                n.isRead
                                  ? "bg-gray-50 text-gray-500"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {!n.isRead && (
                                <span className="w-2 h-2 mt-1 rounded-full bg-qh2-green flex-shrink-0"></span>
                              )}

                              <div className="flex flex-col">
                                <p className="title text-[13px] font-semibold text-qblack leading-4 line-clamp-2">
                                  {n.title}
                                </p>
                                <span className="text-qh2-green text-[12px]">
                                  {n.message}
                                </span>
                                <span className="text-gray-500 text-[11px] mt-1">
                                  {formatTimeAgo(n.createdAt)}{" "}
                                  {t("header.notifications.timeAgoSuffix")}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {items.length > 0 && (
                      <>
                        <div className="px-4 mt-4 border-t border-gray-200 pt-4">
                          <Link to="/homepage/notifications">
                            <div className="bg-yellow-500 text-white w-full h-[45px] flex items-center justify-center rounded-md">
                              <span>{t("header.notifications.viewAll")}</span>
                            </div>
                          </Link>
                        </div>
                        <div className="px-4 mt-4 border-t border-gray-200 py-3 text-center">
                          <p className="text-[13px] font-medium text-qgray">
                            <span className="text-qblack">
                              {t("header.notifications.viewAllHint")}
                            </span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Link to="/homepage/favorites">
                <ThinLove />
              </Link>
              {wishlistCount > 0 && (
                <span className="w-[18px] h-[18px] rounded-full bg-qh2-green absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] text-white">
                  {wishlistCount}
                </span>
              )}
            </div>

            <div className="cart-wrapper group relative py-4 me-2">
              <div className="cart relative cursor-pointer ps-2">
                <Link to="/homepage/basket">
                  <ThinBag />
                </Link>
                {cartCount > 0 && (
                  <span className="w-[18px] h-[18px] rounded-full bg-qh2-green absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] text-white">
                    {cartCount}
                  </span>
                )}
                <Cart className="absolute -right-[45px] top-6 z-50 hidden group-hover:block" />
              </div>
            </div>

            <button className="Btn" onClick={handleLogout}>
              <div className="sign">
                <svg viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                </svg>
              </div>
              <div className="text">{t("common.logout")}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
