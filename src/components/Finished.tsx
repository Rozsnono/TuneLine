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
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-4 animate-fade-in">
            <div className="w-full max-w-sm p-8 bg-neutral-900 rounded-3xl border border-neutral-850 text-center shadow-2xl space-y-6">
                <div className="mx-auto w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-2xl flex items-center justify-center shadow-inner">
                    <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white">Victory!</h2>
                    <p className="text-neutral-400 text-sm">A master timeline has been completed.</p>
                </div>

                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-850">
                    <p className="text-xs text-neutral-500 uppercase font-mono">Winner</p>
                    <p className="text-lg font-bold text-yellow-500 mt-1">{winningEntityName}</p>
                </div>

                <div className="flex gap-2">
                    {(isHost || activeModeType === 'local') && (
                        <button
                            onClick={onRestart}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> Restart
                        </button>
                    )}
                    <button
                        onClick={onLeave}
                        className="flex-1 bg-neutral-800 hover:bg-neutral-750 text-white font-bold py-3.5 px-4 rounded-xl border border-neutral-700 transition"
                    >
                        Exit Room
                    </button>
                </div>
            </div>
        </div>
    );
}