import sqlite3
import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

# Adjust path to match where the local db is stored
DB_DIR = os.path.join(os.path.dirname(__file__), 'data')
DB_PATH = os.path.join(DB_DIR, 'deskguard.db')

def get_db():
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR, exist_ok=True)
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.executescript('''
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
    ''')
    conn.commit()
    
    # Check if empty
    cursor.execute('SELECT COUNT(*) as c FROM desks')
    if cursor.fetchone()['c'] == 0:
        seed_database(conn)
        
    conn.close()

def seed_database(conn):
    # Same seed as Next.js
    cursor = conn.cursor()
    
    # Insert dummy users if needed, though they will come from Firebase Auth now
    cursor.execute("INSERT OR IGNORE INTO users (id, name, email, initials, role) VALUES ('u1', 'Sarah', 'sarah@university.edu', 'SK', 'student')")
    cursor.execute("INSERT OR IGNORE INTO users (id, name, email, initials, role) VALUES ('lib1', 'Library Admin', 'admin@library.edu', 'LA', 'librarian')")
    
    zones = {
        'Quiet': {'desks': 12, 'floors': [1, 2]},
        'Collab': {'desks': 8, 'floors': [1]},
        'Focus': {'desks': 6, 'floors': [2]}
    }
    
    import random
    
    for zone_name, info in zones.items():
        for floor in info['floors']:
            for i in range(info['desks']):
                desk_id = f"d_{floor}_{zone_name[:1].lower()}_{i+1}"
                x = 10 + (i % 4) * 20
                y = 10 + (i // 4) * 20
                
                cursor.execute(
                    "INSERT INTO desks (id, zone, floor, x, y, status) VALUES (?, ?, ?, ?, ?, ?)",
                    (desk_id, zone_name, floor, x, y, 'available')
                )
    
    conn.commit()

def get_desks(floor: Optional[int] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    if floor is not None:
        cursor.execute('SELECT * FROM desks WHERE floor = ? ORDER BY id', (floor,))
    else:
        cursor.execute('SELECT * FROM desks ORDER BY floor, id')
    desks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return desks

def get_desk(desk_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM desks WHERE id = ?', (desk_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_active_session_for_user(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM sessions 
        WHERE student_id = ? AND status IN ('active', 'away') 
        ORDER BY created_at DESC LIMIT 1
    ''', (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_active_session_for_desk(desk_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT s.*, u.name as student_name, u.initials as student_initials
        FROM sessions s
        JOIN users u ON s.student_id = u.id
        WHERE s.desk_id = ? AND s.status IN ('active', 'away')
        ORDER BY s.created_at DESC LIMIT 1
    ''', (desk_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def book_desk(user_id: str, desk_id: str) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    
    now = datetime.utcnow()
    end_time = now + timedelta(hours=2)
    session_id = f"s_{int(now.timestamp() * 1000)}"
    
    try:
        cursor.execute('UPDATE desks SET status = ? WHERE id = ?', ('occupied', desk_id))
        cursor.execute(
            'INSERT INTO sessions (id, desk_id, student_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
            (session_id, desk_id, user_id, now.isoformat() + 'Z', end_time.isoformat() + 'Z', 'active')
        )
        conn.commit()
        
        cursor.execute('SELECT * FROM sessions WHERE id = ?', (session_id,))
        session = dict(cursor.fetchone())
    finally:
        conn.close()
        
    return session

def set_session_away(session_id: str) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    
    away_end = datetime.utcnow() + timedelta(minutes=20)
    
    try:
        cursor.execute('SELECT desk_id FROM sessions WHERE id = ?', (session_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError('Session not found')
        desk_id = row['desk_id']
        
        cursor.execute('UPDATE sessions SET status = ?, away_end_time = ? WHERE id = ?', 
                       ('away', away_end.isoformat() + 'Z', session_id))
        cursor.execute('UPDATE desks SET status = ? WHERE id = ?', ('away', desk_id))
        conn.commit()
        
        cursor.execute('SELECT * FROM sessions WHERE id = ?', (session_id,))
        session = dict(cursor.fetchone())
    finally:
        conn.close()
        
    return session

def return_from_away(session_id: str) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT desk_id FROM sessions WHERE id = ?', (session_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError('Session not found')
        desk_id = row['desk_id']
        
        cursor.execute('UPDATE sessions SET status = ?, away_end_time = NULL WHERE id = ?', 
                       ('active', session_id))
        cursor.execute('UPDATE desks SET status = ? WHERE id = ?', ('occupied', desk_id))
        conn.commit()
        
        cursor.execute('SELECT * FROM sessions WHERE id = ?', (session_id,))
        session = dict(cursor.fetchone())
    finally:
        conn.close()
        
    return session

def end_session_by_id(session_id: str) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT desk_id FROM sessions WHERE id = ?', (session_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError('Session not found')
        desk_id = row['desk_id']
        
        cursor.execute('UPDATE sessions SET status = ? WHERE id = ?', ('ended', session_id))
        cursor.execute('UPDATE desks SET status = ? WHERE id = ?', ('available', desk_id))
        conn.commit()
        
        cursor.execute('SELECT * FROM sessions WHERE id = ?', (session_id,))
        session = dict(cursor.fetchone())
    finally:
        conn.close()
        
    return session

def release_desk_by_session_id(session_id: str):
    end_session_by_id(session_id)

def get_floor_stats() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
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
    ''')
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return stats

def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_or_update_user(user_id: str, email: str, name: str, role: str) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    
    initials = "".join([n[0] for n in name.split() if n])[:2].upper()
    if not initials:
        initials = email[:2].upper()
        
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute('UPDATE users SET name = ?, email = ?, initials = ?, role = ? WHERE id = ?',
                       (name, email, initials, role, user_id))
    else:
        cursor.execute('INSERT INTO users (id, name, email, initials, role) VALUES (?, ?, ?, ?, ?)',
                       (user_id, name, email, initials, role))
    conn.commit()
    
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = dict(cursor.fetchone())
    conn.close()
    return user

def get_all_students() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            u.*,
            s.desk_id as active_desk_id,
            s.status as session_status
        FROM users u
        LEFT JOIN (
            SELECT student_id, desk_id, status
            FROM sessions
            WHERE status != 'ended'
            GROUP BY student_id
        ) s ON u.id = s.student_id
        WHERE u.role = 'student'
    ''')
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return students

def get_all_active_sessions() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            s.id, s.student_id as user_id, s.desk_id, s.status, s.start_time, s.away_end_time,
            u.name as user_name, u.initials as user_initials, u.email as user_email,
            d.zone as desk_zone
        FROM sessions s
        JOIN users u ON s.student_id = u.id
        JOIN desks d ON s.desk_id = d.id
        WHERE s.status != 'ended'
        ORDER BY s.start_time DESC
    ''')
    sessions = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return sessions

# Initialize DB on import
init_db()
