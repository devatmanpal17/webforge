import { NextResponse } from 'next/server';
import { getFloorStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = getFloorStats();
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
