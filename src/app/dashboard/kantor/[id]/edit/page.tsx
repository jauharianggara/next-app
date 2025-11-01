'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { kantorApi } from '@/lib/api';
import { Kantor } from '@/types/api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditKantorPage() {
  const [kantor, setKantor] = useState<Kantor | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    longitude: '',
    latitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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
        const office = response.data;
        setKantor(office);
        setFormData({
          nama: office.nama,
          alamat: office.alamat,
          longitude: office.longitude,
          latitude: office.latitude,
        });
      }
    } catch (error) {
      console.error('Error fetching kantor:', error);
      toast.error('Failed to load office data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nama: formData.nama,
        alamat: formData.alamat,
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
      };

      await kantorApi.update(id, payload);
      toast.success('Office updated successfully!');
      router.push(`/dashboard/kantor/${id}`);
    } catch (error: any) {
      console.error('Error updating kantor:', error);
      toast.error(error.response?.data?.message || 'Failed to update office');
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
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/kantor/${id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Office</h1>
              <p className="mt-2 text-gray-600">Update office information</p>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Office Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                      Office Name *
                    </label>
                    <Input
                      id="nama"
                      name="nama"
                      type="text"
                      required
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder="Enter office name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                      Address *
                    </label>
                    <textarea
                      id="alamat"
                      name="alamat"
                      required
                      rows={3}
                      value={formData.alamat}
                      onChange={handleChange}
                      placeholder="Enter complete office address"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                        Latitude *
                      </label>
                      <Input
                        id="latitude"
                        name="latitude"
                        type="number"
                        step="any"
                        required
                        min="-90"
                        max="90"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="e.g., -6.175110"
                        className="mt-1"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Latitude coordinate (-90 to 90)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                        Longitude *
                      </label>
                      <Input
                        id="longitude"
                        name="longitude"
                        type="number"
                        step="any"
                        required
                        min="-180"
                        max="180"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="e.g., 106.827153"
                        className="mt-1"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Longitude coordinate (-180 to 180)
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-blue-900">How to get coordinates:</h4>
                    <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                      <li>Open Google Maps and search for your office location</li>
                      <li>Right-click on the exact location on the map</li>
                      <li>Click on the coordinates that appear in the context menu</li>
                      <li>Copy the latitude and longitude values</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Link href={`/dashboard/kantor/${id}`}>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Office'}
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