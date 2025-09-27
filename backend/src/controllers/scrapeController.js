import axios from "axios";

// Cache for storing scraped data and Groq analysis
const cache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes cache TTL
  groqAnalysis: null,
  groqTimestamp: null,
  groqTtl: 10 * 60 * 1000 // 10 minutes cache for Groq analysis
};

// Check if cache is valid
function isCacheValid(timestamp, ttl) {
  return timestamp && (Date.now() - timestamp) < ttl;
}

// Clear cache function
function clearCache() {
  cache.data = null;
  cache.timestamp = null;
  cache.groqAnalysis = null;
  cache.groqTimestamp = null;
  console.log('Cache cleared');
}

// Get cache status
function getCacheStatus() {
  return {
    hasData: !!cache.data,
    dataAge: cache.timestamp ? Date.now() - cache.timestamp : null,
    dataTtl: cache.ttl,
    hasGroqAnalysis: !!cache.groqAnalysis,
    groqAge: cache.groqTimestamp ? Date.now() - cache.groqTimestamp : null,
    groqTtl: cache.groqTtl
  };
}

// Reddit: popular trending content from various subreddits (global, not localized)
async function scrapeReddit() {
  const articles = [];
  const seenTitles = new Set();
  const seenUrls = new Set();
  
  // Popular subreddits for trending content (global focus)
  const popularSubreddits = [
    'popular',
    'all',
    'worldnews',
    'technology',
    'business',
    'entrepreneur',
    'startups',
    'investing',
    'personalfinance',
    'economics',
    'news',
    'politics',
    'science',
    'futurology',
    'gadgets',
    'programming',
    'webdev',
    'MachineLearning',
    'artificial',
    'cryptocurrency',
    'stocks',
    'wallstreetbets',
    'investing',
    'personalfinance',
    'technology',
    'gadgets',
    'apple',
    'microsoft',
    'google',
    'tesla'
  ];
  
  // Get popular posts from trending subreddits
  for (const subreddit of popularSubreddits) {
    try {
      // Get top posts from each subreddit (popularity-based, global)
      const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=50&t=day`;
      const res = await axios.get(url, { timeout: 8000, headers: { "User-Agent": "scraper/1.0" } });
      const children = res?.data?.data?.children || [];
      
      for (const child of children) {
        const data = child?.data;
        if (!data) continue;
        
        const title = data.title?.toLowerCase().trim();
        const url = data.url_overridden_by_dest || `https://www.reddit.com${data.permalink}`;
        
        // Skip if we've seen this title or URL before
        if (seenTitles.has(title) || seenUrls.has(url)) continue;
        
        // Increase limit to 100 articles
        if (articles.length >= 50) break;
        
        seenTitles.add(title);
        seenUrls.add(url);
        
        articles.push({
          id: data.id,
          title: data.title,
          url: url,
          author: data.author,
          subreddit: data.subreddit,
          created_utc: data.created_utc,
          score: data.score, // Include popularity score
        });
      }
      
      // If we have enough variety, break early
      if (articles.length >= 100) break;
      
    } catch (_e) {
      continue; // Try next subreddit
    }
  }
  
  return articles;
}

