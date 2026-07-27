import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Game, { ICard } from '@/models/Game';
import ReportedSong from '@/models/ReportedSong';
import { MUSIC_LIBRARY } from '@/lib/songs';

function shuffleDeck(deck: any[]): any[] {
    return [...deck].sort(() => Math.random() - 0.5);
}

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const game = await Game.findOne({ roomId });
        if (!game) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        // LOC_ Self-Healing Rule
        if (roomId.startsWith('LOC_')) {
            game.mode = 'local';
        }

        // DEFENSIVE STATE HEALING (Prevents undefined property crashes)
        if (!game.players) game.players = [];
        if (!game.teams || game.teams.length === 0) {
            game.teams = [
                { id: 'A', name: 'Blue Team', timeline: [], score: 0, tokens: 0 },
                { id: 'B', name: 'Red Team', timeline: [], score: 0, tokens: 0 }
            ];
        }
        if (!game.deck || game.deck.length === 0) {
            game.deck = shuffleDeck(MUSIC_LIBRARY);
        }

        const gameObj = game.toObject();
        gameObj.mode = roomId.startsWith('LOC_') ? 'local' : gameObj.mode;

        if (gameObj.currentCard && gameObj.status === 'playing' && gameObj.phase !== 'revealed') {
            gameObj.currentCard = {
                id: gameObj.currentCard.id,
                youtubeId: gameObj.currentCard.youtubeId,
                title: 'Secret Song',
                artist: 'Secret Artist',
                year: 0
            };
        }

        return NextResponse.json({ game: gameObj });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const {
            roomId,
            action,
            playerId,
            playerName,
            mode,
            gameplayMode,
            teamId,
            selectedIndex,
            metadataGuessed,
            metadataRecipientId,
            removePlayerId,
            stealerId,
            targetScore,
            maxPlayersPerTeam,
            maxPlayTime
        } = body;

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        let game = await Game.findOne({ roomId });
        const activeMode = roomId.startsWith('LOC_') ? 'local' : (mode || 'online');

        if (!game && action === 'join') {
            game = new Game({
                roomId,
                players: [],
                teams: [
                    { id: 'A', name: 'Blue Team', timeline: [], score: 0, tokens: 0 },
                    { id: 'B', name: 'Red Team', timeline: [], score: 0, tokens: 0 }
                ],
                deck: shuffleDeck(MUSIC_LIBRARY),
                status: 'waiting',
                mode: activeMode,
                gameplayMode: gameplayMode || 'individual',
                targetScore: targetScore || 10,
                maxPlayersPerTeam: maxPlayersPerTeam || 4,
                maxPlayTime: maxPlayTime || 15
            });
        }

        if (!game) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        // Force self-healing mode rules
        if (roomId.startsWith('LOC_')) {
            game.mode = 'local';
        }

        // DEFENSIVE STATE HEALING (Guarantees robust arrays)
        if (!game.players) game.players = [];
        if (!game.teams || game.teams.length === 0) {
            game.teams = [
                { id: 'A', name: 'Blue Team', timeline: [], score: 0, tokens: 0 },
                { id: 'B', name: 'Red Team', timeline: [], score: 0, tokens: 0 }
            ];
        }
        if (!game.deck || game.deck.length === 0) {
            game.deck = shuffleDeck(MUSIC_LIBRARY);
        }

        // ACTION: Join room
        if (action === 'join') {
            const oldMode = game.mode;
            const isCreator = game.players.length === 0 || game.players[0].id === playerId;

            if (isCreator || oldMode !== activeMode) {
                game.players = [{
                    id: playerId,
                    name: playerName || 'Host Device',
                    teamId: (gameplayMode || game.gameplayMode) === 'teams' ? 'A' : null,
                    timeline: [],
                    score: 0,
                    tokens: 0,
                }];
                game.mode = activeMode;
                if (gameplayMode) game.gameplayMode = gameplayMode;
                if (targetScore) game.targetScore = targetScore;
                if (maxPlayersPerTeam) game.maxPlayersPerTeam = maxPlayersPerTeam;
                if (maxPlayTime) game.maxPlayTime = maxPlayTime;
            } else {
                const existingPlayer = game.players.find((p: any) => p.id === playerId);
                if (!existingPlayer) {
                    game.players.push({
                        id: playerId,
                        name: playerName || `Player ${game.players.length + 1}`,
                        teamId: game.gameplayMode === 'teams' ? 'A' : null,
                        timeline: [],
                        score: 0,
                        tokens: 0,
                    });
                }
            }

            game.markModified('players');
            await game.save();
        }

        // ACTION: Add Player (Local)
        else if (action === 'add_local_player') {
            if (game.gameplayMode === 'teams' && teamId) {
                const teamCount = game.players.filter((p: any) => p.teamId === teamId).length;
                if (teamCount >= (game.maxPlayersPerTeam || 4)) {
                    return NextResponse.json({
                        error: `Team roster full. Max limit: ${game.maxPlayersPerTeam || 4} members.`
                    }, { status: 400 });
                }
            }

            const localId = 'usr_local_' + Math.random().toString(36).substring(2, 9);
            game.players.push({
                id: localId,
                name: playerName || `Local Player ${game.players.length + 1}`,
                teamId: game.gameplayMode === 'teams' ? teamId : null,
                timeline: [],
                score: 0,
                tokens: 0
            });

            game.markModified('players');
            await game.save();
        }

        // ACTION: Remove Local Player
        else if (action === 'remove_local_player') {
            game.players = game.players.filter((p: any) => p.id !== removePlayerId);
            game.markModified('players');
            await game.save();
        }

        // ACTION: Assign/Select Team
        else if (action === 'select_team') {
            if (game.gameplayMode === 'teams' && teamId) {
                const teamCount = game.players.filter((p: any) => p.teamId === teamId).length;
                if (teamCount >= (game.maxPlayersPerTeam || 4)) {
                    return NextResponse.json({
                        error: `That team is currently full. Max limit: ${game.maxPlayersPerTeam} members.`
                    }, { status: 400 });
                }
            }

            const player = game.players.find((p: any) => p.id === playerId);
            if (player) {
                player.teamId = teamId;
                game.markModified('players');
                await game.save();
            }
        }

        // ACTION: Start game loop
        else if (action === 'start') {
            if (game.players.length === 0) {
                return NextResponse.json({ error: 'Cannot start with 0 players' }, { status: 400 });
            }

            if (game.gameplayMode === 'teams') {
                const hasTeamA = game.players.some((p: any) => p.teamId === 'A');
                const hasTeamB = game.players.some((p: any) => p.teamId === 'B');
                if (!hasTeamA || !hasTeamB) {
                    return NextResponse.json({ error: 'Team vs Team mode requires at least one player in each team.' }, { status: 400 });
                }
            }

            const deck = shuffleDeck(MUSIC_LIBRARY);

            if (game.gameplayMode === 'teams') {
                const starterA = deck.pop();
                const starterB = deck.pop();

                const teamA = game.teams.find((t: any) => t.id === 'A');
                const teamB = game.teams.find((t: any) => t.id === 'B');

                if (teamA && starterA) {
                    teamA.timeline = [starterA];
                    teamA.score = 1;
                }
                if (teamB && starterB) {
                    teamB.timeline = [starterB];
                    teamB.score = 1;
                }

                game.currentTurnTeamId = 'A';
                const firstTeamAPlayer = game.players.find((p: any) => p.teamId === 'A');
                game.currentTurnPlayerId = firstTeamAPlayer ? firstTeamAPlayer.id : game.players[0].id;

            } else {
                for (const player of game.players) {
                    const starterCard = deck.pop();
                    if (starterCard) {
                        player.timeline = [starterCard];
                        player.score = 1;
                    }
                }
                game.currentTurnPlayerId = game.players[0].id;
            }

            game.deck = deck;
            game.currentCard = deck.pop() || null;
            game.status = 'playing';
            game.phase = 'placement';
            game.lastGuessCorrect = null;
            game.lastGuessIndex = null;

            // Force write nested parameters to avoid MongoDB race locks [1]
            game.markModified('currentCard');
            game.markModified('deck');
            game.markModified('players');
            game.markModified('teams');
            await game.save();
        }

        // ACTION: Lock Timeline Guess
        else if (action === 'guess') {
            if (game.status !== 'playing') {
                return NextResponse.json({ error: 'Game is not active.' }, { status: 400 });
            }

            if (game.mode === 'online' && game.currentTurnPlayerId !== playerId) {
                return NextResponse.json({ error: 'Not your turn.' }, { status: 400 });
            }

            const activeCard = game.currentCard;
            if (!activeCard) {
                return NextResponse.json({ error: 'No active card drawn' }, { status: 400 });
            }

            let timeline: ICard[] = [];
            if (game.gameplayMode === 'teams') {
                const activeTeam = game.teams.find((t: any) => t.id === game.currentTurnTeamId);
                if (activeTeam) timeline = activeTeam.timeline || [];
            } else {
                const activePlayer = game.players.find((p: any) => p.id === game.currentTurnPlayerId);
                if (activePlayer) timeline = activePlayer.timeline || [];
            }

            const timelineLength = timeline.length;
            let isCorrect = false;
            if (selectedIndex === 0) {
                isCorrect = activeCard.year <= (timeline[0]?.year || 0);
            } else if (selectedIndex === timelineLength) {
                isCorrect = activeCard.year >= (timeline[timelineLength - 1]?.year || 0);
            } else {
                const beforeCard = timeline[selectedIndex - 1];
                const afterCard = timeline[selectedIndex];
                isCorrect = activeCard.year >= (beforeCard?.year || 0) && activeCard.year <= (afterCard?.year || 0);
            }

            game.lastGuessCorrect = isCorrect;
            game.lastGuessIndex = selectedIndex;
            game.phase = 'metadata_guess';

            game.markModified('players');
            await game.save();
        }

        // ACTION: Reveal Metadata
        else if (action === 'reveal') {
            if (game.status !== 'playing') {
                return NextResponse.json({ error: 'Game is not active.' }, { status: 400 });
            }
            if (game.mode === 'online' && game.currentTurnPlayerId !== playerId) {
                return NextResponse.json({ error: 'Not your turn.' }, { status: 400 });
            }

            game.phase = 'revealed';
            await game.save();
        }

        // ACTION: Resolve guess state and swap active turns
        else if (action === 'resolve') {
            if (game.status !== 'playing') {
                return NextResponse.json({ error: 'Game is not active.' }, { status: 400 });
            }
            if (game.mode === 'online' && game.currentTurnPlayerId !== playerId) {
                return NextResponse.json({ error: 'Not your turn.' }, { status: 400 });
            }

            const activeCard = game.currentCard;
            if (!activeCard) {
                return NextResponse.json({ error: 'Active card missing' }, { status: 400 });
            }

            let boardOwner: any;
            if (game.gameplayMode === 'teams') {
                boardOwner = game.teams.find((t: any) => t.id === game.currentTurnTeamId);
            } else {
                boardOwner = game.players.find((p: any) => p.id === game.currentTurnPlayerId);
            }

            if (!boardOwner) {
                return NextResponse.json({ error: 'Target board configuration not resolved' }, { status: 400 });
            }

            if (!boardOwner.timeline) boardOwner.timeline = [];

            // 1. Process Timeline Card insertion
            if (game.lastGuessCorrect && game.lastGuessIndex !== null) {
                boardOwner.timeline.splice(game.lastGuessIndex, 0, activeCard);
                boardOwner.score = boardOwner.timeline.length;
            }

            // 2. Process Granular Token metadata rewards
            let awardedTokens = 0;
            if (metadataGuessed === 'artist' || metadataGuessed === 'title') {
                awardedTokens = 1;
            } else if (metadataGuessed === 'both') {
                awardedTokens = 2;
            }

            boardOwner.tokens = (boardOwner.tokens || 0) + awardedTokens;

            // 3. Process Stolen remaining tokens
            const remainingTokens = 2 - awardedTokens;
            if (remainingTokens > 0 && metadataRecipientId) {
                let recipient: any;
                if (game.gameplayMode === 'teams') {
                    recipient = game.teams.find((t: any) => t.id === metadataRecipientId);
                } else {
                    recipient = game.players.find((p: any) => p.id === metadataRecipientId);
                }

                if (recipient) {
                    recipient.tokens = (recipient.tokens || 0) + remainingTokens;

                    if (recipient.tokens >= 3) {
                        recipient.tokens -= 3;
                        recipient.timeline.push(activeCard);
                        recipient.timeline.sort((a: any, b: any) => a.year - b.year);
                        recipient.score = recipient.timeline.length;
                    }
                }
            }

            if (boardOwner.tokens >= 3) {
                boardOwner.tokens -= 3;
                if (!game.lastGuessCorrect) {
                    boardOwner.timeline.push(activeCard);
                    boardOwner.timeline.sort((a: any, b: any) => a.year - b.year);
                    boardOwner.score = boardOwner.timeline.length;
                }
            }

            // 4. Evaluate Win Parameters: DYNAMIC EVALUATION [2]
            const winGoal = game.targetScore || 10;
            if (boardOwner.score >= winGoal) {
                game.status = 'finished';
                game.winnerId = game.gameplayMode === 'teams' ? game.currentTurnTeamId : game.currentTurnPlayerId;
            } else {
                game.currentCard = game.deck.pop() || null;
                game.phase = 'placement';
                game.lastGuessCorrect = null;
                game.lastGuessIndex = null;

                if (game.gameplayMode === 'teams') {
                    const nextTeamId: 'A' | 'B' = game.currentTurnTeamId === 'A' ? 'B' : 'A';
                    game.currentTurnTeamId = nextTeamId;

                    const nextTeamPlayers = game.players.filter((p: any) => p.teamId === nextTeamId);
                    if (nextTeamPlayers.length > 0) {
                        const currentPlayerIdxOnTeam = nextTeamPlayers.findIndex((p: any) => p.id === game.currentTurnPlayerId);
                        const nextPlayerIdx = (currentPlayerIdxOnTeam + 1) % nextTeamPlayers.length;
                        game.currentTurnPlayerId = nextTeamPlayers[nextPlayerIdx].id;
                    } else {
                        const currentIdx = game.players.findIndex((p: any) => p.id === game.currentTurnPlayerId);
                        game.currentTurnPlayerId = game.players[(currentIdx + 1) % game.players.length].id;
                    }
                } else {
                    const currentIdx = game.players.findIndex((p: any) => p.id === game.currentTurnPlayerId);
                    game.currentTurnPlayerId = game.players[(currentIdx + 1) % game.players.length].id;
                }
            }

            // Force write modified tags before saving [1]
            game.markModified('currentCard');
            game.markModified('deck');
            game.markModified('players');
            game.markModified('teams');
            await game.save();
        }

        // ACTION: Steal Card (Challenger Steal)
        else if (action === 'steal') {
            if (game.status !== 'playing' || game.phase !== 'revealed') {
                return NextResponse.json({ error: 'Cannot steal at this stage.' }, { status: 400 });
            }
            if (game.lastGuessCorrect === true) {
                return NextResponse.json({ error: 'Cannot steal a correctly placed card.' }, { status: 400 });
            }

            let stealerBoard: any;

            if (game.gameplayMode === 'teams') {
                stealerBoard = game.teams.find((t: any) => t.id === stealerId);
            } else {
                stealerBoard = game.players.find((p: any) => p.id === stealerId);
            }

            if (!stealerBoard) {
                return NextResponse.json({ error: 'Stealer board not found.' }, { status: 400 });
            }

            const timeline = stealerBoard.timeline || [];
            const activeCard = game.currentCard;
            if (!activeCard) {
                return NextResponse.json({ error: 'Active card missing.' }, { status: 400 });
            }

            let isCorrect = false;
            const timelineLength = timeline.length;
            if (selectedIndex === 0) {
                isCorrect = activeCard.year <= (timeline[0]?.year || 0);
            } else if (selectedIndex === timelineLength) {
                isCorrect = activeCard.year >= (timeline[timelineLength - 1]?.year || 0);
            } else {
                const beforeCard = timeline[selectedIndex - 1];
                const afterCard = timeline[selectedIndex];
                isCorrect = activeCard.year >= (beforeCard?.year || 0) && activeCard.year <= (afterCard?.year || 0);
            }

            if (isCorrect) {
                stealerBoard.timeline.splice(selectedIndex, 0, activeCard);
                stealerBoard.score = stealerBoard.timeline.length;

                // DYNAMIC EVALUATION [2]
                const winGoal = game.targetScore || 10;
                if (stealerBoard.score >= winGoal) {
                    game.status = 'finished';
                    game.winnerId = stealerId;
                } else {
                    game.currentCard = game.deck.pop() || null;
                    game.phase = 'placement';
                    game.lastGuessCorrect = null;
                    game.lastGuessIndex = null;

                    if (game.gameplayMode === 'teams') {
                        const nextTeamId: 'A' | 'B' = game.currentTurnTeamId === 'A' ? 'B' : 'A';
                        game.currentTurnTeamId = nextTeamId;
                        const nextTeamPlayers = game.players.filter((p: any) => p.teamId === nextTeamId);
                        if (nextTeamPlayers.length > 0) {
                            const currentPlayerIdxOnTeam = nextTeamPlayers.findIndex((p: any) => p.id === game.currentTurnPlayerId);
                            const nextPlayerIdx = (currentPlayerIdxOnTeam + 1) % nextTeamPlayers.length;
                            game.currentTurnPlayerId = nextTeamPlayers[nextPlayerIdx].id;
                        } else {
                            const currentIdx = game.players.findIndex((p: any) => p.id === game.currentTurnPlayerId);
                            game.currentTurnPlayerId = game.players[(currentIdx + 1) % game.players.length].id;
                        }
                    } else {
                        const currentIdx = game.players.findIndex((p: any) => p.id === game.currentTurnPlayerId);
                        game.currentTurnPlayerId = game.players[(currentIdx + 1) % game.players.length].id;
                    }
                }

                // Force write modified tags before saving [1]
                game.markModified('currentCard');
                game.markModified('deck');
                game.markModified('players');
                game.markModified('teams');
                await game.save();
                return NextResponse.json({ game });
            } else {
                stealerBoard.tokens = Math.max(0, (stealerBoard.tokens || 0) - 1);

                // Force write modified tags before saving [1]
                game.markModified('players');
                game.markModified('teams');
                await game.save();
                return NextResponse.json({ error: 'Incorrect timeline slot! Steal failed. Penalty: -1 Token.' }, { status: 400 });
            }
        }

        // ACTION: Report Broken / Skip Song (With instant-tracking save guarantees) [1]
        else if (action === 'report_broken') {
            if (game.status !== 'playing') {
                return NextResponse.json({ error: 'Game is not active.' }, { status: 400 });
            }

            const isHost = game.players.length > 0 && game.players[0].id === playerId;
            if (game.mode === 'online' && game.currentTurnPlayerId !== playerId && !isHost) {
                return NextResponse.json({ error: 'Only the active player or host can skip songs.' }, { status: 400 });
            }

            const activeCard = game.currentCard;
            if (!activeCard) {
                return NextResponse.json({ error: 'No song active to report.' }, { status: 400 });
            }

            await ReportedSong.create({
                songId: activeCard.id,
                title: activeCard.title,
                artist: activeCard.artist,
                year: activeCard.year || 0,
                youtubeId: activeCard.youtubeId,
                roomId: game.roomId
            });

            game.currentCard = game.deck.pop() || null;
            game.phase = 'placement';
            game.lastGuessCorrect = null;
            game.lastGuessIndex = null;

            // Force write modified tags before saving [1]
            game.markModified('currentCard');
            game.markModified('deck');
            await game.save();
        }

        // ACTION: Buy card explicitly with 3 tokens [1, 2]
        else if (action === 'buy_card') {
            let boardOwner: any;
            if (game.gameplayMode === 'teams') {
                const player = game.players.find((p: any) => p.id === playerId);
                if (!player || !player.teamId) {
                    return NextResponse.json({ error: 'You must join a team to buy cards.' }, { status: 400 });
                }
                boardOwner = game.teams.find((t: any) => t.id === player.teamId);
            } else {
                boardOwner = game.players.find((p: any) => p.id === playerId);
            }

            if (!boardOwner) {
                return NextResponse.json({ error: 'Board owner not found' }, { status: 400 });
            }

            if (boardOwner.tokens < 3) {
                return NextResponse.json({ error: 'Not enough tokens. Cost: 3 Tokens.' }, { status: 400 });
            }

            boardOwner.tokens -= 3;

            const purchasedCard = game.deck.pop();
            if (purchasedCard) {
                if (!boardOwner.timeline) boardOwner.timeline = [];
                boardOwner.timeline.push(purchasedCard);
                boardOwner.timeline.sort((a: ICard, b: ICard) => a.year - b.year);
                boardOwner.score = boardOwner.timeline.length;
            }

            // DYNAMIC EVALUATION [2]
            const winGoal = game.targetScore || 10;
            if (boardOwner.score >= winGoal) {
                game.status = 'finished';
                game.winnerId = game.gameplayMode === 'teams' ? boardOwner.id : boardOwner.id;
            }

            // Force write modified tags before saving [1]
            game.markModified('currentCard');
            game.markModified('deck');
            game.markModified('players');
            game.markModified('teams');
            await game.save();
        }

        const gameObj = game.toObject();
        gameObj.mode = roomId.startsWith('LOC_') ? 'local' : gameObj.mode;

        return NextResponse.json({ game: gameObj });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}