'use client'

import { useEffect, useState } from 'react'

interface BackendStatus {
  url: string;
  status: 'checking' | 'online' | 'offline';
  responseTime?: number;
  error?: string;
}

export default function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    url: process.env.NEXT_PUBLIC_API_URL || 'Not configured',
    status: 'checking'
  });

  useEffect(() => {
    const checkBackend = async () => {
      const startTime = Date.now();
      
      try {
        // Test backend connection menggunakan proxy
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/proxy/jabatans', {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        setStatus({
          url: process.env.NEXT_PUBLIC_API_URL || 'Not configured',
          status: response.ok || response.status === 401 ? 'online' : 'offline',
          responseTime,
          error: response.ok || response.status === 401 ? undefined : `HTTP ${response.status}`
        });
      } catch (error: any) {
        setStatus({
          url: process.env.NEXT_PUBLIC_API_URL || 'Not configured',
          status: 'offline',
          responseTime: Date.now() - startTime,
          error: error.message
        });
      }
    };

    checkBackend();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status.status) {
      case 'online': return 'text-green-600 bg-green-50 border-green-200';
      case 'offline': return 'text-red-600 bg-red-50 border-red-200';
      case 'checking': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <div className={`p-3 border rounded-lg ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>{getStatusIcon()}</span>
          <span className="font-medium text-sm">Backend Status</span>
        </div>
        <div className="text-xs">
          {status.responseTime && `${status.responseTime}ms`}
        </div>
      </div>
      
      <div className="mt-2">
        <div className="text-xs font-mono break-all">
          {status.url}
        </div>
        
        {status.error && (
          <div className="text-xs mt-1 opacity-75">
            Error: {status.error}
          </div>
        )}
        
        <div className="text-xs mt-1 opacity-75">
          Status: {status.status.toUpperCase()}
          {status.status === 'online' && ' (API Accessible)'}
        </div>
      </div>
    </div>
  );
}