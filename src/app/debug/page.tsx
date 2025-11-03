'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testJabatanEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/jabatan');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error: any) {
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testProxyEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://axum.synergyinfinity.id/api/jabatans');
      const data = await response.json();
      setDebugInfo({ proxy: data, timestamp: new Date().toISOString() });
    } catch (error: any) {
      setDebugInfo({ proxyError: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Jabatan Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testJabatanEndpoint} disabled={loading}>
              Test Direct Endpoint
            </Button>
            <Button onClick={testProxyEndpoint} disabled={loading}>
              Test Proxy Endpoint
            </Button>
          </div>
          
          {debugInfo && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}