import { NextRequest, NextResponse } from 'next/server';
import { setSessionAway, returnFromAway, endSessionById } from '@/lib/db';

// PATCH /api/sessions/[id] — update session status (away, return, end)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { action } = body;

    if (!action || !['away', 'return', 'end'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be one of: away, return, end' },
        { status: 400 }
      );
    }

    let session;
    switch (action) {
      case 'away':
        session = setSessionAway(id);
        break;
      case 'return':
        session = returnFromAway(id);
        break;
      case 'end':
        session = endSessionById(id);
        break;
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    if (error?.message === 'Session not found') {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
