import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification, NotificationType, NotificationPriority } from '@/types/notification';

export class NotificationService {
  private static COLLECTION = 'notifications';
  private static PREFERENCES_COLLECTION = 'notificationPreferences';

  /**
   * Crea una nueva notificación
   */
  static async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = 'normal',
    actionUrl?: string,
    metadata?: Record<string, unknown>
  ): Promise<Notification> {
    const notification: Omit<Notification, 'id'> = {
      userId,
      type,
      priority,
      title,
      message,
      read: false,
      actionUrl,
      metadata,
      createdAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), notification);

    return {
      ...notification,
      id: docRef.id,
      createdAt: new Date(),
    };
  }

  /**
   * Marca una notificación como leída
   */
  static async markAsRead(notificationId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, notificationId);
    await updateDoc(docRef, {
      read: true,
      readAt: serverTimestamp(),
    });
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  static async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, this.COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        read: true,
        readAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  /**
   * Obtiene notificaciones de un usuario
   */
  static async getByUserId(
    userId: string,
    limitCount = 20,
    unreadOnly = false
  ): Promise<Notification[]> {
    let q = query(
      collection(db, this.COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (unreadOnly) {
      q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
  }

  /**
   * Cuenta notificaciones no leídas
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const q = query(
      collection(db, this.COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  /**
   * Elimina una notificación
   */
  static async delete(notificationId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, notificationId);
    await updateDoc(docRef, {
      expiresAt: serverTimestamp(), // Marcar para eliminar después
    });
  }

  // ==================== NOTIFICACIONES ESPECÍFICAS ====================

  /**
   * Notifica cuando se crea una invitación
   */
  static async notifyInvitationCreated(
    invitationId: string,
    recipientName: string,
    businessName: string,
    invitationCode: string,
    email: string
  ): Promise<void> {
    // Esta notificación podría enviarse por email al proveedor
    // Por ahora solo la registramos para el admin que la creó
    console.log(`📧 Invitación creada: ${invitationCode} para ${email}`);
    console.log(`   Negocio: ${businessName}`);
    console.log(`   Contacto: ${recipientName}`);
  }

  /**
   * Notifica cuando una invitación es reclamada
   */
  static async notifyInvitationClaimed(
    adminUserId: string,
    invitationCode: string,
    recipientName: string,
    businessName: string,
    claimedBy: string
  ): Promise<Notification> {
    return await this.create(
      adminUserId,
      'invitation_claimed',
      '✅ Invitación Reclamada',
      `${recipientName} (${businessName}) ha reclamado la invitación ${invitationCode}`,
      'normal',
      `/admin/invitations`,
      {
        invitationCode,
        recipientName,
        businessName,
        claimedBy,
      }
    );
  }

  /**
   * Notifica cuando se crea un mock
   */
  static async notifyMockCreated(
    adminUserId: string,
    mockProviderId: string,
    businessName: string
  ): Promise<Notification> {
    return await this.create(
      adminUserId,
      'mock_created',
      '🎭 Mock Provider Creado',
      `Mock creado: ${businessName}`,
      'low',
      `/admin/mock-providers`,
      { mockProviderId, businessName }
    );
  }

  /**
   * Notifica cuando un mock es reclamado
   */
  static async notifyMockClaimed(
    adminUserId: string,
    mockProviderId: string,
    businessName: string,
    claimedBy: string,
    realProviderId: string
  ): Promise<Notification> {
    return await this.create(
      adminUserId,
      'mock_claimed',
      '🎉 Mock Reclamado',
      `${businessName} fue reclamado exitosamente`,
      'high',
      `/admin/approvals`,
      {
        mockProviderId,
        realProviderId,
        businessName,
        claimedBy,
      }
    );
  }

  /**
   * Notifica recordatorio de onboarding incompleto
   */
  static async notifyOnboardingIncomplete(
    userId: string,
    businessName: string,
    daysRemaining: number
  ): Promise<Notification> {
    const priority: NotificationPriority = daysRemaining <= 2 ? 'high' : 'normal';

    return await this.create(
      userId,
      'onboarding_incomplete',
      '⏰ Completa tu Perfil',
      `Tienes ${daysRemaining} día(s) para completar el registro de ${businessName}`,
      priority,
      '/onboarding/welcome',
      { businessName, daysRemaining }
    );
  }

  /**
   * Notifica cuando el onboarding expiró
   */
  static async notifyOnboardingExpired(
    userId: string,
    businessName: string
  ): Promise<Notification> {
    return await this.create(
      userId,
      'onboarding_expired',
      '❌ Registro Expirado',
      `El período de registro para ${businessName} ha expirado. Contacta al administrador.`,
      'urgent',
      undefined,
      { businessName }
    );
  }

  /**
   * Notifica cuando un proveedor envía su perfil para aprobación
   */
  static async notifyProviderPending(
    adminUserId: string,
    providerId: string,
    businessName: string,
    providerName: string
  ): Promise<Notification> {
    return await this.create(
      adminUserId,
      'provider_pending',
      '📋 Nuevo Proveedor Pendiente',
      `${providerName} (${businessName}) envió su perfil para aprobación`,
      'high',
      `/admin/approvals`,
      { providerId, businessName, providerName }
    );
  }

  /**
   * Notifica cuando un proveedor es aprobado
   */
  static async notifyProviderApproved(
    userId: string,
    businessName: string
  ): Promise<Notification> {
    return await this.create(
      userId,
      'provider_approved',
      '🎉 ¡Perfil Aprobado!',
      `Tu perfil de ${businessName} ha sido aprobado. Ya puedes empezar a ofrecer tus servicios.`,
      'high',
      '/provider/dashboard',
      { businessName }
    );
  }

  /**
   * Notifica cuando un proveedor es rechazado
   */
  static async notifyProviderRejected(
    userId: string,
    businessName: string,
    reason: string
  ): Promise<Notification> {
    return await this.create(
      userId,
      'provider_rejected',
      '❌ Perfil Rechazado',
      `Tu perfil de ${businessName} fue rechazado. Razón: ${reason}`,
      'urgent',
      '/provider/profile',
      { businessName, reason }
    );
  }

  /**
   * Notifica cuando un proveedor recibe una orden
   */
  static async notifyOrderReceived(
    providerId: string,
    orderId: string,
    customerName: string,
    amount: number
  ): Promise<Notification> {
    return await this.create(
      providerId,
      'order_received',
      '🛒 Nueva Orden',
      `Recibiste una orden de ${customerName} por $${amount}`,
      'high',
      `/provider/orders`,
      { orderId, customerName, amount }
    );
  }

  /**
   * Notifica cuando un proveedor recibe una reseña
   */
  static async notifyReviewReceived(
    providerId: string,
    reviewId: string,
    customerName: string,
    rating: number
  ): Promise<Notification> {
    const emoji = rating >= 4 ? '⭐' : rating >= 3 ? '👍' : '💬';

    return await this.create(
      providerId,
      'review_received',
      `${emoji} Nueva Reseña`,
      `${customerName} dejó una reseña de ${rating} estrellas`,
      'normal',
      `/provider/reviews`,
      { reviewId, customerName, rating }
    );
  }
}
