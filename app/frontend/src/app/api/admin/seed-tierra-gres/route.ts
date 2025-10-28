import { NextResponse } from 'next/server';
import { seedTierraGres } from '@/lib/seeds/seedTierraGres';

export async function POST() {
  try {
    const result = await seedTierraGres();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error seeding Tierra Gres:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed Tierra Gres' },
      { status: 500 }
    );
  }
}
