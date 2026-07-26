import mongoose, { Schema, Document } from 'mongoose';

export interface IReportedSong extends Document {
    songId: string;
    title: string;
    artist: string;
    year: number;
    youtubeId: string;
    roomId: string;
    reportedAt: Date;
}

const ReportedSongSchema = new Schema<IReportedSong>({
    songId: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    year: { type: Number, required: true },
    youtubeId: { type: String, required: true },
    roomId: { type: String, required: true },
    reportedAt: { type: Date, default: Date.now }
});

if (mongoose.models.ReportedSong) {
    delete mongoose.models.ReportedSong;
}

export default mongoose.model<IReportedSong>('ReportedSong', ReportedSongSchema);