// src/components/layout/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import { AutoNotificationProvider } from "../../hooks/AutoNotificationProvider"

export default function DashboardLayout() {
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