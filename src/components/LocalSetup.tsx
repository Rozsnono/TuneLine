'use client';

import { ChevronLeft } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-4 animate-fade-in">
            <div className="w-full max-w-sm p-6 bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-850 space-y-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-white">Local Setup</h2>
                        <p className="text-[10px] text-neutral-400">Pass-and-play matches</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">Gameplay Format</label>
                        <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
                            <button
                                type="button"
                                onClick={() => setSetupGameplay('individual')}
                                className={`py-2 rounded-lg text-xs font-bold transition ${setupGameplay === 'individual' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400'
                                    }`}
                            >
                                Individual
                            </button>
                            <button
                                type="button"
                                onClick={() => setSetupGameplay('teams')}
                                className={`py-2 rounded-lg text-xs font-bold transition ${setupGameplay === 'teams' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400'
                                    }`}
                            >
                                Team vs Team
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onSubmit}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold py-3.5 px-4 rounded-xl transition shadow-lg shadow-yellow-500/10 active:scale-95"
                    >
                        Configure Player List
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