'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useThemeStore } from '@/store/themeStore';

export default function VisualizerCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyser = usePlayerStore(state => state.audioAnalyser);
    const isPlaying = usePlayerStore(state => state.isPlaying);
    const { theme } = useThemeStore();

    useEffect(() => {
        if (!canvasRef.current || !analyser) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Automatically match canvas internal resolution to display size for crispness
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth * (window.devicePixelRatio || 1);
                canvas.height = parent.clientHeight * (window.devicePixelRatio || 1);
            }
        };
        resize();
        window.addEventListener('resize', resize);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationId: number;

        const draw = () => {
            if (!isPlaying) {
                cancelAnimationFrame(animationId);
                return;
            }

            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5; // Draw fewer bars but wider
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height;

                // Color based on theme
                if (theme === 'retro') {
                    ctx.fillStyle = i % 2 === 0 ? '#00f5a0' : '#FF2E63'; 
                } else if (theme === 'galaxy') {
                    ctx.fillStyle = `hsl(${280 + (i / bufferLength) * 40}, 100%, 60%)`;
                } else {
                    const r = barHeight + (25 * (i/bufferLength));
                    const g = 250 * (i/bufferLength);
                    const b = 255;
                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                }

                ctx.fillRect(x, height - barHeight, barWidth, barHeight);
                x += barWidth + 1; // 1px spacing
            }
        };

        if (isPlaying) {
            draw();
        } else {
            // Draw an idle state if paused
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, [analyser, isPlaying, theme]);

    if (!analyser) return null; // Don't render until audio API is ready

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen transition-opacity duration-1000"
            style={{ 
                opacity: isPlaying ? 0.3 : 0, 
                filter: theme === 'retro' ? 'none' : 'blur(2px)' 
            }}
        />
    );
}
