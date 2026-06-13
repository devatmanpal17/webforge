"use client";

import { useDeskContext } from '@/context/DeskContext';
import Link from 'next/link';
import { Clock, MapPin, Search, ArrowRight } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

function SessionTimerDisplay({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

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
  }, [endTime]);

  return <div className="text-3xl font-serif font-semibold tracking-tight text-[#1C2D42]">{timeLeft}</div>;
}

export default function StudentDashboard() {
  const { currentUser, activeSession, setAway, endSession, desks, loading } = useDeskContext();

  // Compute per-floor availability
  const floorStats = useMemo(() => {
    return [1, 2, 3].map(floor => {
      const floorDesks = desks.filter(d => d.floor === floor);
      const available = floorDesks.filter(d => d.status === 'available').length;
      const total = floorDesks.length;
      return { floor, available, total, pctFree: total > 0 ? (available / total) * 100 : 0 };
    });
  }, [desks]);

  const quietestFloor = useMemo(() => {
    if (floorStats.length === 0) return { floor: 1, available: 0, total: 0, pctFree: 0 };
    return floorStats.reduce((best, curr) => curr.available > best.available ? curr : best, floorStats[0]);
  }, [floorStats]);

  const totalAvailable = floorStats.reduce((sum, fs) => sum + fs.available, 0);
  const totalDesks = floorStats.reduce((sum, fs) => sum + fs.total, 0);

  // Find active desk info
  const activeDesk = activeSession ? desks.find(d => d.id === activeSession.deskId) : null;

  // Determine time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] text-[#2B2D2F] font-sans pb-20">
        <main className="max-w-[1200px] mx-auto px-8 md:px-20 lg:px-40 pt-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-white rounded w-72 shadow-sm" />
            <div className="h-24 bg-white rounded-[24px] shadow-sm" />
            <div className="h-48 bg-white rounded-[24px] shadow-sm" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2B2D2F] font-sans pb-20 overflow-x-hidden">
      <main className="max-w-[1200px] mx-auto px-8 md:px-20 lg:px-40 pt-8">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl font-semibold text-[#1C2D42] mb-2">
            {greeting}, {currentUser?.name || 'Student'}.
          </h1>
          <p className="text-[#8FA396] text-sm font-medium">
            {totalAvailable} of {totalDesks} seats available right now
          </p>
        </div>

        {/* Metrics Cards — matches staff dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {floorStats.map(fs => (
            <div key={fs.floor} className="flex flex-col gap-2 rounded-[24px] p-6 bg-white shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent hover:border-[#6B8E7B]/20 transition-colors">
              <p className="text-[#8FA396] text-sm font-medium leading-normal">Floor {fs.floor}</p>
              <p className="text-[#6B8E7B] font-serif text-3xl font-semibold">{fs.available}</p>
              <p className="text-[#8FA396] text-xs">{fs.total} total seats</p>
            </div>
          ))}
          <div className="flex flex-col gap-2 rounded-[24px] p-6 bg-white shadow-[0_12px_24px_rgba(28,45,66,0.08)] border-2 border-[#D69F4C]/30 bg-[#D69F4C]/5">
            <p className="text-[#2B2D2F] text-sm font-medium leading-normal flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D69F4C] text-sm">emoji_objects</span>
              Best Floor
            </p>
            <p className="text-[#D69F4C] font-serif text-3xl font-semibold">F{quietestFloor.floor}</p>
            <p className="text-[#8FA396] text-xs">{quietestFloor.available} available</p>
          </div>
        </div>

        {/* Current Session or Book CTA */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-[#1C2D42]">
            {activeSession ? 'Your Active Session' : 'Book a Seat'}
          </h2>
        </div>

        {activeSession && activeDesk ? (
          <div className="bg-white rounded-[24px] shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent relative overflow-hidden mb-10">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#6B8E7B]"></div>
            <div className="p-6 pl-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B8E7B] bg-[#6B8E7B]/10 px-2.5 py-1 rounded-full mb-3">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      {activeSession.status === 'away' ? 'Away' : 'Active'}
                    </span>
                    <h3 className="font-serif text-xl text-[#1C2D42] font-semibold">Desk {activeSession.deskId.split('-')[1]}</h3>
                    <p className="text-sm text-[#8FA396]">Floor {activeDesk.floor} · {activeDesk.zone}</p>
                  </div>

                  <div className="bg-[#F9F8F6] rounded-lg px-5 py-3 inline-block">
                    <SessionTimerDisplay
                      endTime={activeSession.status === 'away' && activeSession.awayEndTime ? activeSession.awayEndTime : activeSession.endTime}
                    />
                    <p className="text-xs text-[#8FA396] mt-1">
                      {activeSession.status === 'away' ? 'Return time remaining' : 'Session time remaining'}
                    </p>
                  </div>

                  {activeSession.status === 'away' && (
                    <div className="flex items-center gap-2 text-[#D69F4C] text-sm font-medium">
                      <div className="h-2 w-2 rounded-full bg-[#D69F4C] animate-pulse" />
                      You&apos;re marked as away
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-48">
                  {activeSession.status === 'active' && (
                    <button
                      onClick={setAway}
                      className="w-full py-2.5 bg-[#D69F4C] hover:bg-[#c4902e] text-white font-bold rounded-full transition-colors shadow-sm"
                    >
                      Step Away (20m)
                    </button>
                  )}
                  <button
                    onClick={endSession}
                    className="w-full py-2.5 bg-transparent border-2 border-[#1C2D42] text-[#1C2D42] font-bold rounded-full hover:bg-[#1C2D42]/5 transition-colors"
                  >
                    End Session
                  </button>
                  <Link
                    href="/session"
                    className="w-full py-2 text-center text-sm text-[#D69F4C] font-medium hover:underline flex items-center justify-center gap-1"
                  >
                    View full screen
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-6 space-y-6 mb-10">
            {/* Book a seat CTA card */}
            <div className="break-inside-avoid bg-white rounded-[24px] shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D69F4C]"></div>
              <div className="p-8 pl-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#F9F8F6] flex items-center justify-center mb-6">
                  <Search className="h-8 w-8 text-[#D69F4C]" />
                </div>
                <h3 className="font-serif text-xl text-[#1C2D42] font-semibold mb-2">Ready to study?</h3>
                <p className="text-[#8FA396] mb-6 text-sm max-w-md">
                  Browse the library floor map, pick an available desk, and start your session.
                </p>
                <Link
                  href="/map"
                  className="px-8 py-3 bg-[#1C2D42] hover:bg-[#1C2D42]/90 text-white font-bold rounded-full shadow-sm transition-colors flex items-center gap-2"
                >
                  <MapPin className="h-5 w-5" />
                  Find a Seat
                </Link>
              </div>
            </div>

            {/* Quick floor pick card */}
            <div className="break-inside-avoid bg-white rounded-[24px] shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent relative overflow-hidden">
              <div className="p-6">
                <h3 className="font-serif text-lg text-[#1C2D42] font-semibold mb-4">Quick Floor Pick</h3>
                <div className="space-y-3">
                  {floorStats.map(fs => (
                    <Link
                      key={fs.floor}
                      href={`/map?floor=${fs.floor}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F9F8F6] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#F9F8F6] flex items-center justify-center font-serif font-bold text-[#1C2D42]">
                          {fs.floor}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1C2D42]">Floor {fs.floor}</p>
                          <p className="text-xs text-[#8FA396]">{fs.available} of {fs.total} available</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-[#F0F2F4] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#6B8E7B] rounded-full transition-all duration-500"
                            style={{ width: `${fs.pctFree}%` }}
                          />
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#8FA396] group-hover:text-[#1C2D42] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Library Guidelines */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-[#1C2D42]">Library Guidelines</h2>
        </div>
        <div className="columns-1 md:columns-3 gap-6 space-y-6">
          <div className="break-inside-avoid bg-white rounded-[24px] shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent p-6">
            <div className="h-10 w-10 rounded-full bg-[#D69F4C]/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#D69F4C]">timer</span>
            </div>
            <h4 className="font-serif text-lg font-semibold text-[#1C2D42] mb-2">2-Hour Sessions</h4>
            <p className="text-sm text-[#8FA396]">Each study session lasts for a maximum of 2 hours. You&apos;ll be prompted to confirm your presence before it expires.</p>
          </div>
          <div className="break-inside-avoid bg-white rounded-[24px] shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent p-6">
            <div className="h-10 w-10 rounded-full bg-[#6B8E7B]/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#6B8E7B]">coffee</span>
            </div>
            <h4 className="font-serif text-lg font-semibold text-[#1C2D42] mb-2">20-Min Breaks</h4>
            <p className="text-sm text-[#8FA396]">Step away for up to 20 minutes without losing your seat. Exceeding this time may result in your seat being released.</p>
          </div>
          <div className="break-inside-avoid bg-white rounded-[24px] shadow-[0_12px_24px_rgba(28,45,66,0.08)] border border-transparent p-6">
            <div className="h-10 w-10 rounded-full bg-[#1C2D42]/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#1C2D42]">verified</span>
            </div>
            <h4 className="font-serif text-lg font-semibold text-[#1C2D42] mb-2">Confirm Presence</h4>
            <p className="text-sm text-[#8FA396]">When prompted, confirm you&apos;re still at your desk. Unconfirmed sessions are automatically released.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
