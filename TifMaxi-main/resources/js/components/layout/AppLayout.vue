<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Navegación -->
        <Navigation />
        
        <!-- Contenido principal -->
        <main>
            <slot />
        </main>
        
        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200">
            <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-500">
                        Sistema Electoral de Carga y Conteo de Comicios
                    </div>
                    <div class="text-sm text-gray-500">
                        Laravel 12 + Vue 3 + Inertia.js
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import Navigation from './Navigation.vue';
</script>
