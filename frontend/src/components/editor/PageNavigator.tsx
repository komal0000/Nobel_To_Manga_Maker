'use client';

import { useMangaStore } from '@/lib/store';
import { LAYOUT_PRESETS } from '@/lib/layouts';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export function PageNavigator() {
  const currentProject = useMangaStore(s => s.currentProject);
  const selectedPageId = useMangaStore(s => s.ui.selectedPageId);
  const selectPage = useMangaStore(s => s.selectPage);
  const addPage = useMangaStore(s => s.addPage);
  const removePage = useMangaStore(s => s.removePage);

  if (!currentProject) return null;

  return (
    <div className="h-16 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 gap-3 shrink-0">
      <span className="text-xs text-zinc-500 font-medium mr-2">Pages:</span>

      <div className="flex items-center gap-2 overflow-x-auto flex-1">
        {currentProject.pages.map((page, idx) => (
          <motion.button
            key={page.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectPage(page.id)}
            className={`relative min-w-[40px] h-10 px-3 rounded-lg text-xs font-bold transition-all ${
              selectedPageId === page.id || (!selectedPageId && idx === 0)
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {idx + 1}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addPage()}
        >
          + Page
        </Button>
        {currentProject.pages.length > 1 && selectedPageId && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => removePage(selectedPageId)}
          >
            − Remove
          </Button>
        )}
      </div>
    </div>
  );
}
