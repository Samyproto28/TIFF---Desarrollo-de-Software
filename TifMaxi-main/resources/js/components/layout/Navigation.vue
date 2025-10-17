<template>
    <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <!-- Logo y título -->
                <div class="flex items-center">
                    <Link
                        href="/"
                        class="flex-shrink-0 flex items-center"
                    >
                        <div class="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center">
                            <svg
                                class="h-5 w-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <span class="ml-2 text-xl font-semibold text-gray-900">
                            Sistema Electoral
                        </span>
                    </Link>
                </div>
                
                <!-- Navegación principal -->
                <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                        v-for="item in navigationItems"
                        :key="item.name"
                        :href="item.href"
                        :class="[
                            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200',
                            isActive(item.href)
                                ? 'border-blue-500 text-gray-900'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        ]"
                    >
                        <component
                            :is="item.icon"
                            class="mr-2 h-4 w-4"
                            aria-hidden="true"
                        />
                        {{ item.name }}
                    </Link>
                </div>
                
                <!-- Botón móvil -->
                <div class="sm:hidden flex items-center">
                    <button
                        type="button"
                        class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        @click="toggleMobileMenu"
                    >
                        <span class="sr-only">Abrir menú principal</span>
                        <svg
                            :class="[
                                'h-6 w-6 transition-transform',
                                mobileMenuOpen ? 'rotate-90' : ''
                            ]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Menú móvil -->
        <div v-if="mobileMenuOpen" class="sm:hidden">
            <div class="pt-2 pb-3 space-y-1">
                <Link
                    v-for="item in navigationItems"
                    :key="item.name"
                    :href="item.href"
                    :class="[
                        'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200',
                        isActive(item.href)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    ]"
                    @click="closeMobileMenu"
                >
                    <div class="flex items-center">
                        <component
                            :is="item.icon"
                            class="mr-3 h-5 w-5"
                            aria-hidden="true"
                        />
                        {{ item.name }}
                    </div>
                </Link>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import { usePage } from '@inertiajs/vue3';

interface NavigationItem {
    name: string;
    href: string;
    icon: any;
}

const page = usePage();

const mobileMenuOpen = ref(false);

const navigationItems: NavigationItem[] = [
    {
        name: 'Dashboard',
        href: '/',
        icon: {
            template: `
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            `,
        },
    },
    {
        name: 'Provincias',
        href: '/provincias',
        icon: {
            template: `
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            `,
        },
    },
    {
        name: 'Candidatos',
        href: '/candidatos',
        icon: {
            template: `
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            `,
        },
    },
    {
        name: 'Telegramas',
        href: '/telegramas',
        icon: {
            template: `
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            `,
        },
    },
    {
        name: 'Reportes',
        href: '/reportes',
        icon: {
            template: `
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            `,
        },
    },
];

const isActive = (href: string): boolean => {
    const currentUrl = page.url;
    
    if (href === '/') {
        return currentUrl === '/';
    }
    
    return currentUrl.startsWith(href);
};

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
    mobileMenuOpen.value = false;
};
</script>
