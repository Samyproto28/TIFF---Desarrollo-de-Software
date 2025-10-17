// Composable para manejo de tablas con paginación, filtros y ordenamiento

import { ref, reactive, computed, watch } from 'vue';
import { router } from '@inertiajs/vue3';

interface TableFilters {
    [key: string]: any;
}

interface TableOptions {
    perPage?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    preserveScroll?: boolean;
    preserveState?: boolean;
}

export function useTable<T extends TableFilters>(
    initialFilters: T = {} as T,
    options: TableOptions = {}
) {
    const { 
        perPage = 15, 
        sortBy = '', 
        sortDirection = 'asc',
        preserveScroll = true,
        preserveState = true
    } = options;

    const filters = reactive<T>({ ...initialFilters });
    const currentPage = ref(1);
    const itemsPerPage = ref(perPage);
    const sortColumn = ref(sortBy);
    const sortOrder = ref<'asc' | 'desc'>(sortDirection);
    const loading = ref(false);
    const search = ref('');

    // Computed para parámetros de consulta
    const queryParams = computed(() => {
        const params: any = {
            page: currentPage.value,
            per_page: itemsPerPage.value,
        };

        // Agregar filtros
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params[key] = value;
            }
        });

        // Agregar búsqueda
        if (search.value.trim()) {
            params.search = search.value.trim();
        }

        // Agregar ordenamiento
        if (sortColumn.value) {
            params.sort_by = sortColumn.value;
            params.sort_direction = sortOrder.value;
        }

        return params;
    });

    // Resetear filtros
    const resetFilters = () => {
        Object.keys(filters).forEach(key => {
            filters[key as keyof T] = initialFilters[key as keyof T];
        });
        search.value = '';
        currentPage.value = 1;
    };

    // Cambiar página
    const goToPage = (page: number) => {
        currentPage.value = page;
    };

    // Cambiar items por página
    const changePerPage = (perPage: number) => {
        itemsPerPage.value = perPage;
        currentPage.value = 1;
    };

    // Ordenar por columna
    const sort = (column: string) => {
        if (sortColumn.value === column) {
            // Si ya está ordenando por esta columna, cambiar dirección
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
            // Si es una nueva columna, ordenar ascendente
            sortColumn.value = column;
            sortOrder.value = 'asc';
        }
        currentPage.value = 1;
    };

    // Aplicar filtros
    const applyFilters = (newFilters: Partial<T>) => {
        Object.assign(filters, newFilters);
        currentPage.value = 1;
    };

    // Aplicar búsqueda
    const applySearch = (searchTerm: string) => {
        search.value = searchTerm;
        currentPage.value = 1;
    };

    // Cargar datos
    const load = (url: string, options: any = {}) => {
        loading.value = true;

        const requestOptions = {
            ...options,
            preserveScroll,
            preserveState,
            data: queryParams.value,
            onSuccess: (page: any) => {
                loading.value = false;
                if (options.onSuccess) {
                    options.onSuccess(page);
                }
            },
            onError: (errors: any) => {
                loading.value = false;
                if (options.onError) {
                    options.onError(errors);
                }
            },
            onFinish: () => {
                loading.value = false;
                if (options.onFinish) {
                    options.onFinish();
                }
            },
        };

        router.get(url, requestOptions);
    };

    // Exportar datos
    const exportData = (url: string, format: 'csv' | 'json' = 'csv') => {
        const exportUrl = `${url}?${new URLSearchParams({
            ...queryParams.value,
            format,
        }).toString()}`;

        window.open(exportUrl, '_blank');
    };

    // Watcher para recargar cuando cambien los parámetros
    watch(
        [currentPage, itemsPerPage, sortColumn, sortOrder, filters, search],
        () => {
            // Solo recargar si no estamos en el proceso inicial
            if (loading.value === false) {
                // Esta función debe ser sobrescrita por el componente que use el composable
                // ya que necesita saber la URL específica
            }
        },
        { deep: true }
    );

    return {
        // Estado
        filters,
        currentPage,
        itemsPerPage,
        sortColumn,
        sortOrder,
        loading,
        search,
        queryParams,

        // Métodos
        resetFilters,
        goToPage,
        changePerPage,
        sort,
        applyFilters,
        applySearch,
        load,
        exportData,
    };
}

// Composable para manejo de datos de tabla
export function useTableData<T>() {
    const data = ref<T[]>([]);
    const total = ref(0);
    const currentPage = ref(1);
    const lastPage = ref(1);
    const perPage = ref(15);

    const updateData = (response: any) => {
        if (response.data) {
            data.value = response.data;
            total.value = response.total || 0;
            currentPage.value = response.current_page || 1;
            lastPage.value = response.last_page || 1;
            perPage.value = response.per_page || 15;
        }
    };

    const isEmpty = computed(() => data.value.length === 0);
    const hasData = computed(() => data.value.length > 0);
    const startItem = computed(() => (currentPage.value - 1) * perPage.value + 1);
    const endItem = computed(() => Math.min(currentPage.value * perPage.value, total.value));

    return {
        data,
        total,
        currentPage,
        lastPage,
        perPage,
        isEmpty,
        hasData,
        startItem,
        endItem,
        updateData,
    };
}
