/**
 * Zustand store for global project state.
 * Uses Laravel as the only persistence layer for project data.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Bubble,
  BubbleType,
  Character,
  Genre,
  ImageModel,
  LayoutPreset,
  Page,
  Panel,
  Position,
  Project,
  SFXItem,
  StoryOutline,
} from './types';
import { LAYOUT_PRESETS } from './layouts';
import {
  createProjectRemote,
  deleteProjectRemote,
  duplicateProjectRemote,
  fetchProject,
  fetchProjects,
  updateProjectRemote,
} from './projectApi';

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

interface MangaStore {
  projects: Project[];
  currentProject: Project | null;
  ui: UIState;
  createProject: (title: string, genre: Genre) => Promise<string | null>;
  loadProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<boolean>;
  updateProjectTitle: (title: string) => void;
  updateStoryOutline: (outline: StoryOutline | null) => void;
  duplicateProject: (id: string) => Promise<string | null>;
  addPage: (layoutPresetId?: string) => string;
  removePage: (pageId: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  setPageLayout: (pageId: string, preset: LayoutPreset) => void;
  updatePanel: (panelId: string, updates: Partial<Panel>) => void;
  setPanelImage: (panelId: string, imageUrl: string, prompt: string, model: ImageModel) => void;
  clearPanelImage: (panelId: string) => void;
  addCharacter: (name: string, appearance: string, traits: string[], outfit: string) => string;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  setCharacterPortrait: (id: string, url: string) => void;
  addBubble: (panelId: string, type: BubbleType) => string;
  updateBubble: (id: string, updates: Partial<Bubble>) => void;
  deleteBubble: (id: string) => void;
  addSFX: (panelId: string, text: string) => string;
  updateSFX: (id: string, updates: Partial<SFXItem>) => void;
  deleteSFX: (id: string) => void;
  setActiveTab: (tab: UIState['activeTab']) => void;
  selectPanel: (id: string | null) => void;
  selectPage: (id: string | null) => void;
  selectBubble: (id: string | null) => void;
  setGenerating: (v: boolean) => void;
  setSaving: (v: boolean) => void;
  setShowExportModal: (v: boolean) => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  saveProject: () => Promise<void>;
  loadProjects: () => Promise<void>;
}

function createPanelsFromPreset(pageId: string, preset: LayoutPreset): Panel[] {
  return preset.panels.map((pos: Position) => ({
    id: uuidv4(),
    pageId,
    position: { ...pos },
    imageUrl: null,
    prompt: '',
    modelUsed: 'google/gemini-2.5-flash-image',
    style: {
      borderWidth: 2,
      borderColor: '#000000',
      borderRadius: 0,
      backgroundColor: '#ffffff',
    },
    bubbles: [],
    sfxItems: [],
    characterIds: [],
  }));
}

function mergeProjectIntoList(projects: Project[], project: Project): Project[] {
  const existingIndex = projects.findIndex(item => item.id === project.id);
  if (existingIndex === -1) {
    return [project, ...projects];
  }

  return projects.map(item => item.id === project.id ? project : item);
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

  createProject: async (title, genre) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const firstPageId = uuidv4();
    const defaultPreset = LAYOUT_PRESETS.find(preset => preset.id === '3-panel') || LAYOUT_PRESETS[0];

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

    set(state => ({ ui: { ...state.ui, isSaving: true } }));

    try {
      const savedProject = await createProjectRemote(project);
      set(state => ({
        projects: mergeProjectIntoList(state.projects, savedProject),
        currentProject: state.currentProject?.id === savedProject.id ? savedProject : state.currentProject,
        ui: { ...state.ui, lastSaved: new Date().toISOString(), isSaving: false },
      }));
      return savedProject.id;
    } catch {
      set(state => ({ ui: { ...state.ui, isSaving: false } }));
      get().addToast('Could not create project on backend', 'error');
      return null;
    }
  },

  loadProject: async (id) => {
    try {
      const remoteProject = await fetchProject(id);
      set(state => ({
        projects: mergeProjectIntoList(state.projects, remoteProject),
        currentProject: remoteProject,
        ui: {
          ...state.ui,
          selectedPageId: remoteProject.pages[0]?.id || null,
          selectedPanelId: null,
        },
      }));
    } catch {
      get().addToast('Project could not be loaded from backend', 'error');
    }
  },

  deleteProject: async (id) => {
    try {
      await deleteProjectRemote(id);
      set(state => ({
        projects: state.projects.filter(project => project.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }));
      return true;
    } catch {
      get().addToast('Could not delete project on backend', 'error');
      return false;
    }
  },

  updateProjectTitle: (title) => {
    set(state => {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, title, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
      };
    });
  },

  updateStoryOutline: (outline) => {
    set(state => {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, storyOutline: outline, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
      };
    });
  },

  duplicateProject: async (id) => {
    try {
      const duplicate = await duplicateProjectRemote(id);
      set(state => ({ projects: mergeProjectIntoList(state.projects, duplicate) }));
      return duplicate.id;
    } catch {
      get().addToast('Could not duplicate project on backend', 'error');
      return null;
    }
  },

  addPage: (layoutPresetId) => {
    const project = get().currentProject;
    if (!project) return '';

    const pageId = uuidv4();
    const preset = LAYOUT_PRESETS.find(item => item.id === (layoutPresetId || '3-panel')) || LAYOUT_PRESETS[0];

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
        projects: state.projects.map(projectItem => projectItem.id === updated.id ? updated : projectItem),
      };
    });

    return pageId;
  },

  removePage: (pageId) => {
    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages
        .filter(page => page.id !== pageId)
        .map((page, index) => ({ ...page, pageNumber: index + 1 }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };

      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
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
      const [movedPage] = pages.splice(fromIndex, 1);
      pages.splice(toIndex, 0, movedPage);
      const reorderedPages = pages.map((page, index) => ({ ...page, pageNumber: index + 1 }));
      const updated = { ...state.currentProject, pages: reorderedPages, updatedAt: new Date().toISOString() };

      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
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
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
      };
    });
  },

  updatePanel: (panelId, updates) => {
    set(state => {
      if (!state.currentProject) return state;
      const pages = state.currentProject.pages.map(page => ({
        ...page,
        panels: page.panels.map(panel => panel.id === panelId ? { ...panel, ...updates } : panel),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };

      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
      };
    });
  },

  setPanelImage: (panelId, imageUrl, prompt, model) => {
    get().updatePanel(panelId, { imageUrl, prompt, modelUsed: model });
  },

  clearPanelImage: (panelId) => {
    get().updatePanel(panelId, { imageUrl: null, prompt: '' });
  },

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
        projects: state.projects.map(projectItem => projectItem.id === updated.id ? updated : projectItem),
      };
    });

    return id;
  },

  updateCharacter: (id, updates) => {
    set(state => {
      if (!state.currentProject) return state;
      const characters = state.currentProject.characters.map(character =>
        character.id === id ? { ...character, ...updates } : character
      );
      const updated = { ...state.currentProject, characters, updatedAt: new Date().toISOString() };

      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
      };
    });
  },

  deleteCharacter: (id) => {
    set(state => {
      if (!state.currentProject) return state;
      const characters = state.currentProject.characters.filter(character => character.id !== id);
      const updated = { ...state.currentProject, characters, updatedAt: new Date().toISOString() };

      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
      };
    });
  },

  setCharacterPortrait: (id, url) => {
    get().updateCharacter(id, { portraitUrl: url });
  },

  addBubble: (panelId, type) => {
    const id = uuidv4();
    const bubble: Bubble = {
      id,
      panelId,
      type,
      content: type === 'narration' ? 'Narration text...' : 'Dialogue...',
      position: { x: 10, y: 10, width: 30, height: 15 },
      style: {
        fontSize: 14,
        fontFamily: "'Bangers', cursive",
        tailDirection: type === 'narration' ? 'none' : 'bottom',
        rotation: 0,
      },
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
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
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
          bubbles: panel.bubbles.map(bubble => bubble.id === id ? { ...bubble, ...updates } : bubble),
        })),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };

      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
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
          bubbles: panel.bubbles.filter(bubble => bubble.id !== id),
        })),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };

      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
      };
    });
  },

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
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
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
          sfxItems: panel.sfxItems.map(item => item.id === id ? { ...item, ...updates } : item),
        })),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };

      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
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
          sfxItems: panel.sfxItems.filter(item => item.id !== id),
        })),
      }));
      const updated = { ...state.currentProject, pages, updatedAt: new Date().toISOString() };

      return {
        currentProject: updated,
        projects: state.projects.map(project => project.id === updated.id ? updated : project),
      };
    });
  },

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
    set(state => ({ ui: { ...state.ui, toasts: state.ui.toasts.filter(toast => toast.id !== id) } }));
  },

  saveProject: async () => {
    const { currentProject } = get();

    if (!currentProject) {
      set(state => ({ ui: { ...state.ui, isSaving: false } }));
      return;
    }

    set(state => ({ ui: { ...state.ui, isSaving: true } }));

    try {
      const savedProject = await updateProjectRemote(currentProject);
      set(state => ({
        currentProject: state.currentProject?.id === savedProject.id ? savedProject : state.currentProject,
        projects: mergeProjectIntoList(state.projects, savedProject),
        ui: { ...state.ui, lastSaved: new Date().toISOString(), isSaving: false },
      }));
    } catch {
      set(state => ({ ui: { ...state.ui, isSaving: false } }));
      get().addToast('Could not save changes to backend', 'error');
    }
  },

  loadProjects: async () => {
    try {
      const projects = await fetchProjects();
      set(state => ({
        projects,
        currentProject: state.currentProject
          ? projects.find(project => project.id === state.currentProject?.id) || state.currentProject
          : null,
      }));
    } catch {
      get().addToast('Could not load projects from backend', 'error');
    }
  },
}));
