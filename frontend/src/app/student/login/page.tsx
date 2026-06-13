"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem('deskguard_role', 'student');
      
      const token = await result.user.getIdToken();
      await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: 'student' })
      });
      window.location.href = '/student';
    } catch (err: any) {
      if (err.code !== 'auth/cancelled-popup-request' && err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to authenticate with Google');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: email.split('@')[0]
        });
        localStorage.setItem('deskguard_role', 'student');
        
        // Sync role with backend
        const token = await userCredential.user.getIdToken();
        await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: 'student' })
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('deskguard_role', 'student');
      }
      window.location.href = '/student';
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-56px)] bg-[#F9F8F6] px-4 relative">
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center relative overflow-hidden border-b border-gray-100">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-[#D69F4C]/10 rounded-full blur-[40px]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-md mb-4 bg-white flex items-center justify-center">
              <Image src="/student_avatar.png" alt="Student Profile" width={80} height={80} className="object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-[#1C2D42] mb-1">Student Portal</h2>
            <p className="text-[#8FA396] text-sm">{isSignUp ? 'Create a new account' : 'Sign in to book desks'}</p>
          </div>
        </div>

        <div className="p-8">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-colors shadow-sm mb-4"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

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
