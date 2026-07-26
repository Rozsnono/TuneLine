'use client';

import { ChevronLeft, Sparkles } from 'lucide-react';

interface LocalSetupProps {
    setupGameplay: 'individual' | 'teams';
    setSetupGameplay: (val: 'individual' | 'teams') => void;
    onBack: () => void;
    onSubmit: () => void;
    message: string;
}

export default function LocalSetup({
    setupGameplay,
    setSetupGameplay,
    onBack,
    onSubmit,
    message
}: LocalSetupProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050508] text-white px-4 relative overflow-hidden font-mono">
            <div className="absolute top-[5%] left-[5%] w-[50%] h-[50%] bg-[#ff5722]/5 rounded-full blur-[110px] pointer-events-none"></div>

            <div className="w-full max-w-sm p-6 bg-zinc-900/60 backdrop-blur-md rounded-3xl shadow-2xl border border-zinc-850 space-y-6 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2.5 bg-zinc-950/60 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition active:scale-90"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-base font-black text-white uppercase tracking-tight">LOCAL GAMEPLAY</h2>
                        <p className="text-[10px] text-[#ff5722] font-bold tracking-widest uppercase flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-3 h-3 animate-pulse" /> PASS_AND_PLAY_CONFIG
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">Gameplay Format</label>
                        <div className="grid grid-cols-2 gap-2 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-850 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setSetupGameplay('individual')}
                                className={`py-2 text-xs font-bold transition duration-300 rounded-lg ${setupGameplay === 'individual'
                                        ? 'bg-[#ff5722] text-white shadow-md'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                Individual
                            </button>
                            <button
                                type="button"
                                onClick={() => setSetupGameplay('teams')}
                                className={`py-2 text-xs font-bold transition duration-300 rounded-lg ${setupGameplay === 'teams'
                                        ? 'bg-[#ff5722] text-white shadow-md'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                Team vs Team
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onSubmit}
                        className="w-full bg-[#f4f4f5] hover:bg-white text-zinc-950 font-extrabold py-3.5 px-4 rounded-xl transition active:scale-95 text-xs tracking-wider"
                    >
                        CONFIGURE_PLAYER_ROSTER
                    </button>
                </div>

                {message && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-xs text-center animate-pulse">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}