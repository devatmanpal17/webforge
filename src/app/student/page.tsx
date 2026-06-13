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

  return <div className="text-3xl font-mono font-bold tracking-tight text-desk-charcoal">{timeLeft}</div>;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-72" />
          <div className="h-24 bg-gray-200 rounded-[12px]" />
          <div className="h-48 bg-gray-200 rounded-[12px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold text-desk-charcoal mb-4">
        {greeting}, {currentUser.name}.
      </h1>

      {/* ── Live Availability Banner ── */}
      <Link
        href={`/map?floor=${quietestFloor.floor}`}
        className="block mb-8 bg-white rounded-[12px] border border-gray-200 p-4 hover:border-desk-amber/40 transition-all duration-200 group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-desk-green animate-pulse flex-shrink-0" />
              <span className="text-sm font-medium text-desk-charcoal">
                {totalAvailable} of {totalDesks} seats available right now
              </span>
            </div>

            {/* Floor bars — proportional fills */}
            <div className="flex items-end gap-3">
              {floorStats.map(fs => {
                const isQuietest = fs.floor === quietestFloor.floor;
                return (
                  <div key={fs.floor} className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">F{fs.floor}</span>
                      <span className="text-[10px] text-gray-400">{fs.available} free</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${fs.pctFree}%`,
                          backgroundColor: isQuietest ? '#5DCAA5' : '#5DCAA5',
                          opacity: isQuietest ? 1 : 0.35,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-desk-amber group-hover:gap-3 transition-all duration-200 flex-shrink-0">
            <span className="text-sm font-medium hidden sm:block whitespace-nowrap">
              Floor {quietestFloor.floor} is quietest
            </span>
            <ArrowRight className="h-4 w-4 flex-shrink-0" />
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Current Session Card — or empty CTA */}
          {activeSession && activeDesk ? (
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Current Session</h2>
                    <div className="mt-2 flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-desk-amber flex-shrink-0" />
                      <div>
                        <span className="text-xl font-bold text-desk-charcoal">Desk {activeSession.deskId.split('-')[1]}</span>
                        <span className="text-gray-400 mx-2">·</span>
                        <span className="text-gray-500">Floor {activeDesk.floor}</span>
                        <span className="text-gray-400 mx-2">·</span>
                        <span className="text-gray-500">{activeDesk.zone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-desk-bg rounded-lg px-5 py-3 inline-block">
                    <SessionTimerDisplay
                      endTime={activeSession.status === 'away' && activeSession.awayEndTime ? activeSession.awayEndTime : activeSession.endTime}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {activeSession.status === 'away' ? 'Return time remaining' : 'Session time remaining'}
                    </p>
                  </div>

                  {activeSession.status === 'away' && (
                    <div className="flex items-center gap-2 text-desk-away text-sm font-medium">
                      <div className="h-2 w-2 rounded-full bg-desk-away animate-pulse" />
                      You're marked as away
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-48">
                  {activeSession.status === 'active' && (
                    <button
                      onClick={setAway}
                      className="w-full py-2.5 bg-desk-amber hover:bg-amber-500 text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                      Step Away (20m)
                    </button>
                  )}
                  <button
                    onClick={endSession}
                    className="w-full py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-desk-charcoal font-medium rounded-lg transition-colors"
                  >
                    End Session
                  </button>
                  <Link
                    href="/session"
                    className="w-full py-2 text-center text-sm text-desk-amber font-medium hover:underline flex items-center justify-center gap-1"
                  >
                    View full screen
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[12px] border border-gray-200 p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="h-16 w-16 bg-desk-bg rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-desk-amber" />
              </div>
              <h2 className="text-xl font-bold text-desk-charcoal mb-2">Ready to study?</h2>
              <p className="text-gray-500 mb-6 max-w-md">
                The library is currently showing plenty of available seats. Find your focus space for the day.
              </p>
              <Link
                href="/map"
                className="px-6 py-3 bg-desk-amber hover:bg-amber-500 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                <MapPin className="h-5 w-5" />
                Book a Seat
              </Link>
            </div>
          )}

          {/* Upcoming Reservations */}
          <div>
            <h3 className="text-lg font-bold text-desk-charcoal mb-4">Upcoming Reservations</h3>
            <div className="bg-white rounded-[12px] border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
              <Clock className="h-8 w-8 text-gray-300 mb-3" />
              <p className="text-gray-500">No upcoming reservations.</p>
              <Link href="/map" className="text-desk-amber font-medium mt-1 hover:underline">
                Browse the map to schedule one.
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-desk-charcoal text-white rounded-[12px] p-6 shadow-sm">
            <h3 className="font-bold mb-3">Library Guidelines</h3>
            <ul className="text-sm space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-desk-amber mt-1.5 flex-shrink-0" />
                <p>Sessions last for 2 hours maximum.</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-desk-amber mt-1.5 flex-shrink-0" />
                <p>You can step away for up to 20 minutes without losing your seat.</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-desk-amber mt-1.5 flex-shrink-0" />
                <p>Confirm you're still present when prompted to avoid seat release.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
