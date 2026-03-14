'use client';

import { useState } from 'react';
import { useMangaStore } from '@/lib/store';
import { Panel } from '@/lib/types';
import { PanelSkeleton } from '@/components/ui/Skeleton';
import { FloatingToolbar } from './FloatingToolbar';
import { BubbleOverlay } from '@/components/bubbles/BubbleOverlay';
import { SFXOverlay } from '@/components/sfx/SFXOverlay';

interface PanelSlotProps {
  panel: Panel;
}

export function PanelSlot({ panel }: PanelSlotProps) {
  const selectedPanelId = useMangaStore(s => s.ui.selectedPanelId);
  const selectPanel = useMangaStore(s => s.selectPanel);
  const isGenerating = useMangaStore(s => s.ui.isGenerating);
  const isSelected = selectedPanelId === panel.id;

  return (
    <div
      className={`panel-slot absolute cursor-pointer overflow-hidden ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${panel.position.x}%`,
        top: `${panel.position.y}%`,
        width: `${panel.position.width}%`,
        height: `${panel.position.height}%`,
        border: `${panel.style.borderWidth}px solid ${panel.style.borderColor}`,
        borderRadius: `${panel.style.borderRadius}px`,
        backgroundColor: panel.style.backgroundColor,
      }}
      onClick={(e) => { e.stopPropagation(); selectPanel(panel.id); }}
    >
      {/* Image layer */}
      {isGenerating && isSelected && !panel.imageUrl ? (
        <PanelSkeleton />
      ) : panel.imageUrl ? (
        <img
          src={panel.imageUrl}
          alt={panel.prompt || 'Panel'}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300">
          <span className="text-4xl mb-2">🖼️</span>
          <span className="text-xs font-medium">Click to select</span>
          <span className="text-xs text-gray-400">then generate</span>
        </div>
      )}

      {/* Bubble overlays */}
      <BubbleOverlay panelId={panel.id} bubbles={panel.bubbles} />

      {/* SFX overlays */}
      <SFXOverlay panelId={panel.id} sfxItems={panel.sfxItems} />

      {/* Floating toolbar on selection */}
      {isSelected && <FloatingToolbar panelId={panel.id} hasImage={!!panel.imageUrl} />}
    </div>
  );
}
