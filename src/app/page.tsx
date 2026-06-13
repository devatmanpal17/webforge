"use client";

import Link from 'next/link';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-desk-bg overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-desk-amber/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-desk-green/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Left side content (branding) */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 z-10">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-desk-green animate-pulse" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">System Operational</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-desk-charcoal tracking-tight mb-6">
            DeskGuard
          </h1>
          <p className="text-lg text-gray-500 max-w-md">
            The smart library seating system. Find focus spaces, manage your reservations, and help us eliminate seat hoarding.
          </p>
        </div>
      </div>

      {/* Right side content (login options) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 z-10 bg-white/50 backdrop-blur-md border-l border-white/20">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-desk-charcoal mb-2">Welcome Back</h2>
            <p className="text-gray-500">Choose your account type to sign in</p>
          </div>

          {/* Student Login Card */}
          <Link href="/student" className="block group">
            <div className="bg-white rounded-[20px] border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-desk-amber/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                     <Image src="/student_avatar.png" alt="Student Avatar" width={56} height={56} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-desk-charcoal group-hover:text-desk-amber transition-colors">Student Login</h3>
                    <p className="text-sm text-gray-500">Book desks and view sessions</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-desk-amber/10 transition-colors">
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-desk-amber transition-colors" />
                </div>
              </div>
            </div>
          </Link>

          {/* Librarian Login Card */}
          <Link href="/librarian" className="block group">
            <div className="bg-white rounded-[20px] border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-desk-amber/30 transition-all duration-300 relative overflow-hidden">
              {/* Subtle accent border for staff */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-desk-amber/80" />
              <div className="flex items-center justify-between pl-2">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-desk-amber/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    <Image src="/librarian_avatar.png" alt="Librarian Avatar" width={56} height={56} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-desk-charcoal group-hover:text-desk-amber transition-colors">Staff Login</h3>
                    <p className="text-sm text-gray-500">Manage seating capacity & alerts</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-desk-amber/10 transition-colors">
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-desk-amber transition-colors" />
                </div>
              </div>
            </div>
          </Link>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              By signing in, you agree to the University Library terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
