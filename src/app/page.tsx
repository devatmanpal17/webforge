"use client";

import Link from 'next/link';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#F9F8F6] overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#D69F4C]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6B8E7B]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Left side content (branding) */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 z-10">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#6B8E7B] animate-pulse" />
            <span className="text-xs font-semibold text-[#8FA396] uppercase tracking-wider">System Operational</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[#1C2D42] tracking-tight mb-6">
            DeskGuard
          </h1>
          <p className="text-lg text-[#8FA396] max-w-md">
            The smart library seating system. Find focus spaces, manage your reservations, and help us eliminate seat hoarding.
          </p>
        </div>
      </div>

      {/* Right side content (login options) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 z-10 bg-white/60 backdrop-blur-md border-l border-gray-100">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1C2D42] mb-2">Welcome Back</h2>
            <p className="text-[#8FA396]">Choose your account type to sign in</p>
          </div>

          {/* Student Login Card */}
          <Link href="/student/login" className="block group">
            <div className="bg-white rounded-[20px] border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-[#D69F4C]/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-[#F0F2F4] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                     <Image src="/student_avatar.png" alt="Student Avatar" width={56} height={56} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1C2D42] group-hover:text-[#D69F4C] transition-colors">Student Login</h3>
                    <p className="text-sm text-[#8FA396]">Book desks and view sessions</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#F9F8F6] flex items-center justify-center group-hover:bg-[#D69F4C]/10 transition-colors">
                  <ArrowRight className="h-5 w-5 text-[#8FA396] group-hover:text-[#D69F4C] transition-colors" />
                </div>
              </div>
            </div>
          </Link>

          {/* Librarian Login Card */}
          <Link href="/librarian/login" className="block group">
            <div className="bg-white rounded-[20px] border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-[#D69F4C]/30 transition-all duration-300 relative overflow-hidden">
              {/* Subtle accent border for staff */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D69F4C]/80" />
              <div className="flex items-center justify-between pl-2">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-[#D69F4C]/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    <Image src="/librarian_avatar.png" alt="Librarian Avatar" width={56} height={56} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1C2D42] group-hover:text-[#D69F4C] transition-colors">Staff Login</h3>
                    <p className="text-sm text-[#8FA396]">Manage seating capacity &amp; alerts</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#F9F8F6] flex items-center justify-center group-hover:bg-[#D69F4C]/10 transition-colors">
                  <ArrowRight className="h-5 w-5 text-[#8FA396] group-hover:text-[#D69F4C] transition-colors" />
                </div>
              </div>
            </div>
          </Link>

          <div className="mt-8 text-center">
            <p className="text-xs text-[#8FA396]">
              By signing in, you agree to the University Library terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
