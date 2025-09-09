import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_HREF = new URL("../assets/style.css", import.meta.url).toString();

export function useRouteStyles() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isHomepage =
      pathname === "/homepage" || pathname.startsWith("/homepage/");
    const tag = 'link[data-route-style="legacy-style"]';
    const existing = document.head.querySelector<HTMLLinkElement>(tag);

    if (isHomepage) {
      // homepage'te style.css YOK
      if (existing) {
        existing.remove();
        // Debug
        console.log("[style.css] removed for", pathname);
      }
      return;
    }

    // homepage DIŞINDA style.css EKLE
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = STYLE_HREF;
      link.dataset.routeStyle = "legacy-style";
      document.head.appendChild(link);
      // Debug
      console.log("[style.css] added for", pathname);
    }
  }, [pathname]);
}
