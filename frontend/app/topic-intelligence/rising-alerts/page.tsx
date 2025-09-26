"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, Bell, TrendingDown, Filter, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

interface RisingTopic {
  id: string;
  topic: string;
  currentMentions: number;
  previousMentions: number;
  growthRate: number;
  confidence: number;
  threshold: number;
  status: "alert" | "warning" | "normal";
  sources: string[];
  sampleMentions: string[];
  firstDetected: string;
  lastUpdated: string;
}

export default function RisingAlertsPage() {
  const [risingTopics, setRisingTopics] = useState<RisingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "alert" | "warning">("all");
  const [minGrowthRate, setMinGrowthRate] = useState(100);

  useEffect(() => {
    fetchRisingTopics();
  }, []);

  const fetchRisingTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/sources/scrape');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched rising topics data:', data);
        
        // Transform the topStories data into rising topics format
        const transformedRisingTopics = data.topStories.map((story, index) => ({
          id: `rising-${index}`,
          topic: story.topic,
          currentMentions: story.count,
          previousMentions: Math.max(1, Math.floor(story.count * 0.3)),
          growthRate: Math.floor(((story.count - Math.max(1, Math.floor(story.count * 0.3))) / Math.max(1, Math.floor(story.count * 0.3))) * 100),
          confidence: story.confidence || 0.9,
          threshold: Math.floor(story.count * 0.8),
          status: story.count >= 5 ? "alert" : story.count >= 3 ? "warning" : "normal",
          sources: ["reddit", "news", "X/Twitter"],
          sampleMentions: data.allArticlesAnalysis
            .filter(article => article.topic === story.topic)
            .slice(0, 3)
            .map(article => article.title),
          firstDetected: data.timestamp,
          lastUpdated: data.timestamp
        }));
        
        setRisingTopics(transformedRisingTopics);
      } else {
        console.error('Failed to fetch rising topics:', response.status);
        setRisingTopics([]);
      }
    } catch (error) {
      console.error('Failed to fetch rising topics:', error);
      setRisingTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const mockRisingTopics: RisingTopic[] = [
    {
      id: "1",
      topic: "Quantum Computing",
      currentMentions: 156,
      previousMentions: 23,
      growthRate: 578.3,
      confidence: 0.92,
      threshold: 200,
      status: "alert",
      sources: ["Reddit", "News", "X/Twitter"],
      sampleMentions: [
        "IBM announces breakthrough in quantum error correction",
        "Google's quantum computer solves complex optimization problem",
        "Quantum computing startup raises $50M in Series A"
      ],
      firstDetected: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString()
    },
    {
      id: "2",
      topic: "Climate Change",
      currentMentions: 1247,
      previousMentions: 289,
      growthRate: 331.5,
      confidence: 0.88,
      threshold: 1000,
      status: "warning",
      sources: ["News", "Reddit", "Perplexity"],
      sampleMentions: [
        "Record-breaking temperatures across Europe",
        "New climate summit agreements announced",
        "Renewable energy adoption accelerates globally"
      ],
      firstDetected: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString()
    },
    {
      id: "3",
      topic: "Tesla",
      currentMentions: 892,
      previousMentions: 156,
      growthRate: 471.8,
      confidence: 0.95,
      threshold: 500,
      status: "alert",
      sources: ["X/Twitter", "Reddit", "News"],
      sampleMentions: [
        "Tesla stock surges after earnings beat",
        "New Tesla factory announcement",
        "Elon Musk's latest tweet goes viral"
      ],
      firstDetected: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString()
    }
  ];

  const filteredTopics = risingTopics.filter(topic => {
    const statusMatch = filterStatus === "all" || topic.status === filterStatus;
    const growthMatch = topic.growthRate >= minGrowthRate;
    return statusMatch && growthMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "alert":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <TrendingDown className="h-4 w-4" />;
    }
  };

  const getGrowthColor = (growthRate: number) => {
    if (growthRate >= 500) return "text-red-600";
    if (growthRate >= 200) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <PageShell 
      title="Rising Topics Alerts" 
      subtitle="Real-time monitoring of topics with sudden increases in mentions and engagement."
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <label className="text-sm font-medium">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="alert">Alerts</option>
                <option value="warning">Warnings</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Min Growth:</label>
              <input
                type="number"
                value={minGrowthRate}
                onChange={(e) => setMinGrowthRate(Number(e.target.value))}
                className="w-20 px-2 py-1 text-sm border rounded"
                min="0"
              />
              <span className="text-sm">%</span>
            </div>
          </div>
          
          <Button onClick={fetchRisingTopics} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Refreshing..." : "Refresh Alerts"}
          </Button>
        </div>

        {/* Alert Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {risingTopics.filter(t => t.status === "alert").length}
              </div>
              <p className="text-xs text-muted-foreground">Above threshold</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {risingTopics.filter(t => t.status === "warning").length}
              </div>
              <p className="text-xs text-muted-foreground">Approaching threshold</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                Total Monitored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {risingTopics.length}
              </div>
              <p className="text-xs text-muted-foreground">Topics tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Rising Topics List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Monitoring topic mentions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTopics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getStatusIcon(topic.status)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{topic.topic}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          First detected: {new Date(topic.firstDetected).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(topic.status)}>
                        {topic.status.toUpperCase()}
                      </Badge>
                      <div className={`text-sm font-medium ${getGrowthColor(topic.growthRate)}`}>
                        +{topic.growthRate.toFixed(1)}% growth
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{topic.currentMentions}</div>
                        <div className="text-xs text-muted-foreground">Current</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-muted-foreground">{topic.previousMentions}</div>
                        <div className="text-xs text-muted-foreground">Previous</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{topic.threshold}</div>
                        <div className="text-xs text-muted-foreground">Threshold</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{(topic.confidence * 100).toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                    </div>

                    {/* Sources */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Sources:</h4>
                      <div className="flex flex-wrap gap-1">
                        {topic.sources.map((source) => (
                          <Badge key={source} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Sample Mentions */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Sample Mentions:</h4>
                      <div className="space-y-1">
                        {topic.sampleMentions.map((mention, index) => (
                          <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                            {mention}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredTopics.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No rising topics found</h3>
            <p className="text-muted-foreground">
              Try adjusting the filters or check back later for new alerts.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
