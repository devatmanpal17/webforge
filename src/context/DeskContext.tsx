"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Desk, Session, User } from '../types';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

interface DeskContextType {
  desks: Desk[];
  activeSession: Session | null;
  currentUser: User | null;
  userRole: 'student' | 'librarian' | null;
  logout: () => void;
  bookDesk: (deskId: string) => void;
  setAway: () => void;
  returnFromAway: () => void;
  endSession: () => void;
  releaseDesk: (deskId: string) => void;
  refreshDesks: () => void;
  loading: boolean;
}

const DeskContext = createContext<DeskContextType | undefined>(undefined);

export const DeskProvider = ({ children }: { children: ReactNode }) => {
  const [desks, setDesks] = useState<Desk[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'librarian' | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);

  // Helper to fetch with auth token
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (firebaseToken) {
      headers.set('Authorization', `Bearer ${firebaseToken}`);
    }
    return fetch(url, { ...options, headers });
  }, [firebaseToken]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const token = await fbUser.getIdToken();
        setFirebaseToken(token);
        
        // We assume the role is saved in localStorage during login
        const savedRole = localStorage.getItem('deskguard_role') as 'student' | 'librarian' | null;
        const role = savedRole || 'student';
        setUserRole(role);
        
        // Construct basic user info
        const initials = fbUser.displayName 
          ? fbUser.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          : fbUser.email?.substring(0, 2).toUpperCase() || 'U';
          
        setCurrentUser({
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
          initials
        });
      } else {
        setFirebaseToken(null);
        setCurrentUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('deskguard_role');
    } catch (error) {
      console.error("Error signing out", error);
    }
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
    if (!currentUser) {
      setActiveSession(null);
      return;
    }
    
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
  }, [refreshDesks, refreshSession, firebaseToken]);

  // ── Actions ──
  const bookDesk = async (deskId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetchWithAuth('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, deskId }),
      });

      if (res.ok) {
        await Promise.all([refreshDesks(), refreshSession()]);
      } else {
        const errData = await res.json();
        console.error('Book desk failed:', errData.error || errData.detail);
      }
    } catch (err) {
      console.error('Failed to book desk:', err);
    }
  };

  const setAway = async () => {
    if (!activeSession) return;
    try {
      const res = await fetchWithAuth(`/api/sessions/${activeSession.id}`, {
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
      const res = await fetchWithAuth(`/api/sessions/${activeSession.id}`, {
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
      const res = await fetchWithAuth(`/api/sessions/${activeSession.id}`, {
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
    try {
      const deskRes = await fetch(`/api/desks/${deskId}`);
      const deskData = await deskRes.json();

      if (deskData.currentSession) {
        const res = await fetchWithAuth(`/api/sessions/${deskData.currentSession.id}/release`, {
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
