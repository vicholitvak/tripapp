import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TourBooking } from '@/types/tours';
import { PaymentService, PaymentItem, PaymentCustomer } from './paymentService';

export class TourBookingService {
  private static COLLECTION = 'tourBookings';

  /**
   * Crea una reserva de tour y genera el pago en Mercado Pago
   */
  static async createBookingWithPayment(
    booking: Partial<TourBooking>,
    customerName: string,
    customerEmail: string,
    customerPhone?: string
  ): Promise<{
    bookingId: string;
    preferenceId: string;
    initPoint: string;
  }> {
    try {
      // Crear el booking en Firestore con estado pending_payment
      const bookingData: Partial<TourBooking> = {
        ...booking,
        status: 'pending_payment',
        payment: {
          method: 'mercadopago',
          status: 'pending',
        },
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), bookingData);

      // Crear items para Mercado Pago
      const items: PaymentItem[] = [
        {
          title: booking.tourTitle || 'Tour',
          description: `Reserva para ${booking.numberOfPeople} persona${
            booking.numberOfPeople! > 1 ? 's' : ''
          }`,
          quantity: booking.numberOfPeople!,
          unit_price: booking.pricePerPerson!,
          category_id: 'tours',
        },
      ];

      // Si hay descuento, aplicarlo
      if (booking.discountApplied && booking.discountApplied > 0) {
        const discountAmount = (booking.totalAmount! * booking.discountApplied) / 100;
        items.push({
          title: 'Descuento aplicado',
          description: `${booking.discountApplied}% de descuento`,
          quantity: 1,
          unit_price: -discountAmount,
        });
      }

      const customer: PaymentCustomer = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      };

      // Crear preferencia de pago en Mercado Pago
      const { preferenceId, initPoint } = await PaymentService.createPaymentPreference(
        docRef.id,
        items,
        customer,
        'tour',
        typeof window !== 'undefined' ? window.location.origin : undefined,
        {
          tour_id: booking.tourId,
          tour_instance_id: booking.tourInstanceId,
          customer_id: booking.customerId,
        }
      );

      // Actualizar el booking con el preferenceId
      await updateDoc(doc(db, this.COLLECTION, docRef.id), {
        'payment.preferenceId': preferenceId,
        updatedAt: serverTimestamp(),
      });

      return {
        bookingId: docRef.id,
        preferenceId,
        initPoint,
      };
    } catch (error) {
      console.error('Error creating booking with payment:', error);
      throw error;
    }
  }

  /**
   * Obtiene un booking por ID
   */
  static async getById(bookingId: string): Promise<TourBooking | null> {
    const docRef = doc(db, this.COLLECTION, bookingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as TourBooking;
  }

  /**
   * Actualiza el estado del pago de un booking
   */
  static async updatePaymentStatus(
    bookingId: string,
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'partially_refunded',
    transactionId?: string
  ): Promise<void> {
    const updates: Record<string, unknown> = {
      'payment.status': paymentStatus,
      updatedAt: serverTimestamp(),
    };

    if (transactionId) {
      updates['payment.transactionId'] = transactionId;
    }

    // Si el pago fue aprobado, cambiar el estado del booking
    if (paymentStatus === 'paid') {
      updates.status = 'confirmed';
      updates.confirmedAt = serverTimestamp();
    } else if (paymentStatus === 'refunded') {
      updates.status = 'cancelled';
      updates.cancelledAt = serverTimestamp();
    }

    await updateDoc(doc(db, this.COLLECTION, bookingId), updates);
  }

  /**
   * Obtiene todos los bookings de un cliente
   */
  static async getByCustomerId(customerId: string): Promise<TourBooking[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('customerId', '==', customerId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TourBooking);
  }

  /**
   * Obtiene todos los bookings de un tour
   */
  static async getByTourId(tourId: string): Promise<TourBooking[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('tourId', '==', tourId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TourBooking);
  }

  /**
   * Cancela un booking
   */
  static async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    await updateDoc(doc(db, this.COLLECTION, bookingId), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancellationReason: reason || 'Cancelado por el usuario',
      updatedAt: serverTimestamp(),
    });
  }
}
