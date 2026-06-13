import { RoleGuard } from '@/components/RoleGuard';

export default function LibrarianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRole="librarian">{children}</RoleGuard>;
}
