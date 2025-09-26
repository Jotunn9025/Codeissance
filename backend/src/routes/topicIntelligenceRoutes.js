import express from "express";
import { 
  getTopicClusters, 
  getRisingTopics, 
  getCoMentionAnalysis 
} from "../controllers/topicIntelligenceController.js";

const router = express.Router();

// Topic Intelligence Routes
router.get('/clustering', getTopicClusters);
router.get('/rising-topics', getRisingTopics);
router.get('/comention', getCoMentionAnalysis);

export default router;
