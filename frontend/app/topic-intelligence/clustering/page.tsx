"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, TrendingUp, Users, Calendar, Filter } from "lucide-react";
import { useState, useEffect } from "react";

interface TopicCluster {
  id: string;
  name: string;
  description: string;
  topicCount: number;
  articleCount: number;
  confidence: number;
  trendingScore: number;
  lastUpdated: string;
  topics: string[];
  sampleArticles: {
    title: string;
    source: string;
    url: string;
    published: string;
  }[];
}

export default function TopicClusteringPage() {
  const [clusters, setClusters] = useState<TopicCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterConfidence, setFilterConfidence] = useState(0.7);
  const [sortBy, setSortBy] = useState<'trending' | 'confidence' | 'articles'>('trending');

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/sources/scrape');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched clustering data:', data);
        
        // Transform the fuzzyAnalysis data into cluster format
        const transformedClusters = data.fuzzyAnalysis.topicPopularity.map((topic, index) => ({
          id: `cluster-${index}`,
          name: topic.topic,
          description: `AI-identified cluster with ${topic.count} articles`,
          topicCount: topic.count,
          articleCount: topic.allTitles,
          confidence: topic.avgConfidence,
          trendingScore: Math.min(10, topic.count * 0.5 + topic.avgConfidence * 5),
          lastUpdated: data.timestamp,
          topics: topic.sampleTitles.slice(0, 5),
          sampleArticles: topic.sampleTitles.map((title, i) => ({
            title: title,
            source: topic.sources[0] || 'unknown',
            url: '#',
            published: new Date(Date.now() - i * 60 * 60 * 1000).toISOString()
          }))
        }));
        
        setClusters(transformedClusters);
      } else {
        console.error('Failed to fetch clusters:', response.status);
        setClusters([]);
      }
    } catch (error) {
      console.error('Failed to fetch clusters:', error);
      setClusters([]);
    } finally {
      setLoading(false);
    }
  };


  const filteredClusters = clusters
    .filter(cluster => cluster.confidence >= filterConfidence)
    .sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return b.trendingScore - a.trendingScore;
        case 'confidence':
          return b.confidence - a.confidence;
        case 'articles':
          return b.articleCount - a.articleCount;
        default:
          return 0;
      }
    });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800";
    if (confidence >= 0.8) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getTrendingColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <PageShell 
      title="Topic Clustering" 
      subtitle="AI-powered automatic grouping of trending topics and articles into meaningful clusters."
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <label className="text-sm font-medium">Min Confidence:</label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.1"
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm">{(filterConfidence * 100).toFixed(0)}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="trending">Trending Score</option>
                <option value="confidence">Confidence</option>
                <option value="articles">Article Count</option>
              </select>
            </div>
          </div>
          
          <Button onClick={fetchClusters} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh Clusters"}
          </Button>
        </div>

        {/* Clusters Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing topics and creating clusters...</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredClusters.map((cluster) => (
              <Card key={cluster.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{cluster.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{cluster.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getConfidenceColor(cluster.confidence)}>
                        {(cluster.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                      <div className={`text-sm font-medium ${getTrendingColor(cluster.trendingScore)}`}>
                        Trending: {cluster.trendingScore}/10
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{cluster.topicCount}</div>
                        <div className="text-xs text-muted-foreground">Topics</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{cluster.articleCount}</div>
                        <div className="text-xs text-muted-foreground">Articles</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {new Date(cluster.lastUpdated).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Last Updated</div>
                      </div>
                    </div>

                    {/* Topics */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Topics:</h4>
                      <div className="flex flex-wrap gap-1">
                        {cluster.topics.slice(0, 5).map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {cluster.topics.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{cluster.topics.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Sample Articles */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Sample Articles:</h4>
                      <div className="space-y-2">
                        {cluster.sampleArticles.map((article, index) => (
                          <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                            <div className="font-medium truncate">{article.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {article.source} • {new Date(article.published).toLocaleDateString()}
                            </div>
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

        {filteredClusters.length === 0 && !loading && (
          <div className="text-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No clusters found</h3>
            <p className="text-muted-foreground">
              Try lowering the confidence threshold or refresh the data.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
