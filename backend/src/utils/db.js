import mongoose from "mongoose";

let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Missing MONGODB_URI in environment");
    cached.promise = mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const WeightedSentimentSchema = new mongoose.Schema({
  company: { type: String, index: true },
  confidence: { type: Number },
  news_confidence: { type: Number },
  perplexity_confidence: { type: Number },
  x_confidence: { type: Number },
  reddit_confidence: { type: Number },
  time: { type: Date, default: () => new Date() },
}, { collection: 'weighted_sentiments' });

export const WeightedSentimentModel = mongoose.models.WeightedSentiment || mongoose.model('WeightedSentiment', WeightedSentimentSchema);


