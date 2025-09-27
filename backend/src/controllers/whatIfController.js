import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Global message memory store
const messageMemory = {
  conversations: new Map(),
  getConversation: (sessionId) => {
    if (!messageMemory.conversations.has(sessionId)) {
      messageMemory.conversations.set(sessionId, []);
    }
    return messageMemory.conversations.get(sessionId);
  },
  addMessage: (sessionId, role, content) => {
    const conversation = messageMemory.getConversation(sessionId);
    conversation.push({ role, content, timestamp: new Date().toISOString() });
    // Keep only last 20 messages to prevent memory bloat
    if (conversation.length > 20) {
      conversation.splice(0, conversation.length - 20);
    }
  },
  getConversationHistory: (sessionId) => {
    return messageMemory.getConversation(sessionId);
  },
  clearConversation: (sessionId) => {
    messageMemory.conversations.delete(sessionId);
  }
};

// Load conversation history from JSON file on startup
const loadConversationHistory = () => {
  try {
    const filePath = path.join(process.cwd(), 'conversation_memory.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      messageMemory.conversations = new Map(parsed);
      console.log('✅ Loaded conversation history from file');
    }
  } catch (error) {
    console.log('⚠️ Could not load conversation history:', error.message);
  }
};

// Save conversation history to JSON file
const saveConversationHistory = () => {
  try {
    const filePath = path.join(process.cwd(), 'conversation_memory.json');
    const data = JSON.stringify(Array.from(messageMemory.conversations.entries()));
    fs.writeFileSync(filePath, data, 'utf8');
    console.log('💾 Saved conversation history to file');
  } catch (error) {
    console.log('❌ Could not save conversation history:', error.message);
  }
};

// Load history on startup
loadConversationHistory();

// Save history every 5 minutes
setInterval(saveConversationHistory, 5 * 60 * 1000);

// Scenario types and their parameters
const SCENARIO_TYPES = {
  market_crash: {
    required: ['crash_percent'],
    optional: ['duration', 'sector'],
    description: 'Simulate market crash impact'
  },
  product_launch: {
    required: ['product_name', 'category'],
    optional: ['price', 'target_market', 'competitors'],
    description: 'Simulate product launch sentiment'
  },
  earnings_beat: {
    required: ['company', 'beat_percent'],
    optional: ['quarter', 'sector'],
    description: 'Simulate beating earnings expectations'
  },
  earnings_miss: {
    required: ['company', 'miss_percent'],
    optional: ['quarter', 'sector'],
    description: 'Simulate missing earnings expectations'
  },
  merger_acquisition: {
    required: ['acquirer', 'target'],
    optional: ['deal_value', 'sector'],
    description: 'Simulate merger/acquisition impact'
  },
  regulatory_change: {
    required: ['regulation', 'sector'],
    optional: ['impact_level', 'timeline'],
    description: 'Simulate regulatory change impact'
  },
  competitor_announcement: {
    required: ['competitor', 'announcement_type'],
    optional: ['impact_scope', 'sector'],
    description: 'Simulate competitor announcement impact'
  },
  economic_indicator: {
    required: ['indicator', 'change_percent'],
    optional: ['timeframe', 'sector_impact'],
    description: 'Simulate economic indicator change'
  }
};

// Add noise to sentiment prediction to make it more realistic
function addRealisticNoise(sentiment, confidence) {
  const baseNoise = 0.05; // 5% base noise
  const confidenceNoise = (1 - confidence) * 0.1; // More noise for lower confidence
  const totalNoise = baseNoise + confidenceNoise;
  
  const noise = (Math.random() - 0.5) * 2 * totalNoise;
  const noisySentiment = sentiment + noise;
  
  // Clamp between -1 and 1
  return Math.max(-1, Math.min(1, noisySentiment));
}

