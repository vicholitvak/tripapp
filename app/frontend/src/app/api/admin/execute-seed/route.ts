import { NextRequest, NextResponse } from 'next/server';
import { getSeedFunction, listAvailableSeeds } from '@/lib/seeds';

/**
 * API endpoint para ejecutar seeds dinámicamente desde el admin
 *
 * POST /api/admin/execute-seed
 * Body: { seedName: string }
 */

export async function POST(request: NextRequest) {
  try {
    const { seedName } = await request.json();

    if (!seedName) {
      return NextResponse.json(
        { error: 'Seed name is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Executing seed: ${seedName}`);
    console.log(`📋 Available seeds: ${listAvailableSeeds().join(', ')}`);

    // Obtener la función de seed del registro
    const seedFunction = getSeedFunction(seedName);

    if (!seedFunction) {
      const availableSeeds = listAvailableSeeds().join(', ');
      const errorMsg = `Seed '${seedName}' not found. Available seeds: ${availableSeeds}`;
      console.error(`❌ ${errorMsg}`);
      return NextResponse.json(
        { error: errorMsg },
        { status: 404 }
      );
    }

    console.log(`✅ Found seed function for: ${seedName}`);

    // Ejecutar el seed
    try {
      const result = await seedFunction();

      console.log(`✅ Seed executed successfully: ${seedName}`);
      console.log(`📊 Result:`, result);

      return NextResponse.json({
        success: true,
        result,
        message: `Seed ${seedName} executed successfully`,
      });

    } catch (executionError) {
      console.error(`❌ Error executing seed:`, executionError);
      throw new Error(
        `Failed to execute seed: ${executionError instanceof Error ? executionError.message : 'Unknown error'}`
      );
    }

  } catch (error) {
    console.error('❌ Error in execute-seed endpoint:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to execute seed',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
