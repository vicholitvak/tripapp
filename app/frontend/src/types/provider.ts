import { Timestamp } from 'firebase/firestore';

// Provider Types
export type ProviderType =
  | 'cook'           // Cocinero
  | 'driver'         // Repartidor/Chofer
  | 'tour_guide'     // Guía turístico
  | 'artisan'        // Artesano (joyería, cerámica, textiles)
  | 'transport'      // Taxi, transfer
  | 'service'        // Taller bicicletas, otros servicios
  | 'other';         // Otros

export type ProviderStatus =
  | 'pending'        // Enviado, esperando aprobación
  | 'approved'       // Aprobado por admin
  | 'active'         // Activo en la plataforma
  | 'suspended'      // Suspendido
  | 'rejected';      // Rechazado

export type InvitationStatus =
  | 'pending'        // Creada, no enviada
  | 'sent'           // Enviada/entregada
  | 'used'           // Usada por el proveedor
  | 'expired';       // Expirada

// Invitation Interface
export interface Invitation {
  id?: string;
  code: string;                    // ATK-2024-CARMEN-001

  // Personalización
  recipientName: string;           // "Carmen"
  businessName: string;            // "Cocina de Doña Carmen"
  category: string;                // "cocinera tradicional"
  customMessage?: string;          // Mensaje adicional opcional

  type: ProviderType;
  status: InvitationStatus;

  createdBy: string;               // admin uid
  createdAt: Timestamp | Date;
  sentAt?: Timestamp | Date;
  usedBy?: string;                 // user uid que usó la invitación
  usedAt?: Timestamp | Date;
  expiresAt?: Timestamp | Date;

  metadata?: {
    printedDate?: Timestamp | Date;
    deliveredBy?: string;
    notes?: string;
  };
}

// Service/Product offered by provider
export interface Service {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;                // CLP
  duration?: string;               // "2 horas", "3 días"
  capacity?: number;               // Para tours
  includes?: string[];             // Lo que incluye
  excludes?: string[];             // Lo que no incluye
  availability?: {
    daysOfWeek?: number[];         // 0-6 (domingo-sábado)
    startTime?: string;
    endTime?: string;
    blackoutDates?: Date[];
  };
  photos?: string[];
  active: boolean;
}

// Provider Profile
export interface Provider {
  id?: string;
  userId: string;                  // Firebase Auth uid
  type: ProviderType;
  status: ProviderStatus;
  invitationCode?: string;         // Código de invitación usado

  // Personal Info
  personalInfo: {
    displayName: string;
    phone: string;
    email: string;
    bio: string;
    photoURL?: string;
    language?: string[];           // ["es", "en", "pt"]
  };

  // Business Info
  businessInfo: {
    name: string;
    description: string;
    category: string;              // Categoría específica dentro del type
    address?: string;
    location?: {
      lat: number;
      lng: number;
    };
    photos: string[];
    certifications?: string[];     // URLs de certificados, RUT, etc
    website?: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      whatsapp?: string;
    };
  };

  // Services/Products
  services: Service[];

  // Stats
  rating: number;
  reviewCount: number;
  completedOrders: number;

  // Admin
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  approvedAt?: Timestamp | Date;
  approvedBy?: string;             // admin uid
  rejectedAt?: Timestamp | Date;
  rejectedReason?: string;

  // Flags
  featured?: boolean;
  verified?: boolean;
}

// Onboarding Progress (temporal durante el proceso)
export interface OnboardingProgress {
  userId: string;
  invitationCode: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];        // ["account", "profile", "business", ...]

  // Draft data
  draftData: {
    type?: ProviderType;
    personalInfo?: Partial<Provider['personalInfo']>;
    businessInfo?: Partial<Provider['businessInfo']>;
    services?: Service[];
  };

  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  expiresAt: Timestamp | Date;     // 7 días para completar
}

// Admin approval request
export interface ApprovalRequest {
  id?: string;
  providerId: string;
  providerName: string;
  type: ProviderType;
  status: 'pending' | 'approved' | 'rejected';

  requestedAt: Timestamp | Date;
  reviewedAt?: Timestamp | Date;
  reviewedBy?: string;
  reviewNotes?: string;

  // Snapshot del provider al momento de solicitar
  providerSnapshot: Provider;
}
