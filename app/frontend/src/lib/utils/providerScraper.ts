/**
 * Provider Information Scraper
 *
 * Herramienta robusta para extraer información de sitios web de proveedores
 * y generar datos estructurados para seeds.
 *
 * Uso:
 * ```
 * const data = await scrapeProviderWebsite('https://example.com');
 * console.log(JSON.stringify(data, null, 2));
 * ```
 */

export interface ScrapedProviderData {
  // Información básica
  businessName: string;
  website: string;
  description: string;
  category: string;

  // Contacto
  contact: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  };

  // Redes sociales
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };

  // Servicios/Tours/Productos
  offerings: Array<{
    name: string;
    description: string;
    price?: number;
    currency?: string;
    duration?: string;
    capacity?: string;
    features?: string[];
  }>;

  // Imágenes
  images: {
    logo?: string;
    hero?: string[];
    gallery?: string[];
    all: string[];
  };

  // Información adicional
  metadata: {
    operatingHours?: string;
    location?: string;
    features?: string[];
    languages?: string[];
    paymentMethods?: string[];
    bookingInfo?: string;
  };

  // Información raw para review manual
  rawData: {
    extractedAt: string;
    url: string;
    notes: string;
  };
}

/**
 * Scrape provider website and extract structured information
 */
export async function scrapeProviderWebsite(url: string): Promise<ScrapedProviderData> {
  console.log(`🔍 Scraping provider website: ${url}`);

  try {
    // Fetch the website
    const response = await fetch('/api/scrape-provider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Failed to scrape: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Error scraping provider website:', error);
    throw error;
  }
}

/**
 * Generate seed file content from scraped data
 */
export function generateSeedFile(data: ScrapedProviderData, seedName: string): string {
  const timestamp = new Date().toISOString().split('T')[0];

  return `/**
 * Seed script para ${data.businessName}
 *
 * Información Real extraída de: ${data.website}
 * Fecha de extracción: ${timestamp}
 *
 * - Owner/Contact: [REVISAR Y COMPLETAR]
 * - Nombre: ${data.businessName}
 * - Categoría: ${data.category}
 * - Website: ${data.website}
 * - Email: ${data.contact.email || '[NO ENCONTRADO]'}
 * - Teléfono: ${data.contact.phone || '[NO ENCONTRADO]'}
 * - WhatsApp: ${data.contact.whatsapp || '[NO ENCONTRADO]'}
 * - Instagram: ${data.social.instagram || '[NO ENCONTRADO]'}
 * - Ubicación: ${data.contact.address || data.metadata.location || '[NO ENCONTRADO]'}
 *
 * Servicios encontrados: ${data.offerings.length}
 * Imágenes encontradas: ${data.images.all.length}
 *
 * NOTA: Revisar y validar toda la información antes de ejecutar el seed.
 */

import {
  collection,
  addDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProviderLead } from '@/types/provider';
import { Listing } from '@/types/marketplace';

const ADMIN_ID = 'admin-seed';

export async function seed${seedName}() {
  console.log('🌟 Seeding ${data.businessName}...');

  try {
    // ========== 1. PROVIDER LEAD ==========
    console.log('Creating ProviderLead for ${data.businessName}...');

    const leadData: Omit<ProviderLead, 'id'> = {
      // Tipo de proveedor
      type: '${data.category.toLowerCase()}', // TODO: Ajustar según categoría real
      category: '${data.category}',

      // Información de contacto REAL
      contactInfo: {
        name: '[COMPLETAR NOMBRE DEL DUEÑO]',
        businessName: '${data.businessName}',
        email: '${data.contact.email || ''}',
        phone: '${data.contact.phone || ''}',
        whatsapp: '${data.contact.whatsapp || data.contact.phone || ''}',
        address: '${data.contact.address || data.metadata.location || 'San Pedro de Atacama'}',
      },

      // Servicios ofrecidos
      servicesOffered: [
${data.offerings.map(o => `        '${o.name}',`).join('\n')}
      ],

      // Estado y seguimiento
      status: 'new',
      priority: 'medium',
      source: 'research',
      isActive: true,

      // Metadata
      createdBy: ADMIN_ID,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,

      // Notas
      notes: 'Extraído automáticamente el ${timestamp}. ${data.description}. Website: ${data.website}${data.social.instagram ? ` | Instagram: ${data.social.instagram}` : ''}. ${data.metadata.features?.join(', ') || ''}',

      // Tags
      tags: ['${data.category.toLowerCase()}', 'researched', 'web-scraping'],
    };

    const leadRef = await addDoc(collection(db, 'providerLeads'), leadData);
    console.log(\`✅ ProviderLead created with ID: \${leadRef.id}\`);

    // ========== 2. TOURS/SERVICES ==========
    console.log('Creating Tours/Services for ${data.businessName}...');

    const mockProviderId = \`mock-\${leadRef.id}\`;
    const tourIds: string[] = [];

    // TODO: Crear tours basados en data.offerings
    // Ejemplo de estructura:
    /*
    for (const offering of data.offerings) {
      const tourData = {
        providerId: mockProviderId,
        name: offering.name,
        description: offering.description,
        price: offering.price || 0,
        currency: offering.currency || 'CLP',
        duration: offering.duration,
        maxGroupSize: parseInt(offering.capacity) || 20,
        // ... más campos
      };

      const tourRef = await addDoc(collection(db, 'tours'), tourData);
      tourIds.push(tourRef.id);
    }
    */

    // ========== 3. INVITATION ==========
    console.log('Creating Invitation for ${data.businessName}...');

    const invitationData = {
      code: \`ATK-\${new Date().getFullYear()}-\${seedName.toUpperCase()}-001\`,

      // Link to lead
      linkedLeadId: leadRef.id,
      mockProviderId: mockProviderId,

      // Personalización
      recipientName: '[COMPLETAR]',
      businessName: '${data.businessName}',
      category: '${data.category.toLowerCase()}',
      email: '${data.contact.email || ''}',
      customMessage: '¡Hola! 🌟 Nos encantaría que ${data.businessName} formara parte de Santurist, nuestra plataforma que conecta a viajeros con proveedores locales de San Pedro de Atacama.',

      type: '${data.category.toLowerCase()}',
      status: 'pending',

      createdBy: ADMIN_ID,
      createdAt: serverTimestamp(),

      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días

      metadata: {
        notes: 'Extraído automáticamente. Validar información antes de enviar invitación.',
      },
    };

    const invitationRef = await addDoc(collection(db, 'invitations'), invitationData);
    console.log(\`✅ Invitation created with ID: \${invitationRef.id}\`);
    console.log(\`   Code: \${invitationData.code}\`);
    console.log(\`   URL: /invite/\${invitationData.code}\`);

    // ========== SUMMARY ==========
    console.log('\\n✨ ${data.businessName} seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Provider Lead ID:', leadRef.id);
    console.log('🌟 Mock Provider ID:', mockProviderId);
    console.log('🎫 Tours/Services:', tourIds.length);
    console.log('✉️  Invitation ID:', invitationRef.id);
    console.log('🔗 Invitation Code:', invitationData.code);
    console.log('📧 Contact Email:', '${data.contact.email || 'N/A'}');
    console.log('📱 WhatsApp:', '${data.contact.whatsapp || data.contact.phone || 'N/A'}');
    console.log('📷 Instagram:', '${data.social.instagram || 'N/A'}');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      leadId: leadRef.id,
      mockProviderId,
      tourIds,
      invitationId: invitationRef.id,
      invitationCode: invitationData.code,
    };

  } catch (error) {
    console.error('❌ Error seeding ${data.businessName}:', error);
    throw error;
  }
}

/*
 * DATOS EXTRAÍDOS PARA REFERENCIA:
 *
 * Servicios/Tours encontrados:
${data.offerings.map((o, i) => `
 * ${i + 1}. ${o.name}
 *    - Descripción: ${o.description}
 *    - Precio: ${o.price ? `${o.currency || 'CLP'} ${o.price.toLocaleString()}` : 'No especificado'}
 *    - Duración: ${o.duration || 'No especificada'}
 *    - Capacidad: ${o.capacity || 'No especificada'}
${o.features ? ` *    - Características: ${o.features.join(', ')}` : ''}
`).join('\n')}
 *
 * Imágenes encontradas (${data.images.all.length} total):
${data.images.all.slice(0, 10).map((img, i) => ` * ${i + 1}. ${img}`).join('\n')}
${data.images.all.length > 10 ? ` * ... y ${data.images.all.length - 10} más` : ''}
 *
 * Metadata adicional:
 * - Horarios: ${data.metadata.operatingHours || 'No especificado'}
 * - Idiomas: ${data.metadata.languages?.join(', ') || 'No especificado'}
 * - Métodos de pago: ${data.metadata.paymentMethods?.join(', ') || 'No especificado'}
 * - Info de reservas: ${data.metadata.bookingInfo || 'No especificado'}
 */
`;
}

