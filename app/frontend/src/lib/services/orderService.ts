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
import {
  Order,
  ProviderOrder,
  OrderStatus,
  UnifiedCart,
  PaymentInfo,
  ShippingInfo,
} from '@/types/marketplace';
import { DEFAULT_COMMISSIONS } from '@/types/marketplace';

export class OrderService {
  private static COLLECTION = 'orders';

  /**
   * Crea una orden desde el carrito unificado
   * Crea órdenes separadas por proveedor
   */
  static async createOrderFromCart(
    cart: UnifiedCart,
    customerId: string,
    customerEmail: string,
    payment: PaymentInfo,
    shippingInfo?: ShippingInfo
  ): Promise<Order> {
    // Crear órdenes por proveedor
    const providerOrders: ProviderOrder[] = cart.itemsByProvider.map(provider => {
      const commission = provider.items.reduce((acc, item) => {
        // Calcular comisión según categoría (default 15%)
        const rate = 15; // Default rate
        return acc + (item.price * item.quantity * (rate / 100));
      }, 0);

      return {
        orderId: `temp-${Date.now()}-${Math.random()}`, // Se actualiza después
        providerId: provider.providerId,
        providerName: provider.providerName,
        items: provider.items,
        subtotal: provider.subtotal,
        commission,
        providerRevenue: provider.subtotal - commission,
        status: 'pending' as const,
        createdAt: serverTimestamp() as Timestamp,
      };
    });

    const order: Order = {
      customerId,
      customerEmail,
      status: 'pending',
      providerOrders,
      subtotal: cart.subtotal,
      totalCommission: cart.commission,
      total: cart.total,
      payment,
      shipping: shippingInfo,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Crear orden en Firestore
    const docRef = await addDoc(collection(db, this.COLLECTION), order);

    // Actualizar IDs de órdenes de proveedor
    providerOrders.forEach((po, idx) => {
      order.providerOrders[idx].orderId = docRef.id;
    });

    await updateDoc(doc(db, this.COLLECTION, docRef.id), {
      providerOrders,
    });

    return {
      ...order,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Obtiene una orden por ID
   */
  static async getById(orderId: string): Promise<Order | null> {
    const docRef = doc(db, this.COLLECTION, orderId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Order;
  }

  /**
   * Obtiene órdenes del cliente
   */
  static async getCustomerOrders(customerId: string): Promise<Order[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
  }

  /**
   * Obtiene órdenes para un proveedor
   */
  static async getProviderOrders(providerId: string): Promise<ProviderOrder[]> {
    try {
      // Fallback: buscar manualmente (Firestore no soporta array-contains complejo)
      const allOrders = await this.getAllOrders();
      const providerOrders: ProviderOrder[] = [];

      allOrders.forEach(order => {
        const filtered = order.providerOrders.filter(po => po.providerId === providerId);
        providerOrders.push(...filtered);
      });

      return providerOrders;
    } catch (error) {
      console.error('Error getting provider orders:', error);
      return [];
    }
  }

  /**
   * Obtiene todas las órdenes (admin)
   */
  static async getAllOrders(): Promise<Order[]> {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
  }

  /**
   * Actualiza estado de una orden
   */
  static async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const docRef = doc(db, this.COLLECTION, orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Actualiza estado de una orden de proveedor específico
   */
  static async updateProviderOrderStatus(
    orderId: string,
    providerId: string,
    status: OrderStatus
  ): Promise<void> {
    const order = await this.getById(orderId);
    if (!order) return;

    const updatedProviderOrders = order.providerOrders.map(po =>
      po.providerId === providerId ? { ...po, status } : po
    );

    const docRef = doc(db, this.COLLECTION, orderId);
    await updateDoc(docRef, {
      providerOrders: updatedProviderOrders,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Confirma pago de una orden
   */
  static async confirmPayment(
    orderId: string,
    transactionId: string
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'confirmed',
      'payment.status': 'confirmed',
      'payment.transactionId': transactionId,
      'payment.paidAt': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Obtiene órdenes pendientes de pago (admin)
   */
  static async getPendingOrders(): Promise<Order[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
  }

  /**
   * Obtiene órdenes completadas (para estadísticas)
   */
  static async getCompletedOrders(): Promise<Order[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc')
    );

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Order));
    } catch {
      return [];
    }
  }

  /**
   * Calcula estadísticas de ventas
   */
  static async getSalesStats(providerId?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    averageOrderValue: number;
  }> {
    const allOrders = providerId
      ? (await this.getProviderOrders(providerId)).map(po => ({
          total: po.subtotal,
          commission: po.commission,
        }))
      : (await this.getCompletedOrders()).map(o => ({
          total: o.subtotal,
          commission: o.totalCommission,
        }));

    const totalRevenue = allOrders.reduce((acc, o) => acc + o.total, 0);
    const totalCommission = allOrders.reduce((acc, o) => acc + o.commission, 0);

    return {
      totalOrders: allOrders.length,
      totalRevenue,
      totalCommission,
      averageOrderValue: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
    };
  }

  /**
   * Cancela una orden
   */
  static async cancelOrder(orderId: string, _reason?: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'cancelled',
      'payment.status': 'refunded',
      updatedAt: serverTimestamp(),
    });
  }
}
