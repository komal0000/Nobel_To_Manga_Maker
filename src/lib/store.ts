/**
 * lib/store.ts
 * Zustand store for global project state.
 * Uses localStorage persistence (Supabase-ready via TODO markers).
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Project, Page, Panel, Character, Bubble, SFXItem,
  Genre, ImageModel, BubbleType, Position, LayoutPreset, StoryOutline
} from './types';
import { LAYOUT_PRESETS } from './layouts';

// ─── UI State ────────────────────────────────────────────
interface UIState {
  activeTab: 'story' | 'character' | 'background' | 'sfx' | 'assets';
  selectedPanelId: string | null;
  selectedPageId: string | null;
  selectedBubbleId: string | null;
  isGenerating: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  showExportModal: boolean;
  toasts: Toast[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ─── Store Interface ─────────────────────────────────────
interface MangaStore {
  // Data
  projects: Project[];
  currentProject: Project | null;

  // UI
  ui: UIState;

  // Project CRUD
  createProject: (title: string, genre: Genre) => string;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  updateProjectTitle: (title: string) => void;
  updateStoryOutline: (outline: StoryOutline | null) => void;
  duplicateProject: (id: string) => string;

  // Page management
  addPage: (layoutPresetId?: string) => string;
  removePage: (pageId: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  setPageLayout: (pageId: string, preset: LayoutPreset) => void;

  // Panel management
  updatePanel: (panelId: string, updates: Partial<Panel>) => void;
  setPanelImage: (panelId: string, imageUrl: string, prompt: string, model: ImageModel) => void;
  clearPanelImage: (panelId: string) => void;

  // Character management
  addCharacter: (name: string, appearance: string, traits: string[], outfit: string) => string;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  setCharacterPortrait: (id: string, url: string) => void;

  // Bubble management
  addBubble: (panelId: string, type: BubbleType) => string;
  updateBubble: (id: string, updates: Partial<Bubble>) => void;
  deleteBubble: (id: string) => void;

  // SFX management
  addSFX: (panelId: string, text: string) => string;
  updateSFX: (id: string, updates: Partial<SFXItem>) => void;
  deleteSFX: (id: string) => void;

  // UI actions
  setActiveTab: (tab: UIState['activeTab']) => void;
  selectPanel: (id: string | null) => void;
  selectPage: (id: string | null) => void;
  selectBubble: (id: string | null) => void;
  setGenerating: (v: boolean) => void;
  setSaving: (v: boolean) => void;
  setShowExportModal: (v: boolean) => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Persistence
  saveToLocal: () => void;
  loadFromLocal: () => void;
}

/** Create panels from a layout preset */
function createPanelsFromPreset(pageId: string, preset: LayoutPreset): Panel[] {
  return preset.panels.map(pos => ({
    id: uuidv4(),
    pageId,
    position: { ...pos },
    imageUrl: null,
    prompt: '',
    modelUsed: 'google/gemini-2.5-flash-image' as ImageModel,
    style: { borderWidth: 2, borderColor: '#000000', borderRadius: 0, backgroundColor: '#ffffff' },
    bubbles: [],
    sfxItems: [],
    characterIds: [],
  }));
}