/**
 * Helper to print extracted data in a readable format for manual review
 */
export function printScrapedData(data: ScrapedProviderData): void {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║     INFORMACIÓN EXTRAÍDA DEL PROVEEDOR     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log('🏢 INFORMACIÓN BÁSICA:');
  console.log(`   Nombre: ${data.businessName}`);
  console.log(`   Website: ${data.website}`);
  console.log(`   Categoría: ${data.category}`);
  console.log(`   Descripción: ${data.description}\n`);

  console.log('📞 CONTACTO:');
  console.log(`   Email: ${data.contact.email || 'No encontrado'}`);
  console.log(`   Teléfono: ${data.contact.phone || 'No encontrado'}`);
  console.log(`   WhatsApp: ${data.contact.whatsapp || 'No encontrado'}`);
  console.log(`   Dirección: ${data.contact.address || 'No encontrada'}\n`);

  console.log('📱 REDES SOCIALES:');
  console.log(`   Instagram: ${data.social.instagram || 'No encontrado'}`);
  console.log(`   Facebook: ${data.social.facebook || 'No encontrado'}`);
  console.log(`   YouTube: ${data.social.youtube || 'No encontrado'}\n`);

  console.log(`🎫 SERVICIOS/TOURS (${data.offerings.length}):`);
  data.offerings.forEach((offering, i) => {
    console.log(`   ${i + 1}. ${offering.name}`);
    console.log(`      ${offering.description}`);
    if (offering.price) {
      console.log(`      💰 ${offering.currency || 'CLP'} ${offering.price.toLocaleString()}`);
    }
    if (offering.duration) {
      console.log(`      ⏱️  ${offering.duration}`);
    }
    if (offering.capacity) {
      console.log(`      👥 ${offering.capacity}`);
    }
  });

  console.log(`\n📸 IMÁGENES (${data.images.all.length} encontradas):`);
  if (data.images.hero && data.images.hero.length > 0) {
    console.log(`   Hero: ${data.images.hero.length}`);
  }
  if (data.images.gallery && data.images.gallery.length > 0) {
    console.log(`   Galería: ${data.images.gallery.length}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
