<template>
  <AppLayout>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Telegramas</h1>
            <p class="mt-2 text-gray-600">
              Gestión de telegramas electorales
            </p>
          </div>
          <div class="flex space-x-3">
            <Button
              variant="outline"
              @click="navigate.to('/telegramas/import')"
            >
              Importar
            </Button>
            <Button
              variant="primary"
              @click="navigate.to('/telegramas/create')"
            >
              Nuevo Telegrama
            </Button>
          </div>
        </div>

        <!-- Filters -->
        <Card class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              v-model="filters.provincia_id"
              :options="provinciaOptions"
              placeholder="Filtrar por provincia"
              @change="applyFilters"
            />
            <Select
              v-model="filters.estado"
              :options="estadoOptions"
              placeholder="Filtrar por estado"
              @change="applyFilters"
            />
            <Input
              v-model="filters.fecha_desde"
              type="date"
              placeholder="Fecha desde"
              @change="applyFilters"
            />
            <Input
              v-model="filters.fecha_hasta"
              type="date"
              placeholder="Fecha hasta"
              @change="applyFilters"
            />
            <Input
              v-model="search"
              placeholder="Buscar por ID mesa..."
              @input="debouncedSearch"
            />
          </div>
          
          <!-- Bulk Actions -->
          <div v-if="selectedTelegramas.length > 0" class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              {{ selectedTelegramas.length }} telegramas seleccionados
            </div>
            <div class="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                @click="bulkValidate"
              >
                Validar Seleccionados
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="bulkReject"
              >
                Rechazar Seleccionados
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="exportSelected"
              >
                Exportar Seleccionados
              </Button>
            </div>
          </div>
        </Card>

        <!-- Table -->
        <Card>
          <div class="overflow-x-auto">
            <Table
              :data="telegramas.data"
              :columns="columns"
              :loading="loading"
              @sort="handleSort"
            >
              <!-- Selection -->
              <template #header-selection>
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="toggleAllSelection"
                />
              </template>

              <template #cell-selection="{ row }">
                <input
                  type="checkbox"
                  :checked="selectedTelegramas.includes(row.id)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  @change="toggleSelection(row.id)"
                />
              </template>

              <!-- ID Mesa -->
              <template #cell-id_mesa="{ value }">
                <span class="font-mono text-sm font-medium text-gray-900">{{ value }}</span>
              </template>

              <!-- Provincia -->
              <template #cell-provincia="{ row }">
                <div class="text-sm text-gray-900">{{ row.provincia?.nombre || '-' }}</div>
              </template>

              <!-- Estado -->
              <template #cell-estado="{ value }">
                <Badge
                  :variant="getEstadoVariant(value)"
                  size="sm"
                >
                  {{ value }}
                </Badge>
              </template>

              <!-- Votos -->
              <template #cell-votos="{ row }">
                <div class="text-sm">
                  <div class="font-medium text-gray-900">{{ row.total_votos }}</div>
                  <div class="text-gray-500">de {{ row.total_electores }} electores</div>
                </div>
              </template>

              <!-- Participación -->
              <template #cell-participacion="{ row }">
                <div class="text-sm">
                  <div class="font-medium text-gray-900">
                    {{ calculateParticipation(row) }}%
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full"
                      :style="{ width: calculateParticipation(row) + '%' }"
                    ></div>
                  </div>
                </div>
              </template>

              <!-- Fecha -->
              <template #cell-fecha_carga="{ value }">
                <div class="text-sm text-gray-900">
                  {{ value ? formatDate(value) : '-' }}
                </div>
              </template>

              <!-- Acciones -->
              <template #cell-acciones="{ row }">
                <div class="flex space-x-2">
                  <Button variant="outline" size="sm" @click="navigate.to(`/telegramas/${row.id}`)">
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" @click="navigate.to(`/telegramas/${row.id}/edit`)">
                    Editar
                  </Button>
                  <Button
                    v-if="row.estado === 'pendiente'"
                    variant="outline"
                    size="sm"
                    @click="validateTelegrama(row)"
                  >
                    Validar
                  </Button>
                  <Button
                    v-if="row.estado === 'pendiente'"
                    variant="outline"
                    size="sm"
                    @click="rejectTelegrama(row)"
                  >
                    Rechazar
                  </Button>
                  <Button variant="danger" size="sm" @click="confirmarEliminar(row)">
                    Eliminar
                  </Button>
                </div>
              </template>
            </Table>
          </div>

          <!-- Pagination -->
          <div v-if="telegramas.last_page > 1" class="px-6 py-4">
            <Pagination
              :current-page="telegramas.current_page"
              :total-pages="telegramas.last_page"
              :total="telegramas.total"
              :per-page="telegramas.per_page"
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
            ¿Estás seguro de que deseas eliminar el telegrama 
            <strong>{{ telegramaAEliminar?.id_mesa }}</strong>?
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
              @click="eliminarTelegrama"
            >
              Eliminar
            </Button>
          </template>
        </Modal>

        <!-- Modal de rechazo -->
        <Modal
          :show="mostrarModalRechazo"
          title="Rechazar Telegrama"
          @close="mostrarModalRechazo = false"
        >
          <div class="space-y-4">
            <div>
              <label for="motivo_rechazo" class="block text-sm font-medium text-gray-700">
                Motivo de rechazo *
              </label>
              <textarea
                id="motivo_rechazo"
                v-model="motivoRechazo"
                rows="4"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describa el motivo del rechazo..."
              ></textarea>
            </div>
          </div>

          <template #footer>
            <Button
              variant="outline"
              @click="mostrarModalRechazo = false"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              :loading="procesandoRechazo"
              @click="confirmarRechazo"
            >
              Rechazar
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
import { navigate, formatDate } from '@/lib/api';
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
  telegramas: PaginatedResponse<Telegrama>;
  provincias: Provincia[];
}

