"use client";

import { Desk } from '../types';
import { useEffect, useState } from 'react';

interface DeskMapProps {
  desks: Desk[];
  floor: number;
  onDeskClick: (desk: Desk) => void;
  selectedDeskId?: string;
  filterZone: string | null;
}

// Zone layout definitions — define regions on the isometric grid
const ZONE_REGIONS: Record<string, { label: string; x: number; y: number; w: number; h: number; fill: string }> = {
  'Tables': { label: 'Tables', x: -10, y: -10, w: 200, h: 170, fill: 'rgba(93,202,165,0.06)' },
  'Open Area': { label: 'Open Area', x: -10, y: 170, w: 120, h: 80, fill: 'rgba(200,134,26,0.06)' },
  'Window Seat': { label: 'Window Seats', x: 120, y: 170, w: 120, h: 80, fill: 'rgba(93,134,220,0.06)' },
};

export default function DeskMap({ desks, floor, onDeskClick, selectedDeskId, filterZone }: DeskMapProps) {
  const [animating, setAnimating] = useState(false);
  const [displayFloor, setDisplayFloor] = useState(floor);

  // Floor transition animation
  useEffect(() => {
    if (floor !== displayFloor) {
      setAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayFloor(floor);
        setAnimating(false);
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [floor, displayFloor]);

  const floorDesks = desks.filter(d => d.floor === displayFloor && (!filterZone || d.zone === filterZone));
  const allFloorDesks = desks.filter(d => d.floor === displayFloor);

  const getStatusColor = (status: Desk['status'], isSelected: boolean) => {
    const opacity = selectedDeskId && !isSelected ? '0.35' : '1';
    switch (status) {
      case 'available': return `rgba(93, 202, 165, ${opacity})`;
      case 'occupied': return `rgba(226, 75, 74, ${opacity})`;
      case 'away': return `rgba(239, 159, 39, ${opacity})`;
      case 'flagged': return `rgba(200, 134, 26, ${opacity})`;
      default: return `rgba(200, 200, 200, ${opacity})`;
    }
  };

  return (
    <div className="w-full h-full min-h-[520px] flex items-center justify-center relative overflow-hidden bg-[#FAFAF7] rounded-[12px]">
      <svg
        viewBox="0 0 800 650"
        className="w-full h-full max-w-3xl"
        style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.04))' }}
      >
        {/* ── Compass indicator ── */}
        <g transform="translate(740, 40)">
          <circle cx="0" cy="0" r="18" fill="white" stroke="#E0E0E0" strokeWidth="1" />
          <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill="#2C2C2A" fontFamily="system-ui">N</text>
          <polygon points="0,-14 -3,-8 3,-8" fill="#C8861A" />
        </g>

        {/* ── Floor label ── */}
        <text x="50" y="42" fontSize="14" fontWeight="700" fill="#2C2C2A" fontFamily="system-ui" letterSpacing="0.05em">
          FLOOR {displayFloor}
        </text>
        <text x="50" y="60" fontSize="11" fill="#999" fontFamily="system-ui">
          {allFloorDesks.filter(d => d.status === 'available').length} of {allFloorDesks.length} seats available
        </text>

        {/* ── Isometric group ── */}
        <g
          transform="translate(400, 130) scale(1.6) rotate(45) scale(1, 0.5)"
          style={{
            opacity: animating ? 0 : 1,
            transition: 'opacity 0.25s ease-in-out, transform 0.25s ease-in-out',
            transform: animating ? 'translateY(10px)' : 'translateY(0)',
          }}
        >
          {/* ── Floor base ── */}
          <rect x="-20" y="-20" width="280" height="270" fill="#F2F0EB" stroke="#E4E2DD" strokeWidth="1.5" rx="6" />

          {/* ── Grid lines ── */}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`gv-${i}`} x1={i * 40} y1={-20} x2={i * 40} y2={250} stroke="#E8E6E1" strokeWidth="0.5" strokeDasharray="4 4" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`gh-${i}`} x1={-20} y1={i * 40} x2={260} y2={i * 40} stroke="#E8E6E1" strokeWidth="0.5" strokeDasharray="4 4" />
          ))}

          {/* ── Zone regions ── */}
          {Object.entries(ZONE_REGIONS).map(([zone, cfg]) => (
            <g key={zone}>
              <rect
                x={cfg.x}
                y={cfg.y}
                width={cfg.w}
                height={cfg.h}
                fill={filterZone && filterZone !== zone ? 'transparent' : cfg.fill}
                stroke={filterZone === zone ? '#C8861A' : '#E4E2DD'}
                strokeWidth={filterZone === zone ? '1.5' : '0.5'}
                strokeDasharray={filterZone === zone ? 'none' : '6 3'}
                rx="4"
                className="transition-all duration-300"
              />
              {/* Counter-rotated label so text reads normally */}
              <text
                x={cfg.x + cfg.w / 2}
                y={cfg.y + 14}
                textAnchor="middle"
                fontSize="8"
                fontWeight="600"
                fill="#999"
                letterSpacing="0.1em"
                transform={`rotate(-45, ${cfg.x + cfg.w / 2}, ${cfg.y + 14}) scale(1, 2)`}
                style={{ transformOrigin: `${cfg.x + cfg.w / 2}px ${cfg.y + 14}px` }}
              >
                {cfg.label.toUpperCase()}
              </text>
            </g>
          ))}

          {/* ── Entrance marker ── */}
          <g>
            <rect x="-18" y="215" width="40" height="18" fill="white" stroke="#C8861A" strokeWidth="1" rx="3" />
            <text
              x="2"
              y="227"
              fontSize="7"
              fontWeight="600"
              fill="#C8861A"
              textAnchor="middle"
              transform="rotate(-45, 2, 227) scale(1, 2)"
              style={{ transformOrigin: '2px 227px' }}
            >
              ENTRY ↗
            </text>
          </g>

          {/* ── Desk cells ── */}
          {floorDesks.map(desk => {
            const isSelected = desk.id === selectedDeskId;
            const color = getStatusColor(desk.status, isSelected);
            const isInteractive = desk.status === 'available' || isSelected;

            return (
              <g
                key={desk.id}
                transform={`translate(${desk.x}, ${desk.y})`}
                onClick={() => isInteractive && onDeskClick(desk)}
                className={`${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ transition: 'opacity 0.3s ease' }}
              >
                {/* Shadow */}
                <rect x="3" y="3" width="32" height="32" fill="rgba(0,0,0,0.06)" rx="5" />
                {/* Desk surface */}
                <rect
                  x="0"
                  y="0"
                  width="32"
                  height="32"
                  fill={color}
                  stroke={isSelected ? '#2C2C2A' : 'rgba(255,255,255,0.6)'}
                  strokeWidth={isSelected ? '2.5' : '1'}
                  rx="5"
                  className="transition-all duration-200"
                />
                {/* Hover ring */}
                {isInteractive && (
                  <rect
                    x="-2"
                    y="-2"
                    width="36"
                    height="36"
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth="2"
                    rx="7"
                    className="hover:stroke-[#2C2C2A] transition-all duration-150"
                  />
                )}
                {/* Desk number — counter-rotated for readability */}
                <text
                  x="16"
                  y="19"
                  fontSize="9"
                  fill="rgba(255,255,255,0.9)"
                  textAnchor="middle"
                  fontWeight="700"
                  fontFamily="system-ui"
                  transform="rotate(-45, 16, 19) scale(1, 2)"
                  style={{ transformOrigin: '16px 19px', pointerEvents: 'none' }}
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
