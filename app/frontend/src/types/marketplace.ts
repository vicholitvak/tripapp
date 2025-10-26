import { Timestamp } from 'firebase/firestore';

// ==================== TIPO BASE ====================

export type BaseCategoryType = 'marketplace' | 'eat' | 'tour' | 'service';

// ==================== CATEGORÍAS POR TIPO ====================

// MARKETPLACE - Productos físicos
export type MarketplaceCategory =
  | 'naturales'      // Productos Naturales & Orgánicos (plantas + orgánicos)
  | 'joyeria'        // Joyería Artesanal
  | 'ceramica'       // Cerámica Atacameña
  | 'textiles'       // Textiles Andinos
  | 'licores'        // Licores Locales
  | 'artesania';     // Artesanía General

// EAT - Delivery de comida (categorías base + dinámicas)
export type EatCategoryBase =
  | 'chilena'        // Comida Chilena
  | 'internacional'  // Internacional
  | 'vegetariana'    // Vegetariana & Vegana
  | 'premium';       // Premium & Gourmet

// Categorías dinámicas comunes (pueden crecer)
export type EatCategoryDynamic =
  | 'sushi'          // Sushi & Comida Japonesa
  | 'pizzas'         // Pizzería
  | 'hamburguesas'   // Hamburguesas
  | 'italiana'       // Comida Italiana
  | 'mexicana'       // Comida Mexicana
  | 'asiatica'       // Comida Asiática
  | 'postres';       // Postres & Café

export type EatCategory = EatCategoryBase | EatCategoryDynamic | string;

// TOURS - Experiencias y actividades
export type TourCategory =
  | 'astronomico'              // Tour Astronómico
  | 'geisers_tatio'            // Géisers del Tatio
  | 'lagunas_altiplanicas'     // Lagunas Altiplánicas
  | 'valle_luna_muerte'        // Valle de la Luna/Muerte
  | 'salar_atacama'            // Salar de Atacama & Lagunas
  | 'arqueologico'             // Arqueológico (Tulor, Pukará)
  | 'trekking_aventura'        // Trekking & Aventura
  | 'termas'                   // Termas de Puritama
  | 'piedras_rojas'            // Piedras Rojas
  | 'sandboarding'             // Sandboarding
  | 'sonoterapia'              // Sonoterapia & Wellness
  | 'fiestas_eventos';         // Fiestas & Eventos

// SERVICES - Servicios prácticos
export type ServiceCategory =
  | 'transporte'     // Transporte (transfers, taxi)
  | 'alquiler'       // Alquiler (bicicletas, equipamiento)
  | 'bienestar'      // Bienestar (spa, masajes, peluquería)
  | 'talleres'       // Talleres & Experiencias
  | 'practico';      // Servicios Prácticos (lavandería)

// Unión de todas las categorías (para compatibilidad)
export type ListingCategory =
  | MarketplaceCategory
  | EatCategory
  | TourCategory
  | ServiceCategory;

export type ListingStatus = 'draft' | 'active' | 'archived' | 'deleted';

// ==================== SISTEMA DE ETIQUETAS/TAGS ====================

// Tags de horario para EAT
export type ScheduleTag =
  | 'desayuno'      // 7am-11am
  | 'almuerzo'      // 12pm-3pm
  | 'once'          // 4pm-7pm (merienda chilena)
  | 'cena'          // 7pm-11pm
  | 'bajon'         // 11pm-4am (comida nocturna)
  | 'madrugada';    // 4am-7am (para turistas que van a géisers)

// Tags de dificultad para TOURS
export type DifficultyTag =
  | 'facil'         // Para todos
  | 'moderado'      // Requiere condición física básica
  | 'dificil'       // Experiencia y buena condición física
  | 'extremo';      // Solo expertos

// Tags de duración para TOURS
export type DurationTag =
  | 'horas'         // 2-4 horas
  | 'medio_dia'     // Medio día
  | 'dia_completo'  // Día completo
  | 'varios_dias';  // Varios días

