// src/components/header/Header.tsx
import { useEffect, useRef, useState } from "react";
import profilePic from "../../assets/img/users-profile.svg";
import { useNavigate } from "react-router-dom";
import HeaderBell from "../../pages/notifications/HeaderBell";

export default function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openMsg, setOpenMsg] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const msgRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (msgRef.current && !msgRef.current.contains(t)) setOpenMsg(false);
      if (profileRef.current && !profileRef.current.contains(t))
        setOpenProfile(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

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
                    fill="#fff"
                    color="#fff"
                    height="28"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 5H21"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M3 12H21"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M3 19H21"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <div className="sherah-header__left">
                  <div className="sherah-header__form"></div>
                </div>
                <div className="sherah-header__right gap-4">
                  <div
                    ref={msgRef}
                    role="button"
                    tabIndex={0}
                    className={`sherah-header__dropmenu sherah-header__dropmenu--messages ${
                      openMsg ? "is-open" : ""
                    }`}
                    onClick={() => setOpenMsg((v) => !v)}
                  >
                    {/* mesaj ikonu */}
                    <div className="sherah-dropdown-card sherah-dropdown-card__alarm sherah-border">
                      <h3 className="sherah-dropdown-card__title sherah-border-btm">
                        Recent Message
                      </h3>
                      <ul className="sherah-dropdown-card_list sherah-chatbox__list sherah-chatbox__list__header">
                        {/* ... */}
                      </ul>
                    </div>
                  </div>
                  <HeaderBell />
                  <div
                    ref={profileRef}
                    role="button"
                    tabIndex={0}
                    className={`sherah-header__author p-1 border-primary border-2 rounded-2 sherah-flex__center--top ${
                      openProfile ? "is-open" : ""
                    }`}
                    onClick={() => setOpenProfile((v) => !v)}
                  >
                    <div className="sherah-header__author-img">
                      <div className="sherah-dropdown-card__img sherah-color1__bg bg-secondary">
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
                    </div>
                    <div className="sherah-header__author--info sherah-dflex sherah-dflex__base">
                      <h4 className="sherah-header__author--title sherah-dflex sherah-dflex__column">
                        {user?.firstName ?? "User"}{" "}
                        <span className="sherah-header__author--text">
                          {user?.country ?? ""}
                        </span>
                      </h4>
                    </div>

                    <div className="sherah-dropdown-card sherah-dropdown-card__profile sherah-border">
                      <svg
                        className="sherah-dropdown-arrow"
                        xmlns="http://www.w3.org/2000/svg"
                        width="43.488"
                        height="22.207"
                        viewBox="0 0 43.488 22.207"
                      >
                        <path
                          id="Path_1271"
                          data-name="Path 1271"
                          d="M-15383,7197.438l20.555-20.992,20.555,20.992Z"
                          transform="translate(15384.189 -7175.73)"
                          stroke-width="1"
                        ></path>
                      </svg>
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
                              <button
                                style={{ fontSize: 18 }}
                                onClick={logout}
                                className="underline fw-normal border-0 bg-transparent p-0"
                              >
                                Çıkış Yap
                              </button>
                            </h4>
                          </div>
                        </li>
                      </ul>
                    </div>
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
