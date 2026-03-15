'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, ArrowLeft, Music } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Song, Artist } from '@/types';
import { usePlayerStore } from '@/store/playerStore';

export default function ArtistPage() {
    const params = useParams();
    const router = useRouter();
    const artistId = typeof params.id === 'string' ? params.id : null;

    const [artist, setArtist] = useState<Artist | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const setPlaylist = usePlayerStore(state => state.setPlaylist);

    useEffect(() => {
        if (artistId) fetchArtistData();
    }, [artistId]);

    const fetchArtistData = async () => {
        try {
            const res = await api.get(`/api/artists/${artistId}/songs`);
            setArtist(res.data.artist);
            setSongs(res.data.data);
        } catch (error) {
            console.error('Failed to fetch artist data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-[#333] border-t-[#1db954] rounded-full animate-spin" />
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-[#666]">Artist not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative pb-8">
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-20 p-2 rounded-full transition-all bg-black/50 hover:bg-black/70 text-white"
                aria-label="Go back"
            >
                <ArrowLeft size={20} />
            </button>

            {/* Artist Hero */}
            <div className="relative overflow-hidden rounded-b-2xl">
                <div className="absolute inset-0 z-0">
                    {artist.photo ? (
                        <div className="w-full h-full">
                            <img src={artist.photo} alt="" className="w-full h-full object-cover opacity-25 blur-2xl scale-110" />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, #070707)' }} />
                        </div>
                    ) : (
                        <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(29,185,84,0.1), rgba(0,0,0,0.3))' }} />
                    )}
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-end gap-8 p-8 md:p-12 pt-32">
                    <div className="w-48 h-48 md:w-56 md:h-56 overflow-hidden shrink-0 rounded-full border-2 border-white/10 shadow-lg">
                        {artist.photo ? (
                            <img src={artist.photo} alt={artist.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl font-bold bg-[#181818] text-[#444]">
                                {artist.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter">
                            {artist.name}
                        </h1>
                        {artist.bio && (
                            <p className="max-w-3xl text-sm leading-relaxed p-4 rounded-xl text-[#ccc]"
                                style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #1db954' }}>
                                {artist.bio}
                            </p>
                        )}
                        {songs.length > 0 && (
                            <button
                                onClick={() => setPlaylist(songs, 0)}
                                className="mt-5 flex items-center gap-2 px-7 py-3 font-semibold rounded-full text-sm bg-[#1db954] text-black hover:bg-[#1ed760] transition-colors"
                            >
                                <Play size={18} fill="black" />
                                Play All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Songs Grid */}
            <section className="px-4">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-white">Popular Releases</h2>
                    <span className="text-xs px-3 py-1 rounded-full text-[#888]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #222' }}>
                        {songs.length} tracks
                    </span>
                </div>

                {songs.length === 0 ? (
                    <div className="p-10 text-center rounded-xl text-[#666] text-sm" style={{ border: '1px dashed #333' }}>
                        No songs by this artist yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {songs.map((song, index) => (
                            <div
                                key={song._id}
                                onClick={() => setPlaylist(songs, index)}
                                className="group p-3 rounded-lg cursor-pointer transition-all hover:bg-[#1a1a1a]"
                            >
                                <div className="aspect-square mb-3 flex items-center justify-center relative overflow-hidden rounded-md bg-[#181818]">
                                    {song.coverImage ? (
                                        <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Music size={32} className="text-[#444]" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                        <button onClick={(e) => { e.stopPropagation(); setPlaylist(songs, index); }}
                                            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg">
                                            <Play size={20} fill="currentColor" className="ml-0.5" />
                                        </button>
                                    </div>
                                </div>

                                <Link href={`/song/${song._id}`} onClick={e => e.stopPropagation()}>
                                    <h3 className="text-sm font-medium truncate mb-0.5 text-white">{song.title}</h3>
                                </Link>
                                <p className="text-xs text-[#888] truncate">{artist.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
