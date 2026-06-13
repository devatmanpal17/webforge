import type Database from 'better-sqlite3';

/**
 * Idempotent seed — only called when the desks table is empty.
 * Creates 3 floors × 20 desks each + 2 mock users.
 */
export function seedDatabase(db: Database.Database): void {
  const tx = db.transaction(() => {
    // ── Users ──
    const insertUser = db.prepare(
      'INSERT OR IGNORE INTO users (id, name, email, initials, role) VALUES (?, ?, ?, ?, ?)'
    );
    insertUser.run('u1', 'Sarah Kim', 'sarah@university.edu', 'SK', 'student');
    insertUser.run('u2', 'Alex Turner', 'alex@university.edu', 'AT', 'student');
    insertUser.run('admin1', 'Dr. Patel', 'patel@university.edu', 'DP', 'librarian');

    // ── Desks ──
    const insertDesk = db.prepare(
      'INSERT OR IGNORE INTO desks (id, zone, floor, x, y, status) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const statuses: Array<'available' | 'occupied' | 'away' | 'flagged'> = [
      'available', 'available', 'available', 'available', 'available',
      'available', 'available', 'available', 'occupied', 'occupied',
      'occupied', 'occupied', 'available', 'available', 'away',
      'available', 'available', 'flagged', 'available', 'available',
    ];

    for (let floor = 1; floor <= 3; floor++) {
      for (let i = 1; i <= 20; i++) {
        const zone = i <= 10 ? 'Tables' : i <= 15 ? 'Open Area' : 'Window Seat';
        const col = (i - 1) % 5;
        const row = Math.floor((i - 1) / 5);
        const x = col * 42 + 10;
        const y = row * 42 + 10;

        // Vary statuses slightly per floor for realism
        const statusIdx = (i - 1 + (floor - 1) * 3) % statuses.length;
        const status = statuses[statusIdx];

        insertDesk.run(`F${floor}-D${i}`, zone, floor, x, y, status);
      }
    }

    // ── Create a few mock sessions for occupied/away/flagged desks ──
    const insertSession = db.prepare(
      'INSERT OR IGNORE INTO sessions (id, desk_id, student_id, start_time, end_time, away_end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    const now = Date.now();
    let sessionCounter = 0;

    const allDesks = db.prepare("SELECT id, status FROM desks WHERE status != 'available'").all() as Array<{ id: string; status: string }>;
    for (const desk of allDesks) {
      sessionCounter++;
      const startTime = new Date(now - 60 * 60 * 1000); // Started 1 hour ago
      const endTime = new Date(now + 60 * 60 * 1000); // Ends in 1 hour
      const awayEnd = desk.status === 'away' ? new Date(now + 10 * 60 * 1000).toISOString() : null;
      const student = sessionCounter % 2 === 0 ? 'u1' : 'u2';
      const sessionStatus = desk.status === 'flagged' ? 'away' : desk.status === 'away' ? 'away' : 'active';

      insertSession.run(
        `seed_s${sessionCounter}`,
        desk.id,
        student,
        startTime.toISOString(),
        endTime.toISOString(),
        awayEnd,
        sessionStatus
      );
    }
  });

  tx();
}
