import { apiClient } from '@/lib/api-client';
import {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
  Karyawan,
  KaryawanWithKantor,
  CreateKaryawanRequest,
  UpdateKaryawanRequest,
  Kantor,
  CreateKantorRequest,
  UpdateKantorRequest,
  Jabatan,
  CreateJabatanRequest,
  UpdateJabatanRequest,
} from '@/types/api';

// Authentication API
export const authApi = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/api/user/me');
    return response.data;
  },
};

// Karyawan API
export const karyawanApi = {
  async getAll(): Promise<ApiResponse<Karyawan[]>> {
    const response = await apiClient.get('/api/karyawans');
    return response.data;
  },

  async getAllWithKantor(): Promise<ApiResponse<KaryawanWithKantor[]>> {
    const response = await apiClient.get('/api/karyawans/with-kantor');
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<Karyawan>> {
    const response = await apiClient.get(`/api/karyawans/${id}`);
    return response.data;
  },

  async getByIdWithKantor(id: number): Promise<ApiResponse<KaryawanWithKantor>> {
    const response = await apiClient.get(`/api/karyawans/${id}/with-kantor`);
    return response.data;
  },

  async create(data: CreateKaryawanRequest): Promise<ApiResponse<Karyawan>> {
    const response = await apiClient.post('/api/karyawans', data);
    return response.data;
  },

  async createWithPhoto(formData: FormData): Promise<ApiResponse<Karyawan>> {
    const response = await apiClient.post('/api/karyawans/with-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: [(data) => data], // Don't transform FormData
    });
    return response.data;
  },

  async update(id: number, data: UpdateKaryawanRequest): Promise<ApiResponse<Karyawan>> {
    const response = await apiClient.put(`/api/karyawans/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<ApiResponse<any>> {
    const response = await apiClient.delete(`/api/karyawans/${id}`);
    return response.data;
  },

  async uploadPhoto(id: number, formData: FormData): Promise<ApiResponse<Karyawan>> {
    const response = await apiClient.post(`/api/karyawans/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: [(data) => data], // Don't transform FormData
    });
    return response.data;
  },

  async deletePhoto(id: number): Promise<ApiResponse<Karyawan>> {
    const response = await apiClient.delete(`/api/karyawans/${id}/photo`);
    return response.data;
  },
};

// Kantor API
export const kantorApi = {
  async getAll(): Promise<ApiResponse<Kantor[]>> {
    const response = await apiClient.get('/api/kantors');
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<Kantor>> {
    const response = await apiClient.get(`/api/kantors/${id}`);
    return response.data;
  },

  async create(data: CreateKantorRequest): Promise<ApiResponse<Kantor>> {
    const response = await apiClient.post('/api/kantors', data);
    return response.data;
  },

  async update(id: number, data: UpdateKantorRequest): Promise<ApiResponse<Kantor>> {
    const response = await apiClient.put(`/api/kantors/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<ApiResponse<any>> {
    const response = await apiClient.delete(`/api/kantors/${id}`);
    return response.data;
  },
};

// Jabatan API
export const jabatanApi = {
  async getAll(): Promise<ApiResponse<Jabatan[]>> {
    const response = await apiClient.get('/api/jabatans');
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<Jabatan>> {
    const response = await apiClient.get(`/api/jabatans/${id}`);
    return response.data;
  },

  async create(data: CreateJabatanRequest): Promise<ApiResponse<Jabatan>> {
    const response = await apiClient.post('/api/jabatans', data);
    return response.data;
  },

  async update(id: number, data: UpdateJabatanRequest): Promise<ApiResponse<Jabatan>> {
    const response = await apiClient.put(`/api/jabatans/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<ApiResponse<any>> {
    const response = await apiClient.delete(`/api/jabatans/${id}`);
    return response.data;
  },
};