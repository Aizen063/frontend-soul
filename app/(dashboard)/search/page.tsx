'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Play, Music } from 'lucide-react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/playerStore';
import { Song } from '@/types';
import api from '@/lib/api';

const GENRES = [
    { name: 'Electronic', color: '#1db954' },
    { name: 'Hip-Hop', color: '#e91e63' },
    { name: 'Synthwave', color: '#9c27b0' },
    { name: 'Metal', color: '#f44336' },
    { name: 'Ambient', color: '#00bcd4' },
    { name: 'Pop', color: '#ff9800' },
    { name: 'Jazz', color: '#3f51b5' },
    { name: 'Classical', color: '#607d8b' },
];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const setPlaylist = usePlayerStore(state => state.setPlaylist);
    const currentPlayingSong = usePlayerStore(state => state.currentSong);
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        setLoading(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await api.get('/api/songs', { params: { q: query, limit: 30 } });
                setResults(res.data.data || []);
            } catch { setResults([]); }
            finally { setLoading(false); }
        }, 400);
    }, [query]);

    const playSong = (index: number) => setPlaylist(results, index);

    return (
        <div className="space-y-8 pb-8">
            {/* Search Header */}
            <div>
                <h1 className="text-3xl font-bold mb-6 text-white">Search</h1>

                <div className="relative max-w-2xl">
                    <SearchIcon
                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: query ? '#1db954' : '#666' }}
                        size={20}
                    />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Songs, artists..."
                        className="w-full pl-12 pr-5 py-3 text-sm rounded-lg outline-none transition-all"
                        style={{
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            color: '#fff',
                        }}
                    />
                </div>
            </div>

            {/* Results */}
            {query ? (
                <div>
                    <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                        Results for &ldquo;{query}&rdquo;
                        {loading && (
                            <div className="w-4 h-4 border-2 border-[#333] border-t-[#1db954] rounded-full animate-spin" />
                        )}
                    </h2>

                    {results.length === 0 && !loading ? (
                        <div className="text-center py-16 rounded-xl" style={{ border: '1px dashed #333' }}>
                            <p className="text-[#666] text-sm">No tracks found for &ldquo;{query}&rdquo;</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {results.map((song, index) => {
                                const isCurrent = currentPlayingSong?._id === song._id;
                                const artistName = typeof song.artist === 'object' ? song.artist?.name : 'Unknown Artist';
                                return (
                                    <div
                                        key={song._id}
                                        onClick={() => playSong(index)}
                                        className="group cursor-pointer p-3 rounded-lg transition-all hover:bg-[#1a1a1a]"
                                    >
                                        <div className="aspect-square mb-3 relative overflow-hidden rounded-md bg-[#181818]">
                                            {song.coverImage ? (
                                                <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Music size={32} className="text-[#444]" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                                <button
                                                    onClick={e => { e.stopPropagation(); playSong(index); }}
                                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg"
                                                >
                                                    <Play size={20} fill="currentColor" className="ml-0.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <Link href={`/song/${song._id}`} onClick={e => e.stopPropagation()}>
                                            <h3 className={`text-sm font-medium truncate mb-0.5 ${isCurrent && isPlaying ? 'text-[#1db954]' : 'text-white'}`}>
                                                {song.title}
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-[#888] truncate">{artistName}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* Browse Genres grid */
                <div>
                    <h2 className="text-lg font-semibold mb-4 text-white">Browse Genres</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {GENRES.map(genre => (
                            <Link
                                key={genre.name}
                                href={`/tracks?genre=${encodeURIComponent(genre.name)}`}
                                className="group relative h-32 overflow-hidden rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                                style={{ background: genre.color }}
                            >
                                <div className="absolute inset-0 bg-black/20" />
                                <h3 className="absolute bottom-3 left-4 text-xl font-bold text-white z-10">
                                    {genre.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
