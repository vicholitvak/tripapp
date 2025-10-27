import { Timestamp } from 'firebase/firestore';
import { TourCategory, DifficultyTag, DurationTag, TourScheduleTag } from './marketplace';

// ==================== TOUR BASE ====================

export interface Tour {
  id?: string;
  providerId: string;
  providerName: string;

  // Información básica
  title: string;
  description: string;
  category: TourCategory;
  images: string[];

  // Tags y atributos
  difficulty: DifficultyTag;
  duration: DurationTag;
  scheduleTag: TourScheduleTag;
  activityTypes: string[]; // aventura, cultural, relajación, etc.

  // Detalles del tour
  basePrice: number; // Precio base por persona
  currency: string; // CLP
  altitude?: number; // Altitud máxima en metros
  groupSize: {
    min: number; // Mínimo de personas para realizar el tour
    max: number; // Máximo de personas por tour
  };

  // Incluye
  includes: string[]; // ['Transporte', 'Guía', 'Snack', 'Equipo']
  pickupIncluded: boolean;
  equipmentIncluded: string[];

  // Requisitos
  physicalRequirements?: string;
  ageRestrictions?: {
    min?: number;
    max?: number;
  };
  requirements?: string[]; // ['Certificado médico', 'Seguro', etc.]

  // Política de cancelación por defecto
  cancellationPolicy: CancellationPolicy;

  // Horarios recurrentes (opcional)
  recurringSchedules?: RecurringSchedule[];

  // Estadísticas
  rating: number;
  reviewCount: number;
  totalBookings: number;

  // Metadata
  status: 'draft' | 'active' | 'paused' | 'archived';
  featured?: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ==================== HORARIOS RECURRENTES ====================

export interface RecurringSchedule {
  id?: string;

  // Días de la semana (0 = Domingo, 6 = Sábado)
  daysOfWeek: number[]; // [1, 3, 5] = Lun, Mié, Vie

  // Hora de inicio
  startTime: string; // "07:00", "16:00"

  // Duración aproximada
  durationHours: number;

  // Capacidad por defecto para este horario
  defaultCapacity: number;

  // Precio específico (opcional, si difiere del basePrice)
  priceOverride?: number;

  // Fecha de inicio y fin de vigencia
  validFrom: Date;
  validUntil?: Date;

  // Activo/Inactivo
  active: boolean;
}

// ==================== INSTANCIA DE TOUR ====================

export interface TourInstance {
  id?: string;
  tourId: string;
  providerId: string;

  // Fecha y hora específica
  date: Timestamp | Date;
  startTime: string; // "07:00"
  endTime: string; // "12:00"

  // Capacidad
  capacity: number; // Máximo de personas
  minParticipants: number; // Mínimo para confirmar
  bookedSpots: number; // Espacios reservados
  availableSpots: number; // Espacios disponibles

  // Precio (puede variar de basePrice)
  pricePerPerson: number;
  originalPrice?: number; // Si hay descuento

  // Estado del tour
  status: TourInstanceStatus;

  // Si viene de horario recurrente
  recurringScheduleId?: string;
  isSpecial: boolean; // Tour especial/privado creado manualmente

  // Descuentos dinámicos (crowdfunding)
  dynamicPricing?: DynamicPricing;

  // Punto de encuentro
  meetingPoint?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    instructions?: string;
  };

  // Notas especiales para esta instancia
  notes?: string;

  // Metadata
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  confirmedAt?: Timestamp | Date;
  cancelledAt?: Timestamp | Date;
}

export type TourInstanceStatus =
  | 'scheduled' // Programado, esperando reservas
  | 'filling' // Activo, aceptando reservas
  | 'almost_full' // Casi lleno (>80% capacidad)
  | 'at_risk' // En riesgo de cancelación (cerca de fecha, pocos cupos)
  | 'confirmed' // Confirmado (alcanzó mínimo de participantes)
  | 'full' // Lleno (alcanzó capacidad máxima)
  | 'in_progress' // En curso
  | 'completed' // Completado
  | 'cancelled_low_bookings' // Cancelado por falta de cupos
  | 'cancelled_provider' // Cancelado por proveedor
  | 'cancelled_weather'; // Cancelado por clima u otro motivo

// ==================== DESCUENTOS DINÁMICOS ====================

export interface DynamicPricing {
  isActive: boolean;

  // Configuración de descuento
  discountPercentage: number; // 10%, 20%, etc.
  reason: 'low_bookings' | 'last_minute' | 'special_promotion';

  // Urgencia
  hoursUntilTour: number;
  bookedPercentage: number; // % de capacidad ocupada

  // Incentivos adicionales
  bonusIncentives?: string[]; // ['Snack extra', 'Foto gratis', etc.]

  // Tiempo límite para el descuento
  validUntil: Timestamp | Date;

  // Historial
  createdAt: Timestamp | Date;
}

// ==================== RESERVAS/BOOKINGS ====================

export interface TourBooking {
  id?: string;

  // Referencias
  tourId: string;
  tourInstanceId: string;
  tourTitle: string;
  providerId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;

  // Detalles de la reserva
  numberOfPeople: number;
  pricePerPerson: number;
  totalAmount: number;
  discountApplied?: number; // % de descuento

  // Información de contacto
  contactInfo: {
    phone: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };

  // Información adicional
  specialRequests?: string;
  dietaryRestrictions?: string[];

