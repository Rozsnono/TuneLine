'use client';

import { useState } from 'react';
import { GameState, Player, Card } from '@/types/game';
import {
    Music4,
    LogOut,
    Pause,
    Play,
    AlertTriangle,
    AlertCircle,
    Swords,
    Coins
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
    onResolveTurnWithMetadata: (choice: 'none' | 'artist' | 'title' | 'both', recipientId?: string) => void;
    onSubmitSteal: () => void;
    onBuyCard: () => void; // New callback for explicit token purchases
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
    onBuyCard,
    selectedSlot,
    setSelectedSlot,
    isStealing,
    setIsStealing,
    localStealerId,
    setLocalStealerId,
    message,
    onLeaveGame
}: GamePlayProps) {
    // Stateful turn resolution choices
    const [metadataChoice, setMetadataChoice] = useState<'none' | 'artist' | 'title' | 'both' | null>(null);
    const [tokenRecipientId, setTokenRecipientId] = useState<string>('');

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
    if (game.status === 'playing' && game.phase === 'revealed') {
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

    // Check if current user is eligible to buy card explicitly with 3 tokens [1, 2]
    let myTokens = 0;
    if (game.gameplayMode === 'teams') {
        const myTeam = (game.teams || []).find((t) => t.id === myPlayer?.teamId);
        myTokens = myTeam?.tokens || 0;
    } else {
        myTokens = myPlayer?.tokens || 0;
    }

    // Local Pass & Play handles active board tokens as eligible buy parameters
    const displayBuyButton = activeModeType === 'local' ? activeTokens >= 3 : myTokens >= 3;

    const handleResolveSubmit = () => {
        if (metadataChoice === null) return;
        onResolveTurnWithMetadata(metadataChoice, tokenRecipientId || undefined);
        setMetadataChoice(null);
        setTokenRecipientId('');
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#050508] text-zinc-100 pb-12 font-mono animate-fade-in">
            <header className="bg-zinc-950 border-b border-zinc-900 py-4 px-6 sticky top-0 z-50 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-white uppercase">TUNELINE</h1>
                    <span className="text-xs text-zinc-500 font-mono">ROOM: {game.roomId}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        className="px-3 py-1.5 border border-[#ff5722]/30 bg-zinc-950 text-[#ff5722] rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,87,34,0.1)]"
                    >
                        <Music4 className="w-3.5 h-3.5" />
                        {activeModeType === 'local'
                            ? `${activeTimelineOwnerName} (${activePlayer?.name || 'Local'})`
                            : isMyTurn
                                ? 'Your Turn'
                                : `${activeTimelineOwnerName}`}
                    </span>
                    <button
                        onClick={onLeaveGame}
                        className="p-2 bg-zinc-900 hover:bg-zinc-850 rounded-xl border border-zinc-800 transition text-zinc-400 hover:text-red-400"
                        title="Exit Room"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-md mx-auto w-full px-4 mt-6 space-y-6">
                {/* Sleek Concentric Platter Card */}
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl flex flex-col items-center">
                    <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                        <div
                            className={`absolute w-44 h-44 rounded-full border border-dashed border-zinc-800 flex items-center justify-center transition-transform duration-1000 ${isPlaying ? 'animate-spin [animation-duration:15s]' : ''
                                }`}
                        >
                            <div className="w-32 h-32 rounded-full border border-zinc-850 absolute"></div>
                            <div className="w-24 h-24 rounded-full border border-zinc-855/50 absolute"></div>
                        </div>

                        <button
                            onClick={onToggleAudio}
                            className="w-16 h-16 rounded-full absolute bg-[#ff5722] hover:bg-[#ff6c37] transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(255,87,34,0.3)] hover:shadow-[0_0_25px_rgba(255,87,34,0.45)] active:scale-95 z-10 border border-[#ff6c37]/50"
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6 text-white" />
                            ) : (
                                <Play className="w-6 h-6 text-white ml-1" />
                            )}
                        </button>
                    </div>

                    {game.phase === 'placement' && (
                        <div className="text-center mb-4 space-y-1">
                            <span className="text-[10px] font-bold tracking-widest bg-orange-500/10 text-[#ff5722] px-3 py-1 rounded-full uppercase border border-orange-500/20">
                                01 / CHRONOLOGY_PLACEMENT
                            </span>
                            <p className="text-zinc-400 text-xs mt-3 max-w-[280px] font-sans">
                                Listen and place this card chronologically inside the <span className="text-white font-bold">{activeTimelineOwnerName}</span> board.
                            </p>
                        </div>
                    )}

                    {game.phase === 'metadata_guess' && (
                        <div className="text-center mb-4 space-y-1">
                            <span className="text-[10px] font-bold tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full uppercase border border-emerald-500/20">
                                02 / TRIVIA_GUESSING
                            </span>
                            <p className="text-[#ff5722] font-extrabold text-base mt-3">POSITION_LOCKED</p>
                            <p className="text-zinc-300 text-xs max-w-[280px] mt-1 font-sans">
                                Say the <span className="font-extrabold text-white">Song Title & Artist</span> out loud to your friends.
                            </p>
                        </div>
                    )}

                    {game.phase === 'revealed' && (
                        <div className="text-center mb-4 space-y-2 w-full">
                            <span className="text-[10px] font-bold tracking-widest bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full uppercase border border-blue-500/20">
                                03 / RESOLVED
                            </span>
                            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-855 mt-3 space-y-1 text-left">
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

                {/* User Board Ledger */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <h3 className="text-xs uppercase tracking-widest text-zinc-500">Board: {activeTimelineOwnerName}</h3>
                        <div className="flex items-center gap-3">
                            {/* Tactical explicit Token Card purchasing button [1, 2] */}
                            {displayBuyButton && (
                                <button
                                    onClick={onBuyCard}
                                    className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-[9px] tracking-wider transition active:scale-95 flex items-center gap-1 shadow-[0_0_15px_rgba(255,87,34,0.2)]"
                                >
                                    <Coins className="w-3 h-3" /> BUY_CARD_3_TOKENS
                                </button>
                            )}
                            <span className="text-xs text-[#ff5722] font-mono bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 font-bold">
                                Tokens: {activeTokens}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Slot 0 Button */}
                        {game.phase === 'placement' && canPlayActiveTurn && (
                            <button
                                onClick={() => setSelectedSlot(0)}
                                className={`w-full py-2.5 border border-dashed rounded-xl transition text-[10px] flex items-center justify-center gap-1.5 ${selectedSlot === 0
                                        ? 'bg-orange-500/10 border-[#ff5722] text-[#ff5722] font-bold'
                                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                                    }`}
                            >
                                [ ✦ PRIOR TO {activeTimeline[0]?.year || 'Start'} ✦ ]
                            </button>
                        )}

                        {activeTimeline.map((card, idx) => (
                            <div key={card.id} className="space-y-3">
                                <div className="bg-zinc-900 p-4 rounded-2xl flex justify-between items-center border border-zinc-850 shadow-sm relative overflow-hidden group">
                                    <div
                                        className={`absolute top-0 left-0 bottom-0 w-1 ${game.gameplayMode === 'teams'
                                                ? game.currentTurnTeamId === 'A' ? 'bg-blue-500' : 'bg-red-500'
                                                : 'bg-[#ff5722]'
                                            }`}
                                    ></div>
                                    <div className="font-sans">
                                        <div className="font-bold text-sm text-zinc-200">{card.title}</div>
                                        <div className="text-xs text-zinc-500 mt-0.5">{card.artist}</div>
                                    </div>

                                    <div className="bg-gradient-to-b from-[#ff5722] to-[#b45309] text-white px-3 py-1.5 rounded-lg border border-[#b45309]/50 font-mono font-bold text-xs shadow-[0_0_15px_rgba(255,87,34,0.15)]">
                                        {card.year}
                                    </div>
                                </div>

                                {/* Insertion Slot Buttons */}
                                {game.phase === 'placement' && canPlayActiveTurn && (
                                    <button
                                        onClick={() => setSelectedSlot(idx + 1)}
                                        className={`w-full py-2.5 border-2 border-dashed rounded-xl transition text-[10px] flex items-center justify-center gap-1.5 ${selectedSlot === idx + 1
                                                ? 'bg-orange-500/10 border-[#ff5722] text-[#ff5722] font-bold'
                                                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                                            }`}
                                    >
                                        [ ✦ {idx + 2 < 10 ? `0${idx + 2}` : idx + 2} / INSERT POSITION ✦ ]
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
                                    className="w-full bg-[#f4f4f5] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border disabled:border-zinc-850 hover:bg-white text-zinc-950 font-extrabold py-3.5 px-4 rounded-xl transition text-xs"
                                >
                                    EXECUTE_SUBMISSION
                                </button>
                            )}

                            {game.phase === 'metadata_guess' && (
                                <button
                                    onClick={onRevealMetadata}
                                    className="w-full bg-[#f4f4f5] hover:bg-white text-zinc-950 font-extrabold py-3.5 px-4 rounded-xl transition text-xs"
                                >
                                    REVEAL_ANSWER_DETAILS
                                </button>
                            )}

                            {game.phase === 'revealed' && (
                                <div className="space-y-4 p-4 bg-zinc-900 rounded-3xl border border-zinc-855">
                                    <div className="flex justify-center items-center gap-2 text-zinc-300 text-xs">
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                        <span>
                                            Timeline guess was:{' '}
                                            <span className={`font-bold ${game.lastGuessCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {game.lastGuessCorrect ? 'CORRECT' : 'INCORRECT'}
                                            </span>
                                        </span>
                                    </div>

                                    {/* Stateful Guess Rating & Opponent Steal Interface */}
                                    <div className="pt-2 border-t border-zinc-800 space-y-4">
                                        <div className="space-y-2">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                                Rate active player's metadata guess:
                                            </span>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setMetadataChoice('none')}
                                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${metadataChoice === 'none'
                                                            ? 'bg-zinc-100 text-zinc-950 border-white'
                                                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                                                        }`}
                                                >
                                                    Missed Both (0)
                                                </button>
                                                <button
                                                    onClick={() => setMetadataChoice('artist')}
                                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${metadataChoice === 'artist'
                                                            ? 'bg-[#ff5722] text-white border-[#ff6c37]'
                                                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                                                        }`}
                                                >
                                                    Only Artist (+1)
                                                </button>
                                                <button
                                                    onClick={() => setMetadataChoice('title')}
                                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${metadataChoice === 'title'
                                                            ? 'bg-[#ff5722] text-white border-[#ff6c37]'
                                                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                                                        }`}
                                                >
                                                    Only Title (+1)
                                                </button>
                                                <button
                                                    onClick={() => setMetadataChoice('both')}
                                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${metadataChoice === 'both'
                                                            ? 'bg-emerald-600 text-white border-emerald-500'
                                                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                                                        }`}
                                                >
                                                    Guessed Both! (+2)
                                                </button>
                                            </div>
                                        </div>

                                        {/* Dynamic Opponent Token Steal Selector [1] */}
                                        {metadataChoice !== null && metadataChoice !== 'both' && eligibleLocalStealers.length > 0 && (
                                            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-2 animate-fade-in">
                                                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                                    Did another player guess the remainder?
                                                </label>
                                                <select
                                                    className="w-full bg-zinc-900 p-2 text-xs rounded-xl border border-zinc-800 focus:outline-none text-zinc-300"
                                                    value={tokenRecipientId}
                                                    onChange={(e) => setTokenRecipientId(e.target.value)}
                                                >
                                                    <option value="">No one / None</option>
                                                    {eligibleLocalStealers.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.name} (+{2 - (metadataChoice === 'none' ? 0 : 1)} Token{2 - (metadataChoice === 'none' ? 0 : 1) > 1 ? 's' : ''})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Final Confirmation Submission */}
                                        <button
                                            disabled={metadataChoice === null}
                                            onClick={handleResolveSubmit}
                                            className="w-full bg-[#f4f4f5] disabled:bg-zinc-950 disabled:text-zinc-700 disabled:border disabled:border-zinc-850 hover:bg-white text-zinc-950 font-extrabold py-3.5 px-4 rounded-xl transition text-xs tracking-wider"
                                        >
                                            CONFIRM_AND_RESOLVE_TURN
                                        </button>
                                    </div>

                                    {/* Cardboard Discard options (if timeline guess was incorrect) */}
                                    {!game.lastGuessCorrect && metadataChoice === null && (
                                        <div className="pt-2 border-t border-zinc-800 flex flex-col gap-3">
                                            <button
                                                onClick={() => onResolveTurnWithMetadata('none')}
                                                className="w-full bg-zinc-950 hover:bg-zinc-850 text-neutral-300 font-bold py-3 px-4 rounded-xl text-xs transition active:scale-95 border border-zinc-800"
                                            >
                                                [ DISCARD_CARD_NEXT_TURN ]
                                            </button>

                                            {/* Local Match Steal Panel Dropdown */}
                                            {activeModeType === 'local' && eligibleLocalStealers.length > 0 && (
                                                <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-850 space-y-2">
                                                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                        <Swords className="w-3.5 h-3.5 animate-pulse" /> CHALLENGER_STEAL
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="flex-1 bg-zinc-900 p-2 text-xs rounded-xl border border-zinc-800 focus:outline-none text-zinc-300 font-sans"
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
                                                            <Swords className="w-3.5 h-3.5" /> STEAL
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Online Match Steal panel */}
                                            {activeModeType === 'online' && !isMyTurn && (
                                                <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-850 flex items-center justify-between">
                                                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <Swords className="w-3.5 h-3.5" /> OPPONENT_MISSED
                                                    </span>
                                                    <button
                                                        onClick={() => setIsStealing(true)}
                                                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1 active:scale-95"
                                                    >
                                                        <Swords className="w-3.5 h-3.5" /> STEAL
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