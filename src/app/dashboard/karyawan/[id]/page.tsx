'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { karyawanApi } from '@/lib/api';
import { KaryawanWithKantor } from '@/types/api';
import { ArrowLeft, Edit, Trash2, User, Building2, Briefcase, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KaryawanDetailPage() {
  const [karyawan, setKaryawan] = useState<KaryawanWithKantor | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  useEffect(() => {
    if (id) {
      fetchKaryawan();
    }
  }, [id]);

  const fetchKaryawan = async () => {
    try {
      const response = await karyawanApi.getByIdWithKantor(id);
      if (response.success && response.data) {
        setKaryawan(response.data);
      }
    } catch (error) {
      console.error('Error fetching karyawan:', error);
      toast.error('Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!karyawan) return;
    
    if (!confirm(`Are you sure you want to delete employee "${karyawan.nama}"?`)) {
      return;
    }

    try {
      const response = await karyawanApi.delete(id);
      
      if (response.success) {
        toast.success('Employee deleted successfully');
        router.push('/dashboard/karyawan');
      } else {
        toast.error(response.message || 'Failed to delete employee');
      }
    } catch (error: any) {
      console.error('Error deleting karyawan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete employee';
      toast.error(errorMessage);
    }
  };

  const handleDeletePhoto = async () => {
    if (!karyawan?.foto_path) return;
    
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await karyawanApi.deletePhoto(id);
      
      if (response.success) {
        toast.success('Photo deleted successfully');
        fetchKaryawan(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to delete photo');
      }
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete photo';
      toast.error(errorMessage);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/karyawan">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{karyawan.nama}</h1>
                <p className="mt-2 text-gray-600">Employee Details</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href={`/dashboard/karyawan/${id}/edit`}>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Photo Card */}
            <Card>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {karyawan.foto_path ? (
                  <div className="space-y-4">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${karyawan.foto_path}`}
                      alt={karyawan.nama}
                      className="w-32 h-32 rounded-full object-cover mx-auto"
                    />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        {karyawan.foto_original_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {karyawan.foto_size ? `${(karyawan.foto_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeletePhoto}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No photo available</p>
                    <Link href={`/dashboard/karyawan/${id}/edit`}>
                      <Button variant="outline" size="sm">
                        Upload Photo
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">{karyawan.nama}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Position</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {karyawan.jabatan_nama || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Office</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {karyawan.kantor_nama || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Salary</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatRupiah(karyawan.gaji)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Employee ID</p>
                      <p className="text-lg font-semibold text-gray-900">#{karyawan.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created At</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(karyawan.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(karyawan.updated_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {karyawan.created_by && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created By</p>
                        <p className="text-lg font-semibold text-gray-900">User #{karyawan.created_by}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}