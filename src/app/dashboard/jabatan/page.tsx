'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import CreateInitialJabatan from '@/components/CreateInitialJabatan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { jabatanApi } from '@/lib/api';
import { Jabatan } from '@/types/api';
import { Plus, Edit, Trash2, Eye, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JabatanListPage() {
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInitialSetup, setShowInitialSetup] = useState(false);

  useEffect(() => {
    fetchJabatans();
  }, []);

  const fetchJabatans = async () => {
    try {
      console.log('Fetching jabatan data...');
      const response = await jabatanApi.getAll();
      console.log('Jabatan API Response:', response);
      
      if (response.success && response.data) {
        console.log('Jabatan data length:', response.data.length);
        setJabatans(response.data);
        setShowInitialSetup(response.data.length === 0);
      } else {
        console.log('No jabatan data or request failed:', response);
        // If response is successful but data is empty array, don't show setup
        if (response.success && Array.isArray(response.data) && response.data.length === 0) {
          setJabatans([]);
          setShowInitialSetup(false); // Data kosong tapi API sukses
        } else {
          setShowInitialSetup(true);
        }
      }
    } catch (error: any) {
      console.error('Error fetching jabatans:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error('Please login to access job positions');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to fetch job positions. Backend may not be running.');
      }
      
      setShowInitialSetup(false); // Don't show setup on errors
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Are you sure you want to delete position "${nama}"?`)) {
      return;
    }

    try {
      await jabatanApi.delete(id);
      toast.success('Job position deleted successfully');
      fetchJabatans();
    } catch (error) {
      console.error('Error deleting jabatan:', error);
      toast.error('Failed to delete job position. It might be assigned to employees.');
    }
  };

  const handleDataCreated = () => {
    setShowInitialSetup(false);
    fetchJabatans();
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

  if (showInitialSetup) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Position Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage job positions and their descriptions
                </p>
              </div>
              <Link href="/dashboard/jabatan/create">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Position</span>
                </Button>
              </Link>
            </div>
            
                    {showInitialSetup && (
          <div className="mb-6">
            <CreateInitialJabatan onSuccess={handleDataCreated} />
          </div>
        )}
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
              <h1 className="text-3xl font-bold text-gray-900">Job Position Management</h1>
              <p className="mt-2 text-gray-600">
                Manage job positions and their descriptions
              </p>
            </div>
            <Link href="/dashboard/jabatan/create">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Position</span>
              </Button>
            </Link>
          </div>

          {/* Jabatan Table */}
          <Card>
            <CardHeader>
              <CardTitle>Job Position List ({jabatans.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {jabatans.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No job positions</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new job position.</p>
                  <div className="mt-6">
                    <Link href="/dashboard/jabatan/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Position
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jabatans.map((jabatan) => (
                        <TableRow key={jabatan.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="h-4 w-4 text-gray-400" />
                              <span>{jabatan.nama_jabatan}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="max-w-md truncate">
                              {jabatan.deskripsi || 'No description'}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(jabatan.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Link href={`/dashboard/jabatan/${jabatan.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/dashboard/jabatan/${jabatan.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(jabatan.id, jabatan.nama_jabatan)}
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