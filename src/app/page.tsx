'use client';

import { useState, useEffect, useRef } from 'react';
import { GameState } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion'; // Clean spring transitions [1]

// Modular view components
import ModeSelection from '@/components/ModeSelection';
import LocalSetup from '@/components/LocalSetup';
import OnlineSetup from '@/components/OnlineSetup';
import WaitingLobby from '@/components/WaitingLobby';
import Finished from '@/components/Finished';
import GamePlay from '@/components/GamePlay';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function Home() {
  const [playModeSelection, setPlayModeSelection] = useState<'local' | 'online' | null>(null);

  const [playerName, setPlayerName] = useState<string>('');
  const [roomInput, setRoomInput] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Configuration Setup States [2]
  const [setupGameplay, setSetupGameplay] = useState<'individual' | 'teams'>('individual');
  const [targetScore, setTargetScore] = useState<number>(10);
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState<number>(4);
  const [maxPlayTime, setMaxPlayTime] = useState<number>(60);

  const [localInputName, setLocalInputName] = useState<string>('');
  const [localInputTeam, setLocalInputTeam] = useState<'A' | 'B'>('A');

  // Stealing Interface States
  const [isStealing, setIsStealing] = useState<boolean>(false);
  const [localStealerId, setLocalStealerId] = useState<string>('');

  // Audio Playback States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [ytReady, setYtReady] = useState<boolean>(false);
  const playerRef = useRef<any>(null);

  // Scoped turn parameters (safe optional checks)
  const activePlayer = game ? (game.players || []).find((p) => p.id === game.currentTurnPlayerId) : null;
  const myPlayer = game ? (game.players || []).find((p) => p.id === playerId) : null;
  const isMyTurn = game ? game.currentTurnPlayerId === playerId : false;
  const isHost = game ? ((game.players || []).length > 0 && game.players[0]?.id === playerId) : false;
  const activeModeType = roomId.startsWith('LOC_') ? 'local' : (game ? game.mode : 'online');
  const canPlayActiveTurn = game ? (isMyTurn || activeModeType === 'local') : false;

  // --- High-performance auto play-limit stopwatch hook [1] ---
  useEffect(() => {
    let stopwatch: any;
    if (isPlaying && game?.maxPlayTime) {
      const maxMs = game.maxPlayTime * 1000;
      stopwatch = setTimeout(() => {
        try {
          stopAudio();
          setMessage(`Time limit hit. Track paused at ${game.maxPlayTime}s.`);
        } catch (e) {
          console.error('Stopwatch failed to halt audio', e);
        }
      }, maxMs);
    }
    return () => {
      if (stopwatch) clearTimeout(stopwatch);
    };
  }, [isPlaying, game?.currentCard?.youtubeId, game?.maxPlayTime]);

  // --- Hoisted State Handlers (TDZ Protected) ---
  function attemptSessionRestoration(targetRoom: string, pId: string, name: string) {
    fetch(`${API_BASE_URL}/api/game?roomId=${targetRoom}`)
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            const activeGame: GameState = data.game;
            const isRegistered = (activeGame.players || []).some((p) => p.id === pId);
            if (isRegistered) {
              setRoomId(targetRoom);
              setGame(activeGame);
              setHasJoined(true);
              localStorage.setItem('hitster_room_id', targetRoom);
              localStorage.setItem('hitster_player_name', name);
            }
          });
        }
      })
      .catch((err) => console.error('Lobby restoration failed', err));
  }

  function toggleAudio() {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }

  function stopAudio() {
    if (!playerRef.current) return;
    playerRef.current.stopVideo();
    setIsPlaying(false);
  }

  function handleJoinOrCreate(targetRoomId: string, forcedMode?: 'local' | 'online') {
    const formattedRoom = targetRoomId.trim().toUpperCase();
    const activeMode = forcedMode || playModeSelection || 'online';
    const activeName = activeMode === 'local' ? 'Host Device' : playerName.trim();

    if (!formattedRoom) {
      setMessage('Room ID is required.');
      return;
    }
    if (!activeName) {
      setMessage('Please enter a display name.');
      return;
    }

    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: formattedRoom,
        action: 'join',
        playerId,
        playerName: activeName,
        mode: activeMode,
        gameplayMode: setupGameplay,
        targetScore,
        maxPlayersPerTeam,
        maxPlayTime
      }),
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            setGame(data.game);
            setRoomId(formattedRoom);
            setHasJoined(true);
            setMessage('');
            localStorage.setItem('hitster_room_id', formattedRoom);
            localStorage.setItem('hitster_player_name', activeName);
            if (typeof window !== 'undefined') {
              window.history.replaceState(null, '', `?roomId=${formattedRoom}`);
            }
          });
        } else {
          res.json().then((errData) => {
            setMessage(errData.error || 'Failed to connect.');
          });
        }
      })
      .catch(() => setMessage('Unable to reach the game server.'));
  }

  function handleCreateLocalSession() {
    const localCode = 'LOC_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    handleJoinOrCreate(localCode, 'local');
  }

  // Add Local Player
  function handleAddLocalPlayer() {
    if (!localInputName.trim()) return;
    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        action: 'add_local_player',
        playerName: localInputName.trim(),
        teamId: game?.gameplayMode === 'teams' ? localInputTeam : null,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setLocalInputName('');
          res.json().then((data) => {
            setGame(data.game);
            setMessage('');
          });
        } else {
          res.json().then((errData) => {
            setMessage(errData.error || 'Roster error.');
          });
        }
      })
      .catch(() => setMessage('Failed to add local player'));
  }

  function handleRemoveLocalPlayer(targetLocalId: string) {
    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        action: 'remove_local_player',
        removePlayerId: targetLocalId,
      }),
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            setGame(data.game);
          });
        }
      })
      .catch((err) => console.error(err));
  }

  function handleSelectTeam(targetTeamId: 'A' | 'B') {
    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        action: 'select_team',
        playerId,
        teamId: targetTeamId,
      }),
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            setGame(data.game);
          });
        } else {
          res.json().then((errData) => {
            setMessage(errData.error);
          });
        }
      })
      .catch(() => setMessage('Error updating team assignment.'));
  }

  function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomInput(code);
    setMessage('');
  }

  function copyRoomCode() {
    if (typeof window !== 'undefined' && roomId) {
      const inviteUrl = `${window.location.origin}?roomId=${roomId}`;
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  function handleStartGame() {
    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, action: 'start' }),
    })
      .then((res) => {
        if (res.ok) {
          setMessage('');
          res.json().then((data) => {
            setGame(data.game);
          });
        } else {
          res.json().then((data) => {
            setMessage(data.error || 'Failed to initialize the match.');
          });
        }
      })
      .catch(() => setMessage('Network error launching the game.'));
  }

  function submitPlacement() {
    if (selectedSlot === null) return;
    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        action: 'guess',
        playerId,
        selectedIndex: selectedSlot,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setSelectedSlot(null);
          setMessage('');
        } else {
          res.json().then((data) => {
            setMessage(data.error);
          });
        }
      })
      .catch(() => setMessage('Network transmission lost.'));
  }

  function revealMetadata() {
    try {
      stopAudio();
    } catch (e) { }
    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, action: 'reveal', playerId }),
    })
      .then((res) => {
        if (res.ok) {
          setMessage('');
        } else {
          res.json().then((data) => {
            setMessage(data.error);
          });
        }
      })
      .catch(() => setMessage('Reveal failed.'));
  }

  function resolveTurnWithMetadata(metadataChoice: 'none' | 'artist' | 'title' | 'both', recipientId?: string) {
    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        action: 'resolve',
        playerId,
        metadataGuessed: metadataChoice,
        metadataRecipientId: recipientId || undefined
      }),
    })
      .then((res) => {
        if (res.ok) {
          setMessage('');
          res.json().then((data) => {
            setGame(data.game);
          });
        } else {
          res.json().then((data) => {
            setMessage(data.error);
          });
        }
      })
      .catch(() => setMessage('Failed to complete action'));
  }

  function reportBrokenSong() {
    if (!game || !game.currentCard) return;
    try {
      stopAudio();
    } catch (e) { }
    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        action: 'report_broken',
        playerId
      }),
    })
      .then((res) => {
        if (res.ok) {
          setMessage('Song reported and skipped successfully.');
          setSelectedSlot(null);
          setIsStealing(false);
          setLocalStealerId('');
          res.json().then((data) => {
            setGame(data.game);
          });
        } else {
          res.json().then((data) => {
            setMessage(data.error || 'Failed to report song.');
          });
        }
      })
      .catch(() => setMessage('Network error reporting song.'));
  }

  function submitSteal() {
    if (selectedSlot === null || !game) return;

    let stealerTargetId = '';
    if (activeModeType === 'local') {
      if (!localStealerId) {
        setMessage('Please select which Challenger is stealing.');
        return;
      }
      stealerTargetId = localStealerId;
    } else {
      if (game.gameplayMode === 'teams') {
        stealerTargetId = myPlayer?.teamId || '';
      } else {
        stealerTargetId = playerId;
      }
    }

    if (!stealerTargetId) {
      setMessage('Unable to determine challenger ID.');
      return;
    }

    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        action: 'steal',
        playerId,
        selectedIndex: selectedSlot,
        stealerId: stealerTargetId,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setMessage('Steal successful! Turn resolved.');
          setSelectedSlot(null);
          setIsStealing(false);
          setLocalStealerId('');
          res.json().then((data) => {
            setGame(data.game);
          });
        } else {
          res.json().then((data) => {
            setMessage(data.error || 'Steal placement failed.');
          });
          setSelectedSlot(null);
        }
      })
      .catch(() => setMessage('Steal request transmission error.'));
  }

  function handleBuyCard() {
    fetch(`${API_BASE_URL}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        action: 'buy_card',
        playerId
      })
    })
      .then((res) => {
        if (res.ok) {
          setMessage('Card purchased with 3 Tokens! Auto-inserted into board.');
          res.json().then((data) => {
            setGame(data.game);
          });
        } else {
          res.json().then((data) => {
            setMessage(data.error);
          });
        }
      })
      .catch(() => setMessage('Token exchange network error.'));
  }

  // RESTORED: handleLeaveGame is now fully defined [1]
  function handleLeaveGame() {
    try {
      stopAudio();
    } catch (e) { }
    localStorage.removeItem('hitster_room_id');
    setRoomId('');
    setHasJoined(false);
    setGame(null);
    setPlayModeSelection(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  // Hydration Mount Recovery Hook
  useEffect(() => {
    let id = localStorage.getItem('hitster_player_id');
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('hitster_player_id', id);
    }
    setPlayerId(id);

    const savedRoomId = localStorage.getItem('hitster_room_id');
    const savedPlayerName = localStorage.getItem('hitster_player_name');

    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
    }

    let targetRoom = '';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryRoom = params.get('roomId');
      if (queryRoom) {
        targetRoom = queryRoom.toUpperCase();
        setRoomInput(targetRoom);
        setPlayModeSelection('online');
      } else if (savedRoomId) {
        targetRoom = savedRoomId.toUpperCase();
        setRoomInput(targetRoom);
        if (targetRoom.startsWith('LOC_')) {
          setPlayModeSelection('local');
        } else {
          setPlayModeSelection('online');
        }
      }
    }

    if (targetRoom && savedPlayerName) {
      attemptSessionRestoration(targetRoom, id, savedPlayerName);
    }

    if (typeof window !== 'undefined') {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        (window as any).onYouTubeIframeAPIReady = () => {
          setYtReady(true);
        };
      } else {
        setYtReady(true);
      }
    }
  }, []);

  // Sync YouTube Video Player with Active card references
  useEffect(() => {
    if (!ytReady || !game?.currentCard?.youtubeId) return;

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error('Failed to clear video instances', e);
      }
    }

    setIsPlaying(false);

    playerRef.current = new (window as any).YT.Player('youtube-audio-player', {
      height: '0',
      width: '0',
      videoId: game.currentCard.youtubeId,
      playerVars: {
        playsinline: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === (window as any).YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
        },
      },
    });
  }, [ytReady, game?.currentCard?.youtubeId]);

  // Unified State Poller (1s)
  useEffect(() => {
    if (!roomId || !hasJoined) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/game?roomId=${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setGame(data.game);
        }
      } catch (err) {
        console.error('State sync connection failed', err);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [roomId, hasJoined]);

  // Turn advance resets
  useEffect(() => {
    if (game?.phase === 'placement') {
      setIsStealing(false);
      setLocalStealerId('');
      setSelectedSlot(null);
    }
  }, [game?.phase]);

  return (
    <div className="min-h-screen bg-[#010103] flex justify-center items-center">
      {/* CENTRAL MOBILE VIEWPORT WRAPPER [1] */}
      <div className="w-full max-w-md min-h-screen bg-[#050508] shadow-[0_0_80px_rgba(0,0,0,0.85)] md:border-x md:border-zinc-900/60 relative flex flex-col overflow-hidden justify-between">

        {/* Permanent, static hidden YouTube target container on the DOM */}
        <div id="youtube-audio-player" className="hidden pointer-events-none w-0 h-0 absolute"></div>

        {/* ANIMATED ROUTER TRANSITIONS [1] */}
        <AnimatePresence mode="wait">
          {playModeSelection === null && (
            <motion.div
              key="modeSelectionScreen"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-grow flex flex-col h-full w-full justify-between"
            >
              <ModeSelection onSelect={setPlayModeSelection} />
            </motion.div>
          )}

          {playModeSelection === 'local' && !hasJoined && (
            <motion.div
              key="localSetupScreen"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-grow flex flex-col h-full w-full justify-between"
            >
              <LocalSetup
                setupGameplay={setupGameplay}
                setSetupGameplay={setSetupGameplay}
                targetScore={targetScore}
                setTargetScore={setTargetScore}
                maxPlayersPerTeam={maxPlayersPerTeam}
                setMaxPlayersPerTeam={setMaxPlayersPerTeam}
                maxPlayTime={maxPlayTime}
                setMaxPlayTime={setMaxPlayTime}
                onBack={() => setPlayModeSelection(null)}
                onSubmit={handleCreateLocalSession}
                message={message}
              />
            </motion.div>
          )}

          {playModeSelection === 'online' && !hasJoined && (
            <motion.div
              key="onlineSetupScreen"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-grow flex flex-col h-full w-full justify-between"
            >
              <OnlineSetup
                setupGameplay={setupGameplay}
                setSetupGameplay={setSetupGameplay}
                playerName={playerName}
                setPlayerName={setPlayerName}
                roomInput={roomInput}
                setRoomInput={setRoomInput}
                onGenerateCode={generateRoomCode}
                onBack={() => setPlayModeSelection(null)}
                onSubmit={handleJoinOrCreate}
                message={message}
              />
            </motion.div>
          )}

          {hasJoined && game && game.status === 'waiting' && (
            <motion.div
              key="lobbyScreen"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-grow flex flex-col h-full w-full justify-between"
            >
              <WaitingLobby
                game={game}
                playerId={playerId}
                isHost={isHost}
                activeModeType={activeModeType}
                localInputName={localInputName}
                setLocalInputName={setLocalInputName}
                localInputTeam={localInputTeam}
                setLocalInputTeam={setLocalInputTeam}
                myPlayer={myPlayer as any}
                copied={copied}
                message={message}
                onLeave={handleLeaveGame}
                onCopyRoomCode={copyRoomCode}
                onAddLocalPlayer={handleAddLocalPlayer}
                onRemoveLocalPlayer={handleRemoveLocalPlayer}
                onSelectTeam={handleSelectTeam}
                onStartGame={handleStartGame}
              />
            </motion.div>
          )}

          {hasJoined && game && game.status === 'finished' && (
            <motion.div
              key="finishedScreen"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-grow flex flex-col h-full w-full justify-between"
            >
              <Finished
                game={game}
                isHost={isHost}
                activeModeType={activeModeType}
                onRestart={handleStartGame}
                onLeave={handleLeaveGame}
              />
            </motion.div>
          )}

          {hasJoined && game && game.status === 'playing' && (
            <motion.div
              key="gameplayScreen"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-grow flex flex-col h-full w-full justify-between"
            >
              <GamePlay
                game={game}
                playerId={playerId}
                activeModeType={activeModeType}
                isMyTurn={isMyTurn}
                activePlayer={activePlayer as any}
                myPlayer={myPlayer as any}
                canPlayActiveTurn={canPlayActiveTurn}
                isPlaying={isPlaying}
                playerRef={playerRef}
                onToggleAudio={toggleAudio}
                onStopAudio={stopAudio}
                onReportBroken={reportBrokenSong}
                onSubmitPlacement={submitPlacement}
                onRevealMetadata={revealMetadata}
                onResolveTurnWithMetadata={resolveTurnWithMetadata}
                onSubmitSteal={submitSteal}
                onBuyCard={handleBuyCard}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                isStealing={isStealing}
                setIsStealing={setIsStealing}
                localStealerId={localStealerId}
                setLocalStealerId={setLocalStealerId}
                message={message}
                onLeaveGame={handleLeaveGame}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}