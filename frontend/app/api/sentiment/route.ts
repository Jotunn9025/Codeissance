import { NextResponse } from "next/server"

function seededRand(seed: number) {
  // simple LCG
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export async function GET() {
  const now = Date.now()
  const hours = 24 * 7
  const rand = seededRand(42)

  // baseline gentle upward trend with mean reversion
  let v = -0.1
  const data = Array.from({ length: hours }, (_, i) => {
    // AR(1)-like process
    const noise = (rand() - 0.5) * 0.2
    v = v * 0.9 + noise + 0.01 // drift up
    if (v > 1) v = 1
    if (v < -1) v = -1
    return {
      t: new Date(now - (hours - 1 - i) * 60 * 60 * 1000).toISOString(),
      s: Number(v.toFixed(3)),
    }
  })

  return NextResponse.json(data)
}
