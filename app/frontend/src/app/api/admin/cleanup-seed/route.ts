import { NextRequest, NextResponse } from 'next/server';
import { cleanupByBusinessName } from '@/lib/seeds/seedCleanup';

/**
 * API endpoint para eliminar datos de un seed específico
 *
 * POST /api/admin/cleanup-seed
 * Body: { businessName: string }
 */

export async function POST(request: NextRequest) {
  try {
    const { businessName } = await request.json();

    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Cleaning up seed: ${businessName}`);

    // Ejecutar la limpieza
    await cleanupByBusinessName(businessName);

    console.log(`✅ Cleanup completed for: ${businessName}`);

    return NextResponse.json({
      success: true,
      message: `Seed "${businessName}" cleaned up successfully`,
    });

  } catch (error) {
    console.error('❌ Error cleaning up seed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to cleanup seed',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
