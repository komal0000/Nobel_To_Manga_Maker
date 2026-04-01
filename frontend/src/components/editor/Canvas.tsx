'use client';

import { useMangaStore } from '@/lib/store';
import { PanelSlot } from './PanelSlot';
import { PageNavigator } from './PageNavigator';
import { motion, AnimatePresence } from 'framer-motion';

export function Canvas() {
  const currentProject = useMangaStore(s => s.currentProject);
  const selectedPageId = useMangaStore(s => s.ui.selectedPageId);
  const selectPanel = useMangaStore(s => s.selectPanel);

  const currentPage = currentProject?.pages.find(p => p.id === selectedPageId) ||
    currentProject?.pages[0];

  if (!currentPage) return (
    <div className="flex-1 flex items-center justify-center bg-zinc-950">
      <p className="text-zinc-600">No pages yet. Add a page to get started.</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden" onClick={(e) => {
      if (e.target === e.currentTarget) selectPanel(null);
    }}>
      {/* Canvas area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-8" onClick={(e) => {
        if (e.target === e.currentTarget) selectPanel(null);
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="manga-page relative rounded-lg"
            id={`manga-page-${currentPage.id}`}
            style={{
              width: '595px',   // A4 width at 72 DPI
              height: '842px',  // A4 height at 72 DPI
              minHeight: '842px',
            }}
          >
            {/* Panels */}
            {currentPage.panels.map(panel => (
              <PanelSlot key={panel.id} panel={panel} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page navigator */}
      <PageNavigator />
    </div>
  );
}
