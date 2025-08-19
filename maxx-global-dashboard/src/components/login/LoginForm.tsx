import { useState } from "react";
import { login, persistAuth } from "../../services/authService";
import { useNavigate } from "react-router-dom";
export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      persistAuth(res);
      navigate("/dashboard");
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
                  <img src="../src/assets/img/logo-max.svg" alt="logo" />
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
                Maxx Global Medikal <br /> Admin Panel'e Hoşgeldiniz
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

                  {/* Password */}
                  <div className="form-group">
                    <label className="sherah-wc__form-label">Şifre</label>
                    <div className="form-group__input">
                      <input
                        className="sherah-wc__form-input"
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
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

                  {/* Signup
                  <div className="form-group mg-top-20">
                    <div className="sherah-wc__bottom">
                      <p className="sherah-wc__text">
                        Don’t have an account ?{" "}
                        <a href="/register">Sign up free</a>
                      </p>
                    </div>
                  </div> */}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
