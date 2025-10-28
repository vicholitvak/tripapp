#!/usr/bin/env ts-node
/**
 * Script CLI para generar seeds automáticamente desde sitios web
 *
 * Uso:
 * npm run generate-seed https://www.example.com nombre-del-seed
 *
 * Ejemplo:
 * npm run generate-seed https://www.atacamadarksky.cl atacama-dark-sky
 */

import * as fs from 'fs';
import * as path from 'path';

interface ProviderData {
  businessName: string;
  website: string;
  description: string;
  category: string;
  contact: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  offerings: Array<{
    name: string;
    description: string;
    price?: number;
    currency?: string;
    duration?: string;
    capacity?: string;
  }>;
  images: {
    all: string[];
  };
  metadata: {
    operatingHours?: string;
    languages?: string[];
    paymentMethods?: string[];
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('❌ Error: Missing arguments');
    console.log('\nUso:');
    console.log('  npm run generate-seed <url> <seed-name>');
    console.log('\nEjemplo:');
    console.log('  npm run generate-seed https://www.atacamadarksky.cl atacama-dark-sky');
    process.exit(1);
  }

  const [url, seedName] = args;

  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   GENERADOR AUTOMÁTICO DE SEEDS SANTURIST    ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  console.log(`📍 URL: ${url}`);
  console.log(`📝 Seed name: ${seedName}\n`);

