'use client';

import { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Artist } from '@/types';
import api from '@/lib/api';

interface ArtistFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    artistToEdit?: Artist;
}

export default function ArtistFormModal({ isOpen, onClose, onSuccess, artistToEdit }: ArtistFormModalProps) {
    const [formData, setFormData] = useState({ name: '', bio: '', genre: '' });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (artistToEdit) {
            setFormData({
                name: artistToEdit.name || '',
                bio: artistToEdit.bio || '',
                genre: artistToEdit.genre || '',
            });
        } else {
            setFormData({ name: '', bio: '', genre: '' });
        }
        setPhotoFile(null);
    }, [artistToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('name', formData.name);
            if (formData.bio) fd.append('bio', formData.bio);
            if (formData.genre) fd.append('genre', formData.genre);
            if (photoFile) fd.append('photo', photoFile);

            if (artistToEdit) {
                await api.put(`/api/artists/${artistToEdit._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/api/artists', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save artist');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{artistToEdit ? 'Edit Artist' : 'Add New Artist'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">{error}</div>}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Name *</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Genre</label>
                        <input type="text" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Bio</label>
                        <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 min-h-[80px]" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Photo</label>
                        <div className="border border-slate-700 border-dashed rounded-lg p-4 text-center hover:bg-slate-800/50 transition-colors">
                            <label className="cursor-pointer block">
                                <ImageIcon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                                <span className="text-sm text-slate-300 block">{photoFile ? photoFile.name : 'Upload Photo'}</span>
                                <input type="file" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Saving...' : artistToEdit ? 'Update Artist' : 'Create Artist'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
