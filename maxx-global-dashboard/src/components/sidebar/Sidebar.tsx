// src/components/sidebar/Sidebar.tsx
import { NavLink } from "react-router-dom";
import logo from "../../assets/img/medintera-logo.png";
import { menuItems, type MenuItem } from "../config/menuConfig";
import { hasPermission, type PermissionFlags } from "../../utils/permissions";

const canShow = (node: PermissionFlags): boolean =>
  !node.required && !node.anyOf?.length && !node.allOf?.length
    ? true
    : hasPermission(node);

const shouldShowMenuItem = (item: MenuItem): boolean =>
  item.children?.length ? item.children.some(canShow) : canShow(item);

export default function Sidebar() {
  const closeSidebar = () => {
    const el = document.querySelector(".admin-menu.sherah-smenu");
    el?.classList.remove("open");
  };
  return (
    <div className="admin-menu sherah-smenu">
      <div className="logo sherah-sidebar-padding ps-0">
        <NavLink to="/dashboard">
          <img className="sherah-logo__main" src={logo} alt="#" />
        </NavLink>
        <div
          className="sherah__sicon close-icon d-lg-none"
          role="button"
          onClick={closeSidebar}
        >
          <svg
            height="30"
            viewBox="0 0 32 30"
            width="30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.459,16.014l8.239-8.194c.395-.391.395-1.024,0-1.414-.394-.391-1.034-.391-1.428,0l-8.232,8.187L7.73,6.284c-.394-.395-1.034-.395-1.428,0-.394.396-.394,1.037,0,1.432l8.302,8.303-8.332,8.286c-.394.391-.394,1.024,0,1.414.394.391,1.034.391,1.428,0l8.325-8.279 8.275,8.276c.394.395 1.034.395 1.428,0 .394-.396.394-1.037 0-1.432L17.459,16.014z"
              fill="#fff"
            />
          </svg>
        </div>
      </div>

      <div className="admin-menu__one sherah-sidebar-padding">
        <div className="menu-bar">
          <ul className="menu-bar__one sherah-dashboard-menu" id="sherahMenu">
            {menuItems.map((item) => {
              if (!shouldShowMenuItem(item)) return null;
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

              const visibleChildren = (item.children ?? []).filter(canShow);
              if (!visibleChildren.length) return null;

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
