<template>
    <div :class="cardClass">
        <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-200">
            <slot name="header" />
        </div>
        
        <div v-if="$slots.default" :class="contentClass">
            <slot />
        </div>
        
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <slot name="footer" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    padding: 'md',
    class: '',
});

const cardClass = computed(() => {
    const baseClasses = 'bg-white rounded-lg border';
    
    const variantClasses = {
        default: 'border-gray-200 shadow-sm',
        elevated: 'border-gray-200 shadow-md',
        outlined: 'border-gray-300 shadow-none',
    };
    
    return cn(baseClasses, variantClasses[props.variant], props.class);
});

const contentClass = computed(() => {
    const paddingClasses = {
        none: '',
        sm: 'px-4 py-3',
        md: 'px-6 py-4',
        lg: 'px-8 py-6',
    };
    
    return paddingClasses[props.padding];
});
</script>
