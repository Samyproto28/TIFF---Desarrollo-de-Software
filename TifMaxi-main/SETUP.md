# TifMaxi - Guía de Instalación y Ejecución

Esta guía te ayudará a configurar y ejecutar el sistema electoral TifMaxi.

---

## Requisitos Previos

### Backend
- **PHP**: 8.2 o superior
- **Composer**: Última versión
- **MySQL**: 8.0 o superior
- **Laravel**: 12

### Frontend
- **Node.js**: 18.x o superior
- **npm**: 9.x o superior

---

## Paso 1: Configuración del Backend (Laravel)

### 1.1 Instalar Dependencias
```bash
cd TifMaxi-main
composer install
```

### 1.2 Configurar Variables de Entorno
```bash
cp .env.example .env
```

Edita el archivo `.env` y configura tu base de datos:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tifmaxi
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

### 1.3 Generar Clave de Aplicación
```bash
php artisan key:generate
```

### 1.4 Crear Base de Datos
Crea una base de datos MySQL llamada `tifmaxi`:
```sql
CREATE DATABASE tifmaxi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.5 Ejecutar Migraciones
```bash
php artisan migrate --seed
```

### 1.6 Iniciar Servidor Backend
```bash
php artisan serve
```

El backend estará disponible en: `http://localhost:8000`

---

## Paso 2: Configuración del Frontend (Next.js)

### 2.1 Instalar Dependencias
```bash
cd frontend
npm install
```

**Nota**: Las dependencias críticas ya están incluidas en el `package.json` corregido:
- zustand
- clsx
- tailwind-merge
- react-hook-form

### 2.2 Configurar Variables de Entorno

El archivo `.env.local` ya ha sido creado con la siguiente configuración:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=TifMaxi
NODE_ENV=development
```

Si necesitas modificar la URL del backend, edita este archivo.

### 2.3 Iniciar Servidor Frontend
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

---

## Paso 3: Acceso al Sistema

### 3.1 Crear Usuario Administrador

Si ejecutaste las migraciones con `--seed`, deberías tener un usuario de prueba. Si no, puedes crear uno manualmente en la base de datos o mediante el registro en la aplicación.

### 3.2 Login

1. Abre tu navegador en `http://localhost:3000`
2. Serás redirigido automáticamente a `/login`
3. Ingresa tus credenciales
4. Accederás al Dashboard principal

---

## Comandos Útiles

### Backend (Laravel)
```bash
# Ver rutas disponibles
php artisan route:list

# Limpiar caché
php artisan cache:clear
php artisan config:clear

# Crear nueva migración
php artisan make:migration nombre_migracion

# Revertir última migración
php artisan migrate:rollback
```

### Frontend (Next.js)
```bash
# Modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar versión de producción
npm start

# Linter
npm run lint
```

---

## Solución de Problemas Comunes

### Error: "Module not found"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "CORS Policy"
Verifica que el backend tenga configurado CORS correctamente en `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3000'],
```

### Error: "Token Expired"
Limpia las cookies del navegador o usa modo incógnito.

### Error de Conexión a Base de Datos
Verifica que MySQL esté corriendo:
```bash
# En sistemas Unix/Linux
sudo systemctl status mysql

# En Windows
services.msc  # Buscar MySQL
```

---

## Estructura del Proyecto

```
TifMaxi-main/
├── app/                    # Backend Laravel
├── database/
│   ├── migrations/        # Migraciones de base de datos
│   └── seeders/           # Datos de prueba
├── routes/                # Rutas de API
└── frontend/
    ├── src/
    │   ├── app/           # Páginas Next.js
    │   ├── components/    # Componentes React
    │   ├── lib/           # Servicios y utilidades
    │   └── hooks/         # React Hooks personalizados
    └── public/            # Archivos estáticos
```

---

## Funcionalidades Implementadas

- ✅ Sistema de autenticación con JWT
- ✅ Gestión de provincias
- ✅ Gestión de candidatos
- ✅ Gestión de telegramas
- ✅ Dashboard con estadísticas
- ✅ Middleware de autenticación
- ✅ Validación de formularios
- ✅ Paginación de tablas
- ✅ Diseño responsive

---

## Desarrollo

### Para contribuir al proyecto:

1. Crea una rama feature:
```bash
git checkout -b feature/nombre-feature
```

2. Realiza tus cambios y haz commit:
```bash
git add .
git commit -m "Descripción del cambio"
```

3. Push a tu rama:
```bash
git push origin feature/nombre-feature
```

---

## Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.

---

**Fecha de última actualización**: 2025-10-17
