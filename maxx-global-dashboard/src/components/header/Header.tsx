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
                              <div className="sherah-dropdown-card__img sherah-color1__bg">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18.192"
                                  height="21.5"
                                  viewBox="0 0 18.192 21.5"
                                >
                                  <g
                                    id="user_account_people_man"
                                    data-name="user, account, people, man"
                                    transform="translate(-5 -3)"
                                  >
                                    <path
                                      id="Path_1272"
                                      data-name="Path 1272"
                                      d="M20.494,16.131a.827.827,0,1,0-1.163,1.176,7.391,7.391,0,0,1,2.207,5.29c0,1.011-2.9,2.481-7.442,2.481S6.654,23.607,6.654,22.6a7.391,7.391,0,0,1,2.179-5.261.827.827,0,1,0-1.169-1.169A9.036,9.036,0,0,0,5,22.6c0,2.686,4.686,4.135,9.1,4.135s9.1-1.449,9.1-4.135a9.03,9.03,0,0,0-2.7-6.466Z"
                                      transform="translate(0 -2.231)"
                                      fill="#fff"
                                    ></path>
                                    <path
                                      id="Path_1273"
                                      data-name="Path 1273"
                                      d="M14.788,14.577A5.788,5.788,0,1,0,9,8.788,5.788,5.788,0,0,0,14.788,14.577Zm0-9.923a4.135,4.135,0,1,1-4.135,4.135,4.135,4.135,0,0,1,4.135-4.135Z"
                                      transform="translate(-0.692)"
                                      fill="#fff"
                                    ></path>
                                  </g>
                                </svg>
                              </div>
                              <h4 className="sherah-dropdown-card-name">
                                <a href="/profile" className="fw-normal">
                                  My Profile
                                </a>
                              </h4>
                            </div>
                          </li>
                          <li>
                            <div className="sherah-dropdown-card-info">
                              <div className="sherah-dropdown-card__img sherah-color1__bg">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="17.5"
                                  height="17.5"
                                  viewBox="0 0 17.5 17.5"
                                >
                                  <path
                                    id="path52"
                                    d="M9.27,291.179a.877.877,0,0,0-.867.889V299.1a.876.876,0,1,0,1.752,0v-7.033a.877.877,0,0,0-.885-.889Zm5.105,1.763c-.028,0-.057,0-.085,0A.88.88,0,0,0,13.8,294.5a7,7,0,1,1-9.076.026.882.882,0,0,0,.1-1.239.873.873,0,0,0-1.234-.1,8.815,8.815,0,0,0,5.691,15.495,8.815,8.815,0,0,0,5.652-15.521.873.873,0,0,0-.561-.216Z"
                                    transform="translate(-0.529 -291.179)"
                                    fill="#fff"
                                  ></path>
                                </svg>
                              </div>
                              <h4 className="sherah-dropdown-card-name">
                                <button
                                  onClick={logout}
                                  className="underline fw-normal border-0 bg-transparent"
                                >
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
