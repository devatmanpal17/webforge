"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useDeskContext } from '@/context/DeskContext';
import DeskMap from '@/components/DeskMap';
import { Desk } from '@/types';
import { Search, X, MapPin, CheckCircle2, ChevronRight, Clock, AlertTriangle, Menu } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FloorMapPageWrapper() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading map...</div></div>}>
      <FloorMapPage />
    </Suspense>
  );
}

function FloorMapPage() {
  const { desks, bookDesk, activeSession } = useDeskContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFloor = searchParams.get('floor') ? parseInt(searchParams.get('floor')!, 10) : 3;
  const [currentFloor, setCurrentFloor] = useState<number>(initialFloor);
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync floor from URL on mount
  useEffect(() => {
    const floorParam = searchParams.get('floor');
    if (floorParam) {
      setCurrentFloor(parseInt(floorParam, 10));
    }
  }, [searchParams]);

  const zones = ['Tables', 'Open Area', 'Window Seat'];

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

  const handleDeskClick = (desk: Desk) => {
    setSelectedDesk(desk);
    // On mobile, ensure sidebar closes when drawer opens
    setSidebarOpen(false);
  };

  // Compute how long a desk has been occupied
  const getOccupiedDuration = () => {
    // Mock — in a real app we'd pull from the session data
    const mins = Math.floor(Math.random() * 90) + 10;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
      {/* Floor Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-desk-charcoal">Find a Seat</h1>
            </div>
            <div className="flex space-x-2">
              {floorStats.map(fs => (
                <button
                  key={fs.floor}
                  onClick={() => { setCurrentFloor(fs.floor); setSelectedDesk(null); }}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                    currentFloor === fs.floor
                      ? 'bg-desk-charcoal text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">Floor</span> {fs.floor}
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

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex flex-col md:flex-row gap-4 sm:gap-6 overflow-hidden relative">

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <div className={`
          fixed md:relative top-0 left-0 h-full md:h-auto z-40 md:z-auto
          w-72 md:w-64 bg-white md:bg-transparent
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col gap-5 flex-shrink-0 p-4 md:p-0 overflow-y-auto
        `}>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden self-end p-1 text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>

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
                          ? 'text-gray-300'
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
                <div className="w-3 h-3 rounded bg-desk-green mr-2.5" />
                Available
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 rounded bg-desk-red mr-2.5" />
                Occupied
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 rounded bg-desk-away mr-2.5" />
                Away
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 rounded bg-desk-amber mr-2.5" />
                Flagged
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative bg-white rounded-[12px] border border-gray-200 shadow-sm overflow-hidden min-h-0">
          <DeskMap
            desks={desks}
            floor={currentFloor}
            onDeskClick={handleDeskClick}
            selectedDeskId={selectedDesk?.id}
            filterZone={filterZone}
            searchHighlight={searchQuery || undefined}
          />
        </div>

        {/* Right Drawer — Desk Detail */}
        {selectedDesk && (
          <div className={`
            fixed md:relative top-0 right-0 h-full md:h-auto z-40 md:z-auto
            w-80 transition-all duration-300 ease-in-out
          `}>
            {/* Mobile backdrop */}
            <div
              className="fixed inset-0 bg-black/20 z-[-1] md:hidden"
              onClick={() => setSelectedDesk(null)}
            />
            <div className="w-80 h-full md:h-auto bg-white rounded-none md:rounded-[12px] border-l md:border border-gray-200 shadow-xl md:shadow-sm flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    {selectedDesk.status === 'available' ? (
                      <div className="flex items-center text-desk-green text-xs font-semibold mb-2 gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Available now
                      </div>
                    ) : selectedDesk.status === 'occupied' ? (
                      <div className="flex items-center text-desk-red text-xs font-semibold mb-2 gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Currently occupied
                      </div>
                    ) : selectedDesk.status === 'away' ? (
                      <div className="flex items-center text-desk-away text-xs font-semibold mb-2 gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Student is away
                      </div>
                    ) : (
                      <div className="flex items-center text-desk-amber text-xs font-semibold mb-2 gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Flagged — possibly abandoned
                      </div>
                    )}
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

                <div className="bg-desk-bg rounded-lg p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium capitalize ${
                      selectedDesk.status === 'available' ? 'text-desk-green' :
                      selectedDesk.status === 'occupied' ? 'text-desk-red' :
                      selectedDesk.status === 'away' ? 'text-desk-away' :
                      'text-desk-amber'
                    }`}>{selectedDesk.status}</span>
                  </div>
                  {selectedDesk.status !== 'available' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Occupied for</span>
                      <span className="font-medium text-desk-charcoal">{getOccupiedDuration()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Session length</span>
                    <span className="font-medium text-desk-charcoal">2 hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Away limit</span>
                    <span className="font-medium text-desk-charcoal">20 min</span>
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
                ) : selectedDesk.status === 'available' ? (
                  <button
                    onClick={handleBook}
                    className="w-full py-3 bg-desk-amber hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    Book This Seat
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-200 text-gray-400 font-medium rounded-lg cursor-not-allowed text-sm"
                  >
                    Currently {selectedDesk.status}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
