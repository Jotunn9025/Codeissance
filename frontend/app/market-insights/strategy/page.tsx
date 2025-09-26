"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertTriangle, Target, Clock, Filter, RefreshCw, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";
import { useState, useEffect } from "react";

interface Strategy {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  category: "marketing" | "investment" | "public_relations" | "risk_management";
  trigger: string;
  description: string;
  recommendation: string;
  expectedImpact: string;
  confidence: number;
  timeFrame: string;
  affectedEntities: string[];
  lastUpdated: string;
}

export default function StrategyPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");
  const [filterCategory, setFilterCategory] = useState<"all" | "marketing" | "investment" | "public_relations" | "risk_management">("all");

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/market-insights/strategy');
      if (response.ok) {
        const data = await response.json();
        setStrategies(data.strategies || []);
      } else {
        // Mock data for demo
        setStrategies(mockStrategies);
      }
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      setStrategies(mockStrategies);
    } finally {
      setLoading(false);
    }
  };

  const mockStrategies: Strategy[] = [
    {
      id: "1",
      title: "Reduce AI Company Ad Spend",
      priority: "high",
      category: "marketing",
      trigger: "Negative sentiment spike detected in AI sector",
      description: "AI-related companies showing 340% increase in negative sentiment over past 24 hours",
      recommendation: "Reduce advertising spend by 30-40% for next 7 days, focus on PR and reputation management",
      expectedImpact: "Prevent brand damage and optimize marketing ROI",
      confidence: 0.87,
      timeFrame: "7 days",
      affectedEntities: ["OpenAI", "Google", "Microsoft", "Meta"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "2",
      title: "Increase Tesla Position",
      priority: "medium",
      category: "investment",
      trigger: "Positive sentiment trend with strong correlation to stock price",
      description: "Tesla sentiment showing 0.91 correlation with stock price, trending positive",
      recommendation: "Consider increasing position size by 15-20% over next 2 weeks",
      expectedImpact: "Capitalize on positive sentiment momentum",
      confidence: 0.82,
      timeFrame: "14 days",
      affectedEntities: ["Tesla"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "3",
      title: "Climate Change PR Campaign",
      priority: "high",
      category: "public_relations",
      trigger: "Climate change mentions up 331% with mixed sentiment",
      description: "Climate change trending with high engagement but polarized sentiment",
      recommendation: "Launch proactive PR campaign highlighting sustainability efforts and commitments",
      expectedImpact: "Shape narrative and improve brand perception",
      confidence: 0.79,
      timeFrame: "30 days",
      affectedEntities: ["All companies with climate initiatives"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "4",
      title: "Crypto Market Caution",
      priority: "medium",
      category: "risk_management",
      trigger: "Bitcoin sentiment declining with regulatory concerns",
      description: "Bitcoin sentiment down 15% over past week, regulatory uncertainty increasing",
      recommendation: "Reduce crypto exposure by 25%, increase cash position",
      expectedImpact: "Protect against potential market downturn",
      confidence: 0.74,
      timeFrame: "21 days",
      affectedEntities: ["Bitcoin", "Ethereum", "Crypto ETFs"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "5",
      title: "Healthcare Sector Opportunity",
      priority: "low",
      category: "investment",
      trigger: "Healthcare sentiment improving with positive news flow",
      description: "Healthcare sector showing consistent positive sentiment with breakthrough announcements",
      recommendation: "Consider healthcare ETF allocation increase by 10-15%",
      expectedImpact: "Benefit from sector momentum and innovation trends",
      confidence: 0.71,
      timeFrame: "45 days",
      affectedEntities: ["Healthcare ETFs", "Biotech companies"],
      lastUpdated: new Date().toISOString()
    }
  ];

  const filteredStrategies = strategies.filter(strategy => {
    const priorityMatch = filterPriority === "all" || strategy.priority === filterPriority;
    const categoryMatch = filterCategory === "all" || strategy.category === filterCategory;
    return priorityMatch && categoryMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "marketing":
        return <TrendingUp className="h-4 w-4" />;
      case "investment":
        return <DollarSign className="h-4 w-4" />;
      case "public_relations":
        return <Users className="h-4 w-4" />;
      case "risk_management":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <PageShell 
      title="Strategy Suggestions" 
      subtitle="AI-generated proactive recommendations based on sentiment trends and market analysis."
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <label className="text-sm font-medium">Priority:</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Category:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="marketing">Marketing</option>
                <option value="investment">Investment</option>
                <option value="public_relations">PR</option>
                <option value="risk_management">Risk Management</option>
              </select>
            </div>
          </div>
          
          <Button onClick={fetchStrategies} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Generating..." : "Refresh Strategies"}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {strategies.filter(s => s.priority === "high").length}
              </div>
              <p className="text-xs text-muted-foreground">Urgent actions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-yellow-500" />
                Medium Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {strategies.filter(s => s.priority === "medium").length}
              </div>
              <p className="text-xs text-muted-foreground">Important actions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                Avg Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(strategies.reduce((sum, s) => sum + s.confidence, 0) / strategies.length * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Strategy confidence</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Total Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {strategies.length}
              </div>
              <p className="text-xs text-muted-foreground">Active recommendations</p>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generating strategy recommendations...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStrategies.map((strategy) => (
              <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(strategy.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{strategy.title}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {strategy.category.replace('_', ' ')} • {strategy.timeFrame}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getPriorityColor(strategy.priority)}>
                        {strategy.priority.toUpperCase()}
                      </Badge>
                      <div className={`text-sm font-medium ${getConfidenceColor(strategy.confidence)}`}>
                        {(strategy.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Trigger */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Trigger:
                      </h4>
                      <p className="text-sm text-muted-foreground">{strategy.trigger}</p>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Description:</h4>
                      <p className="text-sm text-muted-foreground">{strategy.description}</p>
                    </div>

                    {/* Recommendation */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recommendation:</h4>
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm font-medium">{strategy.recommendation}</p>
                      </div>
                    </div>

                    {/* Expected Impact */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Expected Impact:</h4>
                      <p className="text-sm text-muted-foreground">{strategy.expectedImpact}</p>
                    </div>

                    {/* Affected Entities */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Affected Entities:</h4>
                      <div className="flex flex-wrap gap-1">
                        {strategy.affectedEntities.map((entity) => (
                          <Badge key={entity} variant="outline" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        Implement Strategy
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredStrategies.length === 0 && !loading && (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No strategies found</h3>
            <p className="text-muted-foreground">
              Try adjusting the filters or refresh the strategy recommendations.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
