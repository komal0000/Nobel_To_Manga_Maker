import { NextResponse } from 'next/server';

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'google/gemini-2.5-flash-image-preview';

interface GenerateImageBody {
  prompt?: string;
  model?: string;
  inputImage?: string;
  inputImageMimeType?: string;
}

function buildUserContent(body: GenerateImageBody) {
  const content: Array<Record<string, unknown>> = [
    {
      type: 'text',
      text: body.prompt,
    },
  ];

  if (body.inputImage) {
    content.push({
      type: 'image_url',
      image_url: {
        url: body.inputImage,
      },
    });
  }

  return content;
}

function extractImageUrl(payload: any): string | null {
  const imageUrl =
    payload?.choices?.[0]?.message?.images?.[0]?.image_url?.url ??
    payload?.choices?.[0]?.message?.images?.[0]?.imageUrl?.url ??
    payload?.images?.[0]?.image_url?.url ??
    payload?.images?.[0]?.url;

  return typeof imageUrl === 'string' && imageUrl.length > 0 ? imageUrl : null;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'Missing OPENROUTER_API_KEY. Add it to .env.local before generating images.',
      },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as GenerateImageBody;
  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  const baseUrl = (process.env.OPENROUTER_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  const model = body.model || process.env.OPENROUTER_IMAGE_MODEL || DEFAULT_MODEL;

  const upstreamPayload = {
    model,
    messages: [
      {
        role: 'user',
        content: buildUserContent(body),
      },
    ],
    modalities: ['image', 'text'],
    stream: false,
    image_config: {
      aspect_ratio: '3:4',
      image_size: '1K',
    },
  };

  try {
    const upstreamResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-OpenRouter-Title': process.env.OPENROUTER_SITE_NAME || 'MangaMaker AI',
      },
      body: JSON.stringify(upstreamPayload),
    });

    const payload = await upstreamResponse.json().catch(() => null);
    if (!upstreamResponse.ok) {
      const upstreamError =
        payload?.error?.message ||
        payload?.error ||
        payload?.message ||
        'OpenRouter request failed.';

      return NextResponse.json({ error: upstreamError }, { status: upstreamResponse.status });
    }

    const imageUrl = extractImageUrl(payload);
    if (!imageUrl) {
      return NextResponse.json(
        {
          error:
            'OpenRouter responded without an image. Use an image-capable model such as google/gemini-3.1-flash-image-preview. google/veo-3.1 is a video-oriented model, not a standard image-generation model.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ imageUrl, model });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected image generation error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
