<template>
  <AppLayout>
    <div class="py-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Importar Telegramas</h1>
          <p class="mt-2 text-gray-600">
            Importe telegramas electorales desde archivos CSV o JSON
          </p>
        </div>

        <!-- Progress Steps -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex items-center" :class="currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" 
                     :class="currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'">
                  1
                </div>
                <span class="ml-2 text-sm font-medium">Seleccionar Archivo</span>
              </div>
              <div class="ml-8 flex items-center" :class="currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                     :class="currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'">
                  2
                </div>
                <span class="ml-2 text-sm font-medium">Vista Previa</span>
              </div>
              <div class="ml-8 flex items-center" :class="currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                     :class="currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'">
                  3
                </div>
                <span class="ml-2 text-sm font-medium">Importar</span>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                   :style="{ width: (currentStep / 3 * 100) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Step 1: File Selection -->
        <div v-show="currentStep === 1">
          <Card>
            <div class="space-y-6">
              <!-- File Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-4">
                  Seleccionar archivo de importación
                </label>
                <div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div class="space-y-1 text-center">
                    <div v-if="!selectedFile" class="flex text-sm text-gray-600">
                      <label
                        for="file-upload"
                        class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Subir archivo</span>
                        <input id="file-upload" name="file-upload" type="file" class="sr-only" 
                               accept=".csv,.json" @change="handleFileChange" />
                      </label>
                      <p class="pl-1">o arrastrar y soltar</p>
                    </div>
                    <p class="text-xs text-gray-500">CSV o JSON hasta 10MB</p>
                    <div v-if="selectedFile" class="flex flex-col items-center">
                      <div class="flex items-center space-x-2">
                        <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</span>
                        <span class="text-sm text-gray-500">({{ formatFileSize(selectedFile.size) }})</span>
                      </div>
                      <button
                        type="button"
                        class="mt-2 text-sm text-red-600 hover:text-red-500"
                        @click="removeFile"
                      >
                        Eliminar archivo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Format Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Formato del archivo
                </label>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input
                      v-model="fileFormat"
                      type="radio"
                      value="csv"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">CSV</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="fileFormat"
                      type="radio"
                      value="json"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">JSON</span>
                  </label>
                </div>
              </div>

              <!-- Help Section -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="text-sm font-medium text-blue-800 mb-2">Formato esperado:</h4>
                <div class="text-sm text-blue-700">
                  <p v-if="fileFormat === 'csv'">
                    El archivo CSV debe contener las siguientes columnas:<br>
                    <code class="bg-blue-100 px-1 rounded">id_mesa, provincia_id, circuito_escuela, total_electores, total_votos, votos_blanco, votos_nulos, votos_impugnados</code><br>
                    Opcionalmente puede incluir columnas para cada candidato con el formato: <code class="bg-blue-100 px-1 rounded">candidato_[id]</code>
                  </p>
                  <p v-if="fileFormat === 'json'">
                    El archivo JSON debe ser un array de objetos con la siguiente estructura:<br>
                    <pre class="bg-blue-100 p-2 rounded mt-2 text-xs overflow-x-auto"><code>[
  {
    "id_mesa": "MESA001",
    "provincia_id": 1,
    "circuito_escuela": "Escuela 123",
    "total_electores": 100,
    "total_votos": 80,
    "votos_blanco": 5,
    "votos_nulos": 3,
    "votos_impugnados": 2,
    "candidatos": [
      {"candidato_id": 1, "votos": 35},
      {"candidato_id": 2, "votos": 35}
    ]
  }
]</code></pre>
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-3">
                <Button variant="outline" @click="navigate.to('/telegramas')">
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  @click="nextStep"
                  :disabled="!selectedFile"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <!-- Step 2: Preview -->
        <div v-show="currentStep === 2">
          <Card>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">Vista Previa de Datos</h3>
            </template>

            <div v-if="loadingPreview" class="text-center py-8">
              <LoadingSpinner />
              <p class="mt-2 text-gray-500">Procesando archivo...</p>
            </div>

            <div v-else-if="previewData" class="space-y-6">
              <!-- Summary -->
              <div class="bg-gray-50 p-4 rounded">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">{{ previewData.total_registros }}</div>
                    <div class="text-sm text-gray-500">Total de registros</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">{{ previewData.registros_validos }}</div>
                    <div class="text-sm text-gray-500">Registros válidos</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-red-600">{{ previewData.registros_errores }}</div>
                    <div class="text-sm text-gray-500">Registros con errores</div>
                  </div>
                </div>
              </div>

              <!-- Preview Table -->
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Mesa
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provincia
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Votos
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Errores
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(item, index) in previewData.preview.slice(0, 10)" :key="index">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ item.id_mesa }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ item.provincia_nombre || `ID: ${item.provincia_id}` }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ item.total_votos }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <Badge
                          :variant="item.valido ? 'success' : 'danger'"
                          size="sm"
                        >
                          {{ item.valido ? 'Válido' : 'Error' }}
                        </Badge>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                        {{ item.errores?.join(', ') || '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Errors Summary -->
              <div v-if="previewData.errores.length > 0">
                <h4 class="text-md font-medium text-red-800 mb-3">Errores encontrados:</h4>
                <div class="bg-red-50 border border-red-200 rounded p-4">
                  <ul class="space-y-2">
                    <li v-for="(error, index) in previewData.errores" :key="index" class="flex items-start">
                      <svg class="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm text-red-700">{{ error }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-between">
                <Button variant="outline" @click="previousStep">
                  Anterior
                </Button>
                <div class="flex space-x-3">
                  <Button variant="outline" @click="downloadTemplate">
                    Descargar Plantilla
                  </Button>
                  <Button
                    variant="primary"
                    @click="nextStep"
                    :disabled="previewData.registros_validos === 0"
                  >
                    Importar ({{ previewData.registros_validos }} registros)
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Step 3: Import -->
        <div v-show="currentStep === 3">
          <Card>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">Importación en Progreso</h3>
            </template>

            <div v-if="importing" class="space-y-6">
              <!-- Progress Bar -->
              <div>
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso: {{ importProgress.current }} / {{ importProgress.total }}</span>
                  <span>{{ Math.round((importProgress.current / importProgress.total) * 100) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    :style="{ width: (importProgress.current / importProgress.total) * 100 + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Current Status -->
              <div class="text-center">
                <LoadingSpinner />
                <p class="mt-2 text-gray-500">{{ importStatus }}</p>
              </div>
            </div>

            <!-- Import Results -->
            <div v-else-if="importResults" class="space-y-6">
              <!-- Results Summary -->
              <div class="bg-gray-50 p-4 rounded">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">{{ importResults.exitosos }}</div>
                    <div class="text-sm text-gray-500">Importados exitosamente</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-red-600">{{ importResults.fallidos }}</div>
                    <div class="text-sm text-gray-500">Con errores</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">{{ importResults.total }}</div>
                    <div class="text-sm text-gray-500">Total procesados</div>
                  </div>
                </div>
              </div>

              <!-- Error Details -->
              <div v-if="importResults.errores.length > 0">
                <h4 class="text-md font-medium text-red-800 mb-3">Detalles de errores:</h4>
                <div class="bg-red-50 border border-red-200 rounded p-4 max-h-64 overflow-y-auto">
                  <table class="min-w-full divide-y divide-red-200">
                    <thead class="bg-red-50">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                          Fila
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                          ID Mesa
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-red-50 divide-y divide-red-200">
                      <tr v-for="(error, index) in importResults.errores" :key="index">
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-red-700">
                          {{ error.indice + 1 }}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-red-700">
                          {{ error.id_mesa }}
                        </td>
                        <td class="px-4 py-2 text-sm text-red-700">
                          {{ error.error }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-3">
                <Button variant="outline" @click="resetImport">
                  Nueva Importación
                </Button>
                <Button variant="primary" @click="navigate.to('/telegramas')">
                  Ver Telegramas
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from '@/composables/useForm';
import { navigate } from '@/lib/api';
import { api } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

interface Props {
  provincias: Provincia[];
  candidatos: Candidato[];
}

const props = defineProps<Props>();

// State
const currentStep = ref(1);
const selectedFile = ref<File | null>(null);
const fileFormat = ref<'csv' | 'json'>('csv');
const loadingPreview = ref(false);
const importing = ref(false);
const importStatus = ref('');
const previewData = ref<any>(null);
const importResults = ref<any>(null);
const importProgress = ref({ current: 0, total: 0 });

// Methods
const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }
    
    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'csv' && extension !== 'json') {
      alert('El archivo debe ser CSV o JSON.');
      return;
    }
    
    selectedFile.value = file;
    fileFormat.value = extension as 'csv' | 'json';
  }
};

const removeFile = () => {
  selectedFile.value = null;
  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const nextStep = async () => {
  if (currentStep.value === 1) {
    await loadPreview();
  } else if (currentStep.value === 2) {
    await startImport();
  }
};

const previousStep = () => {
  currentStep.value--;
};

const loadPreview = async () => {
  if (!selectedFile.value) return;
  
  loadingPreview.value = true;
  currentStep.value = 2;
  
  try {
    const formData = new FormData();
    formData.append('archivo', selectedFile.value);
    formData.append('formato', fileFormat.value);
    formData.append('preview', '1');
    
    const response = await api.post('/telegramas/import/preview', formData);
    previewData.value = response.data;
  } catch (error: any) {
    console.error('Error loading preview:', error);
    alert('Error al procesar el archivo: ' + (error.response?.data?.message || error.message));
    currentStep.value = 1;
  } finally {
    loadingPreview.value = false;
  }
};

const startImport = async () => {
  if (!selectedFile.value || !previewData.value) return;
  
  importing.value = true;
  currentStep.value = 3;
  importStatus.value = 'Iniciando importación...';
  importProgress.value = { current: 0, total: previewData.value.registros_validos };
  
  try {
    const formData = new FormData();
    formData.append('archivo', selectedFile.value);
    formData.append('formato', fileFormat.value);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      if (importProgress.value.current < importProgress.value.total) {
        importProgress.value.current++;
        importStatus.value = `Importando telegrama ${importProgress.value.current} de ${importProgress.value.total}...`;
      }
    }, 100);
    
    const response = await api.post('/telegramas/import/file', formData);
    
    clearInterval(progressInterval);
    importProgress.value.current = importProgress.value.total;
    importStatus.value = 'Importación completada';
    importResults.value = response.data;
  } catch (error: any) {
    console.error('Error importing:', error);
    alert('Error al importar: ' + (error.response?.data?.message || error.message));
  } finally {
    importing.value = false;
  }
};

const downloadTemplate = () => {
  const url = fileFormat.value === 'csv' 
    ? '/api/v1/telegramas/template/csv'
    : '/api/v1/telegramas/template/json';
  
  window.open(url, '_blank');
};

const resetImport = () => {
  currentStep.value = 1;
  selectedFile.value = null;
  previewData.value = null;
  importResults.value = null;
  importProgress.value = { current: 0, total: 0 };
  
  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};
</script>