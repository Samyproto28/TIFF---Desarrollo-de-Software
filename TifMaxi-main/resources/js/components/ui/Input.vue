<template>
    <div class="space-y-1">
        <label
            v-if="label"
            :for="inputId"
            class="block text-sm font-medium text-gray-700"
        >
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>
        
        <input
            :id="inputId"
            :type="type"
            :value="modelValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :required="required"
            :min="min"
            :max="max"
            :step="step"
            :class="inputClass"
            @input="handleInput"
            @blur="handleBlur"
            @focus="handleFocus"
        />
        
        <p
            v-if="error"
            class="text-sm text-red-600"
            role="alert"
        >
            {{ error }}
        </p>
        
        <p
            v-if="help && !error"
            class="text-sm text-gray-500"
        >
            {{ help }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
    modelValue: string | number;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    label?: string;
    placeholder?: string;
    help?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    disabled: false,
    required: false,
    class: '',
});

const emit = defineEmits<{
    'update:modelValue': [value: string | number];
    blur: [event: FocusEvent];
    focus: [event: FocusEvent];
}>();

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`);

const inputClass = computed(() => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors';
    
    const stateClasses = props.error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    
    const disabledClasses = props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white';
    
    return cn(baseClasses, stateClasses, disabledClasses, props.class);
});

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = props.type === 'number' ? Number(target.value) : target.value;
    emit('update:modelValue', value);
};

const handleBlur = (event: FocusEvent) => {
    emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
    emit('focus', event);
};
</script>
