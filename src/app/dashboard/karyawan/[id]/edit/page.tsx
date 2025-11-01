'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { karyawanApi, kantorApi, jabatanApi } from '@/lib/api';
import { KaryawanWithKantor, Kantor, Jabatan } from '@/types/api';
import { ArrowLeft, Upload, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditKaryawanPage() {
  const [karyawan, setKaryawan] = useState<KaryawanWithKantor | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    gaji: '',
    kantor_id: '',
    jabatan_id: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [kantors, setKantors] = useState<Kantor[]>([]);
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [karyawanResponse, kantorResponse, jabatanResponse] = await Promise.all([
        karyawanApi.getByIdWithKantor(id),
        kantorApi.getAll(),
        jabatanApi.getAll(),
      ]);

      if (karyawanResponse.success && karyawanResponse.data) {
        const emp = karyawanResponse.data;
        setKaryawan(emp);
        setFormData({
          nama: emp.nama,
          gaji: emp.gaji.toString(),
          kantor_id: emp.kantor_id.toString(),
          jabatan_id: emp.jabatan_id.toString(),
        });
      }

      if (kantorResponse.success && kantorResponse.data) {
        setKantors(kantorResponse.data);
      }
      if (jabatanResponse.success && jabatanResponse.data) {
        setJabatans(jabatanResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load employee data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update basic information
      await karyawanApi.update(id, formData);

      // Upload photo if selected
      if (photo) {
        const photoFormData = new FormData();
        photoFormData.append('foto', photo);
        await karyawanApi.uploadPhoto(id, photoFormData);
      }

      toast.success('Employee updated successfully!');
      router.push(`/dashboard/karyawan/${id}`);
    } catch (error: any) {
      console.error('Error updating karyawan:', error);
      toast.error(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setPhoto(file);
    }
  };

  if (loadingData) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!karyawan) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Employee not found</h3>
            <p className="mt-1 text-sm text-gray-500">The employee you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href="/dashboard/karyawan">
                <Button>Back to Employee List</Button>
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/karyawan/${id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
              <p className="mt-2 text-gray-600">Update employee information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Current Photo</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {karyawan.foto_path ? (
                  <div className="space-y-4">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${karyawan.foto_path}`}
                      alt={karyawan.nama}
                      className="w-32 h-32 rounded-full object-cover mx-auto"
                    />
                    <p className="text-sm text-gray-500">
                      {karyawan.foto_original_name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No photo available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <Input
                        id="nama"
                        name="nama"
                        type="text"
                        required
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Enter employee's full name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label htmlFor="jabatan_id" className="block text-sm font-medium text-gray-700">
                        Position *
                      </label>
                      <select
                        id="jabatan_id"
                        name="jabatan_id"
                        required
                        value={formData.jabatan_id}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="">Select a position</option>
                        {jabatans.map((jabatan) => (
                          <option key={jabatan.id} value={jabatan.id}>
                            {jabatan.nama_jabatan}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="kantor_id" className="block text-sm font-medium text-gray-700">
                        Office *
                      </label>
                      <select
                        id="kantor_id"
                        name="kantor_id"
                        required
                        value={formData.kantor_id}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="">Select an office</option>
                        {kantors.map((kantor) => (
                          <option key={kantor.id} value={kantor.id}>
                            {kantor.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="gaji" className="block text-sm font-medium text-gray-700">
                        Salary (IDR) *
                      </label>
                      <Input
                        id="gaji"
                        name="gaji"
                        type="number"
                        required
                        min="1000000"
                        max="100000000"
                        value={formData.gaji}
                        onChange={handleChange}
                        placeholder="e.g., 8000000"
                        className="mt-1"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Enter salary amount between Rp 1,000,000 and Rp 100,000,000
                      </p>
                    </div>

                    <div>
                      <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                        Update Photo (Optional)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="photo"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Upload a new file</span>
                              <input
                                id="photo"
                                name="photo"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          {photo && (
                            <p className="text-sm text-green-600">New photo selected: {photo.name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Link href={`/dashboard/karyawan/${id}`}>
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                      </Link>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Employee'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}