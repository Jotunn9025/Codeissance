"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitBranch, TrendingUp, Network, ArrowRight, RefreshCw } from "lucide-react";
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

export default function TopicIntelligencePage() {
  const [data, setData] = useState<ScrapingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/sources/scrape');
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched topic intelligence data:', result);
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
      title: "Topic Clustering",
      description: "Automatically group trending posts/articles into clusters (AI, Finance, Climate) to show what's moving the needle.",
      icon: GitBranch,
      href: "/topic-intelligence/clustering",
      color: "bg-blue-500"
    },
    {
      title: "Rising Topics Alerts",
      description: "Notify when a new topic's mentions jump above a threshold with real-time monitoring.",
      icon: TrendingUp,
      href: "/topic-intelligence/rising-alerts",
      color: "bg-green-500"
    },
    {
      title: "Co-mention Analysis",
      description: "Show which companies/topics are frequently mentioned together with interactive network graphs.",
      icon: Network,
      href: "/topic-intelligence/comention",
      color: "bg-purple-500"
    }
  ];

  return (
    <PageShell 
      title="Topic & Trend Intelligence" 
      subtitle="AI-powered analysis of trending topics, clustering, and relationship mapping across all data sources."
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

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data ? data.fuzzyAnalysis.topicPopularity.length : 0}
              </div>
              <p className="text-xs text-muted-foreground">Currently trending</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Topic Clusters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data ? data.fuzzyAnalysis.topTopics.length : 0}
              </div>
              <p className="text-xs text-muted-foreground">AI-identified groups</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data ? data.fuzzyAnalysis.totalArticles : 0}
              </div>
              <p className="text-xs text-muted-foreground">Across all sources</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Matched Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data ? data.fuzzyAnalysis.matchedArticles : 0}
              </div>
              <p className="text-xs text-muted-foreground">AI-analyzed</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Topic Intelligence Activity</CardTitle>
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
                  <p className="text-sm text-muted-foreground">Loading activity...</p>
                </div>
              ) : data && data.topStories && data.topStories.length > 0 ? (
                data.topStories.slice(0, 3).map((story, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Top Story #{index + 1}: "{story.topic}"</p>
                      <p className="text-xs text-muted-foreground">
                        {story.count} articles • {lastUpdated ? `${Math.floor((Date.now() - lastUpdated.getTime()) / 60000)} minutes ago` : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No recent activity data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
