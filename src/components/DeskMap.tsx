"use client";

import { Desk } from '../types';
import { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface DeskMapProps {
  desks: Desk[];
  floor: number;
  onDeskClick: (desk: Desk) => void;
  selectedDeskId?: string;
  filterZone: string | null;
  searchHighlight?: string;
}

const ZONE_COLORS: Record<string, string> = {
  'Tables': 'rgba(93,202,165,0.07)',
  'Open Area': 'rgba(200,134,26,0.07)',
  'Window Seat': 'rgba(100,140,220,0.07)',
};

export default function DeskMap({ desks, floor, onDeskClick, selectedDeskId, filterZone, searchHighlight }: DeskMapProps) {
  const [animKey, setAnimKey] = useState(floor);
  const [visible, setVisible] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Floor transition: fade out, swap, fade in
  useEffect(() => {
    if (floor !== animKey) {
      setVisible(false);
      const t = setTimeout(() => {
        setAnimKey(floor);
        setVisible(true);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [floor, animKey]);

  const floorDesks = desks.filter(d => d.floor === animKey);
  const totalAvailable = floorDesks.filter(d => d.status === 'available').length;

  const getStatusColor = (desk: Desk) => {
    const isSelected = desk.id === selectedDeskId;
    const isFiltered = filterZone && desk.zone !== filterZone;
    const isSearchMatch = searchHighlight && desk.id.toLowerCase().includes(searchHighlight.toLowerCase());
    const isSearchMiss = searchHighlight && !isSearchMatch;

    let opacity = 1;
    if (isFiltered || isSearchMiss) opacity = 0.2;
    if (selectedDeskId && !isSelected) opacity = Math.min(opacity, 0.4);

    switch (desk.status) {
      case 'available': return `rgba(93, 202, 165, ${opacity})`;
      case 'occupied': return `rgba(226, 75, 74, ${opacity})`;
      case 'away': return `rgba(239, 159, 39, ${opacity})`;
      case 'flagged': return `rgba(200, 134, 26, ${opacity})`;
      default: return `rgba(200, 200, 200, ${opacity})`;
    }
  };

  // Zone bounding boxes for labels
  const zones = ['Tables', 'Open Area', 'Window Seat'];
  const getZoneBounds = (zone: string) => {
    const zDesks = floorDesks.filter(d => d.zone === zone);
    if (zDesks.length === 0) return null;
    const minX = Math.min(...zDesks.map(d => d.x));
    const maxX = Math.max(...zDesks.map(d => d.x));
    const minY = Math.min(...zDesks.map(d => d.y));
    const maxY = Math.max(...zDesks.map(d => d.y));
    return { x: minX - 8, y: minY - 22, w: maxX - minX + 48, h: maxY - minY + 58 };
  };

  const scale = 1.4 * zoom;

  return (
    <div className="w-full h-full min-h-[520px] flex items-center justify-center relative overflow-hidden bg-[#FAFAF7]">
      <svg
        viewBox="0 0 800 650"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── Floor label ── */}
        <text x="32" y="36" fontSize="13" fontWeight="700" fill="#2C2C2A" fontFamily="system-ui, sans-serif" letterSpacing="0.04em">
          FLOOR {animKey}
        </text>
        <text x="32" y="54" fontSize="11" fill="#999" fontFamily="system-ui, sans-serif">
          {totalAvailable} of {floorDesks.length} seats available
        </text>

        {/* ── Isometric group — CENTERED ── */}
        <g
          transform={`translate(400, 340) scale(${scale}) rotate(45) scale(1, 0.5)`}
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          {/* ── Floor outline / walls ── */}
          <rect x="-18" y="-18" width="260" height="238" fill="#F2F0EB" stroke="#D5D3CE" strokeWidth="2" rx="4" />
          {/* Wall thickness effect */}
          <rect x="-20" y="-20" width="264" height="242" fill="none" stroke="#C8C6C1" strokeWidth="0.5" rx="5" />

          {/* ── Grid lines ── */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`gv-${i}`} x1={i * 42 + 10} y1={-14} x2={i * 42 + 10} y2={216} stroke="#E8E6E1" strokeWidth="0.4" strokeDasharray="3 5" />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`gh-${i}`} x1={-14} y1={i * 42 + 10} x2={236} y2={i * 42 + 10} stroke="#E8E6E1" strokeWidth="0.4" strokeDasharray="3 5" />
          ))}

          {/* ── Zone regions + labels ── */}
          {zones.map(zone => {
            const bounds = getZoneBounds(zone);
            if (!bounds) return null;
            const isHighlighted = filterZone === zone;
            return (
              <g key={zone}>
                <rect
                  x={bounds.x}
                  y={bounds.y}
                  width={bounds.w}
                  height={bounds.h}
                  fill={ZONE_COLORS[zone] || 'transparent'}
                  stroke={isHighlighted ? '#C8861A' : '#E0DEDA'}
                  strokeWidth={isHighlighted ? '1.5' : '0.5'}
                  strokeDasharray={isHighlighted ? 'none' : '4 3'}
                  rx="4"
                  className="transition-all duration-300"
                />
                {/* Zone label — counter-rotated so readable on isometric canvas */}
                <text
                  x={bounds.x + bounds.w / 2}
                  y={bounds.y + 10}
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="600"
                  fill="#B0ADA8"
                  letterSpacing="0.12em"
                  fontFamily="system-ui, sans-serif"
                  transform={`rotate(-45, ${bounds.x + bounds.w / 2}, ${bounds.y + 10}) scale(1, 2)`}
                  style={{ transformOrigin: `${bounds.x + bounds.w / 2}px ${bounds.y + 10}px` }}
                >
                  {zone.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* ── Entrance marker (bottom-left) ── */}
          <g>
            <line x1="-18" y1="195" x2="-18" y2="220" stroke="#C8861A" strokeWidth="2.5" strokeLinecap="round" />
            <text
              x="-10"
              y="212"
              fontSize="6.5"
              fontWeight="700"
              fill="#C8861A"
              letterSpacing="0.06em"
              fontFamily="system-ui, sans-serif"
              transform="rotate(-45, -10, 212) scale(1, 2)"
              style={{ transformOrigin: '-10px 212px' }}
            >
              ENTRY
            </text>
          </g>

          {/* ── Stairwell icon (top-right) ── */}
          <g transform="translate(228, -12)">
            <rect x="0" y="0" width="14" height="14" fill="none" stroke="#C8C6C1" strokeWidth="0.8" rx="2" />
            {[0, 1, 2, 3].map(i => (
              <line key={`stair-${i}`} x1="3" y1={3 + i * 3} x2="11" y2={3 + i * 3} stroke="#C8C6C1" strokeWidth="0.6" />
            ))}
          </g>

          {/* ── Desk cells ── */}
          {floorDesks.map(desk => {
            const isSelected = desk.id === selectedDeskId;
            const color = getStatusColor(desk);
            const isClickable = desk.status === 'available' || isSelected;
            const isSearchMatch = searchHighlight && desk.id.toLowerCase().includes(searchHighlight.toLowerCase());

            return (
              <g
                key={desk.id}
                transform={`translate(${desk.x}, ${desk.y})`}
                onClick={() => onDeskClick(desk)}
                className={isClickable ? 'cursor-pointer' : 'cursor-pointer'}
                role="button"
                tabIndex={0}
              >
                {/* Shadow */}
                <rect x="2" y="2" width="32" height="32" fill="rgba(0,0,0,0.05)" rx="5" />
                {/* Desk surface */}
                <rect
                  x="0"
                  y="0"
                  width="32"
                  height="32"
                  fill={color}
                  stroke={isSelected ? '#2C2C2A' : isSearchMatch ? '#C8861A' : 'rgba(255,255,255,0.5)'}
                  strokeWidth={isSelected ? '2.5' : isSearchMatch ? '2' : '0.8'}
                  rx="5"
                  className="transition-all duration-200"
                />
                {/* Desk number */}
                <text
                  x="16"
                  y="19"
                  fontSize="9"
                  fill="rgba(255,255,255,0.9)"
                  textAnchor="middle"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                  transform="rotate(-45, 16, 19) scale(1, 2)"
                  style={{ transformOrigin: '16px 19px', pointerEvents: 'none' }}
                >
                  {desk.id.split('-')[1]}
                </text>
              </g>
            );
          })}
        </g>

        {/* ── Compass (bottom-right, outside isometric transform) ── */}
        <g transform="translate(760, 610)">
          <circle cx="0" cy="0" r="16" fill="white" stroke="#E0E0E0" strokeWidth="0.8" />
          <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#2C2C2A" fontFamily="system-ui, sans-serif">N</text>
          <polygon points="0,-12 -2.5,-7 2.5,-7" fill="#C8861A" />
        </g>
      </svg>

      {/* ── Zoom controls ── */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.15, 1.8))}
          className="h-8 w-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-desk-charcoal hover:border-gray-300 transition-colors shadow-sm"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.15, 0.6))}
          className="h-8 w-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-desk-charcoal hover:border-gray-300 transition-colors shadow-sm"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
