import Database from 'better-sqlite3';
import path from 'path';
import { seedDatabase } from './seed';

// Singleton database instance
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'data', 'deskguard.db');
  
  // Ensure data directory exists
  const fs = require('fs');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      initials TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student'
    );

    CREATE TABLE IF NOT EXISTS desks (
      id TEXT PRIMARY KEY,
      zone TEXT NOT NULL,
      floor INTEGER NOT NULL,
      x INTEGER NOT NULL,
      y INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'available'
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      desk_id TEXT NOT NULL REFERENCES desks(id),
      student_id TEXT NOT NULL REFERENCES users(id),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      away_end_time TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM desks').get() as { c: number };
  if (count.c === 0) {
    seedDatabase(db);
  }

  return db;
}

// ── Query helpers ──

export interface DeskRow {
  id: string;
  zone: string;
  floor: number;
  x: number;
  y: number;
  status: string;
}

export interface SessionRow {
  id: string;
  desk_id: string;
  student_id: string;
  start_time: string;
  end_time: string;
  away_end_time: string | null;
  status: string;
  created_at: string;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
}

export function getDesks(floor?: number): DeskRow[] {
  const db = getDb();
  if (floor) {
    return db.prepare('SELECT * FROM desks WHERE floor = ? ORDER BY id').all(floor) as DeskRow[];
  }
  return db.prepare('SELECT * FROM desks ORDER BY floor, id').all() as DeskRow[];
}

export function getDesk(id: string): DeskRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM desks WHERE id = ?').get(id) as DeskRow | undefined;
}

export function getActiveSessionForUser(userId: string): SessionRow | undefined {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM sessions WHERE student_id = ? AND status IN ('active', 'away') ORDER BY created_at DESC LIMIT 1"
  ).get(userId) as SessionRow | undefined;
}

export function getActiveSessionForDesk(deskId: string): (SessionRow & { student_name: string; student_initials: string }) | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT s.*, u.name as student_name, u.initials as student_initials
    FROM sessions s
    JOIN users u ON s.student_id = u.id
    WHERE s.desk_id = ? AND s.status IN ('active', 'away')
    ORDER BY s.created_at DESC LIMIT 1
  `).get(deskId) as (SessionRow & { student_name: string; student_initials: string }) | undefined;
}

export function bookDesk(userId: string, deskId: string): SessionRow {
  const db = getDb();
  const now = new Date();
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
  const sessionId = `s_${Date.now()}`;

  const tx = db.transaction(() => {
    // Mark desk as occupied
    db.prepare('UPDATE desks SET status = ? WHERE id = ?').run('occupied', deskId);

    // Create session
    db.prepare(
      'INSERT INTO sessions (id, desk_id, student_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(sessionId, deskId, userId, now.toISOString(), endTime.toISOString(), 'active');

    return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRow;
  });

  return tx();
}

export function setSessionAway(sessionId: string): SessionRow {
  const db = getDb();
  const awayEnd = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

  const tx = db.transaction(() => {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRow;
    if (!session) throw new Error('Session not found');

    db.prepare('UPDATE sessions SET status = ?, away_end_time = ? WHERE id = ?')
      .run('away', awayEnd.toISOString(), sessionId);
    db.prepare('UPDATE desks SET status = ? WHERE id = ?')
      .run('away', session.desk_id);

    return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRow;
  });

  return tx();
}

export function returnFromAway(sessionId: string): SessionRow {
  const db = getDb();

  const tx = db.transaction(() => {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRow;
    if (!session) throw new Error('Session not found');

    db.prepare('UPDATE sessions SET status = ?, away_end_time = NULL WHERE id = ?')
      .run('active', sessionId);
    db.prepare('UPDATE desks SET status = ? WHERE id = ?')
      .run('occupied', session.desk_id);

    return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRow;
  });

  return tx();
}

export function endSessionById(sessionId: string): SessionRow {
  const db = getDb();

  const tx = db.transaction(() => {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRow;
    if (!session) throw new Error('Session not found');

    db.prepare('UPDATE sessions SET status = ? WHERE id = ?')
      .run('ended', sessionId);
    db.prepare('UPDATE desks SET status = ? WHERE id = ?')
      .run('available', session.desk_id);

    return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRow;
  });

  return tx();
}

export function releaseDeskBySessionId(sessionId: string): void {
  const db = getDb();

  db.transaction(() => {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRow;
    if (!session) throw new Error('Session not found');

    db.prepare('UPDATE sessions SET status = ? WHERE id = ?').run('ended', sessionId);
    db.prepare('UPDATE desks SET status = ? WHERE id = ?').run('available', session.desk_id);
  })();
}

export interface FloorStats {
  floor: number;
  total: number;
  available: number;
  occupied: number;
  away: number;
  flagged: number;
}

export function getFloorStats(): FloorStats[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT 
      floor,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
      SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
      SUM(CASE WHEN status = 'away' THEN 1 ELSE 0 END) as away,
      SUM(CASE WHEN status = 'flagged' THEN 1 ELSE 0 END) as flagged
    FROM desks
    GROUP BY floor
    ORDER BY floor
  `).all() as FloorStats[];

  return rows;
}

export function getUser(id: string): UserRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}
