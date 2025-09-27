"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, TrendingUp, TrendingDown, Settings, Filter, Phone, MessageSquare, Mail } from "lucide-react";
import { useState } from "react";

export default function AlertsPage() {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  // Call Agent API endpoints
  const CALL_AGENT_BASE_URL = process.env.NEXT_PUBLIC_CALL_AGENT_URL || 'http://localhost:3001';

  const handleCall = async () => {
    setIsLoading(prev => ({ ...prev, call: true }));
    
    // Mock delay to simulate API call
    setTimeout(() => {
      alert('Call Initiated! 📞');
      setIsLoading(prev => ({ ...prev, call: false }));
    }, 1000);
  };

  const handleWhatsApp = async () => {
    setIsLoading(prev => ({ ...prev, whatsapp: true }));
    
    // Mock delay to simulate API call
    setTimeout(() => {
      alert('WhatsApp Message Initiated! 💬');
      setIsLoading(prev => ({ ...prev, whatsapp: false }));
    }, 1000);
  };

  const handleSMS = async () => {
    setIsLoading(prev => ({ ...prev, sms: true }));
    
    // Mock delay to simulate API call
    setTimeout(() => {
      alert('SMS Initiated! 📱');
      setIsLoading(prev => ({ ...prev, sms: false }));
    }, 1000);
  };

  const alerts = [
    {
      id: 1,
      type: "sentiment_shift",
      title: "Negative Sentiment Spike Detected",
      description: "AI technology sentiment dropped 15% in the last 2 hours across social media platforms",
      severity: "high",
      timestamp: "2 minutes ago",
      source: "Social Media Analysis",
      icon: TrendingDown,
      color: "text-red-500"
    },
    {
      id: 2,
      type: "trending_topic",
      title: "New Trending Topic Emerging",
      description: "Cryptocurrency regulation discussions increased 300% in news coverage",
      severity: "medium",
      timestamp: "15 minutes ago",
      source: "News Analysis",
      icon: TrendingUp,
      color: "text-blue-500"
    },
    {
      id: 3,
      type: "market_correlation",
      title: "Strong Correlation Detected",
      description: "Tech stock prices showing 85% correlation with AI sentiment trends",
      severity: "low",
      timestamp: "1 hour ago",
      source: "Market Analysis",
      icon: TrendingUp,
      color: "text-green-500"
    },
    {
      id: 4,
      type: "anomaly",
      title: "Unusual Activity Pattern",
      description: "Reddit discussion volume 200% above normal for this time of day",
      severity: "medium",
      timestamp: "2 hours ago",
      source: "Reddit Analysis",
      icon: AlertTriangle,
      color: "text-yellow-500"
    }
  ];

  const alertTypes = [
    {
      name: "Sentiment Shifts",
      description: "Monitor significant changes in sentiment across topics",
      count: 12,
      enabled: true
    },
    {
      name: "Trending Topics",
      description: "Get notified when new topics start trending",
      count: 8,
      enabled: true
    },
    {
      name: "Market Correlations",
      description: "Alert when strong correlations are detected",
      count: 5,
      enabled: false
    },
    {
      name: "Anomaly Detection",
      description: "Unusual patterns in data streams",
      count: 3,
      enabled: true
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Stay informed about important sentiment changes and market insights</p>
        </div>

        <div className="space-y-8">
          {/* Alert Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Alerts
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Alert Settings
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {alerts.length} Active Alerts
              </Badge>
            </div>
          </div>

          {/* Communication Actions */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Send Market Alert Notifications
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Trigger immediate notifications via call, WhatsApp, or SMS to stay informed about market sentiment changes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleCall}
                disabled={isLoading.call}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-4 w-4" />
                {isLoading.call ? 'Initiating...' : 'Make Call'}
              </Button>
              <Button 
                onClick={handleWhatsApp}
                disabled={isLoading.whatsapp}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
              >
                <MessageSquare className="h-4 w-4" />
                {isLoading.whatsapp ? 'Initiating...' : 'Send WhatsApp'}
              </Button>
              <Button 
                onClick={handleSMS}
                disabled={isLoading.sms}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4" />
                {isLoading.sms ? 'Initiating...' : 'Send SMS'}
              </Button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <p>• <strong>Call:</strong> Voice-based market sentiment analysis with AI assistant</p>
              <p>• <strong>WhatsApp:</strong> Instant market alerts and trend notifications</p>
              <p>• <strong>SMS:</strong> Quick text-based market sentiment updates</p>
            </div>
          </div>

          {/* Recent Alerts */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Recent Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <Card key={alert.id} className="hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${alert.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{alert.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{alert.timestamp}</span>
                            <span>•</span>
                            <span>{alert.source}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" variant="ghost">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Alert Types Configuration */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Alert Types</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {alertTypes.map((type) => (
                <Card key={type.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                      <Badge variant={type.enabled ? "default" : "secondary"}>
                        {type.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {type.count} alerts this week
                      </span>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Alert Statistics */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+12% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3m</div>
                <p className="text-xs text-muted-foreground">Average response</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94%</div>
                <p className="text-xs text-muted-foreground">Alert accuracy</p>
              </CardContent>
            </Card>
          </div>
        </div>
    </main>
  );
}