'use client';

import { Trophy, RotateCcw, LogOut } from 'lucide-react';
import { GameState } from '@/types/game';

interface FinishedProps {
    game: GameState;
    isHost: boolean;
    activeModeType: 'local' | 'online';
    onRestart: () => void;
    onLeave: () => void;
}

export default function Finished({
    game,
    isHost,
    activeModeType,
    onRestart,
    onLeave
}: FinishedProps) {
    let winningEntityName = '';
    if (game.gameplayMode === 'teams') {
        const winnerTeam = (game.teams || []).find((t) => t.id === game.winnerId);
        winningEntityName = winnerTeam ? winnerTeam.name : 'Unknown Team';
    } else {
        const winnerPlayer = (game.players || []).find((p) => p.id === game.winnerId);
        winningEntityName = winnerPlayer ? winnerPlayer.name : 'Unknown Player';
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050508] text-white px-4 relative overflow-hidden font-mono animate-fade-in">
            <div className="absolute top-[5%] left-[5%] w-[50%] h-[50%] bg-[#ff5722]/5 rounded-full blur-[110px] pointer-events-none"></div>

            <div className="w-full max-w-sm p-8 bg-zinc-900 rounded-3xl border border-zinc-850 text-center shadow-2xl space-y-6 z-10">
                <div className="mx-auto w-16 h-16 bg-orange-500/10 border border-orange-500/30 text-[#ff5722] rounded-2xl flex items-center justify-center shadow-inner shadow-[0_0_15px_rgba(255,87,34,0.15)]">
                    <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Victory!</h2>
                    <p className="text-zinc-400 text-xs">A master chronology timeline has been established.</p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-850">
                    <p className="text-xs text-zinc-500 uppercase">Winner</p>
                    <p className="text-lg font-bold text-[#ff5722] mt-1">{winningEntityName}</p>
                </div>

                <div className="flex gap-2">
                    {(isHost || activeModeType === 'local') && (
                        <button
                            onClick={onRestart}
                            className="flex-1 bg-[#ff5722] hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs tracking-wider shadow-lg shadow-orange-500/10"
                        >
                            <RotateCcw className="w-4 h-4" /> Restart
                        </button>
                    )}
                    <button
                        onClick={onLeave}
                        className="flex-1 bg-neutral-800 hover:bg-neutral-750 text-white font-bold py-3.5 px-4 rounded-xl border border-neutral-700 transition text-xs tracking-wider"
                    >
                        Exit Room
                    </button>
                </div>
            </div>
        </div>
    );
}