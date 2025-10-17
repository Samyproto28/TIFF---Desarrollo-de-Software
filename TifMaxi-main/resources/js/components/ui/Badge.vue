<template>
    <span :class="badgeClass">
        <slot />
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'md',
    class: '',
});

const badgeClass = computed(() => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';
    
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        secondary: 'bg-gray-600 text-white',
    };
    
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };
    
    return cn(baseClasses, variantClasses[props.variant], sizeClasses[props.size], props.class);
});
</script>
