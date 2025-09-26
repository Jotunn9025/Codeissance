export async function POST(request: Request) {
  try {
    const body = await request.json()
    const CALL_AGENT_BASE_URL = process.env.CALL_AGENT_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${CALL_AGENT_BASE_URL}/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body?.message, to: body?.to })
    })
    const data = await res.json()
    return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to send alert' }), { status: 500 })
  }
}


