'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { karyawanApi, kantorApi, jabatanApi } from '@/lib/api';
import { Users, Building2, Briefcase, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalKaryawan: number;
  totalKantor: number;
  totalJabatan: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalKaryawan: 0,
    totalKantor: 0,
    totalJabatan: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [karyawanResponse, kantorResponse, jabatanResponse] = await Promise.all([
          karyawanApi.getAll(),
          kantorApi.getAll(),
          jabatanApi.getAll(),
        ]);

        setStats({
          totalKaryawan: karyawanResponse.data?.length || 0,
          totalKantor: kantorResponse.data?.length || 0,
          totalJabatan: jabatanResponse.data?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Karyawan',
      value: stats.totalKaryawan,
      icon: Users,
      description: 'Active employees',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Kantor',
      value: stats.totalKantor,
      icon: Building2,
      description: 'Office locations',
      color: 'bg-green-500',
    },
    {
      title: 'Total Jabatan',
      value: stats.totalJabatan,
      icon: Briefcase,
      description: 'Job positions',
      color: 'bg-purple-500',
    },
    {
      title: 'Growth Rate',
      value: '+12%',
      icon: TrendingUp,
      description: 'This month',
      color: 'bg-orange-500',
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome to the Karyawan Management System. Overview of your organization.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`inline-flex items-center justify-center p-3 rounded-lg ${card.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {card.title}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {loading ? '...' : card.value}
                            </div>
                          </dd>
                        </dl>
                        <p className="text-sm text-gray-500">{card.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <a
                    href="/dashboard/karyawan/create"
                    className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="font-medium text-blue-900">Add Employee</p>
                      <p className="text-sm text-blue-600">Create new employee record</p>
                    </div>
                  </a>
                  <a
                    href="/dashboard/kantor/create"
                    className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Building2 className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="font-medium text-green-900">Add Office</p>
                      <p className="text-sm text-green-600">Register new office location</p>
                    </div>
                  </a>
                  <a
                    href="/dashboard/jabatan/create"
                    className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Briefcase className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="font-medium text-purple-900">Add Position</p>
                      <p className="text-sm text-purple-600">Create new job position</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">API Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Authentication</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      JWT Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">File Upload</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ready
                    </span>
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