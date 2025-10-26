# 🏗️ Propuesta de Taxonomía Unificada - Santurist

## Filosofía del Sistema
- **Categorías Base**: Siempre presentes, organizan el contenido principal
- **Categorías Dinámicas**: Los proveedores pueden crear nuevas según demanda
- **Etiquetas/Tags**: Filtros cruzados (horario, dificultad, ocasión)
- **Atributos Especiales**: Metadata específica por tipo de servicio

---

## 📦 MARKETPLACE - "Qué Llevar a Casa"

### Categorías Base (Siempre visibles)
```typescript
{
  value: 'naturales',
  label: 'Productos Naturales & Orgánicos',
  icon: '🌿',
  description: 'Plantas medicinales, hierbas, productos orgánicos, miel, quinoa'
},
{
  value: 'joyeria',
  label: 'Joyería Artesanal',
  icon: '💎',
  description: 'Collares, anillos, pulseras con piedras chilenas'
},
{
  value: 'ceramica',
  label: 'Cerámica Atacameña',
  icon: '🏺',
  description: 'Vasijas, platos, decoración de cerámica'
},
{
  value: 'textiles',
  label: 'Textiles Andinos',
  icon: '🧶',
  description: 'Mantas, bufandas, ropa de alpaca'
},
{
  value: 'licores',
  label: 'Licores Locales',
  icon: '🍷',
  description: 'Vinos, pisco, licores artesanales'
},
{
  value: 'artesania',
  label: 'Artesanía General',
  icon: '🎨',
  description: 'Souvenirs, arte, decoración'
}
```

### Tags Opcionales
- `organico`, `vegano`, `hecho_a_mano`, `certificado`

---

## 🍽️ EAT - "Dónde Comer" (Sistema Mixto)

### Categorías Base (Siempre visibles)
```typescript
{
  value: 'chilena',
  label: 'Comida Chilena',
  icon: '🇨🇱',
  subcategories: ['empanadas', 'cazuela', 'pastel_choclo', 'completos']
},
{
  value: 'internacional',
  label: 'Internacional',
  icon: '🌎',
  subcategories: [] // Se pueden agregar: sushi, pizza, hamburguesas, italiana, etc.
},
{
  value: 'vegetariana',
  label: 'Vegetariana & Vegana',
  icon: '🥗'
},
{
  value: 'premium',
  label: 'Premium & Gourmet',
  icon: '⭐'
}
```

### Categorías Dinámicas (Creadas por proveedores)
```typescript
// Los proveedores pueden agregar:
- 'sushi' → 'Sushi & Comida Japonesa' 🍣
- 'pizzas' → 'Pizzería' 🍕
- 'hamburguesas' → 'Hamburguesas' 🍔
- 'italiana' → 'Comida Italiana' 🍝
- 'mexicana' → 'Comida Mexicana' 🌮
- 'asiatica' → 'Comida Asiática' 🥢
- 'postres' → 'Postres & Café' 🍰
```

### Etiquetas por Horario/Ocasión
```typescript
schedule_tags: [
  'desayuno',      // 7am-11am
  'almuerzo',      // 12pm-3pm
  'once',          // 4pm-7pm (merienda chilena)
  'cena',          // 7pm-11pm
  'bajon',         // 11pm-4am (comida nocturna)
  'madrugada',     // 4am-7am (para turistas que van a géisers)
]
```

### Atributos Especiales
- `delivery_time`: tiempo estimado de entrega
- `min_order`: pedido mínimo
- `accepts_late_orders`: acepta pedidos nocturnos

---

## 🏔️ TOURS - "Qué Hacer & Explorar"

