import axios from "axios";

function classifyShift(averages) {
  const entries = Object.entries(averages || {});
  if (!entries.length) return { direction: "neutral", from: null, to: null };
  const sorted = entries.sort((a,b) => b[1] - a[1]);
  const [top, bottom] = [sorted[0], sorted[sorted.length - 1]];
  const direction = top[1] - bottom[1] > 0.15 ? (top[1] > 0 ? "positive" : "negative") : "neutral";
  return { direction, from: bottom[0], to: top[0] };
}

export const getMultiSourceInsights = async (req, res) => {
  const symbol = String(req.query.symbol || req.params.symbol || "AAPL").toUpperCase();
  const fast = String(req.query.fast || '1') === '1';
  try {
    const base = process.env.PUBLIC_BACKEND_BASE_URL || '';
    const wsUrl = `${base}/api/v1/sources/weighted-sentiment?symbol=${encodeURIComponent(symbol)}${fast ? '&mode=fast' : ''}`;
    const weighted = await axios.get(wsUrl, { timeout: 12000 });
    const data = weighted.data || {};
    const { averages = {}, score = 0 } = data;
    const shift = classifyShift(averages);

    const insights = {
      symbol,
      score,
      shift,
      rationale: `Signal ${score.toFixed(3)} with shift from ${shift.from || 'n/a'} to ${shift.to || 'n/a'}.`,
    };
    res.json({ ok: true, ...insights, components: { averages } });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};

export const getMarketForecast = async (req, res) => {
  const symbol = String(req.query.symbol || req.params.symbol || "AAPL").toUpperCase();
  const fast = String(req.query.fast || '1') === '1';
  const includeMl = String(req.query.includeMl || '1') === '1';
  try {
    const base = process.env.PUBLIC_BACKEND_BASE_URL || '';
    // Weighted sentiment
    const wsRes = await axios.get(`${base}/api/v1/sources/weighted-sentiment?symbol=${encodeURIComponent(symbol)}${fast ? '&mode=fast' : ''}` , { timeout: 12000 });
    const ws = wsRes.data || {};
    // Quick price history (for context)
    let ch = {};
    try {
      const chRes = await axios.get(`${base}/api/v1/finance-chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`, { timeout: 10000 });
      ch = chRes.data || {};
    } catch (_) { ch = {}; }
    // ML forecast (FastAPI)
    let ml = {};
    if (includeMl) {
      try {
        const mlBase = process.env.ML_API_BASE_URL || 'http://localhost:5001';
        const mlRes = await axios.get(`${mlBase}/retrain?symbol=${encodeURIComponent(symbol)}`, { timeout: 20000 });
        ml = mlRes.data || {};
      } catch (_) { ml = { ok: false, error: 'ml_timeout' }; }
    }

    res.json({ ok: true, symbol, sentiment: ws, chart: ch, ml });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};


