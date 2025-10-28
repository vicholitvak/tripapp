import { NextResponse } from 'next/server';
import { seedAtacamaDarkSky } from '@/lib/seeds/seedAtacamaDarkSky';

export async function POST() {
  try {
    const result = await seedAtacamaDarkSky();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error seeding Atacama Dark Sky:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed Atacama Dark Sky' },
      { status: 500 }
    );
  }
}
