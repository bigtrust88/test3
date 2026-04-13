/**
 * 동적 사이트맵 생성
 */

import { MetadataRoute } from 'next';
import { getPosts, getCategories } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://usstockstory.com';

  try {
    const [postsRes, categoriesRes] = await Promise.all([
      getPosts({ limit: 100 }),
      getCategories(),
    ]);

    const posts = postsRes.data || [];
    const categories = categoriesRes.data || CATEGORIES;

    const routes: MetadataRoute.Sitemap = [
      // 홈
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },

      // 카테고리
      ...categories.map((cat) => ({
        url: `${baseUrl}/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),

      // 포스트
      ...posts.map((post) => ({
        url: `${baseUrl}/post/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),

      // 검색
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
    ];

    return routes;
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
