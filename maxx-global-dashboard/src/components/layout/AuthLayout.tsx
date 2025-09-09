// src/components/layout/AuthLayout.tsx
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

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

export default function AuthLayout() {
  const indexCss = new URL("../../assets/css/index.css", import.meta.url).href;

  useScopedCss(indexCss);

  return (
    <div className="auth-wrapper">
      <Outlet />
    </div>
  );
}
