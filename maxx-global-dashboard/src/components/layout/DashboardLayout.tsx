// src/components/layout/DashboardLayout.tsx - Enhanced with useAuth
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import { AutoNotificationProvider } from "../../hooks/AutoNotificationProvider";
import { useAuth } from "../../hooks/useAuth"; // ✅ Hook'u import edin

// Basit yardımcı: verilen CSS dosyasını head'e ekler, unmount'ta kaldırır
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
  // ✅ useAuth hook'unu kullanın
  const { user, isAuthenticated, isLoading, checkTokenValidity } = useAuth();

  // Vite/ESM'de asset yolu:
  const indexCss = new URL("../../assets/css/index.css", import.meta.url).href;
  const fontsCss = new URL("../../assets/css/fonts.css", import.meta.url).href;
  const styleCss = new URL("../../assets/style.css", import.meta.url).href;

  // Sadece dashboard açıkken yükle:
  useScopedCss(indexCss);
  useScopedCss(fontsCss);
  useScopedCss(styleCss);

  // Body'ye scope class'ı ekle/çıkar
  useEffect(() => {
    document.body.classList.add("app-scope");
    return () => document.body.classList.remove("app-scope");
  }, []);

  // ✅ Periyodik token kontrolü (isteğe bağlı)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (!checkTokenValidity()) {
        console.warn("Token geçerliliği kaybedildi");
        // useAuth hook'u zaten logout yapacak
      }
    }, 5 * 60 * 1000); // 5 dakikada bir kontrol

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenValidity]);

  // ✅ Loading durumunda spinner göster
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

  // ✅ Kimlik doğrulama başarısızsa boş döndür (ProtectedRoute zaten login'e yönlendirecek)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div id="sherah-dark-light" className="sherah-body-area">
      {/* Sidebar */}
      <div className="sherah-smenu">
        <Sidebar />
      </div>

      {/* Header */}
      <Header />

      {/* Sayfa içeriği */}
      <section className="sherah-adashboard sherah-show">
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
