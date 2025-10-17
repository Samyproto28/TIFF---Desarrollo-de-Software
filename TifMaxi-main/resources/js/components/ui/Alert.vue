<template>
    <div
        v-if="show"
        :class="alertClass"
        role="alert"
    >
        <div class="flex">
            <div class="flex-shrink-0">
                <component
                    :is="iconComponent"
                    :class="iconClass"
                    aria-hidden="true"
                />
            </div>
            
            <div class="ml-3">
                <h3
                    v-if="title"
                    :class="titleClass"
                >
                    {{ title }}
                </h3>
                
                <div :class="contentClass">
                    <slot>
                        {{ message }}
                    </slot>
                </div>
            </div>
            
            <div v-if="dismissible" class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                    <button
                        type="button"
                        :class="closeButtonClass"
                        @click="handleDismiss"
                    >
                        <span class="sr-only">Cerrar</span>
                        <svg
                            class="w-5 h-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
    type?: 'success' | 'warning' | 'error' | 'info';
    title?: string;
    message?: string;
    dismissible?: boolean;
    show?: boolean;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'info',
    dismissible: false,
    show: true,
    class: '',
});

const emit = defineEmits<{
    dismiss: [];
}>();

const show = ref(props.show);

const alertClass = computed(() => {
    const baseClasses = 'rounded-md p-4';
    
    const typeClasses = {
        success: 'bg-green-50 border border-green-200',
        warning: 'bg-yellow-50 border border-yellow-200',
        error: 'bg-red-50 border border-red-200',
        info: 'bg-blue-50 border border-blue-200',
    };
    
    return cn(baseClasses, typeClasses[props.type], props.class);
});

const iconComponent = computed(() => {
    const icons = {
        success: 'svg',
        warning: 'svg',
        error: 'svg',
        info: 'svg',
    };
    return icons[props.type];
});

const iconClass = computed(() => {
    const baseClasses = 'h-5 w-5';
    
    const typeClasses = {
        success: 'text-green-400',
        warning: 'text-yellow-400',
        error: 'text-red-400',
        info: 'text-blue-400',
    };
    
    return cn(baseClasses, typeClasses[props.type]);
});

const titleClass = computed(() => {
    const baseClasses = 'text-sm font-medium';
    
    const typeClasses = {
        success: 'text-green-800',
        warning: 'text-yellow-800',
        error: 'text-red-800',
        info: 'text-blue-800',
    };
    
    return cn(baseClasses, typeClasses[props.type]);
});

const contentClass = computed(() => {
    const baseClasses = 'text-sm';
    
    const typeClasses = {
        success: 'text-green-700',
        warning: 'text-yellow-700',
        error: 'text-red-700',
        info: 'text-blue-700',
    };
    
    return cn(baseClasses, typeClasses[props.type]);
});

const closeButtonClass = computed(() => {
    const baseClasses = 'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const typeClasses = {
        success: 'text-green-500 hover:bg-green-100 focus:ring-green-600',
        warning: 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
        error: 'text-red-500 hover:bg-red-100 focus:ring-red-600',
        info: 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600',
    };
    
    return cn(baseClasses, typeClasses[props.type]);
});

const handleDismiss = () => {
    show.value = false;
    emit('dismiss');
};
</script>
