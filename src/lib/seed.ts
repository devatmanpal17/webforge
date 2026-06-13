import type Database from 'better-sqlite3';

/**
 * Idempotent seed — only called when the desks table is empty.
 * Creates 3 floors × 20 desks each + 3 mock users.
 * Floor 1 = quietest (~15 free), Floor 2 = moderate (~10 free), Floor 3 = busiest (~6 free)
 */
export function seedDatabase(db: Database.Database): void {
  const tx = db.transaction(() => {
    // ── Users ──
    const insertUser = db.prepare(
      'INSERT OR IGNORE INTO users (id, name, email, initials, role) VALUES (?, ?, ?, ?, ?)'
    );
    insertUser.run('u1', 'Sarah Kim', 'sarah@university.edu', 'SK', 'student');
    insertUser.run('u2', 'Alex Turner', 'alex@university.edu', 'AT', 'student');
    insertUser.run('u3', 'Maria Chen', 'maria@university.edu', 'MC', 'student');
    insertUser.run('admin1', 'Dr. Patel', 'patel@university.edu', 'DP', 'librarian');

    // ── Desks — explicitly varied per floor ──
    const insertDesk = db.prepare(
      'INSERT OR IGNORE INTO desks (id, zone, floor, x, y, status) VALUES (?, ?, ?, ?, ?, ?)'
    );

    // Floor 1: quietest — 15 available, 3 occupied, 1 away, 1 flagged
    const floor1: Array<'available' | 'occupied' | 'away' | 'flagged'> = [
      'available', 'available', 'available', 'available', 'available',
      'available', 'available', 'available', 'occupied', 'occupied',
      'available', 'available', 'available', 'available', 'away',
      'available', 'available', 'occupied', 'available', 'flagged',
    ];

    // Floor 2: moderate — 10 available, 6 occupied, 2 away, 2 flagged
    const floor2: Array<'available' | 'occupied' | 'away' | 'flagged'> = [
      'available', 'occupied', 'available', 'occupied', 'available',
      'available', 'away', 'occupied', 'available', 'available',
      'occupied', 'available', 'flagged', 'available', 'occupied',
      'away', 'available', 'occupied', 'flagged', 'available',
    ];

    // Floor 3: busiest — 6 available, 9 occupied, 3 away, 2 flagged
    const floor3: Array<'available' | 'occupied' | 'away' | 'flagged'> = [
      'occupied', 'occupied', 'available', 'occupied', 'away',
      'occupied', 'available', 'occupied', 'occupied', 'away',
      'available', 'occupied', 'flagged', 'occupied', 'available',
      'away', 'occupied', 'flagged', 'available', 'available',
    ];

    const floorStatuses = [floor1, floor2, floor3];

    for (let floor = 1; floor <= 3; floor++) {
      const statuses = floorStatuses[floor - 1];
      for (let i = 1; i <= 20; i++) {
        const zone = i <= 10 ? 'Tables' : i <= 15 ? 'Open Area' : 'Window Seat';
        const col = (i - 1) % 5;
        const row = Math.floor((i - 1) / 5);
        const x = col * 42 + 10;
        const y = row * 42 + 10;
        const status = statuses[i - 1];

        insertDesk.run(`F${floor}-D${i}`, zone, floor, x, y, status);
      }
    }

    // ── Create mock sessions for occupied/away/flagged desks ──
    const insertSession = db.prepare(
      'INSERT OR IGNORE INTO sessions (id, desk_id, student_id, start_time, end_time, away_end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    const now = Date.now();
    let sessionCounter = 0;
    const students = ['u2', 'u3']; // u1 is the current user — keep them free to test booking

    const allDesks = db.prepare("SELECT id, status FROM desks WHERE status != 'available'").all() as Array<{ id: string; status: string }>;
    for (const desk of allDesks) {
      sessionCounter++;
      const startTime = new Date(now - 60 * 60 * 1000); // Started 1 hour ago
      const endTime = new Date(now + 60 * 60 * 1000); // Ends in 1 hour
      const awayEnd = desk.status === 'away' ? new Date(now + 10 * 60 * 1000).toISOString() : null;
      const student = students[sessionCounter % students.length];
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
