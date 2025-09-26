import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { connectToDatabase, WeightedSentimentModel } from "../utils/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getRepoRootDir() {
  return path.resolve(__dirname, "../../../");
}

function getPythonExe() {
  const venvPython = process.platform === "win32"
    ? path.join(getRepoRootDir(), "venv", "Scripts", "python.exe")
    : path.join(getRepoRootDir(), "venv", "bin", "python");
  return venvPython;
}

async function fetchSources() {
  const base = process.env.PUBLIC_BACKEND_BASE_URL || '';
  const url = `${base}/api/v1/sources/scrape`;
  const res = await axios.get(url, { timeout: 20000 });
  return res.data;
}

function aggregateWeighted(scores, counts, weights) {
  // scores: dict of arrays per source; counts: lengths per source
  // weights: dict of per-source weight
  let num = 0;
  let den = 0;
  for (const src of Object.keys(weights)) {
    const w = Number(weights[src] || 0);
    const sArr = scores[src] || [];
    if (!sArr.length || w <= 0) continue;
    const avg = sArr.reduce((s, v) => s + v, 0) / sArr.length;
    num += avg * w;
    den += w;
  }
  return den > 0 ? num / den : 0;
}

export const getWeightedSentiment = async (req, res) => {
  const mode = String(req.query.mode || '').toLowerCase();

  try {
    const data = await fetchSources();
    const titles = {
      news: (data.newsApi || []).map((x) => x.title).filter(Boolean),
      perplexity: (data.perplexity || []).map((x) => x.title).filter(Boolean),
      x: (data.x || []).map((x) => x.title).filter(Boolean),
      reddit: (data.reddit || []).map((x) => x.title).filter(Boolean),
    };

    const repoRoot = getRepoRootDir();
    const pythonExe = getPythonExe();
    const cliPath = path.join(repoRoot, "ML", "finbert_score_cli.py");

    function heuristicScore(text) {
      const t = String(text || '').toLowerCase();
      const pos = ["beat","surge","rally","up","gain","bull","strong","record","growth","upgrade"];
      const neg = ["miss","plunge","down","loss","bear","weak","cut","downgrade","probe","layoff"];
      let s = 0; for (const p of pos) if (t.includes(p)) s += 1; for (const n of neg) if (t.includes(n)) s -= 1; return s;
    }

    const runPipe = (arr) => new Promise((resolve) => {
      if (mode === 'fast') {
        const scores = (arr || []).map((t) => Math.max(-1, Math.min(1, heuristicScore(t))));
        return resolve(scores);
      }
      const argJson = JSON.stringify(arr || []);
      const proc = spawn(pythonExe, [cliPath, "--json", argJson], {
        cwd: repoRoot,
        env: { ...process.env },
        stdio: ["ignore", "pipe", "pipe"],
      });
      let out = ""; let err = "";
      proc.stdout.on("data", (d) => (out += d.toString()));
      proc.stderr.on("data", (d) => (err += d.toString()));
      proc.on("close", () => {
        try {
          const parsed = JSON.parse(out);
          if (parsed && parsed.ok) return resolve(parsed.scores || []);
        } catch (_) {}
        resolve([]);
      });
    });

    const [sNews, sPerp, sX, sReddit] = await Promise.all([
      runPipe(titles.news),
      runPipe(titles.perplexity),
      runPipe(titles.x),
      runPipe(titles.reddit),
    ]);

    const weights = { news: 0.4, perplexity: 0.25, x: 0.2, reddit: 0.15 };
    const score = aggregateWeighted({ news: sNews, perplexity: sPerp, x: sX, reddit: sReddit }, {
      news: titles.news.length,
      perplexity: titles.perplexity.length,
      x: titles.x.length,
      reddit: titles.reddit.length,
    }, weights);

    // Persist to MongoDB
    try {
      await connectToDatabase();
      await WeightedSentimentModel.create({
        company: "marketing_trends",
        confidence: score,
        news_confidence: (sNews.length ? sNews.reduce((s,v)=>s+v,0)/sNews.length : 0),
        perplexity_confidence: (sPerp.length ? sPerp.reduce((s,v)=>s+v,0)/sPerp.length : 0),
        x_confidence: (sX.length ? sX.reduce((s,v)=>s+v,0)/sX.length : 0),
        reddit_confidence: (sReddit.length ? sReddit.reduce((s,v)=>s+v,0)/sReddit.length : 0),
        time: new Date(),
      });
    } catch (_) {}

    res.json({ ok: true, type: "marketing_trends", weights, counts: {
      news: titles.news.length,
      perplexity: titles.perplexity.length,
      x: titles.x.length,
      reddit: titles.reddit.length,
    }, averages: {
      news: sNews.length ? sNews.reduce((s,v)=>s+v,0)/sNews.length : 0,
      perplexity: sPerp.length ? sPerp.reduce((s,v)=>s+v,0)/sPerp.length : 0,
      x: sX.length ? sX.reduce((s,v)=>s+v,0)/sX.length : 0,
      reddit: sReddit.length ? sReddit.reduce((s,v)=>s+v,0)/sReddit.length : 0,
    }, score });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};


