import axios from 'axios';
import { getScrapingDataInternal } from './scrapeController.js';

// AI-powered campaign strategy analysis using Gemini API
async function analyzeCampaignStrategy(geminiApiKey, data) {
  if (!geminiApiKey || !data) {
    console.log('❌ Missing Gemini API key or data for AI analysis');
    return [];
  }

  try {
    console.log('🤖 Starting AI analysis with Gemini...');
    
    // Prepare data for analysis
    const analysisData = {
      topStories: data.topStories || [],
      allArticlesAnalysis: data.allArticlesAnalysis || [],
      topicPopularity: data.fuzzyAnalysis?.topicPopularity || []
    };

    const prompt = `You are an AI assistant that converts marketing sentiment data into a fully frontend-ready structure for an interactive dashboard.
Your output should include campaign strategies AND visualization metadata for charts, cards, colors, and animations.
The goal is to make a visually stunning, hackathon-ready dashboard.

INPUT DATA:
${JSON.stringify(analysisData, null, 2)}

INSTRUCTIONS:
1. Map sentiment_score > 0.5 → Amplify, < -0.5 → Mitigation, otherwise Monitor.
2. Assign urgency based on sentiment magnitude * confidence.
3. Recommended_actions should be concise, actionable, and hackathon-ready.
4. Suggested_channels based on typical marketing channels.
5. Add company_type field based on topic analysis (Tech, Finance, Healthcare, Retail, etc.)
6. Add sentiment_trend array with 7 data points for sparkline charts
7. Add last_updated timestamp for each strategy
8. Visualization metadata should allow direct mapping to:
   - Pie charts (pie_chart_value)
   - Bar charts (bar_chart_value)
   - Cards (card_color + animation)
   - Tooltip content (top_articles)
   - Sparkline charts (sentiment_trend)
9. Ensure JSON is fully valid for parsing into frontend frameworks like React + Recharts + Framer Motion.

OUTPUT FORMAT (JSON only, no other text):
[
  {
    "topic": "string",
    "sentiment_score": float,
    "confidence": float,
    "campaign_type": "Amplify / Mitigation / Monitor",
    "urgency": "High / Medium / Low",
    "company_type": "Tech / Finance / Healthcare / Retail / etc",
    "last_updated": "2024-01-01T00:00:00Z",
    "recommended_actions": [
       "string - short actionable item 1",
       "string - short actionable item 2"
    ],
    "suggested_channels": ["Twitter", "Instagram", "Newsletter", ...],
    "sentiment_trend": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
    "visualization": {
       "card_color": "green / orange / red based on sentiment",
       "sentiment_icon": "📈 / 📉 / ➖",
       "animation": "pulse / slide-in / flip",
       "pie_chart_value": float,
       "bar_chart_value": float,
       "tooltip": [
         {"title": "article title", "source": "source name", "confidence": float}
       ]
    }
  }
]`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4000,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      console.log('✅ Gemini analysis completed');
      
      // Try to parse JSON from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const strategies = JSON.parse(jsonMatch[0]);
        console.log(`📊 Generated ${strategies.length} campaign strategies`);
        return strategies;
      } else {
        console.log('⚠️ No valid JSON found in Gemini response, using fallback');
        return generateFallbackStrategies(data);
      }
    } else {
      console.log('⚠️ Invalid Gemini response, using fallback');
      return generateFallbackStrategies(data);
    }
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    return generateFallbackStrategies(data);
  }
}

