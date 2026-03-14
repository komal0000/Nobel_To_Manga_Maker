'use client';

import { ImageModel } from '@/lib/types';

const MODELS: { id: ImageModel; name: string; icon: string; desc: string }[] = [
  { id: 'gemini-3.1-flash-image-preview', name: 'Nano Banana 2', icon: '⚡', desc: 'Fast, high quality — action panels & scenes' },
  { id: 'gemini-3-pro-image-preview', name: 'Nano Banana Pro', icon: '🌟', desc: 'Best quality — character portraits, text' },
  { id: 'gemini-2.5-flash-image-preview', name: 'Nano Banana', icon: '🍌', desc: 'Balanced — backgrounds, establishing shots' },
];

export function StyleSettings() {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">AI Model Selection</h4>
        <p className="text-xs text-zinc-500 mb-3">Choose the Puter.js model for image generation. Selected via the Generate button on each panel.</p>
        <div className="space-y-2">
          {MODELS.map(m => (
            <div
              key={m.id}
              className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{m.icon}</span>
                <span className="text-sm font-bold text-white">{m.name}</span>
              </div>
              <p className="text-xs text-zinc-500">{m.desc}</p>
              <code className="text-xs text-zinc-600 font-mono block mt-1">{m.id}</code>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Style Options</h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl cursor-pointer">
            <div>
              <span className="text-sm text-white font-medium">B&W Manga Style</span>
              <p className="text-xs text-zinc-500">Always apply manga ink art style to prompts</p>
            </div>
            <div className="w-10 h-5 bg-violet-600 rounded-full relative">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
            </div>
          </label>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Quick Tips</h4>
        <div className="bg-zinc-800/50 rounded-xl p-3 text-xs text-zinc-400 space-y-2">
          <p>💡 Select a panel on the canvas, then use the ✨ Generate button</p>
          <p>💬 Add speech bubbles via the floating toolbar</p>
          <p>📐 Change page layouts in the Layout tab</p>
          <p>📤 Export your manga as PDF, PNG, or Webtoon format</p>
        </div>
      </div>
    </div>
  );
}
