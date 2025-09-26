import express from "express";
import { scrapeSources } from "../controllers/scrapeController.js";
import { getWeightedSentiment } from "../controllers/weightedSentimentController.js";

const router = express.Router();

router.get('/scrape', scrapeSources);
router.get('/weighted-sentiment', getWeightedSentiment);

export default router;


