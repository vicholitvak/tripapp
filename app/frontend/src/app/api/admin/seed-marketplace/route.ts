import { NextRequest, NextResponse } from 'next/server';
import { seedMarketplace, clearMarketplace, getSeedStats } from '@/lib/seeds/seedMarketplace';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'seed') {
      const result = await seedMarketplace();
      return NextResponse.json(result, { status: 200 });
    } else if (action === 'clear') {
      const result = await clearMarketplace();
      return NextResponse.json(result, { status: 200 });
    } else if (action === 'stats') {
      const stats = getSeedStats();
      return NextResponse.json(stats, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in marketplace seed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute marketplace operation' },
      { status: 500 }
    );
  }
}

// GET endpoint for stats (doesn't need body)
export async function GET() {
  try {
    const stats = getSeedStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error getting seed stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get stats' },
      { status: 500 }
    );
  }
}
