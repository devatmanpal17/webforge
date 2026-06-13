"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Desk, Session, User } from '../types';

interface DeskContextType {
  desks: Desk[];
  activeSession: Session | null;
  currentUser: User;
  bookDesk: (deskId: string) => void;
  setAway: () => void;
  endSession: () => void;
  releaseDesk: (deskId: string) => void; // For librarian
}

// Mock Data
const MOCK_USER: User = {
  id: 'u1',
  name: 'Sarah',
  email: 'sarah@university.edu',
  initials: 'SK',
};

// Isometric coordinates mock generator
const generateMockDesks = (): Desk[] => {
  const desks: Desk[] = [];
  const floors = [1, 2, 3];
  
  floors.forEach(floor => {
    for (let i = 1; i <= 20; i++) {
      let status: Desk['status'] = 'available';
      if (Math.random() > 0.8) status = 'occupied';
      else if (Math.random() > 0.9) status = 'away';
      else if (Math.random() > 0.95) status = 'flagged';
      
      desks.push({
        id: `F${floor}-D${i}`,
        zone: i <= 10 ? 'Tables' : i <= 15 ? 'Open Area' : 'Window Seat',
        floor,
        status,
        x: (i % 5) * 40,
        y: Math.floor(i / 5) * 40,
      });
    }
  });
  return desks;
};

const DeskContext = createContext<DeskContextType | undefined>(undefined);

export const DeskProvider = ({ children }: { children: ReactNode }) => {
  const [desks, setDesks] = useState<Desk[]>(generateMockDesks());
  const [currentUser] = useState<User>(MOCK_USER);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const bookDesk = (deskId: string) => {
    setDesks(prev => prev.map(d => d.id === deskId ? { ...d, status: 'occupied' } : d));
    
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    
    setActiveSession({
      id: `s_${Date.now()}`,
      deskId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentInitials: currentUser.initials,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: 'active',
    });
  };

  const setAway = () => {
    if (!activeSession) return;
    
    setDesks(prev => prev.map(d => d.id === activeSession.deskId ? { ...d, status: 'away' } : d));
    
    const awayEndTime = new Date(Date.now() + 20 * 60 * 1000); // 20 mins
    setActiveSession(prev => prev ? { ...prev, status: 'away', awayEndTime: awayEndTime.toISOString() } : null);
  };

  const endSession = () => {
    if (!activeSession) return;
    
    setDesks(prev => prev.map(d => d.id === activeSession.deskId ? { ...d, status: 'available' } : d));
    setActiveSession(null);
  };

  const releaseDesk = (deskId: string) => {
    setDesks(prev => prev.map(d => d.id === deskId ? { ...d, status: 'available' } : d));
  };

  return (
    <DeskContext.Provider value={{ desks, activeSession, currentUser, bookDesk, setAway, endSession, releaseDesk }}>
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
