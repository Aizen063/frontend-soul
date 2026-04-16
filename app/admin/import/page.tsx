'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Download, RefreshCw, CheckCircle, AlertCircle,
    Loader2, Clock, Upload, Music, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '@/lib/api';
import { Artist } from '@/types';

/* ── types ── */
interface LogEntry { type: 'info' | 'error'; msg: string; }
interface Job { status: 'running' | 'done' | 'failed'; logs: LogEntry[]; startedAt: string; finishedAt?: string; }
interface DownloadEntry {
    filename: string; stem: string; coverFile: string | null;
    title: string; artist: string; album: string; genre: string;
    // local UI state
    artistId: string; artistName: string;
    status?: 'idle' | 'uploading' | 'success' | 'error'; errorMsg?: string;
}

const normalizeArtists = (input: unknown): Artist[] => {
    if (!Array.isArray(input)) return [];
    return input.filter((artist): artist is Artist => {
        if (!artist || typeof artist !== 'object') return false;
        const maybeArtist = artist as Partial<Artist>;
        return typeof maybeArtist._id === 'string' && maybeArtist._id.length > 0 && typeof maybeArtist.name === 'string';
    });
};

export default function AdminImportPage() {
    /* ── Source import (YouTube + Spotify track) ── */
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [jobId, setJobId] = useState<string | null>(null);
    const [job, setJob] = useState<Job | null>(null);
    const [importError, setImportError] = useState('');
    const [recentJobs, setRecentJobs] = useState<{ jobId: string; status: string; startedAt: string }[]>([]);
    const [showJobs, setShowJobs] = useState(false);
    const logRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    /* ── Downloads review ── */
    const [downloads, setDownloads] = useState<DownloadEntry[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<{ created: number; failed: number; errors: any[] } | null>(null);

    /* ── init ── */
    useEffect(() => {
        api.get('/api/admin/import').then(r => setRecentJobs(r.data.data || [])).catch(() => { });
        api.get('/api/artists').then(r => setArtists(normalizeArtists(r.data.data))).catch(() => { });
        refreshDownloads();
    }, []);

    /* ── auto-scroll logs ── */
    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [job?.logs.length]);

    /* ── poll active job ── */
    useEffect(() => {
        if (!jobId) return;
        const poll = async () => {
            try {
                const r = await api.get(`/api/admin/import/${jobId}`);
                setJob(r.data);
                if (r.data.status !== 'running') {
                    clearInterval(pollRef.current!);
                    api.get('/api/admin/import').then(res => setRecentJobs(res.data.data || [])).catch(() => { });
                    refreshDownloads(); // auto-refresh downloads when job finishes
                }
            } catch { }
        };
        poll();
        pollRef.current = setInterval(poll, 2000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [jobId]);

    const refreshDownloads = async () => {
        try {
            const r = await api.get('/api/admin/import/downloads');
            const artistList: Artist[] = artists.length
                ? artists
                : await api.get('/api/artists').then(a => {
                    const normalized = normalizeArtists(a.data.data);
                    setArtists(normalized);
                    return normalized;
                });

            setDownloads((r.data.data || []).map((d: DownloadEntry & { ext?: string }) => {
                // Auto-match parsed artist name to a DB artist
                const matched = artistList.find((a: Artist) =>
                    a.name.toLowerCase() === (d.artist || '').toLowerCase()
                );
                return { ...d, artistId: matched?._id || '', artistName: matched ? '' : (d.artist || ''), status: 'idle' as const };
            }));
        } catch { }
    };

    const handleClear = async () => {
        if (!confirm('Are you sure you want to clear all downloaded files from the server?')) return;
        try {
            await api.delete('/api/admin/import/downloads');
            setDownloads([]);
            setUploadResults(null);
        } catch { alert('Failed to clear downloads'); }
    };

    const startImport = async () => {
        if (!playlistUrl.trim()) return setImportError('Please enter a YouTube URL or Spotify link.');
        setImportError(''); setJob(null);
        try {
            const r = await api.post('/api/admin/import', { playlistUrl: playlistUrl.trim() });
            setJobId(r.data.jobId);
        } catch (e: any) { setImportError(e.response?.data?.message || 'Failed to start import.'); }
    };

    const updateEntry = (idx: number, patch: Partial<DownloadEntry>) =>
        setDownloads(prev => prev.map((d, i) => i === idx ? { ...d, ...patch } : d));

    /* ── bulk upload downloaded songs ── */
    const handleUploadAll = async () => {
        const valid = downloads.filter(d => (d.artistId || d.artistName?.trim()) && d.status !== 'success');
        if (!valid.length) return alert('Select or enter an artist for at least one song.');

        setUploading(true);
        setUploadResults(null);
        // mark as uploading
        setDownloads(prev => prev.map(d => (d.artistId || d.artistName?.trim()) ? { ...d, status: 'uploading' } : d));

        const payload = valid.map(d => ({
            filename: d.filename, coverFile: d.coverFile,
            title: d.title, artistId: d.artistId, artistName: d.artistName, album: d.album, genre: d.genre,
        }));

        try {
            const r = await api.post('/api/admin/import/upload-downloads', { songs: payload });
            const { errors = [] } = r.data;
            const errorMap: Record<string, string> = {};
            errors.forEach((e: { index: number; error: string }) => {
                const song = valid[e.index];
                if (song) errorMap[song.filename] = e.error;
            });

            setDownloads(prev => prev.map(d => {
                if (!(d.artistId || d.artistName?.trim())) return d;
                if (errorMap[d.filename]) return { ...d, status: 'error' as const, errorMsg: errorMap[d.filename] };
                return { ...d, status: 'success' as const };
            }));
            setUploadResults({ created: r.data.created, failed: r.data.failed, errors: r.data.errors });

            // Remove successfully uploaded songs after a short visual flash
            setTimeout(() => {
                setDownloads(prev => prev.filter(d => d.status !== 'success'));
            }, 1200);
        } catch (e: any) {
            setDownloads(prev => prev.map(d => d.status === 'uploading' ? { ...d, status: 'error', errorMsg: 'Upload failed' } : d));
        } finally { setUploading(false); }
    };

    const running = job?.status === 'running';
    const readySongs = downloads.filter(d => d.status !== 'success').length;
    const hasArtistReady = downloads.some(d => (d.artistId || d.artistName?.trim()) && d.status !== 'success');
    const logColor = (t: string) => t === 'error' ? '#ff6b6b' : '#a0e9a0';

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-bold text-white">Music Link Importer</h1>
                <p className="text-[#aaa] mt-1 text-sm">
                    Paste a YouTube playlist/video link or Spotify track/playlist link, then review and upload songs in bulk.
                </p>
            </div>

            {/* ── Step 1: Download ── */}
            <section className="rounded-2xl p-6 space-y-4" style={{ background: '#111', border: '1px solid #222' }}>
                <h2 className="text-sm font-bold tracking-widest text-[#aaa] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(29,185,84,0.2)', color: '#1db954' }}>1</span>
                    IMPORT FROM LINK
                </h2>
                <p className="text-xs text-amber-300/90">
                    This feature does not work on a Vercel-hosted backend because downloader access is blocked in serverless runtime. Use a local backend or a VPS/worker deployment for imports.
                </p>
                <div className="flex gap-3">
                    <input value={playlistUrl} onChange={e => setPlaylistUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !running && startImport()}
                        placeholder="YouTube playlist/video or Spotify track/playlist URL"
                        disabled={running}
                        className="flex-1 rounded-xl px-4 py-3 text-white text-sm focus:outline-none disabled:opacity-50 transition-colors"
                        style={{ background: '#0f0f0f', border: '1px solid #252525' }} />
                    <button onClick={startImport} disabled={running || !playlistUrl.trim()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        style={{ background: running ? 'rgba(255,255,255,0.05)' : '#1db954', color: '#000' }}>
                        {running
                            ? <><Loader2 size={15} className="animate-spin text-white" /><span className="text-white">Downloading…</span></>
                            : <><Download size={15} /> Download Playlist</>}
                    </button>
                </div>
                {importError && <p className="text-red-400 text-sm">{importError}</p>}

                {/* Live log */}
                {job && (
                    <div className="rounded-xl overflow-hidden border"
                        style={{ borderColor: running ? 'rgba(29,185,84,0.25)' : job.status === 'done' ? 'rgba(57,255,20,0.25)' : 'rgba(255,80,80,0.25)' }}>
                        <div className="flex items-center justify-between px-4 py-2 bg-black/40">
                            <div className="flex items-center gap-2 text-xs">
                                {running && <Loader2 size={12} className="animate-spin text-[#1db954]" />}
                                {job.status === 'done' && <CheckCircle size={12} className="text-green-400" />}
                                {job.status === 'failed' && <AlertCircle size={12} className="text-red-400" />}
                                <span className="text-slate-300 font-mono">
                                    {running ? 'Downloading…' : job.status === 'done' ? 'Download complete ✓' : 'Download failed ✗'}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock size={10} />{new Date(job.startedAt).toLocaleTimeString()}
                            </span>
                        </div>
                        <div ref={logRef} className="h-48 overflow-y-auto p-3 font-mono text-xs space-y-0.5" style={{ background: '#08080f' }}>
                            {job.logs.map((l, i) => <div key={i} style={{ color: logColor(l.type) }}>{l.msg}</div>)}
                            {running && <div className="text-[#1db954] flex items-center gap-1 mt-1"><Loader2 size={10} className="animate-spin" />processing…</div>}
                        </div>
                    </div>
                )}

                {/* Recent jobs collapsible */}
                {recentJobs.length > 0 && (
                    <div>
                        <button onClick={() => setShowJobs(v => !v)} className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-300 transition-colors">
                            {showJobs ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {recentJobs.length} recent job{recentJobs.length > 1 ? 's' : ''}
                        </button>
                        {showJobs && (
                            <div className="mt-2 rounded-xl border border-slate-700 overflow-hidden divide-y divide-slate-700/50">
                                {recentJobs.map(j => (
                                    <button key={j.jobId} onClick={() => { setJobId(j.jobId); api.get(`/api/admin/import/${j.jobId}`).then(r => setJob(r.data)).catch(() => { }); }}
                                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left hover:bg-slate-700/30 transition-colors">
                                        <div className="flex items-center gap-2">
                                            {j.status === 'running' && <Loader2 size={10} className="animate-spin text-[#1db954]" />}
                                            {j.status === 'done' && <CheckCircle size={10} className="text-green-400" />}
                                            {j.status === 'failed' && <AlertCircle size={10} className="text-red-400" />}
                                            <span className="text-slate-300 font-mono">{j.jobId}</span>
                                        </div>
                                        <span className="text-slate-500">{new Date(j.startedAt).toLocaleString()}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* ── Step 2: Review & Upload ── */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold tracking-widest text-[#aaa] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(29,185,84,0.2)', color: '#1db954' }}>2</span>
                        REVIEW & UPLOAD TO DATABASE
                        {downloads.length > 0 && <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(29,185,84,0.2)', color: '#1db954' }}>{readySongs} ready</span>}
                    </h2>
                    <div className="flex items-center gap-2">
                        {downloads.length > 0 && (
                            <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/20 transition-all">
                                <Trash2 size={12} /> Clear All
                            </button>
                        )}
                        <button onClick={refreshDownloads} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                            <RefreshCw size={12} /> Refresh
                        </button>
                    </div>
                </div>

                {downloads.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-12 text-center" style={{ background: '#111', borderColor: '#2b2b2b' }}>
                        <Music size={32} className="mx-auto mb-3 text-slate-600" />
                        <p className="text-slate-500 text-sm">No songs in downloads folder yet.</p>
                        <p className="text-slate-600 text-xs mt-1">Download a playlist above to get started.</p>
                    </div>
                ) : (
                    <>
                        {/* Upload result summary */}
                        {uploadResults && (
                            <div className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <span className="text-green-400 text-sm font-semibold flex items-center gap-1.5"><CheckCircle size={14} />{uploadResults.created} uploaded</span>
                                {uploadResults.failed > 0 && <span className="text-red-400 text-sm font-semibold flex items-center gap-1.5"><AlertCircle size={14} />{uploadResults.failed} failed</span>}
                            </div>
                        )}

                        {/* Song rows */}
                        <div className="space-y-2">
                            {downloads.map((d, idx) => (
                                <div key={d.filename} className="rounded-xl overflow-hidden transition-all"
                                    style={{
                                        background: d.status === 'success' ? 'rgba(57,255,20,0.04)' : d.status === 'error' ? 'rgba(255,80,80,0.04)' : 'rgba(255,255,255,0.03)',
                                        border: d.status === 'success' ? '1px solid rgba(57,255,20,0.2)' : d.status === 'error' ? '1px solid rgba(255,80,80,0.2)' : '1px solid rgba(255,255,255,0.07)',
                                    }}>
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        {/* Status icon */}
                                        <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            {d.status === 'uploading' && <Loader2 size={14} className="animate-spin text-[#1db954]" />}
                                            {d.status === 'success' && <CheckCircle size={14} className="text-green-400" />}
                                            {d.status === 'error' && <AlertCircle size={14} className="text-red-400" />}
                                            {(d.status === 'idle' || !d.status) && <Music size={14} className="text-slate-500" />}
                                        </div>

                                        {/* Cover / format badges */}
                                        <div className="w-10 h-10 rounded-lg shrink-0 bg-slate-800 flex flex-col items-center justify-center gap-0.5">
                                            {d.coverFile
                                                ? <span className="text-[9px] font-bold px-1 rounded" style={{ background: 'rgba(57,255,20,0.15)', color: '#39ff14' }}>IMG</span>
                                                : <Music size={12} className="text-slate-600" />}
                                            <span className="text-[8px] font-mono uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                                {(d as any).ext || 'mp3'}
                                            </span>
                                        </div>

                                        {/* Filename */}
                                        <div className="flex-1 min-w-0">
                                            <input value={d.title}
                                                onChange={e => updateEntry(idx, { title: e.target.value })}
                                                className="w-full bg-transparent text-sm text-white font-medium focus:outline-none border-b border-transparent focus:border-slate-600 transition-colors truncate"
                                                placeholder="Song title" />
                                            <p className="text-xs text-slate-600 truncate mt-0.5">{d.filename}</p>
                                            {d.errorMsg && <p className="text-xs text-red-400 mt-0.5">{d.errorMsg}</p>}
                                        </div>

                                        {/* Artist — existing or new */}
                                        <div className="flex flex-col gap-1 min-w-[140px]">
                                            <select value={d.artistId} onChange={e => updateEntry(idx, { artistId: e.target.value, artistName: '' })}
                                                className="bg-slate-900 border rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                                style={{ borderColor: d.artistId ? 'rgba(29,185,84,0.4)' : 'rgba(255,255,255,0.12)' }}>
                                                <option value="">— Add New —</option>
                                                {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                            </select>
                                            {!d.artistId && (
                                                <input
                                                    value={d.artistName || ''}
                                                    onChange={e => updateEntry(idx, { artistName: e.target.value })}
                                                    placeholder="Type artist name…"
                                                    className="bg-slate-900 border rounded-lg px-2 py-1.5 text-xs text-[#b6f5cc] focus:outline-none transition-colors"
                                                    style={{ borderColor: d.artistName?.trim() ? 'rgba(29,185,84,0.5)' : 'rgba(255,255,255,0.08)' }}
                                                />
                                            )}
                                        </div>

                                        {/* Genre */}
                                        <input value={d.genre} onChange={e => updateEntry(idx, { genre: e.target.value })}
                                            placeholder="Genre"
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white w-24 focus:outline-none focus:border-cyan-500 transition-colors" />

                                        {/* Album */}
                                        <input value={d.album} onChange={e => updateEntry(idx, { album: e.target.value })}
                                            placeholder="Album"
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white w-28 focus:outline-none focus:border-cyan-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Upload all button */}
                        {readySongs > 0 && (
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-xs text-slate-500">
                                    {downloads.filter(d => (d.artistId || d.artistName?.trim()) && d.status !== 'success').length} of {readySongs} songs have artist assigned
                                </p>
                                <button onClick={handleUploadAll} disabled={uploading || !hasArtistReady}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    style={{ background: '#1db954', color: '#000' }}>
                                    {uploading
                                        ? <><Loader2 size={15} className="animate-spin" />Uploading…</>
                                        : <><Upload size={15} />Upload All to Database</>}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