const props = defineProps<Props>();

// Table setup
const { filters, search, loading, applyFilters, resetFilters, goToPage } = useTable({
  provincia_id: null,
  estado: null,
  fecha_desde: '',
  fecha_hasta: '',
});

const { data, updateData } = useTableData<Telegrama>();
updateData(props.telegramas);

// Selection state
const selectedTelegramas = ref<number[]>([]);

// Modal states
const mostrarModalEliminar = ref(false);
const telegramaAEliminar = ref<Telegrama | null>(null);
const eliminando = ref(false);

const mostrarModalRechazo = ref(false);
const telegramaARechazar = ref<Telegrama | null>(null);
const motivoRechazo = ref('');
const procesandoRechazo = ref(false);

// Computed
const allSelected = computed(() => {
  return props.telegramas.data.length > 0 && 
         selectedTelegramas.value.length === props.telegramas.data.length;
});

const someSelected = computed(() => {
  return selectedTelegramas.value.length > 0 && 
         selectedTelegramas.value.length < props.telegramas.data.length;
});

// Filter options
const provinciaOptions = computed(() => [
  { value: null, label: 'Todas las provincias' },
  ...props.provincias.map(p => ({ value: p.id, label: p.nombre }))
]);

const estadoOptions = [
  { value: null, label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'validado', label: 'Validado' },
  { value: 'rechazado', label: 'Rechazado' },
];

// Table columns
const columns = [
  { key: 'selection', label: '', sortable: false, width: '50px' },
  { key: 'id_mesa', label: 'ID Mesa', sortable: true },
  { key: 'provincia', label: 'Provincia', sortable: true },
  { key: 'circuito_escuela', label: 'Circuito/Escuela', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'votos', label: 'Votos', sortable: true },
  { key: 'participacion', label: 'Participación', sortable: true },
  { key: 'fecha_carga', label: 'Fecha de Carga', sortable: true },
  { key: 'acciones', label: 'Acciones', sortable: false },
];

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

const getEstadoVariant = (estado: string) => {
  switch (estado) {
    case 'validado': return 'success';
    case 'pendiente': return 'warning';
    case 'rechazado': return 'danger';
    default: return 'secondary';
  }
};

const calculateParticipation = (telegrama: Telegrama) => {
  if (telegrama.total_electores === 0) return 0;
  return ((telegrama.total_votos / telegrama.total_electores) * 100).toFixed(1);
};

// Selection methods
const toggleAllSelection = () => {
  if (allSelected.value) {
    selectedTelegramas.value = [];
  } else {
    selectedTelegramas.value = props.telegramas.data.map(t => t.id);
  }
};

const toggleSelection = (id: number) => {
  const index = selectedTelegramas.value.indexOf(id);
  if (index > -1) {
    selectedTelegramas.value.splice(index, 1);
  } else {
    selectedTelegramas.value.push(id);
  }
};

// Bulk actions
const bulkValidate = () => {
  if (selectedTelegramas.value.length === 0) return;
  
  router.post('/telegramas/bulk-validate', {
    telegrama_ids: selectedTelegramas.value,
  }, {
    onSuccess: () => {
      selectedTelegramas.value = [];
    },
  });
};

const bulkReject = () => {
  if (selectedTelegramas.value.length === 0) return;
  
  router.post('/telegramas/bulk-reject', {
    telegrama_ids: selectedTelegramas.value,
  }, {
    onSuccess: () => {
      selectedTelegramas.value = [];
    },
  });
};

const exportSelected = () => {
  if (selectedTelegramas.value.length === 0) return;
  
  const params = new URLSearchParams({
    telegrama_ids: selectedTelegramas.value.join(','),
    format: 'csv',
  });
  
  window.open(`/api/v1/telegramas/export/csv?${params}`, '_blank');
};

// Individual actions
const validateTelegrama = (telegrama: Telegrama) => {
  router.post(`/telegramas/${telegrama.id}/validar`);
};

const rejectTelegrama = (telegrama: Telegrama) => {
  telegramaARechazar.value = telegrama;
  motivoRechazo.value = '';
  mostrarModalRechazo.value = true;
};

const confirmarRechazo = () => {
  if (!telegramaARechazar.value || !motivoRechazo.value.trim()) return;
  
  procesandoRechazo.value = true;
  
  router.post(`/telegramas/${telegramaARechazar.value.id}/rechazar`, {
    motivo_rechazo: motivoRechazo.value,
  }, {
    onSuccess: () => {
      mostrarModalRechazo.value = false;
      telegramaARechazar.value = null;
      motivoRechazo.value = '';
    },
    onFinish: () => {
      procesandoRechazo.value = false;
    },
  });
};

const confirmarEliminar = (telegrama: Telegrama) => {
  telegramaAEliminar.value = telegrama;
  mostrarModalEliminar.value = true;
};

const eliminarTelegrama = () => {
  if (!telegramaAEliminar.value) return;
  
  eliminando.value = true;
  
  router.delete(`/telegramas/${telegramaAEliminar.value.id}`, {
    onSuccess: () => {
      mostrarModalEliminar.value = false;
      telegramaAEliminar.value = null;
    },
    onFinish: () => {
      eliminando.value = false;
    },
  });
};
</script>