'use client';

import { Sparkles, Tv, Smartphone } from 'lucide-react';

interface ModeSelectionProps {
    onSelect: (mode: 'local' | 'online') => void;
}

export default function ModeSelection({ onSelect }: ModeSelectionProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-4 animate-fade-in">
            <div className="w-full max-w-sm p-6 bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-850 space-y-6">
                <div className="text-center">
                    <span className="text-xs font-bold tracking-widest text-yellow-500 uppercase flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Interactive Party Game
                    </span>
                    <h1 className="text-4xl font-black mt-1 text-white tracking-tight">HITSTER</h1>
                    <p className="text-neutral-400 text-xs mt-2">Choose how you want to play today</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => onSelect('local')}
                        className="bg-neutral-800 hover:bg-neutral-750 p-5 rounded-2xl border border-neutral-700 flex items-center gap-4 text-left transition active:scale-[0.98] group"
                    >
                        <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl group-hover:scale-105 transition">
                            <Tv className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-lg text-white">Local Pass & Play</h3>
                            <p className="text-xs text-neutral-400 mt-0.5">Play with friends on this single phone.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelect('online')}
                        className="bg-neutral-800 hover:bg-neutral-750 p-5 rounded-2xl border border-neutral-700 flex items-center gap-4 text-left transition active:scale-[0.98] group"
                    >
                        <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl group-hover:scale-105 transition">
                            <Smartphone className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-lg text-white">Online Multiplayer</h3>
                            <p className="text-xs text-neutral-400 mt-0.5">Play on multiple devices via room codes.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}