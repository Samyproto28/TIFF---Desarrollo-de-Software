<template>
    <nav
        v-if="totalPages > 1"
        class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6"
        aria-label="Paginación"
    >
        <div class="hidden sm:block">
            <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ startItem }}</span>
                a
                <span class="font-medium">{{ endItem }}</span>
                de
                <span class="font-medium">{{ total }}</span>
                resultados
            </p>
        </div>
        
        <div class="flex justify-between sm:justify-end">
            <Button
                variant="outline"
                size="sm"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
            >
                Anterior
            </Button>
            
            <div class="hidden sm:flex sm:space-x-1">
                <template v-for="page in visiblePages" :key="page">
                    <Button
                        v-if="typeof page === 'number'"
                        :variant="page === currentPage ? 'primary' : 'outline'"
                        size="sm"
                        @click="goToPage(page)"
                    >
                        {{ page }}
                    </Button>
                    
                    <span
                        v-else
                        class="px-3 py-1 text-sm text-gray-500"
                    >
                        ...
                    </span>
                </template>
            </div>
            
            <Button
                variant="outline"
                size="sm"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
            >
                Siguiente
            </Button>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from './Button.vue';

interface Props {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:currentPage': [page: number];
}>();

const startItem = computed(() => {
    return (props.currentPage - 1) * props.perPage + 1;
});

const endItem = computed(() => {
    return Math.min(props.currentPage * props.perPage, props.total);
});

const visiblePages = computed(() => {
    const pages: (number | string)[] = [];
    const total = props.totalPages;
    const current = props.currentPage;
    
    if (total <= 7) {
        // Si hay 7 páginas o menos, mostrar todas
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        // Siempre mostrar la primera página
        pages.push(1);
        
        if (current > 4) {
            pages.push('...');
        }
        
        // Mostrar páginas alrededor de la actual
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        
        for (let i = start; i <= end; i++) {
            if (i !== 1 && i !== total) {
                pages.push(i);
            }
        }
        
        if (current < total - 3) {
            pages.push('...');
        }
        
        // Siempre mostrar la última página
        if (total > 1) {
            pages.push(total);
        }
    }
    
    return pages;
});

const goToPage = (page: number) => {
    if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
        emit('update:currentPage', page);
    }
};
</script>
