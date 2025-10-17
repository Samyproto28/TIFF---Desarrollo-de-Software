'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Provincia } from '@/types';
import { ProvinciaForm } from '@/components/forms/ProvinciaForm';
import { Button } from '@/components/ui/Button';

export default function CreateProvinciaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = (provincia: Provincia) => {
    router.push('/provincias');
  };

  const handleCancel = () => {
    router.push('/provincias');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/provincias">
          <Button variant="ghost" size="sm">
            ← Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Provincia</h1>
          <p className="mt-1 text-sm text-gray-600">
            Crea una nueva provincia para el sistema electoral
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Información de la Provincia</h2>
        </div>
        <div className="px-6 py-6">
          <ProvinciaForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}