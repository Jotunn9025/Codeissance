"use client";
import { PageShell } from "@/components/layout/page-shell"
import { SentimentTrendChart } from "@/components/charts/sentiment-trend-chart"
import { ForecastCard } from "@/components/forecast-card"
import { AlertList } from "@/components/alert-list"
import { KPICards } from "@/components/kpi-cards"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function DashboardPage() {
  const [symbol, setSymbol] = useState("AAPL")
  const [sentiment, setSentiment] = useState<{ label: string, score: number } | null>(null)

  async function triggerCall() {
    await fetch('/api/telephony/call', { method: 'POST' })
  }
  async function triggerWhatsApp() {
    await fetch('/api/telephony/whatsapp', { method: 'POST' })
  }
  async function fetchSentiment() {
    const res = await fetch(`/api/backend/sentiment/${encodeURIComponent(symbol)}`)
    if (res.ok) {
      const data = await res.json()
      setSentiment({ label: data.label, score: data.score })
    }
  }
  async function sendAlert() {
    const message = `Alert: ${symbol} sentiment is ${sentiment?.label} (score ${Math.round((sentiment?.score || 0)*100)/100}).`
    await fetch('/api/backend/alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) })
  }
  return (
    <PageShell title="Dashboard" subtitle="Live sentiment analysis, forecasts, and actionable insights.">
      <div className="mb-6 flex gap-3">
        <Button onClick={triggerCall} variant="default">Trigger Call</Button>
        <Button onClick={triggerWhatsApp} variant="secondary">Send WhatsApp</Button>
        <input className="border rounded px-2 py-1 text-sm" value={symbol} onChange={(e)=>setSymbol(e.target.value)} placeholder="Symbol e.g., AAPL" />
        <Button onClick={fetchSentiment} variant="outline">Get Sentiment</Button>
        <Button onClick={sendAlert} variant="destructive" disabled={!sentiment}>Send Sentiment Alert</Button>
      </div>
      <div className="mb-8">
        <KPICards />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SentimentTrendChart />
        </div>
        <div className="lg:col-span-1">
          <ForecastCard />
        </div>
      </div>

      <div className="mt-8">
        <AlertList />
      </div>
    </PageShell>
  )
}
