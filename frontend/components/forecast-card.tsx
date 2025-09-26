"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/swr"
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react"

type Forecast = {
  id: string
  horizon: string
  direction: "bullish" | "bearish" | "neutral"
  confidence: number // 0..1
  expectedImpact: string
}

export function ForecastCard() {
  const { data, error, isLoading } = useSWR<Forecast>("/api/forecasts?pick=top", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  })

  if (error)
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="text-destructive text-sm">Failed to load forecast.</div>
      </div>
    )

  if (isLoading || !data)
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
        </div>
      </div>
    )

  const getDirectionIcon = () => {
    switch (data.direction) {
      case "bullish":
        return TrendingUp
      case "bearish":
        return TrendingDown
      default:
        return Minus
    }
  }

  const getDirectionColor = () => {
    switch (data.direction) {
      case "bullish":
        return "text-chart-2"
      case "bearish":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const Icon = getDirectionIcon()

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">Top Forecast</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
            {data.horizon}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Market Direction</p>
            <div className="flex items-center gap-2">
              <Icon className={`size-5 ${getDirectionColor()}`} />
              <span className={`text-xl font-bold capitalize ${getDirectionColor()}`}>{data.direction}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Confidence</p>
            <div className="text-xl font-bold">{Math.round(data.confidence * 100)}%</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Confidence Level</span>
            <span>{Math.round(data.confidence * 100)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${data.confidence * 100}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Expected Impact</p>
          <p className="text-sm text-pretty leading-relaxed">{data.expectedImpact}</p>
        </div>
      </div>
    </div>
  )
}
