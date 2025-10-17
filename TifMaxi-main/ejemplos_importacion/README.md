# EJEMPLOS DE IMPORTACIÓN

Este directorio contiene archivos de ejemplo para importar telegramas al sistema.

## Archivos Disponibles

### 1. telegramas_ejemplo.json
**Formato:** JSON
**Registros:** 10 telegramas
**Provincias:** Buenos Aires, CABA, Córdoba, Santa Fe, Mendoza, Tucumán, Salta

**Uso:**
```bash
curl -X POST http://localhost:8000/api/v1/telegramas/import/file \
  -F "archivo=@telegramas_ejemplo.json" \
  -F "tipo=json"
```

---

### 2. telegramas_ejemplo.csv
**Formato:** CSV
**Registros:** 5 telegramas
**Provincias:** Buenos Aires, CABA, Córdoba, Santa Fe

**Uso:**
```bash
curl -X POST http://localhost:8000/api/v1/telegramas/import/file \
  -F "archivo=@telegramas_ejemplo.csv" \
  -F "tipo=csv"
```

---

## IMPORTANTE

### Antes de Importar

1. **Crear candidatos primero:**
   Estos ejemplos asumen que existen candidatos con IDs 1-14.
   Si no existen, créalos manualmente o ajusta los IDs en los archivos.

2. **Verificar provincias:**
   Ejecuta el seeder de provincias:
   ```bash
   php artisan db:seed --class=ProvinciaSeeder
   ```

3. **IDs de provincias:**
   - 1: Buenos Aires
   - 2: CABA
   - 6: Córdoba
   - 13: Mendoza
   - 17: Salta
   - 21: Santa Fe
   - 24: Tucumán

---

## Crear Candidatos de Ejemplo

### Opción 1: Via API

```bash
# Candidato 1 - Buenos Aires - Diputado
curl -X POST http://localhost:8000/api/v1/candidatos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_completo": "Juan Pérez",
    "cargo": "Diputado",
    "provincia_id": 1,
    "lista_alianza": "Frente para la Victoria"
  }'

# Candidato 2 - Buenos Aires - Diputado
curl -X POST http://localhost:8000/api/v1/candidatos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_completo": "María González",
    "cargo": "Diputado",
    "provincia_id": 1,
    "lista_alianza": "Juntos por el Cambio"
  }'

# Repetir para candidatos 3-14 con diferentes provincias
```

### Opción 2: Via Tinker

```bash
php artisan tinker
```

Luego ejecutar:

```php
use App\Models\{Provincia, Candidato};

// Buenos Aires - Diputados
$ba = Provincia::where('codigo', 'BA')->first();
Candidato::create(['nombre_completo' => 'Juan Pérez', 'cargo' => 'Diputado', 'provincia_id' => $ba->id, 'lista_alianza' => 'Frente para la Victoria']);
Candidato::create(['nombre_completo' => 'María González', 'cargo' => 'Diputado', 'provincia_id' => $ba->id, 'lista_alianza' => 'Juntos por el Cambio']);

// CABA - Diputados
$caba = Provincia::where('codigo', 'CABA')->first();
Candidato::create(['nombre_completo' => 'Carlos Rodríguez', 'cargo' => 'Diputado', 'provincia_id' => $caba->id, 'lista_alianza' => 'Frente para la Victoria']);
Candidato::create(['nombre_completo' => 'Ana Martínez', 'cargo' => 'Diputado', 'provincia_id' => $caba->id, 'lista_alianza' => 'Juntos por el Cambio']);

// Córdoba - Diputados
$cb = Provincia::where('codigo', 'CB')->first();
Candidato::create(['nombre_completo' => 'Luis Fernández', 'cargo' => 'Diputado', 'provincia_id' => $cb->id, 'lista_alianza' => 'Hacemos por Córdoba']);
Candidato::create(['nombre_completo' => 'Laura Sánchez', 'cargo' => 'Diputado', 'provincia_id' => $cb->id, 'lista_alianza' => 'Juntos por el Cambio']);

// Santa Fe - Diputados
$sf = Provincia::where('codigo', 'SF')->first();
Candidato::create(['nombre_completo' => 'Roberto Díaz', 'cargo' => 'Diputado', 'provincia_id' => $sf->id, 'lista_alianza' => 'Frente Progresista']);
Candidato::create(['nombre_completo' => 'Patricia López', 'cargo' => 'Diputado', 'provincia_id' => $sf->id, 'lista_alianza' => 'Juntos por el Cambio']);

// Mendoza - Diputados
$mz = Provincia::where('codigo', 'MZ')->first();
Candidato::create(['nombre_completo' => 'Marcelo Torres', 'cargo' => 'Diputado', 'provincia_id' => $mz->id, 'lista_alianza' => 'Frente Cambia Mendoza']);
Candidato::create(['nombre_completo' => 'Gabriela Ruiz', 'cargo' => 'Diputado', 'provincia_id' => $mz->id, 'lista_alianza' => 'Frente de Todos']);

// Tucumán - Diputados
$tu = Provincia::where('codigo', 'TU')->first();
Candidato::create(['nombre_completo' => 'Jorge Herrera', 'cargo' => 'Diputado', 'provincia_id' => $tu->id, 'lista_alianza' => 'Frente de Todos']);
Candidato::create(['nombre_completo' => 'Silvia Castro', 'cargo' => 'Diputado', 'provincia_id' => $tu->id, 'lista_alianza' => 'Juntos por el Cambio']);

// Salta - Diputados
$sa = Provincia::where('codigo', 'SA')->first();
Candidato::create(['nombre_completo' => 'Diego Romero', 'cargo' => 'Diputado', 'provincia_id' => $sa->id, 'lista_alianza' => 'Frente de Todos']);
Candidato::create(['nombre_completo' => 'Claudia Morales', 'cargo' => 'Diputado', 'provincia_id' => $sa->id, 'lista_alianza' => 'Juntos por el Cambio']);

echo "Candidatos creados!\n";
exit;
```

