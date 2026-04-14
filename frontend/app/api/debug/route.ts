import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'NOT SET';
  const results: Record<string, unknown> = { NEXT_PUBLIC_API_URL: apiUrl };

  const endpoints = [
    '/api/posts/published',
    '/api/posts/published/morning-briefing-2026-04-14',
    '/api/categories',
    '/api/tags',
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${apiUrl}${ep}`, { cache: 'no-store' });
      const data = await res.json();
      results[ep] = { status: res.status, ok: res.ok, sample: JSON.stringify(data).substring(0, 100) };
    } catch (e) {
      results[ep] = { error: String(e) };
    }
  }

  return NextResponse.json(results);
}
