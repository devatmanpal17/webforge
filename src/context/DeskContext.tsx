"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Desk, Session, User } from '../types';

interface DeskContextType {
  desks: Desk[];
  activeSession: Session | null;
  currentUser: User | null;
  userRole: 'student' | 'librarian' | null;
  login: (role: 'student' | 'librarian', userDetails?: Partial<User>) => void;
  logout: () => void;
  bookDesk: (deskId: string) => void;
  setAway: () => void;
  returnFromAway: () => void;
  endSession: () => void;
  releaseDesk: (deskId: string) => void;
  refreshDesks: () => void;
  loading: boolean;
}

const DEFAULT_STUDENT: User = {
  id: 'u1',
  name: 'Sarah',
  email: 'sarah@university.edu',
  initials: 'SK',
};

const DEFAULT_LIBRARIAN: User = {
  id: 'lib1',
  name: 'Library Admin',
  email: 'admin@library.edu',
  initials: 'LA',
};

const DeskContext = createContext<DeskContextType | undefined>(undefined);

export const DeskProvider = ({ children }: { children: ReactNode }) => {
  const [desks, setDesks] = useState<Desk[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'librarian' | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from local storage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('deskguard_role') as 'student' | 'librarian' | null;
    if (savedRole) {
      setUserRole(savedRole);
      setCurrentUser(savedRole === 'student' ? DEFAULT_STUDENT : DEFAULT_LIBRARIAN);
    }
  }, []);

  const login = (role: 'student' | 'librarian', userDetails?: Partial<User>) => {
    setUserRole(role);
    localStorage.setItem('deskguard_role', role);
    setCurrentUser(role === 'student' ? { ...DEFAULT_STUDENT, ...userDetails } : { ...DEFAULT_LIBRARIAN, ...userDetails });
  };

  const logout = () => {
    setUserRole(null);
    setCurrentUser(null);
    localStorage.removeItem('deskguard_role');
  };

  // ── Fetch all desks ──
  const refreshDesks = useCallback(async () => {
    try {
      const res = await fetch('/api/desks');
      const data = await res.json();
      if (data.desks) {
        setDesks(data.desks.map((d: any) => ({
          id: d.id,
          zone: d.zone,
          floor: d.floor,
          status: d.status as Desk['status'],
          x: d.x,
          y: d.y,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch desks:', err);
    }
  }, []);

  // ── Fetch active session for current user ──
  const refreshSession = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const res = await fetch(`/api/sessions?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.session) {
        setActiveSession({
          id: data.session.id,
          deskId: data.session.desk_id,
          studentId: data.session.student_id,
          studentName: currentUser.name,
          studentInitials: currentUser.initials,
          startTime: data.session.start_time,
          endTime: data.session.end_time,
          awayEndTime: data.session.away_end_time || undefined,
          status: data.session.status as Session['status'],
        });
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    }
  }, [currentUser]);

  // ── Initial load ──
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([refreshDesks(), refreshSession()]);
      setLoading(false);
    };
    loadData();
  }, [refreshDesks, refreshSession]);

  // ── Actions ──
  const bookDesk = async (deskId: string) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, deskId }),
      });

      if (res.ok) {
        await Promise.all([refreshDesks(), refreshSession()]);
      } else {
        const errData = await res.json();
        console.error('Book desk failed:', errData.error);
      }
    } catch (err) {
      console.error('Failed to book desk:', err);
    }
  };

  const setAway = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'away' }),
      });

      if (res.ok) {
        await Promise.all([refreshDesks(), refreshSession()]);
      }
    } catch (err) {
      console.error('Failed to set away:', err);
    }
  };

  const returnFromAway = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return' }),
      });

      if (res.ok) {
        await Promise.all([refreshDesks(), refreshSession()]);
      }
    } catch (err) {
      console.error('Failed to return from away:', err);
    }
  };

  const endSession = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      });

      if (res.ok) {
        await Promise.all([refreshDesks(), refreshSession()]);
      }
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  const releaseDesk = async (deskId: string) => {
    // Find the session for this desk — look through the API
    try {
      const deskRes = await fetch(`/api/desks/${deskId}`);
      const deskData = await deskRes.json();

      if (deskData.currentSession) {
        const res = await fetch(`/api/sessions/${deskData.currentSession.id}/release`, {
          method: 'POST',
        });

        if (res.ok) {
          await refreshDesks();
        }
      }
    } catch (err) {
      console.error('Failed to release desk:', err);
    }
  };

  return (
    <DeskContext.Provider value={{
      desks,
      activeSession,
      currentUser,
      userRole,
      login,
      logout,
      bookDesk,
      setAway,
      returnFromAway,
      endSession,
      releaseDesk,
      refreshDesks,
      loading,
    }}>
      {children}
    </DeskContext.Provider>
  );
};

export const useDeskContext = () => {
  const context = useContext(DeskContext);
  if (!context) {
    throw new Error('useDeskContext must be used within a DeskProvider');
  }
  return context;
};
