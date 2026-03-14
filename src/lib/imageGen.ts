/**
 * lib/imageGen.ts
 * Single file wrapping all Puter.js image generation calls.
 * Swap model or provider here without touching the rest of the app.
 */

import { ImageModel } from './types';

/** Declare the global puter object injected via CDN script */
declare global {
  interface Window {
    puter: {
      ai: {
        txt2img: (
          prompt: string,
          options?: {
            model?: string;
            input_image?: string;
            input_image_mime_type?: string;
          }
        ) => Promise<HTMLImageElement>;
      };
    };
  }
}

/**
 * Generate a manga-style panel image using Puter.js txt2img.
 * Appends manga-specific style suffixes to ensure consistent B&W ink art output.
 */
export async function generateMangaPanel(
  prompt: string,
  model: ImageModel = 'gemini-3.1-flash-image-preview'
): Promise<HTMLImageElement> {
  const mangaPrompt = `${prompt}, manga style, black and white, ink line art, screen tones, dynamic composition, anime comic panel`;
  const negativeHint = `no color, no photorealism, no 3d render, no watermark`;

  return await window.puter.ai.txt2img(`${mangaPrompt}. Avoid: ${negativeHint}`, { model });
}

/**
 * Generate a character portrait with the Pro model for best quality and consistency.
 */
export async function generateCharacterPortrait(
  characterDescription: string,
  model: ImageModel = 'gemini-3-pro-image-preview'
): Promise<HTMLImageElement> {
  const prompt = `Manga character portrait: ${characterDescription}, black and white, ink style, clean linework, expressive face, bust shot`;
  return await window.puter.ai.txt2img(prompt, { model });
}

/**
 * Generate a background/environment scene without characters.
 */
export async function generateBackground(
  scene: string,
  model: ImageModel = 'gemini-3.1-flash-image-preview'
): Promise<HTMLImageElement> {
  const prompt = `Manga background: ${scene}, detailed environment, black and white ink, perspective lines, no characters`;
  return await window.puter.ai.txt2img(prompt, { model });
}

/**
 * Generate a variation of an existing panel using image-to-image.
 */
export async function generatePanelVariation(
  prompt: string,
  baseImageBase64: string,
  mimeType: string = 'image/png'
): Promise<HTMLImageElement> {
  return await window.puter.ai.txt2img(prompt, {
    model: 'gemini-2.5-flash-image-preview',
    input_image: baseImageBase64,
    input_image_mime_type: mimeType,
  });
}

/**
 * Extract displayable URL from a Puter.js HTMLImageElement.
 * Returns the src which is typically a data URL or blob URL.
 */
export function puterImageToUrl(imgEl: HTMLImageElement): string {
  return imgEl.src;
}

/**
 * Convert an HTMLImageElement to a base64 data URL via canvas.
 */
export function imageToBase64(imgEl: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = imgEl.naturalWidth || imgEl.width;
  canvas.height = imgEl.naturalHeight || imgEl.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imgEl, 0, 0);
  return canvas.toDataURL('image/png');
}
