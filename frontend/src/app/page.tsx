'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-6xl animate-pulse">🎌</span>
        <p className="text-zinc-500 text-sm">Loading MangaMaker AI...</p>
      </div>
    </div>
  );
}
