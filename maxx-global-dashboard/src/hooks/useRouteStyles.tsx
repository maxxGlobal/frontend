import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_HREF = new URL("../assets/style.css", import.meta.url).toString();

export function useRouteStyles() {
  const { pathname } = useLocation();

  useEffect(() => {
    // /homepage VE TÜM ALT YOLLAR
    const isHomepage = /^\/homepage(?:\/|$)/.test(pathname);

    const selector = 'link[data-route-style="legacy-style"]';
    const existing = document.head.querySelector<HTMLLinkElement>(selector);

    if (isHomepage) {
      // homepage tarafında legacy style YOK
      if (existing) {
        existing.remove();
        console.log("[style.css] removed for", pathname);
      }
      return;
    }

    // homepage DIŞINDA legacy style EKLE
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = STYLE_HREF;
      link.dataset.routeStyle = "legacy-style";
      document.head.appendChild(link);
      console.log("[style.css] added for", pathname);
    }
  }, [pathname]);
}
