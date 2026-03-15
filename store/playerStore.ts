import { create } from 'zustand';
import { Song } from '@/types';

interface PlayerStore {
    currentSong: Song | null;
    isPlaying: boolean;
    volume: number;
    playlist: Song[];
    currentIndex: number;

    // Queue Management
    queue: Song[];
    queueHistory: Song[];
    isQueueOpen: boolean;

    // Web Audio
    audioAnalyser: AnalyserNode | null;

    // Playback Controls
    setCurrentSong: (song: Song) => void;
    setPlaylist: (songs: Song[], startIndex?: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setVolume: (volume: number) => void;
    playNext: () => void;
    playPrevious: () => void;

    // Queue Controls
    addToQueue: (song: Song, position?: 'next' | 'last') => void;
    removeFromQueue: (index: number) => void;
    reorderQueue: (fromIndex: number, toIndex: number) => void;
    clearQueue: () => void;
    shuffleQueue: () => void;
    toggleQueue: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    currentSong: null,
    isPlaying: false,
    volume: 70,
    playlist: [],
    currentIndex: -1,
    queue: [],
    queueHistory: [],
    isQueueOpen: false,
    audioAnalyser: null,

    setCurrentSong: (song) => {
        const { currentSong } = get();
        // Add previous song to history
        if (currentSong) {
            set((state) => ({
                queueHistory: [currentSong, ...state.queueHistory.slice(0, 49)] // Keep last 50
            }));
        }
        set({ currentSong: song, isPlaying: true });
    },

    setPlaylist: (songs, startIndex = 0) => set({
        playlist: songs,
        currentIndex: startIndex,
        currentSong: songs[startIndex],
        isPlaying: true,
        queue: songs.slice(startIndex + 1) // Rest of playlist goes to queue
    }),

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setVolume: (volume) => set({ volume }),

    playNext: () => {
        const { queue, currentSong, playlist, currentIndex } = get();

        // Add current to history
        if (currentSong) {
            set((state) => ({
                queueHistory: [currentSong, ...state.queueHistory.slice(0, 49)]
            }));
        }

        // Play next from queue
        if (queue.length > 0) {
            const nextSong = queue[0];
            const nextIndexInPlaylist = playlist.findIndex((s) => s._id === nextSong._id);
            set({
                currentSong: nextSong,
                queue: queue.slice(1),
                currentIndex: nextIndexInPlaylist >= 0 ? nextIndexInPlaylist : currentIndex,
                isPlaying: true
            });
            return;
        }

        // Fallback: navigate by playlist index when queue is empty.
        if (playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length - 1) {
            const nextIndex = currentIndex + 1;
            const nextSong = playlist[nextIndex];
            set({
                currentSong: nextSong,
                currentIndex: nextIndex,
                queue: playlist.slice(nextIndex + 1),
                isPlaying: true
            });
        } else {
            // Queue exhausted — stop playback
            set({ isPlaying: false });
        }
    },

    playPrevious: () => {
        const { queueHistory, playlist, currentIndex } = get();
        if (queueHistory.length > 0) {
            const previousSong = queueHistory[0];
            const previousIndexInPlaylist = playlist.findIndex((s) => s._id === previousSong._id);
            set({
                currentSong: previousSong,
                queueHistory: queueHistory.slice(1),
                currentIndex: previousIndexInPlaylist >= 0 ? previousIndexInPlaylist : currentIndex,
                queue: previousIndexInPlaylist >= 0 ? playlist.slice(previousIndexInPlaylist + 1) : get().queue,
                isPlaying: true
            });
            return;
        }

        // Fallback: navigate backward by playlist index when history is empty.
        if (playlist.length > 0 && currentIndex > 0) {
            const previousIndex = currentIndex - 1;
            const previousSong = playlist[previousIndex];
            set({
                currentSong: previousSong,
                currentIndex: previousIndex,
                queue: playlist.slice(previousIndex + 1),
                isPlaying: true
            });
        }
    },

    addToQueue: (song, position = 'last') => {
        set((state) => ({
            queue: position === 'next'
                ? [song, ...state.queue]
                : [...state.queue, song]
        }));
    },

    removeFromQueue: (index) => {
        set((state) => ({
            queue: state.queue.filter((_, i) => i !== index)
        }));
    },

    reorderQueue: (fromIndex, toIndex) => {
        set((state) => {
            const newQueue = [...state.queue];
            const [removed] = newQueue.splice(fromIndex, 1);
            newQueue.splice(toIndex, 0, removed);
            return { queue: newQueue };
        });
    },

    clearQueue: () => set({ queue: [] }),

    shuffleQueue: () => {
        set((state) => {
            const shuffled = [...state.queue];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return { queue: shuffled };
        });
    },

    toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen }))
}));