  try {
    // Step 1: Scrape website
    console.log('🔍 Paso 1: Extrayendo información del sitio web...');
    const data = await scrapeWebsite(url);
    console.log('✅ Información extraída exitosamente\n');

    // Step 2: Display extracted data
    console.log('📊 Paso 2: Datos extraídos:');
    printExtractedData(data);

    // Step 3: Generate seed file
    console.log('\n📝 Paso 3: Generando archivo seed...');
    const seedContent = generateSeedFile(data, seedName);

    // Step 4: Save seed file
    const fileName = `seed${toPascalCase(seedName)}.ts`;
    const filePath = path.join(process.cwd(), 'src', 'lib', 'seeds', fileName);

    fs.writeFileSync(filePath, seedContent, 'utf-8');
    console.log(`✅ Seed guardado en: ${filePath}\n`);

    // Step 5: Instructions
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║              PRÓXIMOS PASOS                   ║');
    console.log('╚═══════════════════════════════════════════════╝\n');
    console.log('1. Revisar y completar información en:');
    console.log(`   ${filePath}`);
    console.log('\n2. Especialmente verificar:');
    console.log('   - Nombre del dueño/contacto');
    console.log('   - Información de contacto (email, teléfono)');
    console.log('   - Precios y descripciones de servicios');
    console.log('   - Categoría del proveedor');
    console.log('\n3. Agregar el seed al archivo de seeds principal:');
    console.log('   src/app/admin/seed-[nombre]/page.tsx');
    console.log('\n4. Ejecutar el seed desde:');
    console.log('   /admin/seed-[nombre]');

    console.log('\n✨ ¡Listo! El seed ha sido generado.\n');

  } catch (error) {
    console.error('\n❌ Error generando seed:', error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

async function scrapeWebsite(url: string): Promise<ProviderData> {
  // Make API call to scraping endpoint
  const port = process.env.PORT || '3001';
  const response = await fetch(`http://localhost:${port}/api/scrape-provider`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`Failed to scrape website: ${response.statusText}`);
  }

  return await response.json();
}

function printExtractedData(data: ProviderData): void {
  console.log(`   🏢 Negocio: ${data.businessName}`);
  console.log(`   📂 Categoría: ${data.category}`);
  console.log(`   📧 Email: ${data.contact.email || 'No encontrado'}`);
  console.log(`   📱 Teléfono: ${data.contact.phone || 'No encontrado'}`);
  console.log(`   💬 WhatsApp: ${data.contact.whatsapp || 'No encontrado'}`);
  console.log(`   📷 Instagram: ${data.social.instagram || 'No encontrado'}`);
  console.log(`   🎫 Servicios: ${data.offerings.length}`);
  console.log(`   🖼️  Imágenes: ${data.images.all.length}`);
}

function generateSeedFile(data: ProviderData, seedName: string): string {
  const className = toPascalCase(seedName);
  const timestamp = new Date().toISOString().split('T')[0];

  return `/**
 * Seed script para ${data.businessName}
 *
 * Información extraída de: ${data.website}
 * Fecha: ${timestamp}
 * Generado automáticamente - REVISAR Y COMPLETAR
 *
 * Contacto:
 * - Email: ${data.contact.email || '[COMPLETAR]'}
 * - Teléfono: ${data.contact.phone || '[COMPLETAR]'}
 * - WhatsApp: ${data.contact.whatsapp || data.contact.phone || '[COMPLETAR]'}
 * - Instagram: ${data.social.instagram || '[COMPLETAR]'}
 * - Ubicación: ${data.contact.address || 'San Pedro de Atacama'}
 */

import {
  collection,
  addDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProviderLead } from '@/types/provider';

const ADMIN_ID = 'admin-seed';

export async function seed${className}() {
  console.log('🌟 Seeding ${data.businessName}...');

  try {
    // ========== 1. PROVIDER LEAD ==========
    const leadData: Omit<ProviderLead, 'id'> = {
      type: '${data.category}',
      category: '${data.category}',

      contactInfo: {
        name: '[COMPLETAR NOMBRE]',
        businessName: '${data.businessName}',
        email: '${data.contact.email || ''}',
        phone: '${data.contact.phone || ''}',
        whatsapp: '${data.contact.whatsapp || data.contact.phone || ''}',
        address: '${data.contact.address || 'San Pedro de Atacama'}',
      },

      servicesOffered: [
${data.offerings.map(o => `        '${o.name}',`).join('\n')}
      ],

      status: 'new',
      priority: 'medium',
      source: 'research',
      isActive: true,

      createdBy: ADMIN_ID,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,

      notes: '${data.description}. Website: ${data.website}${data.social.instagram ? ` | Instagram: ${data.social.instagram}` : ''}',

      tags: ['${data.category}', 'auto-scraped'],
    };

    const leadRef = await addDoc(collection(db, 'providerLeads'), leadData);
    console.log(\`✅ ProviderLead created: \${leadRef.id}\`);

    // ========== 2. INVITATION ==========
    const invitationData = {
      code: \`ATK-\${new Date().getFullYear()}-${seedName.toUpperCase().replace(/-/g, '')}-001\`,
      linkedLeadId: leadRef.id,
      mockProviderId: \`mock-\${leadRef.id}\`,
      recipientName: '[COMPLETAR]',
      businessName: '${data.businessName}',
      category: '${data.category}',
      email: '${data.contact.email || ''}',
      customMessage: 'Nos encantaría que ${data.businessName} formara parte de Santurist.',
      type: '${data.category}',
      status: 'pending',
      createdBy: ADMIN_ID,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      metadata: {
        notes: 'Auto-generado. Validar información.',
      },
    };

    const invitationRef = await addDoc(collection(db, 'invitations'), invitationData);

    console.log('\\n✨ ${data.businessName} seeded successfully!');
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
${data.offerings.map((o, i) => `
 * ${i + 1}. ${o.name}
 *    ${o.description}
 *    ${o.price ? `Precio: ${o.currency || 'CLP'} ${o.price.toLocaleString()}` : ''}
 *    ${o.duration ? `Duración: ${o.duration}` : ''}
 *    ${o.capacity ? `Capacidad: ${o.capacity}` : ''}
`).join('')}
 *
 * IMÁGENES (${data.images.all.length}):
${data.images.all.slice(0, 10).map((img, i) => ` * ${i + 1}. ${img}`).join('\n')}
${data.images.all.length > 10 ? ` * ... y ${data.images.all.length - 10} más` : ''}
 */
`;
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Run the script
main();
