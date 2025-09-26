import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "AAPL").toUpperCase();
  const start = searchParams.get("start") || "2024-01-01";
  const end = searchParams.get("end") || new Date().toISOString().slice(0, 10);
  const max = searchParams.get("max") || "0.1";

  const base = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:5000";
  const url = `${base}/time-series?symbol=${encodeURIComponent(symbol)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&max=${encodeURIComponent(max)}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 }, cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 500 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}


