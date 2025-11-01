// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[] | null;
}

// Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expires_in: number;
}

// Karyawan Types
export interface Karyawan {
  id: number;
  nama: string;
  gaji: number;
  kantor_id: number;
  jabatan_id: number;
  foto_path?: string | null;
  foto_original_name?: string | null;
  foto_size?: number | null;
  foto_mime_type?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  created_at: string;
  updated_at: string;
}

export interface KaryawanWithKantor extends Karyawan {
  kantor_nama?: string | null;
  jabatan_nama?: string | null;
}

export interface CreateKaryawanRequest {
  nama: string;
  gaji: string;
  kantor_id: string;
  jabatan_id: string;
}

export interface UpdateKaryawanRequest {
  nama: string;
  gaji: string;
  kantor_id: string;
  jabatan_id: string;
}

export interface CreateKaryawanWithPhotoRequest {
  nama: string;
  posisi: string;
  gaji: string;
  kantor_id: string;
  foto: File;
}

// Kantor Types
export interface Kantor {
  id: number;
  nama: string;
  alamat: string;
  longitude: string;
  latitude: string;
  created_at: string;
  updated_at: string;
}

export interface CreateKantorRequest {
  nama: string;
  alamat: string;
  longitude: number;
  latitude: number;
}

export interface UpdateKantorRequest {
  nama: string;
  alamat: string;
  longitude: number;
  latitude: number;
}

// Jabatan Types
export interface Jabatan {
  id: number;
  nama_jabatan: string;
  deskripsi?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJabatanRequest {
  nama_jabatan: string;
  deskripsi?: string;
}

export interface UpdateJabatanRequest {
  nama_jabatan: string;
  deskripsi?: string;
}

// Form Types
export interface KaryawanFormData {
  nama: string;
  gaji: number;
  kantor_id: number;
  jabatan_id: number;
  foto?: FileList;
}

export interface KantorFormData {
  nama: string;
  alamat: string;
  longitude: number;
  latitude: number;
}

export interface JabatanFormData {
  nama_jabatan: string;
  deskripsi?: string;
}