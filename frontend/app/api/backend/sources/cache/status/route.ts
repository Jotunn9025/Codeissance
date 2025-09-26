import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/sources/cache/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching cache status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache status' },
      { status: 500 }
    );
  }
}
