import express from "express";
import { getMultiSourceInsights, getMarketForecast } from "../controllers/insightsController.js";

const router = express.Router();

router.get('/multi-source', getMultiSourceInsights);
router.get('/market-forecast', getMarketForecast);

export default router;


