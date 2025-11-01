'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { jabatanApi } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreateJabatanPage() {
  const [formData, setFormData] = useState({
    nama_jabatan: '',
    deskripsi: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nama_jabatan: formData.nama_jabatan,
        ...(formData.deskripsi && { deskripsi: formData.deskripsi }),
      };

      await jabatanApi.create(payload);
      toast.success('Job position created successfully!');
      router.push('/dashboard/jabatan');
    } catch (error: any) {
      console.error('Error creating jabatan:', error);
      toast.error(error.response?.data?.message || 'Failed to create job position');
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/jabatan">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Job Position</h1>
              <p className="mt-2 text-gray-600">Add a new job position to the system</p>
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

                  <div className="flex justify-end space-x-3">
                    <Link href="/dashboard/jabatan">
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Position'}
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