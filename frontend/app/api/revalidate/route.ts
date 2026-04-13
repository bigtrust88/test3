import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-demand ISR 엔드포인트
 * Backend에서 포스트 발행 후 이 엔드포인트를 호출하여 캐시 무효화
 *
 * Header: x-revalidate-secret (REVALIDATE_SECRET과 일치 필요)
 * Body: { slug?: string }
 */
export async function POST(request: NextRequest) {
  // 비밀키 검증
  const secret = request.headers.get('x-revalidate-secret');
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json(
      { message: 'Invalid revalidation secret' },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { slug } = body;

    // 홈 페이지 재검증 (항상)
    revalidatePath('/');

    // 카테고리 페이지 재검증 (모든 카테고리)
    revalidatePath('/[category]', 'page');

    // 특정 포스트 상세 페이지 재검증
    if (slug) {
      revalidatePath(`/post/[slug]`, 'page');
    }

    console.log(`✅ ISR revalidation succeeded${slug ? ` for slug: ${slug}` : ''}`);

    return NextResponse.json(
      {
        revalidated: true,
        message: `Cache revalidated${slug ? ` for ${slug}` : ''}`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('ISR revalidation error:', error);

    return NextResponse.json(
      {
        revalidated: false,
        message: 'Revalidation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
