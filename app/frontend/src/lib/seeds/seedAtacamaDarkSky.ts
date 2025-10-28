/**
 * Seed script para Tours Astronómicos en San Pedro de Atacama
 *
 * Información extraída de: https://www.atacamadarksky.cl
 * Fecha: 2025-10-27
 * Generado automáticamente desde Admin Panel
 *
 * Contacto:
 * - Email: tu@email.com
 * - Teléfono: +56 9 1234 5678
 * - WhatsApp: 56950558761
 * - Instagram: [COMPLETAR]
 * - Ubicación: privada privilegiada
 */

import { adminDb } from '@/lib/firebaseAdmin';
import { ProviderLead } from '@/types/provider';
import { cleanupByBusinessName } from './seedCleanup';

const ADMIN_ID = 'admin-seed';

export async function seedAtacamaDarkSky() {
  console.log('🌟 Seeding Tours Astronómicos en San Pedro de Atacama...');

  try {
    // ========== 0. CLEANUP EXISTING DATA ==========
    console.log('Cleaning up existing Tours Astronómicos en San Pedro de Atacama data...');
    await cleanupByBusinessName('Tours Astronómicos en San Pedro de Atacama');

    // ========== 1. PROVIDER LEAD ==========
    const leadData: Omit<ProviderLead, 'id'> = {
      type: 'tour_guide',
      category: 'tour_guide',

      contactInfo: {
        name: '[COMPLETAR NOMBRE]',
        businessName: 'Tours Astronómicos en San Pedro de Atacama',
        email: 'tu@email.com',
        phone: '+56 9 1234 5678',
        whatsapp: '56950558761',
        address: 'privada privilegiada',
      },

      servicesOffered: [
        'Service 1',
        'Service 2',
        'Service 3',
        'Service 4',
      ],

      status: 'new',
      priority: 'medium',
      source: 'other',
      isActive: true,

      createdBy: ADMIN_ID,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,

      notes: 'Descubre el cielo más puro del mundo con nuestros tours guiados. Website: https://www.atacamadarksky.cl',

      tags: ['tour-operator', 'auto-generated'],
    };

    const leadRef = await adminDb.collection('providerLeads').add(leadData);
    console.log(`✅ ProviderLead created: ${leadRef.id}`);

    // ========== 2. INVITATION ==========
    const invitationData = {
      code: `ATK-${new Date().getFullYear()}-ATACAMADARKSKY-001`,
      linkedLeadId: leadRef.id,
      mockProviderId: `mock-${leadRef.id}`,
      recipientName: '[COMPLETAR]',
      businessName: 'Tours Astronómicos en San Pedro de Atacama',
      category: 'tour-operator',
      email: 'tu@email.com',
      customMessage: 'Nos encantaría que Tours Astronómicos en San Pedro de Atacama formara parte de Santurist.',
      type: 'tour-operator',
      status: 'pending',
      createdBy: ADMIN_ID,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      metadata: {
        notes: 'Auto-generado desde Admin Panel. Validar información.',
      },
    };

    const invitationRef = await adminDb.collection('invitations').add(invitationData);

    console.log('\n✨ Tours Astronómicos en San Pedro de Atacama seeded successfully!');
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

 * 1. Service 1
 *    Extracted from website - please review and update
 *    Precio: CLP 30.000
 *    
 *    

 * 2. Service 2
 *    Extracted from website - please review and update
 *    Precio: CLP 120.000
 *    
 *    

 * 3. Service 3
 *    Extracted from website - please review and update
 *    Precio: CLP 200.000
 *    
 *    

 * 4. Service 4
 *    Extracted from website - please review and update
 *    Precio: CLP 15.000
 *    
 *    

 *
 * IMÁGENES (0):


 */
