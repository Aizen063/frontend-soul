'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, Heart, SlidersHorizontal, ChevronDown, MoreVertical, Maximize2, Repeat2, Shuffle } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import QueuePanel from '../player/QueuePanel';
import EqualizerPanel from '../player/EqualizerPanel';
import api from '@/lib/api';

export default function Player() {
    const {
        currentSong,
        isPlaying,
        volume,
        queue,
        setIsPlaying,
        setVolume,
        playNext,
        playPrevious,
        shuffleQueue,
        toggleQueue,
        isQueueOpen,
    } = usePlayerStore();
    const { user } = useAuthStore();
    const router = useRouter();

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isEqOpen, setIsEqOpen] = useState(false);
    const [isMobileNowPlayingOpen, setIsMobileNowPlayingOpen] = useState(false);
    const [isRepeatOne, setIsRepeatOne] = useState(false);

    useEffect(() => {
        if (currentSong && audioRef.current) {
            audioRef.current.src = currentSong.audioUrl || '';
            if (isPlaying) audioRef.current.play().catch(e => console.error('Playback failed', e));
            checkIfLiked();
            recordHistory();
        }
    }, [currentSong]);

    const recordHistory = async () => {
        if (!currentSong || !user) return;
        const songId = currentSong?._id;
        if (!songId || typeof songId !== 'string') return;

        try {
            await api.post('/api/users/history', { songId });
        } catch (e) {
            console.error('Failed to record history', e);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.play().catch(e => console.error('Playback failed', e));
            else audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume / 100;
    }, [volume, isMuted]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const dur = audioRef.current.duration;
            setCurrentTime(current);
            setDuration(dur);
            setProgress((current / dur) * 100);
        }
    };

    const handleEnded = () => {
        if (isRepeatOne && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error('Playback failed', e));
            return;
        }
        playNext();
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = (Number(e.target.value) / 100) * duration;
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setProgress(Number(e.target.value));
        }
    };

    const handleRepeatToggle = () => {
        setIsRepeatOne((prev) => !prev);
    };

    const handleShuffle = () => {
        shuffleQueue();
    };

    const checkIfLiked = async () => {
        if (!currentSong || !user) return;
        try {
            const res = await api.get(`/api/users/liked`);
            setIsLiked(res.data.data.some((s: any) => s._id === currentSong._id));
        } catch { setIsLiked(false); }
    };

    const handleLikeToggle = async () => {
        if (!currentSong) return;
        if (!user) { router.push('/login'); return; }
        setIsLiking(true);
        const prev = isLiked;
        setIsLiked(!isLiked);
        try {
            await api.put(`/api/users/like/${currentSong._id}`);
        } catch { setIsLiked(prev); }
        finally { setIsLiking(false); }
    };

    if (!currentSong) return null;

    const iconBtnStyle = (active?: boolean) => ({
        borderRadius: '10px',
        border: active ? '1px solid rgba(29, 185, 84, 0.45)' : '1px solid transparent',
        background: active ? 'rgba(29, 185, 84, 0.14)' : 'transparent',
        color: active ? '#fff' : 'var(--text-dim)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: 'none',
    });

    return (
    <>
        <div className={`fixed bottom-0 w-full z-50 px-1 sm:px-2 md:px-4 pb-[max(env(safe-area-inset-bottom),4px)] md:pb-4 motion-player-enter transition-all duration-300 ease-out ${isMobileNowPlayingOpen ? 'opacity-0 translate-y-4 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto' : 'opacity-100 translate-y-0'}`}>
            <div
                className="h-[88px] sm:h-[90px] md:h-24 flex items-center justify-between px-2.5 sm:px-3 md:px-6 pb-3 md:pb-0 relative overflow-hidden transition-all duration-300 rounded-2xl"
                style={{
                    background: 'rgba(14, 14, 14, 0.96)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: 'none',
                }}
            >
                <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    crossOrigin="anonymous"
                />

                {/* Song Info */}
                <div
                    onClick={() => setIsMobileNowPlayingOpen(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsMobileNowPlayingOpen(true);
                        }
                    }}
                    className="flex items-center gap-2 md:gap-4 w-[52%] sm:w-[38%] md:w-64 group flex-shrink-0 min-w-0 text-left"
                >
                    <div
                        className="flex w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 overflow-hidden relative flex-shrink-0 rounded-xl"
                        style={{
                            border: '1px solid var(--border-neon)',
                            boxShadow: 'none',
                        }}
                    >
                        {currentSong.coverImage ? (
                            <img src={currentSong.coverImage} alt={currentSong.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-pink))', opacity: 0.2 }}>
                                <svg className="w-7 h-7" style={{ color: 'var(--neon-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p
                            className="text-[13px] sm:text-sm font-bold truncate"
                            style={{ color: 'var(--text-primary)', fontFamily: "var(--font-body)" }}
                        >
                            {currentSong.title}
                        </p>
                        <p className="text-[11px] sm:text-xs truncate" style={{ color: 'var(--text-dim)', fontFamily: "var(--font-body)" }}>
                            {typeof currentSong.artist === 'object' ? currentSong.artist?.name : currentSong.artist || 'Unknown Artist'}
                        </p>
                    </div>

                    <Maximize2 size={14} className="sm:hidden text-[#888]" />

                    {/* Like Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLikeToggle();
                        }}
                        disabled={isLiking}
                        className="hidden sm:block p-2 relative transition-all duration-300"
                        style={{
                            color: isLiked ? 'var(--neon-pink)' : 'var(--text-dim)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            textShadow: 'none'
                        }}
                    >
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className={isLiking ? 'animate-pulse' : ''} />
                    </button>
                </div>

                {/* Center Controls */}
                <div className="flex-1 flex flex-col items-center gap-1 md:gap-2 min-w-0 max-w-[22%] sm:max-w-[34%] md:max-w-xl mx-1 md:mx-2">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
                        <button
                            onClick={playPrevious}
                            className="hidden sm:inline"
                            style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <SkipBack size={20} />
                        </button>

                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 motion-btn rounded-full"
                            style={{
                                background: 'var(--neon-green)',
                                color: '#000',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: 'none',
                            }}
                        >
                            {isPlaying
                                ? <Pause size={20} fill="currentColor" />
                                : <Play size={20} fill="currentColor" className="ml-0.5" />
                            }
                        </button>

                        <button
                            onClick={playNext}
                            className="hidden sm:inline"
                            style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="hidden md:flex w-full max-w-xl items-center gap-3">
                        <span className="text-xs font-mono w-10 text-right" style={{ color: 'var(--text-dim)' }}>{formatTime(currentTime)}</span>
                        <div className="flex-1 relative group cursor-pointer" style={{ height: '4px' }}>
                            <input
                                type="range" min="0" max="100" value={progress || 0} onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {/* Track */}
                            <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
                            {/* Fill */}
                            <div
                                className="absolute left-0 top-0 h-full transition-all rounded-full"
                                style={{
                                    width: `${progress}%`,
                                    background: 'var(--neon-green)',
                                    boxShadow: 'none',
                                }}
                            />
                        </div>
                        <span className="text-xs font-mono w-10" style={{ color: 'var(--text-dim)' }}>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 w-auto md:w-64 justify-end flex-shrink-0 pr-1 md:pr-2">
                    {/* Equalizer animation */}
                    {isPlaying && (
                        <div className="equalizer-bars mr-1 hidden md:block">
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>
                    )}

                    <button
                        onClick={() => setIsEqOpen(!isEqOpen)}
                        className="p-1.5 sm:p-2 motion-btn"
                        style={iconBtnStyle(isEqOpen)}
                    >
                        <SlidersHorizontal size={17} />
                    </button>

                    <button
                        onClick={toggleQueue}
                        className="p-1.5 sm:p-2 motion-btn"
                        style={{ ...iconBtnStyle(isQueueOpen), position: 'relative' }}
                    >
                        <ListMusic size={17} />
                        {queue.length > 0 && (
                            <span
                                className="absolute -top-1 -right-1 w-4 h-4 text-[9px] flex items-center justify-center font-bold rounded-full"
                                style={{
                                    background: 'var(--neon-pink)',
                                    color: '#000',
                                    border: 'none',
                                    boxShadow: 'none'
                                }}
                            >
                                {queue.length > 9 ? '9+' : queue.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 sm:p-2 motion-btn"
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                    >
                        {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                    </button>

                    {/* Volume Track */}
                    <div className="flex-1 relative hidden md:block" style={{ height: '4px' }}>
                        <input
                            type="range" min="0" max="100" value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
                        <div
                            className="absolute left-0 top-0 h-full rounded-full"
                            style={{
                                width: `${isMuted ? 0 : volume}%`,
                                background: 'var(--neon-green)',
                            }}
                        />
                    </div>
                </div>

                {/* Mobile Progress Bar */}
                <div className="absolute left-3 right-3 bottom-2 md:hidden" style={{ height: '3px' }}>
                    <input
                        type="range" min="0" max="100" value={progress || 0} onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                    <div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{
                            width: `${progress}%`,
                            background: 'var(--neon-green)',
                        }}
                    />
                </div>
            </div>
        </div>

        <div
            className={`fixed inset-0 z-[90] md:hidden flex flex-col transition-all duration-300 ease-out ${isMobileNowPlayingOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}`}
            style={{ background: 'linear-gradient(180deg, #111 0%, #0b0b0b 100%)' }}
        >
                <div className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3 flex items-center justify-between">
                    <button
                        onClick={() => setIsMobileNowPlayingOpen(false)}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#bbb' }}
                    >
                        <ChevronDown size={18} />
                    </button>

                    <div className="text-center min-w-0 px-3">
                        <p className="text-[10px] tracking-[0.18em] uppercase text-[#888]">Playing from</p>
                        <p className="text-sm text-white truncate">Your Queue</p>
                    </div>

                    <button
                        onClick={toggleQueue}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#bbb' }}
                    >
                        <MoreVertical size={18} />
                    </button>
                </div>

                <div className="px-5 pt-2">
                    <div className="w-full aspect-square rounded-3xl overflow-hidden" style={{ background: '#181818', border: '1px solid #262626' }}>
                        {currentSong.coverImage ? (
                            <img src={currentSong.coverImage} alt={currentSong.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ListMusic size={72} className="text-[#555]" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-5 pt-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-3xl font-bold text-white leading-tight truncate">{currentSong.title}</h2>
                            <p className="text-base text-[#909090] truncate mt-1">
                                {typeof currentSong.artist === 'object' ? currentSong.artist?.name : currentSong.artist || 'Unknown Artist'}
                            </p>
                        </div>
                        <button
                            onClick={handleLikeToggle}
                            disabled={isLiking}
                            className="p-2"
                            style={{ color: isLiked ? 'var(--neon-pink)' : '#8a8a8a' }}
                        >
                            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} className={isLiking ? 'animate-pulse' : ''} />
                        </button>
                    </div>
                </div>

                <div className="px-5 pt-5">
                    <div className="relative" style={{ height: '4px' }}>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress || 0}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                        <div
                            className="absolute left-0 top-0 h-full rounded-full"
                            style={{ width: `${progress}%`, background: 'var(--neon-green)' }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-[#9a9a9a]">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="px-5 pt-4 flex items-center justify-between text-[#8f8f8f]">
                    <button
                        onClick={handleShuffle}
                        className="p-2"
                        style={{ color: '#8f8f8f' }}
                        aria-label="Shuffle"
                        title="Shuffle queue"
                    >
                        <Shuffle size={18} />
                    </button>
                    <button onClick={playPrevious} className="p-2" aria-label="Previous">
                        <SkipBack size={26} />
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--neon-green)', color: '#000' }}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <button onClick={playNext} className="p-2" aria-label="Next">
                        <SkipForward size={26} />
                    </button>
                    <button
                        onClick={handleRepeatToggle}
                        className="p-2"
                        style={{ color: isRepeatOne ? 'var(--neon-green)' : '#8f8f8f' }}
                        aria-label="Repeat one"
                        title="Repeat current song"
                    >
                        <Repeat2 size={18} />
                    </button>
                </div>

                <div className="px-5 pt-6 grid grid-cols-3 gap-2 text-sm">
                    <button
                        onClick={toggleQueue}
                        className="h-10 rounded-full"
                        style={{ background: isQueueOpen ? 'rgba(29,185,84,0.16)' : '#1a1a1a', color: '#d6d6d6', border: isQueueOpen ? '1px solid rgba(29,185,84,0.4)' : '1px solid #2a2a2a' }}
                    >
                        Queue
                    </button>
                    <button
                        onClick={() => setIsEqOpen(!isEqOpen)}
                        className="h-10 rounded-full"
                        style={{ background: isEqOpen ? 'rgba(29,185,84,0.16)' : '#1a1a1a', color: '#d6d6d6', border: isEqOpen ? '1px solid rgba(29,185,84,0.4)' : '1px solid #2a2a2a' }}
                    >
                        EQ
                    </button>
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="h-10 rounded-full"
                        style={{ background: '#1a1a1a', color: '#d6d6d6', border: '1px solid #2a2a2a' }}
                    >
                        {isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                    </button>
                </div>
            </div>
        

        <QueuePanel fullScreenMode={isMobileNowPlayingOpen} />
        <EqualizerPanel audioRef={audioRef} isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} fullScreenMode={isMobileNowPlayingOpen} />
    </>
    );
}