// X: trending content from actual Twitter trending sections
async function scrapeX() {
  const mirrors = [
    "https://nitter.net",
    "https://nitter.poast.org",
    "https://nitter.fdn.fr",
    "https://nitter.privacydev.net",
    "https://nitter.moomoo.me",
  ];
  const articles = [];
  const seenTitles = new Set();
  const seenUrls = new Set();
  
  // Try to get trending topics from Twitter's trending section
  for (const base of mirrors) {
    try {
      // Get trending topics RSS feed
      const trendingUrl = `${base}/trending/rss`;
      const res = await axios.get(trendingUrl, { timeout: 7000, headers: { "User-Agent": "scraper/1.0" } });
      const xml = String(res.data || "");
      const items = Array.from(xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/g));
      
      for (const match of items) {
        const title = match[1]?.toLowerCase().trim();
        const url = match[2];
        
        // Skip if we've seen this title or URL before
        if (seenTitles.has(title) || seenUrls.has(url)) continue;
        
        if (articles.length >= 20) break;
        
        seenTitles.add(title);
        seenUrls.add(url);
        
        articles.push({
          id: `x-trending-${articles.length}`,
          title: match[1],
          url: url,
          published: match[3],
          source: 'trending'
        });
      }
      
      if (articles.length >= 20) break;
      
    } catch (_) { /* try next mirror */ }
  }
  
  // If trending RSS doesn't work, try getting popular tweets from main feed
  if (articles.length < 10) {
    for (const base of mirrors) {
      try {
        // Get popular tweets from main timeline
        const popularUrl = `${base}/rss`;
        const res = await axios.get(popularUrl, { timeout: 7000, headers: { "User-Agent": "scraper/1.0" } });
        const xml = String(res.data || "");
        const items = Array.from(xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/g));
        
        for (const match of items) {
          const title = match[1]?.toLowerCase().trim();
          const url = match[2];
          
          // Skip if we've seen this title or URL before
          if (seenTitles.has(title) || seenUrls.has(url)) continue;
          
          if (articles.length >= 20) break;
          
          seenTitles.add(title);
          seenUrls.add(url);
          
          articles.push({
            id: `x-popular-${articles.length}`,
            title: match[1],
            url: url,
            published: match[3],
            source: 'popular'
          });
        }
        
        if (articles.length >= 20) break;
        
      } catch (_) { /* try next mirror */ }
    }
  }
  
  // If we still need more articles, try fallback method with trending hashtags
  if (articles.length < 10) {
    try {
      const url = `https://r.jina.ai/http://nitter.net/trending`;
      const res = await axios.get(url, { timeout: 7000, headers: { "User-Agent": "scraper/1.0" } });
      const text = String(res.data || "");
      const lines = text.split("\n").map(s => s.trim()).filter(Boolean);
      
      // Heuristic: take distinct, tweet-like lines (avoid navigation words)
      const blacklist = new Set(["Nitter", "Login", "Register", "Tweets", "Search", "Top", "Latest", "People", "Photos", "Videos", "Trending", "Hashtags"]);
      
      for (const line of lines) {
        if (line.length < 20) continue;
        if (blacklist.has(line)) continue;
        
        const title = line.toLowerCase().trim();
        if (seenTitles.has(title)) continue;
        
        if (articles.length >= 20) break;
        
        seenTitles.add(title);
        articles.push({
          id: `x-fallback-${articles.length}`,
          title: line,
          url: "https://nitter.net/trending",
          published: null,
          source: 'fallback'
        });
      }
    } catch (_) {
      // Fallback failed, continue with what we have
    }
  }
  
  return articles;
}

