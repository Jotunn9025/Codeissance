"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, MessageSquare, ArrowUp, User } from "lucide-react";
import { useState } from "react";

interface RedditItem {
  id: string;
  title: string;
  url: string;
  author: string;
  subreddit: string;
  created_utc: number;
  score: number;
}

interface RedditPanelProps {
  data: RedditItem[];
  searchTerm: string;
  filterSource: string;
}

export function RedditPanel({ data, searchTerm, filterSource }: RedditPanelProps) {
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [minScore, setMinScore] = useState(0);

  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSource === "all" || filterSource === "reddit";
    const meetsScoreThreshold = item.score >= minScore;
    return matchesSearch && matchesFilter && meetsScoreThreshold;
  });

  const formatTime = (created_utc: number) => {
    const date = new Date(created_utc * 1000);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPosts(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 1000) return "text-green-600";
    if (score >= 500) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reddit Posts
          </CardTitle>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Min Score:</label>
            <input
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-20 px-2 py-1 text-sm border rounded"
              min="0"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No Reddit posts found
            </div>
          ) : (
            filteredData.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Reddit Logo/Icon */}
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">R</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm leading-tight hover:text-primary transition-colors cursor-pointer"
                          onClick={() => window.open(item.url, '_blank')}>
                        {item.title}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        u/{item.author}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        r/{item.subreddit}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.created_utc)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className={`flex items-center gap-1 ${getScoreColor(item.score)}`}>
                        <ArrowUp className="h-4 w-4" />
                        <span className="font-medium">{item.score.toLocaleString()}</span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(item.id)}
                        className="h-6 px-2 text-xs"
                      >
                        {expandedPosts.has(item.id) ? "Show Less" : "Show More"}
                      </Button>
                    </div>
                    
                    {expandedPosts.has(item.id) && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Subreddit:</strong> r/{item.subreddit}<br/>
                          <strong>Author:</strong> u/{item.author}<br/>
                          <strong>Score:</strong> {item.score.toLocaleString()} upvotes<br/>
                          <strong>Posted:</strong> {formatTime(item.created_utc)}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          View on Reddit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {filteredData.length > 10 && (
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Showing 10 of {filteredData.length} posts
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
