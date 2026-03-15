'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Play, Upload, CheckSquare, Square, Trash } from 'lucide-react';
import api from '@/lib/api';
import { Song, getArtistName } from '@/types';
import SongFormModal from '@/components/admin/SongFormModal';
import BulkSongUploadModal from '@/components/admin/BulkSongUploadModal';

export default function AdminSongsPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Song | undefined>(undefined);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/api/songs');
            setSongs(res.data.data);
            setSelected(new Set());
        } catch (error) {
            console.error('Failed to fetch songs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this song?')) return;
        try {
            await api.delete(`/api/songs/${id}`);
            fetchData();
        } catch {
            alert('Failed to delete song');
        }
    };

    const toggleSelect = (id: string) =>
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const toggleAll = () => {
        if (selected.size === filteredSongs.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filteredSongs.map(s => s._id)));
        }
    };

    const handleBulkDelete = async () => {
        if (!selected.size) return;
        if (!confirm(`Delete ${selected.size} selected song(s)? This cannot be undone.`)) return;
        setBulkDeleting(true);
        try {
            await api.delete('/api/songs/bulk', { data: { ids: [...selected] } });
            fetchData();
        } catch {
            alert('Bulk delete failed.');
        } finally {
            setBulkDeleting(false);
        }
    };

    const filteredSongs = songs.filter(song =>
        song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof song.artist === 'object' ? song.artist?.name : song.artist || '')
            .toLowerCase().includes(searchTerm.toLowerCase())
    );

    const allSelected = filteredSongs.length > 0 && selected.size === filteredSongs.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Songs Management</h1>
                <div className="flex items-center gap-3">
                    {/* Bulk delete button — only when selection is active */}
                    {selected.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}
                        >
                            <Trash size={16} />
                            {bulkDeleting ? 'Deleting…' : `Delete ${selected.size}`}
                        </button>
                    )}
                    <button
                        onClick={() => setIsBulkOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                        style={{ background: 'rgba(29,185,84,0.12)', border: '1px solid rgba(29,185,84,0.35)', color: '#1ed760' }}
                    >
                        <Upload size={18} />
                        Bulk Upload
                    </button>
                    <button
                        onClick={() => { setEditingSong(undefined); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 text-black rounded-lg transition-colors"
                        style={{ background: '#1db954' }}
                    >
                        <Plus size={20} />
                        Add Song
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" size={20} />
                <input
                    type="text"
                    placeholder="Search songs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none"
                    style={{ background: '#111', border: '1px solid #222' }}
                />
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid #222' }}>
                <table className="w-full text-left text-[#ddd]">
                    <thead className="border-b" style={{ background: '#181818', borderColor: '#262626' }}>
                        <tr>
                            {/* Select-all */}
                            <th className="p-4 w-10">
                                <button onClick={toggleAll} className="text-[#888] hover:text-white transition-colors">
                                    {allSelected
                                        ? <CheckSquare size={18} className="text-[#1db954]" />
                                        : <Square size={18} />}
                                </button>
                            </th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Artist</th>
                            <th className="p-4">Album</th>
                            <th className="p-4">Genre</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSongs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-[#888]">No songs found</td>
                            </tr>
                        ) : (
                            filteredSongs.map((song) => {
                                const isChecked = selected.has(song._id);
                                return (
                                    <tr key={song._id}
                                        className="border-b hover:bg-white/5 transition-colors"
                                        style={{ borderColor: '#252525', background: isChecked ? 'rgba(29,185,84,0.08)' : undefined }}>
                                        {/* Checkbox */}
                                        <td className="p-4">
                                            <button onClick={() => toggleSelect(song._id)} className="text-[#888] hover:text-[#1db954] transition-colors">
                                                {isChecked
                                                    ? <CheckSquare size={18} className="text-[#1db954]" />
                                                    : <Square size={18} />}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-[#1c1c1c] overflow-hidden flex-shrink-0">
                                                    {song.coverImage
                                                        ? <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center"><Play size={16} className="text-[#777]" /></div>}
                                                </div>
                                                <span className="font-medium text-white">{song.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{getArtistName(song.artist)}</td>
                                        <td className="p-4">{song.album || '—'}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded text-xs" style={{ background: '#222' }}>{song.genre || 'N/A'}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingSong(song); setIsModalOpen(true); }}
                                                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(song._id)}
                                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <SongFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                songToEdit={editingSong}
            />
            <BulkSongUploadModal
                isOpen={isBulkOpen}
                onClose={() => setIsBulkOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
