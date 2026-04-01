'use client';

import { useMangaStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

const SFX_PRESETS = [
  'BAM!', 'BOOM!', 'WHOOSH', 'SLASH!', 
  'CRACK!', 'ZAP!', 'THUD', 'SNAP!', 
  'BANG!', 'SWISH~', 'GASP!', 'RUMBLE'
];

export function SFXLibrary() {
  const selectedPanelId = useMangaStore(s => s.ui.selectedPanelId);
  const addSFX = useMangaStore(s => s.addSFX);

  const handleAddSFX = (text: string) => {
    if (!selectedPanelId) return;
    addSFX(selectedPanelId, text);
  };

  return (
    <div className="p-4 space-y-6 flex flex-col h-full">
      <div className="shrink-0">
        <h4 className="text-sm font-bold text-white mb-2">💥 SFX Library</h4>
        <p className="text-xs text-zinc-500 mb-4">
          Select a panel to add manga sound effects. SFX are rendered as scalable SVG vectors.
        </p>

        {!selectedPanelId && (
          <div className="mb-4 text-xs text-amber-500/80 bg-amber-500/10 p-3 rounded-xl">
            ⚠️ Select a panel on the canvas first to add SFX.
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {SFX_PRESETS.map(sfx => (
            <button
              key={sfx}
              disabled={!selectedPanelId}
              onClick={() => handleAddSFX(sfx)}
              className="group relative h-20 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed hover:border-violet-500/50 hover:bg-zinc-750 transition-all flex items-center justify-center p-2"
            >
              {/* Checkerboard bg pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), repeating-linear-gradient(45deg, #fff 25%, #000 25%, #000 75%, #fff 75%, #fff)',
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px'
              }}/>
              
              <span 
                className="relative sfx-text text-xl sm:text-2xl transform -rotate-12 group-hover:scale-110 transition-transform text-white drop-shadow-lg"
                style={{ WebkitTextStroke: '6px black', paintOrder: 'stroke fill' }}
              >
                {sfx}
              </span>
              <span 
                className="absolute inset-0 sfx-text text-xl sm:text-2xl flex items-center justify-center transform -rotate-12 group-hover:scale-110 transition-transform text-white"
              >
                {sfx}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