  // Estado de la reserva
  status: BookingStatus;

  // Pago
  payment: {
    method: 'mercadopago' | 'transfer' | 'cash';
    status: 'pending' | 'paid' | 'refunded' | 'partially_refunded';
    transactionId?: string;
    paidAt?: Timestamp | Date;
    refundedAt?: Timestamp | Date;
    refundAmount?: number;
  };

  // Cancelación
  cancellation?: {
    cancelledBy: 'customer' | 'provider' | 'system';
    reason: CancellationReason;
    cancelledAt: Timestamp | Date;
    refundPolicy: 'full' | 'partial' | 'none';
    refundPercentage?: number;
    notes?: string;
  };

  // Confirmación
  confirmationCode: string; // Código único de confirmación
  qrCode?: string; // QR para check-in

  // Review
  reviewSubmitted: boolean;
  reviewId?: string;

  // Metadata
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type CancellationReason =
  | 'low_bookings' // No alcanzó cupos mínimos
  | 'customer_request' // Cliente se arrepintió
  | 'provider_cancelled' // Proveedor canceló
  | 'weather' // Mal clima
  | 'emergency' // Emergencia
  | 'other';

// ==================== POLÍTICAS DE CANCELACIÓN ====================

export interface CancellationPolicy {
  name: string; // 'Flexible', 'Moderada', 'Estricta'

  // Reglas de reembolso por tiempo
  rules: CancellationRule[];

  // Excepciones
  allowEmergencyCancellation: boolean;
  emergencyRequiresProof: boolean;

  // Cancelación por falta de cupos
  autoRefundIfCancelled: boolean; // Reembolso automático si el tour se cancela
}

export interface CancellationRule {
  hoursBeforeTour: number; // Horas antes del tour
  refundPercentage: number; // % de reembolso
  description: string; // "Cancelación hasta 24h antes: reembolso 100%"
}

// Políticas predefinidas
export const CANCELLATION_POLICIES: Record<string, CancellationPolicy> = {
  flexible: {
    name: 'Flexible',
    rules: [
      { hoursBeforeTour: 24, refundPercentage: 100, description: 'Reembolso completo hasta 24 horas antes' },
      { hoursBeforeTour: 12, refundPercentage: 50, description: 'Reembolso del 50% hasta 12 horas antes' },
      { hoursBeforeTour: 0, refundPercentage: 0, description: 'Sin reembolso con menos de 12 horas' },
    ],
    allowEmergencyCancellation: true,
    emergencyRequiresProof: false,
    autoRefundIfCancelled: true,
  },
  moderate: {
    name: 'Moderada',
    rules: [
      { hoursBeforeTour: 48, refundPercentage: 100, description: 'Reembolso completo hasta 48 horas antes' },
      { hoursBeforeTour: 24, refundPercentage: 50, description: 'Reembolso del 50% hasta 24 horas antes' },
      { hoursBeforeTour: 0, refundPercentage: 0, description: 'Sin reembolso con menos de 24 horas' },
    ],
    allowEmergencyCancellation: true,
    emergencyRequiresProof: true,
    autoRefundIfCancelled: true,
  },
  strict: {
    name: 'Estricta',
    rules: [
      { hoursBeforeTour: 72, refundPercentage: 80, description: 'Reembolso del 80% hasta 72 horas antes' },
      { hoursBeforeTour: 48, refundPercentage: 50, description: 'Reembolso del 50% hasta 48 horas antes' },
      { hoursBeforeTour: 0, refundPercentage: 0, description: 'Sin reembolso con menos de 48 horas' },
    ],
    allowEmergencyCancellation: true,
    emergencyRequiresProof: true,
    autoRefundIfCancelled: true,
  },
};

// ==================== HELPERS ====================

/**
 * Calcula el porcentaje de reembolso según la política y el tiempo restante
 */
export function calculateRefundPercentage(
  policy: CancellationPolicy,
  hoursUntilTour: number
): number {
  // Buscar la regla aplicable
  for (const rule of policy.rules) {
    if (hoursUntilTour >= rule.hoursBeforeTour) {
      return rule.refundPercentage;
    }
  }
  return 0;
}

/**
 * Determina si un tour está en riesgo de cancelación
 */
export function isTourAtRisk(
  instance: TourInstance,
  hoursUntilTour: number
): boolean {
  const bookedPercentage = (instance.bookedSpots / instance.minParticipants) * 100;

  // En riesgo si:
  // - Faltan menos de 48 horas Y
  // - Tiene menos del 60% del mínimo requerido
  return hoursUntilTour < 48 && bookedPercentage < 60;
}

/**
 * Calcula descuento dinámico sugerido
 */
export function calculateDynamicDiscount(
  instance: TourInstance,
  hoursUntilTour: number
): number {
  const bookedPercentage = (instance.bookedSpots / instance.minParticipants) * 100;

  // Más urgente = mayor descuento
  if (hoursUntilTour < 6 && bookedPercentage < 40) return 30; // 30% descuento
  if (hoursUntilTour < 12 && bookedPercentage < 50) return 25; // 25% descuento
  if (hoursUntilTour < 24 && bookedPercentage < 60) return 20; // 20% descuento
  if (hoursUntilTour < 48 && bookedPercentage < 70) return 15; // 15% descuento

  return 0; // Sin descuento
}
