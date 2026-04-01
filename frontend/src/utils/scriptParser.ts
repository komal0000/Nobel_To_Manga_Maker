export interface TextElement {
  type: 'narration' | 'dialogue' | 'thought' | 'sound';
  character?: string;
  text: string;
}

export interface PanelConfig {
  panelNumber: number;
  scenePrompt: string;
  texts: TextElement[];
}

export interface PageConfig {
  pageNumber: number;
  panels: PanelConfig[];
}

export interface ChapterConfig {
  novelTitle: string;
  chapterTitle: string;
  pages: PageConfig[];
}
/**
 * Parses a raw novel chapter script into a structured JSON representation 
 * containing pages, panels, texts, and scene prompts.
 * 
 * @param script The raw text script for the chapter (e.g. from NovelBin)
 * @returns A fully structured ChapterConfig object
 * 
 * @example
 * const script = "Page 1\\nPanel 1\\nScene Prompt\\nMassive battlefield...\\nNarration\\nTens of thousands stood...";
 * const chapter = parseChapterScript(script);
 * console.log(chapter.pages[0].panels[0].scenePrompt);
 */
export function parseChapterScript(script: string): ChapterConfig {
  const chapter: ChapterConfig = {
    novelTitle: '',
    chapterTitle: '',
    pages: [],
  };

  const blocks = script
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b);

  let currentPage: PageConfig | null = null;
  let currentPanel: PanelConfig | null = null;

  let parsedTitle = false;
  let parsedChapter = false;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.toLowerCase().startsWith('end of chapter')) {
      break;
    }

    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l);

    if (!parsedTitle) {
      chapter.novelTitle = lines[0];
      parsedTitle = true;
      if (lines.length > 1) {
        chapter.chapterTitle = lines[1];
        parsedChapter = true;
        lines.splice(0, 2);
      } else {
        continue;
      }
    } else if (!parsedChapter && !lines[0].match(/^Page\s+\d+/i)) {
      chapter.chapterTitle = lines[0];
      parsedChapter = true;
      if (lines.length > 1) {
        lines.splice(0, 1);
      } else {
        continue;
      }
    }

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];

      const pageMatch = line.match(/^Page\s+(\d+)/i);
      if (pageMatch) {
        currentPage = {
          pageNumber: parseInt(pageMatch[1], 10),
          panels: [],
        };
        chapter.pages.push(currentPage);
        continue;
      }

      const panelMatch = line.match(/^Panel\s+(\d+)/i);
      if (panelMatch) {
        currentPanel = {
          panelNumber: parseInt(panelMatch[1], 10),
          scenePrompt: '',
          texts: [],
        };
        if (currentPage) currentPage.panels.push(currentPanel);
        continue;
      }

      if (line.toLowerCase() === 'scene prompt') {
        if (j + 1 < lines.length) {
          currentPanel!.scenePrompt = lines.slice(j + 1).join('\n');
          break;
        } else if (i + 1 < blocks.length) {
          currentPanel!.scenePrompt = blocks[i + 1];
          i++;
          break;
        }
      }

      // Must be a speaker / text block
      const speaker = line;
      let text = '';

      if (j + 1 < lines.length) {
        text = lines.slice(j + 1).join('\n');
        j = lines.length;
      } else if (
        i + 1 < blocks.length &&
        !blocks[i + 1].match(/^(Page|Panel)\s+\d+/i) &&
        !blocks[i + 1].toLowerCase().startsWith('scene prompt')
      ) {
        text = blocks[i + 1];
        i++;
      }

      if (currentPanel) {
        let type: TextElement['type'] = 'dialogue';
        const speakerLower = speaker.toLowerCase();
        if (speakerLower.includes('narration')) type = 'narration';
        else if (speakerLower.includes('thought')) type = 'thought';

        currentPanel.texts.push({
          type,
          character: speaker.replace(/\(.*?\)/g, '').trim(),
          text: text.trim(),
        });
      }
    }
  }

  return chapter;
}
