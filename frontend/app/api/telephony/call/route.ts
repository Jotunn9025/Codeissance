export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const CALL_AGENT_BASE_URL = process.env.CALL_AGENT_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${CALL_AGENT_BASE_URL}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'Call failed' }), { status: 500 })
  }
}


