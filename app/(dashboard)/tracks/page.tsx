'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play, Search, Music } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Song } from '@/types';
import { usePlayerStore } from '@/store/playerStore';

export default function TracksPage() {
    const ITEMS_PER_PAGE = 10;
    const searchParams = useSearchParams();
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState(() => searchParams.get('genre') || 'All');
    const [currentPage, setCurrentPage] = useState(1);
    const setPlaylist = usePlayerStore(state => state.setPlaylist);
    const currentPlayingSong = usePlayerStore(state => state.currentSong);

    useEffect(() => { fetchSongs(); }, []);

    const fetchSongs = async () => {
        try {
            const res = await api.get('/api/songs');
            setSongs(res.data.data);
        } catch (error) {
            console.error('Failed to fetch songs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique genres
    const genres = useMemo(() => {
        const genreSet = new Set<string>();
        songs.forEach(s => { if (s.genre && s.genre !== 'Unknown Genre') genreSet.add(s.genre); });
        return ['All', ...Array.from(genreSet).sort()];
    }, [songs]);

    // Filter songs by search + genre
    const filteredSongs = useMemo(() => {
        return songs.filter(song => {
            const matchesSearch = !searchQuery ||
                song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (typeof song.artist === 'object' && song.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesGenre = selectedGenre === 'All' || song.genre === selectedGenre;
            return matchesSearch && matchesGenre;
        });
    }, [songs, searchQuery, selectedGenre]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedGenre]);

    const totalPages = Math.max(1, Math.ceil(filteredSongs.length / ITEMS_PER_PAGE));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedSongs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSongs.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredSongs, currentPage]);

    const playSong = (index: number) => setPlaylist(filteredSongs, index);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="w-1 h-7 rounded-sm bg-[#1db954]" />
                    All Tracks
                    <span className="text-[#888] text-sm font-normal">({filteredSongs.length})</span>
                </h1>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]" />
                    <input
                        type="text"
                        placeholder="Search songs or artists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 outline-none text-sm rounded-xl bg-[#111] text-white placeholder-[#666] border border-[#222] focus:border-[#1db954] transition-colors"
                    />
                </div>
                {genres.length > 2 && (
                    <div className="flex gap-2 flex-wrap">
                        {genres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className="px-4 py-2 text-xs font-medium rounded-full transition-all duration-200"
                                style={{
                                    background: selectedGenre === genre ? '#1db954' : '#181818',
                                    color: selectedGenre === genre ? '#000' : '#aaa',
                                    border: selectedGenre === genre ? 'none' : '1px solid #333',
                                }}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Songs Grid */}
            {filteredSongs.length === 0 ? (
                <div className="text-center py-20 rounded-xl" style={{ border: '1px dashed #333', background: '#111' }}>
                    <Music size={48} className="mx-auto mb-4 text-[#555]" />
                    <p className="text-[#888]">
                        {searchQuery || selectedGenre !== 'All' ? 'No tracks match your search.' : 'No tracks in the system yet.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 md:gap-4">
                        {paginatedSongs.map((song, index) => {
                            const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                        const isCurrent = currentPlayingSong?._id === song._id;
                        return (
                            <div
                                key={song._id}
                                onClick={() => playSong(absoluteIndex)}
                                className="group cursor-pointer p-2 md:p-4 rounded-md md:rounded-xl transition-all duration-200 flex items-center gap-3 md:block md:hover:bg-[#1a1a1a] border-b border-[#1f1f1f] md:border-b-0"
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
                                            onClick={e => { e.stopPropagation(); playSong(absoluteIndex); }}
                                            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1db954] hover:bg-[#1ed760] transition-colors shadow-lg"
                                        >
                                            <Play size={20} fill="black" className="text-black ml-0.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <Link href={`/song/${song._id}`} onClick={e => e.stopPropagation()}>
                                        <h3 className="font-semibold text-white truncate text-sm mb-0 md:mb-1 md:hover:underline">{song.title}</h3>
                                    </Link>
                                    <p className="text-xs text-[#888] md:text-[#aaa] truncate">
                                        {typeof song.artist === 'object' ? song.artist?.name : song.artist || 'Unknown Artist'}
                                    </p>
                                </div>
                                <button
                                    onClick={e => { e.stopPropagation(); playSong(absoluteIndex); }}
                                    className="md:hidden w-8 h-8 rounded-full flex items-center justify-center bg-[#1db954] text-black shrink-0"
                                    aria-label={`Play ${song.title}`}
                                >
                                    <Play size={14} fill="currentColor" className="ml-0.5" />
                                </button>
                            </div>
                        );
                        })}
                    </div>

                    {filteredSongs.length > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-center gap-2 pt-3">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-xs rounded-md border border-[#2a2a2a] text-[#bbb] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className="w-8 h-8 text-xs rounded-md border transition-colors"
                                    style={{
                                        borderColor: currentPage === page ? '#1db954' : '#2a2a2a',
                                        background: currentPage === page ? 'rgba(29,185,84,0.15)' : 'transparent',
                                        color: currentPage === page ? '#1db954' : '#bbb'
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-xs rounded-md border border-[#2a2a2a] text-[#bbb] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
