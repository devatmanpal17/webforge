"use client";

import { useDeskContext } from '@/context/DeskContext';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

function SliderToConfirm({ onConfirm }: { onConfirm: () => void }) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const thumbWidth = 40;

  const handleStart = (clientX: number) => {
    isDragging.current = true;
    startX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !containerRef.current) return;
    const maxTravel = containerRef.current.offsetWidth - thumbWidth - 8;
    const deltaX = clientX - startX.current;
    
    let newProgress = Math.max(0, Math.min(deltaX / maxTravel, 1));
    setProgress(newProgress);

    if (newProgress > 0.95) {
      isDragging.current = false;
      setProgress(1);
      onConfirm();
    }
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (progress < 0.95) {
      setProgress(0);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onMouseUp = () => handleEnd();
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [progress]);
  
  return (
    <div ref={containerRef} className="relative w-full h-12 bg-[#f0f2f4] rounded-full overflow-hidden select-none touch-none">
      <div 
        className="absolute left-0 top-0 h-full bg-[#1C2D42] opacity-10 rounded-full pointer-events-none" 
        style={{ width: `calc(${progress * 100}% + ${thumbWidth}px)` }} 
      />
      <div 
        className="absolute w-full h-full flex items-center justify-center text-[#2B2D2F] font-bold text-[15px] pointer-events-none"
        style={{ opacity: 1 - progress * 1.5 }}
      >
        Release Seat
      </div>
      <div 
        className={`absolute left-1 top-1 w-10 h-10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing text-white transition-colors duration-200 z-10 ${progress > 0.8 ? 'bg-[#1C2D42]' : 'bg-[#8FA396]'}`}
        style={{ transform: `translateX(calc(${progress} * (100% - ${thumbWidth + 8}px)))` }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        <span className="material-symbols-outlined text-lg">{progress > 0.8 ? 'check' : 'chevron_right'}</span>
      </div>
    </div>
  );
}

export default function LibrarianPage() {
  const { desks, releaseDesk, logout } = useDeskContext();
  const router = useRouter();

  const activeDesksCount = desks.filter(d => d.status === 'occupied').length;
  const awayDesksCount = desks.filter(d => d.status === 'away').length;
  
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      // In a real implementation this would verify a token, we just hit the new endpoint
      const res = await fetch('/api/admin/sessions');
      const data = await res.json();
      setLiveSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRelease = async (deskId: string) => {
    await releaseDesk(deskId);
    fetchSessions(); // Refresh after release
  };

  const flaggedDesks = liveSessions.filter(s => s.status === 'flagged');

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2B2D2F] font-sans pb-20 overflow-x-hidden">
      <main className="max-w-[1200px] mx-auto px-8 md:px-20 lg:px-40 pt-8">
        {/* Floor Header & Metrics */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl font-semibold text-[#1C2D42] mb-6">Floor 1 Overview</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 rounded-[24px] p-6 bg-white shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent hover:border-[#6B8E7B]/20 transition-colors">
              <p className="text-[#8FA396] text-sm font-medium leading-normal">Capacity</p>
              <p className="text-[#1C2D42] font-serif text-3xl font-semibold">{(activeDesksCount/Math.max(desks.length,1) * 100).toFixed(0)}%</p>
            </div>
            <div className="flex flex-col gap-2 rounded-[24px] p-6 bg-white shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent hover:border-[#6B8E7B]/20 transition-colors">
              <p className="text-[#8FA396] text-sm font-medium leading-normal">Active</p>
              <p className="text-[#6B8E7B] font-serif text-3xl font-semibold">{activeDesksCount}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-[24px] p-6 bg-white shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent hover:border-[#D69F4C]/20 transition-colors">
              <p className="text-[#8FA396] text-sm font-medium leading-normal">Away</p>
              <p className="text-[#D69F4C] font-serif text-3xl font-semibold">{awayDesksCount}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-[24px] p-6 bg-white shadow-[0_12px_24px_rgba(28,45,66,0.08)] border-2 border-[#D69F4C]/30 bg-[#D69F4C]/5">
              <p className="text-[#2B2D2F] text-sm font-medium leading-normal flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D69F4C] text-sm">warning</span>
                Flagged
              </p>
              <p className="text-[#D69F4C] font-serif text-3xl font-semibold">{flaggedDesks.length}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-[#1C2D42]">Live Seat Activity</h2>
          <div className="flex items-center gap-2 text-sm text-[#8FA396]">
            <span className="material-symbols-outlined text-lg">sync</span>
            <button onClick={fetchSessions} className="hover:text-[#1C2D42] transition-colors">Refresh</button>
          </div>
        </div>

        {/* Masonry Grid for Live Seats */}
        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[#D69F4C]/30 border-t-[#D69F4C] rounded-full animate-spin" /></div>
        ) : liveSessions.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {liveSessions.map(session => {
              const isFlagged = session.status === 'flagged';
              const isAway = session.status === 'away';
              
              const accentColor = isFlagged ? '#D69F4C' : isAway ? '#D69F4C' : '#6B8E7B';
              const badgeBg = isFlagged ? 'bg-[#D69F4C]/10' : isAway ? 'bg-[#D69F4C]/10' : 'bg-[#6B8E7B]/10';
              const badgeText = isFlagged ? 'text-[#D69F4C]' : isAway ? 'text-[#D69F4C]' : 'text-[#6B8E7B]';
              const icon = isFlagged ? 'warning' : isAway ? 'timer' : 'check_circle';
              const statusText = isFlagged ? 'Flagged' : isAway ? 'Away' : 'Active';

              // Format time simply
              const startDate = new Date(session.start_time);
              const timeString = startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

              return (
                <div key={session.id} className="break-inside-avoid bg-white rounded-[24px] shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent relative overflow-hidden transition-all duration-300">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: accentColor }}></div>
                  <div className="p-6 pl-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${badgeBg} ${badgeText}`}>
                          <span className="material-symbols-outlined text-[14px]">{icon}</span>
                          {statusText}
                        </span>
                        <h3 className="font-serif text-xl text-[#1C2D42] font-semibold">
                          Desk {session.desk_id.replace('f1-','').replace('f2-','').replace('f3-','')}
                        </h3>
                        <p className="text-sm text-[#8FA396]">{session.desk_zone}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-[#F9F8F6] flex items-center justify-center text-[#1C2D42] font-bold shadow-sm border border-black/5">
                        {session.user_initials}
                      </div>
                    </div>
                    <div className="mb-6 border-t border-black/5 pt-4">
                      <p className="text-sm text-[#2B2D2F] font-medium">{session.user_name}</p>
                      <p className="text-xs text-[#8FA396]">Started at {timeString}</p>
                    </div>
                    
                    <SliderToConfirm onConfirm={() => handleRelease(session.desk_id)} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="w-64 h-64 mb-6 rounded-full bg-white shadow-[0_12px_24px_rgba(28,45,66,0.08)] flex items-center justify-center border-4 border-[#6B8E7B]/10">
              <span className="material-symbols-outlined text-[80px] text-[#6B8E7B] opacity-80">desk</span>
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#1C2D42] mb-2">All clear</h3>
            <p className="text-[#8FA396] max-w-md">No flagged seats on Floor 1. The library space is being utilized perfectly.</p>
          </div>
        )}
      </main>
    </div>
  );
}
