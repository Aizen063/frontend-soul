'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload, Music, Image, CheckCircle, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Artist } from '@/types';

interface SongEntry {
    id: string;
    audioFile: File | null;
    coverFile: File | null;
    title: string;
    artistId: string;
    album: string;
    genre: string;
}

type RowStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadResult {
    index: number;
    title: string;
    status: RowStatus;
    error?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

let idCounter = 0;
const newEntry = (): SongEntry => ({
    id: `entry-${++idCounter}`,
    audioFile: null,
    coverFile: null,
    title: '',
    artistId: '',
    album: '',
    genre: '',
});

export default function BulkSongUploadModal({ isOpen, onClose, onSuccess }: Props) {
    const [entries, setEntries] = useState<SongEntry[]>([newEntry()]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<UploadResult[] | null>(null);
    const audioRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const coverRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        if (isOpen) {
            api.get('/api/artists').then(r => setArtists(r.data.data)).catch(() => { });
            setResults(null);
            setEntries([newEntry()]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    /* ── helpers ── */
    const updateEntry = (id: string, patch: Partial<SongEntry>) =>
        setEntries(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));

    const removeEntry = (id: string) =>
        setEntries(prev => prev.filter(e => e.id !== id));

    const addEntry = () => setEntries(prev => [...prev, newEntry()]);

    /* ── audio file pick — auto-fill title ── */
    const handleAudioChange = (id: string, file: File | null) => {
        if (!file) return;
        const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        updateEntry(id, { audioFile: file, title: autoTitle });
    };

    /* ── submit ── */
    const handleSubmit = async () => {
        const valid = entries.filter(e => e.audioFile && e.artistId);
        if (!valid.length) return alert('Add at least one song with an audio file and an artist.');

        setUploading(true);
        setResults(valid.map((e, i) => ({ index: i, title: e.title, status: 'uploading' })));

        const form = new FormData();
        valid.forEach((e, i) => {
            form.append('audio', e.audioFile as File);
            if (e.coverFile) form.append('coverImage', e.coverFile);
            form.append('titles[]', e.title || `Untitled ${i + 1}`);
            form.append('artistIds[]', e.artistId);
            form.append('albums[]', e.album || '');
            form.append('genres[]', e.genre || '');
        });

        try {
            const res = await api.post('/api/songs/bulk', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const { data: created, errors } = res.data;
            const errorMap: Record<number, string> = {};
            (errors || []).forEach((e: { index: number; error: string }) => { errorMap[e.index] = e.error; });

            setResults(valid.map((e, i) => ({
                index: i,
                title: e.title || `Untitled ${i + 1}`,
                status: errorMap[i] ? 'error' : 'success',
                error: errorMap[i],
            })));

            if (created?.length) onSuccess();
        } catch (err: any) {
            setResults(prev =>
                (prev || []).map(r => ({ ...r, status: r.status === 'uploading' ? 'error' : r.status, error: 'Upload failed' }))
            );
        } finally {
            setUploading(false);
        }
    };

    const allDone = results && results.every(r => r.status !== 'uploading');
    const hasCoverMismatch = entries.some(e => e.coverFile && !e.audioFile);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
                style={{ background: '#0d0d1f', border: '1px solid rgba(0,245,255,0.15)', boxShadow: '0 0 60px rgba(0,245,255,0.08)' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(0,245,255,0.1)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(0,245,255,0.2),rgba(255,0,200,0.2))', border: '1px solid rgba(0,245,255,0.3)' }}>
                            <Upload size={18} style={{ color: '#00f5ff' }} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg tracking-wide">Bulk Song Upload</h2>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Upload up to 20 songs with covers at once</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Results panel */}
                {results && (
                    <div className="px-6 py-4 border-b space-y-2" style={{ borderColor: 'rgba(0,245,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
                        <p className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>UPLOAD RESULTS</p>
                        {results.map(r => (
                            <div key={r.index} className="flex items-center gap-3 text-sm">
                                {r.status === 'uploading' && <Loader2 size={16} className="animate-spin" style={{ color: '#00f5ff' }} />}
                                {r.status === 'success' && <CheckCircle size={16} style={{ color: '#39ff14' }} />}
                                {r.status === 'error' && <AlertCircle size={16} style={{ color: '#ff0073' }} />}
                                <span style={{ color: r.status === 'error' ? '#ff0073' : r.status === 'success' ? '#39ff14' : '#fff' }}>
                                    {r.title}
                                </span>
                                {r.error && <span className="text-xs" style={{ color: 'rgba(255,0,115,0.8)' }}>— {r.error}</span>}
                            </div>
                        ))}
                        {allDone && (
                            <div className="flex gap-3 pt-2">
                                <button onClick={onClose} className="px-4 py-2 text-sm font-bold rounded-xl transition-all" style={{ background: 'rgba(57,255,20,0.15)', color: '#39ff14', border: '1px solid rgba(57,255,20,0.3)' }}>
                                    Done
                                </button>
                                <button onClick={() => { setResults(null); setEntries([newEntry()]); }} className="px-4 py-2 text-sm font-bold rounded-xl transition-all" style={{ background: 'rgba(0,245,255,0.08)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.2)' }}>
                                    Upload More
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Song rows */}
                {!results && (
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                        {entries.map((entry, idx) => (
                            <div key={entry.id} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                {/* Row header */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(0,245,255,0.7)' }}>SONG {idx + 1}</span>
                                    {entries.length > 1 && (
                                        <button onClick={() => removeEntry(entry.id)} className="p-1 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* File pickers */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Audio */}
                                    <button
                                        type="button"
                                        onClick={() => audioRefs.current[entry.id]?.click()}
                                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all hover:border-cyan-400/50"
                                        style={{ background: 'rgba(0,245,255,0.04)', border: entry.audioFile ? '1px solid rgba(0,245,255,0.4)' : '1px dashed rgba(255,255,255,0.15)', color: entry.audioFile ? '#00f5ff' : 'rgba(255,255,255,0.4)' }}
                                    >
                                        <Music size={14} className="shrink-0" />
                                        <span className="truncate">{entry.audioFile ? entry.audioFile.name : 'Pick audio file *'}</span>
                                    </button>
                                    <input ref={el => { audioRefs.current[entry.id] = el; }} type="file" accept="audio/*" className="hidden"
                                        onChange={e => handleAudioChange(entry.id, e.target.files?.[0] ?? null)} />

                                    {/* Cover */}
                                    <button
                                        type="button"
                                        onClick={() => coverRefs.current[entry.id]?.click()}
                                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all hover:border-pink-400/50"
                                        style={{ background: 'rgba(255,0,200,0.04)', border: entry.coverFile ? '1px solid rgba(255,0,200,0.4)' : '1px dashed rgba(255,255,255,0.15)', color: entry.coverFile ? '#ff00c8' : 'rgba(255,255,255,0.4)' }}
                                    >
                                        <Image size={14} className="shrink-0" />
                                        <span className="truncate">{entry.coverFile ? entry.coverFile.name : 'Pick cover image (optional)'}</span>
                                    </button>
                                    <input ref={el => { coverRefs.current[entry.id] = el; }} type="file" accept="image/*" className="hidden"
                                        onChange={e => updateEntry(entry.id, { coverFile: e.target.files?.[0] ?? null })} />
                                </div>

                                {/* Metadata */}
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        placeholder="Song title *"
                                        value={entry.title}
                                        onChange={e => updateEntry(entry.id, { title: e.target.value })}
                                        className="col-span-2 px-3 py-2 rounded-xl text-sm focus:outline-none text-white"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                    <select
                                        value={entry.artistId}
                                        onChange={e => updateEntry(entry.id, { artistId: e.target.value })}
                                        className="px-3 py-2 rounded-xl text-sm focus:outline-none"
                                        style={{ background: '#151528', border: entry.artistId ? '1px solid rgba(0,245,255,0.3)' : '1px solid rgba(255,255,255,0.1)', color: entry.artistId ? '#fff' : 'rgba(255,255,255,0.4)' }}
                                    >
                                        <option value="">Select artist *</option>
                                        {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                    </select>
                                    <input
                                        placeholder="Genre"
                                        value={entry.genre}
                                        onChange={e => updateEntry(entry.id, { genre: e.target.value })}
                                        className="px-3 py-2 rounded-xl text-sm focus:outline-none text-white"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                    <input
                                        placeholder="Album"
                                        value={entry.album}
                                        onChange={e => updateEntry(entry.id, { album: e.target.value })}
                                        className="col-span-2 px-3 py-2 rounded-xl text-sm focus:outline-none text-white"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Add row */}
                        {entries.length < 20 && (
                            <button onClick={addEntry} className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:border-cyan-400/30"
                                style={{ border: '1px dashed rgba(0,245,255,0.2)', color: 'rgba(0,245,255,0.5)' }}>
                                <Plus size={16} /> Add Another Song
                            </button>
                        )}
                    </div>
                )}

                {/* Footer */}
                {!results && (
                    <div className="px-6 py-4 border-t flex items-center justify-between gap-4" style={{ borderColor: 'rgba(0,245,255,0.1)' }}>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {entries.filter(e => e.audioFile).length}/{entries.length} audio files selected
                            {hasCoverMismatch && <span className="text-yellow-400 ml-2">⚠ Some covers have no audio</span>}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                                style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={uploading || !entries.some(e => e.audioFile && e.artistId)}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg,#00f5ff,#ff00c8)', color: '#000' }}
                            >
                                {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload All</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
