import mongoose, { Schema, Document } from 'mongoose';

export interface ICard {
    id: string;
    title: string;
    artist: string;
    year: number;
    youtubeId: string;
}

export interface IPlayer {
    id: string;
    name: string;
    teamId: 'A' | 'B' | null;
    timeline: ICard[];
    score: number;
    tokens: number;
}

export interface ITeam {
    id: 'A' | 'B';
    name: string;
    timeline: ICard[];
    score: number;
    tokens: number;
}

export interface IGame extends Document {
    roomId: string;
    status: 'waiting' | 'playing' | 'finished';
    phase: 'placement' | 'metadata_guess' | 'revealed';
    mode: 'local' | 'online';
    gameplayMode: 'individual' | 'teams';
    deck: ICard[];
    players: IPlayer[];
    teams: ITeam[];
    currentTurnPlayerId: string;
    currentTurnTeamId: 'A' | 'B' | null;
    currentCard: ICard | null;
    lastGuessCorrect: boolean | null;
    lastGuessIndex: number | null;
    winnerId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const CardSchema = new Schema<ICard>({
    id: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    year: { type: Number, required: true },
    youtubeId: { type: String, required: true },
});

const PlayerSchema = new Schema<IPlayer>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    teamId: { type: String, enum: ['A', 'B', null], default: null },
    timeline: [CardSchema],
    score: { type: Number, default: 0 },
    tokens: { type: Number, default: 0 },
});

const TeamSchema = new Schema<ITeam>({
    id: { type: String, enum: ['A', 'B'], required: true },
    name: { type: String, required: true },
    timeline: [CardSchema],
    score: { type: Number, default: 0 },
    tokens: { type: Number, default: 0 },
});

const GameSchema = new Schema<IGame>({
    roomId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
    phase: { type: String, enum: ['placement', 'metadata_guess', 'revealed'], default: 'placement' },
    mode: { type: String, enum: ['local', 'online'], default: 'online' },
    gameplayMode: { type: String, enum: ['individual', 'teams'], default: 'individual' },
    deck: [CardSchema],
    players: [PlayerSchema],
    teams: [TeamSchema],
    currentTurnPlayerId: { type: String, default: '' },
    currentTurnTeamId: { type: String, enum: ['A', 'B', null], default: null },
    currentCard: { type: Schema.Types.Mixed, default: null },
    lastGuessCorrect: { type: Boolean, default: null },
    lastGuessIndex: { type: Number, default: null },
    winnerId: { type: String, default: null },
}, { timestamps: true });

// Cache-busting compiler setup
if (mongoose.models.Game) {
    delete mongoose.models.Game;
}

export default mongoose.model<IGame>('Game', GameSchema);