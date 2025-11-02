'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BackendStatus from '@/components/BackendStatus';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username_or_email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Get backend URL for display
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'Not configured';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Karyawan Management</h1>
          <p className="mt-2 text-gray-600">Employee and Office Management System</p>
          
          {/* Backend URL Display */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Backend API:</p>
            <p className="text-xs text-blue-600 font-mono break-all">{backendUrl}</p>
            <div className="flex items-center justify-center mt-2 space-x-2">
              <div className={`w-2 h-2 rounded-full ${backendUrl.includes('103.167.113.116') ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-xs text-blue-600">
                {backendUrl.includes('103.167.113.116') ? 'Production Server' : 'Development/Other'}
              </span>
            </div>
          </div>
          
          {/* Real-time Backend Status */}
          <div className="mt-3">
            <BackendStatus />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your username/email and password to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username_or_email" className="block text-sm font-medium text-gray-700">
                  Username or Email
                </label>
                <Input
                  id="username_or_email"
                  name="username_or_email"
                  type="text"
                  required
                  value={formData.username_or_email}
                  onChange={handleChange}
                  placeholder="Enter your username or email"
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Debug Information */}
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <details className="cursor-pointer">
                <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  🔧 Debug Information
                </summary>
                <div className="mt-2 space-y-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Environment:</span> {process.env.NODE_ENV || 'undefined'}
                  </div>
                  <div>
                    <span className="font-medium">API URL:</span> 
                    <code className="ml-1 px-1 bg-gray-200 rounded">{backendUrl}</code>
                  </div>
                  <div>
                    <span className="font-medium">Use Proxy:</span> {process.env.NEXT_PUBLIC_USE_PROXY || 'false'}
                  </div>
                  <div>
                    <span className="font-medium">Debug Mode:</span> {process.env.NEXT_PUBLIC_DEBUG || 'false'}
                  </div>
                  <div className="pt-2 border-t border-gray-300">
                    <span className="font-medium">Test Endpoints:</span>
                    <div className="ml-2 mt-1">
                      <div>• Login: <code className="text-xs bg-gray-200 px-1 rounded">{backendUrl.replace('/api', '')}/api/auth/login</code></div>
                      <div>• Jabatans: <code className="text-xs bg-gray-200 px-1 rounded">{backendUrl.replace('/api', '')}/api/jabatans</code></div>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/auth/register">
                  <Button variant="outline" className="w-full">
                    Create new account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}