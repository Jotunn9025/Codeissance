"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

interface PerplexityItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published: string;
}

interface PerplexityPanelProps {
  data: PerplexityItem[];
  searchTerm: string;
  filterSource: string;
}

export function PerplexityPanel({ data, searchTerm, filterSource }: PerplexityPanelProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === "all" || filterSource === "perplexity";
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

  const getSearchTrend = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('trending') || titleLower.includes('popular') || titleLower.includes('viral')) {
      return { label: 'Viral', color: 'bg-red-100 text-red-800' };
    }
    if (titleLower.includes('latest') || titleLower.includes('new') || titleLower.includes('recent')) {
      return { label: 'Latest', color: 'bg-blue-100 text-blue-800' };
    }
    if (titleLower.includes('how') || titleLower.includes('what') || titleLower.includes('why')) {
      return { label: 'How-to', color: 'bg-green-100 text-green-800' };
    }
    return { label: 'Search', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Perplexity / Search Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No search trends found
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredData.slice(0, 6).map((item) => {
                const searchTrend = getSearchTrend(item.title);
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
                          <Badge className={`text-xs ${searchTrend.color}`}>
                            {searchTrend.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Search className="h-3 w-3" />
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
                          <strong>Search Source:</strong> {item.source}<br/>
                          <strong>Published:</strong> {formatTime(item.published)}<br/>
                          <strong>Trend Type:</strong> {searchTrend.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Click to view search results
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {filteredData.length > 6 && (
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Showing 6 of {filteredData.length} search trends
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
