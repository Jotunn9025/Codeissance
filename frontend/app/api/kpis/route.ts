import { NextResponse } from "next/server"

// Mock KPI data generation
function generateKPIs() {
  return {
    sentiment: {
      current: Math.random() * 2 - 1, // -1 to 1
      change: (Math.random() - 0.5) * 0.2, // Small changes
    },
    accuracy: {
      current: 0.8 + Math.random() * 0.15, // 80-95%
      change: (Math.random() - 0.5) * 0.05,
    },
    alerts: {
      current: Math.floor(Math.random() * 8) + 2, // 2-10 alerts
      change: Math.floor((Math.random() - 0.5) * 4), // -2 to +2
    },
    sources: {
      current: Math.floor(Math.random() * 5) + 15, // 15-20 sources
      change: Math.floor((Math.random() - 0.5) * 6), // -3 to +3
    },
  }
}

export async function GET() {
  try {
    const kpis = generateKPIs()
    return NextResponse.json(kpis)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch KPIs" }, { status: 500 })
  }
}
