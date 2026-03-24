/** Core type definitions for the Manga Generator App */

export type BubbleType = 'speech' | 'thought' | 'narration' | 'shout';
export type Genre = 'action' | 'romance' | 'horror' | 'fantasy' | 'comedy';
export type StoryLength = 'short' | 'medium' | 'long';
export type ImageModel = 'google/gemini-2.5-flash-image-preview' | 'google/veo-3.1';

export type ExportFormat = 'pdf' | 'png' | 'webtoon';

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BubbleStyle {
  fontSize: number;
  fontFamily: string;
  tailDirection: 'left' | 'right' | 'bottom' | 'top' | 'none';
  rotation: number;
}

export interface PanelStyle {
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  backgroundColor: string;
}

export interface Bubble {
  id: string;
  panelId: string;
  type: BubbleType;
  content: string;
  position: Position;
  style: BubbleStyle;
}

export interface SFXItem {
  id: string;
  panelId: string;
  text: string;
  position: Position;
  rotation: number;
  scale: number;
  color: string;
  strokeColor: string;
}

export interface Panel {
  id: string;
  pageId: string;
  position: Position;
  imageUrl: string | null;
  prompt: string;
  modelUsed: ImageModel;
  style: PanelStyle;
  bubbles: Bubble[];
  sfxItems: SFXItem[];
  characterIds: string[];
}

export interface Page {
  id: string;
  projectId: string;
  pageNumber: number;
  layoutPreset: string;
  panels: Panel[];
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  traits: string[];
  appearance: string;
  outfit: string;
  portraitUrl: string | null;
}

export interface StoryScene {
  id: string;
  title: string;
  description: string;
  dialogue: string[];
  emotion: string;
  actionType: string;
}

export interface StoryOutline {
  title: string;
  genre: Genre;
  scenes: StoryScene[];
}

export interface Project {
  id: string;
  title: string;
  genre: Genre;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  pages: Page[];
  characters: Character[];
  storyOutline: StoryOutline | null;
}

export interface Asset {
  id: string;
  type: 'character' | 'background' | 'template' | 'panel';
  url: string;
  label: string;
  tags: string[];
}

/** Layout preset definition for panel arrangement */
export interface LayoutPreset {
  id: string;
  name: string;
  icon: string;
  panels: Position[];
}
