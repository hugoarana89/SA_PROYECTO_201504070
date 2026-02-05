export interface AuthGrpcService {
  Login(data: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  Register(data: { email: string; password: string; role: string }): Promise<{
    id: string;
    email: string;
    role: string;
  }>;

  RefreshToken(data: { refreshToken: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  ValidateToken(data: { token: string }): Promise<{
    userId: string;
    email: string;
    role: string;
    valid: boolean;
  }>;

  Logout(data: { refreshToken: string }): Promise<{ success: boolean }>;
}
