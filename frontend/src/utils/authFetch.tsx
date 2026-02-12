import { getAccessToken } from "./authStorage";
import { refreshAccessToken } from "./authRefresh";

export const authFetch = async (
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> => {
  let token = getAccessToken() || undefined;

  const doFetch = async (token?: string) => {
    return fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
  };

  let response = await doFetch(token);

  // Si el token expiró
  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      throw new Error("Sesión expirada");
    }

    // Reintenta la request original
    response = await doFetch(newToken);
  }

  return response;
};
