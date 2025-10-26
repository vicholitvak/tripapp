# 🏪 Guía de Seed Data del Marketplace

## Descripción General

Se han creado datos mock realistas para el marketplace con dos proveedores artesanales:
- **Cerámica Gress Atacama**: 6 productos de cerámica artesanal
- **Orfebrería Atacama Auténtica**: 7 productos de joyería en plata 925

## 🚀 Cómo Usar

### 1. Acceder a la Página de Seed (Admin Only)

```
http://localhost:3000/admin/seed-marketplace
```

**Nota:** Solo usuarios con rol `admin` pueden acceder. Debes estar logueado como administrador.

### 2. Cargar los Datos

Haz clic en el botón **"Cargar Datos Mock"** en la página de seed.

- ✅ Se cargarán 13 productos automáticamente en Firestore
- ✅ Cada producto incluye: imagen, descripción, precio, stock, ratings
- ✅ Los datos se crean con timestamps automáticos

### 3. Verificar en el Marketplace

Una vez cargados, ve a:
```
http://localhost:3000/marketplace
```

Deberías ver todos los productos listos para navegar y agregar al carrito.

---

## 📦 Contenido del Seed Data

### 🏺 Cerámica Gress Atacama

| Producto | Precio | Stock | Rating |
|----------|--------|-------|--------|
| Macetero Diseño Tribal | $45,000 | 15 | 4.8 ⭐ |
| Plato Decorativo Motivos Andinos | $32,000 | 20 | 4.9 ⭐ |
| Jarra de Cerámica Artesanal | $38,000 | 10 | 4.7 ⭐ |
| Taza Personalizada | $18,000 | 50 | 4.6 ⭐ |
| Set de 3 Cuencos | $55,000 | 8 | 4.9 ⭐ |
| Espejo Marco Artesanal | $72,000 | 5 | 4.8 ⭐ |

**Total Cerámica:** $260,000 CLP

---

### 💎 Orfebrería Atacama Auténtica

| Producto | Precio | Stock | Rating |
|----------|--------|-------|--------|
| Collar Plata - Piedra de Luna | $95,000 | 8 | 4.9 ⭐ |
| Anillo Diseño Étnico | $55,000 | 12 | 4.8 ⭐ |
| Pulsera Plata - Turquesa Natural | $120,000 | 6 | 5.0 ⭐ |
| Aretes Forma Gota | $42,000 | 20 | 4.7 ⭐ |
| Diadema Coronita Artesanal | $185,000 | 3 | 4.9 ⭐ |
| Conjunto Collar + Aretes | $160,000 | 5 | 4.9 ⭐ |
| Broche Diseño Cactus | $38,000 | 15 | 4.6 ⭐ |

**Total Joyería:** $695,000 CLP

---

## 🔄 Gestión de Datos

### Limpiar Todos los Datos

Si deseas empezar de cero:

```
1. Ve a /admin/seed-marketplace
2. Haz clic en el botón "Limpiar Todo" 🗑️
3. Confirma la acción
```

**⚠️ Advertencia:** Esta acción es irreversible y eliminará TODOS los productos del marketplace.

### Recargar Datos

Para recargar los datos después de limpiar:
1. Haz clic nuevamente en "Cargar Datos Mock"

---

## 📋 Detalles Técnicos

### Archivos Creados

```
src/lib/seeds/
├── marketplaceSeed.ts          # Definición de datos mock
└── seedMarketplace.ts           # Funciones para cargar/limpiar

src/app/admin/
└── seed-marketplace/
    └── page.tsx                # UI para gestionar seed
```

### Funciones Disponibles

**En `seedMarketplace.ts`:**

```typescript
// Cargar todos los datos
await seedMarketplace()
// Returns: { addedCount: 13, failedCount: 0 }

// Limpiar todos los listings
await clearMarketplace()
// Returns: number (cantidad eliminada)

// Obtener solo cerámica
const ceramica = await getCeramicaListings()

// Obtener solo joyería
const joyeria = await getJoyeriaListings()

// Obtener estadísticas
const stats = getSeedStats()
// Returns: { ceramicaCount, joyeriaCount, totalListings, totalRevenue, providers }
```

