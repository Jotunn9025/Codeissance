"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, Clock, Target, Filter, RefreshCw, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface Forecast {
  id: string;
  entity: string;
  type: "stock" | "crypto" | "sector" | "campaign";
  currentSentiment: number;
  predictedSentiment: number;
  confidence: number;
  timeHorizon: string;
  factors: string[];
  recommendations: string[];
  lastUpdated: string;
}

export default function ForecastingPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "stock" | "crypto" | "sector" | "campaign">("all");
  const [minConfidence, setMinConfidence] = useState(0.7);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/market-insights/forecasting');
      if (response.ok) {
        const data = await response.json();
        setForecasts(data.forecasts || []);
      } else {
        // Mock data for demo
        setForecasts(mockForecasts);
      }
    } catch (error) {
      console.error('Failed to fetch forecasts:', error);
      setForecasts(mockForecasts);
    } finally {
      setLoading(false);
    }
  };

  const mockForecasts: Forecast[] = [
    {
      id: "1",
      entity: "Tesla",
      type: "stock",
      currentSentiment: 0.75,
      predictedSentiment: 0.68,
      confidence: 0.89,
      timeHorizon: "3 days",
      factors: [
        "Recent negative news coverage",
        "Earnings report anticipation",
        "Market volatility increase"
      ],
      recommendations: [
        "Monitor for sentiment recovery",
        "Consider defensive positioning",
        "Watch for earnings guidance"
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "2",
      entity: "Bitcoin",
      type: "crypto",
      currentSentiment: 0.82,
      predictedSentiment: 0.76,
      confidence: 0.85,
      timeHorizon: "7 days",
      factors: [
        "Regulatory uncertainty",
        "Institutional adoption trends",
        "Market correlation with traditional assets"
      ],
      recommendations: [
        "Expect moderate volatility",
        "Monitor regulatory developments",
        "Consider dollar-cost averaging"
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "3",
      entity: "AI Industry",
      type: "sector",
      currentSentiment: 0.91,
      predictedSentiment: 0.88,
      confidence: 0.92,
      timeHorizon: "14 days",
      factors: [
        "Continued innovation announcements",
        "Investment flow patterns",
        "Competitive landscape changes"
      ],
      recommendations: [
        "Maintain bullish outlook",
        "Focus on innovation leaders",
        "Monitor competitive threats"
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "4",
      entity: "Climate Tech",
      type: "sector",
      currentSentiment: 0.78,
      predictedSentiment: 0.85,
      confidence: 0.81,
      timeHorizon: "10 days",
      factors: [
        "Policy announcements expected",
        "Investment momentum building",
        "Public awareness increasing"
      ],
      recommendations: [
        "Position for positive momentum",
        "Monitor policy developments",
        "Focus on renewable energy leaders"
      ],
      lastUpdated: new Date().toISOString()
    }
  ];

  const filteredForecasts = forecasts.filter(forecast => {
    const typeMatch = filterType === "all" || forecast.type === filterType;
    const confidenceMatch = forecast.confidence >= minConfidence;
    return typeMatch && confidenceMatch;
  });

  const getSentimentChange = (current: number, predicted: number) => {
    const change = predicted - current;
    const percentage = (change * 100).toFixed(1);
    return {
      value: change,
      percentage: percentage,
      isPositive: change > 0,
      isNegative: change < 0
    };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800";
    if (confidence >= 0.8) return "bg-yellow-100 text-yellow-800";
    if (confidence >= 0.7) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stock":
        return <TrendingUp className="h-4 w-4" />;
      case "crypto":
        return <Target className="h-4 w-4" />;
      case "sector":
        return <TrendingDown className="h-4 w-4" />;
      case "campaign":
        return <Clock className="h-4 w-4" />;
      default:
        return <TrendingDown className="h-4 w-4" />;
    }
  };

  return (
    <PageShell 
      title="Forecasting" 
      subtitle="AI-powered predictions of sentiment trends using historical data and market patterns."
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <label className="text-sm font-medium">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Types</option>
                <option value="stock">Stocks</option>
                <option value="crypto">Crypto</option>
                <option value="sector">Sectors</option>
                <option value="campaign">Campaigns</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Min Confidence:</label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.1"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm">{(minConfidence * 100).toFixed(0)}%</span>
            </div>
          </div>
          
          <Button onClick={fetchForecasts} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Generating..." : "Refresh Forecasts"}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Forecast accuracy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Positive Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {forecasts.filter(f => f.predictedSentiment > f.currentSentiment).length}
              </div>
              <p className="text-xs text-muted-foreground">Improving sentiment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Negative Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {forecasts.filter(f => f.predictedSentiment < f.currentSentiment).length}
              </div>
              <p className="text-xs text-muted-foreground">Declining sentiment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Forecasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {forecasts.length}
              </div>
              <p className="text-xs text-muted-foreground">Active predictions</p>
            </CardContent>
          </Card>
        </div>

        {/* Forecast Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generating forecasts...</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredForecasts.map((forecast) => {
              const sentimentChange = getSentimentChange(forecast.currentSentiment, forecast.predictedSentiment);
              
              return (
                <Card key={forecast.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getTypeIcon(forecast.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{forecast.entity}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">
                            {forecast.type} • {forecast.timeHorizon}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getConfidenceColor(forecast.confidence)}>
                          {(forecast.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                        <div className={`text-sm font-medium flex items-center gap-1 ${
                          sentimentChange.isPositive ? 'text-green-600' : 
                          sentimentChange.isNegative ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {sentimentChange.isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : sentimentChange.isNegative ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : null}
                          {sentimentChange.percentage}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sentiment Comparison */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {(forecast.currentSentiment * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Current</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {(forecast.predictedSentiment * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Predicted</div>
                        </div>
                      </div>

                      {/* Key Factors */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Key Factors:
                        </h4>
                        <div className="space-y-1">
                          {forecast.factors.map((factor, index) => (
                            <div key={index} className="text-sm text-muted-foreground pl-2 border-l-2 border-primary/20">
                              • {factor}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                        <div className="space-y-1">
                          {forecast.recommendations.map((recommendation, index) => (
                            <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                              {recommendation}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredForecasts.length === 0 && !loading && (
          <div className="text-center py-12">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No forecasts found</h3>
            <p className="text-muted-foreground">
              Try adjusting the filters or refresh the forecasts.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
