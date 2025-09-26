"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, TrendingUp, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface TopicData {
  topic: string;
  count: number;
  avgConfidence: number;
  sampleTitles: string[];
  allTitles: number;
}

interface FuzzyAnalysisData {
  totalArticles: number;
  matchedArticles: number;
  topicPopularity: TopicData[];
  topTopics: TopicData[];
  confidenceThreshold: number;
}

interface FuzzyAnalysisPanelProps {
  data: FuzzyAnalysisData;
  searchTerm: string;
  onTopicClick?: (topic: string) => void;
}

export function FuzzyAnalysisPanel({ data, searchTerm, onTopicClick }: FuzzyAnalysisPanelProps) {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(data.confidenceThreshold);

  const filteredTopics = data.topicPopularity.filter(topic => {
    const matchesSearch = !searchTerm || topic.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const meetsConfidence = topic.avgConfidence >= confidenceThreshold;
    return matchesSearch && meetsConfidence;
  });

  const displayedTopics = showAllTopics ? filteredTopics : filteredTopics.slice(0, 5);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800 border-green-200";
    if (confidence >= 0.8) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (confidence >= 0.7) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return "High";
    if (confidence >= 0.8) return "Medium";
    if (confidence >= 0.7) return "Low";
    return "Very Low";
  };

  const maxCount = Math.max(...filteredTopics.map(t => t.count));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Fuzzy Analysis / Topic Popularity
          </CardTitle>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Confidence:</label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.1"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm font-medium">{(confidenceThreshold * 100).toFixed(0)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Bar Chart Visualization */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Top Topics by Count
            </h3>
            <div className="space-y-3">
              {displayedTopics.map((topic, index) => (
                <div key={topic.topic} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-8">#{index + 1}</span>
                      <span 
                        className="text-sm font-medium truncate max-w-xs cursor-pointer hover:text-primary transition-colors" 
                        title={topic.topic}
                        onClick={() => onTopicClick?.(topic.topic)}
                      >
                        {topic.topic}
                      </span>
                      <Badge className={`text-xs ${getConfidenceColor(topic.avgConfidence)}`}>
                        {getConfidenceLabel(topic.avgConfidence)}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium">
                      {topic.count} articles
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(topic.count / maxCount) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Confidence: {(topic.avgConfidence * 100).toFixed(1)}%</span>
                    <span>{topic.allTitles} total matches</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Titles Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sample Titles by Topic
            </h3>
            <div className="space-y-3">
              {displayedTopics.map((topic) => (
                <div key={topic.topic} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">{topic.topic}</h4>
                    <Badge variant="outline" className="text-xs">
                      {topic.count} articles
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {topic.sampleTitles.map((title, index) => (
                      <div key={index} className="text-sm text-muted-foreground pl-2 border-l-2 border-primary/20">
                        • {title}
                      </div>
                    ))}
                    {topic.allTitles > topic.sampleTitles.length && (
                      <div className="text-xs text-muted-foreground pl-2">
                        +{topic.allTitles - topic.sampleTitles.length} more articles
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {displayedTopics.length} of {filteredTopics.length} topics
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllTopics(!showAllTopics)}
              className="flex items-center gap-2"
            >
              {showAllTopics ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAllTopics ? "Show Less" : "Show All"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
