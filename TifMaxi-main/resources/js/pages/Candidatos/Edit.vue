<template>
  <AppLayout>
    <div class="py-6">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Editar Candidato</h1>
          <p class="mt-2 text-gray-600">Modifique los datos del candidato</p>
        </div>

        <!-- Form -->
        <Card>
          <form @submit.prevent="submit">
            <div class="space-y-6">
              <!-- Nombre Completo -->
              <div>
                <label for="nombre_completo" class="block text-sm font-medium text-gray-700">
                  Nombre Completo *
                </label>
                <Input
                  id="nombre_completo"
                  v-model="form.nombre_completo"
                  type="text"
                  :error="form.getError('nombre_completo')"
                  @blur="validateField('nombre_completo')"
                />
              </div>

              <!-- Cargo -->
              <div>
                <label for="cargo" class="block text-sm font-medium text-gray-700">
                  Cargo *
                </label>
                <Select
                  id="cargo"
                  v-model="form.cargo"
                  :options="cargoOptions"
                  :error="form.getError('cargo')"
                  @change="validateField('cargo')"
                />
              </div>

              <!-- Provincia -->
              <div>
                <label for="provincia_id" class="block text-sm font-medium text-gray-700">
                  Provincia *
                </label>
                <Select
                  id="provincia_id"
                  v-model="form.provincia_id"
                  :options="provinciaOptions"
                  :error="form.getError('provincia_id')"
                  @change="validateField('provincia_id')"
                />
              </div>

              <!-- Lista/Alianza -->
              <div>
                <label for="lista_alianza" class="block text-sm font-medium text-gray-700">
                  Lista / Alianza
                </label>
                <Input
                  id="lista_alianza"
                  v-model="form.lista_alianza"
                  type="text"
                  placeholder="Opcional"
                />
              </div>

              <!-- Foto -->
              <div>
                <label for="foto" class="block text-sm font-medium text-gray-700">
                  Foto del Candidato
                </label>
                <!-- Current photo -->
                <div v-if="candidato.foto && !newPhoto" class="mb-4">
                  <p class="text-sm text-gray-500 mb-2">Foto actual:</p>
                  <div class="flex items-center space-x-4">
                    <img :src="candidato.foto" alt="Foto actual" class="h-20 w-20 object-cover rounded-full" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      @click="removeCurrentPhoto"
                    >
                      Eliminar foto actual
                    </Button>
                  </div>
                </div>

                <!-- New photo upload -->
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div class="space-y-1 text-center">
                    <div v-if="!previewUrl" class="flex text-sm text-gray-600">
                      <label
                        for="foto"
                        class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>{{ candidato.foto ? 'Cambiar archivo' : 'Subir archivo' }}</span>
                        <input id="foto" name="foto" type="file" class="sr-only" accept="image/*" @change="handleFileChange" />
                      </label>
                      <p class="pl-1">o arrastrar y soltar</p>
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                    <div v-if="previewUrl" class="flex flex-col items-center">
                      <img :src="previewUrl" alt="Preview" class="h-32 w-32 object-cover rounded-full" />
                      <button
                        type="button"
                        class="mt-2 text-sm text-red-600 hover:text-red-500"
                        @click="removeNewPhoto"
                      >
                        Cancelar nueva foto
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Observaciones -->
              <div>
                <label for="observaciones" class="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  v-model="form.observaciones"
                  rows="3"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas adicionales..."
                ></textarea>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex justify-end space-x-3">
              <Button variant="outline" @click="navigate.to('/candidatos')">
                Cancelar
              </Button>
              <Button type="submit" variant="primary" :loading="form.processing">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useForm } from '@/composables/useForm';
import { navigate } from '@/lib/api';
import { rules } from '@/composables/useForm';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Select from '@/components/ui/Select.vue';

interface Props {
  candidato: Candidato;
  provincias: Provincia[];
}

const props = defineProps<Props>();

// Form setup - initialize with candidato data
const initialForm = {
  nombre_completo: props.candidato.nombre_completo,
  cargo: props.candidato.cargo,
  provincia_id: props.candidato.provincia_id,
  lista_alianza: props.candidato.lista_alianza || '',
  observaciones: props.candidato.observaciones || '',
};

const form = useForm(initialForm, {
  resetOnSuccess: false,
});

// Photo handling
const photoFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const newPhoto = ref(false);
const removePhotoFlag = ref(false);

const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('El archivo debe ser una imagen.');
      return;
    }
    
    photoFile.value = file;
    newPhoto.value = true;
    removePhotoFlag.value = false;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removeCurrentPhoto = () => {
  removePhotoFlag.value = true;
  photoFile.value = null;
  newPhoto.value = false;
  previewUrl.value = null;
  
  // Reset file input
  const fileInput = document.getElementById('foto') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const removeNewPhoto = () => {
  photoFile.value = null;
  newPhoto.value = false;
  previewUrl.value = null;
  
  // Reset file input
  const fileInput = document.getElementById('foto') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

// Validation
const validateField = (field: string) => {
  const fieldRules = {
    nombre_completo: [rules.required('El nombre es requerido'), rules.minLength(3, 'El nombre debe tener al menos 3 caracteres')],
    cargo: [rules.required('El cargo es requerido')],
    provincia_id: [rules.required('La provincia es requerida')],
  };

  if (fieldRules[field as keyof typeof fieldRules]) {
    form.validateField(field, fieldRules[field as keyof typeof fieldRules]);
  }
};

// Options
const cargoOptions = [
  { value: 'Diputado', label: 'Diputado' },
  { value: 'Senador', label: 'Senador' },
];

const provinciaOptions = computed(() =>
  props.provincias.map(p => ({ value: p.id, label: p.nombre }))
);

// Submit
const submit = () => {
  const formData = new FormData();
  
  // Add form fields
  Object.entries(form.data).forEach(([key, value]) => {
    if (value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });
  
  // Add method for PUT
  formData.append('_method', 'PUT');
  
  // Add new photo if exists
  if (photoFile.value && newPhoto.value) {
    formData.append('foto', photoFile.value);
  }
  
  // Add remove photo flag
  if (removePhotoFlag.value) {
    formData.append('remove_foto', '1');
  }

  form.post(`/candidatos/${props.candidato.id}`, {
    data: formData,
    onSuccess: () => {
      navigate.to('/candidatos');
    },
  });
};
</script>