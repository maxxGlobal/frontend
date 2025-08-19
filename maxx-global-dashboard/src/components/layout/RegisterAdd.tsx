// src/layouts/DashboardLayout.tsx
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import RegisterUser from "../../pages/users/RegisterUser";

export default function RegisterAdd() {
  return (
    <div id="sherah-dark-light" className="sherah-body-area">
      {/* Sidebar */}
      <div className="sherah-smenu">
        <Sidebar />
      </div>

      {/* Header */}
      <Header />

      {/* Sayfa içeriği */}
      <section className="sherah-adashboard sherah-show register-add-form">
        <div className="container">
          <div className="row">
            <div className="col-12 sherah-main__column">
              <div className="sherah-body">
                <div className="sherah-dsinner">
                  <RegisterUser />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
