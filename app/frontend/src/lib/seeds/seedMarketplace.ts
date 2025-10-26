/**
 * Script para popular Firestore con datos mock del marketplace
 * Uso: Importar y ejecutar desde una página de admin o desarrollo
 */

import { collection, addDoc, Timestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { allListings } from './marketplaceSeed';

export async function seedMarketplace() {
  try {
    console.log('🌱 Iniciando seed del marketplace...');

    const listingsRef = collection(db, 'listings');
    let addedCount = 0;
    let failedCount = 0;

    for (const listing of allListings) {
      try {
        // Agregar timestamp
        const listingData = {
          ...listing,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(listingsRef, listingData);
        console.log(`✅ Listing agregado: ${listing.name} (${docRef.id})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Error agregando listing: ${listing.name}`, error);
        failedCount++;
      }
    }

    console.log(`\n🎉 Seed completado! Agregados: ${addedCount}, Errores: ${failedCount}`);
    return { addedCount, failedCount };
  } catch (error) {
    console.error('Error en seed:', error);
    throw error;
  }
}

/**
 * Limpia todos los listings de la base de datos
 * ADVERTENCIA: Esta acción es destructiva
 */
export async function clearMarketplace() {
  try {
    console.log('🗑️ Limpiando marketplace...');

    const listingsRef = collection(db, 'listings');
    const snapshot = await getDocs(listingsRef);

    let deletedCount = 0;
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
      deletedCount++;
    }

    console.log(`✅ Eliminados ${deletedCount} listings`);
    return deletedCount;
  } catch (error) {
    console.error('Error al limpiar marketplace:', error);
    throw error;
  }
}

/**
 * Obtiene solo los listings de cerámica
 */
export async function getCeramicaListings() {
  try {
    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, where('category', '==', 'ceramica'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo cerámica:', error);
    throw error;
  }
}

/**
 * Obtiene solo los listings de joyería
 */
export async function getJoyeriaListings() {
  try {
    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, where('category', '==', 'joyeria'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo joyería:', error);
    throw error;
  }
}

/**
 * Obtiene stats del seed
 */
export function getSeedStats() {
  const ceramicaCount = 6;
  const joyeriaCount = 7;
  const totalListings = ceramicaCount + joyeriaCount;
  const totalRevenue = 45000 + 32000 + 38000 + 18000 + 55000 + 72000 + // cerámica
                       95000 + 55000 + 120000 + 42000 + 185000 + 160000 + 38000; // joyería

  return {
    ceramicaCount,
    joyeriaCount,
    totalListings,
    totalRevenue,
    providers: [
      { id: 'ceramica-gress-atacama', name: 'Cerámica Gress Atacama', category: 'ceramica', products: ceramicaCount },
      { id: 'orfeberia-atacama-autentica', name: 'Orfebrería Atacama Auténtica', category: 'joyeria', products: joyeriaCount }
    ]
  };
}
