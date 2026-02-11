import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8787';

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: rawBase,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    this.refreshTokenPromise = (async () => {
      try {
        const response = await axios.post(`${rawBase}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  async register(email: string, password: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async getAccounts() {
    const response = await this.client.get('/accounts');
    return response.data;
  }

  async createAccount(data: { name: string; type: string; currency: string }) {
    const response = await this.client.post('/accounts', data);
    return response.data;
  }

  async updateAccount(id: string, data: { name: string }) {
    const response = await this.client.put(`/accounts/${id}`, data);
    return response.data;
  }

  async deleteAccount(id: string) {
    const response = await this.client.delete(`/accounts/${id}`);
    return response.data;
  }

  async getCategories() {
    const response = await this.client.get('/categories');
    return response.data;
  }

  async createCategory(data: { name: string; type: string }) {
    const response = await this.client.post('/categories', data);
    return response.data;
  }

  async updateCategory(id: string, data: { name: string }) {
    const response = await this.client.put(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string) {
    const response = await this.client.delete(`/categories/${id}`);
    return response.data;
  }

  async getTransactions(filters?: {
    fromDate?: string;
    toDate?: string;
    type?: string;
    accountId?: string;
    categoryId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.accountId) params.append('accountId', filters.accountId);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);

    const response = await this.client.get(
      `/transactions?${params.toString()}`,
    );
    return response.data;
  }

  async createTransaction(data: {
    type: string;
    accountId: string;
    toAccountId?: string;
    categoryId?: string;
    amount: number;
    date: string;
    note?: string;
  }) {
    const response = await this.client.post('/transactions', data);
    return response.data;
  }

  async updateTransaction(
    id: string,
    data: { amount?: number; date?: string; note?: string },
  ) {
    const response = await this.client.put(`/transactions/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: string) {
    const response = await this.client.delete(`/transactions/${id}`);
    return response.data;
  }

  async getBudgets(month?: string) {
    const params = month ? `?month=${month}` : '';
    const response = await this.client.get(`/budgets${params}`);
    return response.data;
  }

  async createBudget(data: {
    month: string;
    categoryId: string;
    amount: number;
  }) {
    const response = await this.client.post('/budgets', data);
    return response.data;
  }

  async updateBudget(id: string, data: { amount: number }) {
    const response = await this.client.put(`/budgets/${id}`, data);
    return response.data;
  }

  async deleteBudget(id: string) {
    const response = await this.client.delete(`/budgets/${id}`);
    return response.data;
  }

  async getMonthlySummary(month: string) {
    const response = await this.client.get(`/reports/summary?month=${month}`);
    return response.data;
  }

  async getTopCategories(month: string, limit?: number) {
    const params = new URLSearchParams({ month });
    if (limit) params.append('limit', limit.toString());
    const response = await this.client.get(
      `/reports/top-categories?${params.toString()}`,
    );
    return response.data;
  }

  async getCashflow(from: string, to: string) {
    const response = await this.client.get(
      `/reports/cashflow?from=${from}&to=${to}`,
    );
    return response.data;
  }

  async getStarterPacks() {
    const response = await this.client.get('/starter-packs');
    return response.data;
  }

  async applyStarterPack(packKey: string) {
    const response = await this.client.post('/starter-packs', {
      packKey,
    });
    return response.data;
  }
}

export const api = new ApiClient();
