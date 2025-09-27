import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import financeRoutes from "./routes/financeRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import companiesRoutes from "./routes/companiesRoutes.js";
import redditRoutes from "./routes/redditRoutes.js";
import sentimentRoutes from "./routes/sentimentRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";
import velocityRoutes from "./routes/velocityRoutes.js";
import sourcesRoutes from "./routes/sourcesRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";
import timeSeriesRoutes from "./routes/timeSeriesRoutes.js";
import topicIntelligenceRoutes from "./routes/topicIntelligenceRoutes.js";
import marketInsightsRoutes from "./routes/marketInsightsRoutes.js";
import campaignStrategyRoutes from "./routes/campaignStrategyRoutes.js";
import whatifRoutes from "./routes/whatifRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// API v1 namespace
app.use("/api/v1/finance-chart", financeRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/companies', companiesRoutes);
app.use('/api/v1/reddit', redditRoutes);
app.use('/api/v1/sentiment', sentimentRoutes);
app.use('/api/v1/ml', mlRoutes);
app.use('/api/v1/velocity', velocityRoutes);
app.use('/api/v1/sources', sourcesRoutes);
app.use('/api/v1/insights', insightsRoutes);
app.use('/time-series', timeSeriesRoutes);
app.use('/api/v1/topic-intelligence', topicIntelligenceRoutes);
app.use('/api/v1/market-insights', marketInsightsRoutes);
app.use('/api/v1/campaign-strategy', campaignStrategyRoutes);
app.use('/api/v1/whatif', whatifRoutes);

// Backward compatibility redirects to v1
app.use('/api/finance-chart', (_req, res) => res.redirect(301, '/api/v1/finance-chart'));
app.use('/api/news', (_req, res) => res.redirect(301, '/api/v1/news'));
app.use('/api/companies', (_req, res) => res.redirect(301, '/api/v1/companies'));
app.use('/api/reddit', (_req, res) => res.redirect(301, '/api/v1/reddit'));
app.use('/api/sentiment', (_req, res) => res.redirect(301, '/api/v1/sentiment'));
app.use('/api/ml', (_req, res) => res.redirect(301, '/api/v1/ml'));
app.use('/api/velocity', (_req, res) => res.redirect(301, '/api/v1/velocity'));
app.use('/api/sources', (_req, res) => res.redirect(301, '/api/v1/sources'));

const PORT = process.env.PORT || 5000;
process.env.PUBLIC_BACKEND_BASE_URL = process.env.PUBLIC_BACKEND_BASE_URL || `http://localhost:${PORT}`;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});


