"use client"

import useSWR from "swr"
import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, Area, AreaChart } from "recharts"
import { fetcher } from "@/lib/swr"

type SentimentPoint = {
  t: string // ISO timestamp
  s: number // sentiment score -1..1
}

export function SentimentTrendChart() {
  const { data, isLoading, error } = useSWR<SentimentPoint[]>("/api/sentiment", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  })

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="text-destructive text-sm">Failed to load sentiment data.</div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Market Sentiment Trend</h3>
            <p className="text-sm text-muted-foreground mt-1">7-day rolling sentiment analysis</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{data[data.length - 1]?.s.toFixed(2) || "—"}</div>
            <div className="text-xs text-muted-foreground">Current Score</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
              <XAxis
                dataKey="t"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
                minTickGap={30}
              />
              <YAxis
                domain={[-1, 1]}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                tickFormatter={(v) => v.toFixed(1)}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <ReferenceLine y={0} stroke="var(--color-muted-foreground)" strokeDasharray="2 2" opacity={0.7} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  color: "var(--color-popover-foreground)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value: number) => [value.toFixed(3), "Sentiment"]}
              />
              <Area
                type="monotone"
                dataKey="s"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#sentimentGradient)"
                dot={false}
                activeDot={{ r: 4, stroke: "var(--color-chart-1)", strokeWidth: 2, fill: "var(--color-background)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
