'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, RotateCcw, Save, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface EqualizerPanelProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isOpen: boolean;
    onClose: () => void;
    fullScreenMode?: boolean;
}

const BANDS = [
    { freq: 60, label: '60Hz' },
    { freq: 170, label: '170Hz' },
    { freq: 310, label: '310Hz' },
    { freq: 600, label: '600Hz' },
    { freq: 1000, label: '1kHz' },
    { freq: 3000, label: '3kHz' },
    { freq: 6000, label: '6kHz' },
    { freq: 12000, label: '12kHz' },
    { freq: 14000, label: '14kHz' },
    { freq: 16000, label: '16kHz' },
];

const PRESETS: Record<string, number[]> = {
    Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    Bass: [8, 7, 6, 2, 0, 0, 0, 0, 0, 0],
    Treble: [0, 0, 0, 0, 0, 2, 4, 6, 7, 8],
    Vocal: [-2, -1, 0, 3, 5, 5, 3, 0, -1, -2],
    Rock: [5, 4, 2, 0, -1, -1, 0, 2, 4, 5],
    Electronic: [6, 5, 0, -2, -3, 0, 3, 4, 5, 6],
    Jazz: [3, 2, 1, 2, -2, -2, 0, 1, 2, 3],
    Classical: [4, 3, 2, 1, 0, 0, -1, -2, -3, -4],
};

