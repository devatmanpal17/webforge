export type DeskStatus = 'available' | 'occupied' | 'away' | 'abandoned' | 'flagged';

export interface Desk {
  id: string;
  zone: string;
  floor: number;
  status: DeskStatus;
  x: number;
  y: number;
}

export interface Session {
  id: string;
  deskId: string;
  studentId: string;
  studentName: string;
  studentInitials: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  awayEndTime?: string; // ISO string if away
  status: 'active' | 'away' | 'ended' | 'flagged';
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
}
