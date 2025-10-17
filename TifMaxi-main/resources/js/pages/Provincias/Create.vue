<template>
    <AppLayout>
        <div class="py-6">
            <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            @click="navigate.back()"
                        >
                            ← Volver
                        </Button>
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">Nueva Provincia</h1>
                            <p class="mt-2 text-gray-600">
                                Crear una nueva provincia en el sistema electoral
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Formulario -->
                <Card>
                    <form @submit.prevent="submit">
                        <div class="p-6 space-y-6">
                            <!-- Nombre -->
                            <Input
                                v-model="form.data.nombre"
                                label="Nombre de la Provincia"
                                placeholder="Ej: Buenos Aires"
                                :error="form.getError('nombre')"
                                :required="true"
                                @blur="validarNombre"
                            />

                            <!-- Código -->
                            <Input
                                v-model="form.data.codigo"
                                label="Código (Opcional)"
                                placeholder="Ej: BA"
                                help="Código corto para identificar la provincia"
                                :error="form.getError('codigo')"
                                @blur="validarCodigo"
                            />

                            <!-- Observaciones -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Observaciones
                                </label>
                                <textarea
                                    v-model="form.data.observaciones"
                                    rows="4"
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Información adicional sobre la provincia..."
                                />
                                <p class="mt-1 text-sm text-gray-500">
                                    Campo opcional para información adicional
                                </p>
                            </div>

                            <!-- Mensajes de error -->
                            <Alert
                                v-if="form.firstError"
                                type="error"
                                :message="form.firstError"
                                dismissible
                                @dismiss="form.clearErrors()"
                            />

                            <!-- Mensaje de éxito -->
                            <Alert
                                v-if="form.recentlySuccessful"
                                type="success"
                                message="Provincia creada exitosamente"
                                dismissible
                            />
                        </div>

                        <!-- Footer -->
                        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                @click="navigate.back()"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                :loading="form.processing"
                                :disabled="!esValido"
                            >
                                Crear Provincia
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import Alert from '@/components/ui/Alert.vue';
import { useForm, rules } from '@/composables/useForm';
import { navigate } from '@/lib/api';

const form = useForm({
    nombre: '',
    codigo: '',
    observaciones: '',
});

const esValido = computed(() => {
    return form.data.nombre.trim() !== '';
});

const validarNombre = () => {
    form.validateField('nombre', [
        rules.required('El nombre de la provincia es requerido'),
        rules.minLength(2, 'El nombre debe tener al menos 2 caracteres'),
        rules.maxLength(100, 'El nombre no puede tener más de 100 caracteres'),
    ]);
};

const validarCodigo = () => {
    if (form.data.codigo.trim()) {
        form.validateField('codigo', [
            rules.maxLength(10, 'El código no puede tener más de 10 caracteres'),
        ]);
    }
};

const submit = () => {
    if (!esValido.value) return;
    
    form.post('/provincias', {
        onSuccess: () => {
            navigate.to('/provincias');
        },
    });
};
</script>
