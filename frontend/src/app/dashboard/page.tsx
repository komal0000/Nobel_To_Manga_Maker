'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useMangaStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Genre, Project } from '@/lib/types';

const GENRES: { value: Genre; label: string; icon: string }[] = [
  { value: 'action', label: 'Action', icon: '⚔️' },
  { value: 'romance', label: 'Romance', icon: '💕' },
  { value: 'horror', label: 'Horror', icon: '👻' },
  { value: 'fantasy', label: 'Fantasy', icon: '🐉' },
  { value: 'comedy', label: 'Comedy', icon: '😂' },
];

function ProjectCard({ project, onOpen, onDelete, onDuplicate }: {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/5"
      onClick={onOpen}
    >
      {/* Thumbnail */}
      <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-600">
            <span className="text-6xl">📖</span>
            <span className="text-sm font-medium">{project.pages.length} page{project.pages.length !== 1 ? 's' : ''}</span>
          </div>
        )}
        {/* Genre badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium">
          {GENRES.find(g => g.value === project.genre)?.icon} {project.genre}
        </div>
        {/* Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-zinc-800 border border-zinc-700 rounded-xl py-2 min-w-[140px] shadow-xl z-10">
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 text-zinc-300 hover:text-white"
              >
                📋 Duplicate
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-900/30 text-red-400 hover:text-red-300"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-white truncate">{project.title}</h3>
        <p className="text-xs text-zinc-500 mt-1">
          {new Date(project.updatedAt).toLocaleDateString()} · {project.pages.length} page{project.pages.length !== 1 ? 's' : ''}
        </p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const projects = useMangaStore(s => s.projects);
  const createProject = useMangaStore(s => s.createProject);
  const deleteProject = useMangaStore(s => s.deleteProject);
  const duplicateProject = useMangaStore(s => s.duplicateProject);
  const loadProjects = useMangaStore(s => s.loadProjects);
  const addToast = useMangaStore(s => s.addToast);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre>('action');

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      addToast('Please enter a project title', 'error');
      return;
    }
    const id = await createProject(newTitle.trim(), selectedGenre);
    if (!id) return;

    setShowNewModal(false);
    setNewTitle('');
    router.push(`/editor/${id}`);
  };

  const handleDelete = async (id: string) => {
    const deleted = await deleteProject(id);
    if (deleted) {
      addToast('Project deleted', 'info');
    }
  };

  const handleDuplicate = async (id: string) => {
    const duplicateId = await duplicateProject(id);
    if (duplicateId) {
      addToast('Project duplicated', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎌</span>
            <h1 className="text-2xl font-black gradient-text">MangaMaker AI</h1>
          </div>
          <Button onClick={() => setShowNewModal(true)} size="lg">
            ✨ New Manga
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="text-8xl mb-6">📖</div>
            <h2 className="text-3xl font-black text-white mb-3">Create Your First Manga</h2>
            <p className="text-zinc-500 max-w-md mb-8">
              Generate AI-powered manga with custom characters, dynamic panels, speech bubbles, and cinematic layouts.
            </p>
            <Button onClick={() => setShowNewModal(true)} size="lg">
              ✨ Start Creating
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Projects</h2>
              <span className="text-sm text-zinc-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              <AnimatePresence>
                {projects.map(p => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onOpen={() => router.push(`/editor/${p.id}`)}
                    onDelete={() => handleDelete(p.id)}
                    onDuplicate={() => handleDuplicate(p.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </main>

      {/* New Project Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Create New Manga">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Project Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="My Epic Manga..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Genre</label>
            <div className="grid grid-cols-5 gap-2">
              {GENRES.map(g => (
                <button
                  key={g.value}
                  onClick={() => setSelectedGenre(g.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    selectedGenre === g.value
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-zinc-700 hover:border-zinc-600 text-zinc-400'
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-xs font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowNewModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>🎨 Create Project</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
