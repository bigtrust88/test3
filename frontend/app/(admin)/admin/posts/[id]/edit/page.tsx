'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const CATEGORIES = [
  { slug: 'stock-analysis', name: '종목분석' },
  { slug: 'market-trend', name: '시장동향' },
  { slug: 'earnings', name: '실적발표' },
  { slug: 'etf-analysis', name: 'ETF분석' },
  { slug: 'investment-strategy', name: '투자전략' },
];

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentMd, setContentMd] = useState('');
  const [categorySlug, setCategorySlug] = useState('market-trend');
  const [tags, setTags] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('stock-blog:jwt');
        const res = await fetch(`${API_URL}/api/posts/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const post = await res.json();
        setTitle(post.title || '');
        setExcerpt(post.excerpt || '');
        setContentMd(post.content_md || '');
        setCategorySlug(post.category?.slug || 'market-trend');
        setTags((post.tags || []).map((t: any) => t.name).join(', '));
        setCoverImageUrl(post.cover_image_url || '');
        setIsPublished(post.is_published ?? true);
      } catch (e) {
        setMsg('포스트를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('stock-blog:jwt');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setCoverImageUrl(data.url);
        setMsg('✅ 이미지 업로드 완료');
      } else if (data.message) {
        // R2 미설정 등의 사유
        setMsg(`⚠️ ${data.message} 이미지 URL을 직접 입력하거나 외부 이미지를 사용해주세요.`);
      } else {
        setMsg('❌ 업로드 실패: ' + (data.error?.message || '알 수 없는 오류'));
      }
    } catch (e) {
      setMsg('❌ 업로드 실패: 네트워크 연결을 확인하세요');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const token = localStorage.getItem('stock-blog:jwt');
      const res = await fetch(`${API_URL}/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          excerpt,
          content_md: contentMd,
          category_slug: categorySlug,
          tag_names: tags.split(',').map(t => t.trim()).filter(Boolean),
          cover_image_url: coverImageUrl || null,
          is_published: isPublished,
        }),
      });
      if (res.ok) {
        setMsg('✅ 저장 완료!');
      } else {
        const err = await res.json();
        setMsg('❌ 저장 실패: ' + (err.message || res.status));
      }
    } catch (e) {
      setMsg('❌ 저장 실패');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center">로딩 중...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">포스트 수정</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>취소</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '💾 저장'}
          </Button>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {msg}
        </div>
      )}

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium mb-2">제목</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 요약 */}
      <div>
        <label className="block text-sm font-medium mb-2">요약 (excerpt)</label>
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* 카테고리 + 발행 상태 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">카테고리</label>
          <select
            value={categorySlug}
            onChange={e => setCategorySlug(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">태그 (쉼표로 구분)</label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="미국주식, NVIDIA, AI반도체"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 커버 이미지 */}
      <div>
        <label className="block text-sm font-medium mb-2">커버 이미지</label>
        <div className="space-y-3">
          {/* 파일 업로드 */}
          <div className="flex gap-3 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {uploading ? '업로드 중...' : '📁 파일 선택'}
            </button>
            <span className="text-sm text-gray-500">JPG, PNG, WEBP, GIF (최대 5MB)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {/* URL 직접 입력 */}
          <input
            value={coverImageUrl}
            onChange={e => setCoverImageUrl(e.target.value)}
            placeholder="또는 이미지 URL을 직접 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {/* 미리보기 */}
          {coverImageUrl && (
            <div className="relative">
              <img src={coverImageUrl} alt="커버 미리보기" className="h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
              <button
                onClick={() => setCoverImageUrl('')}
                className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-red-600"
              >×</button>
            </div>
          )}
        </div>
      </div>

      {/* 본문 (마크다운) */}
      <div>
        <label className="block text-sm font-medium mb-2">본문 (마크다운)</label>
        <textarea
          value={contentMd}
          onChange={e => setContentMd(e.target.value)}
          rows={20}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
        />
      </div>

      {/* 발행 상태 */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <input
          type="checkbox"
          id="published"
          checked={isPublished}
          onChange={e => setIsPublished(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="published" className="text-sm font-medium">발행됨 (체크 해제 시 초안으로 변경)</label>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button variant="outline" onClick={() => router.back()}>취소</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '💾 저장'}
        </Button>
      </div>
    </div>
  );
}
