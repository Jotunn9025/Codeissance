import axios from "axios";

function scoreText(text) {
  const t = String(text || "").toLowerCase();
  const positive = ["beat", "surge", "rally", "up", "gain", "bull", "strong", "record", "growth", "upgrade"];
  const negative = ["miss", "plunge", "down", "loss", "bear", "weak", "cut", "downgrade", "probe", "layoff"];
  let score = 0;
  for (const p of positive) if (t.includes(p)) score += 1;
  for (const n of negative) if (t.includes(n)) score -= 1;
  return score;
}

async function fetchReddit(symbol) {
  try {
    const base = process.env.PUBLIC_BACKEND_BASE_URL || '';
    const res = await axios.get(`${base}/api/v1/reddit/${encodeURIComponent(symbol)}`, { timeout: 12000 });
    return res?.data?.posts || [];
  } catch (_) { return []; }
}

async function fetchNews(symbol) {
  try {
    const base = process.env.PUBLIC_BACKEND_BASE_URL || '';
    const res = await axios.get(`${base}/api/v1/news/${encodeURIComponent(symbol)}`, { timeout: 15000 });
    return res?.data?.articles || [];
  } catch (_) { return []; }
}

// Placeholder for X/Twitter; could be wired to an API later.
async function fetchX(symbol) {
  return [];
}

export const getVelocity = async (req, res) => {
  const symbol = String(req.query.symbol || req.params.symbol || "AAPL").toUpperCase();

  const [xPosts, redditPosts, newsArticles] = await Promise.all([
    fetchX(symbol),
    fetchReddit(symbol),
    fetchNews(symbol)
  ]);

  // Score items by simple keyword heuristic
  const xNodes = xPosts.map((p, i) => ({ id: `x-${i}`, platform: "X", text: p.text || p.title || "", score: scoreText(p.text || p.title || "") }));
  const redditNodes = redditPosts.map((p, i) => ({ id: `r-${p.id || i}`, platform: "Reddit", text: p.title, score: scoreText(p.title) }));
  const newsNodes = newsArticles.map((a, i) => ({ id: `n-${i}`, platform: "News", text: a.title, score: scoreText(a.title) }));

  // Build edges heuristically: X -> Reddit if similar terms; Reddit -> News if overlap
  const edges = [];
  const takeTerms = (s) => (String(s || '').toLowerCase().match(/[a-z]{3,}/g) || []).slice(0, 5);

  for (const x of xNodes) {
    const xTerms = takeTerms(x.text);
    for (const r of redditNodes) {
      const rTerms = takeTerms(r.text);
      const overlap = xTerms.filter(t => rTerms.includes(t));
      if (overlap.length >= 1) edges.push({ from: x.id, to: r.id, weight: overlap.length, kind: "x->reddit" });
    }
  }

  for (const r of redditNodes) {
    const rTerms = takeTerms(r.text);
    for (const n of newsNodes) {
      const nTerms = takeTerms(n.text);
      const overlap = rTerms.filter(t => nTerms.includes(t));
      if (overlap.length >= 1) edges.push({ from: r.id, to: n.id, weight: overlap.length, kind: "reddit->news" });
    }
  }

  const nodes = [...xNodes, ...redditNodes, ...newsNodes];
  // Aggregate platform sentiment
  const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);
  const platformSentiment = {
    X: avg(xNodes.map(n => n.score)),
    Reddit: avg(redditNodes.map(n => n.score)),
    News: avg(newsNodes.map(n => n.score)),
  };

  // Optional Gemini narrative
  let aiNarrative = "";
  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (googleApiKey) {
    try {
      const titlesChrono = [
        ...xNodes.map(n => `X: ${n.text}`),
        ...redditNodes.map(n => `Reddit: ${n.text}`),
        ...newsNodes.map(n => `News: ${n.text}`)
      ].slice(0, 15);
      const prompt = `You are an analyst. Given post titles across platforms, write a concise narrative (<=120 words) explaining how sentiment is migrating across platforms for ${symbol}. Focus on direction, where it started, where it is amplifying, and likely next hop. Titles in order:\n` + titlesChrono.map((t, i) => `${i+1}. ${t}`).join("\n");
      const gemRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { timeout: 12000 }
      );
      aiNarrative = gemRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (_e) {
      aiNarrative = "";
    }
  }

  res.json({ symbol, nodes, edges, platformSentiment, aiNarrative });
};


