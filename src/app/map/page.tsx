"use client";

import { useState } from 'react';
import { useDeskContext } from '@/context/DeskContext';
import DeskMap from '@/components/DeskMap';
import { Desk } from '@/types';
import { Search, X, MapPin, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FloorMapPage() {
  const { desks, bookDesk, activeSession } = useDeskContext();
  const router = useRouter();
  
  const [currentFloor, setCurrentFloor] = useState<number>(3);
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);

  const zones = ['Tables', 'Open Area', 'Window Seat'];

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
              {[1, 2, 3].map(floor => (
                <button
                  key={floor}
                  onClick={() => { setCurrentFloor(floor); setSelectedDesk(null); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    currentFloor === floor 
                      ? 'bg-desk-charcoal text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Floor {floor}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-6 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search desk ID..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-[12px] text-sm focus:outline-none focus:border-desk-amber focus:ring-1 focus:ring-desk-amber"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-desk-charcoal mb-3 uppercase tracking-wider">Zones</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setFilterZone(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${!filterZone ? 'bg-desk-amber/10 text-desk-amber font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                All Zones
              </button>
              {zones.map(zone => (
                <button
                  key={zone}
                  onClick={() => setFilterZone(zone)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterZone === zone ? 'bg-desk-amber/10 text-desk-amber font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-desk-charcoal mb-3 uppercase tracking-wider">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 rounded-full bg-desk-green mr-2"></div>
                Available
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 rounded-full bg-desk-red mr-2"></div>
                Occupied
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 rounded-full bg-desk-away mr-2"></div>
                Away
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative bg-white rounded-[12px] border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center">
          <DeskMap 
            desks={desks} 
            floor={currentFloor} 
            onDeskClick={(desk) => setSelectedDesk(desk)} 
            selectedDeskId={selectedDesk?.id}
            filterZone={filterZone}
          />
          
          {/* Selected Desk Overlay Panel */}
          {selectedDesk && (
            <div className="absolute top-4 left-4 w-72 bg-white rounded-[12px] shadow-lg border border-gray-200 overflow-hidden transform transition-all animate-in fade-in slide-in-from-left-4">
              <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center text-desk-green text-sm font-medium mb-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Available now
                  </div>
                  <h2 className="text-2xl font-bold text-desk-charcoal">Desk {selectedDesk.id.split('-')[1]}</h2>
                  <p className="text-gray-500 text-sm">Floor {selectedDesk.floor} • {selectedDesk.zone}</p>
                </div>
                <button 
                  onClick={() => setSelectedDesk(null)}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-gray-50">
                {activeSession ? (
                  <button 
                    disabled
                    className="w-full py-3 bg-gray-300 text-white font-medium rounded-lg cursor-not-allowed"
                  >
                    You already have a session
                  </button>
                ) : (
                  <button 
                    onClick={handleBook}
                    className="w-full py-3 bg-desk-amber hover:bg-amber-500 text-white font-medium rounded-lg shadow-sm transition-colors"
                  >
                    Book This Seat
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
