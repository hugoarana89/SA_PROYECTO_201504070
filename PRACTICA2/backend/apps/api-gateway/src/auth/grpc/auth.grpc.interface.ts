export interface AuthGrpcService {
  Login(data: { email: string; password: string }): Promise<{ accessToken: string }>;
  Register(data: { email: string; password: string; role: string }): Promise<any>;
  ValidateToken(data: { token: string }): Promise<{
    userId: string;
    email: string;
    role: string;
    valid: boolean;
  }>;
}