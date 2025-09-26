"use client";
import { TrendingContentPanel } from "@/components/panels/trending-content-panel"
import { RedditPanel } from "@/components/panels/reddit-panel"
import { NewsPanel } from "@/components/panels/news-panel"
import { PerplexityPanel } from "@/components/panels/perplexity-panel"
import { FuzzyAnalysisPanel } from "@/components/panels/fuzzy-analysis-panel"
import { SummaryPanel } from "@/components/panels/summary-panel"
import { TopStoryWidget } from "@/components/panels/top-story-widget"
import { WordCloudPanel } from "@/components/panels/word-cloud-panel"
import { TopicDrillDown } from "@/components/panels/topic-drill-down"
import { CacheStatusWidget } from "@/components/ui/cache-status"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { RefreshCw, Search, Filter } from "lucide-react"

interface ScrapeData {
  type: string;
  timestamp: string;
  x: any[];
  reddit: any[];
  newsApi: any[];
  perplexity: any[];
  topStories: any[];
  allArticlesAnalysis: any[];
  fuzzyAnalysis: {
    totalArticles: number;
    matchedArticles: number;
    topicPopularity: any[];
    topTopics: any[];
    confidenceThreshold: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<ScrapeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/sources/scrape');
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched scraping data:', result);
        setData(result);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCacheStatus = async () => {
    try {
      const response = await fetch('/api/backend/sources/cache/status');
      if (response.ok) {
        const status = await response.json();
        setCacheStatus(status);
      }
    } catch (error) {
      console.error('Error fetching cache status:', error);
    }
  };

  const forceRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/sources/cache/refresh', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setLastUpdated(new Date());
        await fetchCacheStatus();
      }
    } catch (error) {
      console.error('Error force refreshing:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCacheStatus();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // If a topic is selected, show drill-down view
  if (selectedTopic && data) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Topic Analysis</h1>
          <p className="text-muted-foreground">Deep dive into "{selectedTopic}" across all sources.</p>
        </div>
        <TopicDrillDown 
          topic={selectedTopic} 
          data={data} 
          onBack={() => setSelectedTopic(null)} 
        />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Trending Content Dashboard</h1>
        <p className="text-muted-foreground">Real-time social media, news, and search trend analysis with AI-powered insights.</p>
      </div>
      {/* Header Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Button 
            onClick={fetchData} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scraping...' : 'Scrape Now'}
          </Button>
          
          <Button 
            onClick={forceRefresh} 
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Force Refresh
          </Button>
          
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm w-48"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Sources</option>
              <option value="x">X/Twitter</option>
              <option value="reddit">Reddit</option>
              <option value="newsApi">News</option>
              <option value="perplexity">Perplexity</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {lastUpdated && (
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          {cacheStatus && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${cacheStatus.hasData ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>
                {cacheStatus.hasData ? 'Cached' : 'No Cache'} 
                {cacheStatus.dataAge && ` (${Math.round(cacheStatus.dataAge / 1000)}s ago)`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Panel and Cache Status */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        {data && (
          <div className="md:col-span-2">
            <SummaryPanel data={data.fuzzyAnalysis} />
          </div>
        )}
        <div className="md:col-span-1">
          <CacheStatusWidget />
        </div>
      </div>

      {/* Top Story Widget */}
      {data && data.topStories && (
        <div className="mb-8">
          <TopStoryWidget data={data.topStories} />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Trending Content Panel */}
          {data && (
            <TrendingContentPanel 
              data={data.x} 
              searchTerm={searchTerm}
              filterSource={filterSource}
            />
          )}
          
          {/* Reddit Panel */}
          {data && (
            <RedditPanel 
              data={data.reddit} 
              searchTerm={searchTerm}
              filterSource={filterSource}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* News Panel */}
          {data && (
            <NewsPanel 
              data={data.newsApi} 
              searchTerm={searchTerm}
              filterSource={filterSource}
            />
          )}
          
          {/* Perplexity Panel */}
          {data && (
            <PerplexityPanel 
              data={data.perplexity} 
              searchTerm={searchTerm}
              filterSource={filterSource}
            />
          )}
        </div>
      </div>

      {/* Fuzzy Analysis Panel - Full Width */}
      {data && (
        <div className="mt-8 space-y-6">
          <FuzzyAnalysisPanel 
            data={data.fuzzyAnalysis} 
            searchTerm={searchTerm}
            onTopicClick={setSelectedTopic}
          />
          
          {/* Word Cloud Panel */}
          <WordCloudPanel 
            data={data.fuzzyAnalysis.topicPopularity} 
            searchTerm={searchTerm}
            onTopicClick={setSelectedTopic}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Scraping trending content...</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !data && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No data available</p>
            <Button onClick={fetchData}>Start Scraping</Button>
          </div>
        </div>
      )}
    </main>
  )
}
