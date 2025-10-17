<template>
    <AppLayout>
        <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Dashboard Electoral</h1>
                    <p class="mt-2 text-gray-600">
                        Resumen general del sistema electoral en tiempo real
                    </p>
                </div>

                <!-- Tarjetas de estadísticas -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">
                                            Total Telegramas
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900">
                                            {{ formatNumber(estadisticas.total_telegramas) }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">
                                            Validados
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900">
                                            {{ formatNumber(estadisticas.telegramas_validados) }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                                        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">
                                            Pendientes
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900">
                                            {{ formatNumber(estadisticas.telegramas_pendientes) }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                                        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">
                                            Rechazados
                                        </dt>
                                        <dd class="text-lg font-medium text-gray-900">
                                            {{ formatNumber(estadisticas.telegramas_rechazados) }}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <!-- Estadísticas adicionales -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <!-- Participación electoral -->
                    <Card>
                        <template #header>
                            <h3 class="text-lg font-medium text-gray-900">Participación Electoral</h3>
                        </template>
                        <div class="p-6">
                            <div class="text-center">
                                <div class="text-3xl font-bold text-blue-600">
                                    {{ formatPercentage(estadisticas.porcentaje_participacion) }}
                                </div>
                                <p class="text-sm text-gray-500 mt-2">
                                    {{ formatNumber(estadisticas.total_votos) }} votos de {{ formatNumber(estadisticas.total_electores) }} electores
                                </p>
                            </div>
                        </div>
                    </Card>

                    <!-- Votos especiales -->
                    <Card>
                        <template #header>
                            <h3 class="text-lg font-medium text-gray-900">Votos Especiales</h3>
                        </template>
                        <div class="p-6 space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">En Blanco</span>
                                <span class="font-medium">{{ formatNumber(estadisticas.total_votos_blanco) }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Nulos</span>
                                <span class="font-medium">{{ formatNumber(estadisticas.total_votos_nulos) }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">Impugnados</span>
                                <span class="font-medium">{{ formatNumber(estadisticas.total_votos_impugnados) }}</span>
                            </div>
                        </div>
                    </Card>

                    <!-- Acciones rápidas -->
                    <Card>
                        <template #header>
                            <h3 class="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
                        </template>
                        <div class="p-6 space-y-3">
                            <Button
                                variant="primary"
                                size="sm"
                                class="w-full"
                                @click="navigate.to('/telegramas/create')"
                            >
                                Nuevo Telegrama
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                class="w-full"
                                @click="navigate.to('/telegramas/import')"
                            >
                                Importar Masivo
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                class="w-full"
                                @click="navigate.to('/candidatos/create')"
                            >
                                Nuevo Candidato
                            </Button>
                        </div>
                    </Card>
                </div>

                <!-- Ranking de candidatos -->
                <Card>
                    <template #header>
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-medium text-gray-900">Ranking de Candidatos</h3>
                            <div class="flex space-x-2">
                                <Button
                                    :variant="filtroCargo === '' ? 'primary' : 'outline'"
                                    size="sm"
                                    @click="filtroCargo = ''"
                                >
                                    Todos
                                </Button>
                                <Button
                                    :variant="filtroCargo === 'Diputado' ? 'primary' : 'outline'"
                                    size="sm"
                                    @click="filtroCargo = 'Diputado'"
                                >
                                    Diputados
                                </Button>
                                <Button
                                    :variant="filtroCargo === 'Senador' ? 'primary' : 'outline'"
                                    size="sm"
                                    @click="filtroCargo = 'Senador'"
                                >
                                    Senadores
                                </Button>
                            </div>
                        </div>
                    </template>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Posición
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Candidato
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cargo
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Provincia
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lista/Alianza
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Votos
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Porcentaje
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr
                                    v-for="(candidato, index) in candidatosFiltrados"
                                    :key="candidato.id"
                                    class="hover:bg-gray-50"
                                >
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{{ index + 1 }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ candidato.nombre_completo }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <Badge
                                            :variant="candidato.cargo === 'Diputado' ? 'info' : 'secondary'"
                                            size="sm"
                                        >
                                            {{ candidato.cargo }}
                                        </Badge>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ candidato.provincia }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ candidato.lista_alianza || '-' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {{ formatNumber(candidato.total_votos) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ formatPercentage(candidato.porcentaje) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div v-if="candidatosFiltrados.length === 0" class="text-center py-8">
                            <p class="text-gray-500">No hay candidatos disponibles</p>
                        </div>
                    </div>
                </Card>
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
import { formatNumber, formatPercentage } from '@/lib/api';
import { navigate } from '@/lib/api';

interface Props {
    estadisticas: EstadisticasGenerales;
    rankingCandidatos: RankingCandidato[];
}

const props = defineProps<Props>();

const filtroCargo = ref<string>('');

const candidatosFiltrados = computed(() => {
    if (!filtroCargo.value) {
        return props.rankingCandidatos.slice(0, 10);
    }
    
    return props.rankingCandidatos
        .filter(candidato => candidato.cargo === filtroCargo.value)
        .slice(0, 10);
});
</script>
