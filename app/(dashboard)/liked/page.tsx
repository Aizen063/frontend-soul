'use client';

import { useEffect, useState } from 'react';
import { Heart, Play, Trash2, Music } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { Song, getArtistName } from '@/types';

export default function LikedSongsPage() {
    const { user } = useAuthStore();
    const setPlaylist = usePlayerStore((s) => s.setPlaylist);
    const currentPlayingSong = usePlayerStore(state => state.currentSong);

    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [unliking, setUnliking] = useState<string | null>(null);

    const artistLabel = (song: Song) => {
        const name = getArtistName(song.artist);
        // Avoid showing raw ObjectId-like artist strings in UI.
        if (/^[a-f0-9]{24}$/i.test(name)) return song.genre || 'Unknown Artist';
        return name;
    };

    useEffect(() => {
        if (user) fetchLikedSongs();
    }, [user]);

    const fetchLikedSongs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/users/liked');
            setSongs(res.data.data || []);
        } catch (e) {
            console.error('Failed to fetch liked songs', e);
        } finally {
            setLoading(false);
        }
    };

    const unlike = async (songId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || unliking === songId) return;
        setUnliking(songId);
        try {
            await api.put(`/api/users/like/${songId}`);
            setSongs((prev) => prev.filter((s) => s._id !== songId));
        } catch (e) {
            console.error('Failed to unlike song', e);
        } finally {
            setUnliking(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div
                    style={{
                        width: '32px', height: '32px',
                        border: '2px solid rgba(0,245,255,0.2)',
                        borderTopColor: 'var(--neon-blue)',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 animate-fade-in">
            {/* Hero Header */}
            <div className="relative p-5 md:p-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a, #111)', border: '1px solid #222' }}>
                <div className="flex items-center md:items-end gap-4 md:gap-6">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#1db954]">
                        <Heart size={34} className="text-white md:w-11 md:h-11" fill="white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Liked Songs</h1>
                        <p className="text-[#aaa] text-sm mt-1">{songs.length} song{songs.length !== 1 ? 's' : ''}</p>
                        {songs.length > 0 && (
                            <button
                                onClick={() => setPlaylist(songs, 0)}
                                className="flex items-center gap-2 px-5 py-2.5 mt-3 md:mt-4 font-bold rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black transition-all text-sm"
                            >
                                <Play size={16} fill="black" />
                                Play All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Songs list */}
            {songs.length === 0 ? (
                <div className="text-center py-24 rounded-xl" style={{ border: '1px dashed #333', background: '#111' }}>
                    <Heart size={48} className="mx-auto mb-4 text-[#555]" />
                    <h3 className="text-white font-bold text-lg mb-2">No liked songs yet</h3>
                    <p className="text-[#888]">Songs you like will appear here</p>
                </div>
            ) : (
                <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid #222' }}>
                    {songs.map((song, i) => (
                        <div
                            key={song._id}
                            onClick={() => setPlaylist(songs, i)}
                            className="grid grid-cols-[22px_1fr_auto] md:grid-cols-[32px_1.2fr_1fr_auto] gap-3 md:gap-4 px-3 md:px-5 py-3 md:py-3.5 items-center cursor-pointer group hover:bg-[#1a1a1a] transition-colors"
                            style={{ borderBottom: i < songs.length - 1 ? '1px solid #1a1a1a' : 'none' }}
                        >
                            <span className="text-sm text-center text-[#888] group-hover:hidden">{i + 1}</span>
                            <Play size={14} className="hidden group-hover:block text-[#1db954]" fill="currentColor" />

                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#222]">
                                    {song.coverImage ? (
                                        <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Music size={16} className="text-[#666]" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white font-medium truncate text-sm">{song.title}</p>
                                    <p className="text-xs text-[#888] truncate">{artistLabel(song)}</p>
                                </div>
                            </div>

                            <span className="hidden md:block text-sm text-[#888] truncate">{artistLabel(song)}</span>

                            <button
                                onClick={(e) => unlike(song._id, e)}
                                disabled={unliking === song._id}
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-lg transition-all disabled:opacity-50 text-[#1db954] hover:text-red-400"
                                title="Remove from liked songs"
                            >
                                {unliking === song._id ? (
                                    <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Heart size={15} fill="currentColor" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
