"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, FileText, Target, BarChart3 } from "lucide-react";

interface SummaryData {
  totalArticles: number;
  matchedArticles: number;
  topicPopularity: any[];
  topTopics: any[];
  confidenceThreshold: number;
}

interface SummaryPanelProps {
  data: SummaryData;
}

export function SummaryPanel({ data }: SummaryPanelProps) {
  const topTopic = data.topTopics[0];
  const avgConfidence = data.topTopics.length > 0 
    ? data.topTopics.reduce((sum, topic) => sum + topic.avgConfidence, 0) / data.topTopics.length 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalArticles}</div>
          <p className="text-xs text-muted-foreground">
            Across all sources
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Matched Articles</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.matchedArticles}</div>
          <p className="text-xs text-muted-foreground">
            {((data.matchedArticles / data.totalArticles) * 100).toFixed(1)}% match rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Trending Topic</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate" title={topTopic?.topic}>
            {topTopic?.topic || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {topTopic?.count || 0} articles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(avgConfidence * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Above {data.confidenceThreshold * 100}% threshold
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
