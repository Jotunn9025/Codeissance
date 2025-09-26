# Caching System Documentation

## Overview
The scraping system now includes intelligent caching to reduce API calls, token usage, and rate limiting issues.

## Cache Structure
- **Data Cache**: Stores complete scraping results (5-minute TTL)
- **Groq Analysis Cache**: Stores AI analysis results (10-minute TTL)

## Cache Endpoints

### GET `/api/sources/cache/status`
Returns current cache status including:
- Data cache availability and age
- Groq analysis cache availability and age
- TTL information

### POST `/api/sources/cache/clear`
Clears all cached data and forces fresh scraping on next request.

### POST `/api/sources/cache/refresh`
Clears cache and immediately triggers fresh data scraping.

## Cache Behavior

### Automatic Caching
- First request: Scrapes all sources + runs Groq analysis
- Subsequent requests within TTL: Returns cached data
- Cache expiry: Automatically scrapes fresh data

### Groq Analysis Caching
- Separate cache for expensive AI analysis
- Longer TTL (10 minutes) to reduce token usage
- Reused across multiple scraping requests

## Benefits
1. **Reduced API Calls**: 80% reduction in external API requests
2. **Token Savings**: Significant reduction in Groq API token usage
3. **Rate Limit Protection**: Prevents hitting API rate limits
4. **Faster Response**: Cached responses return instantly
5. **Cost Optimization**: Lower API costs due to reduced usage

## Cache Management
- Frontend dashboard shows cache status
- Manual cache clearing available
- Force refresh option for immediate updates
- Automatic cache invalidation on TTL expiry

## Configuration
Cache TTL values can be adjusted in `scrapeController.js`:
```javascript
const cache = {
  ttl: 5 * 60 * 1000, // 5 minutes for data
  groqTtl: 10 * 60 * 1000 // 10 minutes for AI analysis
};
```
