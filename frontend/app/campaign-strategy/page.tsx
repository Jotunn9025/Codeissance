"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, Filter, SortAsc, ChevronDown, ChevronUp, ExternalLink, Plus, Eye, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface CampaignStrategy {
  topic: string;
  sentiment_score: number;
  confidence: number;
  campaign_type: 'Amplify' | 'Mitigation' | 'Monitor';
  urgency: 'High' | 'Medium' | 'Low';
  company_type?: string;
  last_updated?: string;
  recommended_actions: string[];
  suggested_channels: string[];
  sentiment_trend?: number[];
  visualization?: {
    card_color: 'red' | 'green' | 'orange';
    sentiment_icon: '📈' | '📉' | '➖';
    animation: 'pulse' | 'slide-in' | 'flip';
    pie_chart_value: number;
    bar_chart_value: number;
    tooltip: Array<{
      title: string;
      source: string;
      confidence: number;
    }>;
  };
}

interface StrategyResponse {
  success: boolean;
  strategies: CampaignStrategy[];
  metadata?: {
    totalStrategies: number;
    generatedAt: string;
    dataSource: string;
  };
  timestamp: string;
  cached: boolean;
}

export default function CampaignStrategyPage() {
  const [strategies, setStrategies] = useState<CampaignStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'sentiment' | 'urgency' | 'confidence'>('sentiment');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/campaign-strategy/strategies');
      if (response.ok) {
        const data: StrategyResponse = await response.json();
        console.log('Fetched campaign strategies:', data);
        setStrategies(data.strategies || []);
        setMetadata(data.metadata);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch strategies:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
      // Don't set strategies to empty array, keep existing data if any
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchStrategies, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort strategies
  const filteredAndSortedStrategies = strategies
    .filter(strategy => {
      const companyMatch = filterCompany === 'all' || (strategy.company_type || 'General') === filterCompany;
      const channelMatch = filterChannel === 'all' || strategy.suggested_channels.includes(filterChannel);
      
      // Debug logging
      if (!companyMatch || !channelMatch) {
        console.log('Filtered out strategy:', {
          topic: strategy.topic,
          company_type: strategy.company_type,
          channels: strategy.suggested_channels,
          companyMatch,
          channelMatch,
          filterCompany,
          filterChannel
        });
      }
      
      return companyMatch && channelMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'sentiment':
          return Math.abs(b.sentiment_score) - Math.abs(a.sentiment_score);
        case 'urgency':
          const urgencyOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        case 'confidence':
          return b.confidence - a.confidence;
        default:
          return 0;
      }
    });

  const toggleCardExpansion = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const getUniqueCompanyTypes = () => {
    const companyTypes = Array.from(new Set(strategies.map(s => s.company_type || 'General')));
    // Add more company types if not present in data
    const additionalTypes = ['Tech', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Energy', 'Media', 'Education', 'Real Estate', 'Transportation', 'Food & Beverage', 'Automotive', 'Pharmaceutical', 'Telecommunications', 'Entertainment', 'Sports', 'Fashion', 'Beauty', 'Travel', 'Insurance'];
    
    const allTypes = [...companyTypes, ...additionalTypes.filter(type => !companyTypes.includes(type))];
    return allTypes.sort();
  };

  const getUniqueChannels = () => {
    const channels = new Set<string>();
    strategies.forEach(s => s.suggested_channels.forEach(ch => channels.add(ch)));
    return Array.from(channels);
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'High': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Medium': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'Amplify': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'Mitigation': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Monitor': return <Target className="w-5 h-5 text-blue-500" />;
      default: return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCardColor = (color: string, urgency: string) => {
    const baseClasses: Record<string, string> = {
      'red': 'border-purple-200/50 bg-gradient-to-br from-purple-50/80 to-purple-100/60 dark:border-purple-800/30 dark:from-purple-950/40 dark:to-purple-900/30 backdrop-blur-sm',
      'green': 'border-violet-200/50 bg-gradient-to-br from-violet-50/80 to-violet-100/60 dark:border-violet-800/30 dark:from-violet-950/40 dark:to-violet-900/30 backdrop-blur-sm',
      'orange': 'border-indigo-200/50 bg-gradient-to-br from-indigo-50/80 to-indigo-100/60 dark:border-indigo-800/30 dark:from-indigo-950/40 dark:to-indigo-900/30 backdrop-blur-sm'
    };
    
    const urgencyGlow = urgency === 'High' ? 'ring-1 ring-opacity-30' : '';
    const urgencyColor = urgency === 'High' ? (color === 'red' ? 'ring-purple-300' : color === 'green' ? 'ring-violet-300' : 'ring-indigo-300') : '';
    
    return `${baseClasses[color] || baseClasses.orange} ${urgencyGlow} ${urgencyColor}`;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
          <Target className="w-6 h-6 text-primary" />
          Campaign Strategy Dashboard
        </h1>
        <p className="text-base text-muted-foreground mb-4">
          AI-powered marketing strategies based on real-time sentiment analysis
        </p>
        
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={fetchStrategies}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Strategies'}
          </button>
          
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {metadata && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-card border rounded-lg">
              <div className="text-2xl font-bold text-primary">{metadata.totalStrategies}</div>
              <div className="text-sm text-muted-foreground">Total Strategies</div>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <div className="text-sm font-medium">{metadata.dataSource}</div>
              <div className="text-sm text-muted-foreground">Data Source</div>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <div className="text-sm font-medium">
                {new Date(metadata.generatedAt).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Generated At</div>
            </div>
          </div>
        )}

        {/* Filters and Sort Controls */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
            <span className="text-xs text-muted-foreground">
              ({filteredAndSortedStrategies.length} of {strategies.length} strategies)
            </span>
          </div>
          
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
          >
            <option value="all" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>All Companies</option>
            {getUniqueCompanyTypes().map(type => (
              <option key={type} value={type} style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>{type}</option>
            ))}
          </select>

          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
          >
            <option value="all" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>All Channels</option>
            {getUniqueChannels().map(channel => (
              <option key={channel} value={channel} style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>{channel}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <SortAsc className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
            >
              <option value="sentiment" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>Sentiment</option>
              <option value="urgency" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>Urgency</option>
              <option value="confidence" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {strategies.length > 0 ? (
        <div className="grid gap-6">
          {filteredAndSortedStrategies.map((strategy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl border ${getCardColor(strategy.visualization?.card_color || 'orange', strategy.urgency)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{strategy.topic}</h3>
                    <span className="text-xl">{strategy.visualization?.sentiment_icon || '➖'}</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {strategy.company_type || 'General'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      {getCampaignTypeIcon(strategy.campaign_type)}
                      <span className="text-sm font-medium">{strategy.campaign_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getUrgencyIcon(strategy.urgency)}
                      <span className="text-sm font-medium">{strategy.urgency} Urgency</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        {(strategy.confidence * 100).toFixed(0)}% Confidence
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Updated {getTimeAgo(strategy.last_updated || new Date().toISOString())}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {(strategy.sentiment_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Sentiment</div>
                  
                  {/* Confidence Progress Bar */}
                  <div className="mt-2 w-16 h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${strategy.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sentiment Trend Sparkline */}
              <div className="mb-4">
                <h4 className="text-base font-medium mb-3 text-foreground">Sentiment Trend</h4>
                <div className="h-16 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(strategy.sentiment_trend || []).map((value, i) => ({ time: i, value }))}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={(strategy.visualization?.card_color || 'orange') === 'green' ? '#8b5cf6' : (strategy.visualization?.card_color || 'orange') === 'red' ? '#a855f7' : '#6366f1'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-base font-medium mb-3 text-foreground">Recommended Actions</h4>
                  <ul className="space-y-2">
                    {strategy.recommended_actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm leading-relaxed text-muted-foreground">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-medium mb-3 text-foreground">Suggested Channels</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {strategy.suggested_channels.map((channel, channelIndex) => (
                      <button
                        key={channelIndex}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors flex items-center gap-1"
                        onClick={() => window.open(`https://${channel.toLowerCase()}.com`, '_blank')}
                      >
                        {channel}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ))}
                  </div>

                  {/* Mini Charts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2 text-muted-foreground">Pie Chart</h5>
                      <div className="h-16 w-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Value', value: strategy.visualization?.pie_chart_value || 0 },
                                { name: 'Rest', value: 1 - (strategy.visualization?.pie_chart_value || 0) }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={12}
                              outerRadius={28}
                              dataKey="value"
                            >
                              <Cell fill={(strategy.visualization?.card_color || 'orange') === 'green' ? '#8b5cf6' : (strategy.visualization?.card_color || 'orange') === 'red' ? '#a855f7' : '#6366f1'} />
                              <Cell fill="#e5e7eb" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-2 text-muted-foreground">Bar Chart</h5>
                      <div className="h-16 w-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{ value: strategy.visualization?.bar_chart_value || 0 }]}>
                            <Bar 
                              dataKey="value" 
                              fill={(strategy.visualization?.card_color || 'orange') === 'green' ? '#8b5cf6' : (strategy.visualization?.card_color || 'orange') === 'red' ? '#a855f7' : '#6366f1'}
                              radius={[2, 2, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-3 border-t border-border/50 flex gap-2">
                <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Add to Campaign
                </button>
                <button className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Monitor
                </button>
                <button className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Collapsible Source Articles */}
              {(strategy.visualization?.tooltip || []).length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <button
                    onClick={() => toggleCardExpansion(index)}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    View Sources ({(strategy.visualization?.tooltip || []).length})
                    {expandedCards.has(index) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {expandedCards.has(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-2"
                    >
                      {(strategy.visualization?.tooltip || []).map((article, articleIndex) => (
                        <div key={articleIndex} className="p-3 bg-background/30 rounded text-sm">
                          <div className="font-medium mb-1 text-foreground">{article.title}</div>
                          <div className="text-muted-foreground">
                            {article.source} • {(article.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Strategies Available</h3>
          <p className="text-muted-foreground mb-4">
            Campaign strategies will be generated from real-time sentiment data once the backend is running.
            <br />
            <span className="text-sm">Make sure the backend server is started to get dynamic campaign strategies.</span>
          </p>
          <button
            onClick={fetchStrategies}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      )}
    </main>
  );
}
