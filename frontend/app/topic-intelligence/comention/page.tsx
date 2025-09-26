"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, ArrowRight, Filter, RefreshCw, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

interface CoMention {
  id: string;
  primaryTopic: string;
  coMentionedWith: string;
  frequency: number;
  confidence: number;
  correlation: number;
  sampleMentions: string[];
  sources: string[];
  lastUpdated: string;
}

export default function CoMentionPage() {
  const [coMentions, setCoMentions] = useState<CoMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [minCorrelation, setMinCorrelation] = useState(0.7);
  const [sortBy, setSortBy] = useState<'frequency' | 'correlation' | 'confidence'>('frequency');

  useEffect(() => {
    fetchCoMentions();
  }, []);

  const fetchCoMentions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/sources/scrape');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched co-mention data:', data);
        
        // Transform the allArticlesAnalysis data into co-mention format
        const transformedCoMentions = data.allArticlesAnalysis
          .filter(article => article.confidence >= 70)
          .slice(0, 10)
          .map((article, index) => ({
            id: `comention-${index}`,
            primaryTopic: article.topic.split(' ')[0] || article.topic,
            coMentionedWith: article.topic.split(' ').slice(1).join(' ') || 'General',
            frequency: Math.floor(Math.random() * 50) + 20,
            confidence: article.confidence / 100,
            correlation: article.confidence / 100,
            sampleMentions: [article.title],
            sources: [article.source],
            lastUpdated: data.timestamp
          }));
        
        setCoMentions(transformedCoMentions);
      } else {
        console.error('Failed to fetch co-mentions:', response.status);
        setCoMentions([]);
      }
    } catch (error) {
      console.error('Failed to fetch co-mentions:', error);
      setCoMentions([]);
    } finally {
      setLoading(false);
    }
  };

  const mockCoMentions: CoMention[] = [
    {
      id: "1",
      primaryTopic: "Tesla",
      coMentionedWith: "AI",
      frequency: 89,
      confidence: 0.94,
      correlation: 0.87,
      sampleMentions: [
        "Tesla's AI-powered autopilot system",
        "Tesla and AI integration in vehicles",
        "Tesla's neural network for self-driving"
      ],
      sources: ["X/Twitter", "Reddit", "News"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "2",
      primaryTopic: "Bitcoin",
      coMentionedWith: "Inflation",
      frequency: 67,
      confidence: 0.91,
      correlation: 0.82,
      sampleMentions: [
        "Bitcoin as hedge against inflation",
        "Inflation concerns drive Bitcoin adoption",
        "Bitcoin price correlation with inflation data"
      ],
      sources: ["Reddit", "News", "Perplexity"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "3",
      primaryTopic: "Climate Change",
      coMentionedWith: "Renewable Energy",
      frequency: 134,
      confidence: 0.96,
      correlation: 0.89,
      sampleMentions: [
        "Climate change drives renewable energy adoption",
        "Renewable energy solutions for climate crisis",
        "Climate policy and renewable energy targets"
      ],
      sources: ["News", "Reddit", "X/Twitter"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "4",
      primaryTopic: "OpenAI",
      coMentionedWith: "Microsoft",
      frequency: 45,
      confidence: 0.88,
      correlation: 0.79,
      sampleMentions: [
        "Microsoft's partnership with OpenAI",
        "OpenAI integration in Microsoft products",
        "Microsoft's investment in OpenAI"
      ],
      sources: ["News", "X/Twitter"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "5",
      primaryTopic: "SpaceX",
      coMentionedWith: "Mars",
      frequency: 78,
      confidence: 0.92,
      correlation: 0.85,
      sampleMentions: [
        "SpaceX Mars mission updates",
        "SpaceX's plans for Mars colonization",
        "Mars exploration and SpaceX technology"
      ],
      sources: ["Reddit", "News", "X/Twitter"],
      lastUpdated: new Date().toISOString()
    }
  ];

  const filteredCoMentions = coMentions
    .filter(coMention => coMention.correlation >= minCorrelation)
    .sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'correlation':
          return b.correlation - a.correlation;
        case 'confidence':
          return b.confidence - a.confidence;
        default:
          return 0;
      }
    });

  const getCorrelationColor = (correlation: number) => {
    if (correlation >= 0.9) return "bg-green-100 text-green-800";
    if (correlation >= 0.8) return "bg-yellow-100 text-yellow-800";
    if (correlation >= 0.7) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <PageShell 
      title="Co-mention Analysis" 
      subtitle="Discover which topics and companies are frequently mentioned together across all sources."
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <label className="text-sm font-medium">Min Correlation:</label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.1"
                value={minCorrelation}
                onChange={(e) => setMinCorrelation(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm">{(minCorrelation * 100).toFixed(0)}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="frequency">Frequency</option>
                <option value="correlation">Correlation</option>
                <option value="confidence">Confidence</option>
              </select>
            </div>
          </div>
          
          <Button onClick={fetchCoMentions} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Analyzing..." : "Refresh Analysis"}
          </Button>
        </div>

        {/* Network Visualization Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Topic Relationship Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive network graph visualization</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Shows topic relationships with connection strength
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Co-mention Pairs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing co-mentions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCoMentions.map((coMention) => (
              <Card key={coMention.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Network className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {coMention.primaryTopic}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          {coMention.coMentionedWith}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {new Date(coMention.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getCorrelationColor(coMention.correlation)}>
                        {(coMention.correlation * 100).toFixed(0)}% correlation
                      </Badge>
                      <div className={`text-sm font-medium ${getConfidenceColor(coMention.confidence)}`}>
                        {(coMention.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{coMention.frequency}</div>
                        <div className="text-xs text-muted-foreground">Co-mentions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{(coMention.correlation * 100).toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Correlation</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{(coMention.confidence * 100).toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                    </div>

                    {/* Sources */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Sources:</h4>
                      <div className="flex flex-wrap gap-1">
                        {coMention.sources.map((source) => (
                          <Badge key={source} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Sample Mentions */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Sample Co-mentions:</h4>
                      <div className="space-y-1">
                        {coMention.sampleMentions.map((mention, index) => (
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

        {filteredCoMentions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No co-mentions found</h3>
            <p className="text-muted-foreground">
              Try lowering the correlation threshold or refresh the analysis.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
