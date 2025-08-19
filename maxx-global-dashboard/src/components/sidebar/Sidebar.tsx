// src/components/sidebar/Sidebar.tsx
import { NavLink } from "react-router-dom";
import logo from "../../assets/img/logo-max.png";
import { menuItems } from "../config/menuConfig";

export default function Sidebar() {
  return (
    <div className="sherah-smenu">
      <div className="admin-menu">
        <div className="logo sherah-sidebar-padding">
          <NavLink to="/dashboard">
            <img className="sherah-logo__main" src={logo} alt="#" />
          </NavLink>
          <div className="sherah__sicon close-icon d-xl-none"></div>
        </div>

        <div className="admin-menu__one sherah-sidebar-padding">
          <div className="menu-bar">
            <ul className="menu-bar__one sherah-dashboard-menu" id="sherahMenu">
              {menuItems.map((item) => {
                const isDropdown = !!item.children?.length;

                if (isDropdown) {
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
                          {item.children!.map((child) => (
                            <li key={child.id}>
                              {child.to ? (
                                <NavLink
                                  to={child.to}
                                  className="dropdown-menu"
                                >
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
                }

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
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
