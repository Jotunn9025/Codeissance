import { NextResponse } from "next/server"

export async function GET() {
  const now = Date.now()
  const sources = [
    {
      id: "src-news",
      name: "Global News API",
      status: "connected",
      lastSync: new Date(now - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "src-social",
      name: "Social Media Stream",
      status: "syncing",
      lastSync: new Date(now - 60 * 1000).toISOString(),
    },
    {
      id: "src-forums",
      name: "Finance Forums Crawler",
      status: "connected",
      lastSync: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "src-alt",
      name: "Alt Data Pulse",
      status: "error",
      lastSync: new Date(now - 36 * 60 * 60 * 1000).toISOString(),
    },
  ]
  return NextResponse.json(sources)
}
