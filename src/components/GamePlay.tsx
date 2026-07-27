'use client';

import { useState, useEffect } from 'react';
import { GameState, Player, Card } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion [1]
import MusicPlayer from './MusicPlayer';
import {
    Music4,
    LogOut,
    AlertCircle,
    Swords,
    Coins,
    CircleStar
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
    onBuyCard: () => void;
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
    const [metadataChoice, setMetadataChoice] = useState<'none' | 'artist' | 'title' | 'both' | null>(null);
    const [tokenRecipientId, setTokenRecipientId] = useState<string>('');

    useEffect(() => {
        if (game.phase === 'placement') {
            setMetadataChoice(null);
            setTokenRecipientId('');
        }
    }, [game.phase]);

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

    let myTokens = 0;
    if (game.gameplayMode === 'teams') {
        const myTeam = (game.teams || []).find((t) => t.id === myPlayer?.teamId);
        myTokens = myTeam?.tokens || 0;
    } else {
        myTokens = myPlayer?.tokens || 0;
    }

    const displayBuyButton = activeModeType === 'local' ? activeTokens >= 3 : myTokens >= 3;

    const handleResolveSubmit = () => {
        if (metadataChoice === null) return;
        onResolveTurnWithMetadata(metadataChoice, tokenRecipientId || undefined);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#050508] text-zinc-100 pb-12 font-mono relative overflow-hidden select-none">
            <header className="bg-zinc-950 border-b border-zinc-900 pt-14 pb-4 px-6 sticky top-0 z-50 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-white uppercase">TUNELINE</h1>
                    <span className="text-[10px] text-zinc-500 font-mono tracking-wider">ROOM: {game.roomId}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onLeaveGame}
                        className="p-2 bg-zinc-900 hover:bg-zinc-850 rounded-xl border border-zinc-800 transition text-zinc-400 hover:text-red-400"
                        title="Exit Room"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-sm mx-auto w-full px-6 mt-6 space-y-6">

                {/* Animated turn header banner */}
                <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-3.5 py-1.5 border border-[#ff5722]/30 bg-zinc-950 text-[#ff5722] rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,87,34,0.1)] text-center"
                >
                    <Music4 className="w-3.5 h-3.5" />
                    {activeModeType === 'local'
                        ? `${activeTimelineOwnerName} (${activePlayer?.name || 'Local'})`
                        : isMyTurn
                            ? 'Your Turn'
                            : `${activeTimelineOwnerName}`}
                </motion.span>

                <MusicPlayer
                    game={game}
                    activeModeType={activeModeType}
                    isPlaying={isPlaying}
                    canPlayActiveTurn={canPlayActiveTurn}
                    activePlayer={activePlayer}
                    activeTimelineOwnerName={activeTimelineOwnerName}
                    onToggleAudio={onToggleAudio}
                    onReportBroken={onReportBroken}
                />

                {/* Steal overlay board (AnimatePresence handles slide outs smoothly) */}
                <AnimatePresence>
                    {isStealing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: 20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                            className="space-y-4 pt-4 border-t border-zinc-900 overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase font-mono tracking-wider">
                                    <Swords className="w-4 h-4 animate-pulse" /> Stealer: {stealOwnerName}
                                </div>
                                <button
                                    onClick={() => { setIsStealing(false); setSelectedSlot(null); }}
                                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-wider"
                                >
                                    Cancel Steal
                                </button>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setSelectedSlot(0)}
                                    className={`w-full py-2.5 border-2 border-dashed rounded-xl transition text-[10px] flex items-center justify-center gap-1.5 ${selectedSlot === 0
                                        ? 'bg-red-500/10 border-red-500 text-red-400 font-bold'
                                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                        }`}
                                >
                                    [ PLACE STEAL PRIOR ]
                                </button>

                                {(stealTimeline || []).map((card, idx) => (
                                    <div key={card.id} className="space-y-3">
                                        <div className="bg-zinc-900 p-4 rounded-xl flex justify-between items-center border border-zinc-850 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500"></div>
                                            <div className="font-sans">
                                                <div className="font-bold text-sm text-zinc-200">{card.title}</div>
                                                <div className="text-xs text-zinc-500 mt-0.5">{card.artist}</div>
                                            </div>
                                            <span className="bg-zinc-950 text-red-500 font-mono text-xs px-2.5 py-1 rounded border border-zinc-800 font-bold">
                                                {card.year}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => setSelectedSlot(idx + 1)}
                                            className={`w-full py-2.5 border-2 border-dashed rounded-xl transition text-[10px] flex items-center justify-center gap-1.5 ${selectedSlot === idx + 1
                                                ? 'bg-red-500/10 border-red-500 text-red-400 font-bold'
                                                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                                }`}
                                        >
                                            [ INSERT POSITION ]
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled={selectedSlot === null}
                                onClick={onSubmitSteal}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-4 rounded-xl transition disabled:opacity-50 text-xs tracking-wider"
                            >
                                SUBMIT_STEAL_ATTEMPT (Cost: -1 Token if wrong)
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isStealing && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                            <h3 className="text-[10px] tracking-widest uppercase text-zinc-500">
                                Board: {activeTimelineOwnerName} ({activeTimeline.length}/10)
                            </h3>
                            <div className="flex items-center gap-3">
                                {displayBuyButton && (
                                    <button
                                        onClick={onBuyCard}
                                        className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-[9px] tracking-wider transition active:scale-95 flex items-center gap-1 shadow-[0_0_15px_rgba(255,87,34,0.2)]"
                                    >
                                        <Coins className="w-3 h-3" /> BUY_CARD
                                    </button>
                                )}
                                <span className="text-xs text-[#ff5722] font-mono bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 font-bold flex items-center justify-center gap-1">
                                    <CircleStar className="w-3.5 h-3.5" /> {activeTokens}
                                </span>
                            </div>
                        </div>

                        {/* AnimatePresence wait-mode prevents layout snapping on state transitions */}
                        {canPlayActiveTurn && (
                            <div className="pt-4 overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {game.phase === 'placement' && (
                                        <motion.button
                                            key="placementBtn"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            disabled={selectedSlot === null}
                                            onClick={onSubmitPlacement}
                                            className="w-full bg-[#f4f4f5] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border disabled:border-zinc-850 hover:bg-white text-zinc-950 font-extrabold py-4 px-4 rounded-xl transition text-xs tracking-wider"
                                        >
                                            EXECUTE_SUBMISSION
                                        </motion.button>
                                    )}

                                    {game.phase === 'metadata_guess' && (
                                        <motion.button
                                            key="guessBtn"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            onClick={onRevealMetadata}
                                            className="w-full bg-[#f4f4f5] hover:bg-white text-zinc-950 font-extrabold py-4 px-4 rounded-xl transition text-xs tracking-wider"
                                        >
                                            REVEAL_ANSWER_DETAILS
                                        </motion.button>
                                    )}

                                    {game.phase === 'revealed' && (
                                        <motion.div
                                            key="revealedPanel"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 15 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4 p-4 bg-zinc-900 rounded-3xl border border-zinc-855"
                                        >
                                            <div className="flex justify-center items-center gap-2 text-zinc-300 text-xs">
                                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                                <span>
                                                    Timeline guess was:{' '}
                                                    <span className={`font-bold ${game.lastGuessCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {game.lastGuessCorrect ? 'CORRECT' : 'INCORRECT'}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="pt-2 border-t border-zinc-800 space-y-4">
                                                <div className="space-y-2">
                                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                                        Rate active player's metadata guess:
                                                    </span>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => setMetadataChoice('none')}
                                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition duration-300 ${metadataChoice === 'none'
                                                                ? 'bg-zinc-100 text-zinc-950 border-white'
                                                                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                                                                }`}
                                                        >
                                                            Missed Both (0)
                                                        </button>
                                                        <button
                                                            onClick={() => setMetadataChoice('artist')}
                                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition duration-300 ${metadataChoice === 'artist'
                                                                ? 'bg-[#ff5722] text-white border-[#ff6c37]'
                                                                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                                                                }`}
                                                        >
                                                            Only Artist (+1)
                                                        </button>
                                                        <button
                                                            onClick={() => setMetadataChoice('title')}
                                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition duration-300 ${metadataChoice === 'title'
                                                                ? 'bg-[#ff5722] text-white border-[#ff6c37]'
                                                                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                                                                }`}
                                                        >
                                                            Only Title (+1)
                                                        </button>
                                                        <button
                                                            onClick={() => setMetadataChoice('both')}
                                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition duration-300 ${metadataChoice === 'both'
                                                                ? 'bg-emerald-600 text-white border-emerald-500'
                                                                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                                                                }`}
                                                        >
                                                            Guessed Both! (+2)
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Opponent Token Steal Selector */}
                                                {metadataChoice !== null && metadataChoice !== 'both' && eligibleLocalStealers.length > 0 && (
                                                    <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-2 animate-fade-in">
                                                        <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                                                            Did another player/team guess the remainder out loud?
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

                                                <button
                                                    disabled={metadataChoice === null}
                                                    onClick={handleResolveSubmit}
                                                    className="w-full bg-[#f4f4f5] disabled:bg-zinc-950 disabled:text-zinc-700 disabled:border disabled:border-zinc-850 hover:bg-white text-zinc-950 font-extrabold py-3.5 px-4 rounded-xl transition text-xs tracking-wider"
                                                >
                                                    CONFIRM_AND_RESOLVE_TURN
                                                </button>
                                            </div>

                                            {!game.lastGuessCorrect && metadataChoice === null && (
                                                <div className="pt-2 border-t border-zinc-800 flex flex-col gap-3">
                                                    <button
                                                        onClick={() => onResolveTurnWithMetadata('none')}
                                                        className="w-full bg-zinc-950 hover:bg-zinc-855 text-neutral-300 font-bold py-3 px-4 rounded-xl text-xs transition active:scale-95 border border-zinc-800"
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
                                                                    onClick={onSubmitSteal}
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
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="space-y-3">
                            {game.phase === 'placement' && canPlayActiveTurn && (
                                <motion.button
                                    layout // Glides the button down as lists shift [1]
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => setSelectedSlot(0)}
                                    className={`w-full py-2.5 border-2 border-dashed rounded-xl transition duration-300 text-[10px] flex items-center justify-center gap-1.5 ${selectedSlot === 0
                                        ? 'bg-orange-500/10 border-[#ff5722] text-[#ff5722] font-bold'
                                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                                        }`}
                                >
                                    [ ✦ 01 / INSERT POSITION ✦ ]
                                </motion.button>
                            )}

                            {/* layoutId on elements forces organic physics transitions [1] */}
                            <AnimatePresence>
                                {(activeTimeline || []).map((card, idx) => (
                                    <motion.div
                                        key={card.id}
                                        layout // Automates organic vertical list shift [1]
                                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                        className="space-y-3"
                                    >
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

                                        {game.phase === 'placement' && canPlayActiveTurn && (
                                            <motion.button
                                                layout // Glides slots relative to list additions [1]
                                                onClick={() => setSelectedSlot(idx + 1)}
                                                className={`w-full py-2.5 border-2 border-dashed rounded-xl transition duration-300 text-[10px] flex items-center justify-center gap-1.5 ${selectedSlot === idx + 1
                                                    ? 'bg-orange-500/10 border-[#ff5722] text-[#ff5722] font-bold'
                                                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                                                    }`}
                                            >
                                                [ ✦ {idx + 2 < 10 ? `0${idx + 2 + 1}` : idx + 2 + 1} / INSERT POSITION ✦ ]
                                            </motion.button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
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