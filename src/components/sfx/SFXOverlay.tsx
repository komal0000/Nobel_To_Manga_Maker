'use client';

import { SFXItem } from '@/lib/types';
import { useMangaStore } from '@/lib/store';
import { useState, useRef, MouseEvent as ReactMouseEvent } from 'react';

interface SFXOverlayProps {
  panelId: string;
  sfxItems: SFXItem[];
}

export function SFXOverlay({ panelId, sfxItems }: SFXOverlayProps) {
  const updateSFX = useMangaStore(s => s.updateSFX);
  const deleteSFX = useMangaStore(s => s.deleteSFX);
  
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const startDrag = (e: ReactMouseEvent, id: string, currentPos: { x: number; y: number; width: number; height: number }) => {
    e.stopPropagation();
    setDraggedId(id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = currentPos.x;
    const startTop = currentPos.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      // Very basic % offset calculation
      const dx = (moveEvent.clientX - startX) / 10;
      const dy = (moveEvent.clientY - startY) / 10;
      
      updateSFX(id, {
        position: {
          ...currentPos,
          width: currentPos.width, // unchanged
          height: currentPos.height, // unchanged
          x: Math.max(0, Math.min(90, startLeft + dx)),
          y: Math.max(0, Math.min(90, startTop + dy))
        }
      });
    };

    const onMouseUp = () => {
      setDraggedId(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      {sfxItems.map(sfx => (
        <div
          key={sfx.id}
          onMouseDown={(e) => startDrag(e, sfx.id, sfx.position)}
          className={`absolute group z-20 ${draggedId === sfx.id ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            left: `${sfx.position.x}%`,
            top: `${sfx.position.y}%`,
            width: `${sfx.position.width}%`,
            height: `${sfx.position.height}%`,
            transform: `rotate(${sfx.rotation}deg) scale(${sfx.scale})`,
          }}
        >
          {/* Delete button (shows on hover) */}
          <button
            onClick={(e) => { e.stopPropagation(); deleteSFX(sfx.id); }}
            className="absolute -top-4 -right-4 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg hover:bg-red-600 z-30 transition-opacity pointer-events-auto"
          >
            ✕
          </button>

          <div className="w-full h-full flex items-center justify-center relative pointer-events-none">
            {/* The actual SVG style text rendering */}
            <span 
              className="relative sfx-text text-4xl whitespace-nowrap drop-shadow-lg"
              style={{
                WebkitTextStroke: `4px ${sfx.strokeColor}`, 
                paintOrder: 'stroke fill',
                color: sfx.color
              }}
            >
              {sfx.text}
            </span>
            <span 
              className="absolute inset-0 sfx-text flex items-center justify-center text-4xl whitespace-nowrap"
              style={{ color: sfx.color }}
            >
              {sfx.text}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
