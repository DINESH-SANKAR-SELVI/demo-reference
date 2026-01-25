import apiClient from './apiClient';
import { storageService } from './storageService';

// TypeScript interface (commented out)
// export interface LoginCredentials {
//   username: string
//   password: string
// }

// TypeScript interface (commented out)
// export interface AuthResponse {
//   id: string,
//   username: string,
//   email: string,
//   roles: Array<string>,
//   accessToken: string
// }

class AuthService {
  constructor() {
    // private tokenKey = 'auth_token'
    // private userKey = 'user_data'
    this.tokenKey = 'auth_token';
    this.userKey = 'user_data';
  }

  // async login(credentials: LoginCredentials): Promise<AuthResponse>
  async login(credentials) {
    try {
      // <AuthResponse> generic removed
      const response = await apiClient.post('/auth/signin', credentials, {
        withToken: false
      });
      this.setAuthData(response);
      return response;
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  // async refreshToken(): Promise<string | null>
  async refreshToken() {
    try {
      // <{ token: string }> generic removed
      const response = await apiClient.post(
        '/auth/refresh',
        {},
        {
          withToken: false
        }
      );
      this.setToken(response.token);
      return response.token;
    } catch (error) {
      console.log(error);
      this.clearAuthData();
      return null;
    }
  }

  // logout(): void
  logout() {
    // this.clearAuthData()
  }

  getCurrentUser() {
    return storageService.get(this.userKey);
  }

  // getToken(): string | null
  getToken() {
    return storageService.get(this.tokenKey);
  }

  // isAuthenticated(): boolean
  isAuthenticated() {
    return !!this.getToken();
  }

  // private setAuthData(data: AuthResponse): void
  setAuthData(data) {
    // storageService.set(this.tokenKey, data.accessToken)
    // storageService.set(this.userKey, data)
    // apiClient.setAuthToken(data.accessToken)
    console.log(data);
  }

  // private setToken(token: string): void
  setToken(token) {
    // storageService.set(this.tokenKey, token)
    // apiClient.setAuthToken(token)
    console.log(token);
  }

  // private clearAuthData(): void
  clearAuthData() {
    // storageService.remove(this.tokenKey)
    // storageService.remove(this.userKey)
    // apiClient.setAuthToken(null)
  }
}

const authService = new AuthService();

// Initialize axios with token if exists
const token = authService.getToken();
if (token) {
  // apiClient.setAuthToken(token)
  console.log(token);
}

export default authService;
