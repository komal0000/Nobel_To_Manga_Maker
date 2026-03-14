'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMangaStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export function EditorHeader() {
  const router = useRouter();
  const currentProject = useMangaStore(s => s.currentProject);
  const updateProjectTitle = useMangaStore(s => s.updateProjectTitle);
  const setShowExportModal = useMangaStore(s => s.setShowExportModal);
  const isSaving = useMangaStore(s => s.ui.isSaving);
  const lastSaved = useMangaStore(s => s.ui.lastSaved);
  const saveToLocal = useMangaStore(s => s.saveToLocal);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const handleTitleClick = () => {
    setTitleInput(currentProject?.title || '');
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (titleInput.trim()) {
      updateProjectTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <span className="text-xl">🎌</span>
          <span className="text-sm font-bold hidden md:block">MangaMaker</span>
        </button>
        <div className="w-px h-6 bg-zinc-700" />
        {isEditingTitle ? (
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
            autoFocus
          />
        ) : (
          <button
            onClick={handleTitleClick}
            className="text-sm font-semibold text-white hover:text-violet-400 transition-colors"
          >
            {currentProject?.title || 'Untitled'}
          </button>
        )}
      </div>

      {/* Center status */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        {isSaving ? (
          <><span className="animate-pulse">●</span> Saving...</>
        ) : lastSaved ? (
          <><span className="text-emerald-500">●</span> Saved</>
        ) : null}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={saveToLocal}>
          💾 Save
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setShowExportModal(true)}>
          📤 Export
        </Button>
      </div>
    </header>
  );
}
