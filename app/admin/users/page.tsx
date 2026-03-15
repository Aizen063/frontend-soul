'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { User } from '@/types';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/api/users/${id}`);
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Users Management</h1>
                <div className="text-[#aaa] text-sm">Total Users: {users.length}</div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888]" size={20} />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none"
                    style={{ background: '#111', border: '1px solid #222' }}
                />
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid #222' }}>
                <table className="w-full text-left text-[#ddd]">
                    <thead className="border-b" style={{ background: '#181818', borderColor: '#262626' }}>
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-[#888]">No users found</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user._id} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: '#252525' }}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold" style={{ background: 'linear-gradient(135deg, #1db954, #1ed760)' }}>
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-[#888]">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.role?.toLowerCase() === 'admin'
                                            ? 'bg-[#1db954]/20 text-[#1ed760]'
                                            : 'bg-[#222] text-[#bbb]'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
