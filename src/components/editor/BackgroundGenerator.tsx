'use client';

import { useState } from 'react';
import { useMangaStore } from '@/lib/store';
import { useGenerate } from '@/hooks/useGenerate';
import { Button } from '@/components/ui/Button';

const SCENE_PRESETS = [
  { label: '🏙️ City Street', prompt: 'Japanese city street with buildings, signs, and pedestrians' },
  { label: '🏫 School Hallway', prompt: 'Japanese high school hallway with lockers and windows' },
  { label: '🌲 Forest', prompt: 'Dense forest with tall trees, sunlight filtering through leaves' },
  { label: '🏠 Room Interior', prompt: 'Japanese bedroom with desk, bed, and window' },
  { label: '🏰 Fantasy Castle', prompt: 'Medieval fantasy castle interior with stone walls and torches' },
  { label: '🌌 Space', prompt: 'Deep space with stars, nebula, and planet in background' },
  { label: '🏖️ Beach', prompt: 'Sandy beach with ocean waves, palm trees, sunset sky' },
  { label: '⛩️ Temple', prompt: 'Traditional Japanese temple with torii gate and cherry blossoms' },
];

export function BackgroundGenerator() {
  const selectedPanelId = useMangaStore(s => s.ui.selectedPanelId);
  const setPanelImage = useMangaStore(s => s.setPanelImage);
  const setGenerating = useMangaStore(s => s.setGenerating);
  const addToast = useMangaStore(s => s.addToast);
  const { generateBg, isGenerating } = useGenerate();

  const [customPrompt, setCustomPrompt] = useState('');

  const handleGenerate = async (prompt: string) => {
    if (!selectedPanelId) {
      addToast('Select a panel first', 'error');
      return;
    }
    setGenerating(true);
    const url = await generateBg(prompt);
    if (url) {
      setPanelImage(selectedPanelId, url, prompt, 'gemini-3.1-flash-image-preview');
    }
    setGenerating(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h4 className="text-sm font-bold text-white">🏞️ Background Generator</h4>
      <p className="text-xs text-zinc-500">Select a panel, then pick a preset or type a custom background.</p>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2">
        {SCENE_PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => handleGenerate(preset.prompt)}
            disabled={isGenerating || !selectedPanelId}
            className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-left hover:border-violet-500/50 hover:bg-zinc-750 transition-all disabled:opacity-40"
          >
            <span className="text-base">{preset.label.split(' ')[0]}</span>
            <div className="text-zinc-300 mt-1 font-medium">{preset.label.split(' ').slice(1).join(' ')}</div>
          </button>
        ))}
      </div>

      {/* Custom */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400">Custom Background</label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Describe the background scene..."
          className="w-full h-20 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
        />
        <Button
          size="sm"
          onClick={() => handleGenerate(customPrompt)}
          disabled={isGenerating || !customPrompt.trim() || !selectedPanelId}
          isLoading={isGenerating}
          className="w-full"
        >
          🎨 Generate Background
        </Button>
      </div>

      {!selectedPanelId && (
        <p className="text-xs text-amber-500/80 bg-amber-500/10 p-3 rounded-xl">
          ⚠️ Select a panel on the canvas first to apply a background.
        </p>
      )}
    </div>
  );
}
