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
   * Crea una nueva invitación
   */
  static async createInvitation(
    recipientName: string,
    businessName: string,
    category: string,
    type: ProviderType,
    createdBy: string,
    customMessage?: string
  ): Promise<Invitation> {
    const code = this.generateCode(recipientName);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 días de validez

    const invitation: Invitation = {
      code,
      recipientName,
      businessName,
      category,
      type,
      status: 'pending',
      createdBy,
      createdAt: serverTimestamp() as Timestamp,
      expiresAt: Timestamp.fromDate(expiresAt),
      customMessage,
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), invitation);

    return {
      ...invitation,
      id: docRef.id,
      createdAt: new Date(),
    };
  }

  /**
   * Valida un código de invitación
   */
  static async validateCode(code: string): Promise<{
    valid: boolean;
    invitation?: Invitation;
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

      const doc = snapshot.docs[0];
      const invitation = { id: doc.id, ...doc.data() } as Invitation;

      // Verificar si ya fue usada
      if (invitation.status === 'used') {
        return { valid: false, error: 'Esta invitación ya fue utilizada' };
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

      return { valid: true, invitation };
    } catch (error) {
      console.error('Error validating invitation code:', error);
      return { valid: false, error: 'Error al validar el código' };
    }
  }

  /**
   * Marca una invitación como usada
   */
  static async markAsUsed(invitationId: string, userId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, invitationId);
    await updateDoc(docRef, {
      status: 'used',
      usedBy: userId,
      usedAt: serverTimestamp(),
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
    used: number;
    expired: number;
    conversionRate: number;
  }> {
    const invitations = await this.listAll();

    const stats = {
      total: invitations.length,
      pending: invitations.filter(i => i.status === 'pending').length,
      sent: invitations.filter(i => i.status === 'sent').length,
      used: invitations.filter(i => i.status === 'used').length,
      expired: invitations.filter(i => i.status === 'expired').length,
      conversionRate: 0,
    };

    const sentOrUsed = stats.sent + stats.used;
    if (sentOrUsed > 0) {
      stats.conversionRate = (stats.used / sentOrUsed) * 100;
    }

    return stats;
  }
}
