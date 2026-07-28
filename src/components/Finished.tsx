'use client';

import { Trophy, RotateCcw, LogOut, Loader2 } from 'lucide-react';
import { GameState } from '@/types/game';

interface FinishedProps {
    game: GameState;
    isHost: boolean;
    activeModeType: 'local' | 'online';
    isPending: boolean; // Add loader check [1]
    onRestart: () => void;
    onLeave: () => void;
}

export default function Finished({
    game,
    isHost,
    activeModeType,
    isPending,
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
        <div className="flex flex-col min-h-screen bg-[#050508] text-white px-6 pt-14 pb-12 justify-between relative overflow-hidden font-mono animate-fade-in">
            <div className="absolute top-[5%] left-[5%] w-[50%] h-[50%] bg-[#ff5722]/5 rounded-full blur-[110px] pointer-events-none"></div>

            <div className="text-center space-y-4 pt-12">
                <div className="mx-auto w-16 h-16 bg-orange-500/10 border border-orange-500/30 text-[#ff5722] rounded-2xl flex items-center justify-center shadow-inner shadow-[0_0_15px_rgba(255,87,34,0.15)] animate-pulse">
                    <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Victory!</h2>
                    <p className="text-zinc-500 text-xs">A master chronology timeline has been established.</p>
                </div>
            </div>

            <div className="p-5 bg-zinc-950/40 rounded-2xl border border-zinc-900 text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Match Winner</p>
                <p className="text-2xl font-black text-[#ff5722] mt-1">{winningEntityName}</p>
            </div>

            <div className="flex flex-col gap-3">
                {(isHost || activeModeType === 'local') && (
                    <button
                        onClick={onRestart}
                        disabled={isPending}
                        className="w-full bg-[#ff5722] hover:bg-orange-600 text-white font-bold py-4 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs tracking-wider shadow-lg shadow-orange-500/10 disabled:opacity-50"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> RESTARTING...
                            </>
                        ) : (
                            <>
                                <RotateCcw className="w-4 h-4" /> Restart
                            </>
                        )}
                    </button>
                )}
                <button
                    onClick={onLeave}
                    disabled={isPending}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 px-4 rounded-xl border border-zinc-800 transition text-xs tracking-wider disabled:opacity-50"
                >
                    Exit Room
                </button>
            </div>
        </div>
    );
}