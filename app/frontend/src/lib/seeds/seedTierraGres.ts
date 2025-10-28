/**
 * Seed script para Tierra Gres
 *
 * Información extraída de: https://www.tierragres.cl
 * Fecha: 2025-10-27
 * Generado automáticamente desde Admin Panel
 *
 * Contacto:
 * - Email: contacto@tierragres.cl
 * - Teléfono: +569 85934514
 * - WhatsApp: 56985934514
 * - Instagram: @tierra_gres
 * - Ubicación: San Pedro de Atacama
 */

import { adminDb } from '@/lib/firebaseAdmin';
import { ProviderLead } from '@/types/provider';
import { cleanupByBusinessName } from './seedCleanup';

const ADMIN_ID = 'admin-seed';

export async function seedTierraGres() {
  console.log('🌟 Seeding Tierra Gres...');

  try {
    // ========== 0. CLEANUP EXISTING DATA ==========
    console.log('Cleaning up existing Tierra Gres data...');
    await cleanupByBusinessName('Tierra Gres');

    // ========== 1. PROVIDER LEAD ==========
    const leadData: Omit<ProviderLead, 'id'> = {
      type: 'artisan',
      category: 'artisan',

      contactInfo: {
        name: '[COMPLETAR NOMBRE]',
        businessName: 'Tierra Gres',
        email: 'contacto@tierragres.cl',
        phone: '+569 85934514',
        whatsapp: '56985934514',
        address: 'San Pedro de Atacama',
      },

      servicesOffered: [

      ],

      status: 'new',
      priority: 'medium',
      source: 'other',
      isActive: true,

      createdBy: ADMIN_ID,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,

      notes: 'No description found. Website: https://www.tierragres.cl | Instagram: @tierra_gres',

      tags: ['artisan', 'auto-generated'],
    };

    const leadRef = await adminDb.collection('providerLeads').add(leadData);
    console.log(`✅ ProviderLead created: ${leadRef.id}`);

    // ========== 2. INVITATION ==========
    const invitationData = {
      code: `ATK-${new Date().getFullYear()}-TIERRAGRES-001`,
      linkedLeadId: leadRef.id,
      mockProviderId: `mock-${leadRef.id}`,
      recipientName: '[COMPLETAR]',
      businessName: 'Tierra Gres',
      category: 'artisan',
      email: 'contacto@tierragres.cl',
      customMessage: 'Nos encantaría que Tierra Gres formara parte de Santurist.',
      type: 'artisan',
      status: 'pending',
      createdBy: ADMIN_ID,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      metadata: {
        notes: 'Auto-generado desde Admin Panel. Validar información.',
      },
    };

    const invitationRef = await adminDb.collection('invitations').add(invitationData);

    console.log('\n✨ Tierra Gres seeded successfully!');
    console.log('📋 Lead:', leadRef.id);
    console.log('✉️  Invitation:', invitationData.code);

    return {
      leadId: leadRef.id,
      invitationCode: invitationData.code,
    };

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * SERVICIOS ENCONTRADOS:
 *

 *
 * IMÁGENES (16):
 * 1. https://www.tierragres.cl/wp-content/uploads/2025/10/IMG_8358-800x600.jpg
 * 2. https://www.tierragres.cl/wp-content/uploads/2025/10/IMG_8326-800x600.jpg
 * 3. https://www.tierragres.cl/wp-content/uploads/2025/09/IMG_8312-800x600.jpg
 * 4. https://www.tierragres.cl/wp-content/uploads/2025/09/IMG_8260-800x600.jpg
 * 5. https://www.tierragres.cl/wp-content/uploads/2025/09/IMG_8273-800x600.jpg
 * 6. https://www.tierragres.cl/wp-content/uploads/2025/08/IMG_7842-800x600.jpg
 * 7. https://www.tierragres.cl/wp-content/uploads/2025/08/IMG_8073-800x600.jpg
 * 8. https://www.tierragres.cl/wp-content/uploads/2025/08/IMG_8115-800x600.jpg
 * 9. https://www.tierragres.cl/wp-content/uploads/2025/08/IMG_8133-800x600.jpg
 * 10. https://www.tierragres.cl/wp-content/uploads/2025/08/IMG_8194-800x600.jpg
 * ... y 6 más
 */
