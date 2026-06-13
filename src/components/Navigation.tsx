"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDeskContext } from '../context/DeskContext';
import { User, ShieldCheck } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { currentUser, userRole } = useDeskContext();

  // If we are at the root or a login page, hide navigation entirely
  if (pathname === '/' || pathname.endsWith('/login')) return null;

  const isLibrarian = userRole === 'librarian' || pathname.startsWith('/librarian');

  const links = isLibrarian
    ? [
        { href: '/librarian', label: 'Dashboard' },
        { href: '/map', label: 'Map' },
        { href: '/librarian/account', label: 'Account' },
      ]
    : [
        { href: '/student', label: 'Dashboard' },
        { href: '/map', label: 'Map' },
        { href: '/session', label: 'Session' },
        { href: '/student/account', label: 'Account' },
      ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo & Nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={isLibrarian ? '/librarian' : '/student'} className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-desk-charcoal tracking-tight">
                  DeskGuard
                </span>
                {isLibrarian && (
                  <span className="text-xs font-semibold text-desk-amber bg-desk-amber/10 px-1.5 py-0.5 rounded">
                    Staff
                  </span>
                )}
              </Link>
            </div>
            <nav className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative inline-flex items-center px-3 py-1 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-desk-charcoal'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {link.label}
                    {/* Animated underline */}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-desk-amber rounded-full transition-all duration-300 ease-out ${
                        isActive ? 'w-full' : 'w-0'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile / Mode Switcher */}
          <div className="flex items-center gap-4">
            {isLibrarian ? (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-desk-amber/15 flex items-center justify-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-desk-amber" />
                </div>
                <span className="text-sm font-medium text-desk-charcoal hidden sm:block">
                  {currentUser?.name || 'Admin'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-desk-charcoal">
                  {currentUser?.initials || 'S'}
                </div>
                <span className="text-sm font-medium text-desk-charcoal hidden sm:block">
                  {currentUser?.name || 'Student'}
                </span>
              </div>
            )}
            
            <button 
              onClick={() => {
                // Actually need to get logout from context, but since this is a UI component, 
                // we'll just redirect to root which will clear or we can just call logout.
                // It's safer to just do a window.location so it does a hard reload back to login page
                localStorage.removeItem('deskguard_role');
                window.location.href = '/';
              }}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