// Tags de horario para TOURS
export type TourScheduleTag =
  | 'madrugada'     // 4am-7am
  | 'manana'        // 7am-12pm
  | 'tarde'         // 12pm-7pm
  | 'atardecer'     // 7pm-9pm
  | 'noche';        // 9pm-12am

// Interfaz de tags
export interface Tags {
  // Para EAT
  schedule?: ScheduleTag[];

  // Para TOURS
  difficulty?: DifficultyTag;
  duration?: DurationTag;
  tourSchedule?: TourScheduleTag;
  activityType?: string[]; // aventura, cultural, relajacion, etc.

  // Generales
  custom?: string[]; // Tags personalizados
}

// ==================== ATRIBUTOS ESPECIALES POR TIPO ====================

// Atributos para EAT
export interface EatAttributes {
  deliveryTime?: string;        // "30-45 min"
  minOrder?: number;             // Pedido mínimo en CLP
  acceptsLateOrders?: boolean;   // Acepta pedidos nocturnos
  scheduleAvailability?: ScheduleTag[]; // Horarios disponibles
}

// Atributos para TOURS
export interface TourAttributes {
  altitude?: number;             // Altitud máxima en metros
  groupSize?: {
    min: number;
    max: number;
  };
  equipmentIncluded?: string[];  // Equipo incluido
  pickupIncluded?: boolean;      // Incluye transporte desde hotel
  physicalRequirements?: string; // Requisitos físicos
}

// Atributos para SERVICES
export interface ServiceAttributes {
  availableHours?: string;       // "8am-8pm"
  homeService?: boolean;         // Servicio a domicilio/hotel
  bookingRequired?: boolean;     // Requiere reserva previa
  instantBooking?: boolean;      // Reserva instantánea
}

// ==================== INFORMACIÓN ESPECÍFICA ====================

// Información de producto físico
export interface ProductInfo {
  stock: number;
  weight?: number; // kg
  dimensions?: string; // cm
  shippingCost?: number;
}

// Información de servicio
export interface ServiceInfo {
  duration: string; // "2 horas", "3 días"
  capacity?: number; // cuántas personas
  scheduleType: 'flexible' | 'scheduled';
  availableDates?: Date[];
}

// ==================== LISTING PRINCIPAL ====================

export interface Listing {
  id?: string;
  providerId: string;

  // Tipo y categorización
  baseType: BaseCategoryType;   // marketplace, eat, tour, service
  category: string;              // Categoría principal (puede ser dinámica en EAT)
  subcategory?: string;          // Subcategoría opcional

  // Información básica
  name: string;
  description: string;
  price: number;
  currency: string; // CLP
  images: string[];
  rating: number;
  reviewCount: number;

  // Sistema de etiquetas
  tags?: Tags;

  // Atributos especiales según tipo
  eatAttributes?: EatAttributes;
  tourAttributes?: TourAttributes;
  serviceAttributes?: ServiceAttributes;

  // Información específica según tipo (legacy, mantener por compatibilidad)
  productInfo?: ProductInfo;
  serviceInfo?: ServiceInfo;

  // Metadata
  status: ListingStatus;
  featured?: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ==================== CARRITO UNIFICADO ====================

export interface CartItem {
  listingId: string;
  providerId: string;
  baseType: BaseCategoryType;
  quantity: number;
  price: number;
  listingName: string;
  image: string;

