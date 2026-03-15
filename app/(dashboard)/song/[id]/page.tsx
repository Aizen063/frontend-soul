'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Play, Heart, Plus, Music2, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Song, Artist } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';

interface Playlist {
    _id: string;
    name: string;
    user: string;
    songs: string[];
}

export default function SongPage() {
    const params = useParams();
    const songId = typeof params.id === 'string' ? params.id : null;
    const { user } = useAuthStore();

    const [song, setSong] = useState<Song | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    const [viewMode, setViewMode] = useState<'audio' | 'video'>('audio');
    const { isPlaying, setIsPlaying, currentSong, setPlaylist } = usePlayerStore();

    useEffect(() => {
        if (songId) {
            fetchSongData();
            if (user) {
                checkIfLiked();
                fetchPlaylists();
            }
        }
    }, [songId, user]);

    const fetchSongData = async () => {
        try {
            const songRes = await api.get(`/api/songs/${songId}`);
            setSong(songRes.data.data);
        } catch (error) {
            console.error('Failed to fetch song:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkIfLiked = async () => {
        try {
            const res = await api.get('/api/users/liked');
            const liked = res.data.data.some((s: any) => s._id === songId);
            setIsLiked(liked);
        } catch (error) {
            console.error('Failed to check liked status:', error);
        }
    };

    const fetchPlaylists = async () => {
        try {
            const res = await api.get('/api/playlists');
            setPlaylists(res.data.data);
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
        }
    };

    const toggleLike = async () => {
        if (!user || !songId) return;
        try {
            const res = await api.put(`/api/users/like/${songId}`);
            setIsLiked(res.data.liked);
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const addToPlaylist = async (playlistId: string) => {
        try {
            await api.post(`/api/playlists/${playlistId}/add/${songId}`);
            setShowPlaylistModal(false);
            alert('Added to playlist!');
        } catch (error) {
            console.error('Failed to add to playlist:', error);
            alert('Failed to add to playlist');
        }
    };

    const createPlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        try {
            const res = await api.post('/api/playlists', { name: newPlaylistName });
            const newPlaylist = res.data.data;
            setPlaylists([...playlists, newPlaylist]);
            setNewPlaylistName('');
            addToPlaylist(newPlaylist._id);
        } catch (error) {
            console.error('Failed to create playlist:', error);
        }
    };

    if (loading || !song) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleViewModeChange = (mode: 'audio' | 'video') => {
        setViewMode(mode);
        if (mode === 'video') {
            setIsPlaying(false);
        }
    };

    const handlePlayAudio = () => {
        setViewMode('audio');
        setPlaylist([song!], 0);
    };

    return (
        <div className="space-y-8 pb-24 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-10 items-start pt-6">
                {/* Cover Art */}
                <div className="w-full md:w-5/12 aspect-square relative overflow-hidden rounded-xl group" style={{ background: '#181818', border: '1px solid #222' }}>
                    {viewMode === 'video' && song.videoUrl ? (
                        <iframe
                            src={song.videoUrl.replace('watch?v=', 'embed/')}
                            title="Music Video"
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    ) : (
                        <>
                            {song.coverImage ? (
                                <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#181818]">
                                    <Music2 size={80} className="text-[#444]" />
                                </div>
                            )}
                            <button
                                onClick={handlePlayAudio}
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50"
                            >
                                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#1db954] hover:bg-[#1ed760] hover:scale-110 transition-all shadow-lg">
                                    <Play size={32} fill="white" className="text-white ml-1" />
                                </div>
                            </button>
                        </>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wide mb-5 rounded-full border border-[#333] bg-[#181818] text-[#1db954]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-pulse" />
                        Now Playing
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{song.title}</h1>

                    <div className="flex items-center gap-2 text-xl mb-8">
                        <span className="text-[#888]">by</span>
                        <Link
                            href={`/artist/${typeof song.artist === 'object' ? song.artist._id : song.artist}`}
                            className="text-white hover:text-[#1db954] transition-colors hover:underline"
                        >
                            {typeof song.artist === 'object' ? song.artist.name : song.artist}
                        </Link>
                    </div>

                    {/* Format Toggle */}
                    {song.videoUrl && (
                        <div className="inline-flex rounded-lg mb-8 bg-[#181818] border border-[#333] p-1">
                            <button
                                onClick={() => handleViewModeChange('audio')}
                                className="px-5 py-2 text-sm font-medium rounded-md transition-all"
                                style={{ background: viewMode === 'audio' ? '#1db954' : 'transparent', color: viewMode === 'audio' ? '#000' : '#aaa' }}
                            >
                                Audio
                            </button>
                            <button
                                onClick={() => handleViewModeChange('video')}
                                className="px-5 py-2 text-sm font-medium rounded-md transition-all"
                                style={{ background: viewMode === 'video' ? '#1db954' : 'transparent', color: viewMode === 'video' ? '#000' : '#aaa' }}
                            >
                                Video
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePlayAudio}
                            className="px-8 py-3.5 font-bold flex items-center gap-2 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black transition-all hover:scale-105"
                        >
                            <Play size={20} fill="currentColor" />
                            Play Now
                        </button>
                        <button
                            onClick={toggleLike}
                            className="p-3.5 rounded-full border-2 transition-all hover:scale-110"
                            style={isLiked
                                ? { color: '#1db954', borderColor: '#1db954', background: 'rgba(29,185,84,0.1)' }
                                : { borderColor: '#444', color: '#888' }
                            }
                        >
                            <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                        <button
                            onClick={() => setShowPlaylistModal(true)}
                            className="p-3.5 rounded-full border-2 border-[#444] text-[#888] transition-all hover:scale-110 hover:border-[#1db954] hover:text-[#1db954]"
                        >
                            <Plus size={22} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Playlist Modal */}
            {showPlaylistModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowPlaylistModal(false)}>
                    <div className="w-full max-w-md p-6 rounded-xl space-y-5 bg-[#181818] border border-[#333]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">Add to Playlist</h3>
                            <button onClick={() => setShowPlaylistModal(false)} className="text-[#888] hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {playlists.map(playlist => (
                                <button
                                    key={playlist._id}
                                    onClick={() => addToPlaylist(playlist._id)}
                                    className="w-full text-left p-3 flex items-center gap-3 rounded-lg text-white hover:bg-[#222] transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[#222]">
                                        <Music2 size={16} className="text-[#888]" />
                                    </div>
                                    <span className="font-medium text-sm">{playlist.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-[#333]">
                            <p className="text-xs text-[#888] mb-2 uppercase tracking-wide">New Playlist</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    placeholder="Playlist name..."
                                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-[#111] border border-[#333] text-white placeholder-[#666] outline-none focus:border-[#1db954]"
                                />
                                <button
                                    onClick={createPlaylist}
                                    className="px-4 py-2 text-sm font-bold rounded-lg bg-[#1db954] text-black hover:bg-[#1ed760] transition-colors"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
