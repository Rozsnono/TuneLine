'use client';

import { useState } from 'react';
import { GameState, Player } from '@/types/game';
import {
    LogOut,
    Check,
    Copy,
    UserPlus,
    Users,
    Crown,
    Trash2
} from 'lucide-react';

interface WaitingLobbyProps {
    game: GameState;
    playerId: string;
    isHost: boolean;
    activeModeType: 'local' | 'online';
    localInputName: string;
    setLocalInputName: (val: string) => void;
    localInputTeam: 'A' | 'B';
    setLocalInputTeam: (val: 'A' | 'B') => void;
    myPlayer: Player | null;
    copied: boolean;
    message: string;
    onLeave: () => void;
    onCopyRoomCode: () => void;
    onAddLocalPlayer: () => void;
    onRemoveLocalPlayer: (id: string) => void;
    onSelectTeam: (teamId: 'A' | 'B') => void;
    onStartGame: () => void;
}

export default function WaitingLobby({
    game,
    playerId,
    isHost,
    activeModeType,
    localInputName,
    setLocalInputName,
    localInputTeam,
    setLocalInputTeam,
    myPlayer,
    copied,
    message,
    onLeave,
    onCopyRoomCode,
    onAddLocalPlayer,
    onRemoveLocalPlayer,
    onSelectTeam,
    onStartGame
}: WaitingLobbyProps) {
    return (
        <div className="flex flex-col min-h-screen bg-neutral-950 text-white px-4 py-8 animate-fade-in">
            <div className="flex-1 max-w-sm mx-auto w-full flex flex-col justify-between">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-yellow-500 font-mono font-bold tracking-wider uppercase bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                            {activeModeType === 'local' ? '📺 Local Pass & Play' : '📱 Online Session'}{' '}
                            {game.gameplayMode === 'teams' ? '(Teams)' : '(Solo)'}
                        </span>
                        <button
                            onClick={onLeave}
                            className="text-neutral-500 hover:text-red-400 text-xs flex items-center gap-1 font-semibold transition"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Quit Match
                        </button>
                    </div>

                    {activeModeType === 'online' && (
                        <div className="bg-neutral-900 p-5 rounded-3xl border border-neutral-800 text-center shadow-lg">
                            <span className="text-xs font-mono tracking-wider text-neutral-500 uppercase">Share this Room</span>
                            <div className="flex items-center justify-center gap-3 mt-2">
                                <span className="text-4xl font-black text-yellow-500 tracking-wider font-mono">{game.roomId}</span>
                                <button
                                    onClick={onCopyRoomCode}
                                    className="p-2.5 bg-neutral-850 hover:bg-neutral-800 rounded-xl border border-neutral-750 active:scale-90 transition flex items-center justify-center"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-neutral-300" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeModeType === 'local' && (
                        <div className="bg-neutral-900 p-5 rounded-3xl border border-neutral-800 shadow-lg space-y-4">
                            <div className="flex items-center gap-2 text-yellow-500">
                                <UserPlus className="w-5 h-5" />
                                <h3 className="text-sm font-bold tracking-tight">Add Local Players</h3>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    maxLength={15}
                                    className="w-full p-3 rounded-xl bg-neutral-850 text-white border border-neutral-750 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    placeholder="Enter Player Name"
                                    value={localInputName}
                                    onChange={(e) => setLocalInputName(e.target.value)}
                                />
                                {game.gameplayMode === 'teams' && (
                                    <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-805">
                                        <button
                                            onClick={() => setLocalInputTeam('A')}
                                            className={`py-1.5 rounded-lg text-xs font-bold transition ${localInputTeam === 'A' ? 'bg-blue-600 text-white shadow' : 'text-neutral-400'
                                                }`}
                                        >
                                            Blue Team
                                        </button>
                                        <button
                                            onClick={() => setLocalInputTeam('B')}
                                            className={`py-1.5 rounded-lg text-xs font-bold transition ${localInputTeam === 'B' ? 'bg-red-600 text-white shadow' : 'text-neutral-400'
                                                }`}
                                        >
                                            Red Team
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={onAddLocalPlayer}
                                    disabled={!localInputName.trim()}
                                    className="w-full bg-yellow-500 text-neutral-950 font-bold py-2.5 px-4 rounded-xl text-xs transition disabled:opacity-50 hover:bg-yellow-600"
                                >
                                    Register Local Player
                                </button>
                            </div>
                        </div>
                    )}

                    {activeModeType === 'online' && game.gameplayMode === 'teams' && myPlayer && (
                        <div className="bg-neutral-900 p-5 rounded-3xl border border-neutral-800 shadow-lg space-y-4">
                            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 text-center">
                                Select Your Assigned Team
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => onSelectTeam('A')}
                                    className={`py-3 rounded-2xl font-bold text-sm border transition ${myPlayer.teamId === 'A'
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                            : 'bg-neutral-800 border-neutral-750 text-neutral-400'
                                        }`}
                                >
                                    Blue Team (A)
                                </button>
                                <button
                                    onClick={() => onSelectTeam('B')}
                                    className={`py-3 rounded-2xl font-bold text-sm border transition ${myPlayer.teamId === 'B'
                                            ? 'bg-red-600 border-red-500 text-white shadow-lg'
                                            : 'bg-neutral-800 border-neutral-750 text-neutral-400'
                                        }`}
                                >
                                    Red Team (B)
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                                <Users className="w-4 h-4" /> Players Registered ({(game.players || []).length})
                            </h3>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        <ul className="space-y-2.5">
                            {(game.players || []).map((p, idx) => {
                                const isPlayerHost = idx === 0;
                                return (
                                    <li
                                        key={p.id}
                                        className="bg-neutral-900 p-4 rounded-2xl flex justify-between items-center border border-neutral-850 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center font-mono font-bold text-yellow-500 border border-neutral-700 text-sm">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm font-semibold text-neutral-100">
                                                {p.name} {p.id === playerId ? '(You)' : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {game.gameplayMode === 'teams' && p.teamId && (
                                                <span
                                                    className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md ${p.teamId === 'A' ? 'bg-blue-600/25 text-blue-400 border border-blue-500/10' : 'bg-red-600/25 text-red-400 border border-red-500/10'
                                                        }`}
                                                >
                                                    {p.teamId === 'A' ? 'Blue' : 'Red'}
                                                </span>
                                            )}
                                            {isPlayerHost && activeModeType === 'online' && (
                                                <span className="text-[10px] font-bold tracking-widest bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md border border-yellow-500/20 uppercase flex items-center gap-1">
                                                    <Crown className="w-3 h-3" /> Host
                                                </span>
                                            )}
                                            {activeModeType === 'local' && (
                                                <button
                                                    onClick={() => onRemoveLocalPlayer(p.id)}
                                                    className="p-1.5 bg-neutral-850 text-neutral-500 hover:text-red-400 rounded-lg transition"
                                                    title="Remove Player"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 pt-6">
                    {isHost || activeModeType === 'local' ? (
                        <div>
                            <button
                                disabled={(game.players || []).length < (game.gameplayMode === 'teams' ? 2 : 1)}
                                onClick={onStartGame}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:shadow-none text-white font-extrabold py-4 px-4 rounded-xl transition shadow-lg shadow-emerald-500/15 text-sm"
                            >
                                {(game.players || []).length < (game.gameplayMode === 'teams' ? 2 : 1)
                                    ? 'Need more Players'
                                    : 'Start Match Session'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-850 text-center">
                            <p className="text-xs text-neutral-400">
                                Waiting for host (<span className="text-neutral-200 font-semibold">{game.players[0]?.name || 'Admin'}</span>) to start the match...
                            </p>
                        </div>
                    )}

                    {message && (
                        <p className="text-xs text-center text-red-400 p-2.5 bg-red-950/20 rounded-xl border border-red-900/30">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}