import { NextRequest, NextResponse } from 'next/server';
import { cleanupByBusinessName } from '@/lib/seeds/seedCleanup';

/**
 * API endpoint para limpiar datos de un proveedor específico
 *
 * POST /api/admin/cleanup-provider
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

    console.log(`🧹 Cleaning up provider: ${businessName}`);

    const deletedCount = await cleanupByBusinessName(businessName);

    console.log(`✅ Cleanup complete: ${deletedCount} records deleted`);

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${businessName}: ${deletedCount} records deleted`,
    });

  } catch (error) {
    console.error('❌ Error cleaning up provider:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cleanup provider' },
      { status: 500 }
    );
  }
}
