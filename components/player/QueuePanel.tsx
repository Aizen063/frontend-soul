'use client';

import { usePlayerStore } from '@/store/playerStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Song } from '@/types';
import { X, GripVertical, Shuffle, Trash2, Music } from 'lucide-react';

interface QueuePanelProps {
    fullScreenMode?: boolean;
}

interface SortableSongItemProps {
    song: Song;
    index: number;
    onRemove: () => void;
    isCurrentSong: boolean;
}

function SortableSongItem({ song, index, onRemove, isCurrentSong }: SortableSongItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: song._id.toString() + '-' + index });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all group ${
                isCurrentSong
                    ? 'bg-[#1db95420] border border-[#1db95440]'
                    : 'hover:bg-[#1a1a1a]'
            }`}
        >
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing shrink-0">
                <GripVertical className="w-4 h-4 text-[#555] group-hover:text-[#888] transition-colors" />
            </div>

            {/* Album Art */}
            <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#222] flex items-center justify-center">
                {song.coverImage ? (
                    <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
                ) : (
                    <Music size={14} className="text-[#555]" />
                )}
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium truncate ${
                    isCurrentSong ? 'text-[#1db954]' : 'text-white'
                }`}>
                    {song.title}
                </h4>
                <p className="text-xs text-[#888] truncate">{typeof song.artist === 'object' ? song.artist?.name : song.artist || 'Unknown Artist'}</p>
            </div>

            {/* Duration */}
            <span className="text-xs text-[#666] shrink-0">
                {Math.floor((song.duration || 0) / 60)}:{((song.duration || 0) % 60).toString().padStart(2, '0')}
            </span>

            {/* Remove Button */}
            <button
                onClick={onRemove}
                className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                title="Remove from queue"
            >
                <X className="w-3.5 h-3.5 text-[#888] hover:text-red-400" />
            </button>
        </div>
    );
}

export default function QueuePanel({ fullScreenMode = false }: QueuePanelProps) {
    const {
        queue,
        queueHistory,
        currentSong,
        isQueueOpen,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        shuffleQueue,
        toggleQueue
    } = usePlayerStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = queue.findIndex((_, i) => `${queue[i]._id}-${i}` === active.id);
            const newIndex = queue.findIndex((_, i) => `${queue[i]._id}-${i}` === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderQueue(oldIndex, newIndex);
            }
        }
    };

    if (!isQueueOpen) return null;

    const isMobileFullscreen = fullScreenMode;

    return (
        <>
            <button
                type="button"
                aria-label="Close queue"
                onClick={toggleQueue}
                className="fixed inset-0 z-[130] bg-black/50"
            />

            <aside
                style={{ background: '#111', borderLeft: isMobileFullscreen ? 'none' : '1px solid #222' }}
                className={`fixed z-[140] flex flex-col overflow-hidden shadow-2xl ${
                    isMobileFullscreen
                        ? 'left-0 right-0 bottom-0 top-auto h-[78dvh] rounded-t-2xl border-t border-[#222]'
                        : 'right-0 top-0 bottom-0 w-80'
                }`}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#222] shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-semibold text-white">Queue</h2>
                        <button
                            onClick={toggleQueue}
                            className="p-1.5 rounded-full hover:bg-[#222] transition-colors"
                        >
                            <X className="w-4 h-4 text-[#aaa]" />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={shuffleQueue}
                            style={{ flex: 1 }}
                            className="py-1.5 rounded text-xs bg-[#1a1a1a] hover:bg-[#222] transition-colors flex items-center justify-center gap-1.5 text-[#aaa] hover:text-white disabled:opacity-40"
                            disabled={queue.length === 0}
                        >
                            <Shuffle className="w-3.5 h-3.5" />
                            Shuffle
                        </button>
                        <button
                            onClick={clearQueue}
                            style={{ flex: 1 }}
                            className="py-1.5 rounded text-xs bg-[#1a1a1a] hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5 text-[#aaa] hover:text-red-400 disabled:opacity-40"
                            disabled={queue.length === 0}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Now Playing */}
                {currentSong && (
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#1db954] mb-2 px-1">Now Playing</p>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#1db95415] border border-[#1db95430]">
                            <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#222] flex items-center justify-center">
                                {currentSong.coverImage ? (
                                    <img src={currentSong.coverImage} alt={currentSong.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Music size={14} className="text-[#555]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate text-[#1db954]">{currentSong.title}</h4>
                                <p className="text-xs text-[#888] truncate">{typeof currentSong.artist === 'object' ? currentSong.artist?.name : currentSong.artist || 'Unknown Artist'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Up Next */}
                {queue.length > 0 ? (
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#888] mb-2 px-1">
                            Up Next · {queue.length}
                        </p>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={queue.map((song, i) => `${song._id}-${i}`)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {queue.map((song, index) => (
                                        <SortableSongItem
                                            key={`${song._id}-${index}`}
                                            song={song}
                                            index={index}
                                            onRemove={() => removeFromQueue(index)}
                                            isCurrentSong={false}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-[#555] text-sm">Queue is empty</p>
                        <p className="text-xs text-[#444] mt-1">Add songs to start a queue</p>
                    </div>
                )}

                {/* Recently Played */}
                {queueHistory.length > 0 && (
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#888] mb-2 px-1">Recently Played</p>
                        <div className="space-y-1">
                            {queueHistory.slice(0, 5).map((song, index) => (
                                <div
                                    key={`history-${song._id}-${index}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] transition-all opacity-50"
                                >
                                    <div className="w-9 h-9 rounded overflow-hidden shrink-0 bg-[#222] flex items-center justify-center">
                                        {song.coverImage ? (
                                            <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <Music size={12} className="text-[#555]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-medium truncate text-[#ccc]">{song.title}</h4>
                                        <p className="text-[11px] text-[#666] truncate">{typeof song.artist === 'object' ? song.artist?.name : song.artist || 'Unknown Artist'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </div>
            </aside>
        </>
    );
}
