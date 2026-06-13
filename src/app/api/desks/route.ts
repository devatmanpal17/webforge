import { NextRequest, NextResponse } from 'next/server';
import { getDesks } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const floor = searchParams.get('floor');

  try {
    const desks = getDesks(floor ? parseInt(floor, 10) : undefined);
    return NextResponse.json({ desks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch desks' }, { status: 500 });
  }
}
