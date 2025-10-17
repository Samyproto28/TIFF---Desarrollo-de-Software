<template>
    <AppLayout>
        <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Header -->
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Provincias</h1>
                        <p class="mt-2 text-gray-600">
                            Gestionar las 24 provincias argentinas + CABA
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        @click="navigate.to('/provincias/create')"
                    >
                        Nueva Provincia
                    </Button>
                </div>

                <!-- Tabla de provincias -->
                <Card>
                    <div class="overflow-x-auto">
                        <Table
                            :data="provincias.data"
                            :columns="columns"
                            :loading="false"
                        >
                            <template #cell-nombre="{ value, row }">
                                <div class="flex items-center">
                                    <div class="text-sm font-medium text-gray-900">
                                        {{ value }}
                                    </div>
                                    <div v-if="row.codigo" class="ml-2">
                                        <Badge variant="secondary" size="sm">
                                            {{ row.codigo }}
                                        </Badge>
                                    </div>
                                </div>
                            </template>

                            <template #cell-observaciones="{ value }">
                                <div class="text-sm text-gray-500 max-w-xs truncate">
                                    {{ value || '-' }}
                                </div>
                            </template>

                            <template #cell-acciones="{ row }">
                                <div class="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        @click="navigate.to(`/provincias/${row.id}`)"
                                    >
                                        Ver
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        @click="navigate.to(`/provincias/${row.id}/edit`)"
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        @click="confirmarEliminar(row)"
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </template>
                        </Table>
                    </div>

                    <!-- Paginación -->
                    <div v-if="provincias.last_page > 1" class="px-6 py-4">
                        <Pagination
                            :current-page="provincias.current_page"
                            :total-pages="provincias.last_page"
                            :total="provincias.total"
                            :per-page="provincias.per_page"
                            @update:current-page="cambiarPagina"
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
                        ¿Estás seguro de que deseas eliminar la provincia 
                        <strong>{{ provinciaAEliminar?.nombre }}</strong>?
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
                            @click="eliminarProvincia"
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
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Table from '@/components/ui/Table.vue';
import Modal from '@/components/ui/Modal.vue';
import Pagination from '@/components/ui/Pagination.vue';
import { navigate } from '@/lib/api';

interface Props {
    provincias: PaginatedResponse<Provincia>;
}

const props = defineProps<Props>();

const columns = [
    {
        key: 'nombre',
        label: 'Nombre',
        sortable: true,
    },
    {
        key: 'codigo',
        label: 'Código',
        sortable: true,
    },
    {
        key: 'observaciones',
        label: 'Observaciones',
        sortable: false,
    },
    {
        key: 'created_at',
        label: 'Fecha de Creación',
        sortable: true,
        formatter: (value: string) => new Date(value).toLocaleDateString('es-AR'),
    },
    {
        key: 'acciones',
        label: 'Acciones',
        sortable: false,
        width: '200px',
    },
];

const mostrarModalEliminar = ref(false);
const provinciaAEliminar = ref<Provincia | null>(null);
const eliminando = ref(false);

const confirmarEliminar = (provincia: Provincia) => {
    provinciaAEliminar.value = provincia;
    mostrarModalEliminar.value = true;
};

const eliminarProvincia = () => {
    if (!provinciaAEliminar.value) return;
    
    eliminando.value = true;
    
    router.delete(`/provincias/${provinciaAEliminar.value.id}`, {
        onSuccess: () => {
            mostrarModalEliminar.value = false;
            provinciaAEliminar.value = null;
        },
        onFinish: () => {
            eliminando.value = false;
        },
    });
};

const cambiarPagina = (page: number) => {
    router.get('/provincias', {
        page,
        preserveState: true,
        preserveScroll: true,
    });
};
</script>
