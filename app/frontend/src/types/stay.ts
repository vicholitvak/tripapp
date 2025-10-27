import { Timestamp } from 'firebase/firestore';

// Tipos de alojamiento
export type StayType =
  | 'camping'      // Camping tradicional (parcelas, carpas)
  | 'glamping'     // Glamping (tiendas equipadas, lujo)
  | 'lodge'        // Lodge/cabaña
  | 'cabin'        // Cabaña
  | 'dome'         // Domos geodésicos
  | 'hostel'       // Hostales
  | 'hotel'        // Hoteles boutique
  | 'hybrid'       // Híbrido (ej: camping + lodge como Andes Nomads)
  | 'unique';      // Lugares únicos (contenedores, yurtas, etc)

// Política de cancelación
export type CancellationPolicy =
  | 'flexible'     // Reembolso completo hasta 24h antes
  | 'moderate'     // Reembolso completo hasta 5 días antes
  | 'strict'       // Reembolso 50% hasta 7 días antes
  | 'non_refundable'; // No reembolsable

// Estado del listing
export type StayStatus =
  | 'draft'        // Borrador
  | 'pending'      // Pendiente de aprobación
  | 'active'       // Activo y publicado
  | 'inactive'     // Inactivo (pausado por host)
  | 'suspended';   // Suspendido por admin

// Capacidad del alojamiento
export interface StayCapacity {
  maxGuests: number;        // Máximo de huéspedes
  bedrooms?: number;        // Número de dormitorios (opcional)
  beds: number;             // Número de camas
  bathrooms: number;        // Número de baños (puede ser 0.5 para medio baño)
  sharedBathroom?: boolean; // Si el baño es compartido
}

// Pricing (precios)
export interface StayPricing {
  basePrice: number;        // Precio base por noche (CLP)
  currency: string;         // 'CLP'
  weeklyDiscount?: number;  // Descuento semanal (%)
  monthlyDiscount?: number; // Descuento mensual (%)
  cleaningFee?: number;     // Tarifa de limpieza
  extraGuestFee?: number;   // Tarifa por huésped adicional después de X personas
  extraGuestThreshold?: number; // Número de huéspedes incluidos en base price
}

// Disponibilidad por fecha
export interface DateAvailability {
  available: boolean;
  price?: number;           // Precio específico para esta fecha (override basePrice)
  minStay?: number;         // Mínimo de noches para esta fecha específica
}

// Calendario de disponibilidad
export interface StayAvailability {
  calendar: {
    [date: string]: DateAvailability; // "2025-01-15": { available: true, price: 50000 }
  };
  defaultMinStay: number;   // Mínimo de noches por defecto
  defaultMaxStay?: number;  // Máximo de noches por defecto
  bookingWindow: number;    // Días de anticipación mínima para reservar
  instantBooking: boolean;  // Si permite reserva instantánea o requiere aprobación
}

// Reglas de la casa
export interface HouseRules {
  checkIn: string;          // "15:00 - 20:00"
  checkOut: string;         // "11:00"
  checkInInstructions?: string; // Instrucciones detalladas
  smoking: boolean;         // ¿Se permite fumar?
  pets: boolean;            // ¿Se permiten mascotas?
  parties: boolean;         // ¿Se permiten fiestas/eventos?
  children: boolean;        // ¿Se permiten niños?
  quietHours?: string;      // "22:00 - 08:00"
  customRules?: string[];   // Reglas personalizadas
}

// Recomendaciones importantes
export interface ImportantInfo {
  transportationNeeded: boolean;  // Si necesita vehículo propio
  bringYourFood: boolean;         // Si debe traer su propia comida
  remoteLocation: boolean;        // Si está en ubicación remota
  limitedCellSignal?: boolean;    // Si hay señal limitada
  customNotes: string[];          // Notas personalizadas importantes
}

// Tipo de espacio (para alojamientos híbridos)
export interface SpaceType {
  type: StayType;           // 'camping' o 'lodge'
  name: string;             // "Parcela de Camping" o "Habitación Lodge"
  description: string;
  quantity: number;         // Cantidad de espacios disponibles
  capacity: StayCapacity;
  pricing: StayPricing;
  photos: string[];
  amenities: string[];      // Amenidades específicas de este tipo de espacio
}

// Stay Listing (Alojamiento)
export interface Stay {
  id?: string;
  providerId: string;       // ID del proveedor/host