import { usePlayerStore } from '@/store/playerStore';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function EqualizerPanel({ audioRef, isOpen, onClose, fullScreenMode = false }: EqualizerPanelProps) {
    const { user } = useAuthStore();
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const [gains, setGains] = useState<number[]>(new Array(BANDS.length).fill(0));
    const [activePreset, setActivePreset] = useState('Flat');
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

    const filtersRef = useRef<BiquadFilterNode[]>([]);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const connectedRef = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Initialize Web Audio API ──────────────────────────────────────────────
    useEffect(() => {
        if (!audioRef.current || connectedRef.current) return;

        // Add crossOrigin BEFORE creating the source node (very important)
        if (!audioRef.current.crossOrigin) {
            audioRef.current.crossOrigin = 'anonymous';
        }

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaElementSource(audioRef.current);

        // Create AnalyserNode for future visualizer
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;

        const filters = BANDS.map((band) => {
            const f = ctx.createBiquadFilter();
            f.type = 'peaking';
            f.frequency.value = band.freq;
            f.Q.value = 1.4;
            f.gain.value = 0;
            return f;
        });
        filtersRef.current = filters;

        // source -> filters -> analyser -> destination
        source.connect(filters[0]);
        for (let i = 0; i < filters.length - 1; i++) filters[i].connect(filters[i + 1]);
        filters[filters.length - 1].connect(analyser);
        analyser.connect(ctx.destination);
        
        connectedRef.current = true;

        // Store the analyser globally so the Visualizer can pick it up
        usePlayerStore.setState({ audioAnalyser: analyser });
    }, [audioRef.current]);

    // Resume AudioContext when playing (browser policy)
    useEffect(() => {
        if (isPlaying && audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    }, [isPlaying, isOpen]);

    // ── Load saved settings from API ─────────────────────────────────────────
    useEffect(() => {
        if (!isOpen || !user?._id) return;

        const load = async () => {
            try {
                const res = await api.get(`/api/equalizer/user/${user._id}`);
                const data = res.data;
                if (data?.bandsJson) {
                    const parsed: number[] = JSON.parse(data.bandsJson);
                    if (Array.isArray(parsed) && parsed.length === BANDS.length) {
                        applyGainsArray(parsed);
                        setActivePreset(data.preset || 'Custom');
                    }
                }
            } catch {
                // 404 = no settings yet, keep defaults
            }
        };
        load();
    }, [isOpen, user?._id]);

    // ── Save to API (debounced 1.5s) ─────────────────────────────────────────
    const scheduleSave = useCallback((newGains: number[], preset: string) => {
        if (!user?._id) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        setSaveStatus('saving');
        saveTimerRef.current = setTimeout(async () => {
            try {
                await api.put(`/api/equalizer/user/${user._id}`, {
                    bandsJson: JSON.stringify(newGains),
                    preset,
                    bass: newGains[0],
                    mid: newGains[4],
                    treble: newGains[9],
                });
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } catch {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        }, 1500);
    }, [user?._id]);

    // ── Apply gains to filters + state ───────────────────────────────────────
    const applyGainsArray = (newGains: number[]) => {
        setGains(newGains);
        newGains.forEach((val, i) => {
            if (filtersRef.current[i]) filtersRef.current[i].gain.value = val;
        });
    };

    const applyGain = (index: number, value: number) => {
        const newGains = [...gains];
        newGains[index] = value;
        applyGainsArray(newGains);
        setActivePreset('Custom');
        scheduleSave(newGains, 'Custom');
    };

    const applyPreset = (name: string) => {
        const preset = PRESETS[name];
        if (!preset) return;
        applyGainsArray(preset);
        setActivePreset(name);
        scheduleSave(preset, name);
    };

    const reset = () => applyPreset('Flat');

    if (!isOpen) return null;

    const isMobileFullscreen = fullScreenMode;

    return (
        <>
            <button
                type="button"
                aria-label="Close equalizer"
                onClick={onClose}
                className="fixed inset-0 z-[130] bg-black/55 motion-overlay"
            />

            <div
                className={`fixed z-[140] bg-[#101010] border border-[#252525] rounded-xl md:rounded-2xl shadow-xl overflow-hidden motion-panel-enter md:motion-desktop-right ${
                    isMobileFullscreen
                        ? 'left-3 right-3 bottom-3 top-auto max-h-[72dvh]'
                        : 'left-2 right-2 bottom-24 md:bottom-28 md:left-auto md:right-4 md:w-[480px]'
                }`}
            >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    {/* Animated bars */}
                    <div className="hidden md:flex gap-0.5 items-end h-5">
                        {[3, 5, 4, 6, 3, 5, 4, 6, 3, 5].map((h, i) => (
                            <div key={i} className="w-1 rounded-full bg-neon-purple animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 80}ms` }} />
                        ))}
                    </div>
                    <h3 className="text-white font-semibold text-sm md:text-base md:ml-1">Equalizer</h3>
                </div>
                <div className="flex items-center gap-2">
                    {/* Save status indicator */}
                    {saveStatus === 'saving' && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                            <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                            <span>Saving…</span>
                        </div>
                    )}
                    {saveStatus === 'saved' && (
                        <div className="flex items-center gap-1 text-xs text-neon-green">
                            <CheckCircle size={12} />
                            <span>Saved</span>
                        </div>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-xs text-red-400">Save failed</span>
                    )}
                    <button onClick={reset} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Reset to Flat">
                        <RotateCcw size={15} />
                    </button>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Presets */}
            <div className="px-3 md:px-5 py-2.5 border-b border-white/5 overflow-x-auto">
                <div className="flex gap-1.5 md:gap-2 min-w-max">
                    {Object.keys(PRESETS).map((name) => (
                        <button
                            key={name}
                            onClick={() => applyPreset(name)}
                            className={`px-2.5 md:px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold transition-all whitespace-nowrap ${activePreset === name
                                ? 'bg-[#2a2a2a] text-white'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {name}
                        </button>
                    ))}
                    {activePreset === 'Custom' && (
                        <span className="px-2.5 md:px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold bg-white/10 text-white">Custom</span>
                    )}
                </div>
            </div>

            {/* EQ Sliders */}
            <div className="px-3 md:px-5 py-3 md:py-5">
                <div className="overflow-x-auto">
                    <div className="min-w-[420px] md:min-w-[520px] flex items-end justify-between gap-1.5 md:gap-2 h-32 md:h-44 pr-1">
                    {BANDS.map((band, i) => (
                        <div key={band.freq} className="flex flex-col items-center gap-2 flex-1">
                            {/* dB value */}
                            <span className={`text-[10px] md:text-xs font-mono font-bold ${gains[i] > 0 ? 'text-neon-green' : gains[i] < 0 ? 'text-neon-pink' : 'text-slate-500'}`}>
                                {gains[i] > 0 ? '+' : ''}{gains[i]}
                            </span>
                            {/* Vertical slider */}
                            <div className="relative flex-1 flex items-center justify-center w-full">
                                <input
                                    type="range"
                                    min="-12"
                                    max="12"
                                    step="1"
                                    value={gains[i]}
                                    onChange={(e) => applyGain(i, Number(e.target.value))}
                                    style={{
                                        writingMode: 'vertical-lr' as any,
                                        direction: 'rtl' as any,
                                        WebkitAppearance: 'slider-vertical',
                                        width: '24px',
                                        height: '92px',
                                        cursor: 'pointer',
                                        accentColor: gains[i] > 0 ? '#00f5a0' : gains[i] < 0 ? '#FF2E63' : '#9d4edd',
                                    }}
                                />
                            </div>
                            {/* Frequency label */}
                            <span className="text-[10px] text-slate-500 text-center leading-tight">{band.label}</span>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Scale labels */}
                <div className="hidden md:flex mt-2 items-center gap-2">
                    <span className="text-xs text-slate-600">-12dB</span>
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-xs text-slate-600">0dB</span>
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-xs text-slate-600">+12dB</span>
                </div>
            </div>

            {/* Footer hint */}
            <div className="hidden md:block px-5 pb-4 text-center">
                <p className="text-xs text-slate-600">Settings auto-save after 1.5s of inactivity</p>
            </div>
            </div>
        </>
    );
}
