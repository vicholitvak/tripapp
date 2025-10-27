import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SeedStatus {
  id: string;
  name: string;
  description: string;
  isSeeded: boolean;
  lastSeededAt?: Date;
}

export class SeedStatusService {
  /**
   * Check if Casa Voyage seed has been run
   */
  static async checkCasaVoyageSeeded(): Promise<boolean> {
    try {
      // Check if Casa Voyage lead exists
      const leadsQuery = query(
        collection(db, 'providerLeads'),
        where('contactInfo.businessName', '==', 'Casa Voyage Hostel'),
        limit(1)
      );
      const leadsSnapshot = await getDocs(leadsQuery);

      if (!leadsSnapshot.empty) {
        return true;
      }

      // Also check stays collection
      const staysQuery = query(
        collection(db, 'stays'),
        where('name', '==', 'Casa Voyage Hostel'),
        limit(1)
      );
      const staysSnapshot = await getDocs(staysQuery);

      return !staysSnapshot.empty;
    } catch (error) {
      console.error('Error checking Casa Voyage seed:', error);
      return false;
    }
  }

  /**
   * Check if Tierra Gres seed has been run
   */
  static async checkTierraGresSeeded(): Promise<boolean> {
    try {
      const leadsQuery = query(
        collection(db, 'providerLeads'),
        where('contactInfo.businessName', '==', 'Tierra Gres'),
        limit(1)
      );
      const snapshot = await getDocs(leadsQuery);

      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking Tierra Gres seed:', error);
      return false;
    }
  }

  /**
   * Check if Joyas Relmu seed has been run
   */
  static async checkJoyasRelmuSeeded(): Promise<boolean> {
    try {
      const leadsQuery = query(
        collection(db, 'providerLeads'),
        where('contactInfo.businessName', '==', 'Joyas Relmu'),
        limit(1)
      );
      const snapshot = await getDocs(leadsQuery);

      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking Joyas Relmu seed:', error);
      return false;
    }
  }

  /**
   * Check if base marketplace seed has been run
   */
  static async checkMarketplaceSeeded(): Promise<boolean> {
    try {
      // Check if any listings exist
      const listingsQuery = query(
        collection(db, 'listings'),
        limit(1)
      );
      const snapshot = await getDocs(listingsQuery);

      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking marketplace seed:', error);
      return false;
    }
  }

  /**
   * Get status of all seeds
   */
  static async getAllSeedStatus(): Promise<{
    casaVoyage: boolean;
    tierraGres: boolean;
    joyasRelmu: boolean;
    marketplace: boolean;
  }> {
    const [casaVoyage, tierraGres, joyasRelmu, marketplace] = await Promise.all([
      this.checkCasaVoyageSeeded(),
      this.checkTierraGresSeeded(),
      this.checkJoyasRelmuSeeded(),
      this.checkMarketplaceSeeded(),
    ]);

    return {
      casaVoyage,
      tierraGres,
      joyasRelmu,
      marketplace,
    };
  }
}
