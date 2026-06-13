import { NextRequest, NextResponse } from 'next/server';
import { getActiveSessionForUser, bookDesk, getDesk } from '@/lib/db';

// GET /api/sessions?userId=u1 — get active session for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const session = getActiveSessionForUser(userId);
    return NextResponse.json({ session: session || null });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

// POST /api/sessions — book a desk
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, deskId } = body;

    if (!userId || !deskId) {
      return NextResponse.json({ error: 'userId and deskId are required' }, { status: 400 });
    }

    // Check if user already has an active session
    const existing = getActiveSessionForUser(userId);
    if (existing) {
      return NextResponse.json({ error: 'User already has an active session' }, { status: 409 });
    }

    // Check if desk is available
    const desk = getDesk(deskId);
    if (!desk) {
      return NextResponse.json({ error: 'Desk not found' }, { status: 404 });
    }
    if (desk.status !== 'available') {
      return NextResponse.json({ error: 'Desk is not available' }, { status: 409 });
    }

    const session = bookDesk(userId, deskId);
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
