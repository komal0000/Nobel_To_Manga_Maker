'use client';

import { useMangaStore } from '@/lib/store';
import { Bubble } from '@/lib/types';
import { BubbleEditor } from './BubbleEditor';

interface BubbleOverlayProps {
  panelId: string;
  bubbles: Bubble[];
}

export function BubbleOverlay({ panelId, bubbles }: BubbleOverlayProps) {
  const selectedBubbleId = useMangaStore(s => s.ui.selectedBubbleId);
  const selectBubble = useMangaStore(s => s.selectBubble);

  return (
    <>
      {/* SVG Filters for bubble styles (like thought clouds) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="cloud-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {bubbles.map(bubble => (
        <BubbleEditor
          key={bubble.id}
          bubble={bubble}
          isSelected={selectedBubbleId === bubble.id}
          onSelect={() => selectBubble(bubble.id)}
        />
      ))}
    </>
  );
}
