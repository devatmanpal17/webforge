"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDeskContext } from '../context/DeskContext';
import { User, LogOut } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { currentUser } = useDeskContext();

  const isLibrarian = pathname.startsWith('/librarian');

  const links = isLibrarian
    ? [
        { href: '/librarian', label: 'Dashboard' },
        { href: '/librarian/map', label: 'Map' },
        { href: '/librarian/reports', label: 'Reports' },
      ]
    : [
        { href: '/student', label: 'Dashboard' },
        { href: '/map', label: 'Map' },
        { href: '/session', label: 'Sessions' },
      ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-desk-charcoal tracking-tight">
                DeskGuard{isLibrarian && <span className="text-desk-amber ml-1">Staff</span>}
              </span>
            </div>
            <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-desk-amber text-desk-charcoal'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {isLibrarian ? (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-desk-amber/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-desk-amber" />
                  </div>
                  <span className="text-sm font-medium text-desk-charcoal">Admin</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-desk-charcoal">
                    {currentUser.initials}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
