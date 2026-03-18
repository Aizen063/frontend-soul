'use client';

import { useEffect, useMemo, useState } from 'react';
import { Disc3, Music, Play, Search } from 'lucide-react';
import api from '@/lib/api';
import { Song } from '@/types';
import { usePlayerStore } from '@/store/playerStore';

type AlbumGroup = {
    name: string;
    songs: Song[];
};

const normalizeSongs = (input: unknown): Song[] => {
    if (!Array.isArray(input)) return [];
    return input.filter((song): song is Song => {
        if (!song || typeof song !== 'object') return false;
        const candidate = song as Partial<Song>;
        return typeof candidate._id === 'string' && candidate._id.length > 0;
    });
};

const normalizeAlbum = (album?: string): string => {
    if (!album || !album.trim() || album === 'Unknown Album') return 'Singles & Unknown';
    return album.trim();
};

export default function AlbumsPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const setPlaylist = usePlayerStore((state) => state.setPlaylist);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const res = await api.get('/api/songs');
                setSongs(normalizeSongs(res.data?.data));
            } catch (error) {
                console.error('Failed to fetch songs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    const albumGroups = useMemo<AlbumGroup[]>(() => {
        const grouped = new Map<string, Song[]>();

        for (const song of songs) {
            const albumName = normalizeAlbum(song.album);
            if (!grouped.has(albumName)) {
                grouped.set(albumName, []);
            }
            grouped.get(albumName)?.push(song);
        }

        const groups = Array.from(grouped.entries()).map(([name, list]) => ({
            name,
            songs: [...list].sort((left, right) => left.title.localeCompare(right.title)),
        }));

        return groups.sort((left, right) => {
            if (left.name === 'Singles & Unknown') return 1;
            if (right.name === 'Singles & Unknown') return -1;
            return left.name.localeCompare(right.name);
        });
    }, [songs]);

    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return albumGroups;
        const q = searchQuery.toLowerCase();

        return albumGroups
            .map((group) => ({
                ...group,
                songs: group.songs.filter((song) => {
                    const artistName = typeof song.artist === 'object' ? song.artist?.name || '' : song.artist || '';
                    return (
                        group.name.toLowerCase().includes(q)
                        || song.title.toLowerCase().includes(q)
                        || artistName.toLowerCase().includes(q)
                    );
                }),
            }))
            .filter((group) => group.songs.length > 0 || group.name.toLowerCase().includes(q));
    }, [albumGroups, searchQuery]);

    const playAlbum = (group: AlbumGroup, index = 0) => {
        if (!group.songs.length) return;
        setPlaylist(group.songs, Math.min(index, group.songs.length - 1));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="w-1 h-7 rounded-sm bg-[#1db954]" />
                    Albums
                    <span className="text-[#888] text-sm font-normal">({filteredGroups.length})</span>
                </h1>
            </div>

            <div className="relative max-w-xl">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]" />
                <input
                    type="text"
                    placeholder="Search albums, songs, or artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 outline-none text-sm rounded-xl bg-[#111] text-white placeholder-[#666] border border-[#222] focus:border-[#1db954] transition-colors"
                />
            </div>

            {filteredGroups.length === 0 ? (
                <div className="text-center py-20 rounded-xl" style={{ border: '1px dashed #333', background: '#111' }}>
                    <Disc3 size={48} className="mx-auto mb-4 text-[#555]" />
                    <p className="text-[#888]">No albums matched your search.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredGroups.map((group) => (
                        <section
                            key={group.name}
                            className="rounded-xl p-4 md:p-5"
                            style={{ background: '#111', border: '1px solid #222' }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">{group.name}</h2>
                                    <p className="text-xs text-[#888]">{group.songs.length} track{group.songs.length !== 1 ? 's' : ''}</p>
                                </div>
                                <button
                                    onClick={() => playAlbum(group, 0)}
                                    disabled={!group.songs.length}
                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1db954] text-black disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label={`Play album ${group.name}`}
                                >
                                    <Play size={14} fill="currentColor" className="ml-0.5" />
                                </button>
                            </div>

                            {group.songs.length === 0 ? (
                                <p className="text-xs text-[#777]">No tracks in this album for current search.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {group.songs.map((song, index) => {
                                        const artistName = typeof song.artist === 'object' ? song.artist?.name || 'Unknown Artist' : song.artist || 'Unknown Artist';
                                        return (
                                            <button
                                                key={song._id}
                                                onClick={() => playAlbum(group, index)}
                                                className="w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 hover:bg-[#1a1a1a]"
                                            >
                                                <span className="text-xs text-[#666] w-5 text-right">{index + 1}</span>
                                                <span className="text-sm text-white truncate flex-1">{song.title}</span>
                                                <span className="text-xs text-[#888] truncate max-w-[45%]">{artistName}</span>
                                                {!song.coverImage && <Music size={14} className="text-[#666]" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
