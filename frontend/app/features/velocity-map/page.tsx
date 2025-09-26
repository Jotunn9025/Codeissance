"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/swr"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type NodeItem = { id: string; platform: string; text: string; score: number }
type EdgeItem = { from: string; to: string; weight: number; kind: string }
type VelocityResponse = { symbol: string; nodes: NodeItem[]; edges: EdgeItem[]; platformSentiment?: Record<string, number>; aiNarrative?: string }

export default function VelocityMapPage() {
  const [symbol, setSymbol] = useState("AAPL")
  const { data, error, isLoading, mutate } = useSWR<VelocityResponse>(`/api/backend/velocity?symbol=${encodeURIComponent(symbol)}`, fetcher, { revalidateOnFocus: false })

  return (
    <main className="px-4 py-8 md:px-8">
      <h1 className="text-2xl font-semibold text-pretty">Cross‑Platform “Velocity” Map</h1>
      <p className="mt-2 text-sm text-foreground/80">Visualize how sentiment migrates across platforms (X → Reddit → Blogs).</p>

      <div className="flex gap-2 mt-4">
        <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Ticker (e.g., AAPL)" className="w-40" />
        <Button onClick={() => mutate()} disabled={isLoading}>Refresh</Button>
      </div>

      {error && <div className="mt-4 text-destructive">Failed to load velocity data.</div>}
      {isLoading && <div className="mt-4 text-muted-foreground">Loading…</div>}

      {data && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Nodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.nodes.map((n) => (
                  <div key={n.id} className="rounded border border-border p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{n.platform}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${n.score >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{n.score}</span>
                    </div>
                    <div className="mt-1 truncate" title={n.text}>{n.text}</div>
                  </div>
                ))}
                {!data.nodes.length && <div className="text-muted-foreground">No nodes available.</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.edges.map((e, i) => (
                  <div key={`${e.from}-${e.to}-${i}`} className="rounded border border-border p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{e.kind}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">w={e.weight}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{e.from} → {e.to}</div>
                  </div>
                ))}
                {!data.edges.length && <div className="text-muted-foreground">No edges inferred.</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>AI Narrative</CardTitle>
            </CardHeader>
            <CardContent>
              {data.aiNarrative ? (
                <p className="text-sm whitespace-pre-wrap">{data.aiNarrative}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Set GOOGLE_API_KEY to enable Gemini narrative.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {data.platformSentiment ? (
                  Object.entries(data.platformSentiment).map(([k,v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span>{k}</span>
                      <span className={v >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{v.toFixed(3)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No sentiment summary.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}
