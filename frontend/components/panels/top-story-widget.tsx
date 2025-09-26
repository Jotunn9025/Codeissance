"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Download, Share2 } from "lucide-react";
import { useState } from "react";

interface TopStoryData {
  title: string;
  url: string;
  source: string;
  published: string;
  impact: number;
  category: string;
}

interface TopStoryWidgetProps {
  data: any[];
}

export function TopStoryWidget({ data }: TopStoryWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find the story with highest impact (most engagement, highest score, etc.)
  const findTopStory = (): TopStoryData | null => {
    if (!data || data.length === 0) return null;

    // Combine all sources and find the most impactful story
    const allStories = [
      ...(data.x || []).map((item: any) => ({
        title: item.title,
        url: item.url,
        source: 'X/Twitter',
        published: item.published,
        impact: 1, // Base impact for X
        category: 'Social Media'
      })),
      ...(data.reddit || []).map((item: any) => ({
        title: item.title,
        url: item.url,
        source: `r/${item.subreddit}`,
        published: new Date(item.created_utc * 1000).toISOString(),
        impact: item.score || 0,
        category: 'Reddit'
      })),
      ...(data.newsApi || []).map((item: any) => ({
        title: item.title,
        url: item.url,
        source: item.source,
        published: item.published,
        impact: 2, // Base impact for news
        category: 'News'
      })),
      ...(data.perplexity || []).map((item: any) => ({
        title: item.title,
        url: item.url,
        source: item.source,
        published: item.published,
        impact: 1.5, // Base impact for search trends
        category: 'Search Trends'
      }))
    ];

    // Sort by impact and return the top story
    return allStories.sort((a, b) => b.impact - a.impact)[0] || null;
  };

  const topStory = findTopStory();

  const formatTime = (published: string) => {
    const date = new Date(published);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      topStory: topStory,
      allData: data
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trending-content-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareData = () => {
    if (navigator.share && topStory) {
      navigator.share({
        title: 'Top Trending Story',
        text: topStory.title,
        url: topStory.url
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${topStory?.title} - ${topStory?.url}`);
    }
  };

  if (!topStory) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            Top Story of the Hour
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareData}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-2 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => window.open(topStory.url, '_blank')}>
                {topStory.title}
              </h3>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                <Badge variant="secondary">{topStory.source}</Badge>
                <Badge variant="outline">{topStory.category}</Badge>
                <span>{formatTime(topStory.published)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.open(topStory.url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Read Full Story
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </Button>
              </div>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Why This Story Matters:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• High engagement across multiple platforms</li>
                <li>• Trending in {topStory.category} category</li>
                <li>• Published {formatTime(topStory.published)}</li>
                <li>• Source: {topStory.source}</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
