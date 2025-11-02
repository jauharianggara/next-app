'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { jabatanApi } from '@/lib/api';
import { Jabatan } from '@/types/api';
import { ArrowLeft, Edit, Trash2, Briefcase, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JabatanDetailPage() {
  const [jabatan, setJabatan] = useState<Jabatan | null>(null);
  const [loading, setLoading] = useState(true);
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
        setJabatan(response.data);
      }
    } catch (error) {
      console.error('Error fetching jabatan:', error);
      toast.error('Failed to fetch job position details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!jabatan) return;
    
    if (!confirm(`Are you sure you want to delete position "${jabatan.nama_jabatan}"?`)) {
      return;
    }

    try {
      const response = await jabatanApi.delete(id);
      
      if (response.success) {
        toast.success('Job position deleted successfully');
        router.push('/dashboard/jabatan');
      } else {
        toast.error(response.message || 'Failed to delete job position. It might be assigned to employees.');
      }
    } catch (error: any) {
      console.error('Error deleting jabatan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete job position. It might be assigned to employees.';
      toast.error(errorMessage);
    }
  };

  if (loading) {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/jabatan">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{jabatan.nama_jabatan}</h1>
                <p className="mt-2 text-gray-600">Job Position Details</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href={`/dashboard/jabatan/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Position Information */}
            <Card>
              <CardHeader>
                <CardTitle>Position Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Position Name</p>
                    <p className="text-lg font-semibold text-gray-900">{jabatan.nama_jabatan}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <div className="text-lg font-semibold text-gray-900">
                      {jabatan.deskripsi ? (
                        <div className="whitespace-pre-wrap">{jabatan.deskripsi}</div>
                      ) : (
                        <span className="text-gray-400 italic">No description provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Position ID</p>
                    <p className="text-lg font-semibold text-gray-900">#{jabatan.id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created At</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(jabatan.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(jabatan.updated_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Position Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-yellow-900">Important Note:</h4>
                <p className="mt-2 text-sm text-yellow-700">
                  This job position cannot be deleted if it's currently assigned to any employees. 
                  To delete this position, first reassign all employees to different positions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}