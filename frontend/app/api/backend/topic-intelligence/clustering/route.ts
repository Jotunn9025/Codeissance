import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.PUBLIC_BACKEND_BASE_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/topic-intelligence/clustering`, {
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
    console.error('Error fetching topic clusters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic clusters' },
      { status: 500 }
    );
  }
}
