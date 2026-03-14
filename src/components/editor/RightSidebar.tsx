'use client';

import { useMangaStore } from '@/lib/store';
import { PanelSettings } from '@/components/editor/PanelSettings';
import { StyleSettings } from '@/components/editor/StyleSettings';
import { BubbleSettings } from '@/components/bubbles/BubbleSettings';

export function RightSidebar() {
  const selectedPanelId = useMangaStore(s => s.ui.selectedPanelId);
  const currentProject = useMangaStore(s => s.currentProject);

  // Find selected panel
  let selectedPanel = null;
  if (selectedPanelId && currentProject) {
    for (const page of currentProject.pages) {
      const found = page.panels.find(p => p.id === selectedPanelId);
      if (found) { selectedPanel = found; break; }
    }
  }

  return (
    <div className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col shrink-0 overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-bold text-white">
          {selectedPanel ? '⚙️ Panel Settings' : '🎨 Style Settings'}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedPanel ? (
          <div className="divide-y divide-zinc-800">
            <PanelSettings panel={selectedPanel} />
            <BubbleSettings panel={selectedPanel} />
          </div>
        ) : (
          <StyleSettings />
        )}
      </div>
    </div>
  );
}
