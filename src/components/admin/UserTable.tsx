'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiUser, HiShieldCheck, HiXCircle, HiCheckCircle } from 'react-icons/hi2';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  createdAt: string;
  organization: {
    name: string;
  };
}

export default function UserTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json() as Promise<User[]>;
    },
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All Roles</option>
          <option value="USER">User</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="px-4 py-3 text-slate-300">User</th>
              <th className="px-4 py-3 text-slate-300">Organization</th>
              <th className="px-4 py-3 text-slate-300">Role</th>
              <th className="px-4 py-3 text-slate-300">Status</th>
              <th className="px-4 py-3 text-slate-300">Created</th>
              <th className="px-4 py-3 text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user) => (
              <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <HiUser className="text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-slate-400 text-sm">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{user.organization.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'SUPER_ADMIN' 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 text-sm ${
                    user.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {user.status === 'ACTIVE' ? <HiCheckCircle /> : <HiXCircle />}
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers?.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <HiUser className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p>No users found</p>
        </div>
      )}
    </div>
  );
}