// src/components/layout/PublicHomeLayout.tsx
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

function useScopedAsset(href: string) {
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

function useScopedScript(src: string) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [src]);
}

export default function PublicHomeLayout() {
  // Vite/webpack için asset yolu:
  const homeCss = "/assets/homepage.css";
  const mainJs = "/assets/js/main.js";

  useScopedAsset(homeCss);
  useScopedScript(mainJs);

  // İstersen body’e class ekleyip çıkar:
  useEffect(() => {
    document.body.classList.add("home-scope");
    return () => document.body.classList.remove("home-scope");
  }, []);

  return (
    // Home CSS'lerini sadece bu kapsayıcı altında hedeflemek için .hp sınıfı
    <div className="hp">
      <Outlet />
    </div>
  );
}
