"use client";

import { useDeskContext } from '@/context/DeskContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

export default function ActiveSessionPage() {
  const { activeSession, desks, setAway, returnFromAway, endSession } = useDeskContext();
  const router = useRouter();
  
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(100);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!activeSession) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = activeSession.status === 'away' && activeSession.awayEndTime 
        ? new Date(activeSession.awayEndTime).getTime()
        : new Date(activeSession.endTime).getTime();
        
      const start = new Date(activeSession.startTime).getTime();
      
      const diff = end - now;
      const total = activeSession.status === 'away' 
        ? 20 * 60 * 1000 // 20 mins total for away
        : 2 * 60 * 60 * 1000; // 2 hours total for session
        
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setProgress(0);
        return;
      }

      const p = (diff / total) * 100;
      setProgress(p);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <MapPin className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-desk-charcoal mb-2">No Active Session</h2>
        <p className="text-gray-500 max-w-md mb-8">
          You don't currently have a desk booked. Browse the floor map to find an available seat and start a new study session.
        </p>
        <button 
          onClick={() => router.push('/map')}
          className="px-8 py-3 bg-desk-amber hover:bg-amber-500 text-white font-medium rounded-full shadow-sm transition-colors min-w-[140px]"
        >
          Book a Desk
        </button>
      </div>
    );
  }

  const activeDesk = desks.find(d => d.id === activeSession.deskId);
  const circleCircumference = 2 * Math.PI * 120; // r=120
  const strokeDashoffset = circleCircumference - (progress / 100) * circleCircumference;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
      <div className="text-center max-w-md w-full">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-12">
          {activeSession.status === 'away' ? 'AWAY FROM DESK' : 'REMAINING IN SESSION'}
        </h2>

        {/* Circular Timer */}
        <div className="relative w-72 h-72 mx-auto mb-12 flex items-center justify-center">
          {/* Background Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="144"
              cy="144"
              r="120"
              stroke="#F3F4F6"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Ring */}
            <circle
              cx="144"
              cy="144"
              r="120"
              stroke={activeSession.status === 'away' ? '#EF9F27' : '#2C2C2A'}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="text-5xl font-bold font-mono tracking-tighter text-desk-charcoal z-10">
            {timeLeft}
          </div>
        </div>

        {/* Desk Info */}
        <div className="flex items-center justify-center gap-2 text-desk-charcoal mb-10">
          <MapPin className="h-4 w-4" />
          <span className="font-medium">Desk {activeSession.deskId.split('-')[1]}</span>
          <span className="text-gray-300 mx-2">•</span>
          <span className="text-gray-500">Floor {activeDesk?.floor}</span>
          <span className="text-gray-300 mx-2">•</span>
          <span className="text-gray-500">{activeDesk?.zone}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {activeSession.status === 'active' && (
            <button 
              onClick={setAway}
              className="px-8 py-3 bg-desk-amber hover:bg-amber-500 text-white font-medium rounded-full shadow-sm transition-colors min-w-[140px]"
            >
              Step Away
            </button>
          )}
          {activeSession.status === 'away' && (
            <button 
              onClick={returnFromAway}
              className="px-8 py-3 bg-desk-amber hover:bg-amber-500 text-white font-medium rounded-full shadow-sm transition-colors min-w-[140px]"
            >
              I'm Back
            </button>
          )}
          <button 
            onClick={endSession}
            className="px-8 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-desk-charcoal font-medium rounded-full transition-colors min-w-[140px]"
          >
            End Session
          </button>
        </div>

        {/* Demo trigger for "Still here?" prompt */}
        <div className="mt-16">
          <button 
            onClick={() => setShowPrompt(true)}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            [Demo] Simulate 2-hour prompt
          </button>
        </div>
      </div>

      {/* "Still here?" Modal Overlay */}
      {showPrompt && (
        <div className="fixed inset-0 bg-desk-charcoal/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] p-8 max-w-sm w-full text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-desk-charcoal mb-2">Still here?</h3>
            <p className="text-gray-500 mb-8">
              Your 2-hour session is ending. Please confirm you're still using this desk.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => setShowPrompt(false)}
                className="w-full py-3 bg-desk-amber hover:bg-amber-500 text-white font-medium rounded-xl transition-colors"
              >
                Yes, I'm still here
              </button>
              <button 
                onClick={() => { setShowPrompt(false); endSession(); }}
                className="w-full py-3 bg-white border-2 border-gray-200 text-desk-charcoal font-medium rounded-xl transition-colors"
              >
                End Session
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-6">
              Auto-releasing in 04:59...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
