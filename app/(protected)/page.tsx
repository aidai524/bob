'use client';

import { Suspense } from 'react';
import { HomeSidebar } from '@/app/components/HomeSidebar';

function ProtectedHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HomeSidebar />
      {/* 其他首页内容 */}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProtectedHomePage />
    </Suspense>
  );
} 