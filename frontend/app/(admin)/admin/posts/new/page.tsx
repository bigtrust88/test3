/**
 * New Post Page
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
    console.log({ title, content, category, isPublished });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Post</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new analysis post
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="stock-analysis">Stock Analysis</option>
            <option value="market-trend">Market Trend</option>
            <option value="earnings">Earnings</option>
            <option value="etf-analysis">ETF Analysis</option>
            <option value="investment-strategy">Investment Strategy</option>
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter post content in Markdown format"
            rows={12}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm"
            required
          />
        </div>

        {/* Published */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="published" className="text-sm font-medium">
            Publish immediately
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="primary">
            {isPublished ? 'Publish' : 'Save as Draft'}
          </Button>
          <Button variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
