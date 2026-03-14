'use client';

import { useMangaStore } from '@/lib/store';
import { LAYOUT_PRESETS } from '@/lib/layouts';
import { motion } from 'framer-motion';

export function LayoutPicker() {
  const currentProject = useMangaStore(s => s.currentProject);
  const selectedPageId = useMangaStore(s => s.ui.selectedPageId);
  const setPageLayout = useMangaStore(s => s.setPageLayout);
  const addToast = useMangaStore(s => s.addToast);

  const currentPage = currentProject?.pages.find(p => p.id === selectedPageId) ||
    currentProject?.pages[0];

  const handlePickLayout = (presetId: string) => {
    if (!currentPage) return;
    const preset = LAYOUT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setPageLayout(currentPage.id, preset);
      addToast(`Layout changed to ${preset.name}`, 'info');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h4 className="text-sm font-bold text-white">📐 Page Layouts</h4>
      <p className="text-xs text-zinc-500">Pick a panel layout for the current page. This replaces existing panels.</p>

      <div className="grid grid-cols-2 gap-3">
        {LAYOUT_PRESETS.map(preset => (
          <motion.button
            key={preset.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handlePickLayout(preset.id)}
            className={`p-3 border rounded-xl text-left transition-all ${
              currentPage?.layoutPreset === preset.id
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
            }`}
          >
            {/* Mini preview */}
            <div className="w-full aspect-[3/4] bg-zinc-900 rounded-lg relative mb-2 overflow-hidden">
              {preset.panels.map((p, i) => (
                <div
                  key={i}
                  className="absolute bg-zinc-700 border border-zinc-600 rounded-sm"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.width}%`,
                    height: `${p.height}%`,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{preset.icon}</span>
              <span className="text-xs font-medium text-zinc-300">{preset.name}</span>
            </div>
            <span className="text-xs text-zinc-500">{preset.panels.length} panels</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
