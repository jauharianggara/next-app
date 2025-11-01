'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { jabatanApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface InitialDataSetupProps {
  onDataCreated: () => void;
}

export const InitialDataSetup: React.FC<InitialDataSetupProps> = ({ onDataCreated }) => {
  const [loading, setLoading] = useState(false);

  const createInitialJabatan = async () => {
    setLoading(true);
    
    const initialJabatans = [
      {
        nama_jabatan: 'Manager',
        deskripsi: 'Responsible for team management and strategic planning'
      },
      {
        nama_jabatan: 'Senior Developer',
        deskripsi: 'Senior software developer with advanced technical skills'
      },
      {
        nama_jabatan: 'Junior Developer',
        deskripsi: 'Entry-level developer learning and growing technical skills'
      },
      {
        nama_jabatan: 'HR Specialist',
        deskripsi: 'Human resources specialist handling recruitment and employee relations'
      },
      {
        nama_jabatan: 'Sales Executive',
        deskripsi: 'Responsible for sales activities and client relationships'
      }
    ];

    try {
      for (const jabatan of initialJabatans) {
        await jabatanApi.create(jabatan);
      }
      toast.success('Initial job positions created successfully!');
      onDataCreated();
    } catch (error) {
      console.error('Error creating initial jabatan:', error);
      toast.error('Failed to create initial job positions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Setup Initial Data</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">
          No job positions found. Would you like to create some initial job positions to get started?
        </p>
        <Button 
          onClick={createInitialJabatan} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create Initial Job Positions'}
        </Button>
      </CardContent>
    </Card>
  );
};