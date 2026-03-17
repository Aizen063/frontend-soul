'use client';

import { useEffect, useState } from 'react';
import { Play, Music, Mic2, ListMusic, Heart } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Song } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';

const normalizeSongs = (input: unknown): Song[] => {
    if (!Array.isArray(input)) return [];
    return input.filter((song): song is Song => {
        if (!song || typeof song !== 'object') return false;
        const candidate = song as Partial<Song>;
        return typeof candidate._id === 'string' && candidate._id.length > 0;
    });
};

export default function HomePage() {
    const [recentSongs, setRecentSongs] = useState<Song[]>([]);
    const [historySongs, setHistorySongs] = useState<Song[]>([]);
    const [stats, setStats] = useState({ songs: 0, artists: 0, playlists: 0, liked: 0 });
    const [loading, setLoading] = useState(true);
    const setPlaylist = usePlayerStore(state => state.setPlaylist);
    const { user } = useAuthStore();
    const currentPlayingSong = usePlayerStore(state => state.currentSong);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const [songsRes, artistsRes, playlistsRes, historyRes] = await Promise.all([
                api.get('/api/songs?limit=10'),
                api.get('/api/artists?limit=1'),
                api.get('/api/playlists'),
                api.get('/api/users/history')
            ]);

            const recent = normalizeSongs(songsRes.data.data);
            const history = normalizeSongs((historyRes.data?.data || []).map((h: any) => h?.song));

            setRecentSongs(recent);
            setHistorySongs(history);
            setStats({
                songs: songsRes.data.total || songsRes.data.count || 0,
                artists: artistsRes.data.total || artistsRes.data.count || 0,
                playlists: playlistsRes.data.count || (playlistsRes.data.data ? playlistsRes.data.data.length : 0),
                liked: user?.likedSongs?.length || 0
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const playSong = (index: number) => setPlaylist(recentSongs, index);
    const playHistorySong = (index: number) => setPlaylist(historySongs, index);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: 'Total Tracks', value: stats.songs, icon: Music },
        { label: 'Artists', value: stats.artists, icon: Mic2 },
        { label: 'Playlists', value: stats.playlists, icon: ListMusic },
        { label: 'Liked Songs', value: stats.liked, icon: Heart },
    ];

    const SongCard = ({ song, index, onPlay }: { song: Song; index: number; onPlay: (i: number) => void }) => {
        const isCurrent = currentPlayingSong?._id === song._id;
        return (
            <div
                onClick={() => onPlay(index)}
                className="group cursor-pointer p-2 md:p-4 rounded-md md:rounded-xl transition-all duration-200 flex items-center gap-3 md:block border-b border-[#1f1f1f] md:border-b-0"
                style={{
                    background: isCurrent ? 'rgba(29,185,84,0.08)' : 'transparent',
                    border: isCurrent ? '1px solid rgba(29,185,84,0.35)' : '1px solid transparent'
                }}
            >
                <div className="w-12 h-12 md:w-auto md:h-auto md:aspect-square mb-0 md:mb-4 rounded-md md:rounded-lg overflow-hidden relative bg-[#181818] shrink-0">
                    {song.coverImage ? (
                        <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music size={18} className="text-[#555] md:w-6 md:h-6" />
                        </div>
                    )}
                    <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                        <button
                            onClick={e => { e.stopPropagation(); onPlay(index); }}
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1db954] hover:bg-[#1ed760] transition-colors shadow-lg"
                        >
                            <Play size={20} fill="black" className="text-black ml-0.5" />
                        </button>
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <Link href={`/song/${song._id}`} onClick={e => e.stopPropagation()}>
                        <h3 className="font-semibold text-white truncate text-sm md:text-sm mb-0 md:mb-1 md:hover:underline">{song.title}</h3>
                    </Link>
                    <p className="text-xs text-[#888] md:text-[#aaa] truncate">
                        {typeof song.artist === 'object' ? song.artist?.name : song.artist || 'Unknown Artist'}
                    </p>
                </div>
                <button
                    onClick={e => { e.stopPropagation(); onPlay(index); }}
                    className="md:hidden w-8 h-8 rounded-full flex items-center justify-center bg-[#1db954] text-black shrink-0"
                    aria-label={`Play ${song.title}`}
                >
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-8 animate-fade-in">
            {/* Hero */}
            <div className="relative p-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)', border: '1px solid #222' }}>
                <h1 className="text-3xl font-bold text-white mb-1">
                    Welcome back, <span className="text-[#1db954]">{user?.name}</span>
                </h1>
                <p className="text-[#aaa]">Your dashboard is ready.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="p-5 rounded-xl" style={{ background: '#111', border: '1px solid #222' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(29,185,84,0.12)' }}>
                                    <Icon size={20} className="text-[#1db954]" />
                                </div>
                                <span className="text-[#aaa] text-sm">{stat.label}</span>
                            </div>
                            <div className="text-3xl font-bold text-white ml-1">{stat.value}</div>
                        </div>
                    );
                })}
            </div>

            {/* Jump Back In */}
            {historySongs.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-1 h-6 rounded-sm bg-[#1db954]" />
                        <h2 className="text-xl font-bold text-white">Jump Back In</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 md:gap-4">
                        {historySongs.map((song, index) => (
                            <SongCard key={`history-${song._id}-${index}`} song={song} index={index} onPlay={playHistorySong} />
                        ))}
                    </div>
                </section>
            )}

            {/* Recently Added */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <span className="w-1 h-6 rounded-sm bg-[#1db954]" />
                        <h2 className="text-xl font-bold text-white">Recently Added</h2>
                    </div>
                    <Link href="/tracks" className="text-sm text-[#aaa] hover:text-white transition-colors">View all →</Link>
                </div>
                {recentSongs.length === 0 ? (
                    <div className="text-center py-16 rounded-xl" style={{ border: '1px dashed #333', background: '#111' }}>
                        <p className="text-[#888]">No tracks in the system yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 md:gap-4">
                        {recentSongs.map((song, index) => (
                            <SongCard key={song._id} song={song} index={index} onPlay={playSong} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

