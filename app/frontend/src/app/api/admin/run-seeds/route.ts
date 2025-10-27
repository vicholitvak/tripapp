import { NextRequest, NextResponse } from 'next/server';
import { seedCasaVoyage } from '@/lib/seeds/seedCasaVoyage';
import { seedTierraGres } from '@/lib/seeds/seedTierraGres';
import { seedJoyasRelmu } from '@/lib/seeds/seedJoyasRelmu';

/**
 * API endpoint para ejecutar todos los seeds de onboarding
 * POST /api/admin/run-seeds
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Agregar validación de autenticación admin aquí

    console.log('🌱 Iniciando seeds de onboarding...');

    // 1. Casa Voyage (Lodging)
    console.log('🏠 Ejecutando seed: Casa Voyage...');
    const casaVoyageResult = await seedCasaVoyage();
    console.log('✅ Casa Voyage completado!');

    // 2. Tierra Gres (Ceramics - Antonia)
    console.log('🏺 Ejecutando seed: Tierra Gres (Antonia)...');
    const tierraGresResult = await seedTierraGres();
    console.log('✅ Tierra Gres completado!');

    // 3. Joyas Relmu (Jewelry - Javi)
    console.log('💎 Ejecutando seed: Joyas Relmu (Javi)...');
    const joyasRelmuResult = await seedJoyasRelmu();
    console.log('✅ Joyas Relmu completado!');

    console.log('🎉 Todos los seeds completados exitosamente!');

    return NextResponse.json({
      success: true,
      message: 'Todos los seeds ejecutados exitosamente',
      results: {
        casaVoyage: {
          leadId: casaVoyageResult.leadId,
          stayId: casaVoyageResult.stayId,
          invitationCode: casaVoyageResult.invitationCode,
        },
        tierraGres: {
          leadId: tierraGresResult.leadId,
          mockProviderId: tierraGresResult.mockProviderId,
          productos: tierraGresResult.stats.productos,
          stockTotal: tierraGresResult.stats.stockTotal,
          valorVenta: tierraGresResult.stats.valorVenta,
          margen: tierraGresResult.stats.margen,
          invitationCode: tierraGresResult.invitationCode,
        },
        joyasRelmu: {
          leadId: joyasRelmuResult.leadId,
          mockProviderId: joyasRelmuResult.mockProviderId,
          productos: joyasRelmuResult.stats.productos,
          stockTotal: joyasRelmuResult.stats.stockTotal,
          valorVenta: joyasRelmuResult.stats.valorVenta,
          margen: joyasRelmuResult.stats.margen,
          invitationCode: joyasRelmuResult.invitationCode,
        },
      },
      summary: {
        totalLeads: 3,
        totalStays: 1,
        totalMarketplaceProducts: tierraGresResult.stats.productos + joyasRelmuResult.stats.productos,
        totalInvitations: 3,
      },
    });

  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
