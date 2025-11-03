'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface StatusCheck {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  url?: string;
  response?: any;
  error?: string;
}

export default function StatusPage() {
  const [checks, setChecks] = useState<StatusCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const performChecks = async () => {
    setIsChecking(true);
    const newChecks: StatusCheck[] = [];

    // Check 1: Backend Health
    try {
      const response = await fetch('https://axum.synergyinfinity.id/api/karyawans', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0] || 'no-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        newChecks.push({
          name: 'Backend Connection',
          status: 'success',
          message: `Backend is running. Response: ${response.status}`,
          url: 'https://axum.synergyinfinity.id/api/karyawans',
          response: data
        });
      } else {
        newChecks.push({
          name: 'Backend Connection',
          status: 'error',
          message: `Backend returned ${response.status}: ${response.statusText}`,
          url: 'https://axum.synergyinfinity.id/api/karyawans'
        });
      }
    } catch (error: any) {
      newChecks.push({
        name: 'Backend Connection',
        status: 'error',
        message: 'Cannot connect to backend server',
        url: 'https://axum.synergyinfinity.id/api/karyawans',
        error: error.message
      });
    }

    // Check 2: Authentication
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      if (token) {
        newChecks.push({
          name: 'Authentication',
          status: 'success',
          message: 'JWT token found in cookies',
          response: { token: token.substring(0, 20) + '...' }
        });
      } else {
        newChecks.push({
          name: 'Authentication',
          status: 'warning',
          message: 'No JWT token found. Please login.',
        });
      }
    } catch (error: any) {
      newChecks.push({
        name: 'Authentication',
        status: 'error',
        message: 'Error checking authentication',
        error: error.message
      });
    }

    // Check 3: Jabatan Endpoint
    try {
      const response = await fetch('https://axum.synergyinfinity.id/api/jabatans', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0] || 'no-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        newChecks.push({
          name: 'Jabatan Endpoint',
          status: data.length > 0 ? 'success' : 'warning',
          message: data.length > 0 ? `Found ${data.length} job positions` : 'No job positions found in database',
          url: 'https://axum.synergyinfinity.id/api/jabatans',
          response: data
        });
      } else {
        newChecks.push({
          name: 'Jabatan Endpoint',
          status: 'error',
          message: `Jabatan endpoint returned ${response.status}: ${response.statusText}`,
          url: 'https://axum.synergyinfinity.id/api/jabatans'
        });
      }
    } catch (error: any) {
      newChecks.push({
        name: 'Jabatan Endpoint',
        status: 'error',
        message: 'Cannot access jabatan endpoint',
        url: 'https://axum.synergyinfinity.id/api/jabatans',
        error: error.message
      });
    }

    // Check 4: Direct Backend (without proxy)
    try {
      const response = await fetch('https://axum.synergyinfinity.id/api/jabatans', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0] || 'no-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        newChecks.push({
          name: 'Direct Backend Access',
          status: 'success',
          message: `Direct access successful. Data length: ${data.length || 0}`,
          url: 'https://axum.synergyinfinity.id/api/jabatans',
          response: data
        });
      } else {
        newChecks.push({
          name: 'Direct Backend Access',
          status: 'error',
          message: `Direct access failed: ${response.status}`,
          url: 'https://axum.synergyinfinity.id/api/jabatans'
        });
      }
    } catch (error: any) {
      newChecks.push({
        name: 'Direct Backend Access',
        status: 'error',
        message: 'CORS error (expected in development)',
        url: 'https://axum.synergyinfinity.id/api/jabatans',
        error: error.message
      });
    }

    setChecks(newChecks);
    setIsChecking(false);
  };

  useEffect(() => {
    performChecks();
  }, []);

  const getStatusIcon = (status: StatusCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'loading':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: StatusCheck['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      loading: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="text-gray-600">Check the connection status of all system components</p>
        </div>
        <Button
          onClick={performChecks}
          disabled={isChecking}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          Refresh Checks
        </Button>
      </div>

      <div className="grid gap-4">
        {checks.map((check, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <CardTitle className="text-lg">{check.name}</CardTitle>
                </div>
                {getStatusBadge(check.status)}
              </div>
              <CardDescription>{check.message}</CardDescription>
            </CardHeader>
            <CardContent>
              {check.url && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-500">URL: </span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{check.url}</code>
                </div>
              )}
              {check.response && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-500">Response: </span>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(check.response, null, 2)}
                  </pre>
                </div>
              )}
              {check.error && (
                <div>
                  <span className="text-sm font-medium text-red-500">Error: </span>
                  <code className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">{check.error}</code>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {checks.some(check => check.status === 'error') && (
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Troubleshooting Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <ul className="list-disc pl-6 space-y-1">
              <li>Make sure your backend server is running on <code>https://axum.synergyinfinity.id</code></li>
              <li>Check if you're logged in and have a valid JWT token</li>
              <li>Verify your backend database has jabatan data</li>
              <li>Ensure CORS is configured properly on your backend</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}