  // Básico
  name: string;             // "Andes Nomads Desert Camp & Lodge"
  type: StayType;           // Si es híbrido, ver spaceTypes
  description: string;
  shortDescription: string; // Descripción corta para cards
  photos: string[];         // Fotos principales

  // Para alojamientos híbridos (como Andes Nomads)
  isHybrid: boolean;
  spaceTypes?: SpaceType[]; // Si es híbrido, lista de tipos de espacio

  // Ubicación
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  distanceToCenter: number; // km al centro de San Pedro
  neighborhood?: string;    // "Cucuter", "Ayllu de Yaye", etc.

  // Capacidad (para listings no-híbridos)
  capacity?: StayCapacity;

  // Pricing (para listings no-híbridos)
  pricing?: StayPricing;

  // Amenidades
  amenities: string[];      // ["WiFi", "Estacionamiento", "Cocina compartida", "Piscina"]

  // Experiencias únicas
  highlights: string[];     // ["Mejor vista astronómica", "Cerca Géisers del Tatio"]

  // Información importante
  importantInfo: ImportantInfo;

  // Disponibilidad
  availability: StayAvailability;

  // Reglas
  rules: HouseRules;

  // Políticas
  cancellationPolicy: CancellationPolicy;

  // Host Info (básica)
  hostInfo: {
    name: string;
    photoURL?: string;
    responseTime?: string;  // "Responde en menos de 1 hora"
    languages: string[];    // ["Español", "Inglés"]
  };

  // Stats
  rating: number;           // 0-5
  reviewCount: number;
  totalBookings: number;

  // Status
  status: StayStatus;
  featured?: boolean;
  verified?: boolean;       // Verificado por admin

  // SEO & Discovery
  tags?: string[];          // ["stargazing", "eco-friendly", "family-friendly"]

  // Metadata
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  approvedAt?: Timestamp | Date;
  approvedBy?: string;
}

// Reserva de alojamiento
export interface StayBooking {
  id?: string;
  stayId: string;
  spaceTypeId?: string;     // Si es híbrido, qué tipo de espacio reservó

  // Guest
  guestId: string;          // User ID
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;

  // Fechas
  checkIn: Date | Timestamp;
  checkOut: Date | Timestamp;
  numberOfNights: number;

  // Pricing
  basePrice: number;        // Precio por noche
  totalNights: number;
  subtotal: number;         // basePrice * nights
  cleaningFee: number;
  extraGuestFee: number;
  discountAmount: number;
  totalPrice: number;       // Total a pagar

  // Estado
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';

  // Pago
  paymentId?: string;       // MercadoPago payment ID
  paymentMethod?: string;

  // Cancelación
  cancelledAt?: Timestamp | Date;
  cancelledBy?: string;     // 'guest' | 'host' | 'admin'
  cancellationReason?: string;
  refundAmount?: number;

  // Mensajes
  specialRequests?: string;
  hostNotes?: string;

  // Metadata
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  confirmedAt?: Timestamp | Date;
}

// Review de alojamiento
export interface StayReview {
  id?: string;
  stayId: string;
  bookingId: string;

  // Reviewer
  guestId: string;
  guestName: string;
  guestPhotoURL?: string;

  // Rating (1-5)
  overallRating: number;
  cleanliness: number;
  accuracy: number;         // Qué tan precisa fue la descripción
  checkIn: number;          // Experiencia de check-in
  communication: number;    // Comunicación con host
  location: number;
  value: number;            // Relación calidad-precio

  // Review
  comment: string;
  photos?: string[];

  // Response
  hostResponse?: string;
  hostResponseAt?: Timestamp | Date;

  // Metadata
  createdAt: Timestamp | Date;
  verified: boolean;        // Si está verificado (reserva real)
}

// Filtros de búsqueda
export interface StaySearchFilters {
  // Fechas
  checkIn?: Date;
  checkOut?: Date;

  // Capacidad
  guests?: number;

  // Tipo
  types?: StayType[];

  // Precio
  minPrice?: number;
  maxPrice?: number;

  // Amenidades
  amenities?: string[];     // ["WiFi", "Cocina", "Estacionamiento"]

  // Características especiales
  instantBooking?: boolean;
  petFriendly?: boolean;
  familyFriendly?: boolean;
  ecoFriendly?: boolean;

  // Ubicación
  maxDistance?: number;     // km del centro

  // Ordenar
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'distance' | 'popular';
}
