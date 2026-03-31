import { NextResponse } from 'next/server';

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const STORY_MODEL = 'google/gemini-2.5-flash-image';

interface GenerateStoryBody {
  premise?: string;
  genre?: string;
  title?: string;
  sceneCount?: number;
}

interface StorySceneRaw {
  title: string;
  description: string;
  dialogue: string[];
  emotion: string;
  actionType: string;
}

function buildStoryPrompt(body: GenerateStoryBody): string {
  const count = Math.min(Math.max(body.sceneCount || 5, 2), 10);
  return `You are a manga story writer. Generate a structured manga story outline.

Story details:
- Title: ${body.title || 'Untitled'}
- Genre: ${body.genre || 'action'}
- Premise: ${body.premise || 'A hero embarks on an adventure'}

Return ONLY valid JSON — no markdown, no explanation. Use this exact shape:
{
  "scenes": [
    {
      "title": "Scene title (short)",
      "description": "Visual description for the manga panel image prompt (2-3 sentences, cinematic)",
      "dialogue": ["Character A: line", "Character B: line"],
      "emotion": "dominant emotion (e.g. tense, joyful, mysterious)",
      "actionType": "panel action type (e.g. establishing, closeup, action, dialogue, reaction)"
    }
  ]
}

Generate exactly ${count} scenes. Make each description vivid and suitable as an image generation prompt for a manga panel.`;
}

function parseScenes(text: string): StorySceneRaw[] | null {
  try {
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) return null;

    const jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed?.scenes)) return null;

    return parsed.scenes.map((s: Partial<StorySceneRaw>) => ({
      title: typeof s.title === 'string' ? s.title : 'Scene',
      description: typeof s.description === 'string' ? s.description : '',
      dialogue: Array.isArray(s.dialogue) ? s.dialogue.filter((d): d is string => typeof d === 'string') : [],
      emotion: typeof s.emotion === 'string' ? s.emotion : 'neutral',
      actionType: typeof s.actionType === 'string' ? s.actionType : 'establishing',
    }));
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OPENROUTER_API_KEY. Add it to .env.local before generating stories.' },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as GenerateStoryBody;
  if (!body.premise?.trim()) {
    return NextResponse.json({ error: 'Premise is required.' }, { status: 400 });
  }

  const baseUrl = (process.env.OPENROUTER_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  const model = process.env.OPENROUTER_STORY_MODEL || STORY_MODEL;

  const upstreamPayload = {
    model,
    messages: [
      {
        role: 'user',
        content: buildStoryPrompt(body),
      },
    ],
    modalities: ['text'],
    stream: false,
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

    const rawText: string =
      payload?.choices?.[0]?.message?.content ||
      (Array.isArray(payload?.choices?.[0]?.message?.content)
        ? payload.choices[0].message.content
            .filter((c: { type: string }) => c.type === 'text')
            .map((c: { text: string }) => c.text)
            .join('\n')
        : '');

    if (!rawText) {
      return NextResponse.json({ error: 'Model returned no text content.' }, { status: 502 });
    }

    const scenes = parseScenes(rawText);
    if (!scenes || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Could not parse story scenes from model response.', raw: rawText },
        { status: 502 }
      );
    }

    return NextResponse.json({ scenes, model });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected story generation error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
