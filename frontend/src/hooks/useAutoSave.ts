'use client';
/**
 * hooks/useAutoSave.ts
 * Debounced auto-save hook that persists project state to the Laravel backend every 30 seconds.
 */

import { useEffect, useRef } from 'react';
import { useMangaStore } from '@/lib/store';

export function useAutoSave(intervalMs: number = 30000) {
  const currentProject = useMangaStore(s => s.currentProject);
  const saveProject = useMangaStore(s => s.saveProject);
  const addToast = useMangaStore(s => s.addToast);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!currentProject) return;

    timerRef.current = setInterval(() => {
      void saveProject().then(() => {
        addToast('Project auto-saved', 'info');
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentProject, intervalMs, saveProject, addToast]);
}
