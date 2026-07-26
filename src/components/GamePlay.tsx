'use client';

import { GameState, Player, Card } from '@/types/game';
import {
    Music4,
    LogOut,
    Pause,
    Play,
    Square,
    AlertTriangle,
    AlertCircle,
    Swords,
    Disc
} from 'lucide-react';

interface GamePlayProps {
    game: GameState;
    playerId: string;
    activeModeType: 'local' | 'online';
    isMyTurn: boolean;
    activePlayer: Player | null;
    myPlayer: Player | null;
    canPlayActiveTurn: boolean;
    isPlaying: boolean;
    playerRef: React.MutableRefObject<any>;
    onToggleAudio: () => void;
    onStopAudio: () => void;
    onReportBroken: () => void;
    onSubmitPlacement: () => void;
    onRevealMetadata: () => void;
    onResolveTurnWithMetadata: (choice: 'none' | 'artist' | 'title' | 'both') => void;
    onSubmitSteal: () => void;
    selectedSlot: number | null;
    setSelectedSlot: (val: number | null) => void;
    isStealing: boolean;
    setIsStealing: (val: boolean) => void;
    localStealerId: string;
    setLocalStealerId: (val: string) => void;
    message: string;
    onLeaveGame: () => void;
}

export default function GamePlay({
    game,
    playerId,
    activeModeType,
    isMyTurn,
    activePlayer,
    myPlayer,
    canPlayActiveTurn,
    isPlaying,
    onToggleAudio,
    onStopAudio,
    onReportBroken,
    onSubmitPlacement,
    onRevealMetadata,
    onResolveTurnWithMetadata,
    onSubmitSteal,
    selectedSlot,
    setSelectedSlot,
    isStealing,
    setIsStealing,
    localStealerId,
    setLocalStealerId,
    message,
    onLeaveGame
}: GamePlayProps) {

    // Dynamic board calculations
    let activeTimelineOwnerName = '';
    let activeTimeline: Card[] = [];
    let activeTokens = 0;

    if (game.gameplayMode === 'teams') {
        const activeTeam = (game.teams || []).find((t) => t.id === game.currentTurnTeamId);
        if (activeTeam) {
            activeTimelineOwnerName = activeTeam.name;
            activeTimeline = activeTeam.timeline || [];
            activeTokens = activeTeam.tokens || 0;
        }
    } else {
        if (activePlayer) {
            activeTimelineOwnerName = activePlayer.name;
            activeTimeline = activePlayer.timeline || [];
            activeTokens = activePlayer.tokens || 0;
        }
    }

    // Steal possibilities
    let eligibleLocalStealers: { id: string; name: string }[] = [];
    if (game.mode === 'local' && game.status === 'playing' && game.phase === 'revealed' && game.lastGuessCorrect === false) {
        if (game.gameplayMode === 'teams') {
            const otherTeam = (game.teams || []).find((t) => t.id !== game.currentTurnTeamId);
            if (otherTeam) {
                eligibleLocalStealers = [{ id: otherTeam.id, name: otherTeam.name }];
            }
        } else {
            eligibleLocalStealers = (game.players || [])
                .filter((p) => p.id !== game.currentTurnPlayerId)
                .map((p) => ({ id: p.id, name: p.name }));
        }
    }

    let stealTimeline: Card[] = [];
    let stealOwnerName = '';
    if (isStealing) {
        if (activeModeType === 'local') {
            if (localStealerId) {
                if (game.gameplayMode === 'teams') {
                    const t = (game.teams || []).find((x) => x.id === localStealerId);
                    stealTimeline = t?.timeline || [];
                    stealOwnerName = t?.name || '';
                } else {
                    const p = (game.players || []).find((x) => x.id === localStealerId);
                    stealTimeline = p?.timeline || [];
                    stealOwnerName = p?.name || '';
                }
            }
        } else {
            if (game.gameplayMode === 'teams') {
                const myTeam = (game.teams || []).find((t) => t.id === myPlayer?.teamId);
                stealTimeline = myTeam?.timeline || [];
                stealOwnerName = myTeam?.name || '';
            } else {
                stealTimeline = myPlayer?.timeline || [];
                stealOwnerName = myPlayer?.name || '';
            }
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-neutral-950 text-white pb-12 animate-fade-in">
            <header className="bg-neutral-900 border-b border-neutral-800 py-4 px-6 sticky top-0 z-50 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-yellow-500">HITSTER</h1>
                    <span className="text-xs text-neutral-400 font-mono">ROOM: {game.roomId}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        className={`px-3 py-1 border rounded-full text-xs font-semibold flex items-center gap-1.5 ${game.gameplayMode === 'teams'
                                ? game.currentTurnTeamId === 'A'
                                    ? 'bg-blue-600/20 border-blue-500/20 text-blue-400'
                                    : 'bg-red-600/20 border-red-500/20 text-red-400'
                                : 'bg-neutral-850 border-neutral-300 text-neutral-300 border-neutral-800'
                            }`}
                    >
                        <Music4 className="w-3.5 h-3.5" />
                        {activeModeType === 'local'
                            ? `${activeTimelineOwnerName} (${activePlayer?.name || 'Local Player'})`
                            : isMyTurn
                                ? 'Your Turn'
                                : `${activeTimelineOwnerName}`}
                    </span>
                    <button
                        onClick={onLeaveGame}
                        className="p-2 bg-neutral-850 hover:bg-neutral-800 rounded-xl border border-neutral-750 transition text-neutral-400 hover:text-red-400 border-neutral-800"
                        title="Exit Room"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-md mx-auto w-full px-4 mt-6 space-y-6">
                {/* Spinning Vinyl Record Player Card */}
                <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 shadow-xl flex flex-col items-center">
                    <div className="relative mb-6">
                        {/* Spinning Record Core */}
                        <div
                            className={`w-40 h-40 rounded-full bg-neutral-950 border-8 border-neutral-800 shadow-2xl flex items-center justify-center transition-transform duration-1000 ${isPlaying ? 'animate-spin [animation-duration:10s]' : ''
                                }`}
                        >
                            <div className="w-16 h-16 rounded-full bg-yellow-500 border-4 border-neutral-950 flex items-center justify-center">
                                <Disc className={`w-8 h-8 text-neutral-950 ${isPlaying ? 'animate-pulse' : ''}`} />
                            </div>
                        </div>

                        {/* Tone Arm */}
                        <div
                            className={`absolute top-0 right-2 w-12 h-20 origin-top-left transition-transform duration-500 ${isPlaying ? 'rotate-[15deg]' : '-rotate-[15deg]'
                                }`}
                            style={{ transformOrigin: 'top left' }}
                        >
                            <div className="w-2 h-16 bg-neutral-400 rounded-full ml-6 shadow-md"></div>
                            <div className="w-4 h-6 bg-neutral-500 rounded-sm ml-5 border border-neutral-600 shadow-sm"></div>
                        </div>
                    </div>

                    {game.phase === 'placement' && (
                        <div className="text-center mb-6 space-y-1">
                            <span className="text-[10px] font-bold tracking-widest bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full uppercase">
                                Phase 1: Chronology Placement
                            </span>
                            <p className="text-neutral-400 text-xs mt-2 max-w-[280px]">
                                Listen to the track and place it inside the <span className="text-neutral-100 font-bold">{activeTimelineOwnerName}</span> board.
                            </p>
                        </div>
                    )}

                    {game.phase === 'metadata_guess' && (
                        <div className="text-center mb-6 space-y-1">
                            <span className="text-[10px] font-bold tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full uppercase">
                                Phase 2: Trivia Guessing
                            </span>
                            <p className="text-yellow-500 font-extrabold text-lg mt-2">Position Locked!</p>
                            <p className="text-neutral-300 text-xs max-w-[280px] mt-1">
                                Say the <span className="font-extrabold text-white">Song Title and Artist</span> out loud to the room.
                            </p>
                        </div>
                    )}

                    {game.phase === 'revealed' && (
                        <div className="text-center mb-6 space-y-2 w-full">
                            <span className="text-[10px] font-bold tracking-widest bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full uppercase">
                                Phase 3: Resolved
                            </span>
                            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-850 mt-3 space-y-1">
                                <span className="text-[9px] text-neutral-500 font-mono">SONG TRACK INFO</span>
                                <h3 className="text-lg font-black text-white truncate px-2">{game.currentCard?.title}</h3>
                                <p className="text-yellow-500 text-sm font-semibold truncate px-2">{game.currentCard?.artist}</p>
                                <div className="pt-2">
                                    <span className="text-xs bg-neutral-900 border border-neutral-850 text-neutral-300 px-3 py-1 rounded-md font-mono font-bold">
                                        Released: {game.currentCard?.year}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onToggleAudio}
                            className="bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-bold py-3 px-5 rounded-xl flex items-center gap-2 transition active:scale-95 text-xs shadow-md shadow-yellow-500/10"
                        >
                            {isPlaying ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play Audio</>}
                        </button>
                        <button
                            onClick={onStopAudio}
                            className="bg-neutral-850 hover:bg-neutral-800 text-neutral-200 font-bold py-3 px-5 rounded-xl flex items-center gap-2 border border-neutral-700 transition active:scale-95 text-xs"
                        >
                            <Square className="w-4 h-4" /> Stop
                        </button>
                    </div>

                    {/* Real-time Song Reporting Option */}
                    {canPlayActiveTurn && game.status === 'playing' && (
                        <button
                            onClick={onReportBroken}
                            className="mt-4 text-[10px] uppercase font-mono tracking-wider text-neutral-500 hover:text-red-400 flex items-center gap-1 transition active:scale-95"
                        >
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> Report / Skip Song
                        </button>
                    )}
                </div>

                {/* Dynamic Steal Option / Challenger Timeline Board overlay */}
                {isStealing && (
                    <div className="bg-neutral-900 p-5 rounded-3xl border border-dashed border-red-500/40 shadow-xl space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase font-mono">
                                <Swords className="w-4 h-4 animate-pulse" /> Stealer: {stealOwnerName}
                            </div>
                            <button
                                onClick={() => { setIsStealing(false); setSelectedSlot(null); }}
                                className="text-xs text-neutral-500 hover:text-neutral-300 font-semibold"
                            >
                                Cancel Steal
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setSelectedSlot(0)}
                                className={`w-full py-2 border border-dashed rounded-xl text-[10px] flex items-center justify-center gap-1 ${selectedSlot === 0 ? 'bg-red-500/20 border-red-500 text-red-400 font-bold' : 'border-neutral-800 text-neutral-600'
                                    }`}
                            >
                                Place Steal Here (Oldest)
                            </button>

                            {(stealTimeline || []).map((card, idx) => (
                                <div key={card.id} className="space-y-3">
                                    <div className="bg-neutral-950 p-3.5 rounded-2xl flex justify-between items-center border border-neutral-850 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500/50"></div>
                                        <div>
                                            <div className="font-bold text-xs text-neutral-300">{card.title}</div>
                                            <div className="text-[10px] text-neutral-500 mt-0.5">{card.artist}</div>
                                        </div>
                                        <span className="bg-neutral-900 text-red-400 font-mono text-[10px] px-2 py-0.5 rounded border border-neutral-800 font-bold">
                                            {card.year}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => setSelectedSlot(idx + 1)}
                                        className={`w-full py-2 border border-dashed rounded-xl text-[10px] flex items-center justify-center gap-1 ${selectedSlot === idx + 1 ? 'bg-red-500/20 border-red-500 text-red-400 font-bold' : 'border-neutral-800 text-neutral-600'
                                            }`}
                                    >
                                        Place Steal Here
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            disabled={selectedSlot === null}
                            onClick={onSubmitSteal}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition disabled:opacity-50"
                        >
                            Submit Steal Attempt (Penalty: -1 Token if wrong)
                        </button>
                    </div>
                )}

                {/* Current Turn Board Layout */}
                {!isStealing && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                            <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-500">
                                Active Board: {activeTimelineOwnerName}
                            </h3>
                            <span className="text-xs text-yellow-500 font-mono bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                                Tokens: {activeTokens}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {/* Slot 0 Button */}
                            {game.phase === 'placement' && canPlayActiveTurn && (
                                <button
                                    onClick={() => setSelectedSlot(0)}
                                    className={`w-full py-2.5 border-2 border-dashed rounded-xl transition text-xs flex items-center justify-center gap-1.5 ${selectedSlot === 0
                                            ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 font-bold'
                                            : 'border-neutral-850 text-neutral-600 hover:border-neutral-800 hover:text-neutral-500'
                                        }`}
                                >
                                    <Plus className="w-3.5 h-3.5" /> Place Here (Oldest)
                                </button>
                            )}

                            {(activeTimeline || []).map((card, idx) => (
                                <div key={card.id} className="space-y-3">
                                    <div className="bg-neutral-900 p-4 rounded-2xl flex justify-between items-center border border-neutral-850 shadow-sm relative overflow-hidden group">
                                        <div
                                            className={`absolute top-0 left-0 bottom-0 w-1 ${game.gameplayMode === 'teams'
                                                    ? game.currentTurnTeamId === 'A' ? 'bg-blue-500' : 'bg-red-500'
                                                    : 'bg-yellow-500'
                                                }`}
                                        ></div>
                                        <div>
                                            <div className="font-bold text-sm text-neutral-200">{card.title}</div>
                                            <div className="text-xs text-neutral-400 mt-0.5">{card.artist}</div>
                                        </div>
                                        <span className="bg-neutral-950 text-yellow-500 font-mono text-xs px-2.5 py-1 rounded-md border border-neutral-800 font-bold">
                                            {card.year}
                                        </span>
                                    </div>

                                    {/* Insertion Slot Button */}
                                    {game.phase === 'placement' && canPlayActiveTurn && (
                                        <button
                                            onClick={() => setSelectedSlot(idx + 1)}
                                            className={`w-full py-2.5 border-2 border-dashed rounded-xl transition text-xs flex items-center justify-center gap-1.5 ${selectedSlot === idx + 1
                                                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 font-bold'
                                                    : 'border-neutral-850 text-neutral-600 hover:border-neutral-800 hover:text-neutral-500'
                                                }`}
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Place Here
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Turn Resolution controls */}
                        {canPlayActiveTurn && (
                            <div className="pt-4">
                                {game.phase === 'placement' && (
                                    <button
                                        disabled={selectedSlot === null}
                                        onClick={onSubmitPlacement}
                                        className="w-full bg-yellow-500 disabled:bg-neutral-900 disabled:text-neutral-600 disabled:border disabled:border-neutral-850 hover:bg-yellow-600 text-black font-extrabold py-4 px-4 rounded-xl transition shadow-lg shadow-yellow-500/5 text-sm animate-pulse"
                                    >
                                        Lock Placement Guess
                                    </button>
                                )}

                                {game.phase === 'metadata_guess' && (
                                    <button
                                        onClick={onRevealMetadata}
                                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold py-4 px-4 rounded-xl transition shadow-lg shadow-yellow-500/5 text-sm"
                                    >
                                        Reveal Answer Details
                                    </button>
                                )}

                                {game.phase === 'revealed' && (
                                    <div className="space-y-4 p-4 bg-neutral-900 rounded-3xl border border-neutral-850">
                                        <div className="flex justify-center items-center gap-2 text-neutral-300 text-xs">
                                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                                            <span>
                                                Timeline guess was:{' '}
                                                <span className={`font-bold ${game.lastGuessCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {game.lastGuessCorrect ? 'CORRECT' : 'INCORRECT'}
                                                </span>
                                            </span>
                                        </div>

                                        {/* Active Guess Rating */}
                                        {game.lastGuessCorrect && (
                                            <div className="pt-2 border-t border-neutral-800">
                                                <div className="grid grid-cols-2 gap-2 mt-3">
                                                    <button
                                                        onClick={() => onResolveTurnWithMetadata('none')}
                                                        className="bg-neutral-800 hover:bg-neutral-750 text-white font-bold py-2.5 px-3 rounded-xl text-xs border border-neutral-705 transition active:scale-95"
                                                    >
                                                        Missed Both (0 Tokens)
                                                    </button>
                                                    <button
                                                        onClick={() => onResolveTurnWithMetadata('artist')}
                                                        className="bg-yellow-600/30 border border-yellow-500/30 hover:bg-yellow-600/40 text-yellow-400 font-bold py-2.5 px-3 rounded-xl text-xs transition active:scale-95"
                                                    >
                                                        Only Artist (+1)
                                                    </button>
                                                    <button
                                                        onClick={() => onResolveTurnWithMetadata('title')}
                                                        className="bg-yellow-600/30 border border-yellow-500/30 hover:bg-yellow-600/40 text-yellow-400 font-bold py-2.5 px-3 rounded-xl text-xs transition active:scale-95"
                                                    >
                                                        Only Title (+1)
                                                    </button>
                                                    <button
                                                        onClick={() => onResolveTurnWithMetadata('both')}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition active:scale-95"
                                                    >
                                                        Guessed Both! (+2)
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {!game.lastGuessCorrect && (
                                            <div className="pt-2 border-t border-neutral-800 flex flex-col gap-3">
                                                <button
                                                    onClick={() => onResolveTurnWithMetadata('none')}
                                                    className="w-full bg-neutral-850 hover:bg-neutral-800 text-neutral-300 font-bold py-3 px-4 rounded-xl text-xs transition active:scale-95 border border-neutral-800"
                                                >
                                                    Discard Card & Next Turn
                                                </button>

                                                {activeModeType === 'local' && eligibleLocalStealers.length > 0 && (
                                                    <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-850 space-y-2">
                                                        <span className="text-[10px] text-red-400 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                                                            <Swords className="w-3.5 h-3.5" /> Steal Opportunity (Pass-And-Play)
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <select
                                                                className="flex-1 bg-neutral-800 p-2 text-xs rounded-xl border border-neutral-700 focus:outline-none font-sans"
                                                                value={localStealerId}
                                                                onChange={(e) => setLocalStealerId(e.target.value)}
                                                            >
                                                                <option value="">Select Stealer...</option>
                                                                {eligibleLocalStealers.map((s) => (
                                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                disabled={!localStealerId}
                                                                onClick={() => setIsStealing(true)}
                                                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1"
                                                            >
                                                                <Swords className="w-3.5 h-3.5" /> Steal!
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {activeModeType === 'online' && !isMyTurn && (
                                                    <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-850 flex items-center justify-between animate-pulse">
                                                        <span className="text-[10px] text-red-400 font-bold uppercase font-mono tracking-wider flex items-center gap-1">
                                                            <Swords className="w-3.5 h-3.5" /> Opponent Missed!
                                                        </span>
                                                        <button
                                                            onClick={() => setIsStealing(true)}
                                                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1 active:scale-95"
                                                        >
                                                            <Swords className="w-3.5 h-3.5" /> Attempt Steal
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {message && (
                    <p className="p-3 bg-red-950/20 text-red-400 border border-red-900/30 rounded-xl text-center text-xs animate-pulse font-medium">
                        {message}
                    </p>
                )}
            </main>
        </div>
    );
}

// Custom timeline icon
function Plus({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}