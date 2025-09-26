import express from "express";
import { 
  getCorrelationData, 
  getForecasts, 
  getStrategySuggestions 
} from "../controllers/marketInsightsController.js";

const router = express.Router();

// Market Insights Routes
router.get('/correlation', getCorrelationData);
router.get('/forecasting', getForecasts);
router.get('/strategy', getStrategySuggestions);

export default router;
