import axios from "axios";
import { fetchPerplexityNews } from "./newsController.js";
import { fetchRedditPosts } from "./redditController.js";

async function fetchChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5mo`;
  const response = await axios.get(url);
  const chart = response.data.chart.result?.[0];
  if (!chart) return null;
  const indicators = chart.indicators.quote[0];
  return {
    timestamps: chart.timestamp,
    open: indicators.open,
    high: indicators.high,
    low: indicators.low,
    close: indicators.close,
    volume: indicators.volume,
  };
}

export const getCompaniesSummary = async (req, res) => {
  const q = (req.query.symbols || "").trim();
  const symbols = q ? q.split(",").map((s) => s.trim().toUpperCase()).slice(0, 10) : ["AAPL", "MSFT", "GOOGL"];
  try {
    const charts = await Promise.all(symbols.map((s) => fetchChart(s)));

    const newsResults = await Promise.all(
      symbols.map(async (s) => {
        try {
          return await fetchPerplexityNews(s);
        } catch (_e) {
          return [];
        }
      })
    );

    const redditResults = await Promise.all(
      symbols.map(async (s) => {
        try {
          return await fetchRedditPosts(s);
        } catch (_e) {
          return [];
        }
      })
    );

    const payload = {};
    symbols.forEach((sym, idx) => {
      payload[sym] = { chart: charts[idx], articles: newsResults[idx], reddit: redditResults[idx] };
    });

    res.json(payload);
  } catch (error) {
    console.error("Error building companies summary:", error.message);
    res.status(500).json({ error: "Failed to build companies summary" });
  }
};


