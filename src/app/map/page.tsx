"use client";

import { useState, useMemo } from 'react';
import { useDeskContext } from '@/context/DeskContext';
import DeskMap from '@/components/DeskMap';
import { Desk } from '@/types';
import { Search, X, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FloorMapPage() {
  const { desks, bookDesk, activeSession } = useDeskContext();
  const router = useRouter();

  const [currentFloor, setCurrentFloor] = useState<number>(3);
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);

  const zones = ['Tables', 'Open Area', 'Window Seat'];

  // Compute per-zone availability for current floor
  const floorDesks = useMemo(() => desks.filter(d => d.floor === currentFloor), [desks, currentFloor]);

  const zoneCounts = useMemo(() => {
    const counts: Record<string, { available: number; total: number }> = {};
    zones.forEach(zone => {
      const zoneDesks = floorDesks.filter(d => d.zone === zone);
      counts[zone] = {
        available: zoneDesks.filter(d => d.status === 'available').length,
        total: zoneDesks.length,
      };
    });
    return counts;
  }, [floorDesks]);

  const totalAvailable = floorDesks.filter(d => d.status === 'available').length;
  const totalDesks = floorDesks.length;

  // Per-floor stats for floor switcher badges
  const floorStats = useMemo(() => {
    return [1, 2, 3].map(f => {
      const fd = desks.filter(d => d.floor === f);
      return { floor: f, available: fd.filter(d => d.status === 'available').length, total: fd.length };
    });
  }, [desks]);

  const handleBook = () => {
    if (!selectedDesk || activeSession) return;
    bookDesk(selectedDesk.id);
    setSelectedDesk(null);
    router.push('/session');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
      {/* Floor Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <h1 className="text-xl font-bold text-desk-charcoal">Find a Seat</h1>
            <div className="flex space-x-2">
              {floorStats.map(fs => (
                <button
                  key={fs.floor}
                  onClick={() => { setCurrentFloor(fs.floor); setSelectedDesk(null); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentFloor === fs.floor
                      ? 'bg-desk-charcoal text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Floor {fs.floor}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    currentFloor === fs.floor
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-gray-500'
                  }`}>
                    {fs.available}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col md:flex-row gap-6 overflow-hidden">

        {/* Left Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-6 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search desk ID..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-[12px] text-sm bg-white focus:outline-none focus:border-desk-amber focus:ring-1 focus:ring-desk-amber transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Floor Summary */}
          <div className="bg-white rounded-[12px] border border-gray-200 p-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-bold text-desk-charcoal">Floor {currentFloor}</span>
              <span className="text-xs text-gray-500">{totalAvailable} of {totalDesks} free</span>
            </div>
            {/* Occupancy bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-desk-green rounded-full transition-all duration-500 ease-out"
                style={{ width: `${totalDesks > 0 ? (totalAvailable / totalDesks) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Zones with counts */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Zones</h3>
            <div className="space-y-1">
              <button
                onClick={() => setFilterZone(null)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex justify-between items-center transition-colors ${
                  !filterZone ? 'bg-desk-amber/10 text-desk-amber font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>All Zones</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  !filterZone ? 'bg-desk-amber/20 text-desk-amber' : 'bg-gray-100 text-gray-500'
                }`}>
                  {totalAvailable}
                </span>
              </button>
              {zones.map(zone => {
                const count = zoneCounts[zone];
                const isEmpty = count.available === 0;
                return (
                  <button
                    key={zone}
                    onClick={() => setFilterZone(zone === filterZone ? null : zone)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex justify-between items-center transition-colors ${
                      filterZone === zone
                        ? 'bg-desk-amber/10 text-desk-amber font-medium'
                        : isEmpty
                          ? 'text-gray-300 cursor-default'
                          : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{zone}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      filterZone === zone
                        ? 'bg-desk-amber/20 text-desk-amber'
                        : isEmpty
                          ? 'bg-gray-50 text-gray-300'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count.available}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Status</h3>
            <div className="space-y-2.5">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 rounded bg-desk-green mr-2.5"></div>
                Available
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 rounded bg-desk-red mr-2.5"></div>
                Occupied
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 rounded bg-desk-away mr-2.5"></div>
                Away
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative bg-white rounded-[12px] border border-gray-200 shadow-sm overflow-hidden">
          <DeskMap
            desks={desks}
            floor={currentFloor}
            onDeskClick={(desk) => setSelectedDesk(desk)}
            selectedDeskId={selectedDesk?.id}
            filterZone={filterZone}
          />
        </div>

        {/* Right Drawer — Desk Detail */}
        <div
          className={`fixed md:relative top-0 right-0 h-full md:h-auto z-40 md:z-auto transition-all duration-300 ease-in-out ${
            selectedDesk
              ? 'w-80 opacity-100 translate-x-0'
              : 'w-0 opacity-0 translate-x-8 pointer-events-none overflow-hidden'
          }`}
        >
          {selectedDesk && (
            <div className="w-80 h-full md:h-auto bg-white rounded-[12px] border border-gray-200 shadow-lg md:shadow-sm flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center text-desk-green text-xs font-semibold mb-2 gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Available now
                    </div>
                    <h2 className="text-2xl font-bold text-desk-charcoal">
                      Desk {selectedDesk.id.split('-')[1]}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedDesk(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-4 flex-1">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-desk-bg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-desk-amber" />
                  </div>
                  <div>
                    <p className="font-medium text-desk-charcoal">Floor {selectedDesk.floor}</p>
                    <p className="text-gray-500 text-xs">{selectedDesk.zone}</p>
                  </div>
                </div>

                <div className="bg-desk-bg rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Session length</span>
                    <span className="font-medium text-desk-charcoal">2 hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Away limit</span>
                    <span className="font-medium text-desk-charcoal">20 min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Zone</span>
                    <span className="font-medium text-desk-charcoal">{selectedDesk.zone}</span>
                  </div>
                </div>
              </div>

              {/* Book CTA */}
              <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                {activeSession ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-200 text-gray-400 font-medium rounded-lg cursor-not-allowed text-sm"
                  >
                    You already have a session
                  </button>
                ) : (
                  <button
                    onClick={handleBook}
                    className="w-full py-3 bg-desk-amber hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    Book This Seat
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
