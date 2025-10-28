import { NextResponse } from 'next/server';
import { seedCasaVoyage } from '@/lib/seeds/seedCasaVoyage';

export async function POST() {
  try {
    const result = await seedCasaVoyage();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error seeding Casa Voyage:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed Casa Voyage' },
      { status: 500 }
    );
  }
}
