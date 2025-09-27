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
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState, useEffect } from "react"
import { RefreshCw, Search, Filter, TrendingUp, BarChart3, Activity, Zap, Clock, ArrowLeft, Sparkles } from "lucide-react"

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button 
              onClick={() => setSelectedTopic(null)}
              variant="ghost"
              className="mb-4 hover:bg-white/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Topic Deep Dive</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                {selectedTopic}
              </h1>
              <p className="text-slate-600 mt-2">Comprehensive analysis across all sources</p>
            </div>
          </div>
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <TopicDrillDown 
                topic={selectedTopic} 
                data={data} 
                onBack={() => setSelectedTopic(null)} 
              />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="mb-12 text-center relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground/80">Real-time Analytics</span>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Trending Content Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI-powered insights from social media, news, and search trends with real-time analysis and intelligent topic discovery
          </p>
        </div>

        {/* Enhanced Control Panel */}
        <Card className="mb-10 shadow-lg rounded-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center w-full xl:w-auto">
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={fetchData} 
                    disabled={loading}
                    className="shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Analyzing...' : 'Analyze Now'}
                  </Button>
                  
                  <Button 
                    onClick={forceRefresh} 
                    disabled={loading}
                    variant="outline"
                    className="transition-all duration-200 hover:bg-muted/50"
                  >
                    <Zap className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Force Refresh
                  </Button>
                </div>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="text"
                      placeholder="Search trending topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 transition-colors"
                    />
                  </div>
                  
                  <div className="relative group">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <Select value={filterSource} onValueChange={setFilterSource}>
                      <SelectTrigger className="w-40 pl-10 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="x">X/Twitter</SelectItem>
                        <SelectItem value="reddit">Reddit</SelectItem>
                        <SelectItem value="newsApi">News</SelectItem>
                        <SelectItem value="perplexity">Perplexity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center gap-6 text-sm">
                {lastUpdated && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                  </div>
                )}
                {cacheStatus && (
                  <div className="flex items-center gap-2">
                    <div className={`relative w-3 h-3 rounded-full ${cacheStatus.hasData ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      <div className={`absolute inset-0 rounded-full animate-pulse ${cacheStatus.hasData ? 'bg-green-400' : 'bg-yellow-400'} opacity-75`}></div>
                    </div>
                    <span className="text-muted-foreground">
                      {cacheStatus.hasData ? 'Live Cache' : 'Building Cache'} 
                      {cacheStatus.dataAge && ` • ${Math.round(cacheStatus.dataAge / 1000)}s`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Section */}
        <div className="mb-10 space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {data && (
              <div className="lg:col-span-2">
                <Card className="shadow-lg rounded-2xl h-full">
                  <CardContent className="p-8">
                    <SummaryPanel data={data.fuzzyAnalysis} />
                  </CardContent>
                </Card>
              </div>
            )}
            <div className="lg:col-span-1">
              <Card className="shadow-lg rounded-2xl h-full">
                <CardContent className="p-8">
                  <CacheStatusWidget />
                </CardContent>
              </Card>
            </div>
          </div>

          {data && data.topStories && (
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <TopStoryWidget data={data.topStories} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Accordion Sections */}
        <div className="space-y-8">
          {/* Topic Insights */}
          {data && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="topic-insights" className="border-0">
                <Card className="shadow-lg rounded-2xl">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-muted/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-foreground">AI Topic Intelligence</h3>
                        <p className="text-muted-foreground mt-1">Advanced topic analysis with sentiment and trend detection</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8">
                    <div className="space-y-8 pt-4">
                      <div className="grid gap-8 lg:grid-cols-2">
                        <Card className="bg-muted/50 rounded-xl">
                          <CardContent className="p-6">
                            <FuzzyAnalysisPanel 
                              data={data.fuzzyAnalysis} 
                              searchTerm={searchTerm}
                              onTopicClick={setSelectedTopic}
                            />
                          </CardContent>
                        </Card>
                        <Card className="bg-secondary/50 rounded-xl">
                          <CardContent className="p-6">
                            <WordCloudPanel 
                              data={data.fuzzyAnalysis.topicPopularity} 
                              searchTerm={searchTerm}
                              onTopicClick={setSelectedTopic}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
          )}

          {/* Source Feeds */}
          {data && (
            <Accordion type="single" collapsible defaultValue="source-feeds" className="w-full">
              <AccordionItem value="source-feeds" className="border-0">
                <Card className="shadow-lg rounded-2xl">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-muted/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-foreground">Live Source Feeds</h3>
                        <p className="text-muted-foreground mt-1">Real-time content streams from major platforms and news sources</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8">
                    <div className="grid gap-8 lg:grid-cols-2 pt-4">
                      <div className="space-y-8">
                        <Card className="bg-muted/30 rounded-xl">
                          <CardContent className="p-6">
                            <TrendingContentPanel 
                              data={data.x} 
                              searchTerm={searchTerm}
                              filterSource={filterSource}
                            />
                          </CardContent>
                        </Card>
                        <Card className="bg-secondary/30 rounded-xl">
                          <CardContent className="p-6">
                            <RedditPanel 
                              data={data.reddit} 
                              searchTerm={searchTerm}
                              filterSource={filterSource}
                            />
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-8">
                        <Card className="bg-accent/30 rounded-xl">
                          <CardContent className="p-6">
                            <NewsPanel 
                              data={data.newsApi} 
                              searchTerm={searchTerm}
                              filterSource={filterSource}
                            />
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/50 rounded-xl">
                          <CardContent className="p-6">
                            <PerplexityPanel 
                              data={data.perplexity} 
                              searchTerm={searchTerm}
                              filterSource={filterSource}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
          )}
        </div>

         {/* Enhanced Loading State */}
         {loading && !data && (
           <Card className="shadow-lg rounded-2xl">
             <CardContent className="p-16">
               <div className="flex items-center justify-center">
                 <div className="text-center">
                   <div className="relative mb-8">
                     <div className="w-16 h-16 mx-auto">
                       <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                       <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                     </div>
                   </div>
                   <h3 className="text-2xl font-bold text-foreground mb-2">Analyzing Trends</h3>
                   <p className="text-muted-foreground text-lg">Gathering insights from multiple sources...</p>
                   <div className="flex justify-center gap-1 mt-4">
                     <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                     <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Enhanced No Data State */}
         {!loading && !data && (
           <Card className="shadow-lg rounded-2xl">
             <CardContent className="p-16">
               <div className="flex items-center justify-center">
                 <div className="text-center">
                   <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                     <Activity className="h-12 w-12 text-primary" />
                   </div>
                   <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Analyze</h3>
                   <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                     Start your first analysis to discover trending topics and insights across all platforms
                   </p>
                   <Button 
                     onClick={fetchData} 
                     className="shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 px-8 py-3 text-lg"
                   >
                     <Sparkles className="h-5 w-5 mr-2" />
                     Begin Analysis
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}
       </main>
     </div>
   )
 }