'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { kantorApi } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreateKantorPage() {
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    longitude: '',
    latitude: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

      await kantorApi.create(payload);
      toast.success('Office created successfully!');
      router.push('/dashboard/kantor');
    } catch (error: any) {
      console.error('Error creating kantor:', error);
      toast.error(error.response?.data?.message || 'Failed to create office');
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
            <Link href="/dashboard/kantor">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Office</h1>
              <p className="mt-2 text-gray-600">Add a new office location to the system</p>
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
                    <Link href="/dashboard/kantor">
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Office'}
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