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
  const { currentUser, activeSession, setAway, endSession, desks } = useDeskContext();

  // Compute per-floor availability
  const floorStats = useMemo(() => {
    return [1, 2, 3].map(floor => {
      const floorDesks = desks.filter(d => d.floor === floor);
      const available = floorDesks.filter(d => d.status === 'available').length;
      const total = floorDesks.length;
      return { floor, available, total, occupancy: total > 0 ? ((total - available) / total) * 100 : 0 };
    });
  }, [desks]);

  const quietestFloor = useMemo(() => {
    return floorStats.reduce((best, curr) => curr.available > best.available ? curr : best, floorStats[0]);
  }, [floorStats]);

  const totalAvailable = floorStats.reduce((sum, fs) => sum + fs.available, 0);
  const totalDesks = floorStats.reduce((sum, fs) => sum + fs.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold text-desk-charcoal mb-4">
        Good morning, {currentUser.name}.
      </h1>

      {/* ── "Currently Busy" Banner ── */}
      <Link
        href="/map"
        className="block mb-8 bg-white rounded-[12px] border border-gray-200 p-4 hover:border-desk-amber/40 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-desk-green animate-pulse" />
              <span className="text-sm font-medium text-desk-charcoal">
                {totalAvailable} of {totalDesks} seats available right now
              </span>
            </div>

            {/* Mini heatmap bars — one per floor */}
            <div className="flex items-end gap-3">
              {floorStats.map(fs => (
                <div key={fs.floor} className="flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">F{fs.floor}</span>
                    <span className="text-[10px] text-gray-400">{fs.available} free</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${fs.total > 0 ? (fs.available / fs.total) * 100 : 0}%`,
                        backgroundColor: fs.floor === quietestFloor.floor ? '#5DCAA5' : '#D1D5DB',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ml-6 flex items-center gap-2 text-desk-amber group-hover:gap-3 transition-all">
            <span className="text-sm font-medium hidden sm:block whitespace-nowrap">
              Floor {quietestFloor.floor} is quietest
            </span>
            <ArrowRight className="h-4 w-4 flex-shrink-0" />
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Sessions */}
        <div className="md:col-span-2 space-y-6">
          {activeSession ? (
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-center shadow-sm">
              <div className="space-y-4 text-center sm:text-left mb-6 sm:mb-0">
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Current Session</h2>
                  <div className="mt-1 flex items-center justify-center sm:justify-start gap-2">
                    <MapPin className="h-5 w-5 text-desk-amber" />
                    <span className="text-xl font-bold text-desk-charcoal">Desk {activeSession.deskId}</span>
                  </div>
                </div>

                <div className="bg-desk-bg rounded-lg px-4 py-3 inline-block">
                  <SessionTimerDisplay endTime={activeSession.status === 'away' && activeSession.awayEndTime ? activeSession.awayEndTime : activeSession.endTime} />
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {activeSession.status === 'away' ? 'Return Time Remaining' : 'Session Time Remaining'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full sm:w-48">
                {activeSession.status === 'active' && (
                  <button
                    onClick={setAway}
                    className="w-full py-2.5 bg-desk-amber hover:bg-amber-500 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Away (20m)
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
                  className="w-full py-2 text-center text-sm text-desk-amber font-medium hover:underline"
                >
                  View full screen
                </Link>
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

        {/* Right Column - Quick Stats / Info */}
        <div className="space-y-6">
          <div className="bg-desk-charcoal text-white rounded-[12px] p-6 shadow-sm">
            <h3 className="font-bold mb-2">Library Guidelines</h3>
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
