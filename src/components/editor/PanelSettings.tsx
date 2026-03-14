'use client';

import { useMangaStore } from '@/lib/store';
import { Panel } from '@/lib/types';

interface PanelSettingsProps {
  panel: Panel;
}

export function PanelSettings({ panel }: PanelSettingsProps) {
  const updatePanel = useMangaStore(s => s.updatePanel);

  const handleStyleChange = (key: string, value: string | number) => {
    updatePanel(panel.id, {
      style: { ...panel.style, [key]: value },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Panel Style</h4>

      {/* Border Width */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-400 flex justify-between">
          Border Width <span className="text-zinc-500">{panel.style.borderWidth}px</span>
        </label>
        <input
          type="range"
          min="0"
          max="8"
          value={panel.style.borderWidth}
          onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value))}
          className="w-full accent-violet-500"
        />
      </div>

      {/* Border Radius */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-400 flex justify-between">
          Corner Radius <span className="text-zinc-500">{panel.style.borderRadius}px</span>
        </label>
        <input
          type="range"
          min="0"
          max="24"
          value={panel.style.borderRadius}
          onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value))}
          className="w-full accent-violet-500"
        />
      </div>

      {/* Border Color */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Border Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={panel.style.borderColor}
            onChange={(e) => handleStyleChange('borderColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent"
          />
          <span className="text-xs text-zinc-500 font-mono">{panel.style.borderColor}</span>
        </div>
      </div>

      {/* Panel Info */}
      <div className="pt-3 border-t border-zinc-800 space-y-2">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Panel Info</h4>
        {panel.prompt && (
          <div>
            <span className="text-xs text-zinc-500">Last prompt:</span>
            <p className="text-xs text-zinc-300 mt-1 bg-zinc-800 rounded-lg p-2">{panel.prompt}</p>
          </div>
        )}
        {panel.modelUsed && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Model:</span>
            <span className="text-xs text-violet-400 font-mono">{panel.modelUsed.split('-').slice(0, 2).join('-')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
