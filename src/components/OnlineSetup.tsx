'use client';

import { ChevronLeft } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-4 animate-fade-in">
            <div className="w-full max-w-sm p-6 bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-850 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-white">Online Setup</h2>
                        <p className="text-[10px] text-neutral-400">Multi-device matching</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">Lobby Format</label>
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

                    <div>
                        <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">Your Name</label>
                        <input
                            type="text"
                            maxLength={15}
                            className="w-full p-3 rounded-xl bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                            placeholder="Your Name (Host)"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">Room ID</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={6}
                                className="flex-1 p-3 rounded-xl bg-neutral-800 text-white border border-neutral-700 uppercase font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                                placeholder="CODE"
                                value={roomInput}
                                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                            />
                            <button
                                type="button"
                                onClick={onGenerateCode}
                                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 rounded-xl border border-neutral-700 text-xs font-semibold active:scale-95 transition"
                            >
                                Generate
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => onSubmit(roomInput)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold py-3.5 px-4 rounded-xl active:scale-[0.98] transition mt-2 shadow-lg shadow-yellow-500/10"
                    >
                        Join Online Lobby
                    </button>
                </div>

                {message && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-xs text-center font-medium animate-pulse">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}