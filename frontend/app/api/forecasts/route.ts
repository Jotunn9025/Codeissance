import { NextResponse } from "next/server";

const ML_BASE = process.env.NEXT_PUBLIC_ML_API_BASE_URL || "http://localhost:5001";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = (url.searchParams.get("symbol") || "AAPL").toUpperCase();
  try {
    const res = await fetch(`${ML_BASE}/retrain?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
