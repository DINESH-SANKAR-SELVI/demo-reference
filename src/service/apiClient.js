import axios from 'axios';
// import CryptoGraphicService from './CryptoGraphicService';

// TypeScript-only imports (commented out)
// import type {
//   AxiosInstance,
//   AxiosRequestConfig,
//   AxiosResponse,
//   AxiosError,
//   InternalAxiosRequestConfig,
// } from 'axios'

// TypeScript interface (commented out)
// interface ApiClientConfig extends AxiosRequestConfig {
//   withToken?: boolean;
// }

class ApiClient {
  constructor(baseURL) {
    // private instance: AxiosInstance
    // private onUnauthorized?: () => void
    // private refreshingPromise: Promise<void> | null = null
    // private cryptoGraphicService: CryptoGraphicService

    this.onUnauthorized = undefined;
    this.refreshingPromise = null;
    // this.cryptoGraphicService = new CryptoGraphicService();

    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true, // ✅ include cookies in requests
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  // setUnauthorizedHandler(handler: () => void)
  setUnauthorizedHandler(handler) {
    this.onUnauthorized = handler;
  }

  // private setupInterceptors()
  setupInterceptors() {
    this.instance.interceptors.request.use(
      async config => {
        // config.headers['Publickey'] = await this.cryptoGraphicService.getPublicKey();

        // import.meta.env.DEV is still valid in Vite
        // if (process.env.NODE_ENV === 'development') {
        //   console.log(`[${config.method?.toUpperCase()}] ${config.url}`, config);
        // }

        // if (config.data) {
        //   config.data = await this.cryptoGraphicService.encryptAndSend(config.data);
        // }

        // Auto-adjust for FormData
        // if (config.data instanceof FormData) {
        //   delete config.headers['Content-Type'];
        // }

        return config;
      },
      error => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      async response => {
        try {
          // Decrypt response
          // if (response.data) {
          //   response.data = await this.cryptoGraphicService.receiveEncryptedPayload(response.data);
          // }
          return response;
        } catch (decryptionError) {
          console.error('Failed to decrypt response:', decryptionError);
          return Promise.reject(decryptionError);
        }
      },
      async error => {
        const originalRequest = error.config;
        // as ApiClientConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await this.handleTokenRefresh();
            return this.instance(originalRequest);
          } catch (refreshError) {
            if (this.onUnauthorized) this.onUnauthorized();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // private async handleTokenRefresh(): Promise<void>
  async handleTokenRefresh() {
    if (this.refreshingPromise) return this.refreshingPromise;

    this.refreshingPromise = this.instance
      .post('/auth/refresh')
      .then(() => {
        // Cookie is assumed to be set by backend
      })
      .finally(() => {
        this.refreshingPromise = null;
      });

    return this.refreshingPromise;
  }

  // API methods
  // async get<T = unknown>(url: string, config?: ApiClientConfig): Promise<T>
  async get(url, config) {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  // async post<T = unknown>(url: string, data?: object, config?: ApiClientConfig): Promise<T>
  async post(url, data, config) {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  // async put<T = unknown>(url: string, data?: object, config?: ApiClientConfig): Promise<T>
  async put(url, data, config) {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  // async delete<T = unknown>(url: string, config?: ApiClientConfig): Promise<T>
  async delete(url, config) {
    const response = await this.instance.delete(url, config);
    return response.data;
  }

  // async patch<T = unknown>(url: string, data?: object, config?: ApiClientConfig): Promise<T>
  async patch(url, data, config) {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }

  // getInstance(): AxiosInstance
  getInstance() {
    return this.instance;
  }
}

// `as string` removed (TypeScript-only)
// const apiClient = new ApiClient(process.env.CLIENT_API_BASE_URL || 'http://localhost:8085/api');
const apiClient = new ApiClient('http://localhost:8085');

export default apiClient;
