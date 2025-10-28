#!/usr/bin/env tsx

/**
 * Script para ejecutar los seeds de onboarding
 * Ejecutar con: npm run seed-all
 */

// Cargar variables de entorno ANTES de importar Firebase
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { seedCasaVoyage } from '../src/lib/seeds/seedCasaVoyage';
import { seedTierraGres } from '../src/lib/seeds/seedTierraGres';
import { seedJoyasRelmu } from '../src/lib/seeds/seedJoyasRelmu';

async function runAllSeeds() {
  console.log('🌱 Iniciando seeds de onboarding...\n');

  try {
    // 1. Casa Voyage (Lodging)
    console.log('🏠 Ejecutando seed: Casa Voyage...');
    const casaVoyageResult = await seedCasaVoyage();
    console.log('✅ Casa Voyage completado!');
    console.log(`   - Lead ID: ${casaVoyageResult.leadId}`);
    console.log(`   - Stay ID: ${casaVoyageResult.stayId}`);
    console.log(`   - Invitation: ${casaVoyageResult.invitationCode}\n`);

    // 2. Tierra Gres (Ceramics - Antonia)
    console.log('🏺 Ejecutando seed: Tierra Gres (Antonia)...');
    const tierraGresResult = await seedTierraGres();
    console.log('✅ Tierra Gres completado!');
    console.log(`   - Lead ID: ${tierraGresResult.leadId}`);
    console.log(`   - Productos: ${(tierraGresResult as any).stats?.productos || 'N/A'}`);
    console.log(`   - Stock Total: ${(tierraGresResult as any).stats?.stockTotal || 0} piezas`);
    console.log(`   - Valor Venta: $${((tierraGresResult as any).stats?.valorVenta || 0).toLocaleString('es-CL')}`);
    console.log(`   - Margen: $${((tierraGresResult as any).stats?.margen || 0).toLocaleString('es-CL')}`);
    console.log(`   - Invitation: ${tierraGresResult.invitationCode}\n`);

    // 3. Joyas Relmu (Jewelry - Javi)
    console.log('💎 Ejecutando seed: Joyas Relmu (Javi)...');
    const joyasRelmuResult = await seedJoyasRelmu();
    console.log('✅ Joyas Relmu completado!');
    console.log(`   - Lead ID: ${joyasRelmuResult.leadId}`);
    console.log(`   - Productos: ${(joyasRelmuResult as any).stats?.productos || 'N/A'}`);
    console.log(`   - Stock Total: ${(joyasRelmuResult as any).stats?.stockTotal || 0} piezas`);
    console.log(`   - Valor Venta: $${((joyasRelmuResult as any).stats?.valorVenta || 0).toLocaleString('es-CL')}`);
    console.log(`   - Margen: $${((joyasRelmuResult as any).stats?.margen || 0).toLocaleString('es-CL')}`);
    console.log(`   - Invitation: ${joyasRelmuResult.invitationCode}\n`);

    console.log('🎉 Todos los seeds completados exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - 3 Provider Leads creados`);
    console.log(`   - 1 Stay (Casa Voyage) creado`);
    const totalProductos = ((tierraGresResult as any).stats?.productos || 0) + ((joyasRelmuResult as any).stats?.productos || 0);
    console.log(`   - ${totalProductos} productos marketplace creados`);
    console.log(`   - 3 invitaciones generadas`);
    console.log('\n🌐 Revisa:');
    console.log('   - Marketplace: https://tripapp-rho.vercel.app/marketplace');
    console.log('   - Stay: https://tripapp-rho.vercel.app/stay');
    console.log('   - Admin Leads: https://tripapp-rho.vercel.app/admin/provider-leads');
    console.log('   - Admin Invitations: https://tripapp-rho.vercel.app/admin/invitations');

  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    process.exit(1);
  }
}

// Ejecutar
runAllSeeds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
