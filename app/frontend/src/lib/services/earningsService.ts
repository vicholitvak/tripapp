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
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ProviderEarnings,
  EarningsTransaction,
  PayoutRequest,
} from '@/types/marketplace';

export class EarningsService {
  private static EARNINGS_COLLECTION = 'provider_earnings';
  private static PAYOUT_COLLECTION = 'payout_requests';

  /**
   * Obtiene o crea registro de ganancias para un proveedor
   */
  static async getOrCreateEarnings(providerId: string): Promise<ProviderEarnings> {
    const q = query(
      collection(db, this.EARNINGS_COLLECTION),
      where('providerId', '==', providerId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Crear registro nuevo
      const earnings: ProviderEarnings = {
        providerId,
        totalRevenue: 0,
        totalCommission: 0,
        totalEarnings: 0,
        paidOut: 0,
        pendingPayout: 0,
        transactions: [],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(db, this.EARNINGS_COLLECTION), earnings);

      return {
        ...earnings,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ProviderEarnings;
  }

  /**
   * Registra una transacción de ganancia (cuando se completa un pedido)
   */
  static async recordTransaction(
    providerId: string,
    orderId: string,
    amount: number,
    commission: number
  ): Promise<void> {
    const earnings = await this.getOrCreateEarnings(providerId);

    const transaction: EarningsTransaction = {
      orderId,
      amount,
      commission,
      revenue: amount - commission,
      date: serverTimestamp() as Timestamp,
      status: 'pending',
    };

    const docRef = doc(db, this.EARNINGS_COLLECTION, earnings.id!);

    await updateDoc(docRef, {
      totalRevenue: increment(amount),
      totalCommission: increment(commission),
      totalEarnings: increment(amount - commission),
      pendingPayout: increment(amount - commission),
      transactions: [...earnings.transactions, transaction],
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Obtiene ganancias de un proveedor
   */
  static async getEarnings(providerId: string): Promise<ProviderEarnings | null> {
    const q = query(
      collection(db, this.EARNINGS_COLLECTION),
      where('providerId', '==', providerId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ProviderEarnings;
  }

  /**
   * Obtiene transacciones de un proveedor
   */
  static async getTransactions(
    providerId: string,
    limit: number = 50
  ): Promise<EarningsTransaction[]> {
    const earnings = await this.getEarnings(providerId);

    if (!earnings) {
      return [];
    }

    // Ordenar por fecha descendente
    return earnings.transactions
      .sort((a, b) => {
        const aDate = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
        const bDate = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, limit);
  }

  /**
   * Crea una solicitud de payout
   */
  static async createPayoutRequest(
    providerId: string,
    amount: number,
    bankInfo: {
      accountNumber: string;
      bankName: string;
      accountHolder: string;
      accountType: 'cuenta_corriente' | 'cuenta_vista' | 'rut';
    }
  ): Promise<PayoutRequest> {
    const payout: PayoutRequest = {
      providerId,
      amount,
      status: 'pending',
      bankInfo,
      requestedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, this.PAYOUT_COLLECTION), payout);

    return {
      ...payout,
      id: docRef.id,
      requestedAt: new Date(),
    };
  }

  /**
   * Obtiene solicitudes de payout de un proveedor
   */
  static async getProviderPayoutRequests(providerId: string): Promise<PayoutRequest[]> {
    const q = query(
      collection(db, this.PAYOUT_COLLECTION),
      where('providerId', '==', providerId),
      orderBy('requestedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as PayoutRequest));
  }

  /**
   * Obtiene todas las solicitudes de payout pendientes (admin)
   */
  static async getPendingPayoutRequests(): Promise<PayoutRequest[]> {
    const q = query(
      collection(db, this.PAYOUT_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as PayoutRequest));
  }

  /**
   * Aprueba una solicitud de payout
   */
  static async approvePayoutRequest(payoutId: string): Promise<void> {
    const docRef = doc(db, this.PAYOUT_COLLECTION, payoutId);
    await updateDoc(docRef, {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Rechaza una solicitud de payout
   */
  static async rejectPayoutRequest(payoutId: string, reason?: string): Promise<void> {
    const docRef = doc(db, this.PAYOUT_COLLECTION, payoutId);
    await updateDoc(docRef, {
      status: 'rejected',
      notes: reason,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Marca una solicitud de payout como procesada
   */
  static async markPayoutAsProcessed(
    payoutId: string,
    providerId: string,
    amount: number
  ): Promise<void> {
    // Actualizar solicitud
    const docRef = doc(db, this.PAYOUT_COLLECTION, payoutId);
    await updateDoc(docRef, {
      status: 'processed',
      processedAt: serverTimestamp(),
    });

    // Actualizar ganancias del proveedor
    const earnings = await this.getEarnings(providerId);
    if (earnings) {
      const earningsRef = doc(db, this.EARNINGS_COLLECTION, earnings.id!);
      await updateDoc(earningsRef, {
        paidOut: increment(amount),
        pendingPayout: increment(-amount),
        lastPayout: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  /**
   * Obtiene resumen de ganancias para un período
   */
  static async getEarningsSummary(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEarnings: number;
    totalCommission: number;
    transactionCount: number;
  }> {
    const earnings = await this.getEarnings(providerId);

    if (!earnings) {
      return {
        totalEarnings: 0,
        totalCommission: 0,
        transactionCount: 0,
      };
    }

    const filtered = earnings.transactions.filter(t => {
      const date = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
      return date >= startDate && date <= endDate;
    });

    return {
      totalEarnings: filtered.reduce((acc, t) => acc + t.revenue, 0),
      totalCommission: filtered.reduce((acc, t) => acc + t.commission, 0),
      transactionCount: filtered.length,
    };
  }

  /**
   * Obtiene estadísticas generales (admin)
   */
  static async getPlatformStats(): Promise<{
    totalEarnings: number;
    totalCommissions: number;
    totalPayouts: number;
    providersCount: number;
  }> {
    const snapshot = await getDocs(
      collection(db, this.EARNINGS_COLLECTION)
    );

    let totalEarnings = 0;
    let totalCommissions = 0;
    let totalPayouts = 0;

    snapshot.docs.forEach(doc => {
      const earnings = doc.data() as ProviderEarnings;
      totalEarnings += earnings.totalEarnings;
      totalCommissions += earnings.totalCommission;
      totalPayouts += earnings.paidOut;
    });

    return {
      totalEarnings,
      totalCommissions,
      totalPayouts,
      providersCount: snapshot.size,
    };
  }
}
