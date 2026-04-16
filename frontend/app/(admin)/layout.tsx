/**
 * Admin Layout
 * Auth guard + sidebar
 */

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Login Required</h1>
        <p className="text-gray-600 dark:text-gray-400">
          You must be logged in to access the admin panel.
        </p>
        <Link href="/login">
          <Button variant="primary">Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={() => {
                localStorage.removeItem('stock-blog:jwt');
                router.push('/');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