---

## Flujo Completo de Importación

### 1. Verificar Provincias
```bash
curl http://localhost:8000/api/v1/provincias
```

### 2. Crear Candidatos
Usar cualquiera de las opciones anteriores.

### 3. Verificar Candidatos
```bash
curl http://localhost:8000/api/v1/candidatos
```

### 4. Importar Telegramas
```bash
# JSON
curl -X POST http://localhost:8000/api/v1/telegramas/import/file \
  -F "archivo=@telegramas_ejemplo.json" \
  -F "tipo=json"

# O CSV
curl -X POST http://localhost:8000/api/v1/telegramas/import/file \
  -F "archivo=@telegramas_ejemplo.csv" \
  -F "tipo=csv"
```

### 5. Verificar Importación
```bash
# Listar telegramas
curl http://localhost:8000/api/v1/telegramas

# Ver estadísticas
curl http://localhost:8000/api/v1/telegramas/stats/general

# Ver ranking
curl "http://localhost:8000/api/v1/candidatos/ranking/list?cargo=Diputado"
```

---

## Formato de los Archivos

### JSON
```json
{
  "id_mesa": "BA-001-2025",
  "provincia_id": 1,
  "circuito_escuela": "Escuela Primaria N° 5",
  "total_electores": 500,
  "total_votos": 450,
  "votos_blanco": 20,
  "votos_nulos": 10,
  "votos_impugnados": 5,
  "candidatos": [
    {"candidato_id": 1, "votos": 200},
    {"candidato_id": 2, "votos": 215}
  ]
}
```

### CSV
```csv
id_mesa,provincia_id,circuito_escuela,total_electores,total_votos,votos_blanco,votos_nulos,votos_impugnados,candidatos
BA-001-2025,1,Escuela N° 5,500,450,20,10,5,"[{""candidato_id"":1,""votos"":200},{""candidato_id"":2,""votos"":215}]"
```

**Notas CSV:**
- El campo `candidatos` debe ser un JSON string
- Las comillas dobles dentro del JSON deben escaparse: `""`
- El JSON completo debe estar entre comillas dobles

---

## Errores Comunes

### Error: "El candidato con ID X no existe"

**Solución:** Crear el candidato primero o ajustar los IDs en el archivo.

### Error: "Ya existe un telegrama con este ID de mesa"

**Solución:** Cambiar el `id_mesa` a un valor único.

### Error: "La suma de votos no coincide con el total"

**Solución:** Verificar que:
```
suma(votos_candidatos) + votos_blanco + votos_nulos + votos_impugnados = total_votos
```

### Error: "El total de votos excede el total de electores"

**Solución:** Verificar que:
```
total_votos ≤ total_electores
```

---

## Personalizar los Ejemplos

### Agregar más candidatos a un telegrama

**JSON:**
```json
"candidatos": [
  {"candidato_id": 1, "votos": 150},
  {"candidato_id": 2, "votos": 180},
  {"candidato_id": 3, "votos": 85}
]
```

**CSV:**
```csv
"[{""candidato_id"":1,""votos"":150},{""candidato_id"":2,""votos"":180},{""candidato_id"":3,""votos"":85}]"
```

### Cambiar provincia

Ajustar `provincia_id` según la provincia deseada:
- 1: Buenos Aires
- 2: CABA
- 3: Catamarca
- 4: Chaco
- 5: Chubut
- 6: Córdoba
- ... (ver todas en `/api/v1/provincias`)

---

## Validaciones Automáticas

Al importar, cada telegrama se valida automáticamente:

1. **Suma de votos correcta**
2. **Total votos ≤ electores**
3. **ID mesa único**
4. **Candidatos válidos**
5. **Provincia válida**

Si un telegrama falla validación:
- Se registra el error
- Los demás continúan procesándose
- Se retorna resumen con exitosos/fallidos

---

## Soporte

Para más información:
- Ver documentación completa en `/ARQUITECTURA_ELECTORAL.md`
- Ejemplos de uso en `/EJEMPLOS_USO.md`
- Guía rápida en `/QUICK_START.md`
