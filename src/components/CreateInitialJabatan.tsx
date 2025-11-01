'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { jabatanApi } from '@/lib/api';
import { PlusCircle, Briefcase } from 'lucide-react';

interface CreateInitialJabatanProps {
  onSuccess?: () => void;
}

const initialJabatans = [
  {
    nama_jabatan: 'Manager',
    deskripsi: 'Responsible for managing team and operations'
  },
  {
    nama_jabatan: 'Developer',
    deskripsi: 'Software development and maintenance'
  },
  {
    nama_jabatan: 'Designer',
    deskripsi: 'UI/UX design and visual content creation'
  },
  {
    nama_jabatan: 'Analyst',
    deskripsi: 'Business analysis and data processing'
  },
  {
    nama_jabatan: 'Administrator',
    deskripsi: 'System administration and support'
  }
];

export default function CreateInitialJabatan({ onSuccess }: CreateInitialJabatanProps) {
  const [isCreating, setIsCreating] = useState(false);

  const createInitialData = async () => {
    setIsCreating(true);
    try {
      toast.loading('Creating initial job positions...', { id: 'create-jabatan' });
      
      const results = [];
      for (const jabatan of initialJabatans) {
        try {
          const response = await jabatanApi.create(jabatan);
          if (response.success) {
            results.push({ success: true, name: jabatan.nama_jabatan });
          } else {
            results.push({ success: false, name: jabatan.nama_jabatan, error: response.message });
          }
        } catch (error) {
          results.push({ success: false, name: jabatan.nama_jabatan, error: 'Failed to create' });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} job positions!`, { id: 'create-jabatan' });
        if (onSuccess) {
          onSuccess();
        }
      }
      
      if (failCount > 0) {
        toast.error(`Failed to create ${failCount} job positions`, { id: 'create-jabatan' });
        console.log('Failed creations:', results.filter(r => !r.success));
      }
      
    } catch (error) {
      console.error('Error creating initial jabatan data:', error);
      toast.error('Failed to create initial job positions', { id: 'create-jabatan' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <Briefcase className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>No Job Positions Found</CardTitle>
        <CardDescription>
          It looks like your database doesn't have any job positions yet. 
          Would you like to create some initial job positions to get started?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">This will create the following job positions:</p>
          <ul className="list-disc list-inside space-y-1">
            {initialJabatans.map((jabatan, index) => (
              <li key={index}>
                <strong>{jabatan.nama_jabatan}</strong> - {jabatan.deskripsi}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={createInitialData}
            disabled={isCreating}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            {isCreating ? 'Creating...' : 'Create Initial Job Positions'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}