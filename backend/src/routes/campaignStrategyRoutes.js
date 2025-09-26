import express from 'express';
import { getCampaignStrategies, clearStrategyCache } from '../controllers/campaignStrategyController.js';

const router = express.Router();

// Get campaign strategies
router.get('/strategies', getCampaignStrategies);

// Clear strategy cache
router.post('/cache/clear', clearStrategyCache);

export default router;
