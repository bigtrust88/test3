/**
 * 포스트 상세 페이지
 * Dynamic route: /post/[slug]/
 */

// ISR: 5분마다 재검증, 또는 On-demand ISR로 즉시 갱신
export const revalidate = 300;

import { Metadata } from 'next';
import { PostHeader } from '@/components/PostHeader';
import { PostContent } from '@/components/PostContent';
import { RelatedPosts } from '@/components/RelatedPosts';
import { GiscusComments } from '@/components/GiscusComments';
import { Sidebar } from '@/components/Sidebar';
import { getPostBySlug, getPosts, getTags } from '@/lib/api';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: {
    slug: string;
  };
}

async function fetchPostData(slug: string) {
  try {
    const [postRes, postsRes, tagsRes] = await Promise.all([
      getPostBySlug(slug),
      getPosts({ limit: 20 }),
      getTags(),
    ]);

    return {
      post: postRes,
      relatedPosts: postsRes.data || [],
      tags: tagsRes.data || [],
    };
  } catch (error) {
    return { post: null, relatedPosts: [], tags: [] };
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { post } = await fetchPostData(params.slug);

  if (!post) {
    return { title: 'Post not found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const res = await getPosts({ limit: 50 });
    return (res.data || []).map((post) => ({
      slug: post.slug,
    }));
  } catch {
    return [];
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { post, relatedPosts, tags } = await fetchPostData(params.slug);

  if (!post) {
    notFound();
  }

  const categoryRelatedPosts = relatedPosts.filter(
    (p) => p.category.id === post.category.id,
  );

  return (
    <article className="space-y-8">
      {/* 포스트 헤더 */}
      <PostHeader post={post} />

      {/* 메인 콘텐츠 + 사이드바 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 본문 */}
          <PostContent content={post.content_html} title={post.title} />

          {/* 관련 포스트 */}
          {categoryRelatedPosts.length > 0 && (
            <RelatedPosts
              posts={categoryRelatedPosts}
              currentPostId={post.id}
              title={`${post.category.name_ko} 다른 분석`}
            />
          )}

          {/* 댓글 */}
          <GiscusComments slug={post.slug} />
        </div>

        {/* 사이드바 */}
        <Sidebar tags={tags} />
      </div>

      {/* JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: post.cover_image_url,
            datePublished: post.published_at,
            author: {
              '@type': 'Person',
              name: post.author?.display_name || 'US Stock Story',
            },
            publisher: {
              '@type': 'Organization',
              name: 'US Stock Story',
              logo: {
                '@type': 'ImageObject',
                url: 'https://usstockstory.com/logo.png',
              },
            },
          }),
        }}
      />
    </article>
  );
}
