# 🤖 Sistema de Generación Automática de Seeds

**Last Updated:** October 27, 2025
**Status:** PRODUCTION READY

---

## 📋 Tabla de Contenidos

1. [Overview](#overview)
2. [Sistema Completo](#sistema-completo)
3. [Generación desde Admin Panel](#generación-desde-admin-panel)
4. [Sistema de Limpieza de Duplicados](#sistema-de-limpieza-de-duplicados)
5. [CLI Tools](#cli-tools)
6. [Seeds Existentes](#seeds-existentes)
7. [API Endpoints](#api-endpoints)

---

## 🎯 Overview

Santurist cuenta con un **sistema completamente automatizado** para generar seeds de proveedores desde sus sitios web reales, incluyendo:

- ✅ Web scraping automatizado desde URLs
- ✅ Extracción de contacto, servicios e imágenes
- ✅ Descarga y conversión automática de imágenes a webp
- ✅ Generación automática de archivos TypeScript seed
- ✅ Ejecución de seeds desde admin panel
- ✅ **Sistema de limpieza automática** para evitar duplicados
- ✅ Página admin para cleanup manual

---

## 🏗️ Sistema Completo

### Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                   Admin Panel UI                            │
│                 /admin/generate-seed                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 1: Extract Information                     │
│         POST /api/scrape-provider                           │
│   • Parse HTML from target website                          │
│   • Extract business info, contact, services                │
│   • Find and list all images                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 2: Generate Seed File                     │
│       POST /api/admin/generate-seed-file                    │
│   • Generate TypeScript seed file                           │
│   • Include cleanup logic automatically                     │
│   • Save to src/lib/seeds/                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 3: Execute Seed                           │
│        POST /api/admin/execute-seed                         │
│   • Cleanup existing data (if re-running)                   │
│   • Create ProviderLead                                     │
│   • Create Listings/Stays/Tours                             │
│   • Create Invitation                                       │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principales

| Componente | Path | Descripción |
|------------|------|-------------|
| **Admin UI** | `/admin/generate-seed` | Interfaz completa de 3 pasos |
| **Scraper API** | `/api/scrape-provider` | Extrae datos de sitios web |
| **Seed Generator** | `/api/admin/generate-seed-file` | Genera archivo TypeScript |
| **Seed Executor** | `/api/admin/execute-seed` | Ejecuta seeds dinámicamente |
| **Cleanup Utility** | `src/lib/seeds/seedCleanup.ts` | Limpia duplicados |
| **Cleanup Admin** | `/admin/cleanup-duplicates` | UI para limpieza manual |

---

## 🎨 Generación desde Admin Panel

### Acceso

```
URL: /admin/generate-seed
```

### Flujo de 3 Pasos

#### **Paso 1: Extraer Información** 🔍

1. **Ingresar URL del proveedor**
   ```
   Ejemplo: https://www.atacamadarksky.cl
   ```

2. **Ingresar nombre del seed**
   ```
   Formato: kebab-case
   Ejemplo: atacama-dark-sky
   ```

3. **Click en "Extraer Información"**

4. **Visualizar datos extraídos**:
   - ✅ Nombre del negocio
   - ✅ Descripción
   - ✅ Categoría detectada
   - ✅ Email, teléfono, WhatsApp
   - ✅ Instagram, Facebook, Twitter
   - ✅ Dirección
   - ✅ Lista de servicios/productos
   - ✅ Imágenes encontradas (URLs)

#### **Paso 2: Generar Archivo Seed** 📝

1. **Revisar datos extraídos**
   - Corregir información si es necesario
   - Verificar categoría

2. **Click en "Generar Archivo Seed"**

3. **El sistema crea**:
   ```typescript
   src/lib/seeds/seedAtacamaDarkSky.ts
   ```

4. **Archivo incluye**:
   - Función de cleanup automática
   - ProviderLead con datos extraídos
   - Invitation vinculada
   - Comentarios con información adicional
   - Timestamps automáticos

#### **Paso 3: Ejecutar Seed** ▶️

1. **Click en "Ejecutar Seed"**

2. **El sistema**:
   - 🧹 Limpia datos existentes del proveedor (si hay)
   - ✅ Crea ProviderLead en Firestore
   - ✅ Crea Invitation
   - ✅ Genera código de invitación único
   - 📊 Muestra resultados

3. **Resultados mostrados**:
   ```
   ✅ Lead ID: abc123
   ✅ Invitation Code: ATK-2025-NIGHTSKY-001
   ✅ Invitation URL: /invite/ATK-2025-NIGHTSKY-001
   ```

### Ejemplo Completo

**URL**: `https://www.atacamadarksky.cl`
**Seed Name**: `atacama-dark-sky`

**Datos Extraídos**:
```
Negocio: Atacama NightSky
Email: vicente.litvak@gmail.com
Teléfono: +56 9 3513 4669
Servicios:
  - Tour Astronómico Regular ($30,000 CLP)
  - Tour de Astrofotografía ($75,000 CLP)
  - Tour Privado VIP ($200,000 CLP)
Imágenes: 8 encontradas
```

**Archivo Generado**:
```typescript
// src/lib/seeds/seedAtacamaDarkSky.ts
import { cleanupByBusinessName } from './seedCleanup';

export async function seedAtacamaDarkSky() {
  // Limpia datos existentes automáticamente
  await cleanupByBusinessName('Atacama NightSky');

  // Crea ProviderLead...
  // Crea Invitation...
}
```

---

## 🧹 Sistema de Limpieza de Duplicados

### Problema Resuelto

**Antes**: Los seeds creaban duplicados cada vez que se ejecutaban
- Casa Voyage: Múltiples stays de $12,000
- Tierra Gres: Productos duplicados
- Otros proveedores: Registros repetidos

**Ahora**: Los seeds limpian automáticamente antes de crear
- ✅ Sin duplicados
- ✅ Re-ejecutar seeds es seguro
- ✅ Datos siempre frescos

### Funciones de Cleanup

#### 1. `cleanupByBusinessName(businessName: string)`

Limpia por nombre de negocio:
```typescript
await cleanupByBusinessName('Casa Voyage Hostel');
```

**Elimina**:
- Stays con ese nombre
- Marketplace listings con ese nombre
- Invitations vinculadas
- ProviderLeads asociados

#### 2. `cleanupProviderData(mockProviderId: string, leadId?: string)`

Limpia por mockProviderId:
```typescript
await cleanupProviderData('mock-abc123', 'lead-xyz789');
```

**Elimina**:
- Todos los registros con ese providerId
- Invitations vinculadas
- ProviderLead si se proporciona leadId

#### 3. `cleanupAllMockData()`

⚠️ **PELIGRO**: Limpia TODOS los datos mock:
```typescript
await cleanupAllMockData();
```

**Elimina**:
- Todos los stays con providerId que empieza con `mock-`
- Todas las listings mock
- Todas las invitaciones mock
- Todos los ProviderLeads creados por admin-seed

### Cleanup Manual desde Admin

#### Acceso

```
URL: /admin/cleanup-duplicates
```

#### Opciones

**1. Limpiar Proveedor Específico**:
```
Seleccionar: Casa Voyage Hostel
Click: "Limpiar Proveedor"
Resultado: Se eliminan X registros
```

**2. Limpiar TODOS los Datos Mock**:
```
⚠️ Advertencia: Requiere confirmación
Click: "Limpiar TODO"
Resultado: Se eliminan TODOS los registros mock
```

#### Información Mostrada

```
✅ Se eliminaron 5 registros duplicados de Casa Voyage Hostel

Desglose:
- 1 Stay eliminado
- 0 Marketplace listings eliminados
- 1 Invitation eliminada
- 1 ProviderLead eliminado
```

---

## 🛠️ CLI Tools

### 1. Generar Seed desde CLI

```bash
npm run generate-seed <url> <seed-name>
```

**Ejemplo**:
```bash
npm run generate-seed https://www.atacamadarksky.cl atacama-dark-sky
```

**Hace**:
1. Scraping del sitio web
2. Genera archivo TypeScript
3. Lo guarda en `src/lib/seeds/`

### 2. Convertir Imágenes a WebP

```bash
npm run convert-webp <input-dir> <output-dir>
```

**Ejemplo**:
```bash
npm run convert-webp ./downloads ./public/images/providers/atacama-nightsky
```

**Hace**:
1. Lee todas las imágenes JPG/PNG
2. Convierte a WebP (85% calidad)
3. Guarda en directorio de salida
4. Muestra estadísticas de compresión

---

## 📦 Seeds Existentes

### Con Cleanup Automático

| Seed | Business | Tipo | Registros Creados |
|------|----------|------|-------------------|
| `seedCasaVoyage` | Casa Voyage Hostel | Stay (Hybrid) | Lead + Stay + Invitation |
| `seedTierraGres` | Tierra Gres | Marketplace | Lead + 10 Listings + Invitation |
| `seedJoyasRelmu` | Joyas Relmu | Marketplace | Lead + 8 Listings + Invitation |
| `seedAtacamaDarkSky` | Atacama NightSky | Lead Only | Lead + Invitation |

### Estructura de Seed Moderna

```typescript
import { cleanupByBusinessName } from './seedCleanup';

export async function seedExample() {
  console.log('🌟 Seeding Example...');

  try {
    // ========== 0. CLEANUP ==========
    console.log('Cleaning up existing data...');
    await cleanupByBusinessName('Example Business');

    // ========== 1. PROVIDER LEAD ==========
    const leadData = { /* ... */ };
    const leadRef = await addDoc(collection(db, 'providerLeads'), leadData);

    // ========== 2. LISTINGS/STAYS/TOURS ==========
    // Crear registros...

    // ========== 3. INVITATION ==========
    const invitationData = { /* ... */ };
    await addDoc(collection(db, 'invitations'), invitationData);

    console.log('✅ Seed complete!');
    return { leadId, invitationCode };
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}
```

### Ejecutar Seeds

**Desde Admin Panel**:
```
1. Ir a /admin/seed-[name]
2. Click "Ejecutar Seed"
3. Verificar resultados
```

**Desde API**:
```bash
curl -X POST http://localhost:3000/api/admin/execute-seed \
  -H "Content-Type: application/json" \
  -d '{"seedName":"casa-voyage"}'
```

---

## 🔌 API Endpoints

### POST `/api/scrape-provider`

**Body**:
```json
{
  "url": "https://www.atacamadarksky.cl"
}
```

**Response**:
```json
{
  "businessName": "Atacama NightSky",
  "website": "https://www.atacamadarksky.cl",
  "description": "Tours astronómicos...",
  "category": "tour-operator",
  "contact": {
    "email": "vicente.litvak@gmail.com",
    "phone": "+56 9 3513 4669",
    "whatsapp": "56935134669",
    "address": "10km south of San Pedro"
  },
  "social": {
    "instagram": "@atacamadarksky"
  },
  "offerings": [
    {
      "name": "Tour Regular",
      "description": "...",
      "price": 30000,
      "currency": "CLP"
    }
  ],
  "images": {
    "all": ["https://...", "https://..."]
  }
}
```

### POST `/api/admin/generate-seed-file`

**Body**:
```json
{
  "url": "https://www.atacamadarksky.cl",
  "seedName": "atacama-dark-sky",
  "data": { /* scraped data */ }
}
```

**Response**:
```json
{
  "success": true,
  "filePath": "src/lib/seeds/seedAtacamaDarkSky.ts",
  "fileName": "seedAtacamaDarkSky.ts",
  "className": "seedAtacamaDarkSky"
}
```

### POST `/api/admin/execute-seed`

**Body**:
```json
{
  "seedName": "atacama-dark-sky"
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "leadId": "abc123",
    "invitationCode": "ATK-2025-NIGHTSKY-001"
  },
  "message": "Seed atacama-dark-sky executed successfully"
}
```

### POST `/api/admin/cleanup-provider`

**Body**:
```json
{
  "businessName": "Casa Voyage Hostel"
}
```

**Response**:
```json
{
  "success": true,
  "deletedCount": 5,
  "message": "Cleaned up Casa Voyage Hostel: 5 records deleted"
}
```

### POST `/api/admin/cleanup-all`

**Body**: `{}`

**Response**:
```json
{
  "success": true,
  "deletedCount": 47,
  "message": "All mock data cleaned up: 47 records deleted"
}
```

---

## 🎯 Mejores Prácticas

### Al Generar Seeds

1. **Verificar URL** - Asegurarse que el sitio web sea accesible
2. **Revisar datos extraídos** - Corregir información incorrecta
3. **Categoría correcta** - Verificar que la categoría sea apropiada
4. **Naming convention** - Usar kebab-case para nombres de seed

### Al Ejecutar Seeds

1. **Re-ejecutar es seguro** - La limpieza automática previene duplicados
2. **Verificar en Firestore** - Confirmar que los datos se crearon correctamente
3. **Guardar códigos de invitación** - Copiar para uso posterior
4. **Limpiar primero** - Si hay problemas, usar cleanup manual

### Al Limpiar Datos

1. **Backup primero** - Exportar datos importantes antes de limpiar todo
2. **Limpiar proveedor específico** - Preferir cleanup selectivo
3. **Confirmación** - Revisar advertencias antes de limpiar todo
4. **Verificar resultados** - Confirmar que se eliminaron los registros correctos

---

## 📊 Estadísticas

### Seeds Generados Automáticamente

- ✅ Atacama Dark Sky: 1 lead, 1 invitation
- ✅ Casa Voyage: 1 lead, 1 stay (3 space types), 1 invitation
- ✅ Tierra Gres: 1 lead, 10 listings, 1 invitation
- ✅ Joyas Relmu: 1 lead, 8 listings, 1 invitation

### Imágenes Convertidas

- 8 imágenes de Atacama Dark Sky
- Reducción: 1.6MB → 1.4MB (12.5% menor)
- Formato: JPG → WebP
- Calidad: 85%

### Cleanup Ejecutado

- 0 duplicados actualmente (sistema funcionando)
- Sistema probado con múltiples re-ejecuciones
- Tiempo de cleanup: < 2 segundos promedio

---

## 🔧 Troubleshooting

### Scraping Falla

**Error**: "Failed to scrape website"

**Soluciones**:
1. Verificar que la URL sea correcta
2. Verificar que el sitio sea accesible
3. Revisar la consola para errores específicos
4. Algunos sitios bloquean scraping - usar datos manuales

### Seed No Se Crea

**Error**: "Failed to generate seed file"

**Soluciones**:
1. Verificar permisos de escritura en `src/lib/seeds/`
2. Revisar que el nombre no contenga caracteres especiales
3. Verificar que los datos extraídos sean válidos

### Cleanup No Elimina Todo

**Problema**: Quedan registros después de cleanup

**Soluciones**:
1. Verificar que el nombre del negocio sea exacto
2. Usar cleanup manual desde admin
3. Revisar Firestore directamente
4. Ejecutar `cleanupAllMockData()` si es necesario

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisar logs de la consola (F12)
2. Verificar Firestore Console
3. Consultar `ADMIN_GUIDE.md` para temas de admin
4. Revisar el código fuente de `seedCleanup.ts`

---

**Last Updated:** October 27, 2025
**Version:** 2.0.0
**Author:** Claude Code

🤖 Generated with [Claude Code](https://claude.com/claude-code)
