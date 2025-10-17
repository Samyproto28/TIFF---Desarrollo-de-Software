<template>
  <AppLayout>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Candidatos</h1>
            <p class="mt-2 text-gray-600">
              Gestión de candidatos electorales
            </p>
          </div>
          <Button
            variant="primary"
            @click="navigate.to('/candidatos/create')"
          >
            Nuevo Candidato
          </Button>
        </div>

        <!-- Filters -->
        <Card class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              v-model="filters.provincia_id"
              :options="provinciaOptions"
              placeholder="Filtrar por provincia"
              @change="applyFilters"
            />
            <Select
              v-model="filters.cargo"
              :options="cargoOptions"
              placeholder="Filtrar por cargo"
              @change="applyFilters"
            />
            <Input
              v-model="search"
              placeholder="Buscar por nombre..."
              @input="debouncedSearch"
            />
            <Button variant="outline" @click="resetFilters">
              Limpiar Filtros
            </Button>
          </div>
        </Card>

        <!-- Table -->
        <Card>
          <div class="overflow-x-auto">
            <Table
              :data="candidatos.data"
              :columns="columns"
              :loading="loading"
              @sort="handleSort"
            >
              <template #cell-nombre_completo="{ value, row }">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="row.foto"
                      :src="row.foto"
                      :alt="value"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                    <div
                      v-else
                      class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center"
                    >
                      <span class="text-gray-600 font-medium">
                        {{ value.split(' ').map(n => n[0]).join('') }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ value }}</div>
                    <div class="text-sm text-gray-500">{{ row.lista_alianza || 'Sin lista' }}</div>
                  </div>
                </div>
              </template>

              <template #cell-cargo="{ value }">
                <Badge :variant="value === 'Diputado' ? 'info' : 'secondary'">
                  {{ value }}
                </Badge>
              </template>

              <template #cell-provincia="{ row }">
                {{ row.provincia?.nombre || '-' }}
              </template>

              <template #cell-acciones="{ row }">
                <div class="flex space-x-2">
                  <Button variant="outline" size="sm" @click="navigate.to(`/candidatos/${row.id}`)">
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" @click="navigate.to(`/candidatos/${row.id}/edit`)">
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" @click="confirmarEliminar(row)">
                    Eliminar
                  </Button>
                </div>
              </template>
            </Table>
          </div>

          <!-- Pagination -->
          <div v-if="candidatos.last_page > 1" class="px-6 py-4">
            <Pagination
              :current-page="candidatos.current_page"
              :total-pages="candidatos.last_page"
              :total="candidatos.total"
              :per-page="candidatos.per_page"
              @update:current-page="goToPage"
            />
          </div>
        </Card>

        <!-- Modal de confirmación -->
        <Modal
          :show="mostrarModalEliminar"
          title="Confirmar eliminación"
          @close="mostrarModalEliminar = false"
        >
          <p class="text-sm text-gray-500 mb-4">
            ¿Estás seguro de que deseas eliminar al candidato 
            <strong>{{ candidatoAEliminar?.nombre_completo }}</strong>?
          </p>
          <p class="text-sm text-red-600 mb-4">
            Esta acción no se puede deshacer.
          </p>

          <template #footer>
            <Button
              variant="outline"
              @click="mostrarModalEliminar = false"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              :loading="eliminando"
              @click="eliminarCandidato"
            >
              Eliminar
            </Button>
          </template>
        </Modal>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { router } from '@inertiajs/vue3';
import { useTable, useTableData } from '@/composables/useTable';
import { navigate } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Table from '@/components/ui/Table.vue';
import Modal from '@/components/ui/Modal.vue';
import Pagination from '@/components/ui/Pagination.vue';
import Select from '@/components/ui/Select.vue';
import Input from '@/components/ui/Input.vue';

interface Props {
  candidatos: PaginatedResponse<Candidato>;
  provincias: Provincia[];
}

const props = defineProps<Props>();

// Table setup
const { filters, search, loading, applyFilters, resetFilters, goToPage } = useTable({
  provincia_id: null,
  cargo: null,
});

const { data, updateData } = useTableData<Candidato>();
updateData(props.candidatos);

// Filter options
const provinciaOptions = computed(() => [
  { value: null, label: 'Todas las provincias' },
  ...props.provincias.map(p => ({ value: p.id, label: p.nombre }))
]);

const cargoOptions = [
  { value: null, label: 'Todos los cargos' },
  { value: 'Diputado', label: 'Diputado' },
  { value: 'Senador', label: 'Senador' },
];

// Table columns
const columns = [
  { key: 'nombre_completo', label: 'Candidato', sortable: true },
  { key: 'cargo', label: 'Cargo', sortable: true },
  { key: 'provincia', label: 'Provincia', sortable: true },
  { key: 'created_at', label: 'Fecha de Creación', sortable: true },
  { key: 'acciones', label: 'Acciones', sortable: false },
];

// Modal state
const mostrarModalEliminar = ref(false);
const candidatoAEliminar = ref<Candidato | null>(null);
const eliminando = ref(false);

// Methods
const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      applyFilters({ search: search.value });
    }, 300);
  };
})();

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  applyFilters({ sort_by: column, sort_direction: direction });
};

const confirmarEliminar = (candidato: Candidato) => {
  candidatoAEliminar.value = candidato;
  mostrarModalEliminar.value = true;
};

const eliminarCandidato = () => {
  if (!candidatoAEliminar.value) return;
  
  eliminando.value = true;
  
  router.delete(`/candidatos/${candidatoAEliminar.value.id}`, {
    onSuccess: () => {
      mostrarModalEliminar.value = false;
      candidatoAEliminar.value = null;
    },
    onFinish: () => {
      eliminando.value = false;
    },
  });
};
</script>