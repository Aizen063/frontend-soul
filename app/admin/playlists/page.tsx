'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, ListMusic } from 'lucide-react';
import api from '@/lib/api';
import { Playlist } from '@/types';

export default function AdminPlaylistsPage() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const response = await api.get('/api/playlists/admin/all');
            const payload = response.data;
            setPlaylists(Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []);
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this playlist?')) return;

        try {
            await api.delete(`/api/playlists/${id}`);
            fetchPlaylists();
        } catch (error) {
            console.error('Failed to delete playlist:', error);
            alert('Failed to delete playlist');
        }
    };

    const filteredPlaylists = playlists.filter(playlist =>
        playlist.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-3xl font-bold text-white">Playlists Management</h1>
                <div className="text-[#aaa] text-sm">
                    Total Playlists: {playlists.length}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888]" size={20} />
                <input
                    type="text"
                    placeholder="Search playlists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none"
                    style={{ background: '#111', border: '1px solid #222' }}
                />
            </div>

            {/* Playlists Table */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid #222' }}>
                <table className="w-full text-left text-[#ddd]">
                    <thead className="border-b" style={{ background: '#181818', borderColor: '#262626' }}>
                        <tr>
                            <th className="p-4">Playlist Name</th>
                            <th className="p-4">Creator ID</th>
                            <th className="p-4">Created At</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlaylists.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-[#888]">
                                    No playlists found
                                </td>
                            </tr>
                        ) : (
                            filteredPlaylists.map((playlist) => (
                                <tr key={playlist._id} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: '#252525' }}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-[#1c1c1c] flex items-center justify-center flex-shrink-0">
                                                <ListMusic size={20} className="text-[#1db954]" />
                                            </div>
                                            <span className="font-medium text-white">{playlist.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-[#888]">
                                        {typeof playlist.user === 'object'
                                            ? `${(playlist.user as any).name} (${(playlist.user as any).email})`
                                            : `User #${playlist.user}`}
                                    </td>
                                    <td className="p-4 text-sm text-[#888]">
                                        {playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(playlist._id)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            title="Delete Playlist"
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
