'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { kantorApi } from '@/lib/api';
import { Kantor } from '@/types/api';
import { Plus, Edit, Trash2, Eye, Building2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KantorListPage() {
  const [kantors, setKantors] = useState<Kantor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKantors();
  }, []);

  const fetchKantors = async () => {
    try {
      const response = await kantorApi.getAll();
      if (response.success && response.data) {
        setKantors(response.data);
      }
    } catch (error) {
      console.error('Error fetching kantors:', error);
      toast.error('Failed to fetch offices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Are you sure you want to delete office "${nama}"?`)) {
      return;
    }

    try {
      await kantorApi.delete(id);
      toast.success('Office deleted successfully');
      fetchKantors();
    } catch (error) {
      console.error('Error deleting kantor:', error);
      toast.error('Failed to delete office');
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Office Management</h1>
              <p className="mt-2 text-gray-600">
                Manage office locations and their details
              </p>
            </div>
            <Link href="/dashboard/kantor/create">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Office</span>
              </Button>
            </Link>
          </div>

          {/* Kantor Table */}
          <Card>
            <CardHeader>
              <CardTitle>Office List ({kantors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {kantors.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No offices</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new office location.</p>
                  <div className="mt-6">
                    <Link href="/dashboard/kantor/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Office
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Office Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Coordinates</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kantors.map((kantor) => (
                        <TableRow key={kantor.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span>{kantor.nama}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="max-w-xs truncate">{kantor.alamat}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              <div>Lat: {parseFloat(kantor.latitude).toFixed(6)}</div>
                              <div>Lng: {parseFloat(kantor.longitude).toFixed(6)}</div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(kantor.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Link href={`/dashboard/kantor/${kantor.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/dashboard/kantor/${kantor.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(kantor.id, kantor.nama)}
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