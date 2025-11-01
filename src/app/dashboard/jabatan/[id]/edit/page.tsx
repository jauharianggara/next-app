'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { jabatanApi } from '@/lib/api';
import { Jabatan } from '@/types/api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditJabatanPage() {
  const [jabatan, setJabatan] = useState<Jabatan | null>(null);
  const [formData, setFormData] = useState({
    nama_jabatan: '',
    deskripsi: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  useEffect(() => {
    if (id) {
      fetchJabatan();
    }
  }, [id]);

  const fetchJabatan = async () => {
    try {
      const response = await jabatanApi.getById(id);
      if (response.success && response.data) {
        const position = response.data;
        setJabatan(position);
        setFormData({
          nama_jabatan: position.nama_jabatan,
          deskripsi: position.deskripsi || '',
        });
      }
    } catch (error) {
      console.error('Error fetching jabatan:', error);
      toast.error('Failed to load job position data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nama_jabatan: formData.nama_jabatan,
        ...(formData.deskripsi && { deskripsi: formData.deskripsi }),
      };

      await jabatanApi.update(id, payload);
      toast.success('Job position updated successfully!');
      router.push(`/dashboard/jabatan/${id}`);
    } catch (error: any) {
      console.error('Error updating jabatan:', error);
      toast.error(error.response?.data?.message || 'Failed to update job position');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  if (!jabatan) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Job position not found</h3>
            <p className="mt-1 text-sm text-gray-500">The job position you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href="/dashboard/jabatan">
                <Button>Back to Job Position List</Button>
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
            <Link href={`/dashboard/jabatan/${id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Job Position</h1>
              <p className="mt-2 text-gray-600">Update job position information</p>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Job Position Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="nama_jabatan" className="block text-sm font-medium text-gray-700">
                      Position Name *
                    </label>
                    <Input
                      id="nama_jabatan"
                      name="nama_jabatan"
                      type="text"
                      required
                      value={formData.nama_jabatan}
                      onChange={handleChange}
                      placeholder="Enter job position name"
                      className="mt-1"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      e.g., Manager, Software Engineer, HR Specialist
                    </p>
                  </div>

                  <div>
                    <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <textarea
                      id="deskripsi"
                      name="deskripsi"
                      rows={4}
                      value={formData.deskripsi}
                      onChange={handleChange}
                      placeholder="Enter job position description, responsibilities, and requirements"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Describe the role, responsibilities, and requirements (max 500 characters)
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-blue-900">Position Guidelines:</h4>
                    <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                      <li>Use clear and professional position names</li>
                      <li>Include level information when relevant (e.g., Senior, Junior)</li>
                      <li>Be specific about the department or function</li>
                      <li>Consider hierarchy and reporting structure</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-yellow-900">Warning:</h4>
                    <p className="mt-2 text-sm text-yellow-700">
                      Changing the position name will affect all employees currently assigned to this position. 
                      Make sure to communicate any changes to relevant departments.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Link href={`/dashboard/jabatan/${id}`}>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Position'}
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