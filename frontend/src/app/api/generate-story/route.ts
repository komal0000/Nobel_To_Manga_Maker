import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const STORY_MODEL = 'qwen/qwen3.6-plus-preview:free';

interface GenerateStoryBody {
  premise?: string;
  genre?: string;
  title?: string;
  sceneCount?: number;
  chapterTitle?: string;
  chapterText?: string;
  consistencyNotes?: string;
  sourceType?: 'premise' | 'pdf';
  existingScenes?: Array<{
    title?: string;
    description?: string;
    emotion?: string;
    actionType?: string;
  }>;
}

interface StorySceneRaw {
  title: string;
  description: string;
  dialogue: string[];
  emotion: string;
  actionType: string;
}

function clampSceneCount(sceneCount?: number): number {
  return Math.min(Math.max(sceneCount || 5, 2), 10);
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function sanitizePdfText(text: string): string {
  const lines = text
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => {
      if (!line) return false;
      if (/^\d+$/.test(line)) return false;
      if (/^page\s+\d+/i.test(line)) return false;
      return true;
    });

  return lines.join('\n').trim();
}

function buildExistingSceneContext(body: GenerateStoryBody): string {
  if (!Array.isArray(body.existingScenes) || body.existingScenes.length === 0) {
    return 'No previous scenes exist yet.';
  }

  const summary = body.existingScenes
    .slice(-5)
    .map((scene, idx) => {
      const sceneTitle = scene.title || `Scene ${idx + 1}`;
      const sceneDescription = normalizeText(scene.description || '').slice(0, 180);
      const emotion = scene.emotion || 'neutral';
      const actionType = scene.actionType || 'establishing';
      return `${idx + 1}. ${sceneTitle} | ${emotion}/${actionType} | ${sceneDescription}`;
    })
    .join('\n');

  return `Most recent existing scenes (continue naturally from these):\n${summary}`;
}

