// src/components/layout/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import { AutoNotificationProvider } from "../../hooks/AutoNotificationProvider";

// Basit yardımcı: verilen CSS dosyasını head'e ekler, unmount'ta kaldırır
function useScopedCss(href: string) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href; // Vite için absolute URL gerekir
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [href]);
}

export default function DashboardLayout() {
  // Vite/ESM'de asset yolu:
  const indexCss = new URL("../../assets/css/index.css", import.meta.url).href;
  const fontsCss = new URL("../../assets/css/fonts.css", import.meta.url).href;
  const styleCss = new URL("../../assets/style.css", import.meta.url).href;

  // Sadece dashboard açıkken yükle:
  useScopedCss(indexCss);
  useScopedCss(fontsCss);
  useScopedCss(styleCss);

  // (İsteğe bağlı) body'ye scope class'ı ekle/çıkar → index.css’i .app-scope ile hedefleyebilirsin.
  useEffect(() => {
    document.body.classList.add("app-scope");
    return () => document.body.classList.remove("app-scope");
  }, []);

  return (
    <div id="sherah-dark-light" className="sherah-body-area">
      <Header />
      {/* Sidebar */}
      <div className="sherah-smenu">
        <Sidebar />
      </div>

      {/* Header */}

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
