import { RoleGuard } from '@/components/RoleGuard';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRole="student">{children}</RoleGuard>;
}
