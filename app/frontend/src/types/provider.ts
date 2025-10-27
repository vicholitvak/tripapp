import { Timestamp } from 'firebase/firestore';

// Provider Types
export type ProviderType =
  | 'cook'           // Cocinero
  | 'driver'         // Repartidor/Chofer
  | 'tour_guide'     // Guía turístico
  | 'artisan'        // Artesano (joyería, cerámica, textiles)
  | 'transport'      // Taxi, transfer
  | 'lodging'        // Alojamiento (hostels, campings, glampings)
  | 'service'        // Taller bicicletas, otros servicios
  | 'other';         // Otros

export type ProviderStatus =
  | 'mock'           // Mock provider (no real, para demos)
  | 'draft'          // Borrador (proveedor creando perfil)
  | 'pending'        // Enviado, esperando aprobación
  | 'approved'       // Aprobado por admin
  | 'active'         // Activo en la plataforma
  | 'suspended'      // Suspendido
  | 'rejected';      // Rechazado

export type ProviderAccountType =
  | 'mock'           // Mock provider (pre-configurado para invitación)
  | 'real';          // Proveedor real registrado

export type InvitationStatus =
  | 'pending'        // Creada, no enviada
  | 'sent'           // Enviada/entregada
  | 'claimed'        // Reclamada por el proveedor (reemplaza 'used')
  | 'expired'        // Expirada
  | 'cancelled';     // Cancelada por admin

// Invitation Interface
export interface Invitation {
  id?: string;
  code: string;                    // ATK-2024-CARMEN-001

  // Link to mock provider
  mockProviderId?: string;         // ID del mock provider a reclamar

  // Personalización
  recipientName: string;           // "Carmen"
  businessName: string;            // "Cocina de Doña Carmen"
  category: string;                // "cocinera tradicional"
  email: string;                   // Email del proveedor que debe reclamar
  customMessage?: string;          // Mensaje adicional opcional

  type: ProviderType;
  status: InvitationStatus;

  createdBy: string;               // admin uid
  createdAt: Timestamp | Date;
  sentAt?: Timestamp | Date;

  // Cuando se reclama
  claimedBy?: string;              // user uid que reclamó la invitación
  claimedAt?: Timestamp | Date;

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
  userId?: string;                 // Firebase Auth uid (opcional para mocks)
  accountType: ProviderAccountType; // 'mock' o 'real'
  type: ProviderType;
  status: ProviderStatus;
  invitationCode?: string;         // Código de invitación usado
  linkedInvitationId?: string;     // ID de la invitación (si es mock)

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
  claimedAt?: Timestamp | Date;    // Cuando un mock se convirtió en real

  // Flags
  featured?: boolean;
  verified?: boolean;
}

// Mock to Real Conversion Log
export interface MockConversionLog {
  id?: string;
  mockProviderId: string;
  realProviderId: string;
  invitationId: string;
  convertedBy: string;             // user uid que reclamó
  convertedAt: Timestamp | Date;

  // Snapshot del mock antes de convertir
  mockSnapshot: Provider;

  // Cambios aplicados
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
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

// Lead Status (estado del contacto con proveedor potencial)
export type LeadStatus =
  | 'new'              // Nuevo lead, no contactado
  | 'contacted'        // Contactado, esperando respuesta
  | 'interested'       // Interesado, pendiente de enviar invitación
  | 'invited'          // Invitación enviada
  | 'claimed'          // Invitación reclamada
  | 'rejected'         // Rechazó la oferta
  | 'inactive';        // Inactivo/no respondió

// Source (de dónde viene el lead)
export type LeadSource =
  | 'referral'         // Referido
  | 'direct_contact'   // Contacto directo
  | 'social_media'     // Redes sociales
  | 'marketplace'      // Marketplace local
  | 'event'            // Evento/feria
  | 'other';           // Otro

// Provider Lead (base de datos de proveedores potenciales)
export interface ProviderLead {
  id?: string;

  // Información de contacto
  contactInfo: {
    name: string;                    // Nombre del contacto
    businessName: string;            // Nombre del negocio
    email: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  };

  // Tipo y servicios
  type: ProviderType;                // Tipo de proveedor
  category: string;                  // Categoría específica
  servicesOffered: string[];         // Lista de servicios que ofrece

  // Estado del lead
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: LeadSource;

  // Notas y seguimiento
  notes?: string;
  contactHistory?: {
    date: Timestamp | Date;
    contactedBy: string;             // admin uid
    method: 'phone' | 'email' | 'whatsapp' | 'in_person' | 'other';
    notes: string;
    nextFollowUp?: Timestamp | Date;
  }[];

  // Relaciones
  invitationId?: string;             // Si se creó invitación
  mockProviderId?: string;           // Si se creó mock
  realProviderId?: string;           // Si ya es proveedor real

  // Metadata
  createdBy: string;                 // admin uid que agregó el lead
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastContactedAt?: Timestamp | Date;

  // Flags
  isActive: boolean;
  tags?: string[];                   // Etiquetas personalizadas
}
