'use client';
/**
 * hooks/useGenerate.ts
 * Wraps image generation with loading state, error handling, and toast notifications.
 */

import { useState, useCallback } from 'react';
import { generateMangaPanel, generateCharacterPortrait, generateBackground, generatePanelVariation } from '@/lib/imageGen';
import { useMangaStore } from '@/lib/store';
import { ImageModel } from '@/lib/types';

export function useGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addToast = useMangaStore(s => s.addToast);

  const generatePanel = useCallback(async (prompt: string, model?: ImageModel) => {
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateMangaPanel(prompt, model);
      addToast('Panel generated successfully!', 'success');
      return url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
      addToast(`Generation failed: ${msg}`, 'error');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [addToast]);

  const generatePortrait = useCallback(async (description: string, model?: ImageModel) => {
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateCharacterPortrait(description, model);
      addToast('Portrait generated!', 'success');
      return url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
      addToast(`Portrait generation failed: ${msg}`, 'error');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [addToast]);

  const generateBg = useCallback(async (scene: string, model?: ImageModel) => {
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateBackground(scene, model);
      addToast('Background generated!', 'success');
      return url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
      addToast(`Background generation failed: ${msg}`, 'error');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [addToast]);

  const generateVariation = useCallback(async (prompt: string, base64: string, mime?: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generatePanelVariation(prompt, base64, mime);
      addToast('Variation generated!', 'success');
      return url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
      addToast(`Variation generation failed: ${msg}`, 'error');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [addToast]);

  return {
    isGenerating,
    error,
    generatePanel,
    generatePortrait,
    generateBg,
    generateVariation,
  };
}
