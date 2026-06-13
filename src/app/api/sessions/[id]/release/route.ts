import { NextRequest, NextResponse } from 'next/server';
import { releaseDeskBySessionId } from '@/lib/db';

// POST /api/sessions/[id]/release — librarian force-release
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    releaseDeskBySessionId(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === 'Session not found') {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to release desk' }, { status: 500 });
  }
}
