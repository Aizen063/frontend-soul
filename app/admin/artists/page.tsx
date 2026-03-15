'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, User } from 'lucide-react';
import api from '@/lib/api';
import { Artist } from '@/types';
import ArtistFormModal from '@/components/admin/ArtistFormModal';

export default function AdminArtistsPage() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArtist, setEditingArtist] = useState<Artist | undefined>(undefined);

    useEffect(() => { fetchArtists(); }, []);

    const fetchArtists = async () => {
        try {
            const response = await api.get('/api/artists');
            setArtists(response.data.data);
        } catch (error) {
            console.error('Failed to fetch artists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this artist?')) return;
        try {
            await api.delete(`/api/artists/${id}`);
            fetchArtists();
        } catch (error) {
            console.error('Failed to delete artist:', error);
            alert('Failed to delete artist');
        }
    };

    const filteredArtists = artists.filter(artist =>
        (artist.name || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-3xl font-bold text-white">Artists Management</h1>
                <button
                    onClick={() => { setEditingArtist(undefined); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 text-black rounded-lg transition-colors"
                    style={{ background: '#1db954' }}
                >
                    <Plus size={20} />
                    Add Artist
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888]" size={20} />
                <input
                    type="text"
                    placeholder="Search artists..."
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
                            <th className="p-4">Artist</th>
                            <th className="p-4">Genre</th>
                            <th className="p-4">Bio</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArtists.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-[#888]">No artists found</td>
                            </tr>
                        ) : (
                            filteredArtists.map((artist) => (
                                <tr key={artist._id} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: '#252525' }}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#1c1c1c] overflow-hidden flex-shrink-0">
                                                {artist.photo ? (
                                                    <img src={artist.photo} alt={artist.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User size={16} className="text-[#777]" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium text-white">{artist.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">{artist.genre || '—'}</td>
                                    <td className="p-4">
                                        <p className="line-clamp-2 text-sm text-[#888]">{artist.bio || 'No bio'}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setEditingArtist(artist); setIsModalOpen(true); }}
                                                className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(artist._id)}
                                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ArtistFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchArtists}
                artistToEdit={editingArtist}
            />
        </div>
    );
}