// NewsAPI.org: trending news and global topics
async function scrapeNewsApi() {
  const key = process.env.NEWSAPI_KEY;
  const articles = [];
  const seenTitles = new Set();
  const seenUrls = new Set();
  
  // Global trending search terms
  const trendingTerms = [
    'technology',
    'business',
    'world news',
    'breaking news',
    'trending',
    'latest news',
    'global news',
    'tech news',
    'finance',
    'cryptocurrency',
    'artificial intelligence',
    'climate change',
    'politics',
    'science',
    'health'
  ];
  
  if (key) {
    for (const term of trendingTerms) {
      try {
        const params = new URLSearchParams({
          q: term,
          pageSize: 50,
          sortBy: 'publishedAt',
          language: 'en',
          apiKey: key
        });
        const url = `https://newsapi.org/v2/everything?${params}`;
        
        const res = await axios.get(url, { timeout: 8000 });
        const arts = res?.data?.articles || [];
        
        for (const article of arts) {
          const title = article.title?.toLowerCase().trim();
          const url = article.url;
          
          // Skip if we've seen this title or URL before
          if (seenTitles.has(title) || seenUrls.has(url)) continue;
          
          // Increase limit to 40 articles
          if (articles.length >= 20) break;
          
          seenTitles.add(title);
          seenUrls.add(url);
          
          articles.push({
            id: article.url || `n-${articles.length}`,
            title: article.title,
            url: article.url,
            source: article.source?.name,
            published: article.publishedAt
          });
        }
        
        // If we have enough variety, break early
        if (articles.length >= 30) break;
        
      } catch (_) { /* try next term */ }
    }
  }
  
  // If we still need more articles or no API key, try Google News RSS fallback
  if (articles.length < 10) {
    for (const term of trendingTerms.slice(0, 5)) { // Try first 5 terms
      try {
        const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(term)}&hl=en-US&gl=US&ceid=US:en`;
        const res = await axios.get(rss, { timeout: 8000, headers: { "User-Agent": "scraper/1.0" } });
        const xml = String(res.data || "");
        
        // Try CDATA pattern first
        let items = Array.from(xml.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/g));
        
        // If no CDATA matches, try simple pattern
        if (items.length === 0) {
          items = Array.from(xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/g));
        }
        
        for (const match of items) {
          const title = match[1]?.toLowerCase().trim();
          const url = match[2];
          
          // Skip if we've seen this title or URL before
          if (seenTitles.has(title) || seenUrls.has(url)) continue;
          
          if (articles.length >= 30) break;
          
          seenTitles.add(title);
          seenUrls.add(url);
          
          articles.push({
            id: `g-${articles.length}`,
            title: match[1],
            url: match[2],
            source: "GoogleNews",
            published: match[3]
          });
        }
        
        if (articles.length >= 20) break;
        
      } catch (_) {
        // Fallback failed, continue with what we have
      }
    }
  }
  
  return articles;
}

// Perplexity search API: marketing trends and industry insights
async function scrapePerplexity() {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) return [];
  try {
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar",
        messages: [
          { role: "system", content: "Return ONLY a JSON array of up to 10 items with title, url, source, publishedAt about current trending topics and industry insights. No extra text." },
          { role: "user", content: "Latest trending topics, news, and industry insights from 2024." },
        ],
        temperature: 0,
      },
      { headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, timeout: 15000 }
    );
    const content = response?.data?.choices?.[0]?.message?.content || "";
    let parsed = [];
    try {
      parsed = JSON.parse(content);
    } catch (_) {
      const match = content.match(/\[([\s\S]*?)\]/);
      if (match) parsed = JSON.parse(`[${match[1]}]`);
    }
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 10).map((a, i) => ({ id: a.url || `p-${i}`, title: a.title, url: a.url || a.link, source: a.source, published: a.publishedAt || a.published }));
  } catch (_e) {
    return [];
  }
}

// Analyze content using Groq Llama 3.3 70B to identify top stories and categorize all articles
async function analyzeContentWithGroq(articles) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey || !articles.length) return { topStories: [], allArticles: [] };

  // Check if we have valid cached Groq analysis
  if (isCacheValid(cache.groqTimestamp, cache.groqTtl) && cache.groqAnalysis) {
    console.log('Returning cached Groq analysis');
    return cache.groqAnalysis;
  }

  console.log('Cache miss - running fresh Groq analysis');

  try {
    // Prepare titles for analysis
    const titles = articles.map(article => article.title);
    
    const prompt = `You are a highly intelligent news and financial market analysis AI. Your task is to analyze a list of headlines and identify the top 3 most reported-on news stories or specific events. Instead of general topics (like 'politics' or 'technology'), group headlines that are clearly about the exact same specific event (e.g., a specific company's earnings report, a particular political announcement, a single market-moving event). For each story, you must provide a short, concise, representative title and the number of headlines covering it. Your response MUST be a valid JSON array of objects, where each object has a 'topic' key and a 'count' key. Do not include any other text, explanations, or markdown formatting. The primary sorting key is the 'count' in descending order. Crucially, in the event of a tie in the count, you must use your financial analysis capabilities to prioritize the story you assess as having a greater potential impact on the global financial markets. Example format: [{"topic": "US Federal Reserve Holds Interest Rates Steady", "count": 9}, {"topic": "Tech Giant 'Innovate Inc.' Unveils New AI Chip", "count": 9}, {"topic": "'Oppenheimer' Wins Best Picture at Oscars", "count": 7}]

Headlines to analyze:
${titles.map((title, i) => `${i+1}. ${title}`).join('\n')}`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            
content: "You are a highly intelligent news and financial market analysis AI. Your task is to analyze a list of headlines and identify the top 3 most reported-on news stories. Your analysis must adhere to these critical rules: 1. Group by Specific, Recent Events: Use fuzzy matching to group headlines that refer to the *exact same specific, recent event*. Avoid creating broad, general topics that span long periods (e.g., 'Russia-Ukraine War' is too general). Instead, focus on specific, recent developments (e.g., 'Ukrainian Strike on Belgorod Fuel Depot'). Your goal is to identify distinct, contemporary news events, not overarching themes. 2. Strict JSON Output: Your response MUST be a single, valid JSON array of objects. Do not include any other text, explanations, or markdown formatting. 3. JSON Object Structure: Each object in the array must contain exactly three keys: \"topic\": A short, concise, representative title for the specific event. \"count\": An integer representing the number of headlines covering that specific event. \"confidence\": An integer between 50 and 100, representing your confidence that all grouped headlines are about the *exact same* event. A lower score (e.g., 65) indicates a more speculative grouping where titles are related but might not be identical events, while a higher score (e.g., 95) indicates a very certain match. Ensure you use a range of confidence scores, including some lower values where appropriate. 4. Sorting Logic: The final JSON array must be sorted according to the following hierarchy: Primary Sort: By \"count\" in descending order. Tie-Breaker 1: If counts are tied, sort by \"confidence\" in descending order. Tie-Breaker 2: In the rare event of a further tie, use your financial analysis capabilities to prioritize the story you assess as having a greater potential impact on the global financial markets. Example Format: [{\"topic\": \"India's RBI Holds Repo Rate Steady at 6.5%\", \"count\": 10, \"confidence\": 98}, {\"topic\": \"SEBI Proposes Tighter Regulations for Algo Trading\", \"count\": 8, \"confidence\": 95}, {\"topic\": \"Reports of a Cyberattack on a Major Indian Power Grid\", \"count\": 8, \"confidence\": 75}]"

          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      },
      {
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content || "";
    
    // Try to parse JSON from response
    let topStories = [];
    try {
      // Extract JSON from response (might have extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        topStories = JSON.parse(jsonMatch[0]);
      } else {
        topStories = JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to parse Groq response:', error);
      return { topStories: [], allArticles: [] };
    }

    // Now analyze all articles with confidence scores
    const allArticlesAnalysis = await analyzeAllArticlesWithGroq(articles, groqApiKey);
    
    const result = {
      topStories: Array.isArray(topStories) ? topStories : [],
      allArticles: allArticlesAnalysis
    };

    // Cache the Groq analysis results
    cache.groqAnalysis = result;
    cache.groqTimestamp = Date.now();
    console.log('Cached Groq analysis results');
    
    return result;
  } catch (error) {
    console.error('Groq API error:', error.message);
    return { topStories: [], allArticles: [] };
  }
}

// Analyze all articles with confidence scores and source information
async function analyzeAllArticlesWithGroq(articles, groqApiKey) {
  try {
    const titles = articles.map(article => article.title);
    
    const prompt = `Analyze these headlines and provide a JSON array where each object contains:
- "title": the original headline
- "topic": the main topic/category this headline belongs to
- "source": the source type (reddit, news, etc.)
- "confidence": a confidence score from 0-100 indicating how well this headline fits the topic

Return ONLY a valid JSON array. Example format:
[{"title": "Tesla stock surges after earnings beat", "topic": "Tesla Earnings Report", "source": "reddit", "confidence": 95}, {"title": "Bitcoin reaches new all-time high", "topic": "Cryptocurrency Market", "source": "news", "confidence": 88}]

Headlines to analyze:
${titles.map((title, i) => `${i+1}. ${title}`).join('\n')}`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a news analysis AI. Analyze headlines and categorize them with confidence scores. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 8000
      },
      {
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content || "";
    
    let parsed = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to parse all articles analysis:', error);
      return [];
    }

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Groq all articles analysis error:', error.message);
    return [];
  }
}

// Count topic popularity using Groq analysis
function countTopicPopularityFromGroq(groqAnalysis) {
  const topicCounts = {};
  const topicDetails = {};
  
  groqAnalysis.forEach(item => {
    const topic = item.topic || 'Unknown';
    const confidence = (item.confidence || 0) / 100; // Convert from 0-100 to 0-1
    const originalTitle = item.title || '';
    const source = item.source || 'unknown';
    
    // Only count if confidence is above threshold (70%)
    if (confidence >= 0.7) {
      if (!topicCounts[topic]) {
        topicCounts[topic] = 0;
        topicDetails[topic] = {
          titles: [],
          sources: new Set(),
          avgConfidence: 0,
          totalConfidence: 0
        };
      }
      
      topicCounts[topic]++;
      topicDetails[topic].titles.push(originalTitle);
      topicDetails[topic].sources.add(source);
      topicDetails[topic].totalConfidence += confidence;
      topicDetails[topic].avgConfidence = topicDetails[topic].totalConfidence / topicCounts[topic];
    }
  });
  
  // Sort topics by popularity (count)
  const sortedTopics = Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([topic, count]) => ({
      topic,
      count,
      avgConfidence: topicDetails[topic].avgConfidence,
      sampleTitles: topicDetails[topic].titles.slice(0, 3), // Show first 3 titles as examples
      allTitles: topicDetails[topic].titles.length,
      sources: Array.from(topicDetails[topic].sources)
    }));
  
  return sortedTopics;
}

export const scrapeSources = async (req, res) => {
  // Check if we have valid cached data
  if (isCacheValid(cache.timestamp, cache.ttl) && cache.data) {
    console.log('Returning cached scraping data');
    return res.json(cache.data);
  }

  console.log('Cache miss - fetching fresh data');
 
  const Responses = {
    "type": "trending_content",
    "timestamp": "2025-09-26T23:08:31.000Z",
    "x": [
      { "id": "x-1", "title": "ISRO confirms successful trajectory correction for Mars Orbiter Mission 2", "url": "https://www.isro.gov.in/MOM2-update", "published": "2025-09-26T18:30:00.000Z", "source": "trending" },
      { "id": "x-2", "title": "Mumbai local train services disrupted due to heavy monsoon rains; #MumbaiRains trends", "url": "https://twitter.com/search?q=%23MumbaiRains", "published": "2025-09-26T17:45:10.000Z", "source": "trending" },
      { "id": "x-3", "title": "Sensex and Nifty close at a record high after positive global cues and RBI policy announcements", "url": "https://economictimes.indiatimes.com/markets/stocks/news", "published": "2025-09-26T16:50:00.000Z", "source": "trending" },
      { "id": "x-4", "title": "TRAI releases new consultation paper on net neutrality and regulation of OTT platforms", "url": "https://www.trai.gov.in/consultation-papers", "published": "2025-09-26T15:20:15.000Z", "source": "trending" },
      { "id": "x-5", "title": "First look at Shah Rukh Khan's upcoming film 'Lion' creates a storm on social media", "url": "https://twitter.com/RedChilliesEnt/status/...", "published": "2025-09-26T14:05:30.000Z", "source": "trending" }
    ],
    "reddit": [
      { "id": "reddit-1", "title": "Discussion: Is UPI's dominance in digital payments a threat to competition in the Indian fintech space?", "url": "https://www.reddit.com/r/india/comments/...", "author": "FintechAnalyst", "subreddit": "india", "created_utc": 1759002600, "score": 2800 },
      { "id": "reddit-2", "title": "Bangalore's tech community reacts to the state government's new 'AI in Governance' policy", "url": "https://www.reddit.com/r/bangalore/comments/...", "author": "TechieBlr", "subreddit": "bangalore", "created_utc": 1759001100, "score": 1500 },
      { "id": "reddit-3", "title": "ELi5: What are the key takeaways from the latest National Health Survey data?", "url": "https://www.reddit.com/r/IndiaSpeaks/comments/...", "author": "CuriousCitizen", "subreddit": "IndiaSpeaks", "created_utc": 1758999900, "score": 1950 },
      { "id": "reddit-4", "title": "Indian Premier League (IPL) 2026: Player auction rules announced, mega-auction confirmed", "url": "https://www.reddit.com/r/Cricket/comments/...", "author": "CricketFan11", "subreddit": "Cricket", "created_utc": 1758995400, "score": 3200 },
      { "id": "reddit-5", "title": "Startup founders share their experience with the new angel tax regulations in India", "url": "https://www.reddit.com/r/IndianStreetBets/comments/...", "author": "StartupGuy25", "subreddit": "IndianStreetBets", "created_utc": 1758992100, "score": 980 }
    ],
    "newsApi": [
      { "id": "news-1", "title": "India's Services PMI hits a 6-month high in September, indicating strong economic expansion", "url": "https://www.reuters.com/world/india/india-services-pmi-september", "source": "Reuters", "published": "2025-09-26T14:00:00.000Z" },
      { "id": "news-2", "title": "Government launches next phase of FAME scheme to boost electric vehicle adoption", "url": "https://pib.gov.in/PressReleasePage.aspx?PRID=...", "source": "Press Information Bureau", "published": "2025-09-26T13:30:00.000Z" },
      { "id": "news-3", "title": "SEBI tightens norms for algorithmic trading to curb market volatility", "url": "https://www.livemint.com/market/stock-market-news/sebi-tightens-norms-for-algo-trading", "source": "Livemint", "published": "2025-09-26T12:45:00.000Z" },
      { "id": "news-4", "title": "Indian IT firms see increased demand for GenAI solutions in the European market", "url": "https://www.business-standard.com/article/companies/indian-it-firms-genai-europe-demand", "source": "Business Standard", "published": "2025-09-26T11:00:00.000Z" },
      { "id": "news-5", "title": "Supreme Court of India agrees to hear plea on data privacy concerns related to national digital health ID", "url": "https://www.thehindu.com/news/national/sc-to-hear-plea-on-digital-health-id", "source": "The Hindu", "published": "2025-09-26T10:15:00.000Z" }
    ],
    "perplexity": [
      { "id": "perp-1", "title": "What is the impact of the new Direct-to-Mobile (D2M) broadcasting technology being tested in India?", "url": "https://www.google.com/search?q=direct+to+mobile+broadcasting+india", "source": "Google Search", "published": "2025-09-26T09:00:00.000Z" },
      { "id": "perp-2", "title": "How are Indian agricultural startups using satellite imagery and AI to improve crop yields?", "url": "https://www.google.com/search?q=agritech+startups+india+satellite+ai", "source": "Google Search", "published": "2025-09-26T08:30:00.000Z" },
      { "id": "perp-3", "title": "What are the latest developments in India's semiconductor manufacturing mission?", "url": "https://www.google.com/search?q=india+semiconductor+mission+latest", "source": "Google Search", "published": "2025-09-26T07:45:00.000Z" },
      { "id": "perp-4", "title": "Comparing the 5G network performance of Jio, Airtel, and Vi in major Indian cities.", "url": "https://www.google.com/search?q=5g+speed+comparison+jio+airtel+vi+india", "source": "Google Search", "published": "2025-09-26T06:50:00.000Z" },
      { "id": "perp-5", "title": "What are the economic implications of the proposed India-UK free trade agreement?", "url": "https://www.google.com/search?q=india+uk+fta+economic+impact", "source": "Google Search", "published": "2025-09-26T05:25:00.000Z" }
    ],
    "topStories": [
      { "topic": "Tesla Stock Surge After Q4 Earnings Beat", "count": 12 },
      { "topic": "Federal Reserve Interest Rate Decision", "count": 8 },
      { "topic": "OpenAI GPT-5 Release Announcement", "count": 6 }
    ],
    "allArticlesAnalysis": [
      { "title": "Tesla stock surges after earnings beat", "topic": "Tesla Earnings Report", "source": "reddit", "confidence": 95 },
      { "title": "Federal Reserve holds interest rates steady", "topic": "Federal Reserve Policy", "source": "news", "confidence": 88 },
      { "title": "OpenAI announces GPT-5 capabilities", "topic": "AI Technology", "source": "reddit", "confidence": 92 }
    ],
    "fuzzyAnalysis": {
      "totalArticles": 20,
      "matchedArticles": 20,
      "topicPopularity": [
        {
          "topic": "Tesla Earnings Report",
          "count": 12,
          "avgConfidence": 0.92,
          "sampleTitles": ["Tesla stock surges after earnings beat", "Tesla Q4 earnings exceed expectations", "Tesla shares jump on strong earnings"],
          "allTitles": 12,
          "sources": ["reddit", "news"]
        },
        {
          "topic": "Federal Reserve Policy",
          "count": 8,
          "avgConfidence": 0.88,
          "sampleTitles": ["Federal Reserve holds interest rates steady", "Fed maintains current monetary policy", "Interest rates unchanged after Fed meeting"],
          "allTitles": 8,
          "sources": ["news", "reddit"]
        },
        {
          "topic": "AI Technology",
          "count": 6,
          "avgConfidence": 0.90,
          "sampleTitles": ["OpenAI announces GPT-5 capabilities", "New AI breakthrough in language models", "GPT-5 release date confirmed"],
          "allTitles": 6,
          "sources": ["reddit", "news", "perplexity"]
        }
      ],
      "topTopics": [
        {
          "topic": "Tesla Earnings Report",
          "count": 12,
          "avgConfidence": 0.92,
          "sampleTitles": ["Tesla stock surges after earnings beat", "Tesla Q4 earnings exceed expectations", "Tesla shares jump on strong earnings"],
          "allTitles": 12,
          "sources": ["reddit", "news"]
        },
        {
          "topic": "Federal Reserve Policy",
          "count": 8,
          "avgConfidence": 0.88,
          "sampleTitles": ["Federal Reserve holds interest rates steady", "Fed maintains current monetary policy", "Interest rates unchanged after Fed meeting"],
          "allTitles": 8,
          "sources": ["news", "reddit"]
        },
        {
          "topic": "AI Technology",
          "count": 6,
          "avgConfidence": 0.90,
          "sampleTitles": ["OpenAI announces GPT-5 capabilities", "New AI breakthrough in language models", "GPT-5 release date confirmed"],
          "allTitles": 6,
          "sources": ["reddit", "news", "perplexity"]
        }
      ],
      "confidenceThreshold": 0.7
    }
  };
  // DISABLED MOCK DATA - USING REAL IMPLEMENTATION
  // setTimeout(() => {
  //   return res.json(Responses);
  // }, 15000);

  // REAL IMPLEMENTATION BELOW
  try {
    const [x, reddit, newsApi, perplexity] = await Promise.all([
      scrapeX(),
      scrapeReddit(),
      scrapeNewsApi(),
      scrapePerplexity(),
    ]);
  
  // Combine all articles for analysis
  const allArticles = [
    ...(x || []).map(article => ({ ...article, source: 'x' })),
    ...(reddit || []).map(article => ({ ...article, source: 'reddit' })),
    ...(newsApi || []).map(article => ({ ...article, source: 'newsApi' })),
    ...(perplexity || []).map(article => ({ ...article, source: 'perplexity' }))
  ];
  
  // Analyze content with Groq Llama 3.3 70B
  const groqAnalysis = await analyzeContentWithGroq(allArticles);
  
  // Count topic popularity using Groq analysis
  const topicPopularity = countTopicPopularityFromGroq(groqAnalysis.allArticles);
  
  // Add Groq analysis to articles
  const enhancedArticles = allArticles.map(article => {
    const match = groqAnalysis.allArticles.find(item => item.title === article.title);
    return {
      ...article,
      groqAnalysis: match || null
    };
  });
  
    const responseData = { 
      type: "trending_content",
      timestamp: new Date().toISOString(),
      x, 
      reddit, 
      newsApi, 
      perplexity,
      topStories: groqAnalysis.topStories,
      allArticlesAnalysis: groqAnalysis.allArticles,
      fuzzyAnalysis: {
        totalArticles: allArticles.length,
        matchedArticles: groqAnalysis.allArticles.length,
        topicPopularity,
        topTopics: topicPopularity.slice(0, 10),
        confidenceThreshold: 0.7
      }
    };

    // Cache the complete response
    cache.data = responseData;
    cache.timestamp = Date.now();
    console.log('Cached complete scraping response');

    res.json(responseData);
  } catch (error) {
    console.error('Error in scrapeSources:', error);
    res.status(500).json({ 
      error: 'Failed to scrape data', 
      message: error.message,
      type: "trending_content",
      timestamp: new Date().toISOString(),
      x: [], 
      reddit: [], 
      newsApi: [], 
      perplexity: [],
      topStories: [],
      allArticlesAnalysis: [],
      fuzzyAnalysis: {
        totalArticles: 0,
        matchedArticles: 0,
        topicPopularity: [],
        topTopics: [],
        confidenceThreshold: 0.7
      }
    });
  }
};

// Cache management endpoints
export const clearCacheEndpoint = async (req, res) => {
  clearCache();
  res.json({ 
    success: true, 
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString()
  });
};

export const getCacheStatusEndpoint = async (req, res) => {
  const status = getCacheStatus();
  res.json({
    ...status,
    timestamp: new Date().toISOString()
  });
};

// Force refresh endpoint (bypasses cache)
export const forceRefreshEndpoint = async (req, res) => {
  console.log('Force refresh requested - clearing cache');
  clearCache();
  
  // Call the main scraping function
  return scrapeSources(req, res);
};

// Internal function to get scraping data (used by other controllers)
export const getScrapingDataInternal = async () => {
  // Check if we have valid cached data
  if (isCacheValid(cache.timestamp, cache.ttl) && cache.data) {
    console.log('Returning cached scraping data for internal use');
    return cache.data;
  }

  console.log('Cache miss - fetching fresh data for internal use');
  
  try {
    const [x, reddit, newsApi, perplexity] = await Promise.all([
      scrapeX(),
      scrapeReddit(),
      scrapeNewsApi(),
      scrapePerplexity(),
    ]);
  
    // Combine all articles for analysis
    const allArticles = [
      ...(x || []).map(article => ({ ...article, source: 'x' })),
      ...(reddit || []).map(article => ({ ...article, source: 'reddit' })),
      ...(newsApi || []).map(article => ({ ...article, source: 'newsApi' })),
      ...(perplexity || []).map(article => ({ ...article, source: 'perplexity' }))
    ];
    
    // Analyze content with Groq Llama 3.3 70B
    const groqAnalysis = await analyzeContentWithGroq(allArticles);
    
    // Count topic popularity using Groq analysis
    const topicPopularity = countTopicPopularityFromGroq(groqAnalysis.allArticles);
    
    // Add Groq analysis to articles
    const enhancedArticles = allArticles.map(article => {
      const match = groqAnalysis.allArticles.find(item => item.title === article.title);
      return {
        ...article,
        groqAnalysis: match || null
      };
    });
    
    const responseData = { 
      type: "trending_content",
      timestamp: new Date().toISOString(),
      x, 
      reddit, 
      newsApi, 
      perplexity,
      topStories: groqAnalysis.topStories,
      allArticlesAnalysis: groqAnalysis.allArticles,
      fuzzyAnalysis: {
        totalArticles: allArticles.length,
        matchedArticles: groqAnalysis.allArticles.length,
        topicPopularity,
        topTopics: topicPopularity.slice(0, 10),
        confidenceThreshold: 0.7
      }
    };

    // Cache the complete response
    cache.data = responseData;
    cache.timestamp = Date.now();
    console.log('Cached complete scraping response for internal use');

    return responseData;
  } catch (error) {
    console.error('Error in getScrapingDataInternal:', error);
    return null;
  }
};



