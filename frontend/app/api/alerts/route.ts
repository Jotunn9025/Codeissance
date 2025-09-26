import { NextResponse } from "next/server"

export async function GET() {
  const alerts = [
    {
      id: "a-001",
      title: "Sharp sentiment inflection detected in EV sector",
      severity: "high",
      recommendation: "Increase monitoring of leading EV names; consider tactical long positions on strength.",
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: "a-002",
      title: "Negative media cluster forming around consumer retail",
      severity: "medium",
      recommendation: "Tighten stops on discretionary exposure; favor staples for relative strength.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "a-003",
      title: "Crypto chatter volatility rising across forums",
      severity: "low",
      recommendation: "Expect intraday swings; reduce position size or widen bands where appropriate.",
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
  ]
  return NextResponse.json(alerts)
}
