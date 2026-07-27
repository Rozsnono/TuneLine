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
    const accentColor = activeModeType === 'local' ? 'rose' : 'orange';

    return (
        <div className="flex flex-col min-h-screen bg-[#050508] text-white px-6 pt-14 pb-12 justify-between relative overflow-hidden font-mono animate-fade-in">
            <div className="absolute top-[5%] left-[5%] w-[50%] h-[50%] bg-[#ff5722]/5 rounded-full blur-[110px] pointer-events-none"></div>

            <div className="space-y-6 flex-1 flex flex-col justify-start">
                {/* Top Control Header */}
                <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                    <span className="text-[10px] font-bold tracking-widest uppercase bg-orange-500/10 text-[#ff5722] px-3 py-1 rounded-full border border-orange-500/20 shadow-md">
                        {activeModeType === 'local' ? '📺 Local' : '📱 Online'}{' '}
                        {game.gameplayMode === 'teams' ? '(Teams)' : '(Solo)'}
                    </span>
                    <button
                        onClick={onLeave}
                        className="text-neutral-500 hover:text-red-400 text-xs flex items-center gap-1.5 font-semibold transition"
                    >
                        <LogOut className="w-3.5 h-3.5" /> Quit Match
                    </button>
                </div>

                {/* Dynamic code sharing (Online mode) */}
                {activeModeType === 'online' && (
                    <div className="py-2 flex items-center justify-between border-b border-zinc-900">
                        <div>
                            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">Share room ID</span>
                            <span className="text-3xl font-black text-white tracking-wider font-mono">{game.roomId}</span>
                        </div>
                        <button
                            onClick={onCopyRoomCode}
                            className="p-3 bg-zinc-900/60 hover:bg-zinc-800 rounded-xl border border-zinc-800 active:scale-90 transition flex items-center justify-center"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                            ) : (
                                <Copy className="w-5 h-5 text-neutral-300" strokeWidth={2} />
                            )}
                        </button>
                    </div>
                )}

                {/* Local player entry form (Local mode) */}
                {activeModeType === 'local' && (
                    <div className="space-y-3 pb-4 border-b border-zinc-900">
                        <div className="flex items-center gap-2 text-[#ff5722] mb-1">
                            <UserPlus className="w-4 h-4" />
                            <h3 className="text-xs font-bold tracking-tight uppercase">Register Local Member</h3>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={15}
                                className="flex-1 p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 text-sm text-white focus:outline-none"
                                placeholder="Enter Player Name"
                                value={localInputName}
                                onChange={(e) => setLocalInputName(e.target.value)}
                            />
                            <button
                                onClick={onAddLocalPlayer}
                                disabled={!localInputName.trim()}
                                className="bg-yellow-500 text-neutral-950 font-bold px-4 rounded-xl text-xs transition disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>
                        {game.gameplayMode === 'teams' && (
                            <div className="grid grid-cols-2 gap-2 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-900">
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
                    </div>
                )}

                {/* Team Assignments (Online + Teams Mode) */}
                {activeModeType === 'online' && game.gameplayMode === 'teams' && myPlayer && (
                    <div className="space-y-3 pb-4 border-b border-zinc-900">
                        <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-center">
                            Select Your Team
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => onSelectTeam('A')}
                                className={`py-2.5 rounded-xl font-bold text-xs border transition duration-300 ${myPlayer.teamId === 'A'
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                                    }`}
                            >
                                Blue Team (A)
                            </button>
                            <button
                                onClick={() => onSelectTeam('B')}
                                className={`py-3.5 rounded-xl font-bold text-xs border transition duration-300 ${myPlayer.teamId === 'B'
                                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/10'
                                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                                    }`}
                            >
                                Red Team (B)
                            </button>
                        </div>
                    </div>
                )}

                {/* Active roster listing */}
                <div className="flex-1 flex flex-col justify-start pt-2">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-zinc-500" /> Roster ({(game.players || []).length})
                        </h3>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <ul className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                        {(game.players || []).map((p, idx) => {
                            const isPlayerHost = idx === 0;
                            return (
                                <li
                                    key={p.id}
                                    className="py-3.5 border-b border-zinc-950 flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-zinc-600 font-bold">{idx + 1} //</span>
                                        <span className="text-sm font-semibold text-neutral-100">
                                            {p.name} {p.id === playerId ? '(You)' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {game.gameplayMode === 'teams' && p.teamId && (
                                            <span
                                                className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md ${p.teamId === 'A' ? 'bg-blue-600/25 text-blue-400 border border-blue-500/10' : 'bg-red-600/25 text-red-400 border border-red-500/10'
                                                    }`}
                                            >
                                                {p.teamId === 'A' ? 'Blue' : 'Red'}
                                            </span>
                                        )}
                                        {isPlayerHost && activeModeType === 'online' && (
                                            <span className="text-[9px] font-bold tracking-widest bg-orange-500/10 text-[#ff5722] px-2.5 py-0.5 rounded-md border border-orange-500/20 uppercase flex items-center gap-1">
                                                <Crown className="w-3 h-3" /> Host
                                            </span>
                                        )}
                                        {activeModeType === 'local' && (
                                            <button
                                                onClick={() => onRemoveLocalPlayer(p.id)}
                                                className="p-1 text-zinc-600 hover:text-red-400 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Start Button */}
            <div className="space-y-4 pt-4">
                {isHost || activeModeType === 'local' ? (
                    <div>
                        <button
                            disabled={(game.players || []).length < (game.gameplayMode === 'teams' ? 2 : 1)}
                            onClick={onStartGame}
                            className="w-full bg-[#ff5722] hover:bg-orange-600 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:shadow-none text-white font-extrabold py-4 px-4 rounded-xl transition shadow-lg shadow-orange-500/15 text-xs tracking-wider"
                        >
                            {(game.players || []).length < (game.gameplayMode === 'teams' ? 2 : 1)
                                ? 'Need more Players'
                                : 'Start Match Session'}
                        </button>
                    </div>
                ) : (
                    <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl text-center">
                        <p className="text-xs text-zinc-500">
                            Waiting for host (<span className="text-neutral-200 font-semibold">{game.players[0]?.name || 'Admin'}</span>) to start...
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
    );
}