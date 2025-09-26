export async function GET(
  _request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params
    const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:5000'
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/sentiment/${encodeURIComponent(symbol)}`, { cache: 'no-store' })
    const data = await res.json()
    return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to fetch sentiment' }), { status: 500 })
  }
}


