"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

interface TrendingItem {
  id: string;
  title: string;
  url: string;
  published?: string;
  source?: string;
}

interface TrendingContentPanelProps {
  data: TrendingItem[];
  searchTerm: string;
  filterSource: string;
}

export function TrendingContentPanel({ data, searchTerm, filterSource }: TrendingContentPanelProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === "all" || filterSource === "x";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trending Content (X/Twitter)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trending content found
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredData.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="group relative p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {item.published && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(item.published)}
                          </div>
                        )}
                        {item.source && (
                          <Badge variant="secondary" className="text-xs">
                            {item.source}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>

                  {/* Hover Summary/Excerpt */}
                  {hoveredCard === item.id && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-popover border rounded-lg shadow-lg z-10">
                      <p className="text-sm text-muted-foreground">
                        Click to view full content on X/Twitter
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {filteredData.length > 8 && (
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Showing 8 of {filteredData.length} trending items
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
