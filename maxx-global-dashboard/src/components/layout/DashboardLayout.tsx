import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import { AutoNotificationProvider } from "../../hooks/AutoNotificationProvider";
import { useAuth } from "../../hooks/useAuth";

function useScopedCss(href: string) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [href]);
}

export default function DashboardLayout() {
  const { isAuthenticated, isLoading, checkTokenValidity } = useAuth();

  const indexCss = "/assets/css/index.css";
  const fontsCss = "/assets/css/fonts.css";
  const styleCss = "/assets/style.css";

  useScopedCss(indexCss);
  useScopedCss(fontsCss);
  useScopedCss(styleCss);

  useEffect(() => {
    document.body.classList.add("app-scope");
    return () => document.body.classList.remove("app-scope");
  }, []);
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (!checkTokenValidity()) {
        console.warn("Token geçerliliği kaybedildi");
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenValidity]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div id="sherah-dark-light" className="sherah-body-area">
      <section className="sherah-adashboard sherah-show">
        <Header />
        <Sidebar />
        <div className="container">
          <div className="row">
            <div className="col-12 sherah-main__column">
              <div className="sherah-body">
                <div className="sherah-dsinner">
                  <AutoNotificationProvider>
                    <Outlet />
                  </AutoNotificationProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
