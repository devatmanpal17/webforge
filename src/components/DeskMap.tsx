"use client";

import { Desk } from '../types';

interface DeskMapProps {
  desks: Desk[];
  floor: number;
  onDeskClick: (desk: Desk) => void;
  selectedDeskId?: string;
  filterZone: string | null;
}

export default function DeskMap({ desks, floor, onDeskClick, selectedDeskId, filterZone }: DeskMapProps) {
  // Filter desks for the current floor and zone filter
  const floorDesks = desks.filter(d => d.floor === floor && (!filterZone || d.zone === filterZone));

  // Colors based on status
  const getStatusColor = (status: Desk['status'], isSelected: boolean) => {
    // Add opacity if another desk is selected to highlight the selected one
    const opacity = selectedDeskId && !isSelected ? '0.4' : '1';
    
    switch (status) {
      case 'available': return `rgba(93, 202, 165, ${opacity})`; // #5DCAA5
      case 'occupied': return `rgba(226, 75, 74, ${opacity})`; // #E24B4A
      case 'away': return `rgba(239, 159, 39, ${opacity})`; // #EF9F27
      case 'flagged': return `rgba(200, 134, 26, ${opacity})`; // #C8861A
      default: return `rgba(200, 200, 200, ${opacity})`;
    }
  };

  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center relative overflow-hidden bg-desk-bg/50 rounded-[12px] border border-gray-200">
      {/* Pseudo-isometric SVG Map */}
      <svg 
        viewBox="0 0 800 600" 
        className="w-full h-full max-w-3xl transform transition-transform duration-500 ease-in-out"
        style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }}
      >
        <g transform="translate(400, 100) scale(1.5) rotate(45) scale(1, 0.5)">
          {/* Floor Base */}
          <rect x="-50" y="-50" width="300" height="250" fill="#f0f0f0" stroke="#e0e0e0" strokeWidth="2" rx="4" />
          
          {/* Desks Grid */}
          {floorDesks.map(desk => {
            const isSelected = desk.id === selectedDeskId;
            const color = getStatusColor(desk.status, isSelected);
            const isInteractive = desk.status === 'available' || isSelected;
            
            return (
              <g 
                key={desk.id} 
                transform={`translate(${desk.x}, ${desk.y})`}
                onClick={() => isInteractive && onDeskClick(desk)}
                className={isInteractive ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-not-allowed"}
                style={{
                  transformOrigin: '20px 20px',
                  transform: isSelected ? `translate(${desk.x}px, ${desk.y}px) translateZ(10px) scale(1.1)` : `translate(${desk.x}px, ${desk.y}px)`
                }}
              >
                {/* Desk Base Shadow */}
                <rect x="2" y="2" width="36" height="36" fill="rgba(0,0,0,0.1)" rx="4" />
                {/* Desk Top */}
                <rect 
                  x="0" 
                  y="0" 
                  width="36" 
                  height="36" 
                  fill={color} 
                  stroke={isSelected ? "#2C2C2A" : "white"} 
                  strokeWidth={isSelected ? "2" : "1"} 
                  rx="4" 
                  className="transition-colors duration-300"
                />
                
                {/* Desk ID label (only visible on hover or selection if we wanted, but let's keep it simple) */}
                <text 
                  x="18" 
                  y="22" 
                  fontSize="10" 
                  fill={desk.status === 'available' ? 'white' : 'rgba(255,255,255,0.8)'} 
                  textAnchor="middle"
                  fontWeight="bold"
                  transform="scale(1, 2) rotate(-45)"
                  style={{ transformOrigin: '18px 22px' }}
                >
                  {desk.id.split('-')[1]}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
