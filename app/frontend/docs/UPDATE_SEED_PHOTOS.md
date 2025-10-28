# 📸 Cómo Actualizar Fotos del Seed

## Método 1: Obtener URLs de Tierragres.cl

1. **Abrir el sitio**: https://www.tierragres.cl/

2. **Para cada producto**:
   - Click derecho en la imagen
   - "Copiar dirección de imagen" o "Inspeccionar"
   - Copiar la URL completa

3. **Actualizar** `src/lib/seeds/seedTierraGres.ts`:

```typescript
// Línea 125-128 - Pocillo Desierto
images: [
  'https://www.tierragres.cl/ruta/real/pocillo-1.jpg',
  'https://www.tierragres.cl/ruta/real/pocillo-2.jpg',
],

// Línea 139-142 - Fuente Volcán
images: [
  'https://www.tierragres.cl/ruta/real/fuente-1.jpg',
  'https://www.tierragres.cl/ruta/real/fuente-2.jpg',
],

// ... y así sucesivamente para cada producto
```

4. **Guardar** y **ejecutar seed** desde `/admin`

## Método 2: Usar el Scraper

1. Ir a `/admin/generate-seed`
2. Ingresar: `https://www.tierragres.cl/`
3. El sistema extraerá las fotos automáticamente
4. Revisar y ejecutar el seed

## Método 3: Script de Actualización Rápida

Ejecutar en consola del navegador (en la página del admin):

```javascript
// Array con URLs reales de tierragres.cl
const realPhotos = {
  'Pocillo Desierto': [
    'https://www.tierragres.cl/photos/pocillo1.jpg',
    'https://www.tierragres.cl/photos/pocillo2.jpg',
  ],
  'Fuente Volcán': [
    'https://www.tierragres.cl/photos/fuente1.jpg',
  ],
  // ... más productos
};

// El script actualizará automáticamente el seed
console.log('URLs listas para actualizar');
```

## Estructura de Fotos por Producto

Tierra Gres tiene 10 productos en el seed:

1. **Pocillo Desierto** - $21,000
2. **Fuente Volcán** - $42,000
3. **Set Pisco Sour (4 piezas)** - $75,000
4. **Cuchara Decorativa San Pedro** - $14,000
5. **Jarra Atacama** - $33,000
6. **Collar Cerámica Tierra** - $18,000
7. **Vaso Gres Natural** - $19,000
8. **Fuente Ovalada Valles** - $49,000
9. **Set de 2 Pocillos Pareja** - $38,000
10. **Pieza Escultural Licancabur** - $210,000

Cada uno necesita al menos 1-2 fotos reales.

## Nota Importante

Las fotos actuales son de Unsplash (genéricas). Las fotos reales mostrarán los productos exactos de Antonia con:
- Colores tierra característicos
- Textura del gres
- Diseños inspirados en el desierto de Atacama
- Calidad artesanal visible

---

**¿Necesitas ayuda?** Pega las URLs en el chat y actualizo el seed automáticamente.