### Categorías Base
```typescript
{
  value: 'astronomico',
  label: 'Tour Astronómico',
  icon: '🌌',
  typical_duration: 'noche',
  difficulty: 'fácil'
},
{
  value: 'geisers_tatio',
  label: 'Géisers del Tatio',
  icon: '🌋',
  typical_duration: 'medio_dia',
  difficulty: 'moderado',
  schedule: 'madrugada' // Salida 4am
},
{
  value: 'lagunas_altiplanicas',
  label: 'Lagunas Altiplánicas',
  icon: '🏔️',
  typical_duration: 'dia_completo',
  difficulty: 'moderado'
},
{
  value: 'valle_luna_muerte',
  label: 'Valle de la Luna/Muerte',
  icon: '🌙',
  typical_duration: 'medio_dia',
  difficulty: 'fácil'
},
{
  value: 'salar_atacama',
  label: 'Salar de Atacama & Lagunas',
  icon: '🧂',
  typical_duration: 'dia_completo',
  difficulty: 'fácil'
},
{
  value: 'arqueologico',
  label: 'Arqueológico (Tulor, Pukará)',
  icon: '🏛️',
  typical_duration: 'medio_dia',
  difficulty: 'fácil'
},
{
  value: 'trekking_aventura',
  label: 'Trekking & Aventura',
  icon: '🥾',
  typical_duration: 'variable',
  difficulty: 'difícil'
},
{
  value: 'termas',
  label: 'Termas de Puritama',
  icon: '♨️',
  typical_duration: 'medio_dia',
  difficulty: 'fácil'
},
{
  value: 'piedras_rojas',
  label: 'Piedras Rojas',
  icon: '🏜️',
  typical_duration: 'dia_completo',
  difficulty: 'moderado'
},
{
  value: 'sandboarding',
  label: 'Sandboarding',
  icon: '🏂',
  typical_duration: 'medio_dia',
  difficulty: 'moderado'
},
{
  value: 'sonoterapia',
  label: 'Sonoterapia & Wellness',
  icon: '🎶',
  typical_duration: 'variable',
  difficulty: 'fácil'
},
{
  value: 'fiestas_eventos',
  label: 'Fiestas & Eventos',
  icon: '🎉',
  typical_duration: 'noche',
  difficulty: 'fácil'
}
```

### Sistema de Etiquetas
```typescript
difficulty_levels: [
  { value: 'facil', label: 'Fácil', icon: '🟢', description: 'Para todos' },
  { value: 'moderado', label: 'Moderado', icon: '🟡', description: 'Requiere condición física básica' },
  { value: 'dificil', label: 'Difícil', icon: '🔴', description: 'Experiencia y buena condición física' },
  { value: 'extremo', label: 'Extremo', icon: '⚫', description: 'Solo expertos' }
]

duration_tags: [
  { value: 'horas', label: '2-4 horas', icon: '⏱️' },
  { value: 'medio_dia', label: 'Medio día', icon: '🌅' },
  { value: 'dia_completo', label: 'Día completo', icon: '☀️' },
  { value: 'varios_dias', label: 'Varios días', icon: '📅' }
]

schedule_tags: [
  { value: 'madrugada', label: 'Madrugada (4am-7am)', icon: '🌄' },
  { value: 'manana', label: 'Mañana (7am-12pm)', icon: '🌅' },
  { value: 'tarde', label: 'Tarde (12pm-7pm)', icon: '☀️' },
  { value: 'atardecer', label: 'Atardecer (7pm-9pm)', icon: '🌅' },
  { value: 'noche', label: 'Noche (9pm-12am)', icon: '🌙' }
]

activity_type_tags: [
  'aventura', 'cultural', 'relajacion', 'fotografia',
  'astronomia', 'naturaleza', 'arqueologia', 'wellness'
]
```

### Atributos Especiales
- `altitude`: altitud máxima (importante para mal de altura)
- `group_size`: tamaño min/max del grupo
- `equipment_included`: equipo incluido
- `pickup_included`: incluye transporte desde hotel

---

## 🛠️ SERVICIOS - "Servicios Prácticos"

### Categorías Base
```typescript
{
  value: 'transporte',
  label: 'Transporte',
  icon: '🚐',
  subcategories: ['transfer_aeropuerto', 'taxi_local', 'traslados_tours']
},
{
  value: 'alquiler',
  label: 'Alquiler',
  icon: '🚲',
  subcategories: ['bicicletas', 'equipamiento', 'vehiculos']
},
{
  value: 'bienestar',
  label: 'Bienestar & Cuidado Personal',
  icon: '💆',
  subcategories: ['spa', 'masajes', 'peluqueria', 'barberia']
},
{
  value: 'talleres',
  label: 'Talleres & Experiencias',
  icon: '🎨',
  subcategories: ['cocina', 'ceramica', 'textiles', 'fotografia']
},
{
  value: 'practico',
  label: 'Servicios Prácticos',
  icon: '🧺',
  subcategories: ['lavanderia', 'equipaje', 'guias_turisticos']
}
```

### Atributos Especiales
- `available_hours`: horario de disponibilidad
- `home_service`: servicio a domicilio/hotel
- `booking_required`: requiere reserva previa
- `instant_booking`: reserva instantánea

---

## 🗂️ Estructura TypeScript Propuesta

