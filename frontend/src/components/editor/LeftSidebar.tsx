'use client';

import { useState } from 'react';
import { useMangaStore } from '@/lib/store';
import { StoryGenerator } from '@/components/story/StoryGenerator';
import { CharacterCreator } from '@/components/character/CharacterCreator';
import { BackgroundGenerator } from '@/components/editor/BackgroundGenerator';
import { SFXLibrary } from '@/components/sfx/SFXLibrary';
import { LayoutPicker } from '@/components/editor/LayoutPicker';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'story' as const, label: 'Story', icon: '📝' },
  { id: 'character' as const, label: 'Chars', icon: '👤' },
  { id: 'background' as const, label: 'BGs', icon: '🏞️' },
  { id: 'sfx' as const, label: 'SFX', icon: '💥' },
  { id: 'assets' as const, label: 'Layout', icon: '📐' },
];

export function LeftSidebar() {
  const activeTab = useMangaStore(s => s.ui.activeTab);
  const setActiveTab = useMangaStore(s => s.setActiveTab);

  return (
    <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-zinc-800 p-1 gap-0.5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'tab-active'
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'story' && <StoryGenerator />}
          {activeTab === 'character' && <CharacterCreator />}
          {activeTab === 'background' && <BackgroundGenerator />}
          {activeTab === 'sfx' && <SFXLibrary />}
          {activeTab === 'assets' && <LayoutPicker />}
        </motion.div>
      </div>
    </div>
  );
}
