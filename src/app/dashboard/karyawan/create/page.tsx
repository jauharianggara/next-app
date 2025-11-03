'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { karyawanApi, kantorApi, jabatanApi } from '@/lib/api';
import { Kantor, Jabatan } from '@/types/api';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreateKaryawanPage() {
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
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kantorResponse, jabatanResponse] = await Promise.all([
        kantorApi.getAll(),
        jabatanApi.getAll(),
      ]);

      if (kantorResponse.success && kantorResponse.data) {
        setKantors(kantorResponse.data);
      }
      if (jabatanResponse.success && jabatanResponse.data) {
        setJabatans(jabatanResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (photo) {
        // Create with photo
        const photoFormData = new FormData();
        photoFormData.append('nama', formData.nama);
        photoFormData.append('posisi', jabatans.find(j => j.id.toString() === formData.jabatan_id)?.nama_jabatan || '');
        photoFormData.append('gaji', formData.gaji);
        photoFormData.append('jabatan_id', formData.jabatan_id);
        photoFormData.append('kantor_id', formData.kantor_id);
        photoFormData.append('foto', photo);

        await karyawanApi.createWithPhoto(photoFormData);
      } else {
        // Create without photo
        await karyawanApi.create(formData);
      }

      toast.success('Employee created successfully!');
      router.push('/dashboard/karyawan');
    } catch (error: any) {
      console.error('Error creating karyawan:', error);
      toast.error(error.response?.data?.message || 'Failed to create employee');
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/karyawan">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Employee</h1>
              <p className="mt-2 text-gray-600">Add a new employee to the system</p>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
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
                      Photo (Optional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="photo"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload a file</span>
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
                          <p className="text-sm text-green-600">Selected: {photo.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Link href="/dashboard/karyawan">
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Employee'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}