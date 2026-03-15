'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Music, ListMusic, X, Play, ChevronLeft, Search, GripVertical, Check, MessageCircle, Instagram, Link2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { Playlist, Song } from '@/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSongRow({ song, index, onPlay, onRemove }: { song: Song; index: number; onPlay: () => void; onRemove: (e: React.MouseEvent) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: song._id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };
    const artistName = typeof song.artist === 'object' ? song.artist?.name : song.artist || 'Unknown';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`grid grid-cols-[30px_30px_1fr_auto] md:grid-cols-[40px_70px_1fr_1fr_70px] gap-2 md:gap-4 px-3 md:px-5 py-3 md:py-3.5 items-center group border-b border-[#1a1a1a] last:border-0 ${isDragging ? 'bg-[#222] shadow-xl' : 'hover:bg-[#1a1a1a]'} transition-colors`}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex justify-center text-[#555] hover:text-white transition-colors">
                <GripVertical size={16} />
            </div>
            <div className="flex justify-center items-center cursor-pointer" onClick={onPlay}>
                <span className="text-sm text-[#888] group-hover:hidden">{index + 1}</span>
                <Play size={14} className="text-[#1db954] hidden group-hover:block" fill="currentColor" />
            </div>
            <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={onPlay}>
                <div className="w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden bg-[#222]">
                    {song.coverImage ? <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" /> : <Music size={16} className="text-[#666]" />}
                </div>
                <div className="min-w-0">
                    <span className="text-white font-medium truncate text-sm block">{song.title}</span>
                    <span className="text-xs text-[#888] truncate block md:hidden">{artistName}</span>
                </div>
            </div>
            <span className="text-sm text-[#888] truncate hidden md:block">
                {artistName}
            </span>
            <div className="flex justify-center">
                <button onClick={onRemove} className="p-2 text-[#555] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

export default function LibraryPage() {
    const { user } = useAuthStore();
    const setPlaylist = usePlayerStore((s) => s.setPlaylist);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    // Selected playlist detail view
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);

    // Add song modal
    const [showAddSong, setShowAddSong] = useState(false);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [songSearch, setSongSearch] = useState('');
    const [addingSong, setAddingSong] = useState(false);
    const [loadingAllSongs, setLoadingAllSongs] = useState(false);
    const [copiedShare, setCopiedShare] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (user?._id) fetchPlaylists();
    }, [user]);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/playlists');
            const playlistData = res.data.data || [];
            setPlaylists(playlistData);

            const requestedPlaylistId = searchParams.get('playlist');
            if (requestedPlaylistId) {
                const fromQuery = playlistData.find((p: Playlist) => p._id === requestedPlaylistId);
                if (fromQuery) {
                    setSelectedPlaylist(fromQuery);
                    setPlaylistSongs(fromQuery.songs || []);
                }
            }

            if (selectedPlaylist) {
                const updated = playlistData.find((p: Playlist) => p._id === selectedPlaylist._id);
                if (updated) {
                    setSelectedPlaylist(updated);
                    setPlaylistSongs(updated.songs || []);
                } else {
                    setSelectedPlaylist(null);
                }
            }
        } catch (e) {
            console.error('Failed to fetch playlists', e);
        } finally {
            setLoading(false);
        }
    };

    const createPlaylist = async () => {
        if (!newName.trim() || !user) return;
        setCreating(true);
        try {
            await api.post('/api/playlists', { name: newName });
            setNewName('');
            setShowCreate(false);
            fetchPlaylists();
        } catch (e) {
            console.error('Failed to create playlist', e);
        } finally {
            setCreating(false);
        }
    };

    const deletePlaylist = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this playlist?')) return;
        try {
            await api.delete(`/api/playlists/${id}`);
            if (selectedPlaylist?._id === id) {
                setSelectedPlaylist(null);
                router.replace('/library', { scroll: false });
            }
            fetchPlaylists();
        } catch (e) {
            console.error('Failed to delete playlist', e);
        }
    };

    const openPlaylist = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        setPlaylistSongs(playlist.songs || []);
        router.replace(`/library?playlist=${playlist._id}`, { scroll: false });
    };

    const getShareUrl = () => {
        if (!selectedPlaylist || typeof window === 'undefined') return '';
        return `${window.location.origin}/library?playlist=${selectedPlaylist._id}`;
    };

    const copyShareLink = async () => {
        const url = getShareUrl();
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedShare(true);
            setTimeout(() => setCopiedShare(false), 1600);
        } catch (e) {
            console.error('Failed to copy playlist link', e);
        }
    };

    const shareToWhatsApp = () => {
        if (!selectedPlaylist) return;
        const url = getShareUrl();
        const text = `Listen to my playlist "${selectedPlaylist.name}"`;
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener,noreferrer');
    };

    const shareToInstagram = async () => {
        if (!selectedPlaylist) return;
        const url = getShareUrl();
        const text = `Check out my playlist: ${selectedPlaylist.name}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: selectedPlaylist.name, text, url });
                return;
            } catch {
                // If user cancels native share, keep fallback behavior quiet.
            }
        }

        await copyShareLink();
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    };

    const removeSongFromPlaylist = async (songId: string) => {
        if (!selectedPlaylist) return;
        try {
            await api.delete(`/api/playlists/${selectedPlaylist._id}/remove/${songId}`);
            setPlaylistSongs((prev) => prev.filter((s) => s._id !== songId));
            fetchPlaylists();
        } catch (e) {
            console.error('Failed to remove song', e);
        }
    };

    const openAddSong = async () => {
        setShowAddSong(true);
        if (allSongs.length === 0) {
            try {
                setLoadingAllSongs(true);
                const res = await api.get('/api/songs?limit=500');
                setAllSongs(res.data.data || []);
            } catch (e) {
                console.error('Failed to load songs', e);
            } finally {
                setLoadingAllSongs(false);
            }
        }
    };

    const addSongToPlaylist = async (song: Song) => {
        if (!selectedPlaylist || addingSong) return;
        if (playlistSongs.find((s) => s._id === song._id)) return;
        setAddingSong(true);
        try {
            await api.post(`/api/playlists/${selectedPlaylist._id}/add/${song._id}`);
            setPlaylistSongs((prev) => [...prev, song]);
            fetchPlaylists();
        } catch (e) {
            console.error('Failed to add song', e);
        } finally {
            setAddingSong(false);
        }
    };

    const playAll = () => {
        if (playlistSongs.length > 0) setPlaylist(playlistSongs, 0);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && selectedPlaylist) {
            const oldIndex = playlistSongs.findIndex((s) => s._id === active.id);
            const newIndex = playlistSongs.findIndex((s) => s._id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(playlistSongs, oldIndex, newIndex);
                setPlaylistSongs(newOrder); // Optimistic UI update
                
                try {
                    const songIds = newOrder.map(s => s._id);
                    await api.put(`/api/playlists/${selectedPlaylist._id}/reorder`, { songIds });
                    fetchPlaylists(); // Refresh backend data to ensure sync
                } catch (e) {
                    console.error('Failed to reorder playlist', e);
                    // Revert on failure
                    setPlaylistSongs(playlistSongs);
                }
            }
        }
    };

    const filteredSongs = allSongs.filter((s) => {
        const titleMatch = s.title?.toLowerCase().includes(songSearch.toLowerCase());
        const artistName = typeof s.artist === 'object' ? s.artist?.name : s.artist;
        const artistMatch = artistName?.toLowerCase().includes(songSearch.toLowerCase());
        return titleMatch || artistMatch;
    });

    const songArtistLabel = (song: Song) => {
        const artistName = typeof song.artist === 'object' ? song.artist?.name : song.artist;
        if (!artistName) return 'Unknown Artist';
        // Hide raw ObjectId-like artist strings in modal rows.
        if (/^[a-f0-9]{24}$/i.test(artistName)) return song.genre || 'Unknown Artist';
        return artistName;
    };

    // ─── Playlist detail view ────────────────────────────────────────────────
    if (selectedPlaylist) {
        return (
            <div className="space-y-6 pb-24 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setSelectedPlaylist(null);
                            router.replace('/library', { scroll: false });
                        }}
                        className="flex items-center gap-2 text-[#888] hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span className="text-sm">Library</span>
                    </button>
                </div>

                {/* Hero */}
                <div className="relative p-5 md:p-8 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a, #111)', border: '1px solid #222' }}>
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#1db954] to-[#15803d]">
                            <ListMusic size={30} className="text-white/80 md:w-10 md:h-10" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs uppercase tracking-wide text-[#888] mb-1">Playlist</p>
                            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 truncate">{selectedPlaylist.name}</h1>
                            <p className="text-sm text-[#888]">{playlistSongs.length} tracks</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2.5 md:gap-3 mt-4 md:mt-5">
                                <button
                                    onClick={playAll}
                                    disabled={playlistSongs.length === 0}
                                    className="flex items-center gap-2 px-5 md:px-6 py-2.5 font-bold rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Play size={16} fill="black" /> Play All
                                </button>
                                <button
                                    onClick={openAddSong}
                                    className="flex items-center gap-2 px-4 md:px-5 py-2.5 font-medium rounded-full border border-[#444] text-white hover:bg-[#222] transition-colors text-sm"
                                >
                                    <Plus size={16} /> Add Tracks
                                </button>
                                <button
                                    onClick={shareToWhatsApp}
                                    className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-full border border-[#2c5137] text-[#8ae0af] hover:bg-[#133122] transition-colors text-sm"
                                >
                                    <MessageCircle size={15} /> WhatsApp
                                </button>
                                <button
                                    onClick={shareToInstagram}
                                    className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-full border border-[#4a3359] text-[#d3b4ff] hover:bg-[#24162d] transition-colors text-sm"
                                >
                                    <Instagram size={15} /> Instagram
                                </button>
                                <button
                                    onClick={copyShareLink}
                                    className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-full border border-[#444] text-[#cfcfcf] hover:bg-[#222] transition-colors text-sm"
                                >
                                    <Link2 size={15} /> {copiedShare ? 'Copied' : 'Copy Link'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Songs list */}
                {playlistSongs.length === 0 ? (
                    <div className="text-center py-20 rounded-xl border border-dashed border-[#333] bg-[#111]">
                        <ListMusic size={48} className="mx-auto text-[#555] mb-4" />
                        <p className="text-[#888] font-medium">Empty playlist</p>
                        <button onClick={openAddSong} className="mt-4 px-5 py-2 text-sm rounded-full bg-[#1db954]/20 text-[#1db954] hover:bg-[#1db954]/30 transition-colors">
                            Add your first song
                        </button>
                    </div>
                ) : (
                    <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: '1px solid #222' }}>
                        <div className="hidden md:grid grid-cols-[40px_70px_1fr_1fr_70px] gap-4 px-5 py-3 border-b border-[#1a1a1a] text-xs font-medium uppercase tracking-wide text-[#888]">
                            <span className="text-center">Move</span>
                            <span className="text-center">#</span>
                            <span>Title</span>
                            <span>Artist</span>
                            <span className="text-center">Action</span>
                        </div>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={playlistSongs.map(s => s._id)} strategy={verticalListSortingStrategy}>
                                {playlistSongs.map((song, i) => (
                                    <SortableSongRow
                                        key={song._id}
                                        song={song}
                                        index={i}
                                        onPlay={() => setPlaylist(playlistSongs, i)}
                                        onRemove={(e) => { e.stopPropagation(); removeSongFromPlaylist(song._id); }}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}

                {/* Add Song Modal */}
                {showAddSong && (
                    <div className="fixed inset-0 z-[120] flex items-start md:items-center justify-center px-2 md:p-4 pt-16 md:pt-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddSong(false)}>
                        <div className="w-full max-w-xl shadow-2xl overflow-hidden rounded-xl border border-[#333] bg-[#181818] flex flex-col h-[calc(100dvh-4.5rem)] md:h-auto md:max-h-[88vh]" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-4 md:p-5 border-b border-[#222] flex-shrink-0">
                                <div>
                                    <h3 className="text-white font-bold text-lg">Add Songs</h3>
                                    <p className="text-xs text-[#777] mt-0.5">{selectedPlaylist?.name}</p>
                                </div>
                                <button onClick={() => { setShowAddSong(false); setSongSearch(''); }} className="text-[#888] hover:text-white transition-colors">
                                    <X size={22} />
                                </button>
                            </div>
                            <div className="p-4 md:p-5 flex-shrink-0">
                                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#111] border border-[#333] focus-within:border-[#1db954] transition-colors">
                                    <Search size={18} className="text-[#666] flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Search tracks..."
                                        value={songSearch}
                                        onChange={(e) => setSongSearch(e.target.value)}
                                        className="bg-transparent text-white placeholder-[#666] outline-none flex-1 text-sm"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="overflow-y-auto p-2 flex-1">
                                {loadingAllSongs ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-6 h-6 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : filteredSongs.map((song) => {
                                    const alreadyAdded = !!playlistSongs.find((s) => s._id === song._id);
                                    return (
                                        <div
                                            key={song._id}
                                            onClick={() => !alreadyAdded && addSongToPlaylist(song)}
                                            className={`grid grid-cols-[40px_1fr_auto] items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 border border-transparent ${alreadyAdded ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer hover:bg-[#222] hover:border-[#2b2b2b]'}`}
                                        >
                                            <div className="w-10 h-10 rounded-md overflow-hidden bg-[#222]">
                                                {song.coverImage ? <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Music size={16} className="text-[#666]" /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate text-sm">{song.title}</p>
                                                <p className="text-xs text-[#888] truncate">{songArtistLabel(song)}</p>
                                            </div>
                                            {alreadyAdded ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium bg-[#1db954]/15 text-[#1db954]">
                                                    <Check size={12} /> Added
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="w-7 h-7 rounded-full border border-[#3a3a3a] text-[#aaa] hover:text-white hover:border-[#555] transition-colors flex items-center justify-center"
                                                    aria-label={`Add ${song.title}`}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                {!loadingAllSongs && filteredSongs.length === 0 && (
                                    <p className="text-center text-[#888] py-12">No tracks found</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── Playlists grid view ─────────────────────────────────────────────────
    return (
        <div className="space-y-8 pb-24 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Your Library</h1>
                    <p className="text-sm text-[#888]">{playlists.length} playlists</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-6 py-2.5 font-bold rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black transition-all text-sm"
                >
                    <Plus size={18} />
                    New Playlist
                </button>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : playlists.length === 0 ? (
                <div className="text-center py-20 rounded-xl border border-dashed border-[#333] bg-[#111]">
                    <ListMusic size={48} className="mx-auto text-[#555] mb-4" />
                    <h3 className="text-white text-xl font-bold mb-2">No playlists yet</h3>
                    <p className="text-sm text-[#888] mb-6">Create your first playlist to get started</p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-6 py-2.5 text-sm font-bold rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black transition-all"
                    >
                        Create Playlist
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist._id}
                            onClick={() => openPlaylist(playlist)}
                            className="group relative p-4 rounded-xl bg-[#111] hover:bg-[#1a1a1a] border border-transparent transition-all cursor-pointer"
                        >
                            {/* Cover */}
                            <div className="aspect-square mb-4 rounded-lg flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#1db954] to-[#15803d]">
                                <ListMusic size={40} className="text-white/40" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-[#1db954] flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
                                        <Play size={20} fill="black" className="text-black ml-0.5" />
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-bold text-white truncate mb-1 text-sm">{playlist.name}</h3>
                            <p className="text-xs text-[#888]">
                                {playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString() : 'Playlist'}
                            </p>

                            {/* Delete button */}
                            <button
                                onClick={(e) => deletePlaylist(playlist._id, e)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-black/60 text-[#888] hover:text-red-400 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Playlist Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
                    <div className="w-full max-w-sm p-6 space-y-6 rounded-xl border border-[#333] bg-[#181818] shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">New Playlist</h3>
                            <button onClick={() => { setShowCreate(false); setNewName(''); }} className="text-[#888] hover:text-white transition-colors">
                                <X size={22} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-[#888]">Playlist Name</label>
                                <input
                                    type="text"
                                    placeholder="My playlist..."
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
                                    className="w-full px-4 py-2.5 bg-[#111] border border-[#333] rounded-lg text-white placeholder-[#666] outline-none focus:border-[#1db954] transition-colors text-sm"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setShowCreate(false); setNewName(''); }}
                                    className="flex-1 py-2.5 font-medium rounded-lg bg-[#222] text-[#888] hover:bg-[#333] hover:text-white transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createPlaylist}
                                    disabled={!newName.trim() || creating}
                                    className="flex-1 py-2.5 font-bold rounded-lg bg-[#1db954] hover:bg-[#1ed760] text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                                >
                                    {creating ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
