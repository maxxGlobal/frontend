// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired, performLogout } from '../lib/api';
import { getCurrentUser } from '../services/auth/authService';
import type { User } from '../types/auth';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  checkTokenValidity: () => boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkTokenValidity = (): boolean => {
    const token = localStorage.getItem("token");
    
    if (!token || isTokenExpired(token)) {
      return false;
    }
    
    return true;
  };

  const logout = () => {
    performLogout(false); // logout fonksiyonunu çağır ama redirect'i kendimiz yapalım
    setUser(null);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        console.warn("Token expired on initialization");
        logout();
        return;
      }

      // Token geçerliyse kullanıcı bilgilerini al
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    initializeAuth();

    // Storage event listener - farklı tab'larda logout durumunu yakala
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        // Token silinmişse kullanıcıyı güncelle
        setUser(null);
        navigate("/login", { replace: true });
      }
    };

    // Logout event listener
    const handleLogout = () => {
      setUser(null);
      navigate("/login", { replace: true });
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedOut", handleLogout);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedOut", handleLogout);
    };
  }, [navigate]);

  // Periyodik token kontrolü (isteğe bağlı)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (!checkTokenValidity()) {
        console.warn("Token expired during periodic check");
        logout();
      }
    }, 60000); // Her dakika kontrol et

    return () => clearInterval(interval);
  }, [user]);

  return {
    user,
    isAuthenticated: !!user && checkTokenValidity(),
    isLoading,
    logout,
    checkTokenValidity,
  };
}