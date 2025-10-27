import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProviderLead, LeadStatus, ProviderType } from '@/types/provider';

export class ProviderLeadService {
  private static COLLECTION = 'providerLeads';

  /**
   * Crea un nuevo lead de proveedor
   */
  static async create(
    leadData: Omit<ProviderLead, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>,
    adminUserId: string
  ): Promise<ProviderLead> {
    const lead: Omit<ProviderLead, 'id'> = {
      ...leadData,
      createdBy: adminUserId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), lead);

    return {
      ...lead,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Obtiene todos los leads
   */
  static async getAll(): Promise<ProviderLead[]> {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ProviderLead));
  }

  /**
   * Obtiene leads por estado
   */
  static async getByStatus(status: LeadStatus): Promise<ProviderLead[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ProviderLead));
  }

  /**
   * Obtiene leads por tipo de proveedor
   */
  static async getByType(type: ProviderType): Promise<ProviderLead[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ProviderLead));
  }

  /**
   * Obtiene leads activos
   */
  static async getActive(): Promise<ProviderLead[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('isActive', '==', true),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ProviderLead));
  }

  /**
   * Obtiene un lead por ID
   */
  static async getById(leadId: string): Promise<ProviderLead | null> {
    const docRef = doc(db, this.COLLECTION, leadId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as ProviderLead;
  }

  /**
   * Actualiza un lead
   */
  static async update(
    leadId: string,
    updates: Partial<ProviderLead>
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, leadId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Actualiza el estado de un lead
   */
  static async updateStatus(
    leadId: string,
    status: LeadStatus,
    notes?: string
  ): Promise<void> {
    const updates: Partial<ProviderLead> = {
      status,
      updatedAt: serverTimestamp() as Timestamp,
    };

    if (notes) {
      updates.notes = notes;
    }

    const docRef = doc(db, this.COLLECTION, leadId);
    await updateDoc(docRef, updates);
  }

  /**
   * Agrega una entrada al historial de contacto
   */
  static async addContactHistory(
    leadId: string,
    contactEntry: {
      contactedBy: string;
      method: 'phone' | 'email' | 'whatsapp' | 'in_person' | 'other';
      notes: string;
      nextFollowUp?: Date;
    }
  ): Promise<void> {
    const lead = await this.getById(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    const newEntry = {
      date: serverTimestamp() as Timestamp,
      ...contactEntry,
    };

    const updatedHistory = [...(lead.contactHistory || []), newEntry];

    await updateDoc(doc(db, this.COLLECTION, leadId), {
      contactHistory: updatedHistory,
      lastContactedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Marca un lead como invitado (cuando se crea una invitación)
   */
  static async markAsInvited(
    leadId: string,
    invitationId: string,
    mockProviderId?: string
  ): Promise<void> {
    const updates: Partial<ProviderLead> = {
      status: 'invited',
      invitationId,
      updatedAt: serverTimestamp() as Timestamp,
    };

    if (mockProviderId) {
      updates.mockProviderId = mockProviderId;
    }

    await updateDoc(doc(db, this.COLLECTION, leadId), updates);
  }

  /**
   * Marca un lead como reclamado (cuando el proveedor reclama la invitación)
   */
  static async markAsClaimed(
    leadId: string,
    realProviderId: string
  ): Promise<void> {
    await updateDoc(doc(db, this.COLLECTION, leadId), {
      status: 'claimed',
      realProviderId,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Desactiva un lead
   */
  static async deactivate(leadId: string, reason?: string): Promise<void> {
    const updates: Partial<ProviderLead> = {
      isActive: false,
      status: 'inactive',
      updatedAt: serverTimestamp() as Timestamp,
    };

    if (reason) {
      updates.notes = reason;
    }

    await updateDoc(doc(db, this.COLLECTION, leadId), updates);
  }

  /**
   * Reactiva un lead
   */
  static async reactivate(leadId: string): Promise<void> {
    await updateDoc(doc(db, this.COLLECTION, leadId), {
      isActive: true,
      status: 'new',
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Elimina un lead
   */
  static async delete(leadId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, leadId);
    await deleteDoc(docRef);
  }

  /**
   * Busca leads por nombre o negocio
   */
  static async search(searchTerm: string): Promise<ProviderLead[]> {
    // Note: Firestore no soporta búsqueda de texto completo
    // Esta implementación obtiene todos los leads y filtra en cliente
    // Para producción, considera usar Algolia o similar
    const allLeads = await this.getAll();

    const term = searchTerm.toLowerCase();
    return allLeads.filter(lead =>
      lead.contactInfo.name.toLowerCase().includes(term) ||
      lead.contactInfo.businessName.toLowerCase().includes(term) ||
      lead.contactInfo.email.toLowerCase().includes(term)
    );
  }

  /**
   * Obtiene estadísticas de leads
   */
  static async getStats(): Promise<{
    total: number;
    byStatus: Record<LeadStatus, number>;
    byType: Record<ProviderType, number>;
    active: number;
    needsFollowUp: number;
  }> {
    const allLeads = await this.getAll();

    const stats = {
      total: allLeads.length,
      byStatus: {
        new: 0,
        contacted: 0,
        interested: 0,
        invited: 0,
        claimed: 0,
        rejected: 0,
        inactive: 0,
      } as Record<LeadStatus, number>,
      byType: {
        cook: 0,
        driver: 0,
        tour_guide: 0,
        artisan: 0,
        transport: 0,
        service: 0,
        other: 0,
      } as Record<ProviderType, number>,
      active: 0,
      needsFollowUp: 0,
    };

    const now = new Date();

    allLeads.forEach(lead => {
      // Count by status
      stats.byStatus[lead.status]++;

      // Count by type
      stats.byType[lead.type]++;

      // Count active
      if (lead.isActive) {
        stats.active++;
      }

      // Count needs follow-up
      if (lead.contactHistory && lead.contactHistory.length > 0) {
        const lastContact = lead.contactHistory[lead.contactHistory.length - 1];
        if (lastContact.nextFollowUp) {
          const followUpDate = lastContact.nextFollowUp instanceof Date
            ? lastContact.nextFollowUp
            : lastContact.nextFollowUp.toDate();

          if (followUpDate <= now && lead.status !== 'claimed') {
            stats.needsFollowUp++;
          }
        }
      }
    });

    return stats;
  }

  /**
   * Obtiene leads que necesitan seguimiento
   */
  static async getLeadsNeedingFollowUp(): Promise<ProviderLead[]> {
    const allLeads = await this.getActive();
    const now = new Date();

    return allLeads.filter(lead => {
      if (!lead.contactHistory || lead.contactHistory.length === 0) {
        return false;
      }

      const lastContact = lead.contactHistory[lead.contactHistory.length - 1];
      if (!lastContact.nextFollowUp) {
        return false;
      }

      const followUpDate = lastContact.nextFollowUp instanceof Date
        ? lastContact.nextFollowUp
        : lastContact.nextFollowUp.toDate();

      return followUpDate <= now;
    });
  }
}
