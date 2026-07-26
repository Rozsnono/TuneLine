'use client';

import { useEffect, useRef } from 'react';

interface AudioWaveformProps {
    isPlaying: boolean;
    youtubeId: string;
}

export default function AudioWaveform({ isPlaying, youtubeId }: AudioWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const getSeed = (str: string) => {
            let hash = 0;
            if (!str) return 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            return Math.abs(hash);
        };

        const seed = getSeed(youtubeId);

        // RESTORED: Dynamic BPM-driven frequency oscillators for procedural matching
        const baseBPM = 100 + (seed % 50);
        const beatFreq = (baseBPM / 60) * Math.PI * 2;

        // Dynamic frequencies for clean procedural fallback
        const freqA = 1.8 + (seed % 7) * 0.15;
        const freqB = 2.9 + (seed % 5) * 0.25;
        const freqC = 4.3 + (seed % 9) * 0.1;
        const phaseShift = (seed % 10) * 0.5;

        // --- Web Audio API Microphone Stream Setup ---
        if (isPlaying) {
            const initMic = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    streamRef.current = stream;

                    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                    const audioCtx = new AudioContextClass();
                    audioCtxRef.current = audioCtx;

                    const source = audioCtx.createMediaStreamSource(stream);
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 64; // Low FFT size for 32 clean frequency bins
                    analyserRef.current = analyser;

                    source.connect(analyser);
                } catch (err) {
                    console.warn('Microphone permission blocked. Using procedural backup.', err);
                }
            };

            initMic();
        }

        const draw = () => {
            const now = performance.now();
            ctx.clearRect(0, 0, rect.width, rect.height);

            const centerY = rect.height / 2;
            const resolution = 200;

            // Draw neutral background baseline track
            ctx.strokeStyle = '#262626';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(rect.width, centerY);
            ctx.stroke();

            // Configure glowing color gradient (Rose Pink to Deep Purple)
            const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
            gradient.addColorStop(0, '#f43f5e');
            gradient.addColorStop(0.5, '#ec4899');
            gradient.addColorStop(1, '#a855f7');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Capture frequency buffers if mic is active
            let frequencies: Uint8Array | null = null;
            if (analyserRef.current) {
                const bufferLength = analyserRef.current.frequencyBinCount;
                frequencies = new Uint8Array(bufferLength);
                analyserRef.current.getByteFrequencyData(frequencies);
            }

            ctx.beginPath();

            // Render Continuous Wave Path
            for (let i = 0; i <= resolution; i++) {
                const p = i / resolution;
                const x = p * rect.width;
                let yOffset = 0;

                if (isPlaying) {
                    if (frequencies && frequencies.length > 0) {
                        // --- OPTION A: REAL FREQUENCY MIC DATA ---
                        const lowFreqIndex = Math.min(frequencies.length - 1, Math.floor(p * 8));
                        const highFreqIndex = Math.min(frequencies.length - 1, 10 + Math.floor(p * 12));

                        const lowAmp = frequencies[lowFreqIndex] / 255.0;
                        const highAmp = frequencies[highFreqIndex] / 255.0;

                        const envA = Math.exp(-Math.pow(p - 0.42, 2) / 0.005) * (5 + lowAmp * 35);
                        const envB = Math.exp(-Math.pow(p - 0.65, 2) / 0.003) * (4 + highAmp * 22);

                        const carrierA = Math.sin(p * 80 - now * 0.015);
                        const carrierB = Math.cos(p * 120 + now * 0.02);

                        yOffset = (envA * carrierA) + (envB * carrierB);
                    } else {
                        // --- OPTION B: PROCEDURAL FALLBACK DATA ---
                        const t = now * 0.001; // Continuous smooth delta time
                        const beatA = Math.sin(t * beatFreq) * 0.5 + 0.5;
                        const beatB = Math.cos(t * (beatFreq * 0.5)) * 0.5 + 0.5;

                        const envA = Math.exp(-Math.pow(p - 0.42, 2) / 0.005) * (14 + beatA * 26);
                        const envB = Math.exp(-Math.pow(p - 0.65, 2) / 0.003) * (8 + beatB * 18);

                        const carrierA = Math.sin(p * 80 - t * 14 + phaseShift);
                        const carrierB = Math.cos(p * 120 + t * 18);

                        yOffset = (envA * carrierA) + (envB * carrierB);
                    }
                } else {
                    // Idle breathing undulating wave
                    const envIdle = Math.exp(-Math.pow(p - 0.5, 2) / 0.08) * 8;
                    yOffset = envIdle * Math.sin(p * 20 - now * 0.0035);
                }

                const y = centerY + yOffset;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);

            // Cleanup: Stop microphone tracks instantly on pause to preserve battery and privacy
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
            analyserRef.current = null;
        };
    }, [isPlaying, youtubeId]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-24 bg-neutral-950/60 rounded-2xl border border-neutral-900/60 overflow-hidden block select-none"
        />
    );
}