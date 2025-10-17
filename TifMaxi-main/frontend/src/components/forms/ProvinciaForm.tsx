'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Provincia, CreateProvinciaRequest, UpdateProvinciaRequest } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { provinciasService } from '@/lib/api';

interface ProvinciaFormProps {
  provincia?: Provincia;
  onSuccess: (provincia: Provincia) => void;
  onCancel: () => void;
}

export function ProvinciaForm({ provincia, onSuccess, onCancel }: ProvinciaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProvinciaRequest>({
    defaultValues: {
      nombre: provincia?.nombre || '',
      codigo: provincia?.codigo || '',
      activo: provincia?.activo ?? true,
    },
  });

  useEffect(() => {
    if (provincia) {
      reset({
        nombre: provincia.nombre,
        codigo: provincia.codigo,
        activo: provincia.activo,
      });
    }
  }, [provincia, reset]);

  const onSubmit = async (data: CreateProvinciaRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      let result: Provincia;
      
      if (provincia) {
        result = await provinciasService.updateProvincia(provincia.id, data as UpdateProvinciaRequest);
      } else {
        result = await provinciasService.createProvincia(data);
      }
      
      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar provincia');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Input
        label="Nombre de la Provincia"
        {...register('nombre', {
          required: 'El nombre es requerido',
          minLength: {
            value: 3,
            message: 'El nombre debe tener al menos 3 caracteres',
          },
        })}
        error={errors.nombre?.message}
        placeholder="Ej: Buenos Aires"
      />

      <Input
        label="Código"
        {...register('codigo', {
          required: 'El código es requerido',
          pattern: {
            value: /^[A-Z]{2,3}$/,
            message: 'El código debe ser 2-3 letras mayúsculas',
          },
        })}
        error={errors.codigo?.message}
        placeholder="Ej: BA"
        onInput={(e) => {
          e.currentTarget.value = e.currentTarget.value.toUpperCase();
        }}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="activo"
          {...register('activo')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
          Provincia activa
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          {provincia ? 'Actualizar' : 'Crear'} Provincia
        </Button>
      </div>
    </form>
  );
}