```typescript
// Nuevo tipo base para categorías dinámicas
export type BaseCategoryType =
  | 'marketplace'
  | 'eat'
  | 'tour'
  | 'service';

// Categorías base por tipo
export type MarketplaceCategory =
  | 'naturales'
  | 'joyeria'
  | 'ceramica'
  | 'textiles'
  | 'licores'
  | 'artesania';

export type EatCategory =
  | 'chilena'
  | 'internacional'
  | 'vegetariana'
  | 'premium'
  | string; // Permite categorías dinámicas

export type TourCategory =
  | 'astronomico'
  | 'geisers_tatio'
  | 'lagunas_altiplanicas'
  | 'valle_luna_muerte'
  | 'salar_atacama'
  | 'arqueologico'
  | 'trekking_aventura'
  | 'termas'
  | 'piedras_rojas'
  | 'sandboarding'
  | 'sonoterapia'
  | 'fiestas_eventos';

export type ServiceCategory =
  | 'transporte'
  | 'alquiler'
  | 'bienestar'
  | 'talleres'
  | 'practico';

// Sistema de etiquetas
export interface Tags {
  // Para EAT
  schedule?: ('desayuno' | 'almuerzo' | 'once' | 'cena' | 'bajon' | 'madrugada')[];

  // Para TOURS
  difficulty?: 'facil' | 'moderado' | 'dificil' | 'extremo';
  duration?: 'horas' | 'medio_dia' | 'dia_completo' | 'varios_dias';
  activityType?: string[]; // aventura, cultural, etc.

  // Generales
  custom?: string[]; // Tags personalizados
}

// Atributos especiales por tipo
export interface EatAttributes {
  deliveryTime?: string;
  minOrder?: number;
  acceptsLateOrders?: boolean;
  scheduleAvailability?: string[];
}

export interface TourAttributes {
  altitude?: number;
  groupSize?: { min: number; max: number };
  equipmentIncluded?: string[];
  pickupIncluded?: boolean;
  physicalRequirements?: string;
}

export interface ServiceAttributes {
  availableHours?: string;
  homeService?: boolean;
  bookingRequired?: boolean;
  instantBooking?: boolean;
}

// Listing actualizado
export interface Listing {
  id?: string;
  providerId: string;
  baseType: BaseCategoryType; // marketplace, eat, tour, service
  category: string; // Categoría principal (puede ser dinámica)
  subcategory?: string; // Subcategoría opcional
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  rating: number;
  reviewCount: number;

  // Sistema de etiquetas
  tags?: Tags;

  // Atributos especiales según tipo
  eatAttributes?: EatAttributes;
  tourAttributes?: TourAttributes;
  serviceAttributes?: ServiceAttributes;

  // Metadata
  status: 'draft' | 'active' | 'archived';
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🎯 Estrategia de Implementación

### Fase 1: Categorías Base (Actual)
- ✅ Implementar categorías base en cada sección
- ✅ UI funcional con navegación de 3 vistas

### Fase 2: Sistema de Tags
- [ ] Agregar filtros por horario en EAT
- [ ] Agregar badges de dificultad/duración en TOURS
- [ ] Implementar UI de filtros avanzados

### Fase 3: Categorías Dinámicas
- [ ] Panel de admin para crear categorías nuevas
- [ ] Sistema de aprobación de categorías
- [ ] UI que muestra categorías dinámicas junto a las base

### Fase 4: Atributos Especiales
- [ ] Formularios específicos por tipo de listing
- [ ] Filtros basados en atributos especiales
- [ ] Visualización de atributos en cards

---

## 🤔 Preguntas Abiertas

1. **Categorías dinámicas en EAT**: ¿Las aprueba un admin o son automáticas?
2. **Alojamiento**: ¿Lo dejamos fuera por ahora o creamos una quinta sección `/stay`?
3. **Subcategorías**: ¿Se muestran todas en el filtro o solo cuando hay contenido?
4. **Tags personalizados**: ¿Los proveedores pueden crear sus propios tags?

---

## 💡 Ejemplo Real de Uso

### Usuario busca "comida italiana nocturna"
```
1. Va a /eat
2. Selecciona categoría dinámica "italiana" (si existe)
3. Filtra por tag de horario: "cena" o "bajón"
4. Ve restaurantes que cumplen ambos criterios
```

### Usuario busca "tour fácil por la tarde"
```
1. Va a /tours
2. Filtra por difficulty: "fácil"
3. Filtra por schedule: "tarde"
4. Ve: Valle de la Luna, Termas de Puritama, etc.
```

---

**¿Qué te parece esta propuesta? ¿Modificarías algo? ¿Agregamos /stay para alojamiento o es muy ambicioso?**
