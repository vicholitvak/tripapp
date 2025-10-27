import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Invitation, InvitationStatus, ProviderType } from '@/types/provider';

export class InvitationService {
  private static COLLECTION = 'invitations';

  /**
   * Genera un código único para la invitación
   * Formato: ATK-{YEAR}-{NAME}-{RANDOM}
   */
  private static generateCode(recipientName: string): string {
    const year = new Date().getFullYear();
    const namePart = recipientName
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^A-Z]/g, '')
      .substring(0, 6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();

    return `ATK-${year}-${namePart}-${random}`;
  }

  /**
   * Crea una nueva invitación (puede estar vinculada a un mock provider)
   */
  static async createInvitation(
    recipientName: string,
    businessName: string,
    category: string,
    email: string,
    type: ProviderType,
    createdBy: string,
    mockProviderId?: string,
    customMessage?: string
  ): Promise<Invitation> {
    const code = this.generateCode(recipientName);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 días de validez

    const invitation: Invitation = {
      code,
      mockProviderId,
      recipientName,
      businessName,
      category,
      email,
      type,
      status: 'pending',
      createdBy,
      createdAt: serverTimestamp() as Timestamp,
      expiresAt: Timestamp.fromDate(expiresAt),
      customMessage,
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), invitation);

    // Si está vinculada a un mock, actualizar el mock
    if (mockProviderId) {
      const mockRef = doc(db, 'providers', mockProviderId);
      await updateDoc(mockRef, {
        linkedInvitationId: docRef.id,
        updatedAt: serverTimestamp(),
      });
    }

    return {
      ...invitation,
      id: docRef.id,
      createdAt: new Date(),
    };
  }

  /**
   * Valida un código de invitación y obtiene el mock provider si existe
   */
  static async validateCode(code: string): Promise<{
    valid: boolean;
    invitation?: Invitation;
    mockProvider?: unknown;
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('code', '==', code)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { valid: false, error: 'Código de invitación no encontrado' };
      }

      const docData = snapshot.docs[0];
      const invitation = { id: docData.id, ...docData.data() } as Invitation;

      // Verificar si ya fue reclamada
      if (invitation.status === 'claimed') {
        return { valid: false, error: 'Esta invitación ya fue utilizada' };
      }

      // Verificar si está cancelada
      if (invitation.status === 'cancelled') {
        return { valid: false, error: 'Esta invitación ha sido cancelada' };
      }

      // Verificar expiración
      if (invitation.expiresAt) {
        const expiryDate = invitation.expiresAt instanceof Timestamp
          ? invitation.expiresAt.toDate()
          : new Date(invitation.expiresAt);

        if (expiryDate < new Date()) {
          // Marcar como expirada
          await this.updateStatus(invitation.id!, 'expired');
          return { valid: false, error: 'Esta invitación ha expirado' };
        }
      }

      // Si tiene mockProviderId, obtener el mock provider
      let mockProvider;
      if (invitation.mockProviderId) {
        const mockRef = doc(db, 'providers', invitation.mockProviderId);
        const mockSnap = await getDoc(mockRef);

        if (mockSnap.exists()) {
          mockProvider = { id: mockSnap.id, ...mockSnap.data() };
        }
      }

      return { valid: true, invitation, mockProvider };
    } catch (error) {
      console.error('Error validating invitation code:', error);
      return { valid: false, error: 'Error al validar el código' };
    }
  }

  /**
   * Reclama una invitación (cuando el proveedor se registra)
   */
  static async claimInvitation(invitationId: string, userId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, invitationId);
    await updateDoc(docRef, {
      status: 'claimed',
      claimedBy: userId,
      claimedAt: serverTimestamp(),
    });
  }

  /**
   * Cancela una invitación (admin)
   */
  static async cancelInvitation(invitationId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, invitationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Invitation not found');
    }

    const invitation = docSnap.data() as Invitation;

    // Si tenía mockProviderId, quitar la vinculación
    if (invitation.mockProviderId) {
      const mockRef = doc(db, 'providers', invitation.mockProviderId);
      await updateDoc(mockRef, {
        linkedInvitationId: null,
        updatedAt: serverTimestamp(),
      });
    }

    await updateDoc(docRef, {
      status: 'cancelled',
    });
  }

  /**
   * Marca una invitación como enviada
   */
  static async markAsSent(invitationId: string, deliveredBy?: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, invitationId);
    await updateDoc(docRef, {
      status: 'sent',
      sentAt: serverTimestamp(),
      'metadata.deliveredBy': deliveredBy,
    });
  }

  /**
   * Actualiza el estado de una invitación
   */
  static async updateStatus(
    invitationId: string,
    status: InvitationStatus
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, invitationId);
    await updateDoc(docRef, { status });
  }

  /**
   * Obtiene una invitación por ID
   */
  static async getById(invitationId: string): Promise<Invitation | null> {
    const docRef = doc(db, this.COLLECTION, invitationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Invitation;
  }

  /**
   * Lista todas las invitaciones (para admin)
   */
  static async listAll(): Promise<Invitation[]> {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Invitation));
  }

  /**
   * Lista invitaciones por estado
   */
  static async listByStatus(status: InvitationStatus): Promise<Invitation[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Invitation));
  }

  /**
   * Obtiene estadísticas de invitaciones
   */
  static async getStats(): Promise<{
    total: number;
    pending: number;
    sent: number;
    claimed: number;
    cancelled: number;
    expired: number;
    conversionRate: number;
  }> {
    const invitations = await this.listAll();

    const stats = {
      total: invitations.length,
      pending: invitations.filter(i => i.status === 'pending').length,
      sent: invitations.filter(i => i.status === 'sent').length,
      claimed: invitations.filter(i => i.status === 'claimed').length,
      cancelled: invitations.filter(i => i.status === 'cancelled').length,
      expired: invitations.filter(i => i.status === 'expired').length,
      conversionRate: 0,
    };

    const sentOrClaimed = stats.sent + stats.claimed;
    if (sentOrClaimed > 0) {
      stats.conversionRate = (stats.claimed / sentOrClaimed) * 100;
    }

    return stats;
  }

  /**
   * Obtiene invitaciones vinculadas a un mock provider
   */
  static async getByMockProviderId(mockProviderId: string): Promise<Invitation | null> {
    const q = query(
      collection(db, this.COLLECTION),
      where('mockProviderId', '==', mockProviderId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Invitation;
  }
}
