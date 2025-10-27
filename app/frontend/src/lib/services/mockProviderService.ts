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
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Provider,
  ProviderType,
  Service,
  MockConversionLog,
} from '@/types/provider';
import { NotificationService } from './notificationService';

export class MockProviderService {
  private static PROVIDERS_COLLECTION = 'providers';
  private static CONVERSION_LOGS_COLLECTION = 'mockConversionLogs';

  /**
   * Crea un nuevo mock provider
   */
  static async createMock(data: {
    type: ProviderType;
    businessName: string;
    description: string;
    category: string;
    displayName: string;
    phone?: string;
    email: string;
    bio?: string;
    photos?: string[];
    services?: Service[];
    featured?: boolean;
  }, adminId: string): Promise<Provider> {
    const mockProvider: Provider = {
      accountType: 'mock',
      type: data.type,
      status: 'mock',
      personalInfo: {
        displayName: data.displayName,
        phone: data.phone || '',
        email: data.email,
        bio: data.bio || '',
      },
      businessInfo: {
        name: data.businessName,
        description: data.description,
        category: data.category,
        photos: data.photos || [],
      },
      services: data.services || [],
      rating: 0,
      reviewCount: 0,
      completedOrders: 0,
      featured: data.featured || false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(
      collection(db, this.PROVIDERS_COLLECTION),
      mockProvider
    );

    return {
      ...mockProvider,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Lista todos los mock providers
   */
  static async getAllMocks(): Promise<Provider[]> {
    const q = query(
      collection(db, this.PROVIDERS_COLLECTION),
      where('accountType', '==', 'mock'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Provider));
  }

  /**
   * Obtiene un mock provider por ID
   */
  static async getMockById(mockId: string): Promise<Provider | null> {
    const docRef = doc(db, this.PROVIDERS_COLLECTION, mockId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const provider = { id: docSnap.id, ...docSnap.data() } as Provider;

    // Verificar que sea un mock
    if (provider.accountType !== 'mock') {
      return null;
    }

    return provider;
  }

  /**
   * Actualiza un mock provider
   */
  static async updateMock(
    mockId: string,
    data: Partial<Provider>
  ): Promise<void> {
    const docRef = doc(db, this.PROVIDERS_COLLECTION, mockId);

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Elimina un mock provider
   * Solo si no tiene invitación vinculada o si la invitación está cancelled
   */
  static async deleteMock(mockId: string): Promise<void> {
    // TODO: Verificar que no tenga invitación pending/claimed
    const docRef = doc(db, this.PROVIDERS_COLLECTION, mockId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Mock provider not found');
    }

    const provider = docSnap.data() as Provider;

    if (provider.accountType !== 'mock') {
      throw new Error('Provider is not a mock');
    }

    if (provider.linkedInvitationId) {
      throw new Error('Cannot delete mock with active invitation. Cancel invitation first.');
    }

    // Usar batch para eliminar provider y sus productos/tours relacionados
    const batch = writeBatch(db);
    batch.delete(docRef);

    // TODO: Eliminar listings/tours vinculados al mock
    // Esto lo haremos cuando implementemos la integración con listings/tours

    await batch.commit();
  }

  /**
   * Convierte un mock provider en un provider real
   * Esta es la función clave del sistema de onboarding
   */
  static async claimMock(
    mockProviderId: string,
    userId: string,
    invitationCode: string
  ): Promise<Provider> {
    // 1. Obtener el mock provider
    const mockProvider = await this.getMockById(mockProviderId);

    if (!mockProvider) {
      throw new Error('Mock provider not found');
    }

    if (mockProvider.accountType !== 'mock') {
      throw new Error('Provider is not a mock');
    }

    // 2. Crear snapshot del mock para log
    const mockSnapshot = { ...mockProvider };

    // 3. Convertir mock → real
    const batch = writeBatch(db);

    const providerRef = doc(db, this.PROVIDERS_COLLECTION, mockProviderId);

    const updatedProvider: Partial<Provider> = {
      accountType: 'real',
      userId: userId,
      status: 'draft', // El proveedor debe completar onboarding
      invitationCode: invitationCode,
      claimedAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    batch.update(providerRef, updatedProvider);

    // 4. Crear log de conversión
    const conversionLog: Omit<MockConversionLog, 'id'> = {
      mockProviderId,
      realProviderId: mockProviderId, // Mismo ID, solo cambia tipo
      invitationId: invitationCode, // Usar código por ahora, luego mejorar
      convertedBy: userId,
      convertedAt: serverTimestamp() as Timestamp,
      mockSnapshot,
      changes: [
        { field: 'accountType', oldValue: 'mock', newValue: 'real' },
        { field: 'userId', oldValue: null, newValue: userId },
        { field: 'status', oldValue: 'mock', newValue: 'draft' },
      ],
    };

    const logRef = collection(db, this.CONVERSION_LOGS_COLLECTION);
    batch.set(doc(logRef), conversionLog);

    await batch.commit();

    // 5. Enviar notificación al admin (best-effort)
    try {
      // Buscar el admin que creó el mock (si está en metadata)
      // Por ahora, notificar mediante log en consola
      console.log('🎉 Mock reclamado:', {
        mockProviderId,
        businessName: mockProvider.businessInfo.name,
        claimedBy: userId,
      });

      // TODO: Obtener adminUserId del mock o invitación y enviar notificación
      // await NotificationService.notifyMockClaimed(
      //   adminUserId,
      //   mockProviderId,
      //   mockProvider.businessInfo.name,
      //   userId,
      //   mockProviderId
      // );
    } catch (error) {
      console.error('Error sending notification:', error);
      // No bloquear el flujo si falla la notificación
    }

    return {
      ...mockProvider,
      ...updatedProvider,
      claimedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Obtiene el historial de conversiones
   */
  static async getConversionLogs(): Promise<MockConversionLog[]> {
    const q = query(
      collection(db, this.CONVERSION_LOGS_COLLECTION),
      orderBy('convertedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as MockConversionLog));
  }

  /**
   * Obtiene el log de conversión de un provider específico
   */
  static async getConversionLog(
    providerId: string
  ): Promise<MockConversionLog | null> {
    const q = query(
      collection(db, this.CONVERSION_LOGS_COLLECTION),
      where('realProviderId', '==', providerId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as MockConversionLog;
  }

  /**
   * Verifica si un mock provider tiene datos mínimos requeridos
   */
  static validateMock(provider: Provider): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!provider.businessInfo.name) {
      errors.push('Business name is required');
    }

    if (!provider.businessInfo.description) {
      errors.push('Business description is required');
    }

    if (!provider.personalInfo.email) {
      errors.push('Email is required');
    }

    if (!provider.personalInfo.displayName) {
      errors.push('Display name is required');
    }

    if (provider.businessInfo.photos.length === 0) {
      errors.push('At least one photo is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Obtiene estadísticas de mocks
   */
  static async getMockStats(): Promise<{
    total: number;
    withInvitation: number;
    claimed: number;
    pending: number;
  }> {
    const mocks = await this.getAllMocks();

    return {
      total: mocks.length,
      withInvitation: mocks.filter(m => m.linkedInvitationId).length,
      claimed: mocks.filter(m => m.claimedAt).length,
      pending: mocks.filter(m => !m.claimedAt && m.linkedInvitationId).length,
    };
  }
}
