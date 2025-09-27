import express from 'express';
import { 
  analyzeWhatIf, 
  getConversationHistory, 
  clearConversation, 
  getScenarioTypes, 
  analyzeScenario 
} from '../controllers/whatIfController.js';

const router = express.Router();

// Main what-if analysis endpoint (with NLP processing)
router.post('/analyze', analyzeWhatIf);

// Direct scenario analysis endpoint (bypasses NLP)
router.post('/scenario', analyzeScenario);

// Get conversation history
router.get('/conversation', getConversationHistory);

// Clear conversation
router.post('/conversation/clear', clearConversation);

// Get available scenario types
router.get('/scenario-types', getScenarioTypes);

export default router;