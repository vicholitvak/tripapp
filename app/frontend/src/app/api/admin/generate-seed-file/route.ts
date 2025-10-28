import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

/**
 * API endpoint para generar archivos de seed desde el admin
 *
 * POST /api/admin/generate-seed-file
 * Body: { url: string, seedName: string, data: ScrapedProviderData }
 */

interface ScrapedProviderData {
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
}

export async function POST(request: NextRequest) {
  try {
    const { url, seedName, data } = await request.json();

    if (!url || !seedName || !data) {
      return NextResponse.json(
        { error: 'URL, seed name and data are required' },
        { status: 400 }
      );
    }

    console.log(`📝 Generating seed file for: ${seedName}`);

    // Generar contenido del archivo seed
    const seedContent = generateSeedFileContent(data, seedName, url);

    // Guardar archivo
    const className = toPascalCase(seedName);
    const fileName = `seed${className}.ts`;
    const filePath = path.join(process.cwd(), 'src', 'lib', 'seeds', fileName);

    fs.writeFileSync(filePath, seedContent, 'utf-8');

    console.log(`✅ Seed file created: ${filePath}`);

    // Actualizar el registro de seeds en index.ts
    try {
      updateSeedRegistry(seedName, className);
      console.log(`✅ Seed registry updated`);
    } catch (registryError) {
      console.error('⚠️ Warning: Could not update seed registry:', registryError);
      // No falla la operación completa si no se puede actualizar el registro
    }

    return NextResponse.json({
      success: true,
      filePath: `src/lib/seeds/${fileName}`,
      fileName,
      className: `seed${className}`,
    });

  } catch (error) {
    console.error('❌ Error generating seed file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate seed file' },
      { status: 500 }
    );
  }
}

function updateSeedRegistry(seedName: string, className: string): void {
  const indexPath = path.join(process.cwd(), 'src', 'lib', 'seeds', 'index.ts');

  // Leer el archivo actual
  let content = fs.readFileSync(indexPath, 'utf-8');

  const functionName = `seed${className}`;
  const importStatement = `import { ${functionName} } from './seed${className}';`;

  // Verificar si ya existe el import
  if (content.includes(importStatement)) {
    console.log(`Import statement already exists for ${functionName}`);
    return;
  }

  // 1. Agregar import después de los imports existentes
  const lastImportIndex = content.lastIndexOf("import { seed");
  if (lastImportIndex !== -1) {
    const endOfLineIndex = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLineIndex + 1) + importStatement + '\n' + content.slice(endOfLineIndex + 1);
  }

  // 2. Agregar entradas al seedRegistry
  const registryPattern = /export const seedRegistry: SeedRegistry = \{([\s\S]+?)\};/;
  const registryMatch = content.match(registryPattern);

  if (registryMatch) {
    const registryContent = registryMatch[1];
    const newEntries = `
  '${seedName}': ${functionName},
  '${seedName.replace(/-/g, '')}': ${functionName},
  '${className}': ${functionName},
`;

    const newRegistryContent = registryContent + newEntries;
    content = content.replace(registryPattern, `export const seedRegistry: SeedRegistry = {${newRegistryContent}};`);
  }

  // 3. Agregar a la lista de seeds disponibles
  const listPattern = /export function listAvailableSeeds\(\): string\[\] \{[\s\S]*?return \[([\s\S]*?)\];/;
  const listMatch = content.match(listPattern);

  if (listMatch) {
    const listContent = listMatch[1];
    const newEntry = `\n    '${seedName}',`;
    const newListContent = listContent + newEntry;
    content = content.replace(listPattern, `export function listAvailableSeeds(): string[] {\n  return [${newListContent}];`);
  }

  // Escribir el archivo actualizado
  fs.writeFileSync(indexPath, content, 'utf-8');
}

function generateSeedFileContent(data: ScrapedProviderData, seedName: string, url: string): string {
  const className = toPascalCase(seedName);
  const timestamp = new Date().toISOString().split('T')[0];

  return `/**
 * Seed script para ${data.businessName}
 *
 * Información extraída de: ${url}
 * Fecha: ${timestamp}
 * Generado automáticamente desde Admin Panel
 *
 * Contacto:
 * - Email: ${data.contact.email || '[COMPLETAR]'}
 * - Teléfono: ${data.contact.phone || '[COMPLETAR]'}
 * - WhatsApp: ${data.contact.whatsapp || data.contact.phone || '[COMPLETAR]'}
 * - Instagram: ${data.social.instagram || '[COMPLETAR]'}
 * - Ubicación: ${data.contact.address || 'San Pedro de Atacama'}
 */

import { adminDb } from '@/lib/firebaseAdmin';
import { ProviderLead } from '@/types/provider';
import { cleanupByBusinessName } from './seedCleanup';

const ADMIN_ID = 'admin-seed';

export async function seed${className}() {
  console.log('🌟 Seeding ${data.businessName}...');

  try {
    // ========== 0. CLEANUP EXISTING DATA ==========
    console.log('Cleaning up existing ${data.businessName} data...');
    await cleanupByBusinessName('${data.businessName}');

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
      createdAt: new Date() as any,
      updatedAt: new Date() as any,

      notes: '${data.description}. Website: ${url}${data.social.instagram ? ` | Instagram: ${data.social.instagram}` : ''}',

      tags: ['${data.category}', 'auto-generated'],
    };

    const leadRef = await adminDb.collection('providerLeads').add(leadData);
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
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      metadata: {
        notes: 'Auto-generado desde Admin Panel. Validar información.',
      },
    };

    const invitationRef = await adminDb.collection('invitations').add(invitationData);

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
