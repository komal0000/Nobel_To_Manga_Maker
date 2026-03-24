/**
 * lib/imageGen.ts
 * Single file wrapping all image generation calls.
 * The client talks to a server route so provider secrets stay off the browser.
 */

import { ImageModel } from './types';

interface GenerateImageRequest {
  prompt: string;
  model?: ImageModel;
  inputImage?: string;
  inputImageMimeType?: string;
}

async function requestGeneratedImage({
  prompt,
  model = 'google/gemini-2.5-flash-image-preview',
  inputImage,
  inputImageMimeType,
}: GenerateImageRequest): Promise<string> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model,
      inputImage,
      inputImageMimeType,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || 'Image generation failed');
  }
  if (!payload?.imageUrl) {
    throw new Error('Image generation did not return an image');
  }

  return payload.imageUrl;
}

/**
 * Generate a manga-style panel image.
 * Appends manga-specific style suffixes to ensure consistent B&W ink art output.
 */
export async function generateMangaPanel(
  prompt: string,
  model: ImageModel = 'google/gemini-3.1-flash-image-preview'
): Promise<string> {
  const mangaPrompt = `${prompt}, manga style, black and white, ink line art, screen tones, dynamic composition, anime comic panel`;
  const negativeHint = 'no color, no photorealism, no 3d render, no watermark';

  return requestGeneratedImage({
    prompt: `${mangaPrompt}. Avoid: ${negativeHint}`,
    model,
  });
}

/**
 * Generate a character portrait.
 */
export async function generateCharacterPortrait(
  characterDescription: string,
  model: ImageModel = 'google/gemini-3.1-flash-image-preview'
): Promise<string> {
  const prompt = `Manga character portrait: ${characterDescription}, black and white, ink style, clean linework, expressive face, bust shot`;
  return requestGeneratedImage({ prompt, model });
}

/**
 * Generate a background/environment scene without characters.
 */
export async function generateBackground(
  scene: string,
  model: ImageModel = 'google/gemini-3.1-flash-image-preview'
): Promise<string> {
  const prompt = `Manga background: ${scene}, detailed environment, black and white ink, perspective lines, no characters`;
  return requestGeneratedImage({ prompt, model });
}

/**
 * Generate a variation of an existing panel using image-to-image.
 */
export async function generatePanelVariation(
  prompt: string,
  baseImageBase64: string,
  mimeType: string = 'image/png'
): Promise<string> {
  return requestGeneratedImage({
    prompt,
    model: 'google/gemini-3.1-flash-image-preview',
    inputImage: baseImageBase64,
    inputImageMimeType: mimeType,
  });
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
