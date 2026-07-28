'use client';

import { ChevronLeft, Sparkles, Trophy, Users, Clock, HelpCircle, Loader2 } from 'lucide-react';

interface LocalSetupProps {
    setupGameplay: 'individual' | 'teams';
    setSetupGameplay: (val: 'individual' | 'teams') => void;
    targetScore: number;
    setTargetScore: (val: number) => void;
    maxPlayersPerTeam: number;
    setMaxPlayersPerTeam: (val: number) => void;
    maxPlayTime: number;
    setMaxPlayTime: (val: number) => void;
    isPending: boolean; // Add loader check [1]
    onBack: () => void;
    onSubmit: () => void;
    message: string;
}

export default function LocalSetup({
    setupGameplay,
    setSetupGameplay,
    targetScore,
    setTargetScore,
    maxPlayersPerTeam,
    setMaxPlayersPerTeam,
    maxPlayTime,
    setMaxPlayTime,
    isPending,
    onBack,
    onSubmit,
    message
}: LocalSetupProps) {
    return (
        <div className="flex flex-col min-h-screen bg-[#050508] text-white px-6 pt-14 pb-12 justify-between relative overflow-hidden font-mono select-none">
            <div className="absolute top-[5%] left-[5%] w-[60%] h-[50%] bg-[#ff5722]/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="space-y-6 overflow-y-auto max-h-[85vh] pr-1">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 bg-zinc-950/60 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-neutral-400 hover:text-white transition active:scale-90"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-base font-black text-white uppercase tracking-tight">LOCAL SETUP</h2>
                        <p className="text-[10px] text-[#ff5722] font-bold tracking-widest uppercase flex items-center gap-1 mt-0.5 animate-pulse">
                            <Sparkles className="w-3 h-3" /> PASS_AND_PLAY_CONFIG
                        </p>
                    </div>
                </div>

                <div className="space-y-6 pt-2">
                    {/* Format selection */}
                    <div>
                        <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5 mb-2">
                            <HelpCircle className="w-3.5 h-3.5" /> 01 / Gameplay Format
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-900 shadow-inner">
                            <button
                                type="button"
                                disabled={isPending}
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
                                disabled={isPending}
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

                    {/* Cards to win */}
                    <div>
                        <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5 mb-2">
                            <Trophy className="w-3.5 h-3.5" /> 02 / Min Cards to Win ({targetScore})
                        </label>
                        <div className="grid grid-cols-4 gap-2 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-900 shadow-inner">
                            {[5, 8, 10, 12].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => setTargetScore(val)}
                                    className={`py-2 text-xs font-bold transition duration-300 rounded-lg ${targetScore === val
                                        ? 'bg-[#ff5722] text-white shadow-md'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Team limits */}
                    {setupGameplay === 'teams' && (
                        <div className="animate-fade-in">
                            <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5 mb-2">
                                <Users className="w-3.5 h-3.5" /> 03 / Max Members Per Team ({maxPlayersPerTeam})
                            </label>
                            <div className="grid grid-cols-3 gap-2 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-900 shadow-inner">
                                {[2, 3, 4].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => setMaxPlayersPerTeam(val)}
                                        className={`py-2 text-xs font-bold transition duration-300 rounded-lg ${maxPlayersPerTeam === val
                                            ? 'bg-[#ff5722] text-white shadow-md'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                            }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Play time limits */}
                    <div>
                        <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5 mb-2">
                            <Clock className="w-3.5 h-3.5" /> {setupGameplay === 'teams' ? '04' : '03'} / Max Song Play Time ({maxPlayTime}s)
                        </label>
                        <div className="grid grid-cols-4 gap-2 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-900 shadow-inner">
                            {[15, 30, 60].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => setMaxPlayTime(val)}
                                    className={`py-2 text-xs font-bold transition duration-300 rounded-lg ${maxPlayTime === val
                                        ? 'bg-[#ff5722] text-white shadow-md'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    {val}s
                                </button>
                            ))}
                            <button
                                key={999999}
                                type="button"
                                disabled={isPending}
                                onClick={() => setMaxPlayTime(999999)}
                                className={`py-2 text-xs font-bold transition duration-300 rounded-lg ${maxPlayTime === 999999
                                    ? 'bg-[#ff5722] text-white shadow-md'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                FULL
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-6">
                <button
                    onClick={onSubmit}
                    disabled={isPending}
                    className="w-full bg-[#f4f4f5] hover:bg-white text-zinc-950 font-extrabold py-4 px-4 rounded-xl transition active:scale-95 text-xs tracking-wider flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> ESTABLISHING_ROSTER...
                        </>
                    ) : (
                        'CONFIGURE_PLAYER_ROSTER'
                    )}
                </button>

                {message && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-xs text-center animate-pulse">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}