import { Timestamp } from 'firebase/firestore';

// ==================== LISTINGS (Productos y Servicios) ====================

export type ListingType = 'product' | 'service' | 'experience';

export type ListingCategory =
  | 'joyeria'
  | 'ceramica'
  | 'textiles'
  | 'comida'
  | 'tour_astronomico'
  | 'tour_volcan'
  | 'tour_trekking'
  | 'transfer'
  | 'taxi'
  | 'bicicleta'
  | 'taller'
  | 'otro';

export type ListingStatus = 'draft' | 'active' | 'archived' | 'deleted';

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

// Listing principal (Producto, Servicio o Experiencia)
export interface Listing {
  id?: string;
  providerId: string;
  type: ListingType; // producto, servicio, experiencia
  category: ListingCategory;
  name: string;
  description: string;
  price: number;
  currency: string; // CLP
  images: string[];
  rating: number;
  reviewCount: number;

  // Información específica según tipo
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
  type: ListingType;
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

// Orden por proveedor
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

// Información de envío (solo para productos)
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

// Información de pago
export interface PaymentInfo {
  method: 'mercadopago' | 'transfer' | 'cash';
  transactionId?: string;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  paidAt?: Timestamp | Date;
  metadata?: Record<string, unknown>;
}

// Orden principal
export interface Order {
  id?: string;
  customerId: string;
  customerEmail: string;
  status: OrderStatus;

  // Desglose por proveedor
  providerOrders: ProviderOrder[];

  // Totales
  subtotal: number;
  totalCommission: number;
  total: number;

  // Pago
  payment: PaymentInfo;

  // Envío (solo si hay productos)
  shipping?: ShippingInfo;

  // Metadata
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
  joyeria: number;
  ceramica: number;
  textiles: number;
  comida: number;
  tour_astronomico: number;
  tour_volcan: number;
  tour_trekking: number;
  transfer: number;
  taxi: number;
  bicicleta: number;
  taller: number;
  otro: number;
}

// Default commission rates
export const DEFAULT_COMMISSIONS: CommissionConfig = {
  joyeria: 15,
  ceramica: 15,
  textiles: 15,
  comida: 15,
  tour_astronomico: 20,
  tour_volcan: 20,
  tour_trekking: 20,
  transfer: 15,
  taxi: 15,
  bicicleta: 15,
  taller: 15,
  otro: 15,
};

// ==================== TIPOS PARA SERVICIOS ====================

export interface CreateListingInput {
  type: ListingType;
  category: ListingCategory;
  name: string;
  description: string;
  price: number;
  images: string[];
  productInfo?: ProductInfo;
  serviceInfo?: ServiceInfo;
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  status?: ListingStatus;
}

export interface SearchFilters {
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  searchTerm?: string;
  type?: ListingType;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}
