import { CONFIG } from "../config/config";
import { getRefreshToken, setSession, logout } from "./authStorage";

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${CONFIG.API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Refresh token inválido");
    }

    const data = await response.json();

    // Guardamos nuevos tokens
    setSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? refreshToken,
    });

    return data.accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    await logout();
    return null;
  }
};
