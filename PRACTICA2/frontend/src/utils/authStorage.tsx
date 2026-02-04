import { CONFIG } from '../config/config';

const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";
const USER_INFO = "user";

export const setSession = ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) => {
  localStorage.setItem(ACCESS_TOKEN, accessToken);
  localStorage.setItem(REFRESH_TOKEN, refreshToken);

  const payload = JSON.parse(atob(accessToken.split(".")[1]));
  localStorage.setItem(USER_INFO, JSON.stringify(payload));
};

export const getAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN);

export const getRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN);

export const getUser = () => {
  const user = localStorage.getItem(USER_INFO);
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return Date.now() / 1000 < exp;
  } catch {
    return false;
  }
};

// Función de logout actualizada para llamar al backend
export const logout = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  
  try {
    if (refreshToken) {
      // Hacer la petición de logout al backend
      const response = await fetch(`${CONFIG.API_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        }),
      });

      // No importa si la respuesta falla, igual se limpia el frontend
      console.log('Logout API response:', response.status);
    }
  } catch (error) {
    console.error('Error calling logout API:', error);
    // Se continua aunque falle la API
  } finally {
    // se limpia el localStorage
    localStorage.clear();
  }
  
  return true;
};

// Función auxiliar para logout sin navegación (para usar en componentes)
export const logoutAndNavigate = async (navigate: Function) => {
  await logout();
  navigate('/login');
};