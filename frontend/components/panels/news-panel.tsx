"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, Newspaper } from "lucide-react";
import { useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published: string;
}

interface NewsPanelProps {
  data: NewsItem[];
  searchTerm: string;
  filterSource: string;
}

export function NewsPanel({ data, searchTerm, filterSource }: NewsPanelProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === "all" || filterSource === "newsApi";
    return matchesSearch && matchesFilter;
  });

  const formatTime = (published: string) => {
    const date = new Date(published);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getTopicTag = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('finance') || titleLower.includes('stock') || titleLower.includes('market') || titleLower.includes('economy')) {
      return { label: 'Finance', color: 'bg-green-100 text-green-800' };
    }
    if (titleLower.includes('tech') || titleLower.includes('ai') || titleLower.includes('software') || titleLower.includes('digital')) {
      return { label: 'Tech', color: 'bg-blue-100 text-blue-800' };
    }
    if (titleLower.includes('science') || titleLower.includes('research') || titleLower.includes('study') || titleLower.includes('discovery')) {
      return { label: 'Science', color: 'bg-purple-100 text-purple-800' };
    }
    if (titleLower.includes('climate') || titleLower.includes('environment') || titleLower.includes('energy') || titleLower.includes('sustainability')) {
      return { label: 'Environment', color: 'bg-emerald-100 text-emerald-800' };
    }
    if (titleLower.includes('health') || titleLower.includes('medical') || titleLower.includes('covid') || titleLower.includes('vaccine')) {
      return { label: 'Health', color: 'bg-red-100 text-red-800' };
    }
    return { label: 'General', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          News API
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No news articles found
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredData.slice(0, 8).map((item) => {
                const topicTag = getTopicTag(item.title);
                return (
                  <div
                    key={item.id}
                    className="group relative p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <Badge className={`text-xs ${topicTag.color}`}>
                            {topicTag.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Newspaper className="h-3 w-3" />
                            {item.source}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(item.published)}
                          </div>
                        </div>
                      </div>
                      
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>

                    {/* Hover Summary/Excerpt */}
                    {hoveredCard === item.id && (
                      <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-popover border rounded-lg shadow-lg z-10">
                        <p className="text-sm text-muted-foreground">
                          <strong>Source:</strong> {item.source}<br/>
                          <strong>Published:</strong> {formatTime(item.published)}<br/>
                          <strong>Category:</strong> {topicTag.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Click to read full article
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {filteredData.length > 8 && (
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Showing 8 of {filteredData.length} news articles
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
