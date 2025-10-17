<template>
    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
                <tr>
                    <th
                        v-for="column in columns"
                        :key="column.key"
                        :class="[
                            'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                            column.class || ''
                        ]"
                        :style="column.width ? `width: ${column.width}` : undefined"
                    >
                        <div class="flex items-center space-x-1">
                            <span>{{ column.label }}</span>
                            <button
                                v-if="column.sortable"
                                :class="[
                                    'flex-shrink-0 h-4 w-4 text-gray-400 hover:text-gray-600',
                                    sortBy === column.key && sortDirection === 'asc' ? 'text-gray-600' : '',
                                    sortBy === column.key && sortDirection === 'desc' ? 'text-gray-600' : ''
                                ]"
                                @click="handleSort(column.key)"
                            >
                                <svg
                                    :class="[
                                        'h-4 w-4 transition-transform',
                                        sortBy === column.key && sortDirection === 'desc' ? 'rotate-180' : ''
                                    ]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                </svg>
                            </button>
                        </div>
                    </th>
                </tr>
            </thead>
            
            <tbody class="bg-white divide-y divide-gray-200">
                <tr
                    v-for="(row, index) in data"
                    :key="getRowKey(row, index)"
                    class="hover:bg-gray-50"
                >
                    <td
                        v-for="column in columns"
                        :key="column.key"
                        :class="[
                            'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                            column.class || ''
                        ]"
                    >
                        <slot
                            :name="`cell-${column.key}`"
                            :row="row"
                            :value="getColumnValue(row, column.key)"
                            :column="column"
                            :index="index"
                        >
                            {{ formatValue(getColumnValue(row, column.key), column) }}
                        </slot>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <div v-if="loading" class="flex justify-center py-8">
            <LoadingSpinner size="lg" />
        </div>
        
        <div v-if="!loading && data.length === 0" class="text-center py-8">
            <p class="text-gray-500">No hay datos disponibles</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';

interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    class?: string;
    formatter?: (value: any) => string;
}

interface Props {
    data: Record<string, any>[];
    columns: TableColumn[];
    loading?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    rowKey?: string | ((row: Record<string, any>) => string | number);
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    sortDirection: 'asc',
    rowKey: 'id',
});

const emit = defineEmits<{
    sort: [column: string];
}>();

const getRowKey = (row: Record<string, any>, index: number): string | number => {
    if (typeof props.rowKey === 'function') {
        return props.rowKey(row);
    }
    return row[props.rowKey] || index;
};

const getColumnValue = (row: Record<string, any>, key: string): any => {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
};

const formatValue = (value: any, column: TableColumn): string => {
    if (column.formatter) {
        return column.formatter(value);
    }
    
    if (value === null || value === undefined) {
        return '';
    }
    
    if (typeof value === 'boolean') {
        return value ? 'Sí' : 'No';
    }
    
    return String(value);
};

const handleSort = (column: string) => {
    emit('sort', column);
};
</script>
