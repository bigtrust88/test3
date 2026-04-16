'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const CATEGORIES = [
  { slug: 'stock-analysis', name: 'Stock Analysis' },
  { slug: 'market-trend', name: 'Market Trend' },
  { slug: 'earnings', name: 'Earnings' },
  { slug: 'etf-analysis', name: 'ETF Analysis' },
  { slug: 'investment-strategy', name: 'Investment Strategy' },
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
        setMsg('Failed to load post');
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
        setMsg('✅ Image uploaded successfully');
      } else if (data.message) {
        setMsg(`⚠️ ${data.message} Please enter an image URL directly or use an external image.`);
      } else {
        setMsg('❌ Upload failed: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (e) {
      setMsg('❌ Upload failed: Please check your network connection');
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
        setMsg('✅ Saved successfully!');
      } else {
        const err = await res.json();
        setMsg('❌ Save failed: ' + (err.message || res.status));
      }
    } catch (e) {
      setMsg('❌ Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save'}
          </Button>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {msg}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium mb-2">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Category + Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={categorySlug}
            onChange={e => setCategorySlug(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="US stocks, NVIDIA, AI semiconductors"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Cover Image</label>
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : '📁 Choose File'}
            </button>
            <span className="text-sm text-gray-500">JPG, PNG, WEBP, GIF (max 5MB)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <input
            value={coverImageUrl}
            onChange={e => setCoverImageUrl(e.target.value)}
            placeholder="Or paste an image URL directly"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {coverImageUrl && (
            <div className="relative">
              <img src={coverImageUrl} alt="Cover preview" className="h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
              <button
                onClick={() => setCoverImageUrl('')}
                className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-red-600"
              >×</button>
            </div>
          )}
        </div>
      </div>

      {/* Content (Markdown) */}
      <div>
        <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
        <textarea
          value={contentMd}
          onChange={e => setContentMd(e.target.value)}
          rows={20}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
        />
      </div>

      {/* Published Status */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <input
          type="checkbox"
          id="published"
          checked={isPublished}
          onChange={e => setIsPublished(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="published" className="text-sm font-medium">Published (uncheck to save as draft)</label>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save'}
        </Button>
      </div>
    </div>
  );
}
