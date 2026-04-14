'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Music, Image as ImageIcon } from 'lucide-react';
import { Song, Artist } from '@/types';
import api from '@/lib/api';

interface SongFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    songToEdit?: Song;
}

export default function SongFormModal({ isOpen, onClose, onSuccess, songToEdit }: SongFormModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        artistId: '',
        album: '',
        genre: '',
        lyrics: '',
    });
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { fetchArtists(); }, []);

    useEffect(() => {
        if (songToEdit) {
            const artistId = typeof songToEdit.artist === 'object'
                ? songToEdit.artist._id
                : songToEdit.artist ?? '';
            setFormData({
                title: songToEdit.title,
                artistId,
                album: songToEdit.album || '',
                genre: songToEdit.genre || '',
                lyrics: songToEdit.lyrics || '',
            });
        } else {
            setFormData({ title: '', artistId: '', album: '', genre: '', lyrics: '' });
        }
        setAudioFile(null);
        setCoverFile(null);
    }, [songToEdit, isOpen]);

    const fetchArtists = async () => {
        try {
            const res = await api.get('/api/artists');
            setArtists(res.data.data);
        } catch (err) {
            console.error('Failed to fetch artists', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('artistId', formData.artistId);
            if (formData.album) fd.append('album', formData.album);
            if (formData.genre) fd.append('genre', formData.genre);
            if (formData.lyrics) fd.append('lyrics', formData.lyrics);
            if (audioFile) fd.append('audio', audioFile);
            if (coverFile) fd.append('coverImage', coverFile);

            if (songToEdit) {
                await api.put(`/api/songs/${songToEdit._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/api/songs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save song');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                        {songToEdit ? 'Edit Song' : 'Add New Song'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">{error}</div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                required
                            />
                        </div>

                        {/* Artist */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Artist *</label>
                            <select
                                value={formData.artistId}
                                onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                required
                            >
                                <option value="">Select Artist</option>
                                {artists.map(artist => (
                                    <option key={artist._id} value={artist._id}>{artist.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Album */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Album</label>
                            <input
                                type="text"
                                value={formData.album}
                                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* Genre */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Genre</label>
                            <input
                                type="text"
                                value={formData.genre}
                                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Lyrics Textarea */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Lyrics (LRC Format) Optional</label>
                        <textarea
                            value={formData.lyrics}
                            onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                            placeholder="[00:15.22] Example Lyric Line..."
                            className="w-full h-28 sm:h-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* File uploads */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h3 className="text-lg font-semibold text-white">Media Files {songToEdit && '(Upload to replace)'}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border border-slate-700 border-dashed rounded-lg p-4 text-center hover:bg-slate-800/50 transition-colors">
                                <label className="cursor-pointer block">
                                    <Music className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                    <span className="text-sm text-slate-300 block">
                                        Audio File {!songToEdit && <span className="text-red-400">*</span>}
                                    </span>
                                    <input
                                        type="file"
                                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        accept="audio/*"
                                        required={!songToEdit}
                                    />
                                    {audioFile && <span className="text-xs text-green-400 mt-1 block truncate">{audioFile.name}</span>}
                                </label>
                            </div>

                            <div className="border border-slate-700 border-dashed rounded-lg p-4 text-center hover:bg-slate-800/50 transition-colors">
                                <label className="cursor-pointer block">
                                    <ImageIcon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                                    <span className="text-sm text-slate-300 block">Cover Image</span>
                                    <input
                                        type="file"
                                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    {coverFile && <span className="text-xs text-green-400 mt-1 block truncate">{coverFile.name}</span>}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : songToEdit ? 'Update Song' : 'Create Song'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
