'use client';

import { useMangaStore } from '@/lib/store';
import { Panel, Bubble } from '@/lib/types';
import { Button } from '@/components/ui/Button';

export function BubbleSettings({ panel }: { panel: Panel }) {
  const selectedBubbleId = useMangaStore(s => s.ui.selectedBubbleId);
  const updateBubble = useMangaStore(s => s.updateBubble);

  const selectedBubble = panel.bubbles.find(b => b.id === selectedBubbleId);

  if (!selectedBubble) {
    return (
      <div className="p-4 pt-6 border-t border-zinc-800">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Bubble Settings</h4>
        <p className="text-xs text-zinc-500 italic">Select a bubble on the panel to edit its settings.</p>
        <div className="text-xs text-zinc-500 mt-2">
          {panel.bubbles.length} active bubble{panel.bubbles.length !== 1 ? 's' : ''}.
        </div>
      </div>
    );
  }

  const handleStyleChange = (key: string, value: any) => {
    updateBubble(selectedBubble.id, {
      style: { ...selectedBubble.style, [key]: value }
    });
  };

  const handleTypeChange = (type: any) => {
    updateBubble(selectedBubble.id, { type });
  };

  return (
    <div className="p-4 pt-6 border-t border-zinc-800 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Bubble Settings</h4>
      </div>

      {/* Bubble Type */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-400">Bubble Style</label>
        <div className="grid grid-cols-2 gap-2">
          {['speech', 'thought', 'narration', 'shout'].map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`py-1.5 px-2 text-xs rounded-lg border capitalize transition-all ${
                selectedBubble.type === t
                  ? 'bg-violet-500/10 border-violet-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-1 pt-2">
        <label className="text-xs text-zinc-400 flex justify-between">
          Font Size <span className="text-zinc-500">{selectedBubble.style.fontSize}px</span>
        </label>
        <input
          type="range"
          min="8"
          max="72"
          value={selectedBubble.style.fontSize}
          onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
          className="w-full accent-violet-500"
        />
      </div>

      {/* Rotation */}
      <div className="space-y-1 pt-2">
        <label className="text-xs text-zinc-400 flex justify-between">
          Rotation <span className="text-zinc-500">{selectedBubble.style.rotation}°</span>
        </label>
        <input
          type="range"
          min="-45"
          max="45"
          value={selectedBubble.style.rotation}
          onChange={(e) => handleStyleChange('rotation', parseInt(e.target.value))}
          className="w-full accent-violet-500"
        />
      </div>

      {/* Tail Direction */}
      {selectedBubble.type === 'speech' && (
        <div className="space-y-2 pt-2">
          <label className="text-xs text-zinc-400">Tail Position</label>
          <div className="grid grid-cols-5 gap-1">
            {['bottom', 'left', 'right', 'top', 'none'].map(d => (
              <button
                key={d}
                onClick={() => handleStyleChange('tailDirection', d)}
                className={`py-1 text-xs rounded bg-zinc-800 border capitalize hover:bg-zinc-700 transition-colors ${
                  selectedBubble.style.tailDirection === d ? 'border-violet-500 text-violet-400' : 'border-zinc-700 text-zinc-500'
                }`}
                title={d}
              >
                {d.substring(0, 1).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
