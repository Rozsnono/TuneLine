export interface Card {
    id: string;
    title: string;
    artist: string;
    year?: number | null;
    youtubeId: string;
}

export interface Player {
    id: string;
    name: string;
    teamId: 'A' | 'B' | null;
    timeline: Card[];
    score: number;
    tokens: number;
}

export interface Team {
    id: 'A' | 'B';
    name: string;
    timeline: Card[];
    score: number;
    tokens: number;
}

export interface GameState {
    roomId: string;
    status: 'waiting' | 'playing' | 'finished';
    phase: 'placement' | 'metadata_guess' | 'revealed';
    mode: 'local' | 'online';
    gameplayMode: 'individual' | 'teams';
    players: Player[];
    teams: Team[];
    currentTurnPlayerId: string;
    currentTurnTeamId: 'A' | 'B' | null;
    currentCard: Card | null;
    lastGuessCorrect: boolean | null;
    lastGuessIndex: number | null;
    winnerId: string | null;
    maxPlayTime: number;
    isTokenPurchase: boolean;
    targetScore: number;

}