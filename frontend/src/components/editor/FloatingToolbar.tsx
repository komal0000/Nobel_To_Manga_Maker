'use client';

import { useState } from 'react';
import { useMangaStore } from '@/lib/store';
import { useGenerate } from '@/hooks/useGenerate';
import { motion } from 'framer-motion';

interface FloatingToolbarProps {
  panelId: string;
  hasImage: boolean;
}

export function FloatingToolbar({ panelId, hasImage }: FloatingToolbarProps) {
  const { generatePanel, isGenerating } = useGenerate();
  const setPanelImage = useMangaStore(s => s.setPanelImage);
  const clearPanelImage = useMangaStore(s => s.clearPanelImage);
  const addBubble = useMangaStore(s => s.addBubble);
  const addSFX = useMangaStore(s => s.addSFX);
  const setGenerating = useMangaStore(s => s.setGenerating);

  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    const url = await generatePanel(prompt);
    if (url) {
      setPanelImage(panelId, url, prompt, 'google/gemini-2.5-flash-image');
    }
    setGenerating(false);
    setShowPrompt(false);
    setPrompt('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="floating-toolbar absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-xl z-30"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Generate button */}
      <button
        onClick={() => setShowPrompt(!showPrompt)}
        className="px-2.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-1"
        disabled={isGenerating}
      >
        {isGenerating ? '⏳' : '✨'} Generate
      </button>

      {/* Speech bubble */}
      <button
        onClick={() => addBubble(panelId, 'speech')}
        className="px-2.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 rounded-lg transition-colors"
        title="Add speech bubble"
      >
        💬
      </button>

      {/* SFX */}
      <button
        onClick={() => addSFX(panelId, 'BAM!')}
        className="px-2.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 rounded-lg transition-colors"
        title="Add SFX"
      >
        💥
      </button>

      {/* Delete image */}
      {hasImage && (
        <button
          onClick={() => clearPanelImage(panelId)}
          className="px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          title="Clear panel"
        >
          🗑️
        </button>
      )}

      {/* Prompt input */}
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-2xl min-w-[300px]"
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the panel scene..."
            className="w-full h-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowPrompt(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-500 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate ✨'}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
