'use client';

import { GameState, Player } from '@/types/game';
import { Pause, Play, AlertTriangle } from 'lucide-react';

interface MusicPlayerProps {
    game: GameState;
    activeModeType: 'local' | 'online';
    isPlaying: boolean;
    canPlayActiveTurn: boolean;
    activePlayer: Player | null;
    activeTimelineOwnerName: string;
    onToggleAudio: () => void;
    onReportBroken: () => void;
}

export default function MusicPlayer({
    game,
    activeModeType,
    isPlaying,
    canPlayActiveTurn,
    activePlayer,
    activeTimelineOwnerName,
    onToggleAudio,
    onReportBroken,
}: MusicPlayerProps) {
    return (
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl flex flex-col items-center">
            {/* Enlarged Turntable Deck Container (Scaled up to w-56 h-56) */}
            <div className="relative w-56 h-56 flex items-center justify-center mb-6">

                {/* ROTATING VINYL RECORD (Sits behind the static central play button) */}
                <div
                    className="absolute w-56 h-56 rounded-full border-4 border-zinc-800 shadow-[0_12px_45px_rgba(0,0,0,0.75)] overflow-hidden animate-spin [animation-duration:6s]"
                    style={{
                        background: 'conic-gradient(from 45deg, #09090b, #2d2d34 25%, #09090b 50%, #2d2d34 75%, #09090b)',
                        animationPlayState: isPlaying ? 'running' : 'paused',
                    }}
                >
                    {/* Concentric Platter Grooves (Re-mapped to fit the larger platter) */}
                    <div className="absolute inset-2.5 rounded-full border border-zinc-900/60"></div>
                    <div className="absolute inset-6 rounded-full border border-[#111113] border-dashed"></div>
                    <div className="absolute inset-10 rounded-full border border-zinc-900/50"></div>
                    <div className="absolute inset-16 rounded-full border border-zinc-900/40"></div>
                    <div className="absolute inset-20 rounded-full border border-zinc-900/30"></div>

                    {/* Asymmetrical High-Contrast Marker Dot (Positions adjusted for larger radius) */}
                    <div className="absolute top-6 right-16 w-3 h-3 rounded-full bg-orange-500/70 shadow-[0_0_10px_rgba(255,87,34,0.6)]"></div>
                </div>

                {/* STATIC CENTER SPINDLE PLAY BUTTON (Safety Orange Glow) */}
                <div className="w-20 h-20 rounded-full absolute bg-zinc-950 border border-zinc-900 flex items-center justify-center shadow-inner z-10">
                    <button
                        onClick={onToggleAudio}
                        className="w-14 h-14 rounded-full bg-[#ff5722] hover:bg-[#ff6c37] transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_2px_12px_rgba(255,87,34,0.45)] hover:shadow-[0_2px_18px_rgba(255,87,34,0.65)] active:scale-95 border border-[#ff6c37]/50"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" fill="white" />
                        ) : (
                            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                        )}
                    </button>
                </div>
            </div>

            {/* --- Phase-Dependent Control Outputs --- */}

            {/* Phase 1 (Placement): Completely minimalist setup, displaying zero text descriptors */}
            {game.phase === 'placement' && null}

            {/* Phase 2 (Trivia Guessing): Simplified, brief monospaced instruction */}
            {game.phase === 'metadata_guess' && (
                <div className="text-center mb-4">
                    <span className="text-[10px] font-bold tracking-widest text-[#ff5722] uppercase">
                        ✦ GUESS ARTIST &amp; TITLE ✦
                    </span>
                </div>
            )}

            {/* Phase 3 (Revealed Answer Panel) */}
            {game.phase === 'revealed' && (
                <div className="text-center mb-4 w-full">
                    <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-855 mt-1 text-left">
                        <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Song Info</span>
                        <h3 className="text-base font-black text-white truncate font-sans">{game.currentCard?.title}</h3>
                        <p className="text-[#ff5722] text-xs font-semibold truncate font-sans">{game.currentCard?.artist}</p>
                        <div className="pt-2">
                            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono font-bold">
                                Released: {game.currentCard?.year}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Skip/Flag Handler */}
            {canPlayActiveTurn && game.status === 'playing' && (
                <button
                    onClick={onReportBroken}
                    className="mt-2 text-[9px] uppercase tracking-wider text-zinc-500 hover:text-red-400 flex items-center gap-1.5 transition active:scale-95"
                >
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" /> [ SKIP_BROKEN_SONG ]
                </button>
            )}
        </div>
    );
}