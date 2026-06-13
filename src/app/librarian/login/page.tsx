"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskContext } from '@/context/DeskContext';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LibrarianLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useDeskContext();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('librarian', { email, name: 'Library Admin' });
    router.push('/librarian');
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-56px)] bg-desk-bg px-4">
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-lg border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-desk-amber/80 z-10" />
        <div className="bg-desk-charcoal p-8 text-center relative overflow-hidden pl-10">
          <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-desk-amber/20 rounded-full blur-[40px]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-md mb-4 bg-desk-amber/10 flex items-center justify-center">
              <Image src="/librarian_avatar.png" alt="Staff Profile" width={80} height={80} className="object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Staff Portal</h2>
            <p className="text-gray-400 text-sm">Sign in to manage library capacity</p>
          </div>
        </div>

        <div className="p-8 pl-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Staff Email or ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-desk-amber focus:border-desk-amber transition-colors bg-gray-50 text-desk-charcoal"
                  placeholder="admin@library.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Secure Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-desk-amber focus:border-desk-amber transition-colors bg-gray-50 text-desk-charcoal"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-desk-charcoal hover:bg-gray-800 text-white font-bold rounded-lg transition-colors shadow-sm mt-4"
            >
              Sign In
              <ArrowRight className="h-5 w-5 text-desk-amber" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
