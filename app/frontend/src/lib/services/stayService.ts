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
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Stay,
  StaySearchFilters,
  StayBooking,
  StayStatus,
  DateAvailability,
} from '@/types/stay';

export class StayService {
  private static STAYS_COLLECTION = 'stays';
  private static BOOKINGS_COLLECTION = 'stayBookings';

  /**
   * Crea un nuevo alojamiento
   */
  static async create(
    stayData: Omit<Stay, 'id' | 'createdAt' | 'updatedAt'>,
    providerId: string
  ): Promise<Stay> {
    const stay: Omit<Stay, 'id'> = {
      ...stayData,
      providerId,
      rating: 0,
      reviewCount: 0,
      totalBookings: 0,
      status: 'draft',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, this.STAYS_COLLECTION), stay);

    return {
      ...stay,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Obtiene todos los alojamientos activos
   */
  static async getAll(): Promise<Stay[]> {
    const q = query(
      collection(db, this.STAYS_COLLECTION),
      where('status', '==', 'active'),
      orderBy('featured', 'desc'),
      orderBy('rating', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Stay));
  }

  /**
   * Obtiene un alojamiento por ID
   */
  static async getById(stayId: string): Promise<Stay | null> {
    const docRef = doc(db, this.STAYS_COLLECTION, stayId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Stay;
  }

  /**
   * Busca alojamientos con filtros
   */
  static async search(filters: StaySearchFilters): Promise<Stay[]> {
    // Obtener todos los alojamientos activos
    let stays = await this.getAll();

    // Aplicar filtros
    if (filters.types && filters.types.length > 0) {
      stays = stays.filter(stay => filters.types!.includes(stay.type));
    }

    if (filters.guests) {
      stays = stays.filter(stay => {
        if (stay.isHybrid && stay.spaceTypes) {
          // Para híbridos, verificar si algún tipo de espacio puede acomodar
          return stay.spaceTypes.some(
            space => space.capacity.maxGuests >= filters.guests!
          );
        }
        return stay.capacity && stay.capacity.maxGuests >= filters.guests!;
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      stays = stays.filter(stay => {
        const price = this.getMinPrice(stay);
        if (filters.minPrice !== undefined && price < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
        return true;
      });
    }

    if (filters.amenities && filters.amenities.length > 0) {
      stays = stays.filter(stay =>
        filters.amenities!.every(amenity => stay.amenities.includes(amenity))
      );
    }

    if (filters.instantBooking) {
      stays = stays.filter(stay => stay.availability.instantBooking);
    }

    if (filters.petFriendly) {
      stays = stays.filter(stay => stay.rules.pets);
    }

    if (filters.maxDistance !== undefined) {
      stays = stays.filter(stay => stay.distanceToCenter <= filters.maxDistance!);
    }

    // Verificar disponibilidad si se proporcionan fechas
    if (filters.checkIn && filters.checkOut) {
      stays = await Promise.all(
        stays.map(async stay => {
          const isAvailable = await this.checkAvailability(
            stay.id!,
            filters.checkIn!,
            filters.checkOut!
          );
          return isAvailable ? stay : null;
        })
      ).then(results => results.filter(stay => stay !== null) as Stay[]);
    }

    // Ordenar
    if (filters.sortBy) {
      stays = this.sortStays(stays, filters.sortBy);
    }

    return stays;
  }

  /**
   * Obtiene el precio mínimo de un alojamiento
   */
  private static getMinPrice(stay: Stay): number {
    if (stay.isHybrid && stay.spaceTypes) {
      return Math.min(...stay.spaceTypes.map(space => space.pricing.basePrice));
    }
    return stay.pricing?.basePrice || 0;
  }

  /**
   * Ordena alojamientos según criterio
   */
  private static sortStays(
    stays: Stay[],
    sortBy: StaySearchFilters['sortBy']
  ): Stay[] {
    const sorted = [...stays];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => this.getMinPrice(a) - this.getMinPrice(b));
      case 'price_desc':
        return sorted.sort((a, b) => this.getMinPrice(b) - this.getMinPrice(a));
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'distance':
        return sorted.sort((a, b) => a.distanceToCenter - b.distanceToCenter);
      case 'popular':
        return sorted.sort((a, b) => b.totalBookings - a.totalBookings);
      default:
        return sorted;
    }
  }

  /**
   * Verifica disponibilidad para un rango de fechas
   */
  static async checkAvailability(
    stayId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<boolean> {
    const stay = await this.getById(stayId);
    if (!stay) return false;

    // Generar array de fechas a verificar
    const dates = this.getDateRange(checkIn, checkOut);

    // Verificar cada fecha en el calendario
    for (const date of dates) {
      const dateKey = this.formatDateKey(date);
      const availability = stay.availability.calendar[dateKey];

      if (availability && !availability.available) {
        return false;
      }
    }

    // Verificar reservas existentes
    const hasConflict = await this.hasBookingConflict(stayId, checkIn, checkOut);
    return !hasConflict;
  }

  /**
   * Verifica si hay conflicto con reservas existentes
   */
  private static async hasBookingConflict(
    stayId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<boolean> {
    const q = query(
      collection(db, this.BOOKINGS_COLLECTION),
      where('stayId', '==', stayId),
      where('status', 'in', ['confirmed', 'pending'])
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => doc.data() as StayBooking);

    return bookings.some(booking => {
      const bookingCheckIn = booking.checkIn instanceof Date
        ? booking.checkIn
        : booking.checkIn.toDate();
      const bookingCheckOut = booking.checkOut instanceof Date
        ? booking.checkOut
        : booking.checkOut.toDate();

      // Verificar si hay overlap
      return checkIn < bookingCheckOut && checkOut > bookingCheckIn;
    });
  }

  /**
   * Calcula el precio total de una reserva
   */
  static calculateTotalPrice(
    stay: Stay,
    checkIn: Date,
    checkOut: Date,
    numberOfGuests: number,
    spaceTypeId?: string
  ): {
    basePrice: number;
    numberOfNights: number;
    subtotal: number;
    cleaningFee: number;
    extraGuestFee: number;
    discountAmount: number;
    totalPrice: number;
  } {
    // Obtener pricing según si es híbrido o no
    let pricing = stay.pricing;
    let capacity = stay.capacity;

    if (stay.isHybrid && spaceTypeId && stay.spaceTypes) {
      const spaceType = stay.spaceTypes.find(st => st.type === spaceTypeId);
      if (spaceType) {
        pricing = spaceType.pricing;
        capacity = spaceType.capacity;
      }
    }

    if (!pricing || !capacity) {
      throw new Error('Pricing or capacity not found');
    }

    // Calcular noches
    const numberOfNights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Precio base por noche
    const basePrice = pricing.basePrice;
    const subtotal = basePrice * numberOfNights;

    // Tarifa de limpieza
    const cleaningFee = pricing.cleaningFee || 0;

    // Tarifa por huéspedes extra
    let extraGuestFee = 0;
    if (pricing.extraGuestFee && pricing.extraGuestThreshold) {
      const extraGuests = Math.max(0, numberOfGuests - pricing.extraGuestThreshold);
      extraGuestFee = extraGuests * pricing.extraGuestFee * numberOfNights;
    }

    // Descuentos
    let discountAmount = 0;
    if (numberOfNights >= 28 && pricing.monthlyDiscount) {
      discountAmount = subtotal * (pricing.monthlyDiscount / 100);
    } else if (numberOfNights >= 7 && pricing.weeklyDiscount) {
      discountAmount = subtotal * (pricing.weeklyDiscount / 100);
    }

    // Total
    const totalPrice = subtotal + cleaningFee + extraGuestFee - discountAmount;

    return {
      basePrice,
      numberOfNights,
      subtotal,
      cleaningFee,
      extraGuestFee,
      discountAmount,
      totalPrice,
    };
  }

  /**
   * Crea una reserva
   */
  static async createBooking(
    bookingData: Omit<StayBooking, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<StayBooking> {
    const booking: Omit<StayBooking, 'id'> = {
      ...bookingData,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, this.BOOKINGS_COLLECTION), booking);

    return {
      ...booking,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Actualiza el estado de una reserva
   */
  static async updateBookingStatus(
    bookingId: string,
    status: StayBooking['status']
  ): Promise<void> {
    const docRef = doc(db, this.BOOKINGS_COLLECTION, bookingId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
      ...(status === 'confirmed' ? { confirmedAt: serverTimestamp() } : {}),
    });
  }

  /**
   * Obtiene reservas de un alojamiento
   */
  static async getBookingsByStay(stayId: string): Promise<StayBooking[]> {
    const q = query(
      collection(db, this.BOOKINGS_COLLECTION),
      where('stayId', '==', stayId),
      orderBy('checkIn', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as StayBooking));
  }

  /**
   * Actualiza el calendario de disponibilidad
   */
  static async updateAvailability(
    stayId: string,
    dates: { [date: string]: DateAvailability }
  ): Promise<void> {
    const stay = await this.getById(stayId);
    if (!stay) throw new Error('Stay not found');

    const updatedCalendar = {
      ...stay.availability.calendar,
      ...dates,
    };

    await updateDoc(doc(db, this.STAYS_COLLECTION, stayId), {
      'availability.calendar': updatedCalendar,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Actualiza un alojamiento
   */
  static async update(
    stayId: string,
    updates: Partial<Stay>
  ): Promise<void> {
    await updateDoc(doc(db, this.STAYS_COLLECTION, stayId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Actualiza el estado de un alojamiento
   */
  static async updateStatus(
    stayId: string,
    status: StayStatus
  ): Promise<void> {
    await updateDoc(doc(db, this.STAYS_COLLECTION, stayId), {
      status,
      updatedAt: serverTimestamp(),
      ...(status === 'active' ? { approvedAt: serverTimestamp() } : {}),
    });
  }

  /**
   * Elimina un alojamiento
   */
  static async delete(stayId: string): Promise<void> {
    // Verificar que no tenga reservas activas
    const q = query(
      collection(db, this.BOOKINGS_COLLECTION),
      where('stayId', '==', stayId),
      where('status', 'in', ['pending', 'confirmed'])
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error('No se puede eliminar un alojamiento con reservas activas');
    }

    await deleteDoc(doc(db, this.STAYS_COLLECTION, stayId));
  }

  /**
   * Obtiene alojamientos destacados
   */
  static async getFeatured(limitCount = 6): Promise<Stay[]> {
    const q = query(
      collection(db, this.STAYS_COLLECTION),
      where('status', '==', 'active'),
      where('featured', '==', true),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Stay));
  }

  /**
   * Obtiene alojamientos por proveedor
   */
  static async getByProvider(providerId: string): Promise<Stay[]> {
    const q = query(
      collection(db, this.STAYS_COLLECTION),
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Stay));
  }

  // ========== Utilidades ==========

  /**
   * Genera un rango de fechas
   */
  private static getDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);

    while (current < end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Formatea fecha como key para calendario
   */
  private static formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // "2025-01-15"
  }

  /**
   * Obtiene estadísticas de alojamientos
   */
  static async getStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    totalBookings: number;
    averageRating: number;
  }> {
    const stays = await this.getAll();
    const totalBookings = stays.reduce((sum, stay) => sum + stay.totalBookings, 0);
    const averageRating =
      stays.reduce((sum, stay) => sum + stay.rating, 0) / stays.length || 0;

    const q = query(
      collection(db, this.STAYS_COLLECTION),
      where('status', '==', 'pending')
    );
    const pendingSnapshot = await getDocs(q);

    return {
      total: stays.length,
      active: stays.length,
      pending: pendingSnapshot.size,
      totalBookings,
      averageRating,
    };
  }
}
