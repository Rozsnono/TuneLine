'use client';

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
        <div className="flex flex-col min-h-screen bg-[#050508] text-white px-4 py-8 relative overflow-hidden font-mono animate-fade-in">
            {/* Background Ambient Glow Orbs */}
            <div className="absolute top-[5%] left-[5%] w-[50%] h-[50%] bg-[#ff5722]/5 rounded-full blur-[110px] pointer-events-none"></div>

            <div className="flex-1 max-w-sm mx-auto w-full flex flex-col justify-between z-10">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold tracking-widest uppercase bg-orange-500/10 text-[#ff5722] px-3 py-1 rounded-full border border-orange-500/20 shadow-md">
                            {activeModeType === 'local' ? '📺 Local Pass & Play' : '📱 Online Session'}{' '}
                            {game.gameplayMode === 'teams' ? '(Teams)' : '(Solo)'}
                        </span>
                        <button
                            onClick={onLeave}
                            className="text-neutral-500 hover:text-red-400 text-xs flex items-center gap-1.5 font-semibold transition"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Quit Match
                        </button>
                    </div>

                    {/* Share Room Widget (Online Mode only) */}
                    {activeModeType === 'online' && (
                        <div className="bg-zinc-900/60 backdrop-blur-md p-5 rounded-3xl border border-zinc-800 shadow-lg text-center">
                            <span className="text-xs tracking-widest text-zinc-500 uppercase">Share this Room</span>
                            <div className="flex items-center justify-center gap-3 mt-2">
                                <span className="text-4xl font-black text-indigo-400 tracking-wider font-mono">{game.roomId}</span>
                                <button
                                    onClick={onCopyRoomCode}
                                    className="p-2.5 bg-neutral-950/60 hover:bg-neutral-800 rounded-xl border border-neutral-750 active:scale-90 transition flex items-center justify-center"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                                    ) : (
                                        <Copy className="w-5 h-5 text-neutral-300" strokeWidth={2} />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add Local Players (Local Mode only) */}
                    {activeModeType === 'local' && (
                        <div className="bg-zinc-900/60 backdrop-blur-md p-5 rounded-3xl border border-zinc-800 shadow-lg space-y-4">
                            <div className="flex items-center gap-2 text-[#ff5722]">
                                <UserPlus className="w-5 h-5" />
                                <h3 className="text-sm font-bold tracking-tight">Add Local Players</h3>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    maxLength={15}
                                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                                    placeholder="Enter Player Name"
                                    value={localInputName}
                                    onChange={(e) => setLocalInputName(e.target.value)}
                                />
                                {game.gameplayMode === 'teams' && (
                                    <div className="grid grid-cols-2 gap-2 bg-neutral-950/80 p-1.5 rounded-xl border border-neutral-850">
                                        <button
                                            onClick={() => setLocalInputTeam('A')}
                                            className={`py-1.5 rounded-lg text-xs font-bold transition duration-300 ${localInputTeam === 'A' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-400'
                                                }`}
                                        >
                                            Blue Team
                                        </button>
                                        <button
                                            onClick={() => setLocalInputTeam('B')}
                                            className={`py-1.5 rounded-lg text-xs font-bold transition duration-300 ${localInputTeam === 'B' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-400'
                                                }`}
                                        >
                                            Red Team
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={onAddLocalPlayer}
                                    disabled={!localInputName.trim()}
                                    className="w-full bg-[#f4f4f5] text-zinc-950 font-bold py-2.5 px-4 rounded-xl text-xs transition disabled:opacity-50"
                                >
                                    Register Local Player
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Select Assigned Team (Online + Teams only) */}
                    {activeModeType === 'online' && game.gameplayMode === 'teams' && myPlayer && (
                        <div className="bg-zinc-900/60 backdrop-blur-md p-5 rounded-3xl border border-zinc-800 shadow-lg space-y-4">
                            <h3 className="text-xs uppercase tracking-wider text-zinc-500 text-center">
                                Select Your Assigned Team
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => onSelectTeam('A')}
                                    className={`py-3 rounded-2xl font-bold text-sm border transition duration-300 ${myPlayer.teamId === 'A'
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                            : 'bg-neutral-800 border-neutral-750 text-neutral-400'
                                        }`}
                                >
                                    Blue Team (A)
                                </button>
                                <button
                                    onClick={() => onSelectTeam('B')}
                                    className={`py-3 rounded-2xl font-bold text-sm border transition duration-300 ${myPlayer.teamId === 'B'
                                            ? 'bg-red-600 border-red-500 text-white shadow-lg'
                                            : 'bg-neutral-800 border-neutral-750 text-neutral-400'
                                        }`}
                                >
                                    Red Team (B)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Registered Player Roster */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-neutral-500" /> Players Registered ({(game.players || []).length})
                            </h3>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        <ul className="space-y-2.5">
                            {(game.players || []).map((p, idx) => {
                                const isPlayerHost = idx === 0;
                                return (
                                    <li
                                        key={p.id}
                                        className="bg-neutral-900 p-4 rounded-2xl flex justify-between items-center border border-zinc-850 shadow-sm"
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
                                                <span className="text-[10px] font-bold tracking-widest bg-orange-500/10 text-[#ff5722] px-2.5 py-1 rounded-md border border-orange-500/20 uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(255,87,34,0.1)]">
                                                    <Crown className="w-3 h-3" /> Host
                                                </span>
                                            )}
                                            {activeModeType === 'local' && (
                                                <button
                                                    onClick={() => onRemoveLocalPlayer(p.id)}
                                                    className="p-1.5 bg-zinc-850 text-zinc-500 hover:text-red-400 rounded-lg transition border border-zinc-800"
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
                                className="w-full bg-[#ff5722] hover:bg-orange-600 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:shadow-none text-white font-extrabold py-4 px-4 rounded-xl transition shadow-lg shadow-orange-500/15 text-xs tracking-wider"
                            >
                                {(game.players || []).length < (game.gameplayMode === 'teams' ? 2 : 1)
                                    ? 'Waiting for Players'
                                    : 'Start Match Session'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-850 text-center">
                            <p className="text-xs text-zinc-400">
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