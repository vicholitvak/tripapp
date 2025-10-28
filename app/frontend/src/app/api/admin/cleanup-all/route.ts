import { NextRequest, NextResponse } from 'next/server';
import { cleanupAllMockData } from '@/lib/seeds/seedCleanup';

/**
 * API endpoint para limpiar TODOS los datos mock/seed
 *
 * POST /api/admin/cleanup-all
 * ADVERTENCIA: Esto elimina todos los datos mock de la base de datos
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 WARNING: Cleaning up ALL mock data...');

    const deletedCount = await cleanupAllMockData();

    console.log(`✅ Full cleanup complete: ${deletedCount} records deleted`);

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `All mock data cleaned up: ${deletedCount} records deleted`,
    });

  } catch (error) {
    console.error('❌ Error cleaning up all data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cleanup all data' },
      { status: 500 }
    );
  }
}
