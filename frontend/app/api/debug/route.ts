import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'NOT SET';

  // 실제 API 호출 테스트
  let apiStatus = 'unknown';
  let postCount = 0;
  try {
    const res = await fetch(`${apiUrl}/api/posts/published`, {
      cache: 'no-store',
    });
    const data = await res.json();
    apiStatus = `HTTP ${res.status}`;
    postCount = data?.pagination?.total || 0;
  } catch (e) {
    apiStatus = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({
    NEXT_PUBLIC_API_URL: apiUrl,
    apiCallStatus: apiStatus,
    postCount,
    timestamp: new Date().toISOString(),
  });
}
