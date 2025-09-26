"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, TrendingUp } from "lucide-react";
import { useState } from "react";

interface TopicData {
  topic: string;
  count: number;
  avgConfidence: number;
  sampleTitles: string[];
  allTitles: number;
}

interface WordCloudPanelProps {
  data: TopicData[];
  searchTerm: string;
  onTopicClick?: (topic: string) => void;
}

export function WordCloudPanel({ data, searchTerm, onTopicClick }: WordCloudPanelProps) {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const filteredData = data.filter(topic => {
    const matchesSearch = !searchTerm || topic.topic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const maxCount = Math.max(...filteredData.map(t => t.count));
  const minCount = Math.min(...filteredData.map(t => t.count));

  const getFontSize = (count: number) => {
    const minSize = 12;
    const maxSize = 32;
    const ratio = (count - minCount) / (maxCount - minCount);
    return Math.round(minSize + (maxSize - minSize) * ratio);
  };

  const getColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.8) return "text-blue-600";
    if (confidence >= 0.7) return "text-yellow-600";
    return "text-gray-500";
  };

  const getBackgroundColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-50 hover:bg-green-100";
    if (confidence >= 0.8) return "bg-blue-50 hover:bg-blue-100";
    if (confidence >= 0.7) return "bg-yellow-50 hover:bg-yellow-100";
    return "bg-gray-50 hover:bg-gray-100";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Topic Cloud
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No topics found
            </div>
          ) : (
            <>
              {/* Word Cloud Visualization */}
              <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg min-h-[200px] items-center justify-center">
                {filteredData.slice(0, 20).map((topic) => (
                  <div
                    key={topic.topic}
                    className={`inline-block px-3 py-1 rounded-full cursor-pointer transition-all duration-200 ${getBackgroundColor(topic.avgConfidence)}`}
                    style={{ fontSize: `${getFontSize(topic.count)}px` }}
                    onMouseEnter={() => setHoveredTopic(topic.topic)}
                    onMouseLeave={() => setHoveredTopic(null)}
                    onClick={() => onTopicClick?.(topic.topic)}
                  >
                    <span className={`font-medium ${getColor(topic.avgConfidence)}`}>
                      {topic.topic}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hover Details */}
              {hoveredTopic && (
                <div className="p-4 bg-popover border rounded-lg shadow-lg">
                  {(() => {
                    const topic = filteredData.find(t => t.topic === hoveredTopic);
                    if (!topic) return null;
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{topic.topic}</h4>
                          <Badge variant="outline">
                            {topic.count} articles
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Confidence:</strong> {(topic.avgConfidence * 100).toFixed(1)}%</p>
                          <p><strong>Total Matches:</strong> {topic.allTitles}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-2">Sample Titles:</h5>
                          <div className="space-y-1">
                            {topic.sampleTitles.slice(0, 3).map((title, index) => (
                              <div key={index} className="text-xs text-muted-foreground pl-2 border-l-2 border-primary/20">
                                • {title}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span>High Confidence (≥90%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span>Medium Confidence (≥80%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                  <span>Low Confidence (≥70%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <span>Very Low Confidence (&lt;70%)</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
