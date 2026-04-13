/**
 * 포스트 관리 페이지
 */

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function AdminPostsPage() {
  const posts = [
    {
      id: '1',
      title: '미국 주식 시장 분석',
      category: '시장동향',
      date: '2024-04-13',
      status: 'published',
      views: 125,
    },
    {
      id: '2',
      title: 'NVIDIA 실적 분석',
      category: '종목분석',
      date: '2024-04-12',
      status: 'published',
      views: 89,
    },
    {
      id: '3',
      title: 'ETF 투자 전략',
      category: 'ETF분석',
      date: '2024-04-11',
      status: 'draft',
      views: 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">포스트 관리</h1>
        <Link href="/admin/posts/new">
          <Button variant="primary">
            ✍️ 새 포스트 작성
          </Button>
        </Link>
      </div>

      {/* 포스트 테이블 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <th className="text-left py-4 px-6 font-semibold">제목</th>
              <th className="text-left py-4 px-6 font-semibold">카테고리</th>
              <th className="text-left py-4 px-6 font-semibold">상태</th>
              <th className="text-left py-4 px-6 font-semibold">날짜</th>
              <th className="text-left py-4 px-6 font-semibold">조회</th>
              <th className="text-left py-4 px-6 font-semibold">액션</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-4 px-6 font-medium">{post.title}</td>
                <td className="py-4 px-6">{post.category}</td>
                <td className="py-4 px-6">
                  <Badge variant={post.status === 'published' ? 'success' : 'secondary'} size="sm">
                    {post.status === 'published' ? '발행됨' : '초안'}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-sm">{post.date}</td>
                <td className="py-4 px-6">{post.views}</td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                    </Link>
                    <button className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors">
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          총 3개의 포스트
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            이전
          </button>
          <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