  // Para servicios
  serviceDate?: Date;
  serviceTime?: string;
  serviceNotes?: string;
}

export interface CartByProvider {
  providerId: string;
  providerName: string;
  items: CartItem[];
  subtotal: number;
}

export interface UnifiedCart {
  userId: string;
  items: CartItem[];
  itemsByProvider: CartByProvider[];
  subtotal: number;
  commission: number;
  total: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ==================== ÓRDENES ====================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

export interface ProviderOrder {
  orderId: string;
  providerId: string;
  providerName: string;
  items: CartItem[];
  subtotal: number;
  commission: number;
  providerRevenue: number;
  status: OrderStatus;
  notes?: string;
  createdAt: Timestamp | Date;
}

export interface ShippingInfo {
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
}

export interface PaymentInfo {
  method: 'mercadopago' | 'transfer' | 'cash';
  transactionId?: string;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  paidAt?: Timestamp | Date;
  metadata?: Record<string, unknown>;
}

export interface Order {
  id?: string;
  customerId: string;
  customerEmail: string;
  status: OrderStatus;
  providerOrders: ProviderOrder[];
  subtotal: number;
  totalCommission: number;
  total: number;
  payment: PaymentInfo;
  shipping?: ShippingInfo;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
}

// ==================== GANANCIAS Y PAYOUTS ====================

export interface EarningsTransaction {
  orderId: string;
  amount: number;
  commission: number;
  revenue: number;
  date: Timestamp | Date;
  status: 'pending' | 'processed';
}

export interface ProviderEarnings {
  id?: string;
  providerId: string;
  totalRevenue: number;
  totalCommission: number;
  totalEarnings: number;
  paidOut: number;
  pendingPayout: number;
  transactions: EarningsTransaction[];
  lastPayout?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface PayoutRequest {
  id?: string;
  providerId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  bankInfo: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
    accountType: 'cuenta_corriente' | 'cuenta_vista' | 'rut';
  };
  requestedAt: Timestamp | Date;
  processedAt?: Timestamp | Date;
  notes?: string;
}

// ==================== REVIEWS ====================

export interface Review {
  id?: string;
  listingId: string;
  orderId: string;
  customerId: string;
  rating: number; // 1-5
  comment: string;
  photos?: string[];
  helpful: number;
  createdAt: Timestamp | Date;
}

// ==================== CONFIGURACIÓN ====================

export interface CommissionConfig {
  // MARKETPLACE
  naturales: number;
  joyeria: number;
  ceramica: number;
  textiles: number;
  licores: number;
  artesania: number;

  // EAT
  chilena: number;
  internacional: number;
  vegetariana: number;
  premium: number;
  eat_other: number; // Para categorías dinámicas

  // TOURS
  astronomico: number;
  geisers_tatio: number;
  lagunas_altiplanicas: number;
  valle_luna_muerte: number;
  salar_atacama: number;
  arqueologico: number;
  trekking_aventura: number;
  termas: number;
  piedras_rojas: number;
  sandboarding: number;
  sonoterapia: number;
  fiestas_eventos: number;

  // SERVICES
  transporte: number;
  alquiler: number;
  bienestar: number;
  talleres: number;
  practico: number;

  // Default
  otro: number;
}

// Default commission rates
export const DEFAULT_COMMISSIONS: CommissionConfig = {
  // MARKETPLACE - 15%
  naturales: 15,
  joyeria: 15,
  ceramica: 15,
  textiles: 15,
  licores: 15,
  artesania: 15,

  // EAT - 15%
  chilena: 15,
  internacional: 15,
  vegetariana: 15,
  premium: 15,
  eat_other: 15,

  // TOURS - 20%
  astronomico: 20,
  geisers_tatio: 20,
  lagunas_altiplanicas: 20,
  valle_luna_muerte: 20,
  salar_atacama: 20,
  arqueologico: 20,
  trekking_aventura: 20,
  termas: 20,
  piedras_rojas: 20,
  sandboarding: 20,
  sonoterapia: 20,
  fiestas_eventos: 20,

  // SERVICES - 15%
  transporte: 15,
  alquiler: 15,
  bienestar: 15,
  talleres: 15,
  practico: 15,

  // Default
  otro: 15,
};

// ==================== TIPOS PARA SERVICIOS ====================

export interface CreateListingInput {
  baseType: BaseCategoryType;
  category: string;
  subcategory?: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  tags?: Tags;
  eatAttributes?: EatAttributes;
  tourAttributes?: TourAttributes;
  serviceAttributes?: ServiceAttributes;
  productInfo?: ProductInfo;
  serviceInfo?: ServiceInfo;
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  status?: ListingStatus;
}

export interface SearchFilters {
  baseType?: BaseCategoryType;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  searchTerm?: string;
  tags?: Partial<Tags>;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}
