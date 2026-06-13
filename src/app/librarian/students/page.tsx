"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeskContext } from '@/context/DeskContext';
import { Search, Users, Mail, Tag, RefreshCw } from 'lucide-react';
import { auth } from '@/lib/firebase';

interface Student {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
}

export default function StudentsPage() {
  const { userRole } = useDeskContext();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (userRole && userRole !== 'librarian') {
      router.push('/student');
    }
  }, [userRole, router]);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/students', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err: any) {
      setError(err.message || 'Could not load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2B2D2F] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1C2D42] mb-1 flex items-center gap-3">
              <Users className="h-8 w-8 text-[#D69F4C]" />
              Student Records
            </h1>
            <p className="text-sm text-[#8FA396]">
              All registered students stored in the SQLite database
            </p>
          </div>
          <button
            onClick={fetchStudents}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D69F4C] text-white text-sm font-semibold hover:bg-[#c4902e] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8FA396]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or ID..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-[#2B2D2F] placeholder-[#8FA396] focus:outline-none focus:ring-2 focus:ring-[#D69F4C] transition-colors"
          />
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D69F4C]/10 text-[#D69F4C]">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
          </span>
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-[#8FA396] hover:text-[#2B2D2F] transition-colors underline">
              Clear search
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-[#D69F4C]/30 border-t-[#D69F4C] rounded-full animate-spin" />
            <p className="text-sm text-[#8FA396]">Loading student records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users className="h-16 w-16 text-gray-200 mb-4" />
            <p className="text-lg font-semibold text-[#8FA396]">No students found</p>
            <p className="text-sm text-gray-300 mt-1">
              {search ? 'Try a different search term' : 'No students have registered yet'}
            </p>
          </div>
        ) : (
          /* Table */
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8FA396] uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8FA396] uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8FA396] uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> ID</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8FA396] uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filtered.map((student, idx) => (
                  <tr
                    key={student.id}
                    className="hover:bg-[#F9F8F6] transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#D69F4C]/15 flex items-center justify-center text-[#D69F4C] font-bold text-sm flex-shrink-0">
                          {student.initials}
                        </div>
                        <span className="font-semibold text-[#1C2D42]">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#8FA396]">{student.email}</td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 rounded bg-[#F0F2F4] text-[#1C2D42] text-xs font-mono">
                        {student.id.substring(0, 20)}{student.id.length > 20 ? '…' : ''}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#6B8E7B]/10 text-[#6B8E7B]">
                        {student.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
