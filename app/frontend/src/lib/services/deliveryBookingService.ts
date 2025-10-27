import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PaymentService, PaymentItem, PaymentCustomer } from './paymentService';

export interface DeliveryOrder {
  id?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    dishId: string;
    name: string;
    cookerId: string;
    cookerName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  deliveryAddress: {
    street: string;
    city: string;
    instructions?: string;
  };
  status: 'pending_payment' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  payment: {
    method: 'mercadopago';
    status: 'pending' | 'approved' | 'rejected';
    preferenceId?: string;
    transactionId?: string;
  };
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  estimatedDeliveryTime?: string;
}

export class DeliveryBookingService {
  private static COLLECTION = 'deliveryOrders';

  /**
   * Crea una orden de delivery con pago de Mercado Pago
   */
  static async createOrderWithPayment(
    order: Omit<DeliveryOrder, 'id' | 'payment' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<{
    orderId: string;
    preferenceId: string;
    initPoint: string;
  }> {
    try {
      // Crear orden en Firestore
      const orderData: Partial<DeliveryOrder> = {
        ...order,
        status: 'pending_payment',
        payment: {
          method: 'mercadopago',
          status: 'pending',
        },
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), orderData);

      // Crear items para Mercado Pago
      const items: PaymentItem[] = [
        ...order.items.map(item => ({
          title: item.name,
          description: `Por ${item.cookerName}`,
          quantity: item.quantity,
          unit_price: item.price,
          category_id: 'food',
        })),
      ];

      if (order.deliveryFee > 0) {
        items.push({
          title: 'Costo de envío',
          quantity: 1,
          unit_price: order.deliveryFee,
        });
      }

      if (order.serviceFee > 0) {
        items.push({
          title: 'Comisión de servicio',
          quantity: 1,
          unit_price: order.serviceFee,
        });
      }

      const customer: PaymentCustomer = {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      };

      // Crear preferencia de pago
      const { preferenceId, initPoint } = await PaymentService.createPaymentPreference(
        docRef.id,
        items,
        customer,
        'delivery',
        typeof window !== 'undefined' ? window.location.origin : undefined,
        {
          customer_id: order.customerId,
          delivery_address: order.deliveryAddress,
        }
      );

      // Actualizar orden con preferenceId
      await updateDoc(doc(db, this.COLLECTION, docRef.id), {
        'payment.preferenceId': preferenceId,
        updatedAt: serverTimestamp(),
      });

      return {
        orderId: docRef.id,
        preferenceId,
        initPoint,
      };
    } catch (error) {
      console.error('Error creating delivery order with payment:', error);
      throw error;
    }
  }

  /**
   * Obtiene una orden por ID
   */
  static async getById(orderId: string): Promise<DeliveryOrder | null> {
    const docRef = doc(db, this.COLLECTION, orderId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as DeliveryOrder;
  }

  /**
   * Actualiza el estado del pago de una orden
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: 'approved' | 'pending' | 'rejected',
    transactionId?: string
  ): Promise<void> {
    const updates: Record<string, unknown> = {
      'payment.status': paymentStatus,
      updatedAt: serverTimestamp(),
    };

    if (transactionId) {
      updates['payment.transactionId'] = transactionId;
    }

    if (paymentStatus === 'approved') {
      updates.status = 'confirmed';
      updates.estimatedDeliveryTime = '30-45 minutos';
    } else if (paymentStatus === 'rejected') {
      updates.status = 'cancelled';
    }

    await updateDoc(doc(db, this.COLLECTION, orderId), updates);
  }

  /**
   * Actualiza el estado de una orden
   */
  static async updateOrderStatus(
    orderId: string,
    status: DeliveryOrder['status']
  ): Promise<void> {
    await updateDoc(doc(db, this.COLLECTION, orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  }
}
