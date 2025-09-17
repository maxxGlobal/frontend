// src/components/sidebar/Sidebar.tsx
import { NavLink } from "react-router-dom";
import logo from "../../assets/img/medintera-logo.png";
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
      <div className="logo sherah-sidebar-padding ps-0">
        <NavLink to="/dashboard">
          <img className="sherah-logo__main" src={logo} alt="#" />
        </NavLink>
        <div className="sherah__sicon close-icon d-xl-none">
          <svg
            enableBackground="new 0 0 32 32"
            height="30px"
            version="1.1"
            viewBox="0 0 32 30"
            width="30px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.459,16.014l8.239-8.194c0.395-0.391,0.395-1.024,0-1.414c-0.394-0.391-1.034-0.391-1.428,0  l-8.232,8.187L7.73,6.284c-0.394-0.395-1.034-0.395-1.428,0c-0.394,0.396-0.394,1.037,0,1.432l8.302,8.303l-8.332,8.286  c-0.394,0.391-0.394,1.024,0,1.414c0.394,0.391,1.034,0.391,1.428,0l8.325-8.279l8.275,8.276c0.394,0.395,1.034,0.395,1.428,0  c0.394-0.396,0.394-1.037,0-1.432L17.459,16.014z"
              fill="#fff"
              id="Close"
            />
            <g />
            <g />
            <g />
            <g />
            <g />
            <g />
          </svg>
        </div>
      </div>

      <div className="admin-menu__one sherah-sidebar-padding">
        <div className="menu-bar">
          <ul className="menu-bar__one sherah-dashboard-menu" id="sherahMenu">
            {menuItems.map((item) => {
              if (!shouldShowMenuItem(item)) {
                return null;
              }
              const isDropdown = !!item.children?.length;
              if (!isDropdown) {
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
              const visibleChildren = (item.children ?? []).filter((child) =>
                canShow(child)
              );

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
