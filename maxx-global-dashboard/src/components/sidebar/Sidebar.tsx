// src/components/sidebar/Sidebar.tsx
import { NavLink } from "react-router-dom";
import logo from "../../assets/img/logo-max.png";
import { menuItems, type MenuItem } from "../config/menuConfig";
import { hasPermission, type PermissionFlags } from "../../utils/permissions";

// ✅ Geliştirilmiş yetki kontrol fonksiyonu
const canShow = (node: PermissionFlags): boolean => {
  // Hiç yetki tanımlanmamışsa herkese göster
  if (!node.required && !node.anyOf?.length && !node.allOf?.length) {
    return true;
  }
  
  return hasPermission({
    required: node.required,
    anyOf: node.anyOf,
    allOf: node.allOf,
  });
};

// ✅ Ana menü öğesinin gösterilip gösterilmeyeceğini kontrol et
const shouldShowMenuItem = (item: MenuItem): boolean => {
  // Eğer alt menüsü yoksa, kendi yetkisine bak
  if (!item.children?.length) {
    return canShow(item);
  }
  
  // Alt menüsü varsa, en az bir alt menü görünebiliyorsa ana menüyü göster
  const visibleChildren = item.children.filter(canShow);
  return visibleChildren.length > 0;
};

export default function Sidebar() {
  return (
    <div className="admin-menu">
      <div className="logo sherah-sidebar-padding">
        <NavLink to="/dashboard">
          <img className="sherah-logo__main" src={logo} alt="#" />
        </NavLink>
        <div className="sherah__sicon close-icon d-xl-none">
          <svg
            width="9"
            height="15"
            viewBox="0 0 9 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6.19855 7.41927C4.22908 5.52503 2.34913 3.72698 0.487273 1.90989C0.274898 1.70227 0.0977597 1.40419 0.026333 1.11848C-0.0746168 0.717537 0.122521 0.36707 0.483464 0.154695C0.856788 -0.0643475 1.24249 -0.0519669 1.60248 0.199455C1.73105 0.289929 1.84438 0.404212 1.95771 0.514685C4.00528 2.48321 6.05189 4.45173 8.09755 6.4212C8.82896 7.12499 8.83372 7.6145 8.11565 8.30687C6.05856 10.2878 4.00052 12.2677 1.94152 14.2467C1.82724 14.3562 1.71391 14.4696 1.58439 14.5591C1.17773 14.841 0.615842 14.781 0.27966 14.4324C-0.056522 14.0829 -0.0946163 13.5191 0.202519 13.1248C0.296802 12.9991 0.415847 12.8915 0.530129 12.781C2.29104 11.0868 4.05194 9.39351 5.81571 7.70212C5.91761 7.60593 6.04332 7.53355 6.19855 7.41927Z"></path>
           </svg>
        </div>
      </div>

      <div className="admin-menu__one sherah-sidebar-padding">
        <div className="menu-bar">
          <ul className="menu-bar__one sherah-dashboard-menu" id="sherahMenu">
            {menuItems.map((item) => {
              // ✅ Ana menü öğesinin gösterilip gösterilmeyeceğini kontrol et
              if (!shouldShowMenuItem(item)) {
                return null;
              }

              const isDropdown = !!item.children?.length;

              if (!isDropdown) {
                // ✅ Dropdown olmayan tek menü öğesi
                return (
                  <li key={item.id}>
                    {item.to ? (
                      <NavLink to={item.to} className="collapsed">
                        <span className="menu-bar__text">
                          <span
                            className="sherah-menu-icon sherah-svg-icon__v1"
                            dangerouslySetInnerHTML={{
                              __html: item.iconHtml ?? "",
                            }}
                          />
                          <span className="menu-bar__name">{item.label}</span>
                        </span>
                      </NavLink>
                    ) : (
                      <a href={item.href} className="collapsed">
                        <span className="menu-bar__text">
                          <span
                            className="sherah-menu-icon sherah-svg-icon__v1"
                            dangerouslySetInnerHTML={{
                              __html: item.iconHtml ?? "",
                            }}
                          />
                          <span className="menu-bar__name">{item.label}</span>
                        </span>
                      </a>
                    )}
                  </li>
                );
              }

              // ✅ Dropdown menü - görünebilir alt menüleri filtrele
              const visibleChildren = (item.children ?? []).filter((child) =>
                canShow(child)
              );

              // ✅ Hiç görünebilir alt menü yoksa ana menüyü de gösterme
              if (visibleChildren.length === 0) {
                return null;
              }

              return (
                <li key={item.id}>
                  <a
                    href="#!"
                    className="collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target={`#${item.id}`}
                  >
                    <span className="menu-bar__text">
                      <span
                        className="sherah-menu-icon sherah-svg-icon__v1"
                        dangerouslySetInnerHTML={{
                          __html: item.iconHtml ?? "",
                        }}
                      />
                      <span className="menu-bar__name">{item.label}</span>
                    </span>
                    <span className="sherah__toggle"></span>
                  </a>

                  <div
                    className="collapse sherah__dropdown"
                    id={item.id}
                    data-bs-parent="#sherahMenu"
                  >
                    <ul className="menu-bar__one-dropdown">
                      {visibleChildren.map((child) => (
                        <li key={child.id}>
                          {child.to ? (
                            <NavLink to={child.to}>
                              <span className="menu-bar__text">
                                <span className="menu-bar__name">
                                  {child.label}
                                </span>
                              </span>
                            </NavLink>
                          ) : (
                            <a href={child.href}>
                              <span className="menu-bar__text">
                                <span className="menu-bar__name">
                                  {child.label}
                                </span>
                              </span>
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}