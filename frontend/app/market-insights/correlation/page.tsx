"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, Filter, RefreshCw, Target, DollarSign, Users } from "lucide-react";
import { useState, useEffect } from "react";

interface CorrelationData {
  id: string;
  entity: string;
  type: "stock" | "crypto" | "campaign" | "product";
  sentimentCorrelation: number;
  priceCorrelation: number;
  volumeCorrelation: number;
  confidence: number;
  timeFrame: string;
  lastUpdated: string;
  sampleData: {
    date: string;
    sentiment: number;
    price: number;
    volume: number;
  }[];
}

export default function CorrelationDashboardPage() {
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "stock" | "crypto" | "campaign" | "product">("all");
  const [minCorrelation, setMinCorrelation] = useState(0.5);

  useEffect(() => {
    fetchCorrelations();
  }, []);

  const fetchCorrelations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/market-insights/correlation');
      if (response.ok) {
        const data = await response.json();
        setCorrelations(data.correlations || []);
      } else {
        // Mock data for demo
        setCorrelations(mockCorrelations);
      }
    } catch (error) {
      console.error('Failed to fetch correlations:', error);
      setCorrelations(mockCorrelations);
    } finally {
      setLoading(false);
    }
  };

  const mockCorrelations: CorrelationData[] = [
    {
      id: "1",
      entity: "Tesla",
      type: "stock",
      sentimentCorrelation: 0.87,
      priceCorrelation: 0.91,
      volumeCorrelation: 0.78,
      confidence: 0.94,
      timeFrame: "7 days",
      lastUpdated: new Date().toISOString(),
      sampleData: [
        { date: "2024-01-15", sentiment: 0.8, price: 245.50, volume: 45000000 },
        { date: "2024-01-14", sentiment: 0.7, price: 238.20, volume: 42000000 },
        { date: "2024-01-13", sentiment: 0.6, price: 231.80, volume: 38000000 },
        { date: "2024-01-12", sentiment: 0.9, price: 252.10, volume: 52000000 },
        { date: "2024-01-11", sentiment: 0.5, price: 225.30, volume: 35000000 }
      ]
    },
    {
      id: "2",
      entity: "Bitcoin",
      type: "crypto",
      sentimentCorrelation: 0.82,
      priceCorrelation: 0.89,
      volumeCorrelation: 0.85,
      confidence: 0.91,
      timeFrame: "7 days",
      lastUpdated: new Date().toISOString(),
      sampleData: [
        { date: "2024-01-15", sentiment: 0.7, price: 98500, volume: 28000000000 },
        { date: "2024-01-14", sentiment: 0.6, price: 95200, volume: 25000000000 },
        { date: "2024-01-13", sentiment: 0.8, price: 101200, volume: 32000000000 },
        { date: "2024-01-12", sentiment: 0.9, price: 103500, volume: 35000000000 },
        { date: "2024-01-11", sentiment: 0.5, price: 92800, volume: 22000000000 }
      ]
    },
    {
      id: "3",
      entity: "Apple iPhone Campaign",
      type: "campaign",
      sentimentCorrelation: 0.76,
      priceCorrelation: 0.68,
      volumeCorrelation: 0.82,
      confidence: 0.88,
      timeFrame: "14 days",
      lastUpdated: new Date().toISOString(),
      sampleData: [
        { date: "2024-01-15", sentiment: 0.8, price: 195.20, volume: 28000000 },
        { date: "2024-01-14", sentiment: 0.7, price: 192.50, volume: 25000000 },
        { date: "2024-01-13", sentiment: 0.9, price: 198.80, volume: 32000000 },
        { date: "2024-01-12", sentiment: 0.6, price: 189.30, volume: 22000000 },
        { date: "2024-01-11", sentiment: 0.5, price: 186.70, volume: 20000000 }
      ]
    },
    {
      id: "4",
      entity: "OpenAI ChatGPT",
      type: "product",
      sentimentCorrelation: 0.93,
      priceCorrelation: 0.45,
      volumeCorrelation: 0.88,
      confidence: 0.96,
      timeFrame: "30 days",
      lastUpdated: new Date().toISOString(),
      sampleData: [
        { date: "2024-01-15", sentiment: 0.9, price: 0, volume: 15000000 },
        { date: "2024-01-14", sentiment: 0.8, price: 0, volume: 14000000 },
        { date: "2024-01-13", sentiment: 0.7, price: 0, volume: 12000000 },
        { date: "2024-01-12", sentiment: 0.95, price: 0, volume: 18000000 },
        { date: "2024-01-11", sentiment: 0.6, price: 0, volume: 10000000 }
      ]
    }
  ];

  const filteredCorrelations = correlations.filter(correlation => {
    const typeMatch = filterType === "all" || correlation.type === filterType;
    const correlationMatch = Math.abs(correlation.sentimentCorrelation) >= minCorrelation;
    return typeMatch && correlationMatch;
  });

  const getCorrelationColor = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation >= 0.8) return "bg-green-100 text-green-800";
    if (absCorrelation >= 0.6) return "bg-yellow-100 text-yellow-800";
    if (absCorrelation >= 0.4) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getCorrelationIcon = (correlation: number) => {
    if (correlation > 0.1) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (correlation < -0.1) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <BarChart3 className="h-4 w-4 text-gray-600" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stock":
        return <DollarSign className="h-4 w-4" />;
      case "crypto":
        return <Target className="h-4 w-4" />;
      case "campaign":
        return <Users className="h-4 w-4" />;
      case "product":
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <PageShell 
      title="Correlation Dashboard" 
      subtitle="Analyze correlations between sentiment data and market performance across stocks, crypto, campaigns, and products."
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
                <option value="campaign">Campaigns</option>
                <option value="product">Products</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Min Correlation:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={minCorrelation}
                onChange={(e) => setMinCorrelation(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm">{(minCorrelation * 100).toFixed(0)}%</span>
            </div>
          </div>
          
          <Button onClick={fetchCorrelations} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Analyzing..." : "Refresh Analysis"}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Sentiment Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {(correlations.reduce((sum, c) => sum + Math.abs(c.sentimentCorrelation), 0) / correlations.length * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Across all entities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Strong Correlations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {correlations.filter(c => Math.abs(c.sentimentCorrelation) >= 0.8).length}
              </div>
              <p className="text-xs text-muted-foreground">≥80% correlation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(correlations.reduce((sum, c) => sum + c.confidence, 0) / correlations.length * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Analysis confidence</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {correlations.length}
              </div>
              <p className="text-xs text-muted-foreground">Being tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Correlation Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing correlations...</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredCorrelations.map((correlation) => (
              <Card key={correlation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getTypeIcon(correlation.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{correlation.entity}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {correlation.type} • {correlation.timeFrame}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getCorrelationColor(correlation.sentimentCorrelation)}>
                        {(correlation.sentimentCorrelation * 100).toFixed(0)}% sentiment
                      </Badge>
                      <div className="text-sm font-medium text-muted-foreground">
                        {(correlation.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Correlation Metrics */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getCorrelationIcon(correlation.sentimentCorrelation)}
                          <span className="text-lg font-bold">
                            {(correlation.sentimentCorrelation * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Sentiment</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getCorrelationIcon(correlation.priceCorrelation)}
                          <span className="text-lg font-bold">
                            {(correlation.priceCorrelation * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Price</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getCorrelationIcon(correlation.volumeCorrelation)}
                          <span className="text-lg font-bold">
                            {(correlation.volumeCorrelation * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Volume</div>
                      </div>
                    </div>

                    {/* Sample Data Chart Placeholder */}
                    <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Correlation Chart</p>
                        <p className="text-xs text-muted-foreground">
                          {correlation.sampleData.length} data points
                        </p>
                      </div>
                    </div>

                    {/* Recent Data Points */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recent Data:</h4>
                      <div className="space-y-1">
                        {correlation.sampleData.slice(0, 3).map((data, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                            <span>{new Date(data.date).toLocaleDateString()}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs">Sent: {(data.sentiment * 100).toFixed(0)}%</span>
                              {data.price > 0 && (
                                <span className="text-xs">Price: ${data.price.toLocaleString()}</span>
                              )}
                              <span className="text-xs">Vol: {(data.volume / 1000000).toFixed(1)}M</span>
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

        {filteredCorrelations.length === 0 && !loading && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No correlations found</h3>
            <p className="text-muted-foreground">
              Try adjusting the filters or refresh the analysis.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
