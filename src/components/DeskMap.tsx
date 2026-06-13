"use client";

import { useDeskContext, Desk } from '@/context/DeskContext';
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

function Desk3D({ 
  desk, 
  onClick, 
  isSelected, 
  isFaded 
}: { 
  desk: Desk, 
  onClick: () => void, 
  isSelected: boolean,
  isFaded: boolean 
}) {
  // Scale SVG coords (approx 0-800, 0-650) to 3D coords
  // We'll scale down by factor of 30 and center.
  const scale = 30;
  const px = (desk.x - 400) / scale;
  const pz = (desk.y - 325) / scale;
  
  let color = '#2B2D2F'; // occupied (Charcoal)
  if (desk.status === 'available') color = '#6B8E7B'; // Deep Sage
  if (desk.status === 'away') color = '#D69F4C'; // Warm Ocher

  return (
    <group 
      position={[px, 0.3, pz]} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.6, 1.5]} />
        <meshStandardMaterial 
          color={isSelected ? '#ffffff' : color} 
          transparent={true}
          opacity={isFaded ? 0.3 : 1}
        />
      </mesh>
      
      {/* Highlight outline if selected */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 0.7, 1.6]} />
          <meshBasicMaterial color="#D69F4C" wireframe />
        </mesh>
      )}

      {/* HTML Tag hovering over desk */}
      {!isFaded && (
        <Html position={[0, 0.8, 0]} center zIndexRange={[100, 0]} distanceFactor={15}>
          <div 
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap transition-colors select-none cursor-pointer ${
              isSelected 
                ? 'bg-[#D69F4C] text-white' 
                : 'bg-white/90 text-[#2B2D2F] backdrop-blur-sm'
            }`}
          >
            {desk.id.replace('f1-', '').replace('f2-', '').replace('f3-', '')}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function DeskMap({ selectedZone, onDeskSelect }: { selectedZone: string | null, onDeskSelect?: (desk: Desk) => void }) {
  const { desks } = useDeskContext();
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);

  const handleDeskClick = (desk: Desk) => {
    setSelectedDeskId(desk.id);
    if (onDeskSelect) onDeskSelect(desk);
  };

  // Only show floor 1 for now, or all floors layered (but let's do F1)
  const visibleDesks = desks.filter(d => d.floor === 1);

  return (
    <div className="w-full h-full min-h-[520px] bg-[#F9F8F6] relative rounded-3xl overflow-hidden shadow-inner group cursor-grab active:cursor-grabbing">
      
      {/* 3D Canvas */}
      <Canvas 
        shadows 
        camera={{ position: [0, 15, 15], fov: 45 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 20, 10]} 
          castShadow 
          intensity={1.2} 
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} color="#D69F4C" />
        
        {/* Floor Base */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#F0F2F4" />
        </mesh>
        
        {/* Grid helper for aesthetics */}
        <gridHelper args={[60, 30, '#E0E3E8', '#E0E3E8']} position={[0, 0.01, 0]} />

        {/* Desks */}
        {visibleDesks.map(desk => (
          <Desk3D
            key={desk.id}
            desk={desk}
            onClick={() => handleDeskClick(desk)}
            isSelected={selectedDeskId === desk.id}
            isFaded={selectedZone !== null && desk.zone !== selectedZone}
          />
        ))}

        {/* Controls */}
        <OrbitControls 
          enableRotate={true}
          enablePan={true}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.2} // don't go below ground
          minDistance={5}
          maxDistance={40}
          target={[0, 0, 0]} // focus center
        />
      </Canvas>

      {/* Floating Instructions for users */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-black/5 flex items-center gap-2 pointer-events-none text-xs text-[#8FA396] font-medium">
        <span className="material-symbols-outlined text-[16px]">touch_app</span>
        Pinch to zoom, drag to rotate & pan
      </div>
    </div>
  );
}