function buildStoryPrompt(body: GenerateStoryBody): string {
  const count = clampSceneCount(body.sceneCount);
  const sourceMode = body.sourceType === 'pdf' ? 'chapter_pdf' : 'premise';
  const chapterTitle = body.chapterTitle?.trim() || 'Untitled Chapter';
  const chapterText = normalizeText(body.chapterText || '').slice(0, 24000);
  const premise = body.premise?.trim() || 'A hero embarks on an adventure.';
  const consistencyNotes = body.consistencyNotes?.trim();

  const storySource =
    sourceMode === 'chapter_pdf'
      ? `- Source Type: chapter_pdf\n- Chapter Title: ${chapterTitle}\n- Chapter Text:\n"""${chapterText}"""`
      : `- Source Type: premise\n- Premise: ${premise}`;

  const consistencyBlock = consistencyNotes
    ? `Additional consistency constraints from user:\n- ${consistencyNotes}`
    : 'Additional consistency constraints from user:\n- Keep names, appearance, personality, and chronology consistent across all scenes.';

  return `You are a manga story writer. Generate a structured manga story outline.

Story details:
- Title: ${body.title || 'Untitled'}
- Genre: ${body.genre || 'action'}
${storySource}

${buildExistingSceneContext(body)}

Consistency rules:
- Keep the same named characters consistent in behavior, role, and appearance details.
- Preserve cause-and-effect continuity from one scene to the next.
- Avoid contradictions in setting, power level, injuries, or timeline.
- Make each scene distinct but narratively connected.
${consistencyBlock}

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

function parseExistingScenes(raw: string): GenerateStoryBody['existingScenes'] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;

    return parsed.map((scene: unknown) => {
      const record = scene as Record<string, unknown>;
      return {
        title: typeof record.title === 'string' ? record.title : undefined,
        description: typeof record.description === 'string' ? record.description : undefined,
        emotion: typeof record.emotion === 'string' ? record.emotion : undefined,
        actionType: typeof record.actionType === 'string' ? record.actionType : undefined,
      };
    });
  } catch {
    return undefined;
  }
}

async function extractTextFromPdfFile(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdfModule = (await import('pdf-parse')) as {
    PDFParse?: new (options: { data: Uint8Array }) => {
      getText: () => Promise<{ text?: string }>;
      destroy: () => Promise<void>;
    };
    default?: (buffer: Uint8Array | Buffer) => Promise<{ text?: string }>;
  };

  if (typeof pdfModule.PDFParse === 'function') {
    const parser = new pdfModule.PDFParse({ data });
    try {
      const textResult = await parser.getText();
      return sanitizePdfText(textResult.text || '');
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  if (typeof pdfModule.default === 'function') {
    const result = await pdfModule.default(Buffer.from(data));
    return sanitizePdfText(result?.text || '');
  }

  throw new Error('Unsupported pdf-parse API shape in current environment.');
}

async function parseRequestBody(request: Request): Promise<GenerateStoryBody> {
  const contentType = request.headers.get('content-type') || '';

  if (!contentType.includes('multipart/form-data')) {
    return (await request.json().catch(() => ({}))) as GenerateStoryBody;
  }

  const form = await request.formData();
  const sceneCountRaw = form.get('sceneCount');
  const existingScenesRaw = form.get('existingScenes');

  const body: GenerateStoryBody = {
    sourceType: 'pdf',
    title: typeof form.get('title') === 'string' ? (form.get('title') as string) : undefined,
    genre: typeof form.get('genre') === 'string' ? (form.get('genre') as string) : undefined,
    chapterTitle: typeof form.get('chapterTitle') === 'string' ? (form.get('chapterTitle') as string) : undefined,
    consistencyNotes:
      typeof form.get('consistencyNotes') === 'string' ? (form.get('consistencyNotes') as string) : undefined,
    sceneCount:
      typeof sceneCountRaw === 'string' && sceneCountRaw.trim() ? Number(sceneCountRaw) : undefined,
    existingScenes:
      typeof existingScenesRaw === 'string' ? parseExistingScenes(existingScenesRaw) : undefined,
  };

  const file = form.get('chapterPdf');
  if (!(file instanceof File)) {
    throw new Error('Chapter PDF file is required.');
  }

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new Error('Only PDF files are supported for chapter upload.');
  }

  body.chapterText = await extractTextFromPdfFile(file);

  return body;
}

function extractRawText(payload: unknown): string {
  const messageContent = (payload as { choices?: Array<{ message?: { content?: unknown } }> })
    ?.choices?.[0]?.message?.content;

  if (typeof messageContent === 'string') {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .filter(
        (part): part is { type?: string; text?: string } =>
          typeof part === 'object' && part !== null && 'type' in part
      )
      .filter(part => part.type === 'text' && typeof part.text === 'string')
      .map(part => part.text as string)
      .join('\n');
  }

  return '';
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
  let body: GenerateStoryBody;
  try {
    body = await parseRequestBody(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request payload.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const sourceType = body.sourceType === 'pdf' ? 'pdf' : 'premise';

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OPENROUTER_API_KEY. Add it to .env.local before generating stories.' },
      { status: 500 }
    );
  }

  if (sourceType === 'pdf' && !body.chapterText) {
    return NextResponse.json({ error: 'Could not extract text from the uploaded PDF.' }, { status: 400 });
  }

  if (sourceType === 'pdf' && (body.chapterText?.length || 0) < 40) {
    return NextResponse.json(
      {
        error:
          'Extracted text is too short. This PDF may be image/scanned-only. Please run OCR first or upload a text-based PDF chapter.',
      },
      { status: 422 }
    );
  }

  if (sourceType === 'premise' && !body.premise?.trim()) {
    return NextResponse.json({ error: 'Premise is required.' }, { status: 400 });
  }

  const baseUrl = (process.env.OPENROUTER_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  const model = STORY_MODEL;

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

    const rawText = extractRawText(payload);

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

    return NextResponse.json({ scenes, model, sourceType });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected story generation error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
