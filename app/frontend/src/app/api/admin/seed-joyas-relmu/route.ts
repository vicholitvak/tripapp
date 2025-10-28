import { NextResponse } from 'next/server';
import { seedJoyasRelmu } from '@/lib/seeds/seedJoyasRelmu';

export async function POST() {
  try {
    const result = await seedJoyasRelmu();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error seeding Joyas Relmu:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed Joyas Relmu' },
      { status: 500 }
    );
  }
}
