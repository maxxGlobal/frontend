// src/components/header/Header.tsx
import { useState } from "react";
import profilePic from "../../assets/img/profile-pic.png";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openMsg, setOpenMsg] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sherah-header">
      <div className="container g-0">
        <div className="row g-0">
          <div className="col-12">
            <div className="sherah-header__inner">
              <div className="sherah-header__middle">
                <div className="sherah-header__left">
                  {/* Search */}
                  <div className="sherah-header__form">
                    <form
                      className="sherah-header__form-inner"
                      onSubmit={(e) => {
                        e.preventDefault();
                        // arama aksiyonu
                      }}
                    >
                      <button className="search-btn" type="submit">
                        {/* search svg */}
                      </button>
                      <input
                        name="s"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        type="text"
                        placeholder="Search"
                      />
                    </form>
                  </div>
                </div>

                <div className="sherah-header__right">
                  {/* Mesajlar */}
                  <div
                    className="sherah-header__dropmenu sherah-header__dropmenu--messages"
                    onClick={() => setOpenMsg((v) => !v)}
                  >
                    {/* mesaj ikonu */}
                    {openMsg && (
                      <div className="sherah-dropdown-card sherah-dropdown-card__alarm sherah-border">
                        <h3 className="sherah-dropdown-card__title sherah-border-btm">
                          Recent Message
                        </h3>
                        <ul className="sherah-dropdown-card_list sherah-chatbox__list sherah-chatbox__list__header">
                          {/* ... örnek itemler */}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Bildirimler */}
                  <div
                    className="sherah-header__dropmenu"
                    onClick={() => setOpenNoti((v) => !v)}
                  >
                    {/* zil ikonu */}
                    <span className="sherah-header__count sherah-color1__bg">
                      4
                    </span>
                    {openNoti && (
                      <div className="sherah-dropdown-card sherah-dropdown-card__alarm sherah-border">
                        <h3 className="sherah-dropdown-card__title sherah-border-btm">
                          Recent Notification
                        </h3>
                        <ul className="sherah-dropdown-card_list">
                          {/* ... */}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Profil */}
                  <div
                    className="sherah-header__author sherah-flex__center--top"
                    onClick={() => setOpenProfile((v) => !v)}
                  >
                    <div className="sherah-header__author-img">
                      <img src={profilePic} alt="profile" />
                    </div>
                    <div className="sherah-header__author--info sherah-dflex sherah-dflex__base">
                      <h4 className="sherah-header__author--title sherah-dflex sherah-dflex__column">
                        {user?.firstName ?? "User"}{" "}
                        <span className="sherah-header__author--text">
                          {user?.country ?? ""}
                        </span>
                      </h4>
                      {/* ok svg */}
                    </div>

                    {openProfile && (
                      <div className="sherah-dropdown-card sherah-dropdown-card__profile sherah-border">
                        <h3 className="sherah-dropdown-card__title sherah-border-btm">
                          My Profile
                        </h3>
                        <ul className="sherah-dropdown-card_list">
                          <li>
                            <div className="sherah-dropdown-card-info">
                              <h4 className="sherah-dropdown-card-name">
                                <a href="/profile">My Profile</a>
                              </h4>
                            </div>
                          </li>
                          <li>
                            <div className="sherah-dropdown-card-info">
                              <h4 className="sherah-dropdown-card-name">
                                <button onClick={logout} className="underline">
                                  Logout
                                </button>
                              </h4>
                            </div>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  {/* /Profil */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
