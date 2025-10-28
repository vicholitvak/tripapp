# 🔍 Firestore Indexes - Required for Queries

**Last Updated:** October 27, 2025

---

## 📋 Overview

Esta guía documenta todos los índices compuestos necesarios para las queries de Firestore en Santurist.

**Por qué son necesarios**: Firebase requiere índices compuestos cuando:
- Filtras por un campo (`where`) y ordenas por otro (`orderBy`)
- Usas múltiples `where` con operadores de rango (`>`, `<`, `>=`, `<=`, `!=`)
- Ordenas por múltiples campos

---

## 🚀 Instalación Rápida

### Opción 1: Desplegar Automáticamente (Recomendado)

```bash
# Desde la raíz del proyecto frontend
firebase deploy --only firestore:indexes
```

Esto desplegará todos los índices definidos en `firestore.indexes.json`.

### Opción 2: Crear Manualmente

Si prefieres crear los índices uno por uno desde la consola, ve a la sección [Enlaces Rápidos](#enlaces-rápidos) abajo.

---

## 📊 Índices Necesarios

### 1. Marketplace Listings

**Collection**: `marketplaceListings`

**Query**: Obtener listings activos ordenados por rating
```typescript
where('status', '==', 'active')
orderBy('rating', 'desc')
```

**Índice**:
- `status` (ascending)
- `rating` (descending)

**Archivo**: `src/lib/services/marketplaceService.ts:132-137`

---

### 2. Stays - Activos con Featured

**Collection**: `stays`

**Query**: Obtener alojamientos activos ordenados por featured y rating
```typescript
where('status', '==', 'active')
orderBy('featured', 'desc')
orderBy('rating', 'desc')
```

**Índice**:
- `status` (ascending)
- `featured` (descending)
- `rating` (descending)

**Archivo**: `src/lib/services/stayService.ts:63-66`

---

### 3. Stays - Featured Destacados

**Collection**: `stays`

**Query**: Obtener alojamientos destacados
```typescript
where('status', '==', 'active')
where('featured', '==', true)
orderBy('rating', 'desc')
```

**Índice**:
- `status` (ascending)
- `featured` (ascending)
- `rating` (descending)

**Archivo**: `src/lib/services/stayService.ts:463-467`

---

### 4. Stays - Por Proveedor

**Collection**: `stays`

**Query**: Obtener alojamientos de un proveedor específico
```typescript
where('providerId', '==', providerId)
orderBy('createdAt', 'desc')
```

**Índice**:
- `providerId` (ascending)
- `createdAt` (descending)

**Archivo**: `src/lib/services/stayService.ts:482-484`

---

### 5. Tours - Activos por Rating

**Collection**: `tours`

**Query**: Obtener tours activos ordenados por rating
```typescript
where('status', '==', 'active')
orderBy('rating', 'desc')
```

**Índice**:
- `status` (ascending)
- `rating` (descending)

**Archivo**: `src/lib/services/tourService.ts:96-98`

---

### 6. Tours - Por Proveedor

**Collection**: `tours`

**Query**: Obtener tours de un proveedor específico
```typescript
where('providerId', '==', providerId)
orderBy('createdAt', 'desc')
```

**Índice**:
- `providerId` (ascending)
- `createdAt` (descending)

**Archivo**: `src/lib/services/tourService.ts:113-115`

---

### 7. Tour Instances - Disponibilidad

**Collection**: `tourInstances`

**Query**: Obtener instancias futuras de un tour
```typescript
where('tourId', '==', tourId)
where('date', '>=', startDate)
orderBy('date', 'asc')
```

**Índice**:
- `tourId` (ascending)
- `date` (ascending)

**Archivo**: `src/lib/services/tourService.ts:182-185`

---

### 8. Tour Bookings - Por Cliente

**Collection**: `tourBookings`

**Query**: Obtener reservas de un cliente
```typescript
where('customerId', '==', customerId)
orderBy('createdAt', 'desc')
```

**Índice**:
- `customerId` (ascending)
- `createdAt` (descending)

**Archivo**: `src/lib/services/tourService.ts:498-500`

---

### 9. Stay Bookings - Por Alojamiento

**Collection**: `stayBookings`

**Query**: Obtener reservas de un alojamiento
```typescript
where('stayId', '==', stayId)
orderBy('checkIn', 'desc')
```

**Índice**:
- `stayId` (ascending)
- `checkIn` (descending)

**Archivo**: `src/lib/services/stayService.ts:379-381`

---

## 🔗 Enlaces Rápidos

Si Firebase te da un error pidiendo crear un índice, te dará un enlace directo. Estos son los típicos:

### Marketplace
```
https://console.firebase.google.com/v1/r/project/tripapp-8e9dc/firestore/indexes?create_composite=...
```

### Stays
```
https://console.firebase.google.com/v1/r/project/tripapp-8e9dc/firestore/indexes?create_composite=...
```

### Tours
```
https://console.firebase.google.com/v1/r/project/tripapp-8e9dc/firestore/indexes?create_composite=...
```

**Tip**: Cuando veas el error en consola, simplemente click en el enlace que Firebase te proporciona.

---

## 📝 Archivo de Configuración

Los índices están definidos en:
```
app/frontend/firestore.indexes.json
```

Este archivo es compatible con:
```bash
firebase deploy --only firestore:indexes
```

---

## 🛠️ Comandos Útiles

### Ver índices actuales
```bash
firebase firestore:indexes:list
```

### Desplegar índices
```bash
firebase deploy --only firestore:indexes
```

### Ver estado de construcción
Los índices tardan 1-5 minutos en construirse. Puedes ver el progreso en:
```
Firebase Console > Firestore Database > Indexes
```

---

## ⚠️ Notas Importantes

### Índices Automáticos

Firebase crea automáticamente índices simples:
- ✅ Un solo campo con `orderBy`
- ✅ Un solo campo con `where`
- ✅ Equality filters (`==`) en múltiples campos

### Índices Compuestos Necesarios

Necesitas crear manualmente:
- ❌ `where` + `orderBy` en campos diferentes
- ❌ Múltiples `orderBy` en campos diferentes
- ❌ Range filters (`>`, `<`, etc.) + `orderBy`

### Límites de Firebase

- **Máximo**: 200 índices compuestos por proyecto
- **Campos por índice**: Máximo 100 campos
- **Tiempo de construcción**: 1-5 minutos típicamente

---

## 🐛 Troubleshooting

### Error: "The query requires an index"

**Solución**:
1. Copiar el enlace del error
2. Click para abrir Firebase Console
3. Click "Create Index"
4. Esperar 1-2 minutos
5. Recargar la aplicación

### Índice tarda mucho en construirse

**Causas**:
- Mucha data existente
- Firebase está ocupado
- Primera vez creando índices

**Solución**:
- Esperar pacientemente (puede tomar hasta 30 minutos)
- Verificar status en Firebase Console

### Query sigue fallando después de crear índice

**Verificar**:
1. Índice está en estado "Enabled" (no "Building")
2. Campos del índice coinciden exactamente con la query
3. Orden (ascending/descending) es correcto
4. Hard refresh del navegador (Ctrl+F5)

---

## 📊 Monitoreo

### Ver uso de índices

En Firebase Console:
```
Firestore > Usage > Indexes
```

Aquí puedes ver:
- Cuántas queries usan cada índice
- Performance de cada índice
- Índices que nunca se usan (candidatos para eliminar)

---

## 🔄 Mantenimiento

### Agregar un nuevo índice

1. **Detectar la necesidad**:
   - Ejecuta la query
   - Firebase dará error con enlace

2. **Agregar a `firestore.indexes.json`**:
   ```json
   {
     "collectionGroup": "yourCollection",
     "queryScope": "COLLECTION",
     "fields": [
       { "fieldPath": "field1", "order": "ASCENDING" },
       { "fieldPath": "field2", "order": "DESCENDING" }
     ]
   }
   ```

3. **Desplegar**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

4. **Documentar en este archivo**

### Eliminar índices obsoletos

1. Identificar índices sin uso en Firebase Console
2. Eliminar de `firestore.indexes.json`
3. Eliminar manualmente desde Firebase Console

---

## 📞 Referencias

- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Best Practices for Indexing](https://firebase.google.com/docs/firestore/best-practices#index_best_practices)
- [Query Performance Tips](https://firebase.google.com/docs/firestore/query-data/query-cursors)

---

**Last Updated:** October 27, 2025
**Maintained By:** Claude Code

🤖 Generated with [Claude Code](https://claude.com/claude-code)
