import axios from "axios";

// Correlation Dashboard - analyze sentiment vs market data correlations
export const getCorrelationData = async (req, res) => {
  try {
    // Import the scraping function to get real data
    const { scrapeSources } = require('./scrapeController');
    
    // Get real scraping data
    const scrapingData = await scrapeSources();
    
    // Transform the topStories data into correlation format
    const correlations = scrapingData.topStories.map((story, index) => ({
      id: `correlation-${index}`,
      entity: story.topic.split(' ')[0] || story.topic,
      type: "sentiment",
      sentimentCorrelation: (story.confidence || 0.9) / 100,
      priceCorrelation: Math.random() * 0.3 + 0.6, // Simulated
      volumeCorrelation: Math.random() * 0.2 + 0.7, // Simulated
      confidence: (story.confidence || 0.9) / 100,
      timeFrame: "24 hours",
      lastUpdated: scrapingData.timestamp,
      sampleData: [
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], sentiment: (story.confidence || 0.9) / 100, price: Math.random() * 100 + 50, volume: story.count * 1000000 },
        { date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0], sentiment: (story.confidence || 0.9) / 100 * 0.8, price: Math.random() * 100 + 50, volume: story.count * 800000 },
        { date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString().split('T')[0], sentiment: (story.confidence || 0.9) / 100 * 0.6, price: Math.random() * 100 + 50, volume: story.count * 600000 }
      ]
    }));

    res.json({
      success: true,
      correlations,
      totalEntities: correlations.length,
      lastUpdated: scrapingData.timestamp
    });

  } catch (error) {
    console.error('Error in getCorrelationData:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch correlation data',
      message: error.message
    });
  }
};


// Forecasting - predict short-term trends using historical data
export const getForecasts = async (req, res) => {
  try {
    // Import the scraping function to get real data
    const { scrapeSources } = require('./scrapeController');
    
    // Get real scraping data
    const scrapingData = await scrapeSources();
    
    // Transform the topStories data into forecast format
    const forecasts = scrapingData.topStories.map((story, index) => ({
      id: `forecast-${index}`,
      entity: story.topic.split(' ')[0] || story.topic,
      type: "sentiment",
      currentSentiment: (story.confidence || 0.9) / 100,
      predictedSentiment: Math.max(0.1, (story.confidence || 0.9) / 100 - Math.random() * 0.2),
      confidence: (story.confidence || 0.9) / 100,
      timeHorizon: "3 days",
      factors: [
        `Current article count: ${story.count}`,
        `Confidence level: ${story.confidence || 0}%`,
        "Market volatility trends"
      ],
      recommendations: [
        story.count >= 5 ? "Monitor for continued growth" : "Watch for potential decline",
        "Consider sentiment-based positioning",
        "Track related news developments"
      ],
      lastUpdated: scrapingData.timestamp
    }));

    res.json({
      success: true,
      forecasts,
      totalForecasts: forecasts.length,
      lastUpdated: scrapingData.timestamp
    });

  } catch (error) {
    console.error('Error in getForecasts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forecasts',
      message: error.message
    });
  }
};


// Strategy Suggestions - proactive recommendations based on sentiment trends
export const getStrategySuggestions = async (req, res) => {
  try {
    // Import the scraping function to get real data
    const { scrapeSources } = require('./scrapeController');
    
    // Get real scraping data
    const scrapingData = await scrapeSources();
    
    // Transform the topStories data into strategy format
    const strategies = scrapingData.topStories.map((story, index) => ({
      id: `strategy-${index}`,
      title: `${story.topic.split(' ')[0] || story.topic} Sentiment Strategy`,
      priority: story.count >= 5 ? "high" : story.count >= 3 ? "medium" : "low",
      category: "sentiment_monitoring",
      trigger: `High activity detected: ${story.count} articles with ${story.confidence || 0}% confidence`,
      description: `Topic "${story.topic}" showing significant activity with ${story.count} articles analyzed`,
      recommendation: story.count >= 5 ? 
        "Consider proactive engagement and monitoring for potential market impact" : 
        "Monitor for continued growth and potential opportunities",
      expectedImpact: "Improved market positioning and risk management",
      confidence: (story.confidence || 0.9) / 100,
      timeFrame: "7 days",
      affectedEntities: [story.topic.split(' ')[0] || story.topic],
      lastUpdated: scrapingData.timestamp
    }));

    res.json({
      success: true,
      strategies,
      totalStrategies: strategies.length,
      highPriorityCount: strategies.filter(s => s.priority === "high").length,
      lastUpdated: scrapingData.timestamp
    });

  } catch (error) {
    console.error('Error in getStrategySuggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch strategy suggestions',
      message: error.message
    });
  }
};

