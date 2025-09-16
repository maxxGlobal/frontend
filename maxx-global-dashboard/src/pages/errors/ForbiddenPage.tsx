// src/pages/errors/ForbiddenPage.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1); // Önceki sayfaya dön
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4">
          <div className="text-center">
            <div className="mb-4">
              <i className="fas fa-ban text-warning" style={{ fontSize: "5rem" }}></i>
            </div>
            
            <h1 className="display-4 fw-bold text-danger">403</h1>
            <h2 className="mb-3">Erişim Engellendi</h2>
            
            <p className="text-muted mb-4">
              Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.
              {user && (
                <><br />Mevcut kullanıcı: <strong>{user.firstName} {user.lastName}</strong></>
              )}
            </p>

            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button 
                onClick={handleGoBack}
                className="btn btn-outline-secondary"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Geri Dön
              </button>
              
              <button 
                onClick={handleGoHome}
                className="btn btn-primary"
              >
                <i className="fas fa-home me-2"></i>
                Ana Sayfa
              </button>
              
              <button 
                onClick={logout}
                className="btn btn-outline-danger"
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                Farklı Kullanıcı
              </button>
            </div>

            <div className="mt-4 text-muted small">
              <p>
                Eğer bu sayfaya erişmeniz gerektiğini düşünüyorsanız, 
                lütfen sistem yöneticinizle iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}