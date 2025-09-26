"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, MessageSquare, Newspaper, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

interface TopicDrillDownProps {
  topic: string;
  data: any;
  onBack: () => void;
}

export function TopicDrillDown({ topic, data, onBack }: TopicDrillDownProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'x' | 'reddit' | 'newsApi' | 'perplexity'>('all');

  const getRelatedContent = () => {
    const allContent = [
      ...(data.x || []).map((item: any) => ({ ...item, source: 'x', sourceLabel: 'X/Twitter' })),
      ...(data.reddit || []).map((item: any) => ({ ...item, source: 'reddit', sourceLabel: `r/${item.subreddit}` })),
      ...(data.newsApi || []).map((item: any) => ({ ...item, source: 'newsApi', sourceLabel: item.source })),
      ...(data.perplexity || []).map((item: any) => ({ ...item, source: 'perplexity', sourceLabel: item.source }))
    ];

    // Filter content that might be related to the topic (simple keyword matching)
    const relatedContent = allContent.filter(item => 
      item.title.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(item.title.toLowerCase().split(' ')[0]) ||
      item.title.toLowerCase().split(' ').some(word => topic.toLowerCase().includes(word))
    );

    return relatedContent;
  };

  const relatedContent = getRelatedContent();
  const filteredContent = activeTab === 'all' 
    ? relatedContent 
    : relatedContent.filter(item => item.source === activeTab);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'x': return <TrendingUp className="h-4 w-4" />;
      case 'reddit': return <MessageSquare className="h-4 w-4" />;
      case 'newsApi': return <Newspaper className="h-4 w-4" />;
      case 'perplexity': return <Search className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'x': return 'bg-blue-100 text-blue-800';
      case 'reddit': return 'bg-orange-100 text-orange-800';
      case 'newsApi': return 'bg-green-100 text-green-800';
      case 'perplexity': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (published: string | number) => {
    const date = new Date(typeof published === 'number' ? published * 1000 : published);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <CardTitle className="text-lg">{topic}</CardTitle>
          </div>
          <Badge variant="outline">{filteredContent.length} related items</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Sources', count: relatedContent.length },
              { key: 'x', label: 'X/Twitter', count: relatedContent.filter(item => item.source === 'x').length },
              { key: 'reddit', label: 'Reddit', count: relatedContent.filter(item => item.source === 'reddit').length },
              { key: 'newsApi', label: 'News', count: relatedContent.filter(item => item.source === 'newsApi').length },
              { key: 'perplexity', label: 'Search', count: relatedContent.filter(item => item.source === 'perplexity').length }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
                className="flex items-center gap-2"
              >
                {tab.label}
                <Badge variant="secondary" className="text-xs">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Content List */}
          <div className="space-y-3">
            {filteredContent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No related content found for this topic
              </div>
            ) : (
              filteredContent.map((item, index) => (
                <div
                  key={`${item.source}-${index}`}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getSourceColor(item.source)}`}>
                      {getSourceIcon(item.source)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight mb-2 hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {item.sourceLabel}
                        </Badge>
                        <span>{formatTime(item.published || item.created_utc)}</span>
                        {item.score && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {item.score}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
