import { Timestamp } from 'firebase/firestore';

export type NotificationType =
  | 'invitation_created'      // Admin creó invitación
  | 'invitation_claimed'      // Proveedor reclamó invitación
  | 'mock_created'            // Admin creó mock
  | 'mock_claimed'            // Mock fue reclamado por proveedor
  | 'onboarding_incomplete'   // Recordatorio de onboarding incompleto
  | 'onboarding_expired'      // Onboarding expiró
  | 'provider_pending'        // Proveedor envió para aprobación
  | 'provider_approved'       // Admin aprobó proveedor
  | 'provider_rejected'       // Admin rechazó proveedor
  | 'order_received'          // Proveedor recibió orden
  | 'order_completed'         // Orden completada
  | 'review_received';        // Proveedor recibió reseña

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id?: string;
  userId: string;              // Usuario que recibe la notificación
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;          // URL para ir al hacer click
  metadata?: {                 // Datos adicionales según el tipo
    invitationId?: string;
    mockProviderId?: string;
    providerId?: string;
    orderId?: string;
    reviewId?: string;
    [key: string]: unknown;
  };
  createdAt: Timestamp | Date;
  readAt?: Timestamp | Date;
  expiresAt?: Timestamp | Date;
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  types: {
    [K in NotificationType]?: boolean;
  };
  updatedAt: Timestamp | Date;
}
