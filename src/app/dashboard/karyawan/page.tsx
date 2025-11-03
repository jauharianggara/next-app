'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { karyawanApi } from '@/lib/api';
import { KaryawanWithKantor } from '@/types/api';
import { Plus, Edit, Trash2, Eye, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KaryawanListPage() {
  const [karyawans, setKaryawans] = useState<KaryawanWithKantor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKaryawans();
  }, []);

  const fetchKaryawans = async () => {
    try {
      const response = await karyawanApi.getAllWithKantor();
      if (response.success && response.data) {
        setKaryawans(response.data);
      }
    } catch (error) {
      console.error('Error fetching karyawans:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Are you sure you want to delete employee "${nama}"?`)) {
      return;
    }

    try {
      const response = await karyawanApi.delete(id);
      
      if (response.success) {
        toast.success('Employee deleted successfully');
        fetchKaryawans();
      } else {
        toast.error(response.message || 'Failed to delete employee');
      }
    } catch (error: any) {
      console.error('Error deleting karyawan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete employee';
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Karyawan Management</h1>
              <p className="mt-2 text-gray-600">
                Manage employee records, positions, and office assignments
              </p>
            </div>
            <Link href="/dashboard/karyawan/create">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </Button>
            </Link>
          </div>

          {/* Karyawan Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee List ({karyawans.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {karyawans.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No employees</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new employee.</p>
                  <div className="mt-6">
                    <Link href="/dashboard/karyawan/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Office</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {karyawans.map((karyawan) => (
                        <TableRow key={karyawan.id}>
                          <TableCell>
                            {karyawan.foto_path ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL || 'https://axum.synergyinfinity.id'}/${karyawan.foto_path}`}
                                alt={karyawan.nama}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{karyawan.nama}</TableCell>
                          <TableCell>{karyawan.jabatan_nama || 'N/A'}</TableCell>
                          <TableCell>{karyawan.kantor_nama || 'N/A'}</TableCell>
                          <TableCell>{formatRupiah(karyawan.gaji)}</TableCell>
                          <TableCell>{new Date(karyawan.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Link href={`/dashboard/karyawan/${karyawan.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/dashboard/karyawan/${karyawan.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(karyawan.id, karyawan.nama)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}