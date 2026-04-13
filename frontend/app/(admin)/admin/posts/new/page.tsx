/**
 * 새 포스트 작성 페이지
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('stock-analysis');
  const [isPublished, setIsPublished] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API 호출 로직
    console.log({ title, content, category, isPublished });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">새 포스트 작성</h1>
        <p className="text-gray-600 dark:text-gray-400">
          새로운 분석 포스트를 작성하세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium mb-2">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="포스트 제목을 입력하세요"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            required
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium mb-2">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="stock-analysis">종목분석</option>
            <option value="market-trend">시장동향</option>
            <option value="earnings">실적발표</option>
            <option value="etf-analysis">ETF분석</option>
            <option value="investment-strategy">투자전략</option>
          </select>
        </div>

        {/* 본문 */}
        <div>
          <label className="block text-sm font-medium mb-2">본문</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="마크다운 형식의 본문을 입력하세요"
            rows={12}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm"
            required
          />
        </div>

        {/* 발행 여부 */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="published" className="text-sm font-medium">
            즉시 발행
          </label>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button variant="primary">
            저장 및 {isPublished ? '발행' : '초안 저장'}
          </Button>
          <Button variant="outline">
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
