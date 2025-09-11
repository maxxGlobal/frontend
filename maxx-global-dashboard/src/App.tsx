import "./i18n";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { initMain } from "./assets/js/main";
import AOS from "aos";
import "aos/dist/aos.css";
export default function App() {
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
      easing: "ease-out",
      offset: 80,
    });
    initMain();
  }, []);
  return <AppRoutes />;
}
