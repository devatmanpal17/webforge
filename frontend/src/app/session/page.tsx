"use client";

import { useDeskContext } from '@/context/DeskContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ActiveSessionPage() {
  const { activeSession, desks, setAway, returnFromAway, endSession } = useDeskContext();
  const router = useRouter();
  
  const [timeLeft, setTimeLeft] = useState('00:00');
  const [timeSeconds, setTimeSeconds] = useState('00');
  const [progress, setProgress] = useState(100);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptTimeLeft, setPromptTimeLeft] = useState(300);
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    if (!showPrompt) {
      setPromptTimeLeft(300);
      return;
    }

    const interval = setInterval(() => {
      setPromptTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowPrompt(false);
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPrompt, endSession]);

  useEffect(() => {
    if (!activeSession) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = activeSession.status === 'away' && activeSession.awayEndTime 
        ? new Date(activeSession.awayEndTime).getTime()
        : new Date(activeSession.endTime).getTime();
        
      const diff = end - now;
      const total = activeSession.status === 'away' 
        ? 20 * 60 * 1000 // 20 mins total for away
        : 2 * 60 * 60 * 1000; // 2 hours total for session
        
      if (diff <= 0) {
        setTimeLeft('00:00');
        setTimeSeconds('00');
        setProgress(0);
        return;
      }

      const p = (diff / total) * 100;
      setProgress(p);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
      setTimeSeconds(seconds.toString().padStart(2, '0'));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F9F8F6] text-center min-h-screen">
        <div className="w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[40px] text-[#8FA396]">desk</span>
        </div>
        <h2 className="text-2xl font-serif text-[#1C2D42] mb-2 font-bold">No Active Session</h2>
        <p className="text-[#8FA396] max-w-md mb-8 font-sans">
          You don't currently have a desk booked. Browse the floor map to find an available seat and start a new study session.
        </p>
        <button 
          onClick={() => router.push('/map')}
          className="px-8 py-3 bg-[#1C2D42] hover:bg-[#1C2D42]/90 text-white font-bold rounded-full shadow-sm transition-colors min-w-[140px]"
        >
          Book a Desk
        </button>
      </div>
    );
  }

  const activeDesk = desks.find(d => d.id === activeSession.deskId);
  const circleCircumference = 2 * Math.PI * 140; // r=140
  const strokeDashoffset = circleCircumference - (progress / 100) * circleCircumference;

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen overflow-hidden transition-colors duration-500 font-sans ${activeSession.status === 'away' ? 'bg-[#F4F1EC]' : 'bg-[#F9F8F6]'}`}>
      
      {/* Header / Back Button */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-start z-10 transition-opacity duration-300">
        <button 
          onClick={() => router.push('/student/account')}
          className="flex items-center gap-2 text-[#1C2D42] hover:opacity-80 transition-opacity font-medium"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
          <span>Dashboard</span>
        </button>
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg mx-auto p-6 transition-all duration-500">
        
        {/* Timer Status Label */}
        <p className={`font-medium text-lg mb-8 tracking-wide uppercase transition-colors duration-300 ${activeSession.status === 'away' ? 'text-[#D69F4C]' : 'text-[#8FA396]'}`}>
          {activeSession.status === 'away' ? 'Away from desk' : 'Remaining in session'}
        </p>

        {/* Circular Progress Indicator */}
        <div className="relative w-[300px] h-[300px] mb-8 flex items-center justify-center group">
          <svg className="absolute inset-0 w-full h-full drop-shadow-[0_12px_24px_rgba(28,45,66,0.08)]" viewBox="0 0 320 320">
            {/* Background track */}
            <circle className="opacity-50" cx="160" cy="160" fill="none" r="140" stroke="#Eef2ef" strokeWidth="12"></circle>
            {/* Progress track */}
            <circle 
              cx="160" 
              cy="160" 
              fill="none" 
              r="140" 
              stroke={activeSession.status === 'away' ? '#D69F4C' : '#1C2D42'} 
              strokeDasharray={circleCircumference} 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round" 
              strokeWidth="12"
              className="transition-all duration-1000 ease-linear origin-center -rotate-90"
            ></circle>
          </svg>
          {/* Time Display */}
          <div className="relative z-10 flex flex-col items-center">
            <span className={`font-serif font-semibold text-6xl tabular-nums tracking-tight transition-colors duration-300 ${activeSession.status === 'away' ? 'text-[#D69F4C]' : 'text-[#1C2D42]'}`}>
              {timeLeft}
            </span>
            <span className={`font-serif font-normal text-2xl mt-1 tabular-nums transition-opacity duration-300 ${activeSession.status === 'away' ? 'opacity-0' : 'text-[#8FA396] opacity-100'}`}>
              {timeSeconds}
            </span>
          </div>
        </div>

        {/* Seat Metadata */}
        <div className="bg-white px-6 py-3 rounded-full shadow-[0_12px_24px_rgba(28,45,66,0.08)] mb-12 border border-[#Eef2ef]">
          <p className="text-[#2B2D2F] font-medium text-sm">
            Desk {activeSession.deskId.replace('d', '')} &nbsp;&bull;&nbsp; {activeDesk?.zone} &nbsp;&bull;&nbsp; Floor {activeDesk?.floor}
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
          {activeSession.status === 'active' && (
            <button 
              onClick={setAway}
              className="flex-1 min-w-[140px] h-14 bg-[#D69F4C] text-white font-bold text-[15px] rounded-full shadow-[0_12px_24px_rgba(28,45,66,0.08)] hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">coffee</span>
              <span>Step Away</span>
            </button>
          )}
          {activeSession.status === 'away' && (
            <button 
              onClick={returnFromAway}
              className="flex-1 min-w-[140px] h-14 bg-[#1C2D42] text-white font-bold text-[15px] rounded-full shadow-[0_12px_24px_rgba(28,45,66,0.08)] hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">waving_hand</span>
              <span>I'm Back</span>
            </button>
          )}
          <button 
            onClick={() => setShowEndModal(true)}
            className="flex-1 min-w-[140px] h-14 bg-transparent text-[#1C2D42] border-2 border-[#1C2D42] font-bold text-[15px] rounded-full hover:bg-[#1C2D42]/5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>End Session</span>
          </button>
        </div>

        {/* Demo trigger for "Still here?" prompt */}
        <div className="mt-16">
          <button 
            onClick={() => setShowPrompt(true)}
            className="text-xs text-[#8FA396] hover:text-[#2B2D2F] underline"
          >
            [Demo] Simulate 2-hour prompt
          </button>
        </div>
      </main>

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2B2D2F]/20 backdrop-blur-sm" onClick={() => setShowEndModal(false)}></div>
          <div className="relative bg-white rounded-[24px] p-8 w-full max-w-sm shadow-[0_12px_24px_rgba(28,45,66,0.08)] transform scale-100 transition-transform duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#1C2D42]/10 flex items-center justify-center mb-6 text-[#1C2D42]">
                <span className="material-symbols-outlined text-3xl">logout</span>
              </div>
              <h2 className="font-serif font-semibold text-2xl text-[#1C2D42] mb-3">End Session?</h2>
              <p className="font-sans text-[#2B2D2F] mb-8 leading-relaxed">
                Are you sure you want to give up your seat? Other students will be able to book it.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={() => {
                    endSession();
                    setShowEndModal(false);
                    router.push('/student/account');
                  }}
                  className="w-full h-12 bg-[#1C2D42] text-white font-bold text-[15px] rounded-full shadow-sm hover:opacity-90 transition-opacity"
                >
                  Confirm End Session
                </button>
                <button 
                  onClick={() => setShowEndModal(false)}
                  className="w-full h-12 bg-transparent text-[#8FA396] font-bold text-[15px] rounded-full hover:bg-[#8FA396]/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Still here?" Modal Overlay */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2B2D2F]/40 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-[24px] p-8 w-full max-w-sm shadow-[0_12px_24px_rgba(28,45,66,0.08)] transform scale-100 transition-transform duration-300 text-center">
            <h3 className="font-serif font-semibold text-2xl text-[#1C2D42] mb-3">Still here?</h3>
            <p className="font-sans text-[#2B2D2F] mb-8 leading-relaxed">
              Your 2-hour session is ending. Please confirm you're still using this desk.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => setShowPrompt(false)}
                className="w-full h-12 bg-[#D69F4C] text-white font-bold text-[15px] rounded-full shadow-sm hover:opacity-90 transition-opacity"
              >
                Yes, I'm still here
              </button>
              <button 
                onClick={() => { setShowPrompt(false); endSession(); }}
                className="w-full h-12 bg-transparent border-2 border-[#1C2D42] text-[#1C2D42] font-bold text-[15px] rounded-full hover:bg-[#1C2D42]/10 transition-colors"
              >
                End Session
              </button>
            </div>
            <p className="text-xs text-[#8FA396] mt-6">
              Auto-releasing in {Math.floor(promptTimeLeft / 60).toString().padStart(2, '0')}:{(promptTimeLeft % 60).toString().padStart(2, '0')}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
