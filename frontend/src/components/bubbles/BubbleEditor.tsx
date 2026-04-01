'use client';

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { useMangaStore } from '@/lib/store';
import { Bubble } from '@/lib/types';

interface BubbleEditorProps {
  bubble: Bubble;
  isSelected: boolean;
  onSelect: () => void;
}

export function BubbleEditor({ bubble, isSelected, onSelect }: BubbleEditorProps) {
  const updateBubble = useMangaStore(s => s.updateBubble);
  const deleteBubble = useMangaStore(s => s.deleteBubble);
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: ReactMouseEvent) => {
    if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLButtonElement) return;
    
    e.stopPropagation();
    onSelect();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = bubble.position.x;
    const startTop = bubble.position.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      // In a real app, calculate % move based on parent rect.
      // For simplicity here relative offset approx
      const dx = (moveEvent.clientX - startX) / 10;
      const dy = (moveEvent.clientY - startY) / 10;
      
      updateBubble(bubble.id, {
        position: {
          ...bubble.position,
          x: Math.max(0, Math.min(100 - bubble.position.width, startLeft + dx)),
          y: Math.max(0, Math.min(100 - bubble.position.height, startTop + dy))
        }
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResize = (e: ReactMouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = bubble.position.width;
    const startH = bubble.position.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dw = (moveEvent.clientX - startX) / 10;
      const dh = (moveEvent.clientY - startY) / 10;
      
      updateBubble(bubble.id, {
        position: {
          ...bubble.position,
          width: Math.max(10, Math.min(90, startW + dw)),
          height: Math.max(5, Math.min(90, startH + dh))
        }
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={elementRef}
      onMouseDown={startDrag}
      className={`absolute flex flex-col items-center justify-center p-2 group ${isSelected ? 'z-20' : 'z-10'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${bubble.position.x}%`,
        top: `${bubble.position.y}%`,
        width: `${bubble.position.width}%`,
        height: `${bubble.position.height}%`,
        transform: `rotate(${bubble.style.rotation}deg)`,
      }}
    >
      <div 
        className={`w-full h-full p-3 flex items-center justify-center relative transition-shadow 
                   bubble-${bubble.type} ${isSelected ? 'ring-2 ring-violet-500 shadow-xl' : 'hover:ring-1 hover:ring-zinc-400/50'}`}
      >
        <textarea
          value={bubble.content}
          onChange={(e) => updateBubble(bubble.id, { content: e.target.value })}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="w-full h-full bg-transparent border-none outline-none resize-none text-center flex items-center justify-center m-0 p-0 overflow-hidden break-words"
          style={{ 
            fontSize: `${bubble.style.fontSize}px`, 
            fontFamily: bubble.style.fontFamily,
            lineHeight: 1.2,
          }}
          spellCheck={false}
        />

        {isSelected && (
          <>
            {/* Delete button inline */}
            <button
              onClick={(e) => { e.stopPropagation(); deleteBubble(bubble.id); }}
              className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 text-xs z-30"
            >
              ✕
            </button>
            
            {/* Resize handle */}
            <div 
              onMouseDown={startResize}
              className="absolute bottom-0 right-0 w-4 h-4 bg-violet-500 rounded-tl-lg rounded-br-full cursor-nwse-resize hover:bg-violet-400 z-30"
            />
          </>
        )}
        
        {/* Simple tail representation for speech class */}
        {bubble.type === 'speech' && bubble.style.tailDirection !== 'none' && (
          <div 
            className="absolute bg-white border-black" 
            style={{
              width: 15, height: 15,
              borderBottom: '2px solid black', borderRight: '2px solid black',
              transform: 'rotate(45deg)',
              background: 'white', zIndex: -1,
              ...(bubble.style.tailDirection === 'bottom' ? { bottom: -7, left: 'calc(50% - 7px)' } :
                  bubble.style.tailDirection === 'left' ? { left: -7, top: 'calc(50% - 7px)' } :
                  bubble.style.tailDirection === 'right' ? { right: -7, top: 'calc(50% - 7px)' } :
                  { top: -7, left: 'calc(50% - 7px)' })
            }}
          />
        )}
      </div>
    </div>
  );
}
