import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Provider,
  ProviderStatus,
  ProviderType,
  OnboardingProgress,
  ApprovalRequest,
  Service,
} from '@/types/provider';

export class ProviderService {
  private static PROVIDERS_COLLECTION = 'providers';
  private static ONBOARDING_COLLECTION = 'onboardingProgress';
  private static APPROVALS_COLLECTION = 'approvalRequests';

  // ==================== PROVIDER CRUD ====================

  /**
   * Crea un nuevo proveedor (draft inicial)
   */
  static async createProvider(
    userId: string,
    invitationCode: string,
    type: ProviderType
  ): Promise<Provider> {
    const provider: Provider = {
      userId,
      type,
      status: 'pending',
      invitationCode,
      personalInfo: {
        displayName: '',
        phone: '',
        email: '',
        bio: '',
      },
      businessInfo: {
        name: '',
        description: '',
        category: '',
        photos: [],
      },
      services: [],
      rating: 0,
      reviewCount: 0,
      completedOrders: 0,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(
      collection(db, this.PROVIDERS_COLLECTION),
      provider
    );

    return {
      ...provider,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Obtiene un proveedor por userId
   */
  static async getByUserId(userId: string): Promise<Provider | null> {
    const q = query(
      collection(db, this.PROVIDERS_COLLECTION),
      where('userId', '==', userId),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Provider;
  }

  /**
   * Obtiene un proveedor por ID
   */
  static async getById(providerId: string): Promise<Provider | null> {
    const docRef = doc(db, this.PROVIDERS_COLLECTION, providerId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Provider;
  }

  /**
   * Actualiza información personal del proveedor
   */
  static async updatePersonalInfo(
    providerId: string,
    personalInfo: Partial<Provider['personalInfo']>
  ): Promise<void> {
    const docRef = doc(db, this.PROVIDERS_COLLECTION, providerId);
    await updateDoc(docRef, {
      personalInfo,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Actualiza información del negocio
   */
  static async updateBusinessInfo(
    providerId: string,
    businessInfo: Partial<Provider['businessInfo']>
  ): Promise<void> {
    const docRef = doc(db, this.PROVIDERS_COLLECTION, providerId);
    await updateDoc(docRef, {
      businessInfo,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Actualiza servicios del proveedor
   */
  static async updateServices(
    providerId: string,
    services: Service[]
  ): Promise<void> {
    const docRef = doc(db, this.PROVIDERS_COLLECTION, providerId);
    await updateDoc(docRef, {
      services,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Actualiza estado del proveedor
   */
  static async updateStatus(
    providerId: string,
    status: ProviderStatus
  ): Promise<void> {
    const docRef = doc(db, this.PROVIDERS_COLLECTION, providerId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  // ==================== ONBOARDING PROGRESS ====================

  /**
   * Crea progreso de onboarding
   */
  static async createOnboardingProgress(
    userId: string,
    invitationCode: string
  ): Promise<OnboardingProgress> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días para completar

    const progress: OnboardingProgress = {
      userId,
      invitationCode,
      currentStep: 0,
      totalSteps: 7, // account, profile, business, services, media, verification, review
      completedSteps: [],
      draftData: {},
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      expiresAt: Timestamp.fromDate(expiresAt),
    };

    await setDoc(doc(db, this.ONBOARDING_COLLECTION, userId), progress);

    return {
      ...progress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Obtiene progreso de onboarding
   */
  static async getOnboardingProgress(
    userId: string
  ): Promise<OnboardingProgress | null> {
    const docRef = doc(db, this.ONBOARDING_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as OnboardingProgress;
  }

  /**
   * Actualiza progreso de onboarding
   */
  static async updateOnboardingProgress(
    userId: string,
    step: string,
    data: Partial<OnboardingProgress['draftData']>
  ): Promise<void> {
    const docRef = doc(db, this.ONBOARDING_COLLECTION, userId);
    const current = await this.getOnboardingProgress(userId);

    if (!current) return;

    const completedSteps = current.completedSteps.includes(step)
      ? current.completedSteps
      : [...current.completedSteps, step];

    await updateDoc(docRef, {
      completedSteps,
      currentStep: completedSteps.length,
      draftData: { ...current.draftData, ...data },
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Completa onboarding y crea provider
   */
  static async completeOnboarding(userId: string): Promise<Provider> {
    const progress = await this.getOnboardingProgress(userId);

    if (!progress) {
      throw new Error('No onboarding progress found');
    }

    // Crear provider con los datos del draft
    const provider: Provider = {
      userId,
      type: progress.draftData.type!,
      status: 'pending',
      invitationCode: progress.invitationCode,
      personalInfo: progress.draftData.personalInfo as Provider['personalInfo'],
      businessInfo: progress.draftData.businessInfo as Provider['businessInfo'],
      services: progress.draftData.services || [],
      rating: 0,
      reviewCount: 0,
      completedOrders: 0,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(
      collection(db, this.PROVIDERS_COLLECTION),
      provider
    );

    // Crear solicitud de aprobación
    await this.createApprovalRequest(docRef.id, provider);

    return {
      ...provider,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // ==================== APPROVAL SYSTEM ====================

  /**
   * Crea solicitud de aprobación
   */
  static async createApprovalRequest(
    providerId: string,
    provider: Provider
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      providerId,
      providerName: provider.businessInfo.name,
      type: provider.type,
      status: 'pending',
      requestedAt: serverTimestamp() as Timestamp,
      providerSnapshot: provider,
    };

    const docRef = await addDoc(
      collection(db, this.APPROVALS_COLLECTION),
      request
    );

    return {
      ...request,
      id: docRef.id,
      requestedAt: new Date(),
    };
  }

  /**
   * Aprueba un proveedor
   */
  static async approveProvider(
    requestId: string,
    providerId: string,
    adminUserId: string,
    notes?: string
  ): Promise<void> {
    // Actualizar solicitud
    const requestRef = doc(db, this.APPROVALS_COLLECTION, requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUserId,
      reviewNotes: notes,
    });

    // Actualizar proveedor
    const providerRef = doc(db, this.PROVIDERS_COLLECTION, providerId);
    await updateDoc(providerRef, {
      status: 'active',
      approvedAt: serverTimestamp(),
      approvedBy: adminUserId,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Rechaza un proveedor
   */
  static async rejectProvider(
    requestId: string,
    providerId: string,
    adminUserId: string,
    reason: string
  ): Promise<void> {
    // Actualizar solicitud
    const requestRef = doc(db, this.APPROVALS_COLLECTION, requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUserId,
      reviewNotes: reason,
    });

    // Actualizar proveedor
    const providerRef = doc(db, this.PROVIDERS_COLLECTION, providerId);
    await updateDoc(providerRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectedReason: reason,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Lista solicitudes pendientes de aprobación
   */
  static async listPendingApprovals(): Promise<ApprovalRequest[]> {
    const q = query(
      collection(db, this.APPROVALS_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ApprovalRequest));
  }

  // ==================== QUERIES ====================

  /**
   * Lista proveedores activos por tipo
   */
  static async listActiveByType(type: ProviderType): Promise<Provider[]> {
    const q = query(
      collection(db, this.PROVIDERS_COLLECTION),
      where('type', '==', type),
      where('status', '==', 'active'),
      orderBy('rating', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Provider));
  }

  /**
   * Lista todos los proveedores activos
   */
  static async listAllActive(): Promise<Provider[]> {
    const q = query(
      collection(db, this.PROVIDERS_COLLECTION),
      where('status', '==', 'active'),
      orderBy('rating', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Provider));
  }

  /**
   * Búsqueda de proveedores
   */
  static async search(searchTerm: string, type?: ProviderType): Promise<Provider[]> {
    // Nota: Firestore no tiene búsqueda full-text nativa
    // Para producción, usar Algolia o similar
    let q = query(
      collection(db, this.PROVIDERS_COLLECTION),
      where('status', '==', 'active')
    );

    if (type) {
      q = query(q, where('type', '==', type));
    }

    const snapshot = await getDocs(q);
    const providers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Provider));

    // Filtro local básico
    const term = searchTerm.toLowerCase();
    return providers.filter(p =>
      p.businessInfo.name.toLowerCase().includes(term) ||
      p.businessInfo.description.toLowerCase().includes(term) ||
      p.personalInfo.displayName.toLowerCase().includes(term)
    );
  }
}