---

## 🧪 Flujo de Prueba Completo

### 1. Preparar Datos
```
1. Acceder a /admin/seed-marketplace
2. Hacer clic en "Cargar Datos Mock"
3. Esperar confirmación ✅
```

### 2. Explorar Marketplace
```
1. Ir a /marketplace
2. Ver lista de productos con:
   - Imágenes
   - Precios en CLP
   - Ratings y reviews
   - Información de stock
```

### 3. Filtrar Productos
```
- Por categoría (Cerámica, Joyería)
- Por rango de precio
- Por rating mínimo
- Búsqueda de texto
```

### 4. Agregar al Carrito
```
1. Click en "Agregar al carrito"
2. Ver contador en header
3. Ir a /marketplace/cart
```

### 5. Checkout (Sin pago real)
```
1. Ver carrito agrupado por proveedor
2. Ingresar datos de envío
3. Proceder a checkout
4. (Será redirigido a Mercado Pago en producción)
```

---

## 🎨 Características de los Datos

Cada producto incluye:

✅ **Información Básica**
- Nombre descriptivo
- Descripción detallada
- Precio en CLP
- Imágenes (URLs de Unsplash)

✅ **Metadata**
- Stock disponible
- Peso y dimensiones
- Costo de envío
- Información de categoría

✅ **Ratings y Reviews**
- Calificación promedio (4.6-5.0)
- Número de reviews (3-42)

✅ **Información de Producto**
- Para cerámica: peso, dimensiones, costo de envío
- Para joyería: peso, dimensiones ajustables, costo de envío mínimo

---

## 📝 Notas

### Imágenes
- Todas las imágenes vienen de Unsplash (públicamente disponibles)
- Para producción, considera reemplazar con imágenes reales

### Precios
- Todos los precios están en CLP (Pesos Chilenos)
- Son realistas para artesanías locales de San Pedro de Atacama
- Para testing, usa estos valores sin cambios

### Proveedores
- Los IDs de proveedores (`ceramica-gress-atacama`, `orfeberia-atacama-autentica`) son únicos
- En la UI aparecerán agrupados automáticamente

### Firebase
- Los datos se crean con `Timestamp.now()` automáticamente
- Se establecen `createdAt` y `updatedAt` con timestamps del servidor
- Status por defecto es `active` para que aparezcan en búsquedas

---

## 🐛 Troubleshooting

### No veo la página de seed
**Solución:** Debes estar logueado como admin. Verifica tu rol en el usuario.

### Los datos no se cargan
**Solución:**
- Verifica que Firestore esté configurado correctamente en `.env.local`
- Revisa la consola del navegador para errores
- Intenta limpiar y recargar

### Los precios se ven incorrectos
**Solución:**
- Los precios están en CLP (Pesos Chilenos)
- Verifica que `currency: 'CLP'` en los datos
- Usa `toLocaleString('es-CL')` para mostrar correctamente

### Algunas imágenes no carga
**Solución:**
- Las URLs vienen de Unsplash (dominio público)
- Si Unsplash tiene problemas, intenta más tarde
- Para producción, usa imágenes propias en Firebase Storage

---

## ✨ Próximos Pasos

- [ ] Crear página de admin para crear/editar productos manualmente
- [ ] Implementar carga de imágenes a Firebase Storage
- [ ] Crear proveedores reales en la base de datos
- [ ] Agregar formulario de listado para nuevos proveedores
- [ ] Implementar webhook de Mercado Pago

---

## 📞 Soporte

Para preguntas sobre los datos mock o el seed:
- Revisa `marketplaceSeed.ts` para ver detalles de cada producto
- Revisa `seedMarketplace.ts` para ver cómo se cargan los datos
- Revisa `/admin/seed-marketplace` para ver la UI de gestión
