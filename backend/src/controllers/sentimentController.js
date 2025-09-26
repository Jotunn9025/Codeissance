import axios from "axios";

function normalizeText(text) {
  return String(text || "").toLowerCase();
}

function scoreText(text) {
  const t = normalizeText(text);
  const positive = ["beat", "surge", "rally", "up", "gain", "bull", "strong", "record", "growth", "upgrade"];
  const negative = ["miss", "plunge", "down", "loss", "bear", "weak", "cut", "downgrade", "probe", "layoff"];
  let score = 0;
  for (const p of positive) if (t.includes(p)) score += 1;
  for (const n of negative) if (t.includes(n)) score -= 1;
  return score;
}

export async function computeSentimentForSymbol(symbol) {
  const base = process.env.PUBLIC_BACKEND_BASE_URL || '';
  const results = [];
  try {
    const newsRes = await axios.get(`${base}/api/v1/news/${encodeURIComponent(symbol)}`, { timeout: 12000 });
    const articles = newsRes?.data?.articles || [];
    for (const a of articles) {
      const text = `${a.title} ${a.publisher}`;
      results.push({ source: "news", text, score: scoreText(text) });
    }
  } catch (_) {}

  try {
    const redditRes = await axios.get(`${base}/api/v1/reddit/${encodeURIComponent(symbol)}`, { timeout: 12000 });
    const posts = redditRes?.data?.posts || [];
    for (const p of posts) {
      const text = `${p.title} r/${p.subreddit}`;
      results.push({ source: "reddit", text, score: scoreText(text) });
    }
  } catch (_) {}

  const total = results.reduce((s, r) => s + r.score, 0);
  const avg = results.length ? total / results.length : 0;
  const label = avg > 0.2 ? "positive" : avg < -0.2 ? "negative" : "neutral";
  return { symbol, label, score: avg, samples: results.slice(0, 25) };
}

export const getSentiment = async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await computeSentimentForSymbol(symbol);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to compute sentiment" });
  }
};


