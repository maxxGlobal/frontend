/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { login, persistAuth } from "../../services/auth/authService";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Login'den önce hangi sayfadan geldiğini kontrol et
  const from = (location.state as any)?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      persistAuth(res);
      
      // ✅ Önce from kontrolü yap - varsa oraya git
      if (from && from !== '/login') {
        console.log("Redirecting to original page:", from);
        navigate(from, { replace: true });
        return;
      }
      
      // ✅ from yoksa default sayfaya git
      if (res.isDealer === true) {
        navigate("/homepage");
      } else {
        navigate("/dashboard");
      }
     } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
      console.error("LOGIN ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="sherah-wc sherah-wc__full sherah-bg-cover"
      style={{ backgroundImage: "url('../src/assets/img/credential-bg.svg')" }}
    >
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-lg-6 col-md-6 col-12 sherah-wc-col-one">
            <div
              className="sherah-wc__inner"
              style={{
                backgroundImage: "url('../src/assets/img/welcome-bg.png')",
              }}
            >
              <div className="sherah-wc__logo">
                <a href="/">
                  <img src="../src/assets/img/medintera-logo.png" alt="logo" />
                </a>
              </div>
              <div className="sherah-wc__middle">
                <a href="/">
                  <img
                    src="../src/assets/img/welcome-vector.png"
                    alt="welcome"
                  />
                </a>
              </div>
              <h2 className="sherah-wc__title">
                Medintera <br /> Admin Panel'e Hoşgeldiniz
              </h2>
            </div>
          </div>

          <div className="col-lg-6 col-md-6 col-12 sherah-wc-col-two">
            <div className="sherah-wc__form">
              <div className="sherah-wc__form-inner">
                <h3 className="sherah-wc__form-title sherah-wc__form-title__one">
                  Hesabınıza Giriş Yapın{" "}
                  <span>Lütfen e-postanızı ve şifrenizi girin</span>
                </h3>

                {/* ✅ Yönlendirme mesajı göster */}
                {from && (
                  <div className="alert alert-info mb-3">
                    <small>
                      <i className="fas fa-info-circle me-2"></i>
                      {(location.state as any)?.message || 
                       "İstediğiniz sayfaya erişim için giriş yapmanız gerekiyor."}
                    </small>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="sherah-wc__form-main p-0"
                >
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <p className="text-alert">{error}</p>
                    </div>
                  )}

                  {/* Email */}
                  <div className="form-group">
                    <label className="sherah-wc__form-label">E-posta</label>
                    <div className="form-group__input">
                      <input
                        className="sherah-wc__form-input"
                        type="email"
                        placeholder="demo3243@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password + göz ikonu */}
                  <div className="form-group">
                    <label className="sherah-wc__form-label">Şifre</label>
                    <div className="form-group__input position-relative">
                      <input
                        className="sherah-wc__form-input pw-pad"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />

                      {/* Toggle button */}
                      <button
                        type="button"
                        className="pw-toggle-btn"
                        aria-label={
                          showPassword ? "Şifreyi gizle" : "Şifreyi göster"
                        }
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? (
                          /* eye-slash */
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="eye-icon"
                          >
                            <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                            <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                            <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
                          </svg>
                        ) : (
                          /* eye */
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="eye-icon"
                          >
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path
                              fillRule="evenodd"
                              d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="form-group">
                    <div className="sherah-wc__check-inline">
                      <div className="sherah-wc__checkbox">
                        <input
                          className="sherah-wc__form-check"
                          id="checkbox"
                          type="checkbox"
                        />
                        <label htmlFor="checkbox">Beni Hatırla</label>
                      </div>
                      <div className="sherah-wc__forgot">
                        <a href="/forgot-password" className="forgot-pass">
                          Şifremi Unuttum
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Login Button */}
                  <div className="form-group form-mg-top25">
                    <div className="sherah-wc__button sherah-wc__button--bottom">
                      <button
                        type="submit"
                        className="ntfmax-wc__btn"
                        disabled={loading}
                      >
                        {loading ? "Bekleniyor..." : "Giriş Yap"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}