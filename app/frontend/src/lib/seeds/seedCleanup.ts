/**
 * Utility functions for cleaning up existing seed data before re-seeding
 * Prevents duplicate records when running seeds multiple times
 *
 * Uses Firebase Admin SDK to bypass security rules when running server-side
 */

import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Delete all records associated with a specific mockProviderId
 * This includes: stays, marketplace listings, invitations, and provider leads
 */
export async function cleanupProviderData(mockProviderId: string, leadId?: string) {
  console.log(`🧹 Cleaning up existing data for provider: ${mockProviderId}`);

  let deletedCount = 0;

  try {
    // 1. Delete Stays
    const staysSnapshot = await adminDb.collection('stays')
      .where('providerId', '==', mockProviderId)
      .get();
    console.log(`   Found ${staysSnapshot.size} stays to delete`);

    for (const doc of staysSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    // 2. Delete Marketplace Listings
    const listingsSnapshot = await adminDb.collection('marketplaceListings')
      .where('providerId', '==', mockProviderId)
      .get();
    console.log(`   Found ${listingsSnapshot.size} marketplace listings to delete`);

    for (const doc of listingsSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    // 3. Delete Invitations linked to this provider
    const invitationsSnapshot = await adminDb.collection('invitations')
      .where('mockProviderId', '==', mockProviderId)
      .get();
    console.log(`   Found ${invitationsSnapshot.size} invitations to delete`);

    for (const doc of invitationsSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    // 4. Delete Provider Lead if leadId provided
    if (leadId) {
      await adminDb.collection('providerLeads').doc(leadId).delete();
      console.log(`   Deleted provider lead: ${leadId}`);
      deletedCount++;
    }

    console.log(`✅ Cleanup complete: ${deletedCount} records deleted`);
    return deletedCount;

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

/**
 * Delete all stays, listings and invitations by business name
 * Useful when you don't have the mockProviderId yet
 */
export async function cleanupByBusinessName(businessName: string) {
  console.log(`🧹 Cleaning up existing data for business: ${businessName}`);

  let deletedCount = 0;

  try {
    // 1. Delete Stays by name
    const staysSnapshot = await adminDb.collection('stays')
      .where('name', '==', businessName)
      .get();
    console.log(`   Found ${staysSnapshot.size} stays to delete`);

    for (const doc of staysSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    // 2. Delete Marketplace Listings by name
    const listingsSnapshot = await adminDb.collection('marketplaceListings')
      .where('name', '==', businessName)
      .get();
    console.log(`   Found ${listingsSnapshot.size} marketplace listings to delete`);

    for (const doc of listingsSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    // 3. Delete Invitations by business name
    const invitationsSnapshot = await adminDb.collection('invitations')
      .where('businessName', '==', businessName)
      .get();
    console.log(`   Found ${invitationsSnapshot.size} invitations to delete`);

    for (const doc of invitationsSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    // 4. Delete Provider Leads by business name
    const leadsSnapshot = await adminDb.collection('providerLeads')
      .where('contactInfo.businessName', '==', businessName)
      .get();
    console.log(`   Found ${leadsSnapshot.size} provider leads to delete`);

    for (const doc of leadsSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    console.log(`✅ Cleanup complete: ${deletedCount} records deleted`);
    return deletedCount;

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

/**
 * Delete ALL seed data (use with caution!)
 * Useful for completely resetting the database
 */
export async function cleanupAllMockData() {
  console.log('🧹 WARNING: Cleaning up ALL mock data...');

  let deletedCount = 0;

  try {
    // Delete all stays with mock provider IDs
    const staysSnapshot = await adminDb.collection('stays')
      .where('providerId', '>=', 'mock-')
      .where('providerId', '<=', 'mock-\uf8ff')
      .get();
    console.log(`   Found ${staysSnapshot.size} mock stays to delete`);

    for (const doc of staysSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    // Delete all marketplace listings with mock provider IDs
    const listingsSnapshot = await adminDb.collection('marketplaceListings')
      .where('providerId', '>=', 'mock-')
      .where('providerId', '<=', 'mock-\uf8ff')
      .get();
    console.log(`   Found ${listingsSnapshot.size} mock marketplace listings to delete`);

    for (const doc of listingsSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    // Delete all invitations with mock provider IDs
    const invitationsSnapshot = await adminDb.collection('invitations')
      .where('mockProviderId', '>=', 'mock-')
      .where('mockProviderId', '<=', 'mock-\uf8ff')
      .get();
    console.log(`   Found ${invitationsSnapshot.size} mock invitations to delete`);

    for (const doc of invitationsSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    // Delete all provider leads created by admin-seed
    const leadsSnapshot = await adminDb.collection('providerLeads')
      .where('createdBy', '==', 'admin-seed')
      .get();
    console.log(`   Found ${leadsSnapshot.size} mock provider leads to delete`);

    for (const doc of leadsSnapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }

    console.log(`✅ ALL mock data cleanup complete: ${deletedCount} records deleted`);
    return deletedCount;

  } catch (error) {
    console.error('❌ Error during full cleanup:', error);
    throw error;
  }
}
