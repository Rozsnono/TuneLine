'use client';

import { ChevronLeft, Sparkles } from 'lucide-react';

interface OnlineSetupProps {
    setupGameplay: 'individual' | 'teams';
    setSetupGameplay: (val: 'individual' | 'teams') => void;
    playerName: string;
    setPlayerName: (val: string) => void;
    roomInput: string;
    setRoomInput: (val: string) => void;
    onGenerateCode: () => void;
    onBack: () => void;
    onSubmit: (roomId: string) => void;
    message: string;
}

export default function OnlineSetup({
    setupGameplay,
    setSetupGameplay,
    playerName,
    setPlayerName,
    roomInput,
    setRoomInput,
    onGenerateCode,
    onBack,
    onSubmit,
    message
}: OnlineSetupProps) {
    return (
        <div className="flex flex-col min-h-screen bg-[#050508] text-white px-6 pt-14 pb-12 justify-between relative overflow-hidden font-mono">
            <div className="absolute top-[5%] left-[5%] w-[50%] h-[50%] bg-[#ff5722]/5 rounded-full blur-[110px] pointer-events-none"></div>

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 bg-zinc-950/60 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-neutral-400 hover:text-white transition active:scale-90"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-base font-black text-white uppercase tracking-tight">ONLINE SETUP</h2>
                        <p className="text-[10px] text-[#ff5722] font-bold tracking-widest uppercase flex items-center gap-1 mt-0.5 animate-pulse">
                            <Sparkles className="w-3 h-3" /> MATCH_ESTABLISHMENT
                        </p>
                    </div>
                </div>

                <div className="space-y-4 pt-6">
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">Lobby Format</label>
                        <div className="grid grid-cols-2 gap-2 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-900 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setSetupGameplay('individual')}
                                className={`py-2.5 rounded-lg text-xs font-bold transition duration-300 ${setupGameplay === 'individual'
                                        ? 'bg-[#ff5722] text-white shadow-md'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                Individual
                            </button>
                            <button
                                type="button"
                                onClick={() => setSetupGameplay('teams')}
                                className={`py-2.5 rounded-lg text-xs font-bold transition duration-300 ${setupGameplay === 'teams'
                                        ? 'bg-[#ff5722] text-white shadow-md'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                Team vs Team
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-1.5">Your Name</label>
                        <input
                            type="text"
                            maxLength={15}
                            className="w-full p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 focus:outline-none focus:ring-2 focus:ring-[#ff5722] text-sm text-white"
                            placeholder="Enter Display Name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-1.5">Room ID</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={6}
                                className="flex-1 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-855 uppercase font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#ff5722] text-sm text-white"
                                placeholder="CODE"
                                value={roomInput}
                                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                            />
                            <button
                                type="button"
                                onClick={onGenerateCode}
                                className="bg-zinc-900 hover:bg-neutral-750 text-neutral-300 px-5 rounded-xl border border-zinc-800 text-xs font-bold active:scale-95 transition"
                            >
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => onSubmit(roomInput)}
                    className="w-full bg-[#f4f4f5] hover:bg-white text-zinc-950 font-extrabold py-4 px-4 rounded-xl transition active:scale-95 text-xs tracking-wider"
                >
                    JOIN_MATCH_LOBBY
                </button>

                {message && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-xs text-center font-medium animate-pulse">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}