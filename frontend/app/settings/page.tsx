"use client"

import { useState } from "react"

export default function SettingsPage() {
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [emailReports, setEmailReports] = useState(false)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure alerts and reporting.</p>
      </div>
      <div className="grid gap-6 max-w-xl">
        <div className="rounded-lg border border bg-card p-4">
          <h3 className="font-medium">Notifications</h3>
          <div className="mt-4 flex items-center justify-between">
            <label htmlFor="alerts" className="text-sm">
              Enable proactive alerts
            </label>
            <input
              id="alerts"
              type="checkbox"
              className="size-4"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              aria-label="Enable proactive alerts"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <label htmlFor="email" className="text-sm">
              Email weekly reports
            </label>
            <input
              id="email"
              type="checkbox"
              className="size-4"
              checked={emailReports}
              onChange={(e) => setEmailReports(e.target.checked)}
              aria-label="Email weekly reports"
            />
          </div>
        </div>

        <div className="rounded-lg border border bg-card p-4">
          <h3 className="font-medium">Data</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Real-time data ingestion from Reddit, NewsAPI, Perplexity, and X/Twitter. AI-powered analysis with Groq Llama 3.3 70B.
          </p>
        </div>
      </div>
    </main>
  )
}
