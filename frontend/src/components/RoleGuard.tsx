"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDeskContext } from '@/context/DeskContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: 'student' | 'librarian';
}

export function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const { userRole, loading } = useDeskContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.endsWith('/login')) return; // Allow access to login pages
    // Only run the check if we have a resolved role or if we know they aren't logged in
    const checkRole = () => {
      // Small delay to allow localStorage to load in context
      setTimeout(() => {
        const currentRole = localStorage.getItem('deskguard_role');
        if (currentRole !== allowedRole) {
          router.push('/');
        }
      }, 50);
    };
    checkRole();
  }, [allowedRole, router, pathname]);

  if (pathname.endsWith('/login')) {
    return <>{children}</>;
  }

  // Don't render until we are sure
  if (userRole !== allowedRole) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-desk-amber"></div>
      </div>
    );
  }

  return <>{children}</>;
}
