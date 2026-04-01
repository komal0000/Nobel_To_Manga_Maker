/**
 * lib/layouts.ts
 * Panel layout grid presets for the manga editor.
 * Each preset defines panel positions as percentages of the page canvas.
 */

import { LayoutPreset } from './types';

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'single',
    name: 'Full Page',
    icon: '▣',
    panels: [
      { x: 2, y: 2, width: 96, height: 96 },
    ],
  },
  {
    id: '2-vertical',
    name: '2 Panel Vertical',
    icon: '⬒',
    panels: [
      { x: 2, y: 2, width: 96, height: 47 },
      { x: 2, y: 51, width: 96, height: 47 },
    ],
  },
  {
    id: '2-horizontal',
    name: '2 Panel Horizontal',
    icon: '⬓',
    panels: [
      { x: 2, y: 2, width: 47, height: 96 },
      { x: 51, y: 2, width: 47, height: 96 },
    ],
  },
  {
    id: '3-panel',
    name: '3 Panel',
    icon: '⊞',
    panels: [
      { x: 2, y: 2, width: 96, height: 32 },
      { x: 2, y: 36, width: 47, height: 62 },
      { x: 51, y: 36, width: 47, height: 62 },
    ],
  },
  {
    id: '3-row',
    name: '3 Row',
    icon: '☰',
    panels: [
      { x: 2, y: 2, width: 96, height: 30 },
      { x: 2, y: 34, width: 96, height: 30 },
      { x: 2, y: 66, width: 96, height: 32 },
    ],
  },
  {
    id: '4-grid',
    name: '4 Panel Grid',
    icon: '⊞',
    panels: [
      { x: 2, y: 2, width: 47, height: 47 },
      { x: 51, y: 2, width: 47, height: 47 },
      { x: 2, y: 51, width: 47, height: 47 },
      { x: 51, y: 51, width: 47, height: 47 },
    ],
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: '🎬',
    panels: [
      { x: 2, y: 2, width: 96, height: 40 },
      { x: 2, y: 44, width: 30, height: 54 },
      { x: 34, y: 44, width: 30, height: 54 },
      { x: 66, y: 44, width: 32, height: 54 },
    ],
  },
  {
    id: 'manga-classic',
    name: 'Manga Classic',
    icon: '📖',
    panels: [
      { x: 2, y: 2, width: 47, height: 35 },
      { x: 51, y: 2, width: 47, height: 35 },
      { x: 2, y: 39, width: 96, height: 25 },
      { x: 2, y: 66, width: 32, height: 32 },
      { x: 36, y: 66, width: 30, height: 32 },
      { x: 68, y: 66, width: 30, height: 32 },
    ],
  },
  {
    id: 'action',
    name: 'Action Spread',
    icon: '💥',
    panels: [
      { x: 2, y: 2, width: 60, height: 55 },
      { x: 64, y: 2, width: 34, height: 25 },
      { x: 64, y: 29, width: 34, height: 28 },
      { x: 2, y: 59, width: 47, height: 39 },
      { x: 51, y: 59, width: 47, height: 39 },
    ],
  },
];

/**
 * Get a layout preset by ID
 */
export function getLayoutPreset(id: string): LayoutPreset | undefined {
  return LAYOUT_PRESETS.find(p => p.id === id);
}
