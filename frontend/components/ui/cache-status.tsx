"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Clock, Trash2 } from "lucide-react";

interface CacheStatus {
  hasData: boolean;
  dataAge: number | null;
  dataTtl: number;
  hasGroqAnalysis: boolean;
  groqAge: number | null;
  groqTtl: number;
  timestamp: string;
}

export function CacheStatusWidget() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCacheStatus = async () => {
    try {
      const response = await fetch('/api/backend/sources/cache/status');
      if (response.ok) {
        const status = await response.json();
        setCacheStatus(status);
      }
    } catch (error) {
      console.error('Error fetching cache status:', error);
    }
  };

  const clearCache = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/sources/cache/clear', { method: 'POST' });
      if (response.ok) {
        await fetchCacheStatus();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backend/sources/cache/refresh', { method: 'POST' });
      if (response.ok) {
        await fetchCacheStatus();
      }
    } catch (error) {
      console.error('Error force refreshing:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCacheStatus();
    const interval = setInterval(fetchCacheStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!cacheStatus) return null;

  const formatAge = (age: number | null) => {
    if (!age) return 'N/A';
    const seconds = Math.round(age / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
  };

  const getStatusColor = (hasData: boolean, age: number | null, ttl: number) => {
    if (!hasData) return 'destructive';
    if (!age) return 'default';
    const remainingTtl = ttl - age;
    if (remainingTtl < 60000) return 'destructive'; // Less than 1 minute
    if (remainingTtl < 300000) return 'secondary'; // Less than 5 minutes
    return 'default';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          Cache Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Cache</span>
              <Badge variant={getStatusColor(cacheStatus.hasData, cacheStatus.dataAge, cacheStatus.dataTtl)}>
                {cacheStatus.hasData ? 'Active' : 'Empty'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {cacheStatus.hasData ? formatAge(cacheStatus.dataAge) : 'No data'}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI Analysis</span>
              <Badge variant={getStatusColor(cacheStatus.hasGroqAnalysis, cacheStatus.groqAge, cacheStatus.groqTtl)}>
                {cacheStatus.hasGroqAnalysis ? 'Cached' : 'None'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {cacheStatus.hasGroqAnalysis ? formatAge(cacheStatus.groqAge) : 'No analysis'}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={forceRefresh}
            disabled={loading}
            size="sm"
            className="flex-1"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={clearCache}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
