'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('stock-blog:jwt');
      const res = await fetch(`${API_URL}/api/posts?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('stock-blog:jwt');
      await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Posts</h1>
        <Link href="/admin/posts/new">
          <Button variant="primary">✍️ New Post</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <th className="text-left py-4 px-6 font-semibold">Title</th>
              <th className="text-left py-4 px-6 font-semibold">Category</th>
              <th className="text-left py-4 px-6 font-semibold">Status</th>
              <th className="text-left py-4 px-6 font-semibold">Date</th>
              <th className="text-left py-4 px-6 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-gray-500">No posts found</td></tr>
            ) : posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-4 px-6 font-medium max-w-xs truncate">
                  <a href={`/post/${post.slug}`} target="_blank" className="hover:text-blue-500">
                    {post.title}
                  </a>
                  {post.is_ai_generated && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-1.5 py-0.5 rounded">AI</span>
                  )}
                </td>
                <td className="py-4 px-6 text-sm">{post.category?.name_ko || '-'}</td>
                <td className="py-4 px-6">
                  <Badge variant={post.is_published ? 'success' : 'secondary'} size="sm">
                    {post.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-sm">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US') : '-'}
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <Link href={`/admin/posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">{total} total posts</p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >Previous</button>
          <button
            disabled={posts.length < 20}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >Next</button>
        </div>
      </div>
    </div>
  );
}
