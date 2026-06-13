"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeskContext } from '@/context/DeskContext';

export default function QRScannerPage() {
  const [flashOn, setFlashOn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const { bookDesk, currentUser } = useDeskContext();

  useEffect(() => {
    // Micro-interaction: Simulate scanning success after 3 seconds
    const timer = setTimeout(() => {
      setShowToast(true);
      // Auto-book a desk after 1 second of showing toast
      setTimeout(() => {
        bookDesk('d42'); // Mock booking desk 42
        router.push('/session');
      }, 1500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [bookDesk, router]);

  return (
    <div className="flex flex-col min-h-screen text-gray-900 overflow-hidden relative bg-[#F7F5F0]">
      {/* Noise Overlay */}
      <div 
        className="fixed inset-0 z-50 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}
      ></div>

      {/* Top Bar */}
      <header className="fixed top-0 w-full z-40 bg-white/60 backdrop-blur-xl transition-all duration-300">
        <div className="flex justify-between items-center h-16 px-4 md:px-10 max-w-7xl mx-auto">
          <div className="font-serif text-2xl font-bold text-[#040d1b]">DeskGuard</div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-[#040d1b] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <span className="font-bold text-sm">{currentUser?.initials || 'U'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Scanning Interface Canvas */}
      <main className="flex-grow relative flex flex-col items-center justify-center pt-16">
        {/* Mock Webcam Background */}
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover grayscale-[0.2] brightness-[0.9]" 
            alt="Library background" 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1000"
          />
          {/* Dark Overlay for Focus */}
          <div className="absolute inset-0 bg-[#040d1b]/20"></div>
        </div>

        {/* Scanning Reticle System */}
        <div className="relative z-10 w-full max-w-lg aspect-square flex items-center justify-center p-8">
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[32px] border-4 border-white/40 overflow-hidden shadow-[0_0_0_4000px_rgba(4,13,27,0.4)]">
            {/* Inner Animated Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#8BA888] to-transparent animate-[scan_3s_ease-in-out_infinite]"
                style={{
                  animation: 'scan 3s ease-in-out infinite'
                }}
              ></div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#4a6549] rounded-tl-[32px]"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#4a6549] rounded-tr-[32px]"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#4a6549] rounded-bl-[32px]"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#4a6549] rounded-br-[32px]"></div>
          </div>
        </div>

        {/* Instructions & Actions */}
        <div className="relative z-20 flex flex-col items-center gap-12 px-4 text-center -mt-8">
          <div className="bg-white/90 backdrop-blur-md px-8 py-6 rounded-[24px] shadow-[0_12px_40px_rgba(26,35,50,0.08)] border border-white/20">
            <h1 className="font-serif text-xl font-semibold text-[#040d1b] mb-2">Check-in Required</h1>
            <p className="text-gray-600 max-w-xs mx-auto text-sm">
              Align desk QR code within frame to begin your premium study session.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full sm:w-auto min-w-[200px]">
            <button 
              onClick={() => setFlashOn(!flashOn)}
              className={`font-bold text-[15px] h-12 px-10 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg ${
                flashOn ? 'bg-[#4a6549] text-white' : 'bg-[#040d1b] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {flashOn ? 'flashlight_off' : 'flashlight_on'}
              </span>
              Toggle Light
            </button>
            <Link 
              href="/map"
              className="bg-white/20 backdrop-blur-md text-white font-bold text-[15px] h-12 px-10 rounded-full border border-white/30 hover:bg-white/30 transition-all active:scale-95 flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile View) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-4 pb-safe md:hidden bg-white/90 backdrop-blur-md z-40 rounded-t-xl shadow-[0_-4px_20px_rgba(26,35,50,0.05)]">
        <Link href="/" className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-900">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[11px] mt-1 font-medium">Home</span>
        </Link>
        <Link href="/map" className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-900">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[11px] mt-1 font-medium">Map</span>
        </Link>
        <div className="flex flex-col items-center justify-center bg-[#1a2332] text-white rounded-full px-5 py-1.5 -mt-4 shadow-lg border-4 border-[#F7F5F0]">
          <span className="material-symbols-outlined">qr_code_scanner</span>
        </div>
        <Link href="/session" className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-900">
          <span className="material-symbols-outlined">schedule</span>
          <span className="text-[11px] mt-1 font-medium">Sessions</span>
        </Link>
        <Link href="/librarian" className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-900">
          <span className="material-symbols-outlined">shield_person</span>
          <span className="text-[11px] mt-1 font-medium">Staff</span>
        </Link>
      </nav>

      {/* Toast Mockup for "Success" */}
      <div 
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] transform transition-all duration-500 ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-[#ccebc7] text-[#506b4f] px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 border border-[#b0cfad]">
          <span className="material-symbols-outlined text-[#4a6549]">check_circle</span>
          <span className="font-bold text-[15px]">Desk 42 Found</span>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}} />
    </div>
  );
}