// Generate realistic sentiment prediction based on scenario
function generateSentimentPrediction(scenario) {
  const { type, ...params } = scenario;
  
  let baseSentiment = 0;
  let confidence = 0.8;
  
  switch (type) {
    case 'market_crash':
      baseSentiment = -0.7 - (params.crash_percent / 100) * 0.3;
      confidence = 0.85;
      break;
      
    case 'product_launch':
      baseSentiment = 0.3 + Math.random() * 0.4; // Generally positive
      confidence = 0.75;
      break;
      
    case 'earnings_beat':
      baseSentiment = 0.6 + (params.beat_percent / 100) * 0.3;
      confidence = 0.9;
      break;
      
    case 'earnings_miss':
      baseSentiment = -0.6 - (params.miss_percent / 100) * 0.3;
      confidence = 0.9;
      break;
      
    case 'merger_acquisition':
      baseSentiment = 0.2 + Math.random() * 0.3; // Slightly positive
      confidence = 0.8;
      break;
      
    case 'regulatory_change':
      baseSentiment = -0.3 + Math.random() * 0.6; // Mixed
      confidence = 0.7;
      break;
      
    case 'competitor_announcement':
      baseSentiment = -0.2 + Math.random() * 0.4; // Slightly negative
      confidence = 0.75;
      break;
      
    case 'economic_indicator':
      const change = params.change_percent;
      baseSentiment = change > 0 ? 0.4 : -0.4;
      confidence = 0.8;
      break;
      
    default:
      baseSentiment = Math.random() * 0.4 - 0.2; // Random between -0.2 and 0.2
      confidence = 0.6;
  }
  
  const noisySentiment = addRealisticNoise(baseSentiment, confidence);
  
  return {
    sentiment: noisySentiment,
    confidence: confidence,
    magnitude: Math.abs(noisySentiment),
    direction: noisySentiment > 0 ? 'positive' : 'negative'
  };
}

// Call Python script for NLP processing
async function processWithLangchain(userInput, sessionId) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'src', 'python', 'langchain_gemini.py');
    const conversationHistory = messageMemory.getConversationHistory(sessionId);
    
    const pythonProcess = spawn('python', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const input = JSON.stringify({
      user_input: userInput,
      conversation_history: conversationHistory,
      scenario_types: Object.keys(SCENARIO_TYPES)
    });
    
    let output = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${error}`));
      }
    });
    
    pythonProcess.stdin.write(input);
    pythonProcess.stdin.end();
  });
}

// Main what-if analysis endpoint
export const analyzeWhatIf = async (req, res) => {
  try {
    const { userInput, sessionId = 'default' } = req.body;
    
    if (!userInput) {
      return res.status(400).json({
        success: false,
        error: 'User input is required'
      });
    }
    
    console.log(`🤖 Processing what-if analysis for session: ${sessionId}`);
    
    // Add user message to memory
    messageMemory.addMessage(sessionId, 'user', userInput);
    
    // Process with Python script (two-stage approach)
    let nlpResult;
    try {
      nlpResult = await processWithLangchain(userInput, sessionId);
    } catch (error) {
      console.log('⚠️ Python script failed, using fallback processing');
      // Fallback: conversational response
      nlpResult = {
        processing_type: 'conversational',
        classification: { input_type: 'other', confidence: 0.3, reasoning: 'Fallback due to error' },
        conversational_data: {
          response_type: 'conversational',
          message: 'I encountered an error processing your request. Please try asking about a specific scenario or rephrasing your question.',
          suggestions: [
            'What if Tesla stock crashes by 30%?',
            'What if Apple launches a new iPhone?',
            'What if the Fed raises interest rates by 2%?'
          ],
          references_previous_analysis: false
        }
      };
    }
    
    // Handle different processing types
    if (nlpResult.processing_type === 'scenario') {
      // Handle scenario analysis
      const { scenario_data } = nlpResult;
      const { scenario_type, parameters, confidence, explanation } = scenario_data;
      
      // Validate scenario type
      if (!SCENARIO_TYPES[scenario_type]) {
        return res.status(400).json({
          success: false,
          error: `Invalid scenario type: ${scenario_type}`,
          available_types: Object.keys(SCENARIO_TYPES)
        });
      }
      
      // Generate sentiment prediction
      const sentimentPrediction = generateSentimentPrediction({
        type: scenario_type,
        ...parameters
      });
      
      // Create response
      const response = {
        success: true,
        processing_type: 'scenario',
        scenario: {
          type: scenario_type,
          parameters: parameters,
          description: SCENARIO_TYPES[scenario_type].description
        },
        prediction: {
          sentiment: sentimentPrediction.sentiment,
          confidence: sentimentPrediction.confidence,
          magnitude: sentimentPrediction.magnitude,
          direction: sentimentPrediction.direction,
          explanation: explanation
        },
        metadata: {
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          processing_method: 'ai_enhanced_two_stage'
        }
      };
      
      // Add assistant response to memory
      messageMemory.addMessage(sessionId, 'assistant', JSON.stringify(response));
      
      console.log(`✅ What-if analysis completed for ${scenario_type}`);
      
      res.json(response);
      
    } else if (nlpResult.processing_type === 'conversational') {
      // Handle conversational response
      const { conversational_data } = nlpResult;
      
      // Create conversational response
      const response = {
        success: true,
        processing_type: 'conversational',
        message: conversational_data.message,
        suggestions: conversational_data.suggestions || [],
        references_previous_analysis: conversational_data.references_previous_analysis || false,
        metadata: {
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          processing_method: 'ai_enhanced_conversational'
        }
      };
      
      // Add assistant response to memory
      messageMemory.addMessage(sessionId, 'assistant', conversational_data.message);
      
      console.log(`✅ Conversational response generated`);
      
      res.json(response);
      
    } else {
      // Handle error case
      const fallbackResponse = nlpResult.fallback_response || {
        response_type: 'conversational',
        message: 'I encountered an error processing your request. Please try again.',
        suggestions: [
          'What if Tesla stock crashes by 30%?',
          'What if Apple launches a new iPhone?'
        ],
        references_previous_analysis: false
      };
      
      const response = {
        success: true,
        processing_type: 'conversational',
        message: fallbackResponse.message,
        suggestions: fallbackResponse.suggestions || [],
        references_previous_analysis: fallbackResponse.references_previous_analysis || false,
        metadata: {
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          processing_method: 'fallback'
        }
      };
      
      // Add assistant response to memory
      messageMemory.addMessage(sessionId, 'assistant', fallbackResponse.message);
      
      console.log(`⚠️ Using fallback response`);
      
      res.json(response);
    }
    
  } catch (error) {
    console.error('❌ What-if analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze what-if scenario',
      details: error.message
    });
  }
};

// Get conversation history endpoint
export const getConversationHistory = async (req, res) => {
  try {
    const { sessionId = 'default' } = req.query;
    const history = messageMemory.getConversationHistory(sessionId);
    
    res.json({
      success: true,
      session_id: sessionId,
      history: history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting conversation history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation history'
    });
  }
};

// Clear conversation endpoint
export const clearConversation = async (req, res) => {
  try {
    const { sessionId = 'default' } = req.body;
    messageMemory.clearConversation(sessionId);
    
    res.json({
      success: true,
      message: `Conversation cleared for session: ${sessionId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error clearing conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear conversation'
    });
  }
};

