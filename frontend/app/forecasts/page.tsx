"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/swr"
import { PageShell } from "@/components/layout/page-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type MlResponse = {
  ok: boolean
  symbol: string
  samples: number
  prediction: number | null
  recentPredictions: number[]
  sentimentSamples: { text: string; score: number }[]
}

export default function ForecastsPage() {
  const [symbol, setSymbol] = useState("AAPL")
  const { data, error, isLoading, mutate } = useSWR<MlResponse>(`/api/forecasts?symbol=${encodeURIComponent(symbol)}`, fetcher, { revalidateOnFocus: false })

  const sentimentSummary = useMemo(() => {
    if (!data?.sentimentSamples?.length) return null
    const avg = data.sentimentSamples.reduce((s, a) => s + a.score, 0) / data.sentimentSamples.length
    return { avg }
  }, [data])

  return (
    <PageShell title="Market Forecasting" subtitle="Retrain and fetch ML forecasts with news sentiment.">
      <div className="flex gap-2 mb-4">
        <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Ticker (e.g., AAPL)" className="w-40" />
        <Button onClick={() => mutate()} disabled={isLoading}>Retrain & Forecast</Button>
      </div>

      {error && <div className="text-destructive">Failed to load forecast.</div>}
      {isLoading && <div className="text-muted-foreground">Running model…</div>}

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Symbol</div>
              <div className="text-lg font-semibold">{data.symbol}</div>
              <div className="mt-3 text-sm text-muted-foreground">Next-day prediction</div>
              <div className="text-2xl font-bold">{data.prediction ? data.prediction.toFixed(2) : "N/A"}</div>
              <div className="mt-3 text-sm text-muted-foreground">Recent predictions</div>
              <div className="text-sm">{data.recentPredictions?.map((v) => v.toFixed(2)).join(", ") || "N/A"}</div>
              <div className="mt-3 text-sm text-muted-foreground">Samples used</div>
              <div className="text-sm">{data.samples}</div>
              {sentimentSummary && (
                <div className="mt-3 text-sm text-muted-foreground">Avg sentiment score</div>
              )}
              {sentimentSummary && <div className="text-sm">{sentimentSummary.avg.toFixed(3)}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>News Sentiment Samples</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Snippet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sentimentSamples?.length ? (
                    data.sentimentSamples.map((s, idx) => (
                      <TableRow key={idx}>
                        <TableCell className={s.score >= 0 ? "text-green-600" : "text-red-600"}>{s.score.toFixed(3)}</TableCell>
                        <TableCell className="max-w-[28rem] truncate" title={s.text}>{s.text}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-muted-foreground">No sentiment samples available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  )
}
