import express from "express";
import { 
  scrapeSources, 
  clearCacheEndpoint, 
  getCacheStatusEndpoint, 
  forceRefreshEndpoint 
} from "../controllers/scrapeController.js";
import { getWeightedSentiment } from "../controllers/weightedSentimentController.js";

const router = express.Router();

router.get('/scrape', scrapeSources);
router.get('/weighted-sentiment', getWeightedSentiment);

// Cache management routes
router.post('/cache/clear', clearCacheEndpoint);
router.get('/cache/status', getCacheStatusEndpoint);
router.post('/cache/refresh', forceRefreshEndpoint);

export default router;


