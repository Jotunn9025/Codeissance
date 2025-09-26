"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/swr"
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react"

type KPIData = {
  sentiment: { current: number; change: number }
  accuracy: { current: number; change: number }
  alerts: { current: number; change: number }
  sources: { current: number; change: number }
}

export function KPICards() {
  const { data, error, isLoading } = useSWR<KPIData>("/api/kpis", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30_000,
  })

  if (error) return <div className="text-destructive text-sm">Failed to load metrics.</div>
  if (isLoading || !data) return <div className="text-muted-foreground text-sm">Loading metrics…</div>

  const cards = [
    {
      title: "Sentiment Score",
      value: data.sentiment.current.toFixed(2),
      change: data.sentiment.change,
      icon: Activity,
      format: "decimal",
    },
    {
      title: "Model Accuracy",
      value: `${Math.round(data.accuracy.current * 100)}%`,
      change: data.accuracy.change,
      icon: TrendingUp,
      format: "percentage",
    },
    {
      title: "Active Alerts",
      value: data.alerts.current.toString(),
      change: data.alerts.change,
      icon: AlertCircle,
      format: "number",
    },
    {
      title: "Data Sources",
      value: data.sources.current.toString(),
      change: data.sources.change,
      icon: Activity,
      format: "number",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const isPositive = card.change > 0
        const Icon = card.icon
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <div key={card.title} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
              </div>
              <div className={cn("flex items-center gap-1 text-xs", isPositive ? "text-chart-2" : "text-destructive")}>
                <TrendIcon className="size-3" />
                <span>
                  {Math.abs(card.change).toFixed(card.format === "percentage" ? 1 : 2)}
                  {card.format === "percentage" ? "%" : ""}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold leading-none">{card.value}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