export const useMangaStore = create<MangaStore>((set, get) => ({
  projects: [],
  currentProject: null,

  ui: {
    activeTab: 'story',
    selectedPanelId: null,
    selectedPageId: null,
    selectedBubbleId: null,
    isGenerating: false,
    isSaving: false,
    lastSaved: null,
    showExportModal: false,
    toasts: [],
  },

  // ─── Project CRUD ──────────────────────────────────────
  createProject: (title, genre) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const firstPageId = uuidv4();
    const defaultPreset = LAYOUT_PRESETS.find(p => p.id === '3-panel') || LAYOUT_PRESETS[0];

    const project: Project = {
      id,
      title,
      genre,
      thumbnailUrl: null,
      createdAt: now,
      updatedAt: now,
      pages: [{
        id: firstPageId,
        projectId: id,
        pageNumber: 1,
        layoutPreset: defaultPreset.id,
        panels: createPanelsFromPreset(firstPageId, defaultPreset),
      }],
      characters: [],
      storyOutline: null,
    };

    set(state => ({ projects: [...state.projects, project] }));
    get().saveToLocal();
    return id;
  },

  loadProject: (id) => {
    const project = get().projects.find(p => p.id === id);
    if (project) {
      set(state => ({
        currentProject: project,
        ui: { ...state.ui, selectedPageId: project.pages[0]?.id || null, selectedPanelId: null },
      }));
    }
  },

  deleteProject: (id) => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
    get().saveToLocal();
  },

  updateProjectTitle: (title) => {
    set(state => {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, title, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  updateStoryOutline: (outline) => {
    set(state => {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, storyOutline: outline, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  duplicateProject: (id) => {
    const source = get().projects.find(p => p.id === id);
    if (!source) return '';
    const newId = uuidv4();
    const dup: Project = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      title: `${source.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set(state => ({ projects: [...state.projects, dup] }));
    get().saveToLocal();
    return newId;
  },

  // ─── Page Management ──────────────────────────────────
  addPage: (layoutPresetId) => {
    const project = get().currentProject;
    if (!project) return '';
    const pageId = uuidv4();
    const preset = LAYOUT_PRESETS.find(p => p.id === (layoutPresetId || '3-panel')) || LAYOUT_PRESETS[0];

    const page: Page = {
      id: pageId,
      projectId: project.id,
      pageNumber: project.pages.length + 1,
      layoutPreset: preset.id,
      panels: createPanelsFromPreset(pageId, preset),
    };

    set(state => {
      if (!state.currentProject) return state;
      const updated = {
        ...state.currentProject,
        pages: [...state.currentProject.pages, page],
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
    return pageId;
  },

  removePage: (pageId) => {
    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages.filter(p => p.id !== pageId)
        .map((p, i) => ({ ...p, pageNumber: i + 1 }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
        ui: {
          ...state.ui,
          selectedPageId: state.ui.selectedPageId === pageId ? (pages[0]?.id || null) : state.ui.selectedPageId,
        },
      };
    });
  },

  reorderPages: (fromIndex, toIndex) => {
    set(state => {
      if (!state.currentProject) return state;
      const pages = [...state.currentProject.pages];
      const [moved] = pages.splice(fromIndex, 1);
      pages.splice(toIndex, 0, moved);
      const renum = pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      const updated = { ...state.currentProject, pages: renum, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  setPageLayout: (pageId, preset) => {
    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages.map(page => {
        if (page.id !== pageId) return page;
        return { ...page, layoutPreset: preset.id, panels: createPanelsFromPreset(pageId, preset) };
      });
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  // ─── Panel Management ─────────────────────────────────
  updatePanel: (panelId, updates) => {
    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages.map(page => ({
        ...page,
        panels: page.panels.map(panel =>
          panel.id === panelId ? { ...panel, ...updates } : panel
        ),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  setPanelImage: (panelId, imageUrl, prompt, model) => {
    get().updatePanel(panelId, { imageUrl, prompt, modelUsed: model });
  },

  clearPanelImage: (panelId) => {
    get().updatePanel(panelId, { imageUrl: null, prompt: '' });
  },

  // ─── Character Management ─────────────────────────────
  addCharacter: (name, appearance, traits, outfit) => {
    const project = get().currentProject;
    if (!project) return '';
    const id = uuidv4();
    const character: Character = {
      id,
      projectId: project.id,
      name,
      traits,
      appearance,
      outfit,
      portraitUrl: null,
    };
    set(state => {
      if (!state.currentProject) return state;
      const updated = {
        ...state.currentProject,
        characters: [...state.currentProject.characters, character],
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
    return id;
  },

  updateCharacter: (id, updates) => {
    set(state => {
      if (!state.currentProject) return state;
      const characters = state.currentProject.characters.map(c =>
        c.id === id ? { ...c, ...updates } : c
      );
      const updated = { ...state.currentProject, characters, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  deleteCharacter: (id) => {
    set(state => {
      if (!state.currentProject) return state;
      const characters = state.currentProject.characters.filter(c => c.id !== id);
      const updated = { ...state.currentProject, characters, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  setCharacterPortrait: (id, url) => {
    get().updateCharacter(id, { portraitUrl: url });
  },

  // ─── Bubble Management ────────────────────────────────
  addBubble: (panelId, type) => {
    const id = uuidv4();
    const bubble: Bubble = {
      id,
      panelId,
      type,
      content: type === 'narration' ? 'Narration text...' : 'Dialogue...',
      position: { x: 10, y: 10, width: 30, height: 15 },
      style: { fontSize: 14, fontFamily: "'Bangers', cursive", tailDirection: type === 'narration' ? 'none' : 'bottom', rotation: 0 },
    };

    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages.map(page => ({
        ...page,
        panels: page.panels.map(panel =>
          panel.id === panelId ? { ...panel, bubbles: [...panel.bubbles, bubble] } : panel
        ),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
    return id;
  },

  updateBubble: (id, updates) => {
    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages.map(page => ({
        ...page,
        panels: page.panels.map(panel => ({
          ...panel,
          bubbles: panel.bubbles.map(b => b.id === id ? { ...b, ...updates } : b),
        })),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  deleteBubble: (id) => {
    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages.map(page => ({
        ...page,
        panels: page.panels.map(panel => ({
          ...panel,
          bubbles: panel.bubbles.filter(b => b.id !== id),
        })),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  // ─── SFX Management ───────────────────────────────────
  addSFX: (panelId, text) => {
    const id = uuidv4();
    const sfx: SFXItem = {
      id,
      panelId,
      text,
      position: { x: 20, y: 20, width: 25, height: 10 },
      rotation: -15,
      scale: 1,
      color: '#ffffff',
      strokeColor: '#000000',
    };

    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages.map(page => ({
        ...page,
        panels: page.panels.map(panel =>
          panel.id === panelId ? { ...panel, sfxItems: [...panel.sfxItems, sfx] } : panel
        ),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
    return id;
  },

  updateSFX: (id, updates) => {
    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages.map(page => ({
        ...page,
        panels: page.panels.map(panel => ({
          ...panel,
          sfxItems: panel.sfxItems.map(s => s.id === id ? { ...s, ...updates } : s),
        })),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  deleteSFX: (id) => {
    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages.map(page => ({
        ...page,
        panels: page.panels.map(panel => ({
          ...panel,
          sfxItems: panel.sfxItems.filter(s => s.id !== id),
        })),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(p => p.id === updated.id ? updated : p),
      };
    });
  },

  // ─── UI Actions ────────────────────────────────────────
  setActiveTab: (tab) => set(state => ({ ui: { ...state.ui, activeTab: tab } })),
  selectPanel: (id) => set(state => ({ ui: { ...state.ui, selectedPanelId: id, selectedBubbleId: null } })),
  selectPage: (id) => set(state => ({ ui: { ...state.ui, selectedPageId: id, selectedPanelId: null, selectedBubbleId: null } })),
  selectBubble: (id) => set(state => ({ ui: { ...state.ui, selectedBubbleId: id } })),
  setGenerating: (v) => set(state => ({ ui: { ...state.ui, isGenerating: v } })),
  setSaving: (v) => set(state => ({ ui: { ...state.ui, isSaving: v } })),
  setShowExportModal: (v) => set(state => ({ ui: { ...state.ui, showExportModal: v } })),

  addToast: (message, type) => {
    const id = uuidv4();
    set(state => ({ ui: { ...state.ui, toasts: [...state.ui.toasts, { id, message, type }] } }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => {
    set(state => ({ ui: { ...state.ui, toasts: state.ui.toasts.filter(t => t.id !== id) } }));
  },

  // ─── Persistence ───────────────────────────────────────
  saveToLocal: () => {
    try {
      const { projects } = get();
      localStorage.setItem('manga-projects', JSON.stringify(projects));
      set(state => ({ ui: { ...state.ui, lastSaved: new Date().toISOString(), isSaving: false } }));
    } catch {
      // Storage quota exceeded or unavailable
    }
    // TODO: Supabase — sync projects to Supabase here
  },

  loadFromLocal: () => {
    try {
      const data = localStorage.getItem('manga-projects');
      if (data) {
        set({ projects: JSON.parse(data) });
      }
    } catch {
      // Corrupted data
    }
    // TODO: Supabase — load projects from Supabase here
  },
}));
