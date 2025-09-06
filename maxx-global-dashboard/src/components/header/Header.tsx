// src/components/header/Header.tsx
import { useState } from "react";
import profilePic from "../../assets/img/profile-pic.png";
import { useNavigate } from "react-router-dom";
import HeaderBell from "../../pages/notifications/HeaderBell";

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
                  <HeaderBell />

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
                          Profilim
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
                                  Profilim
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
                                <a
                                  onClick={logout}
                                  className="underline fw-normal border-0 bg-transparent"
                                >
                                  Çıkış Yap
                                </a>
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
