import { NextRequest, NextResponse } from 'next/server';
import { getDesk, getActiveSessionForDesk } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const desk = getDesk(id);
    if (!desk) {
      return NextResponse.json({ error: 'Desk not found' }, { status: 404 });
    }

    const session = getActiveSessionForDesk(id);

    return NextResponse.json({
      desk,
      currentSession: session ? {
        id: session.id,
        studentName: session.student_name,
        studentInitials: session.student_initials,
        startTime: session.start_time,
        endTime: session.end_time,
        awayEndTime: session.away_end_time,
        status: session.status,
      } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch desk' }, { status: 500 });
  }
}
