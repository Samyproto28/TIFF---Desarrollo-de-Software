'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Provincia, ProvinciaFilters } from '@/types';
import { provinciasService } from '@/lib/api';
import { Table } from '@/components/tables/Table';
import { Pagination } from '@/components/tables/Pagination';
import { Modal } from '@/components/ui/Modal';
import { ProvinciaForm } from '@/components/forms/ProvinciaForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDateTime } from '@/lib/utils';

export default function ProvinciasPage() {
  const router = useRouter();
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProvincia, setSelectedProvincia] = useState<Provincia | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [filters, setFilters] = useState<ProvinciaFilters>({
    page: currentPage,
    per_page: perPage,
  });
  const [sortKey, setSortKey] = useState<keyof Provincia>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadProvincias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: currentPage,
        per_page: perPage,
        sort: String(sortKey),
        order: sortDirection,
      };
      
      const response = await provinciasService.getProvincias(params);
      setProvincias(response.data);
      setCurrentPage(response.current_page);
      setTotalPages(response.last_page);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar provincias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProvincias();
  }, [currentPage, perPage, filters, sortKey, sortDirection]);

  const handleSort = (key: keyof Provincia, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
    }));
    setCurrentPage(1);
  };

  const handleCreateSuccess = (provincia: Provincia) => {
    setIsCreateModalOpen(false);
    loadProvincias();
  };

  const handleEditSuccess = (provincia: Provincia) => {
    setIsEditModalOpen(false);
    setSelectedProvincia(null);
    loadProvincias();
  };

  const handleEdit = (provincia: Provincia) => {
    setSelectedProvincia(provincia);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (provincia: Provincia) => {
    if (!confirm(`¿Está seguro de eliminar la provincia "${provincia.nombre}"?`)) {
      return;
    }

    try {
      setIsDeleting(provincia.id);
      await provinciasService.deleteProvincia(provincia.id);
      loadProvincias();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar provincia');
    } finally {
      setIsDeleting(null);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (value: string) => (
        <Link
          href={`/provincias/${value}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'codigo',
      label: 'Código',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {value}
        </span>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      width: '120px',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Creado',
      sortable: true,
      width: '180px',
      render: (value: string) => formatDateTime(value),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Provincias</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona las provincias del sistema electoral
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Nueva Provincia
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o código..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Table */}
      <Table
        data={provincias}
        columns={columns}
        loading={loading}
        error={error}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
        actions={(provincia) => (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(provincia)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(provincia)}
              loading={isDeleting === provincia.id}
              disabled={isDeleting === provincia.id}
            >
              Eliminar
            </Button>
          </div>
        )}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nueva Provincia"
        size="md"
      >
        <ProvinciaForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProvincia(null);
        }}
        title="Editar Provincia"
        size="md"
      >
        {selectedProvincia && (
          <ProvinciaForm
            provincia={selectedProvincia}
            onSuccess={handleEditSuccess}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedProvincia(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}