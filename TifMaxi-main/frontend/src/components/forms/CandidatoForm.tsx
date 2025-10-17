'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Candidato, CreateCandidatoRequest, UpdateCandidatoRequest, Cargo } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { candidatosService } from '@/lib/api';
import { provinciasService } from '@/lib/api';

interface CandidatoFormProps {
  candidato?: Candidato;
  onSuccess: (candidato: Candidato) => void;
  onCancel: () => void;
}

export function CandidatoForm({ candidato, onSuccess, onCancel }: CandidatoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [loadingProvincias, setLoadingProvincias] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateCandidatoRequest>({
    defaultValues: {
      nombre_completo: candidato?.nombre_completo || '',
      cargo: candidato?.cargo || 'Diputado',
      provincia_id: candidato?.provincia_id || '',
      lista_alianza: candidato?.lista_alianza || '',
      observaciones: candidato?.observaciones || '',
      activo: candidato?.activo ?? true,
    },
  });

  const selectedCargo = watch('cargo');

  useEffect(() => {
    const loadProvincias = async () => {
      try {
        setLoadingProvincias(true);
        const response = await provinciasService.getProvincias({ per_page: 100 });
        setProvincias(response.data.filter((p: any) => p.activo));
      } catch (err) {
        console.error('Error loading provincias:', err);
      } finally {
        setLoadingProvincias(false);
      }
    };

    loadProvincias();
  }, []);

  useEffect(() => {
    if (candidato) {
      reset({
        nombre_completo: candidato.nombre_completo,
        cargo: candidato.cargo,
        provincia_id: candidato.provincia_id,
        lista_alianza: candidato.lista_alianza,
        observaciones: candidato.observaciones,
        activo: candidato.activo,
      });
    }
  }, [candidato, reset]);

  const onSubmit = async (data: CreateCandidatoRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      let result: Candidato;
      
      if (candidato) {
        result = await candidatosService.updateCandidato(candidato.id, data as UpdateCandidatoRequest);
      } else {
        result = await candidatosService.createCandidato(data);
      }
      
      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar candidato');
    } finally {
      setIsLoading(false);
    }
  };

  const cargoOptions: { value: Cargo; label: string }[] = [
    { value: 'Diputado', label: 'Diputado' },
    { value: 'Senador', label: 'Senador' },
  ];

  const provinciaOptions = provincias.map((provincia) => ({
    value: provincia.id,
    label: provincia.nombre,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nombre Completo"
          {...register('nombre_completo', {
            required: 'El nombre es requerido',
            minLength: {
              value: 5,
              message: 'El nombre debe tener al menos 5 caracteres',
            },
          })}
          error={errors.nombre_completo?.message}
          placeholder="Ej: Juan Pérez"
        />

        <Select
          label="Cargo"
          {...register('cargo', { required: 'El cargo es requerido' })}
          error={errors.cargo?.message}
          options={cargoOptions}
          value={selectedCargo}
          onChange={(e) => setValue('cargo', e.target.value as Cargo)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Provincia"
          {...register('provincia_id', { 
            required: 'La provincia es requerida',
            valueAsNumber: true,
          })}
          error={errors.provincia_id?.message}
          options={provinciaOptions}
          placeholder="Seleccionar provincia"
          disabled={loadingProvincias}
        />

        <Input
          label="Lista/Alianza"
          {...register('lista_alianza', {
            required: 'La lista/alianza es requerida',
          })}
          error={errors.lista_alianza?.message}
          placeholder="Ej: Frente de Todos"
        />
      </div>

      <Input
        label="Observaciones"
        {...register('observaciones')}
        error={errors.observaciones?.message}
        placeholder="Información adicional sobre el candidato"
        multiline
        rows={3}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="activo"
          {...register('activo')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
          Candidato activo
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
          {candidato ? 'Actualizar' : 'Crear'} Candidato
        </Button>
      </div>
    </form>
  );
}