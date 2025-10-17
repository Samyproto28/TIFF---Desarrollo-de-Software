<template>
    <div class="space-y-1">
        <label
            v-if="label"
            :for="selectId"
            class="block text-sm font-medium text-gray-700"
        >
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>
        
        <select
            :id="selectId"
            :value="modelValue"
            :disabled="disabled"
            :required="required"
            :class="selectClass"
            @change="handleChange"
            @blur="handleBlur"
            @focus="handleFocus"
        >
            <option
                v-if="placeholder"
                value=""
                disabled
            >
                {{ placeholder }}
            </option>
            
            <option
                v-for="option in options"
                :key="getOptionValue(option)"
                :value="getOptionValue(option)"
            >
                {{ getOptionLabel(option) }}
            </option>
        </select>
        
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

interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface Props {
    modelValue: string | number;
    options: SelectOption[] | string[] | number[];
    label?: string;
    placeholder?: string;
    help?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    optionValue?: string;
    optionLabel?: string;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    required: false,
    optionValue: 'value',
    optionLabel: 'label',
    class: '',
});

const emit = defineEmits<{
    'update:modelValue': [value: string | number];
    change: [event: Event];
    blur: [event: FocusEvent];
    focus: [event: FocusEvent];
}>();

const selectId = ref(`select-${Math.random().toString(36).substr(2, 9)}`);

const selectClass = computed(() => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors';
    
    const stateClasses = props.error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    
    const disabledClasses = props.disabled 
        ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
        : 'bg-white text-gray-900';
    
    return cn(baseClasses, stateClasses, disabledClasses, props.class);
});

const getOptionValue = (option: any): string | number => {
    if (typeof option === 'object' && option !== null) {
        return option[props.optionValue];
    }
    return option;
};

const getOptionLabel = (option: any): string => {
    if (typeof option === 'object' && option !== null) {
        return option[props.optionLabel];
    }
    return String(option);
};

const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    emit('update:modelValue', value);
    emit('change', event);
};

const handleBlur = (event: FocusEvent) => {
    emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
    emit('focus', event);
};
</script>
