'use client';

import { motion } from 'framer-motion';
import { Sparkles, Tv, Smartphone } from 'lucide-react';

interface ModeSelectionProps {
    onSelect: (mode: 'local' | 'online') => void;
}

export default function ModeSelection({ onSelect }: ModeSelectionProps) {
    return (
        <div className="flex flex-col min-h-screen bg-[#050508] text-white px-6 pt-14 pb-12 justify-between relative overflow-hidden font-mono select-none">
            {/* Background Ambient Glow Orb */}
            <div className="absolute top-[5%] left-[5%] w-[60%] h-[50%] bg-[#ff5722]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <span className="text-[10px] font-bold tracking-widest text-[#ff5722] uppercase flex items-center justify-center gap-1.5 bg-orange-500/10 px-3.5 py-1 rounded-full w-max mx-auto border border-orange-500/20 shadow-[0_0_15px_rgba(255,87,34,0.1)]">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> CONFIG_SELECTOR
                </span>
                <h1 className="text-5xl font-black text-white tracking-tight">
                    TUNELINE
                </h1>
                <p className="text-zinc-500 text-xs max-w-[280px] mx-auto font-sans leading-relaxed">
                    Challenge your friends in a high-stakes, real-time chronological battle.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
                <button
                    onClick={() => onSelect('local')}
                    className="bg-zinc-900/40 hover:bg-zinc-900/60 p-6 rounded-2xl border border-zinc-900 flex items-center gap-4 text-left transition duration-300 active:scale-[0.98] group"
                >
                    <div className="p-3.5 bg-orange-500/10 text-[#ff5722] rounded-xl group-hover:scale-105 group-hover:bg-orange-500/20 transition duration-300 shadow-[0_0_15px_rgba(255,87,34,0.15)] border border-orange-500/10">
                        <Tv className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">[ 01 / LOCAL_MODE ]</h3>
                        <p className="text-[11px] text-zinc-500 mt-1 font-sans">Pass-and-play matches on this single screen.</p>
                    </div>
                </button>

                <button
                    onClick={() => onSelect('online')}
                    className="bg-zinc-900/40 hover:bg-zinc-900/60 p-6 rounded-2xl border border-zinc-900 flex items-center gap-4 text-left transition duration-300 active:scale-[0.98] group"
                >
                    <div className="p-3.5 bg-orange-500/10 text-[#ff5722] rounded-xl group-hover:scale-105 group-hover:bg-orange-500/20 transition duration-300 shadow-[0_0_15px_rgba(255,87,34,0.15)] border border-orange-500/10">
                        <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">[ 02 / ONLINE_MODE ]</h3>
                        <p className="text-[11px] text-zinc-500 mt-1 font-sans">Multiplayer session matching via dynamic room codes.</p>
                    </div>
                </button>
            </div>

            <div className="text-center text-[10px] text-zinc-600 tracking-widest uppercase">
                © TUNELINE INC // ALL RIGHTS RESERVED
            </div>
        </div>
    );
}