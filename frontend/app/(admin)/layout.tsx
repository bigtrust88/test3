/**
 * 관리자 레이아웃
 * 인증 보호 + 사이드바
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
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="text-gray-600 dark:text-gray-400">
          관리자 페이지에 접근하려면 로그인이 필요합니다.
        </p>
        <Link href="/login">
          <Button variant="primary">로그인 페이지로 가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* 사이드바 */}
      <AdminSidebar />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-3xl font-bold">관리자 대시보드</h1>
            <button
              onClick={() => {
                localStorage.removeItem('stock-blog:jwt');
                router.push('/');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>

          {/* 콘텐츠 */}
          {children}
        </div>
      </main>
    </div>
  );
}
