"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/swr"
import { AlertTriangle, Clock, CheckCircle } from "lucide-react"

type Alert = {
  id: string
  title: string
  severity: "low" | "medium" | "high"
  recommendation: string
  createdAt: string
}

export function AlertList() {
  const { data, error, isLoading } = useSWR<Alert[]>("/api/alerts", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  })

  if (error)
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="text-destructive text-sm">Failed to load alerts.</div>
      </div>
    )

  if (isLoading || !data)
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="size-4 bg-muted rounded-full shrink-0 mt-1"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return AlertTriangle
      case "medium":
        return Clock
      default:
        return CheckCircle
    }
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "text-destructive bg-destructive/10 border-destructive/20"
      case "medium":
        return "text-chart-1 bg-chart-1/10 border-chart-1/20"
      default:
        return "text-chart-2 bg-chart-2/10 border-chart-2/20"
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Proactive Alerts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {data.length} active alert{data.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="size-2 rounded-full bg-chart-2 animate-pulse"></div>
            Auto-refreshing
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {data.map((alert) => {
          const SeverityIcon = getSeverityIcon(alert.severity)
          const severityColor = getSeverityColor(alert.severity)

          return (
            <div key={alert.id} className="p-6 hover:bg-muted/30 transition-colors">
              <div className="flex gap-4">
                <div className={`p-2 rounded-lg border ${severityColor} shrink-0`}>
                  <SeverityIcon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="font-medium text-pretty leading-snug">{alert.title}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border font-medium uppercase tracking-wide ${severityColor}`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{alert.recommendation}</p>
                  <time className="text-xs text-muted-foreground flex items-center gap-1" dateTime={alert.createdAt}>
                    <Clock className="size-3" />
                    {new Date(alert.createdAt).toLocaleString()}
                  </time>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
