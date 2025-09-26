"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingDown, Lightbulb, ArrowRight, Target, TrendingUp, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ScrapingData {
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

export default function MarketInsightsPage() {
  const [data, setData] = useState<ScrapingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/sources/scrape');
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched market insights data:', result);
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  const features = [
    {
      title: "Correlation Dashboard",
      description: "Show correlation between sentiment and stock price, sales, and campaign engagement with real-time data.",
      icon: BarChart3,
      href: "/market-insights/correlation",
      color: "bg-blue-500"
    },
    {
      title: "Forecasting",
      description: "Use historical sentiment + market data to predict short-term trend movements and market behavior.",
      icon: TrendingDown,
      href: "/market-insights/forecasting",
      color: "bg-green-500"
    },
    {
      title: "Strategy Suggestions",
      description: "Get proactive recommendations like 'Negative sentiment trending → reduce ad spend / focus on PR'.",
      icon: Lightbulb,
      href: "/market-insights/strategy",
      color: "bg-purple-500"
    }
  ];

  const insights = data ? [
    {
      title: "Total Articles Analyzed",
      value: data.fuzzyAnalysis.totalArticles.toString(),
      change: `+${data.fuzzyAnalysis.matchedArticles}`,
      trend: "up",
      description: "Articles processed by AI analysis"
    },
    {
      title: "AI Analysis Accuracy",
      value: `${Math.round((data.fuzzyAnalysis.matchedArticles / data.fuzzyAnalysis.totalArticles) * 100)}%`,
      change: `+${Math.round(data.fuzzyAnalysis.confidenceThreshold * 100)}%`,
      trend: "up",
      description: "Percentage of articles successfully analyzed"
    },
    {
      title: "Active Topics",
      value: data.fuzzyAnalysis.topicPopularity.length.toString(),
      change: `+${data.topStories.length}`,
      trend: "up",
      description: "Unique topics identified by AI"
    },
    {
      title: "Top Story Impact",
      value: data.topStories.length > 0 ? data.topStories[0].count.toString() : "0",
      change: data.topStories.length > 0 ? `+${data.topStories[0].confidence || 0}` : "+0",
      trend: "up",
      description: "Articles covering the top trending story"
    }
  ] : [
    {
      title: "Loading...",
      value: "0",
      change: "+0",
      trend: "up",
      description: "Fetching real-time data"
    },
    {
      title: "Loading...",
      value: "0",
      change: "+0",
      trend: "up",
      description: "Fetching real-time data"
    },
    {
      title: "Loading...",
      value: "0",
      change: "+0",
      trend: "up",
      description: "Fetching real-time data"
    },
    {
      title: "Loading...",
      value: "0",
      change: "+0",
      trend: "up",
      description: "Fetching real-time data"
    }
  ];

  return (
    <PageShell 
      title="Market & Business Insights" 
      subtitle="AI-powered correlation analysis, forecasting, and strategic recommendations based on sentiment data."
    >
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Link href={feature.href}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Explore Feature
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight) => (
            <Card key={insight.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{insight.value}</div>
                  <div className={`flex items-center gap-1 text-sm ${
                    insight.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {insight.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {insight.change}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recent Market Insights
              </CardTitle>
              <Button onClick={fetchData} disabled={loading} size="sm" className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading insights...</p>
                </div>
              ) : data && data.topStories && data.topStories.length > 0 ? (
                data.topStories.slice(0, 3).map((story, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Top Story #{index + 1}: "{story.topic}"</p>
                      <p className="text-xs text-muted-foreground">
                        {story.count} articles • Confidence: {story.confidence || 0}% • {lastUpdated ? `${Math.floor((Date.now() - lastUpdated.getTime()) / 60000)} minutes ago` : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No recent insights data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/market-insights/correlation">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>View Correlations</span>
                </Button>
              </Link>
              
              <Link href="/market-insights/forecasting">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <TrendingDown className="h-6 w-6" />
                  <span>Run Forecasts</span>
                </Button>
              </Link>
              
              <Link href="/market-insights/strategy">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Lightbulb className="h-6 w-6" />
                  <span>Get Strategies</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
