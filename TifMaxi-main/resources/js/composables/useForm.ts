// Composable para manejo de formularios con validación

import { ref, reactive, computed, watch } from 'vue';
import { router } from '@inertiajs/vue3';

interface FormData {
    [key: string]: any;
}

interface FormErrors {
    [key: string]: string[];
}

interface FormOptions {
    resetOnSuccess?: boolean;
    preserveScroll?: boolean;
    preserveState?: boolean;
}

export function useForm<T extends FormData>(
    initialData: T,
    options: FormOptions = {}
) {
    const data = reactive<T>({ ...initialData });
    const errors = ref<FormErrors>({});
    const processing = ref(false);
    const hasErrors = ref(false);
    const recentlySuccessful = ref(false);

    const { resetOnSuccess = true, preserveScroll = false, preserveState = false } = options;

    // Computed para verificar si hay errores
    const hasAnyErrors = computed(() => {
        return Object.keys(errors.value).length > 0;
    });

    // Computed para obtener el primer error
    const firstError = computed(() => {
        const errorKeys = Object.keys(errors.value);
        if (errorKeys.length > 0) {
            return errors.value[errorKeys[0]][0];
        }
        return null;
    });

    // Resetear formulario a datos iniciales
    const reset = (...fields: (keyof T)[]) => {
        if (fields.length === 0) {
            Object.assign(data, initialData);
        } else {
            fields.forEach(field => {
                data[field] = initialData[field];
            });
        }
        clearErrors();
    };

    // Limpiar errores
    const clearErrors = (...fields: (keyof T)[]) => {
        if (fields.length === 0) {
            errors.value = {};
            hasErrors.value = false;
        } else {
            fields.forEach(field => {
                delete errors.value[field as string];
            });
            hasErrors.value = Object.keys(errors.value).length > 0;
        }
    };

    // Establecer errores
    const setError = (field: keyof T, message: string) => {
        if (!errors.value[field as string]) {
            errors.value[field as string] = [];
        }
        errors.value[field as string].push(message);
        hasErrors.value = true;
    };

    // Obtener error de un campo específico
    const getError = (field: keyof T): string | null => {
        const fieldErrors = errors.value[field as string];
        return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
    };

    // Verificar si un campo tiene error
    const hasError = (field: keyof T): boolean => {
        return !!(errors.value[field as string] && errors.value[field as string].length > 0);
    };

    // Procesar formulario con Inertia
    const submit = (
        method: 'get' | 'post' | 'put' | 'patch' | 'delete',
        url: string,
        submitOptions: any = {}
    ) => {
        processing.value = true;
        hasErrors.value = false;
        recentlySuccessful.value = false;

        const options = {
            ...submitOptions,
            preserveScroll,
            preserveState,
            onSuccess: (page: any) => {
                clearErrors();
                recentlySuccessful.value = true;
                
                if (resetOnSuccess) {
                    reset();
                }
                
                // Auto-hide success message after 2 seconds
                setTimeout(() => {
                    recentlySuccessful.value = false;
                }, 2000);
                
                if (submitOptions.onSuccess) {
                    submitOptions.onSuccess(page);
                }
            },
            onError: (errors: FormErrors) => {
                errors.value = errors;
                hasErrors.value = Object.keys(errors).length > 0;
                
                if (submitOptions.onError) {
                    submitOptions.onError(errors);
                }
            },
            onFinish: () => {
                processing.value = false;
                
                if (submitOptions.onFinish) {
                    submitOptions.onFinish();
                }
            },
        };

        router[method](url, data, options);
    };

    // Métodos específicos
    const get = (url: string, options: any = {}) => {
        submit('get', url, options);
    };

    const post = (url: string, options: any = {}) => {
        submit('post', url, options);
    };

    const put = (url: string, options: any = {}) => {
        submit('put', url, options);
    };

    const patch = (url: string, options: any = {}) => {
        submit('patch', url, options);
    };

    const delete: (url: string, options: any) => void = (url: string, options: any = {}) => {
        submit('delete', url, options);
    };

    // Validación en tiempo real
    const validateField = (field: keyof T, rules: ((value: any) => string | null)[]) => {
        const value = data[field];
        clearErrors(field);

        for (const rule of rules) {
            const error = rule(value);
            if (error) {
                setError(field, error);
                break;
            }
        }
    };

    // Watcher para validación automática
    const watchField = (field: keyof T, rules: ((value: any) => string | null)[]) => {
        watch(
            () => data[field],
            () => {
                if (data[field] !== initialData[field]) {
                    validateField(field, rules);
                }
            },
            { deep: true }
        );
    };

    return {
        data,
        errors: errors.value,
        processing: processing.value,
        hasErrors: hasErrors.value,
        hasAnyErrors,
        firstError,
        recentlySuccessful: recentlySuccessful.value,
        
        // Métodos
        reset,
        clearErrors,
        setError,
        getError,
        hasError,
        submit,
        get,
        post,
        put,
        patch,
        delete: delete,
        validateField,
        watchField,
    };
}

// Reglas de validación comunes
export const rules = {
    required: (message: string = 'Este campo es requerido') => 
        (value: any) => {
            if (value === null || value === undefined || value === '') {
                return message;
            }
            return null;
        },
    
    minLength: (min: number, message?: string) => 
        (value: string) => {
            if (value && value.length < min) {
                return message || `Debe tener al menos ${min} caracteres`;
            }
            return null;
        },
    
    maxLength: (max: number, message?: string) => 
        (value: string) => {
            if (value && value.length > max) {
                return message || `No puede tener más de ${max} caracteres`;
            }
            return null;
        },
    
    email: (message: string = 'Debe ser un email válido') => 
        (value: string) => {
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return message;
            }
            return null;
        },
    
    numeric: (message: string = 'Debe ser un número') => 
        (value: any) => {
            if (value && isNaN(Number(value))) {
                return message;
            }
            return null;
        },
    
    min: (min: number, message?: string) => 
        (value: number) => {
            if (value !== null && value !== undefined && value < min) {
                return message || `Debe ser mayor o igual a ${min}`;
            }
            return null;
        },
    
    max: (max: number, message?: string) => 
        (value: number) => {
            if (value !== null && value !== undefined && value > max) {
                return message || `Debe ser menor o igual a ${max}`;
            }
            return null;
        },
};
