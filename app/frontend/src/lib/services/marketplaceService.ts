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
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Listing,
  CreateListingInput,
  UpdateListingInput,
  SearchFilters,
  PaginationOptions,
  ListingStatus,
} from '@/types/marketplace';

export class MarketplaceService {
  private static COLLECTION = 'marketplaceListings';

  /**
   * Crea un nuevo listing (producto o servicio)
   */
  static async createListing(
    providerId: string,
    input: CreateListingInput
  ): Promise<Listing> {
    const listing: Listing = {
      providerId,
      baseType: input.baseType,
      category: input.category,
      subcategory: input.subcategory,
      name: input.name,
      description: input.description,
      price: input.price,
      currency: 'CLP',
      images: input.images,
      rating: 0,
      reviewCount: 0,
      status: 'draft',
      tags: input.tags,
      eatAttributes: input.eatAttributes,
      tourAttributes: input.tourAttributes,
      serviceAttributes: input.serviceAttributes,
      productInfo: input.productInfo,
      serviceInfo: input.serviceInfo,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), listing);

    return {
      ...listing,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Obtiene un listing por ID
   */
  static async getById(listingId: string): Promise<Listing | null> {
    const docRef = doc(db, this.COLLECTION, listingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Listing;
  }

  /**
   * Actualiza un listing
   */
  static async updateListing(
    listingId: string,
    input: UpdateListingInput
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, listingId);
    await updateDoc(docRef, {
      ...input,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Cambia estado de un listing (draft → active → archived)
   */
  static async updateStatus(
    listingId: string,
    status: ListingStatus
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, listingId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Lista listings del proveedor
   */
  static async getProviderListings(providerId: string): Promise<Listing[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Listing));
  }

  /**
   * Lista todos los listings activos
   */
  static async getAllActive(): Promise<Listing[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('status', '==', 'active'),
      orderBy('rating', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Listing));
  }

  /**
   * Búsqueda avanzada con filtros
   */
  static async search(filters: SearchFilters, pagination?: PaginationOptions): Promise<{
    listings: Listing[];
    hasMore: boolean;
  }> {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'active'),
    ];

    // Filtro por categoría
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    // Filtro por tipo base
    if (filters.baseType) {
      constraints.push(where('baseType', '==', filters.baseType));
    }

    // Ordenar por rating
    constraints.push(orderBy('rating', 'desc'));

    // Paginación
    if (pagination?.offset) {
      constraints.push(limit(pagination.limit + 1)); // +1 para saber si hay más
    } else {
      constraints.push(limit(pagination?.limit || 20));
    }

    const q = query(collection(db, this.COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    let listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Listing));

    // Filtro local por precio
    if (filters.minPrice || filters.maxPrice) {
      listings = listings.filter(l => {
        if (filters.minPrice && l.price < filters.minPrice) return false;
        if (filters.maxPrice && l.price > filters.maxPrice) return false;
        return true;
      });
    }

    // Filtro local por rating
    if (filters.rating) {
      listings = listings.filter(l => l.rating >= filters.rating!);
    }

    // Filtro local por búsqueda de texto
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      listings = listings.filter(l =>
        l.name.toLowerCase().includes(term) ||
        l.description.toLowerCase().includes(term)
      );
    }

    const hasMore = !!(pagination && listings.length > pagination.limit);
    if (hasMore) {
      listings = listings.slice(0, pagination!.limit);
    }

    return { listings, hasMore };
  }

  /**
   * Lista por categoría
   */
  static async getByCategory(category: string, pageLimit: number = 12): Promise<Listing[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('category', '==', category),
      where('status', '==', 'active'),
      orderBy('rating', 'desc'),
      limit(pageLimit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Listing));
  }

  /**
   * Obtiene listings destacados
   */
  static async getFeatured(pageLimit: number = 8): Promise<Listing[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('status', '==', 'active'),
      where('featured', '==', true),
      orderBy('rating', 'desc'),
      limit(pageLimit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Listing));
  }

  /**
   * Actualiza rating de un listing basado en reviews
   */
  static async updateRating(
    listingId: string,
    newRating: number,
    reviewCount: number
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, listingId);
    await updateDoc(docRef, {
      rating: newRating,
      reviewCount,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Actualiza stock (para productos físicos)
   */
  static async updateStock(listingId: string, newStock: number): Promise<void> {
    const docRef = doc(db, this.COLLECTION, listingId);
    await updateDoc(docRef, {
      'productInfo.stock': newStock,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Obtiene listings por rango de precio
   */
  static async getByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<Listing[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('status', '==', 'active'),
      where('price', '>=', minPrice),
      where('price', '<=', maxPrice)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Listing));
  }

  /**
   * Obtiene listings más vendidos (por reviewCount como proxy)
   */
  static async getPopular(pageLimit: number = 10): Promise<Listing[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('status', '==', 'active'),
      orderBy('reviewCount', 'desc'),
      limit(pageLimit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Listing));
  }
}
