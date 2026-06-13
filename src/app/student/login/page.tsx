"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskContext } from '@/context/DeskContext';
import { User, Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { login } = useDeskContext();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('student', { email, name: isSignUp ? email.split('@')[0] : 'Sarah' });
    router.push('/student');
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-56px)] bg-desk-bg px-4">
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-desk-charcoal p-8 text-center relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-desk-amber/20 rounded-full blur-[40px]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-md mb-4 bg-gray-100 flex items-center justify-center">
              <Image src="/student_avatar.png" alt="Student Profile" width={80} height={80} className="object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Student Portal</h2>
            <p className="text-gray-400 text-sm">{isSignUp ? 'Create a new account' : 'Sign in to book desks'}</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">University Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-desk-amber focus:border-desk-amber transition-colors bg-gray-50 text-desk-charcoal"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
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
              className="w-full flex items-center justify-center gap-2 py-3 bg-desk-amber hover:bg-amber-500 text-white font-bold rounded-lg transition-colors shadow-sm"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-desk-amber font-semibold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