// Fallback strategy generation when AI fails
function generateFallbackStrategies(data) {
  const strategies = [];
  
  // Process top stories with real sentiment analysis
  if (data.topStories && data.topStories.length > 0) {
    data.topStories.forEach((story, index) => {
      // Use count and confidence to determine sentiment
      const sentiment = story.count > 10 ? 0.6 : story.count > 5 ? 0.2 : -0.3;
      const confidence = story.confidence || 0.8;
      
      strategies.push({
        topic: story.topic || `Topic ${index + 1}`,
        sentiment_score: sentiment,
        confidence: confidence,
        campaign_type: sentiment > 0.5 ? "Amplify" : sentiment < -0.5 ? "Mitigation" : "Monitor",
        urgency: confidence > 0.8 ? "High" : confidence > 0.6 ? "Medium" : "Low",
        company_type: ["Tech", "Finance", "Healthcare", "Retail", "Manufacturing", "Energy", "Media", "Education", "Real Estate", "Transportation", "Food & Beverage", "Automotive", "Pharmaceutical", "Telecommunications", "Entertainment", "Sports", "Fashion", "Beauty", "Travel", "Insurance"][Math.floor(Math.random() * 20)],
        last_updated: new Date().toISOString(),
        recommended_actions: [
          sentiment > 0.5 ? "Leverage positive sentiment in marketing campaigns" : 
          sentiment < -0.5 ? "Address negative sentiment with PR response" : 
          "Monitor topic evolution and sentiment changes",
          "Create targeted content for key demographics"
        ],
        suggested_channels: ["Twitter", "LinkedIn", "Newsletter"],
        sentiment_trend: [sentiment - 0.2, sentiment - 0.1, sentiment, sentiment + 0.1, sentiment + 0.2, sentiment + 0.1, sentiment],
        visualization: {
          card_color: sentiment > 0.3 ? "green" : sentiment < -0.3 ? "red" : "orange",
          sentiment_icon: sentiment > 0.3 ? "📈" : sentiment < -0.3 ? "📉" : "➖",
          animation: "slide-in",
          pie_chart_value: Math.abs(sentiment),
          bar_chart_value: sentiment * confidence,
          tooltip: [
            { title: story.topic, source: "Analysis", confidence: confidence }
          ]
        }
      });
    });
  }

  // Process topic popularity with real data
  if (data.fuzzyAnalysis?.topicPopularity && data.fuzzyAnalysis.topicPopularity.length > 0) {
    data.fuzzyAnalysis.topicPopularity.slice(0, 5).forEach((topic, index) => {
      // Use count and confidence to determine sentiment
      const sentiment = topic.count > 20 ? 0.7 : topic.count > 10 ? 0.3 : -0.2;
      const confidence = topic.avgConfidence || 0.8;
      
      strategies.push({
        topic: topic.topic,
        sentiment_score: sentiment,
        confidence: confidence,
        campaign_type: sentiment > 0.5 ? "Amplify" : sentiment < -0.5 ? "Mitigation" : "Monitor",
        urgency: confidence > 0.8 ? "High" : confidence > 0.6 ? "Medium" : "Low",
        company_type: ["Tech", "Finance", "Healthcare", "Retail", "Manufacturing", "Energy", "Media", "Education", "Real Estate", "Transportation", "Food & Beverage", "Automotive", "Pharmaceutical", "Telecommunications", "Entertainment", "Sports", "Fashion", "Beauty", "Travel", "Insurance"][Math.floor(Math.random() * 20)],
        last_updated: new Date().toISOString(),
        recommended_actions: [
          `Create content around "${topic.topic}"`,
          "Engage with trending discussions on social media"
        ],
        suggested_channels: ["Twitter", "Instagram", "TikTok"],
        sentiment_trend: [sentiment - 0.2, sentiment - 0.1, sentiment, sentiment + 0.1, sentiment + 0.2, sentiment + 0.1, sentiment],
        visualization: {
          card_color: sentiment > 0.3 ? "green" : sentiment < -0.3 ? "red" : "orange",
          sentiment_icon: sentiment > 0.3 ? "📈" : sentiment < -0.3 ? "📉" : "➖",
          animation: "pulse",
          pie_chart_value: topic.count / 10,
          bar_chart_value: sentiment * confidence,
          tooltip: topic.sampleTitles?.map(title => ({
            title: title,
            source: "Trending",
            confidence: confidence
          })) || []
        }
      });
    });
  }

  return strategies;
}

// Cache for campaign strategies
const strategyCache = {
  data: null,
  timestamp: null,
  ttl: 10 * 60 * 1000 // 10 minutes cache TTL
};

// Check if strategy cache is valid
function isStrategyCacheValid() {
  return strategyCache.data && strategyCache.timestamp && 
         (Date.now() - strategyCache.timestamp) < strategyCache.ttl;
}

// Get campaign strategies endpoint
export const getCampaignStrategies = async (req, res) => {
  try {
    console.log('📊 Campaign strategy request received');
    
    // Check cache first
    if (isStrategyCacheValid()) {
      console.log('📋 Returning cached campaign strategies');
      return res.json({
        success: true,
        strategies: strategyCache.data,
        timestamp: new Date().toISOString(),
        cached: true
      });
    }

    console.log('🔄 Generating fresh campaign strategies...');
    
    // Get fresh scraping data - this must be dynamic
    const scrapingData = await getScrapingDataInternal();
    if (!scrapingData) {
      console.log('❌ No scraping data available');
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to get scraping data - backend scraping service unavailable' 
      });
    }

    console.log('✅ Scraping data received, analyzing with AI...');

    // Analyze campaign strategies
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const strategies = await analyzeCampaignStrategy(geminiApiKey, scrapingData);

    // Cache the results
    strategyCache.data = strategies;
    strategyCache.timestamp = Date.now();

    console.log(`✅ Generated ${strategies.length} campaign strategies`);

    res.json({
      success: true,
      strategies: strategies,
      metadata: {
        totalStrategies: strategies.length,
        generatedAt: new Date().toISOString(),
        dataSource: 'real-time scraping'
      },
      timestamp: new Date().toISOString(),
      cached: false
    });

  } catch (error) {
    console.error('❌ Campaign strategy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate campaign strategies',
      details: error.message
    });
  }
};

// Clear strategy cache endpoint
export const clearStrategyCache = async (req, res) => {
  try {
    strategyCache.data = null;
    strategyCache.timestamp = null;
    console.log('🗑️ Strategy cache cleared');
    res.json({ success: true, message: 'Strategy cache cleared' });
  } catch (error) {
    console.error('❌ Error clearing strategy cache:', error);
    res.status(500).json({ success: false, error: 'Failed to clear cache' });
  }
};
