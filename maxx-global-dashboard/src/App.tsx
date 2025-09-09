import AppRoutes from "./routes/AppRoutes";

import { useEffect } from "react";
import { initMain } from "./assets/js/main";
export default function App() {
  useEffect(() => {
    initMain();
  }, []);
  return <AppRoutes />;
}
