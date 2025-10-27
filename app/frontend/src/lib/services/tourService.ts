import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Tour,
  TourInstance,
  TourBooking,
  RecurringSchedule,
  DynamicPricing,
  TourInstanceStatus,
  isTourAtRisk,
  calculateDynamicDiscount,
} from '@/types/tours';

export class TourService {
  private static TOURS_COLLECTION = 'tours';
  private static INSTANCES_COLLECTION = 'tour_instances';
  private static BOOKINGS_COLLECTION = 'tour_bookings';

  // ==================== TOURS BASE ====================

  /**
   * Crear un nuevo tour
   */
  static async createTour(providerId: string, tourData: Partial<Tour>): Promise<string> {
    const tour: Tour = {
      providerId,
      providerName: tourData.providerName || '',
      title: tourData.title || '',
      description: tourData.description || '',
      category: tourData.category!,
      images: tourData.images || [],
      difficulty: tourData.difficulty!,
      duration: tourData.duration!,
      scheduleTag: tourData.scheduleTag!,
      activityTypes: tourData.activityTypes || [],
      basePrice: tourData.basePrice || 0,
      currency: 'CLP',
      altitude: tourData.altitude,
      groupSize: tourData.groupSize!,
      includes: tourData.includes || [],
      pickupIncluded: tourData.pickupIncluded || false,
      equipmentIncluded: tourData.equipmentIncluded || [],
      physicalRequirements: tourData.physicalRequirements,
      ageRestrictions: tourData.ageRestrictions,
      requirements: tourData.requirements,
      cancellationPolicy: tourData.cancellationPolicy!,
      recurringSchedules: tourData.recurringSchedules,
      rating: 0,
      reviewCount: 0,
      totalBookings: 0,
      status: 'draft',
      featured: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, this.TOURS_COLLECTION), tour);
    return docRef.id;
  }

  /**
   * Obtener tour por ID
   */
  static async getTourById(tourId: string): Promise<Tour | null> {
    const docRef = doc(db, this.TOURS_COLLECTION, tourId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Tour;
  }

  /**
   * Obtener todos los tours activos
   */
  static async getActiveTours(): Promise<Tour[]> {
    const q = query(
      collection(db, this.TOURS_COLLECTION),
      where('status', '==', 'active'),
      orderBy('rating', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Tour));
  }

  /**
   * Obtener tours de un proveedor
   */
  static async getProviderTours(providerId: string): Promise<Tour[]> {
    const q = query(
      collection(db, this.TOURS_COLLECTION),
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Tour));
  }

  /**
   * Actualizar tour
   */
  static async updateTour(tourId: string, updates: Partial<Tour>): Promise<void> {
    const docRef = doc(db, this.TOURS_COLLECTION, tourId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  // ==================== INSTANCIAS DE TOURS ====================

  /**
   * Crear instancia de tour (salida específica)
   */
  static async createTourInstance(
    tourId: string,
    instanceData: Partial<TourInstance>
  ): Promise<string> {
    const tour = await this.getTourById(tourId);
    if (!tour) throw new Error('Tour no encontrado');

    const instance: TourInstance = {
      tourId,
      providerId: tour.providerId,
      date: instanceData.date || new Date(),
      startTime: instanceData.startTime || '09:00',
      endTime: instanceData.endTime || '12:00',
      capacity: instanceData.capacity || tour.groupSize.max,
      minParticipants: instanceData.minParticipants || tour.groupSize.min,
      bookedSpots: 0,
      availableSpots: instanceData.capacity || tour.groupSize.max,
      pricePerPerson: instanceData.pricePerPerson || tour.basePrice,
      status: 'scheduled',
      recurringScheduleId: instanceData.recurringScheduleId,
      isSpecial: instanceData.isSpecial || false,
      meetingPoint: instanceData.meetingPoint,
      notes: instanceData.notes,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, this.INSTANCES_COLLECTION), instance);
    return docRef.id;
  }

  /**
   * Obtener instancias futuras de un tour
   */
  static async getTourInstances(
    tourId: string,
    fromDate?: Date
  ): Promise<TourInstance[]> {
    const startDate = fromDate || new Date();

    const q = query(
      collection(db, this.INSTANCES_COLLECTION),
      where('tourId', '==', tourId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as TourInstance));
  }

  /**
   * Obtener instancias disponibles (con cupos)
   */
  static async getAvailableInstances(
    tourId: string,
    fromDate?: Date
  ): Promise<TourInstance[]> {
    const instances = await this.getTourInstances(tourId, fromDate);

    return instances.filter(
      instance =>
        instance.availableSpots > 0 &&
        (instance.status === 'scheduled' ||
          instance.status === 'filling' ||
          instance.status === 'almost_full' ||
          instance.status === 'at_risk')
    );
  }

  /**
   * Actualizar estado de instancia
   */
  static async updateInstanceStatus(instance: TourInstance): Promise<void> {
    if (!instance.id) return;

    let newStatus: TourInstanceStatus = instance.status;

    // Determinar nuevo estado
    if (instance.availableSpots === 0) {
      newStatus = 'full';
    } else if (instance.bookedSpots >= instance.minParticipants) {
      newStatus = 'confirmed';
    } else if (instance.availableSpots / instance.capacity < 0.2) {
      newStatus = 'almost_full';
    } else {
      // Verificar si está en riesgo
      const hoursUntilTour = this.getHoursUntilTour(instance.date);
      if (isTourAtRisk(instance, hoursUntilTour)) {
        newStatus = 'at_risk';

        // Activar descuento dinámico si no existe
        if (!instance.dynamicPricing?.isActive) {
          await this.activateDynamicPricing(instance, hoursUntilTour);
        }
      } else {
        newStatus = 'filling';
      }
    }

    // Actualizar
    const docRef = doc(db, this.INSTANCES_COLLECTION, instance.id);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Activar descuentos dinámicos (crowdfunding)
   */
  static async activateDynamicPricing(
    instance: TourInstance,
    hoursUntilTour: number
  ): Promise<void> {
    if (!instance.id) return;

    const discountPercentage = calculateDynamicDiscount(instance, hoursUntilTour);

    if (discountPercentage > 0) {
      const dynamicPricing: DynamicPricing = {
        isActive: true,
        discountPercentage,
        reason: hoursUntilTour < 24 ? 'last_minute' : 'low_bookings',
        hoursUntilTour,
        bookedPercentage: (instance.bookedSpots / instance.minParticipants) * 100,
        bonusIncentives: this.getBonusIncentives(discountPercentage),
        validUntil: Timestamp.fromDate(
          new Date((instance.date as Timestamp).toDate().getTime() - 60 * 60 * 1000)
        ), // Hasta 1 hora antes
        createdAt: serverTimestamp() as Timestamp,
      };

      const discountedPrice = Math.round(
        instance.pricePerPerson * (1 - discountPercentage / 100)
      );

      const docRef = doc(db, this.INSTANCES_COLLECTION, instance.id);
      await updateDoc(docRef, {
        dynamicPricing,
        pricePerPerson: discountedPrice,
        originalPrice: instance.pricePerPerson,
        updatedAt: serverTimestamp(),
      });
    }
  }

  /**
   * Generar incentivos bonus según descuento
   */
  private static getBonusIncentives(discountPercentage: number): string[] {
    const incentives: string[] = [];

    if (discountPercentage >= 30) {
      incentives.push('Snack premium incluido', 'Fotos profesionales gratis');
    } else if (discountPercentage >= 20) {
      incentives.push('Snack incluido');
    }

    return incentives;
  }

  /**
   * Calcular horas hasta el tour
   */
  private static getHoursUntilTour(tourDate: Timestamp | Date): number {
    const now = new Date();
    const date = tourDate instanceof Timestamp ? tourDate.toDate() : tourDate;
    const diff = date.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  }

  // ==================== RESERVAS/BOOKINGS ====================

  /**
   * Crear reserva
   */
  static async createBooking(bookingData: Partial<TourBooking>): Promise<string> {
    const instance = await this.getTourInstanceById(bookingData.tourInstanceId!);
    if (!instance) throw new Error('Instancia de tour no encontrada');

    if (instance.availableSpots < bookingData.numberOfPeople!) {
      throw new Error('No hay suficientes cupos disponibles');
    }

    // Generar código de confirmación
    const confirmationCode = this.generateConfirmationCode();

    const booking: TourBooking = {
      tourId: bookingData.tourId!,
      tourInstanceId: bookingData.tourInstanceId!,
      tourTitle: bookingData.tourTitle!,
      providerId: instance.providerId,
      customerId: bookingData.customerId!,
      customerEmail: bookingData.customerEmail!,
      customerName: bookingData.customerName!,
      numberOfPeople: bookingData.numberOfPeople!,
      pricePerPerson: instance.pricePerPerson,
      totalAmount: instance.pricePerPerson * bookingData.numberOfPeople!,
      discountApplied: instance.dynamicPricing?.isActive
        ? instance.dynamicPricing.discountPercentage
        : undefined,
      contactInfo: bookingData.contactInfo!,
      specialRequests: bookingData.specialRequests,
      dietaryRestrictions: bookingData.dietaryRestrictions,
      status: 'pending_payment',
      payment: {
        method: bookingData.payment?.method || 'mercadopago',
        status: 'pending',
      },
      confirmationCode,
      reviewSubmitted: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, this.BOOKINGS_COLLECTION), booking);

    // Actualizar cupos de la instancia
    await this.updateInstanceBookings(instance, bookingData.numberOfPeople!, 'add');

    return docRef.id;
  }

  /**
   * Confirmar pago de reserva
   */
  static async confirmBookingPayment(
    bookingId: string,
    transactionId: string
  ): Promise<void> {
    const docRef = doc(db, this.BOOKINGS_COLLECTION, bookingId);
    await updateDoc(docRef, {
      status: 'confirmed',
      'payment.status': 'paid',
      'payment.transactionId': transactionId,
      'payment.paidAt': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Cancelar reserva
   */
  static async cancelBooking(
    bookingId: string,
    reason: string,
    cancelledBy: 'customer' | 'provider' | 'system'
  ): Promise<void> {
    const bookingRef = doc(db, this.BOOKINGS_COLLECTION, bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) throw new Error('Reserva no encontrada');

    const booking = { id: bookingSnap.id, ...bookingSnap.data() } as TourBooking;
    const instance = await this.getTourInstanceById(booking.tourInstanceId);
    if (!instance) throw new Error('Instancia no encontrada');

    // Calcular reembolso
    const tour = await this.getTourById(booking.tourId);
    const hoursUntilTour = this.getHoursUntilTour(instance.date);
    const refundPercentage =
      cancelledBy === 'system'
        ? 100
        : this.calculateRefund(tour!.cancellationPolicy, hoursUntilTour);

    // Actualizar reserva
    await updateDoc(bookingRef, {
      status: 'cancelled',
      cancellation: {
        cancelledBy,
        reason,
        cancelledAt: serverTimestamp(),
        refundPolicy: refundPercentage === 100 ? 'full' : refundPercentage > 0 ? 'partial' : 'none',
        refundPercentage,
      },
      'payment.status': refundPercentage > 0 ? 'refunded' : booking.payment.status,
      'payment.refundedAt': refundPercentage > 0 ? serverTimestamp() : undefined,
      'payment.refundAmount': (booking.totalAmount * refundPercentage) / 100,
      updatedAt: serverTimestamp(),
    });

    // Liberar cupos
    await this.updateInstanceBookings(instance, booking.numberOfPeople, 'remove');
  }

  /**
   * Actualizar cupos de instancia
   */
  private static async updateInstanceBookings(
    instance: TourInstance,
    numberOfPeople: number,
    action: 'add' | 'remove'
  ): Promise<void> {
    if (!instance.id) return;

    const newBookedSpots =
      action === 'add'
        ? instance.bookedSpots + numberOfPeople
        : instance.bookedSpots - numberOfPeople;

    const newAvailableSpots = instance.capacity - newBookedSpots;

    const docRef = doc(db, this.INSTANCES_COLLECTION, instance.id);
    await updateDoc(docRef, {
      bookedSpots: newBookedSpots,
      availableSpots: newAvailableSpots,
      updatedAt: serverTimestamp(),
    });

    // Actualizar estado
    const updatedInstance = { ...instance, bookedSpots: newBookedSpots, availableSpots: newAvailableSpots };
    await this.updateInstanceStatus(updatedInstance);
  }

  /**
   * Obtener instancia por ID
   */
  private static async getTourInstanceById(instanceId: string): Promise<TourInstance | null> {
    const docRef = doc(db, this.INSTANCES_COLLECTION, instanceId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as TourInstance;
  }

  /**
   * Generar código de confirmación
   */
  private static generateConfirmationCode(): string {
    return `TOUR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Calcular porcentaje de reembolso
   */
  private static calculateRefund(policy: { rules?: { hoursBeforeTour: number; refundPercentage: number }[] }, hoursUntilTour: number): number {
    for (const rule of policy.rules || []) {
      if (hoursUntilTour >= rule.hoursBeforeTour) {
        return rule.refundPercentage;
      }
    }
    return 0;
  }

  /**
   * Obtener reservas de un cliente
   */
  static async getCustomerBookings(customerId: string): Promise<TourBooking[]> {
    const q = query(
      collection(db, this.BOOKINGS_COLLECTION),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as TourBooking));
  }

  /**
   * Obtener reservas de una instancia
   */
  static async getInstanceBookings(instanceId: string): Promise<TourBooking[]> {
    const q = query(
      collection(db, this.BOOKINGS_COLLECTION),
      where('tourInstanceId', '==', instanceId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as TourBooking));
  }
}
