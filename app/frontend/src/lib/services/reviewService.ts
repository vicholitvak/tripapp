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
import { Review } from '@/types/marketplace';

export class ReviewService {
  private static COLLECTION = 'reviews';

  /**
   * Creates a new review
   */
  static async createReview(
    listingId: string,
    orderId: string,
    customerId: string,
    rating: number,
    comment: string,
    photos?: string[]
  ): Promise<Review> {
    const reviewData: Omit<Review, 'id'> = {
      listingId,
      orderId,
      customerId,
      rating,
      comment,
      photos,
      helpful: 0,
      createdAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, this.COLLECTION), reviewData);

    return {
      ...reviewData,
      id: docRef.id,
      createdAt: new Date(),
    };
  }

  /**
   * Gets a review by ID
   */
  static async getById(reviewId: string): Promise<Review | null> {
    const docRef = doc(db, this.COLLECTION, reviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Review;
  }

  /**
   * Gets reviews for a specific listing
   */
  static async getListingReviews(listingId: string): Promise<Review[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('listingId', '==', listingId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Review));
  }

  /**
   * Gets reviews written by a specific customer
   */
  static async getCustomerReviews(customerId: string): Promise<Review[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Review));
  }

  /**
   * Gets all reviews for a provider's listings
   */
  static async getProviderReviews(providerId: string): Promise<Review[]> {
    try {
      // First, get all the provider's listings
      const listingsSnapshot = await getDocs(
        query(
          collection(db, 'marketplaceListings'),
          where('providerId', '==', providerId)
        )
      );

      const listingIds = listingsSnapshot.docs.map(doc => doc.id);

      if (listingIds.length === 0) {
        return [];
      }

      // Get reviews for all those listings
      // Note: Firestore 'in' queries are limited to 30 items
      const reviews: Review[] = [];

      // Split into batches of 30 (Firestore limit for 'in' queries)
      const batchSize = 30;
      for (let i = 0; i < listingIds.length; i += batchSize) {
        const batch = listingIds.slice(i, i + batchSize);
        const q = query(
          collection(db, this.COLLECTION),
          where('listingId', 'in', batch),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const batchReviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Review));

        reviews.push(...batchReviews);
      }

      // Sort all reviews by date
      return reviews.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as Timestamp).toDate();
        const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as Timestamp).toDate();
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting provider reviews:', error);
      return [];
    }
  }

  /**
   * Updates a review
   */
  static async updateReview(
    reviewId: string,
    rating: number,
    comment: string,
    photos?: string[]
  ): Promise<void> {
    const docRef = doc(db, this.COLLECTION, reviewId);
    await updateDoc(docRef, {
      rating,
      comment,
      photos,
    });
  }

  /**
   * Deletes a review
   */
  static async deleteReview(reviewId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, reviewId);
    await deleteDoc(docRef);
  }

  /**
   * Increments the helpful counter
   */
  static async markHelpful(reviewId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, reviewId);
    const review = await this.getById(reviewId);

    if (review) {
      await updateDoc(docRef, {
        helpful: review.helpful + 1,
      });
    }
  }

  /**
   * Gets review statistics for a listing
   */
  static async getListingStats(listingId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.getListingReviews(listingId);

    const ratingDistribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;

    reviews.forEach(review => {
      totalRating += review.rating;
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  /**
   * Gets review statistics for a provider (across all their listings)
   */
  static async getProviderStats(providerId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.getProviderReviews(providerId);

    const ratingDistribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;

    reviews.forEach(review => {
      totalRating += review.rating;
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  /**
   * Check if a customer has already reviewed an order
   */
  static async hasReviewed(orderId: string, customerId: string): Promise<boolean> {
    const q = query(
      collection(db, this.COLLECTION),
      where('orderId', '==', orderId),
      where('customerId', '==', customerId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  /**
   * Gets recent reviews (for homepage/featured sections)
   */
  static async getRecentReviews(limit: number = 10): Promise<Review[]> {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Review));
  }

  /**
   * Gets top-rated reviews for a listing
   */
  static async getTopReviews(listingId: string, minRating: number = 4): Promise<Review[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('listingId', '==', listingId),
      where('rating', '>=', minRating),
      orderBy('rating', 'desc'),
      orderBy('helpful', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Review));
  }
}
