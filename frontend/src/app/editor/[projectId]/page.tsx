'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useMangaStore } from '@/lib/store';
import { LeftSidebar } from '@/components/editor/LeftSidebar';
import { Canvas } from '@/components/editor/Canvas';
import { RightSidebar } from '@/components/editor/RightSidebar';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { ExportModal } from '@/components/export/ExportModal';
import { useAutoSave } from '@/hooks/useAutoSave';

export default function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const router = useRouter();
  const loadProjects = useMangaStore(s => s.loadProjects);
  const loadProject = useMangaStore(s => s.loadProject);
  const currentProject = useMangaStore(s => s.currentProject);
  const showExportModal = useMangaStore(s => s.ui.showExportModal);
  const setShowExportModal = useMangaStore(s => s.setShowExportModal);

  useAutoSave();

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (projectId) {
      void loadProject(projectId);
    }
  }, [projectId, loadProject]);

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-6xl animate-pulse">🎌</span>
          <p className="text-zinc-500 text-sm">Loading project...</p>
          <button onClick={() => router.push('/dashboard')} className="text-violet-400 text-sm hover:underline">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
      <EditorHeader />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <Canvas />
        <RightSidebar />
      </div>
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </div>
  );
}
