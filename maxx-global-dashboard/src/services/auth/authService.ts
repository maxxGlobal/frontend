// src/services/auth/authService.ts - Complete fixed version
import api from "../../lib/api";
import type { LoginResponse, User } from "../../types";

// Cookie utilities
function setSecureCookie(name: string, value: string, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  
  // Development'ta Secure flag'i kaldır
  const isProduction = window.location.protocol === 'https:';
  const secureFlag = isProduction ? '; Secure' : '';
  
  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; Path=/; SameSite=Strict${secureFlag}`;
   
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=strict`;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> { 
  
  try {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    
   
    
    return data;
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
}

export function persistAuth(data: LoginResponse): void { 
  
  const { token, user, isDealer } = data;
  
  // 1. Token'ı cookie'ye kaydet
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  setSecureCookie('token', cleanToken, 7);
  
  // 2. ✅ User bilgisini localStorage'a kaydet (HomePage için kritik!)
  if (user) {
    localStorage.setItem('user', JSON.stringify(user)); 
    
    // Verify save
    const savedUser = localStorage.getItem('user'); 

    if(savedUser){
      savedUser.charAt(1);
    }
    
    // SessionStorage'a da kaydet (opsiyonel)
    sessionStorage.setItem('user', JSON.stringify(user));
  } else {
    console.error('❌ No user data to persist!');
  }
  
  // 3. Token'ı da localStorage'a koy (geriye dönük uyumluluk)
  localStorage.setItem('token', token);
  
  // 4. isDealer flag'ini de sakla
  localStorage.setItem('isDealer', String(isDealer));

  // Storage'daki kullanıcı bilgisi değiştiğinde diğer bileşenleri haberdar et
  window.dispatchEvent(new CustomEvent('userUpdated', { detail: { user, isDealer } }));
   
}

export function logout(): void {
  console.log('🚪 Logging out...');
  
  // Cookie'leri temizle
  deleteCookie('token');
  
  // Storage'ları temizle
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isDealer');
  sessionStorage.removeItem('user');
   
  
  // Event gönder
  window.dispatchEvent(new CustomEvent('userLoggedOut'));
}

export function getCurrentUser(): User | null {
  // Önce localStorage'a bak (HomePage için)
  const localUser = localStorage.getItem('user');
  if (localUser) {
    try {
      const parsed = JSON.parse(localUser) as User; 
      return parsed;
    } catch (error) {
      console.error('❌ Failed to parse user from localStorage:', error);
    }
  }
  
  // Sonra sessionStorage'a bak
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    try {
      const parsed = JSON.parse(sessionUser) as User; 
      return parsed;
    } catch (error) {
      console.error('❌ Failed to parse user from sessionStorage:', error);
    }
  }
  
  console.log('⚠️ No user found in storage');
  return null;
}

export function getToken(): string | null {
  // Önce cookie'ye bak
  const cookieToken = getCookie('token');
  if (cookieToken) {
    const formatted = cookieToken.startsWith('Bearer ') ? cookieToken : `Bearer ${cookieToken}`; 
    return formatted;
  }
  
  // Fallback: localStorage
  const localToken = localStorage.getItem('token');
  if (localToken) {
    const formatted = localToken.startsWith('Bearer ') ? localToken : `Bearer ${localToken}`; 
    return formatted;
  }
  
  console.log('⚠️ No token found');
  return null;
}

// Token geçerlilik kontrolü
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  
  try {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const parts = cleanToken.split('.');
    
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    const valid = payload.exp ? payload.exp > currentTime : true; 
    return valid;
  } catch (error) { 
    return false;
  }
}

export function isAuthenticated(): boolean {
  const tokenValid = isTokenValid();
  const user = getCurrentUser();
  const authenticated = tokenValid && user !== null; 
  return authenticated;
}

// Debug helper
export function debugAuthState(): void { 
}

// Export for debugging in console
if (typeof window !== 'undefined') {
  (window as any).debugAuthState = debugAuthState;
}
