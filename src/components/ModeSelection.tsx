'use client';

import { Sparkles, Tv, Smartphone } from 'lucide-react';

interface ModeSelectionProps {
    onSelect: (mode: 'local' | 'online') => void;
}

export default function ModeSelection({ onSelect }: ModeSelectionProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050508] text-white px-4 relative overflow-hidden font-mono">
            {/* Dynamic Background Ambient Glow Orbs */}
            <div className="absolute top-[5%] left-[5%] w-[50%] h-[50%] bg-[#ff5722]/5 rounded-full blur-[110px] pointer-events-none"></div>

            <div className="w-full max-w-sm p-6 bg-zinc-900/60 backdrop-blur-md rounded-3xl shadow-2xl border border-zinc-800/80 space-y-8 z-10">
                <div className="text-center">
                    <span className="text-[10px] font-bold tracking-widest text-[#ff5722] uppercase flex items-center justify-center gap-1.5 bg-orange-500/10 px-3 py-1 rounded-full w-max mx-auto border border-orange-500/20 shadow-[0_0_15px_rgba(255,87,34,0.1)]">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> CONFIG_SELECTOR
                    </span>
                    <h1 className="text-4xl font-black mt-4 text-white tracking-tight">
                        TUNELINE
                    </h1>
                    <p className="text-zinc-500 text-xs mt-2 max-w-[260px] mx-auto font-sans leading-relaxed">
                        Challenge your friends in a high-stakes, real-time chronological battle.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => onSelect('local')}
                        className="bg-zinc-950/60 hover:bg-zinc-850/80 p-5 rounded-2xl border border-zinc-800 flex items-center gap-4 text-left transition duration-300 active:scale-[0.98] group shadow-inner"
                    >
                        <div className="p-3 bg-orange-500/10 text-[#ff5722] rounded-xl group-hover:scale-105 group-hover:bg-orange-500/20 transition duration-300 shadow-[0_0_15px_rgba(255,87,34,0.15)] border border-orange-500/10">
                            <Tv className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">[ 01 / LOCAL_MODE ]</h3>
                            <p className="text-[11px] text-zinc-500 mt-1 font-sans">Pass-and-play matches on this single screen.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelect('online')}
                        className="bg-zinc-950/60 hover:bg-zinc-850/80 p-5 rounded-2xl border border-zinc-800 flex items-center gap-4 text-left transition duration-300 active:scale-[0.98] group shadow-inner"
                    >
                        <div className="p-3 bg-orange-500/10 text-[#ff5722] rounded-xl group-hover:scale-105 group-hover:bg-orange-500/20 transition duration-300 shadow-[0_0_15px_rgba(255,87,34,0.15)] border border-orange-500/10">
                            <Smartphone className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">[ 02 / ONLINE_MODE ]</h3>
                            <p className="text-[11px] text-zinc-500 mt-1 font-sans">Multiplayer session matching via dynamic room codes.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}