# AI Manga Generator Web App — Implementation Plan

Build a production-ready, AI-powered Manga Generator Web App with a Canva-like 3-column editor, Puter.js for client-side image generation, and all core features from the PRD. Since this is a greenfield project in an empty workspace, we will scaffold everything from scratch.

> [!IMPORTANT]
> **Supabase**: The PRD specifies Supabase for auth, database, and storage. Since no Supabase project credentials are provided, we will build the full UI and editor functionality with **local state only** (Zustand + localStorage). The Supabase integration points will be clearly marked with `// TODO: Supabase` comments so they can be wired up when credentials are available.

> [!IMPORTANT]
> **Backend AI routes**: The `/api/generate-story` route requires an LLM API key (Claude/GPT). We will scaffold the route with a mock response and `// TODO: Add API key` markers.

## Proposed Changes

### Phase 1 — Project Scaffolding

#### [NEW] Next.js 14 Project
- Initialize with `npx -y create-next-app@latest ./` using App Router, TailwindCSS, TypeScript
- Install: `framer-motion`, `zustand`, `@dnd-kit/core`, `@dnd-kit/sortable`, `jspdf`, `html2canvas`, `uuid`
- Configure TailwindCSS with dark mode defaults (`zinc-950` base)

#### [NEW] [globals.css](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/app/globals.css)
- Dark theme variables, manga fonts (Bangers via Google Fonts import), base styles

#### [NEW] [layout.tsx](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/app/layout.tsx)
- Root layout with Puter.js `<script>` tag, dark theme `<body>`, font imports

---

### Phase 2 — Core Library Layer

#### [NEW] [imageGen.ts](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/lib/imageGen.ts)
- `generateMangaPanel()`, `generateCharacterPortrait()`, `generateBackground()`, `generatePanelVariation()`, `puterImageToUrl()`
- Single file wrapping all Puter.js calls per PRD spec

#### [NEW] [layouts.ts](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/lib/layouts.ts)
- Panel layout presets: 2-panel vertical, 3-panel, 4-panel grid, cinematic widescreen
- Each preset returns positions/sizes as JSONB-compatible objects

#### [NEW] [exportPDF.ts](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/lib/exportPDF.ts)
- `exportAsPDF()`, `exportAsPNG()`, `exportAsWebtoon()` using jsPDF + html2canvas

#### [NEW] [store.ts](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/lib/store.ts)
- Zustand store: project state, pages, panels, characters, bubbles, SFX, UI state
- Auto-save to localStorage (Supabase-ready)

#### [NEW] [types.ts](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/lib/types.ts)
- TypeScript interfaces: `Project`, `Page`, `Panel`, `Character`, `Bubble`, `SFXItem`, `Asset`

---

### Phase 3 — UI Shell & Shared Components

#### [NEW] Shared UI Components (`components/ui/`)
- `Button.tsx` — styled button with variants
- `Modal.tsx` — modal dialog with Framer Motion
- `Toast.tsx` — toast notification system
- `Skeleton.tsx` — skeleton loader for image generation
- `Select.tsx` — styled select dropdown

---

### Phase 4 — Dashboard

#### [NEW] [page.tsx](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/app/dashboard/page.tsx)
- Project cards grid with thumbnails
- Create / Rename / Delete projects
- "New Manga" button with genre picker modal

#### [NEW] [page.tsx](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/app/page.tsx)
- Landing/home page that redirects to dashboard

---

### Phase 5 — Editor Canvas & Panel System

#### [NEW] [page.tsx](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/app/editor/[projectId]/page.tsx)
- 3-column editor layout wrapper
- Loads project from store, renders Left/Canvas/Right

#### [NEW] Editor Components (`components/editor/`)
- `EditorLayout.tsx` — 3-column shell
- `Canvas.tsx` — center canvas with paginated manga pages
- `PanelSlot.tsx` — individual panel with selection, floating toolbar
- `FloatingToolbar.tsx` — appears on panel select (generate/bubble/sfx/delete)
- `PageNavigator.tsx` — page tabs/pagination at bottom
- `LayoutPicker.tsx` — panel layout preset picker

---

### Phase 6 — Left Sidebar Features

#### [NEW] Left Sidebar Components (`components/story/`, `components/character/`, `components/sfx/`)
- `LeftSidebar.tsx` — tabbed sidebar container
- `StoryGenerator.tsx` — prompt input, genre picker, length selector, scene accordion
- `CharacterCreator.tsx` — name/traits/appearance fields + Generate Portrait button
- `BackgroundGenerator.tsx` — scene presets + custom input
- `SFXLibrary.tsx` — preset SFX words + custom input, SVG rendered
- `AssetLibrary.tsx` — saved characters, backgrounds, templates

#### [NEW] [route.ts](file:///c:/Users/97798/OneDrive/Desktop/Nobel_To_Manage_Maker/app/api/generate-story/route.ts)
- POST endpoint for story generation (mock response, marked for LLM API integration)

---

### Phase 7 — Right Sidebar Settings

#### [NEW] Right Sidebar Components
- `RightSidebar.tsx` — settings panel container
- `PanelSettings.tsx` — size, border thickness, style
- `StyleSettings.tsx` — model selector (Flash/Pro/Banana), B&W toggle
- `BubbleSettings.tsx` — bubble type/style editing

---

### Phase 8 — Speech Bubbles

#### [NEW] Speech Bubble Components (`components/bubbles/`)
- `BubbleOverlay.tsx` — renders all bubbles over a panel
- `BubbleEditor.tsx` — drag/resize/rotate/edit text
- 4 types: speech (round), thought (cloud), narration (box), shout (jagged)

---

### Phase 9 — Export

#### [NEW] Export Components (`components/export/`)
- `ExportModal.tsx` — format selection (PDF/PNG/Webtoon) with preview thumbnails

---

### Phase 10 — Auto-Save & Polish
- Debounced save in Zustand store → localStorage (every 30s)
- "Saved" / "Saving…" indicator in top bar
- Toast system for save/export/error notifications

---

## Verification Plan

### Automated (Build & Lint)
1. `npm run build` — verify project compiles with zero errors
2. `npm run lint` — verify no lint errors

### Browser Testing
1. Open `http://localhost:3000` → verify landing page loads, redirects to dashboard
2. Dashboard: Create a new project → verify it appears in the grid
3. Dashboard: Click a project → verify editor opens with 3-column layout
4. Editor: Select a panel layout preset → verify panels render in canvas
5. Editor: Click a panel → verify floating toolbar appears
6. Editor: Open Story Generator tab → verify UI renders correctly
7. Editor: Open Character Creator → verify form fields and generate button
8. Editor: Open SFX Library → verify preset words render as styled SVG
9. Editor: Add a speech bubble → verify it appears and is editable
10. Editor: Try Export button → verify export modal opens with format options

### Manual Verification (User)
- Verify Puter.js image generation works (requires Puter authentication in browser)
- Verify export produces correct PDF/PNG output
- Verify overall visual quality meets premium design expectations
