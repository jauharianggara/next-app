'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { kantorApi } from '@/lib/api';
import { Kantor } from '@/types/api';
import { ArrowLeft, Edit, Trash2, Building2, MapPin, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KantorDetailPage() {
  const [kantor, setKantor] = useState<Kantor | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  useEffect(() => {
    if (id) {
      fetchKantor();
    }
  }, [id]);

  const fetchKantor = async () => {
    try {
      const response = await kantorApi.getById(id);
      if (response.success && response.data) {
        setKantor(response.data);
      }
    } catch (error) {
      console.error('Error fetching kantor:', error);
      toast.error('Failed to fetch office details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!kantor) return;
    
    if (!confirm(`Are you sure you want to delete office "${kantor.nama}"?`)) {
      return;
    }

    try {
      const response = await kantorApi.delete(id);
      
      if (response.success) {
        toast.success('Office deleted successfully');
        router.push('/dashboard/kantor');
      } else {
        toast.error(response.message || 'Failed to delete office. It might have associated employees.');
      }
    } catch (error: any) {
      console.error('Error deleting kantor:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete office. It might have associated employees.';
      toast.error(errorMessage);
    }
  };

  const openInGoogleMaps = () => {
    if (!kantor) return;
    const url = `https://www.google.com/maps?q=${kantor.latitude},${kantor.longitude}`;
    window.open(url, '_blank');
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

  if (!kantor) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Office not found</h3>
            <p className="mt-1 text-sm text-gray-500">The office you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link href="/dashboard/kantor">
                <Button>Back to Office List</Button>
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
              <Link href="/dashboard/kantor">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{kantor.nama}</h1>
                <p className="mt-2 text-gray-600">Office Details</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href={`/dashboard/kantor/${id}/edit`}>
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
            {/* Office Information */}
            <Card>
              <CardHeader>
                <CardTitle>Office Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Office Name</p>
                    <p className="text-lg font-semibold text-gray-900">{kantor.nama}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-lg font-semibold text-gray-900">{kantor.alamat}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Navigation className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Coordinates</p>
                    <div className="text-lg font-semibold text-gray-900">
                      <div>Latitude: {parseFloat(kantor.latitude).toFixed(6)}</div>
                      <div>Longitude: {parseFloat(kantor.longitude).toFixed(6)}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={openInGoogleMaps} variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Google Maps
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Map Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Location Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="border-0"
                    title={`Map of ${kantor.nama}`}
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${kantor.latitude},${kantor.longitude}&zoom=15`}
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <div className="text-center">
                        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Map preview unavailable
                        </p>
                        <p className="text-xs text-gray-400">
                          Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable maps
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Office ID</p>
                    <p className="text-lg font-semibold text-gray-900">#{kantor.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created At</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(kantor.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(kantor.updated_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}