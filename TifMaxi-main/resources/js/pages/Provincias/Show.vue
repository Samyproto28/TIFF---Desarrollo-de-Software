<template>
    <AppLayout>
        <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                size="sm"
                                @click="navigate.back()"
                            >
                                ← Volver
                            </Button>
                            <div>
                                <h1 class="text-3xl font-bold text-gray-900">
                                    {{ provincia.nombre }}
                                </h1>
                                <p class="mt-2 text-gray-600">
                                    Información detallada de la provincia
                                </p>
                            </div>
                        </div>
                        <div class="flex space-x-3">
                            <Button
                                variant="outline"
                                @click="navigate.to(`/provincias/${provincia.id}/edit`)"
                            >
                                Editar
                            </Button>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Información de la provincia -->
                    <div class="lg:col-span-1">
                        <Card>
                            <template #header>
                                <h3 class="text-lg font-medium text-gray-900">
                                    Información General
                                </h3>
                            </template>
                            <div class="p-6 space-y-4">
                                <div>
                                    <label class="text-sm font-medium text-gray-500">
                                        Nombre
                                    </label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ provincia.nombre }}
                                    </p>
                                </div>
                                
                                <div v-if="provincia.codigo">
                                    <label class="text-sm font-medium text-gray-500">
                                        Código
                                    </label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        <Badge variant="secondary">
                                            {{ provincia.codigo }}
                                        </Badge>
                                    </p>
                                </div>
                                
                                <div>
                                    <label class="text-sm font-medium text-gray-500">
                                        Fecha de Creación
                                    </label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ formatDate(provincia.created_at) }}
                                    </p>
                                </div>
                                
                                <div v-if="provincia.observaciones">
                                    <label class="text-sm font-medium text-gray-500">
                                        Observaciones
                                    </label>
                                    <p class="mt-1 text-sm text-gray-900">
                                        {{ provincia.observaciones }}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <!-- Estadísticas -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Estadísticas generales -->
                        <Card>
                            <template #header>
                                <h3 class="text-lg font-medium text-gray-900">
                                    Estadísticas
                                </h3>
                            </template>
                            <div class="p-6">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-blue-600">
                                            {{ formatNumber(estadisticas.total_candidatos || 0) }}
                                        </div>
                                        <div class="text-sm text-gray-500">
                                            Candidatos
                                        </div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-green-600">
                                            {{ formatNumber(estadisticas.total_telegramas || 0) }}
                                        </div>
                                        <div class="text-sm text-gray-500">
                                            Telegramas
                                        </div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-purple-600">
                                            {{ formatNumber(estadisticas.total_electores || 0) }}
                                        </div>
                                        <div class="text-sm text-gray-500">
                                            Electores
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <!-- Tabs de contenido -->
                        <Card>
                            <div class="border-b border-gray-200">
                                <nav class="-mb-px flex space-x-8 px-6">
                                    <button
                                        v-for="tab in tabs"
                                        :key="tab.id"
                                        :class="[
                                            'py-4 px-1 border-b-2 font-medium text-sm',
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        ]"
                                        @click="activeTab = tab.id"
                                    >
                                        {{ tab.name }}
                                    </button>
                                </nav>
                            </div>

                            <div class="p-6">
                                <!-- Tab Candidatos -->
                                <div v-if="activeTab === 'candidatos'">
                                    <div v-if="candidatos.data.length > 0" class="space-y-4">
                                        <div
                                            v-for="candidato in candidatos.data"
                                            :key="candidato.id"
                                            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <div class="font-medium text-gray-900">
                                                    {{ candidato.nombre_completo }}
                                                </div>
                                                <div class="text-sm text-gray-500">
                                                    {{ candidato.cargo }}
                                                </div>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <Badge
                                                    :variant="candidato.cargo === 'Diputado' ? 'info' : 'secondary'"
                                                    size="sm"
                                                >
                                                    {{ candidato.cargo }}
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    @click="navigate.to(`/candidatos/${candidato.id}`)"
                                                >
                                                    Ver
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="text-center py-8">
                                        <p class="text-gray-500">
                                            No hay candidatos registrados para esta provincia
                                        </p>
                                    </div>
                                </div>

                                <!-- Tab Telegramas -->
                                <div v-if="activeTab === 'telegramas'">
                                    <div v-if="telegramas.data.length > 0" class="space-y-4">
                                        <div
                                            v-for="telegrama in telegramas.data"
                                            :key="telegrama.id"
                                            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <div class="font-medium text-gray-900">
                                                    {{ telegrama.id_mesa }}
                                                </div>
                                                <div class="text-sm text-gray-500">
                                                    {{ telegrama.circuito_escuela }}
                                                </div>
                                                <div class="text-sm text-gray-500">
                                                    {{ formatNumber(telegrama.total_electores) }} electores
                                                </div>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <Badge
                                                    :variant="getEstadoVariant(telegrama.estado)"
                                                    size="sm"
                                                >
                                                    {{ telegrama.estado }}
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    @click="navigate.to(`/telegramas/${telegrama.id}`)"
                                                >
                                                    Ver
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="text-center py-8">
                                        <p class="text-gray-500">
                                            No hay telegramas registrados para esta provincia
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import { formatDate, formatNumber, navigate } from '@/lib/api';

interface Props {
    provincia: Provincia;
    candidatos: PaginatedResponse<Candidato>;
    telegramas: PaginatedResponse<Telegrama>;
    estadisticas: EstadisticasGenerales;
}

const props = defineProps<Props>();

const activeTab = ref('candidatos');

const tabs = [
    { id: 'candidatos', name: `Candidatos (${props.candidatos.total})` },
    { id: 'telegramas', name: `Telegramas (${props.telegramas.total})` },
];

const getEstadoVariant = (estado: string) => {
    switch (estado) {
        case 'validado':
            return 'success';
        case 'pendiente':
            return 'warning';
        case 'rechazado':
            return 'danger';
        default:
            return 'default';
    }
};
</script>
