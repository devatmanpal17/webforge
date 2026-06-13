"use client";

import { useState } from 'react';
import { useDeskContext } from '@/context/DeskContext';
import { AlertTriangle, User, Clock } from 'lucide-react';

export default function LibrarianDashboard() {
  const { desks, releaseDesk } = useDeskContext();
  const [currentFloor, setCurrentFloor] = useState<number>(3);

  const floorDesks = desks.filter(d => d.floor === currentFloor);
  
  const totalSeats = floorDesks.length;
  const activeCount = floorDesks.filter(d => d.status === 'occupied').length;
  const awayCount = floorDesks.filter(d => d.status === 'away').length;
  const flaggedCount = floorDesks.filter(d => d.status === 'flagged').length;
  const capacityPct = totalSeats > 0 ? Math.round(((activeCount + awayCount + flaggedCount) / totalSeats) * 100) : 0;

  const flaggedDesks = floorDesks.filter(d => d.status === 'flagged');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-desk-charcoal">Floor {currentFloor} Overview</h1>
        
        <div className="flex space-x-2">
          {[1, 2, 3].map(floor => (
            <button
              key={floor}
              onClick={() => setCurrentFloor(floor)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currentFloor === floor 
                  ? 'bg-desk-charcoal text-white' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Floor {floor}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Capacity</p>
          <p className="text-3xl font-bold text-desk-charcoal">{capacityPct}%</p>
        </div>
        <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-desk-green mb-1">Active</p>
          <p className="text-3xl font-bold text-desk-charcoal">{activeCount}</p>
        </div>
        <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-desk-away mb-1">Away</p>
          <p className="text-3xl font-bold text-desk-charcoal">{awayCount}</p>
        </div>
        <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <AlertTriangle className={`w-5 h-5 ${flaggedCount > 0 ? 'text-desk-amber' : 'text-gray-300'}`} />
          </div>
          <p className="text-sm font-medium text-desk-amber mb-1">Flagged</p>
          <p className="text-3xl font-bold text-desk-charcoal">{flaggedCount}</p>
        </div>
      </div>

      {/* Flagged Seats Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-desk-charcoal">Flagged Seats</h2>
          <span className="text-sm text-gray-500">Auto-release in longest overdue order</span>
        </div>
        
        {flaggedDesks.length === 0 ? (
          <div className="bg-white rounded-[12px] border border-gray-200 p-12 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-desk-green/10 flex items-center justify-center mb-3">
              <CheckCircleIcon className="h-6 w-6 text-desk-green" />
            </div>
            <h3 className="text-lg font-medium text-desk-charcoal mb-1">No flagged seats</h3>
            <p className="text-gray-500">All sessions on Floor {currentFloor} are currently active.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flaggedDesks.map((desk, idx) => (
              <div key={desk.id} className="bg-white rounded-[12px] border border-desk-amber/30 p-5 shadow-sm relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-desk-amber rounded-l-[12px]" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-desk-amber bg-desk-amber/10 px-2 py-1 rounded-md uppercase">
                      Overdue
                    </span>
                    <span className="text-lg font-bold text-desk-charcoal">Desk {desk.id.split('-')[1]}</span>
                  </div>
                  <span className="text-xs text-gray-500">{desk.zone}</span>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-desk-charcoal font-medium">
                    {/* Mock Initials */}
                    {['JD', 'AS', 'MC', 'TR'][idx % 4]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-desk-charcoal">
                      {['John Doe', 'Alex Smith', 'Maria Chen', 'Tom Riddle'][idx % 4]}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Occupied since 09:30 AM
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => releaseDesk(desk.id)}
                  className="w-full py-2 bg-white border border-desk-amber text-desk-amber hover:bg-desk-amber hover:text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Release Seat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple internal icon since we didn't import CheckCircle
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
