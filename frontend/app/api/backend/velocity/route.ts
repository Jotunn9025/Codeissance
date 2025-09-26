import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || process.env.PUBLIC_BACKEND_BASE_URL || "http://localhost:5000";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = (url.searchParams.get("symbol") || "AAPL").toUpperCase();
  const res = await fetch(`${BASE}/api/v1/velocity?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}


