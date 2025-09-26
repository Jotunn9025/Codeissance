import axios from "axios";

export const getStockChart = async (req, res) => {
  try {
    const { symbol } = req.params;
    const range = req.query.range || "5mo";
    const interval = req.query.interval || "1d";
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

    const response = await axios.get(url);
    const chart = response.data.chart.result[0];
    if (!chart) return res.status(404).json({ error: "No data found for this symbol" });

    const timestamps = chart.timestamp;
    const indicators = chart.indicators.quote[0];

    res.json({
      symbol,
      timestamps,
      open: indicators.open,
      high: indicators.high,
      low: indicators.low,
      close: indicators.close,
      volume: indicators.volume
    });
  } catch (error) {
    console.error("Error fetching stock chart:", error.message);
    res.status(500).json({ error: "Failed to fetch stock chart data" });
  }
};