// Get available scenario types endpoint
export const getScenarioTypes = async (req, res) => {
  try {
    res.json({
      success: true,
      scenario_types: SCENARIO_TYPES,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting scenario types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scenario types'
    });
  }
};

// Direct scenario analysis endpoint (bypasses NLP)
export const analyzeScenario = async (req, res) => {
  try {
    const { type, ...parameters } = req.body;
    
    if (!type || !SCENARIO_TYPES[type]) {
      return res.status(400).json({
        success: false,
        error: `Invalid scenario type: ${type}`,
        available_types: Object.keys(SCENARIO_TYPES)
      });
    }
    
    // Validate required parameters
    const required = SCENARIO_TYPES[type].required;
    for (const param of required) {
      if (!parameters[param]) {
        return res.status(400).json({
          success: false,
          error: `Missing required parameter: ${param}`,
          required_parameters: required
        });
      }
    }
    
    // Generate sentiment prediction
    const sentimentPrediction = generateSentimentPrediction({
      type,
      ...parameters
    });
    
    const response = {
      success: true,
      scenario: {
        type,
        parameters,
        description: SCENARIO_TYPES[type].description
      },
      prediction: {
        sentiment: sentimentPrediction.sentiment,
        confidence: sentimentPrediction.confidence,
        magnitude: sentimentPrediction.magnitude,
        direction: sentimentPrediction.direction
      },
      metadata: {
        timestamp: new Date().toISOString(),
        processing_method: 'direct'
      }
    };
    
    console.log(`✅ Direct scenario analysis completed for ${type}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Direct scenario analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze scenario',
      details: error.message
    });
  }
};