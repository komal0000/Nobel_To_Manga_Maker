'use client';

import { useState } from 'react';
import { useMangaStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { StoryScene } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export function StoryGenerator() {
  const currentProject = useMangaStore(s => s.currentProject);
  const updateStoryOutline = useMangaStore(s => s.updateStoryOutline);
  const addToast = useMangaStore(s => s.addToast);
  
  const [expandedScene, setExpandedScene] = useState<string | null>(null);
  const [aiSourceType, setAiSourceType] = useState<'premise' | 'pdf'>('premise');
  const [aiPremise, setAiPremise] = useState('');
  const [aiChapterTitle, setAiChapterTitle] = useState('');
  const [aiConsistencyNotes, setAiConsistencyNotes] = useState('');
  const [aiChapterPdf, setAiChapterPdf] = useState<File | null>(null);
  const [aiSceneCount, setAiSceneCount] = useState(5);
  const [pendingAiScenes, setPendingAiScenes] = useState<StoryScene[] | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  if (!currentProject) return null;

  const outline = currentProject.storyOutline;

  const handleInitOutline = () => {
    updateStoryOutline({
      title: currentProject.title,
      genre: currentProject.genre,
      scenes: []
    });
  };

  const handleGenerateWithAI = async () => {
    if (aiSourceType === 'premise' && !aiPremise.trim()) {
      addToast('Please enter a story premise.', 'error');
      return;
    }

    if (aiSourceType === 'pdf' && !aiChapterPdf) {
      addToast('Please upload a chapter PDF.', 'error');
      return;
    }

    setIsGeneratingStory(true);
    try {
      const existingScenes = (outline?.scenes || []).map(scene => ({
        title: scene.title,
        description: scene.description,
        emotion: scene.emotion,
        actionType: scene.actionType,
      }));

      const requestTitle = outline?.title || currentProject.title;
      let response: Response;

      if (aiSourceType === 'pdf' && aiChapterPdf) {
        const formData = new FormData();
        formData.append('sourceType', 'pdf');
        formData.append('chapterPdf', aiChapterPdf);
        formData.append('title', requestTitle);
        formData.append('genre', currentProject.genre);
        formData.append('sceneCount', String(aiSceneCount));

        if (aiChapterTitle.trim()) {
          formData.append('chapterTitle', aiChapterTitle.trim());
        }

        if (aiConsistencyNotes.trim()) {
          formData.append('consistencyNotes', aiConsistencyNotes.trim());
        }

        if (existingScenes.length > 0) {
          formData.append('existingScenes', JSON.stringify(existingScenes));
        }

        response = await fetch('/api/generate-story', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('/api/generate-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceType: 'premise',
            premise: aiPremise,
            genre: currentProject.genre,
            title: requestTitle,
            sceneCount: aiSceneCount,
            consistencyNotes: aiConsistencyNotes.trim() || undefined,
            existingScenes,
          }),
        });
      }

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.scenes) {
        throw new Error(data?.error || 'Story generation failed.');
      }

      const newScenes: StoryScene[] = data.scenes.map((s: Omit<StoryScene, 'id'>) => ({
        ...s,
        id: uuidv4(),
      }));

      setPendingAiScenes(newScenes);
      addToast(`Generated ${newScenes.length} draft scenes. Review and accept them.`, 'success');

      if (aiSourceType === 'premise') {
        setAiPremise('');
      } else {
        setAiChapterPdf(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Story generation failed.';
      addToast(msg, 'error');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleAcceptGeneratedScenes = () => {
    if (!pendingAiScenes || pendingAiScenes.length === 0) return;

    const existingOutline = outline;
    updateStoryOutline({
      title: existingOutline?.title || currentProject.title,
      genre: existingOutline?.genre || currentProject.genre,
      scenes: existingOutline ? [...existingOutline.scenes, ...pendingAiScenes] : pendingAiScenes,
    });

    addToast(`Accepted ${pendingAiScenes.length} AI scenes.`, 'success');
    setPendingAiScenes(null);
  };

  const handleDiscardGeneratedScenes = () => {
    setPendingAiScenes(null);
    addToast('Discarded AI-generated draft scenes.', 'info');
  };

  const clearOutline = () => {
    if (confirm('Are you sure you want to clear the entire story script?')) {
      updateStoryOutline(null);
      setPendingAiScenes(null);
    }
  };

  const handleAddScene = () => {
    if (!outline) return;
    const newScene: StoryScene = {
      id: uuidv4(),
      title: `Scene ${outline.scenes.length + 1}`,
      description: '',
      dialogue: [],
      emotion: 'neutral',
      actionType: 'establishing'
    };
    updateStoryOutline({
      ...outline,
      scenes: [...outline.scenes, newScene]
    });
    setExpandedScene(newScene.id);
  };

  const updateScene = (id: string, updates: Partial<StoryScene>) => {
    if (!outline) return;
    updateStoryOutline({
      ...outline,
      scenes: outline.scenes.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const deleteScene = (id: string) => {
    if (!outline) return;
    updateStoryOutline({
      ...outline,
      scenes: outline.scenes.filter(s => s.id !== id)
    });
  };

  const handleCopyPrompt = (scene: StoryScene) => {
    const fullPrompt = `[${scene.actionType} | ${scene.emotion}] ${scene.description}`;
    navigator.clipboard.writeText(fullPrompt);
    addToast('Scene prompt copied to clipboard!', 'info');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">📝 Story Script</h4>
            <p className="text-xs text-zinc-500">Write manually or generate with AI</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAiPanel(v => !v)}
              className="px-2.5 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors flex items-center gap-1"
            >
              ✨ AI Generate
            </button>
            {outline && (
              <Button variant="ghost" size="sm" onClick={clearOutline} className="text-red-400 hover:text-red-300">
                Clear
              </Button>
            )}
          </div>
        </div>

        {showAiPanel && (
          <div className="bg-zinc-800 border border-violet-500/30 rounded-xl p-3 space-y-3">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-wide">Generate Story with AI</p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiSourceType('premise')}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                  aiSourceType === 'premise'
                    ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                }`}
              >
                Premise
              </button>
              <button
                onClick={() => setAiSourceType('pdf')}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                  aiSourceType === 'pdf'
                    ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                }`}
              >
                Chapter PDF
              </button>
            </div>

            {aiSourceType === 'premise' ? (
              <textarea
                value={aiPremise}
                onChange={e => setAiPremise(e.target.value)}
                placeholder="Describe your story premise... e.g. A young warrior discovers an ancient power and must protect her village from a shadow demon."
                className="w-full h-20 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={aiChapterTitle}
                  onChange={e => setAiChapterTitle(e.target.value)}
                  placeholder="Chapter title (optional)"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={e => setAiChapterPdf(e.target.files?.[0] || null)}
                  className="w-full text-xs text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-zinc-100 hover:file:bg-zinc-600"
                />
                <p className="text-[10px] text-zinc-500">
                  Upload one chapter PDF at a time. The PDF is parsed first, then the parsed text is sent to the story model for scene generation.
                </p>
              </div>
            )}

            <textarea
              value={aiConsistencyNotes}
              onChange={e => setAiConsistencyNotes(e.target.value)}
              placeholder="Consistency notes (optional): keep heroine scar visible, maintain same sword design, preserve timeline after last accepted scene..."
              className="w-full h-16 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />

            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-400 shrink-0">Scenes:</label>
              <input
                type="number"
                min={2}
                max={10}
                value={aiSceneCount}
                onChange={e => setAiSceneCount(Number(e.target.value))}
                className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <button
                onClick={handleGenerateWithAI}
                disabled={
                  isGeneratingStory ||
                  (aiSourceType === 'premise' ? !aiPremise.trim() : !aiChapterPdf)
                }
                className="flex-1 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                {isGeneratingStory ? '⏳ Generating...' : '✨ Generate Draft Scenes'}
              </button>
            </div>
          </div>
        )}

        {pendingAiScenes && pendingAiScenes.length > 0 && (
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-3 space-y-2">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
              Draft Scenes Ready ({pendingAiScenes.length})
            </p>
            <p className="text-xs text-zinc-300">
              Review the generated draft below, then accept to merge it into your story.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptGeneratedScenes}
                className="flex-1 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
              >
                ✓ Accept Scenes
              </button>
              <button
                onClick={handleDiscardGeneratedScenes}
                className="flex-1 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg transition-colors font-medium"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {!outline ? (
           <div className="h-full flex flex-col items-center justify-center text-center px-4">
             <span className="text-4xl mb-4">📓</span>
             <p className="text-sm text-zinc-500 mb-4">
               Start drafting your story manually. Break it down into scenes to use as prompts for generating panels.
             </p>
             <Button onClick={handleInitOutline}>Initialize Story Script</Button>
           </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <input 
                type="text" 
                value={outline.title} 
                onChange={e => updateStoryOutline({...outline, title: e.target.value})}
                className="w-full bg-transparent text-lg font-black text-white focus:outline-none border-b border-transparent focus:border-violet-500 pb-1"
                placeholder="Story Title"
              />
              <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                {outline.genre} · {outline.scenes.length} Scenes
              </p>
            </div>

            {pendingAiScenes && pendingAiScenes.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Draft Preview</p>
                  <span className="text-[10px] text-zinc-500">Not added yet</span>
                </div>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {pendingAiScenes.map((scene, idx) => (
                    <div key={scene.id} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                      <p className="text-xs font-bold text-white">{idx + 1}. {scene.title}</p>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{scene.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {outline.scenes.map((scene, idx) => (
                <div key={scene.id} className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
                  <div className="flex bg-zinc-750 border-b border-zinc-700/50">
                    <button
                      onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}
                      className="flex-1 px-4 py-3 flex items-center justify-between hover:bg-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-white max-w-37.5 truncate text-left">
                          {scene.title || `Scene ${idx + 1}`}
                        </span>
                      </div>
                      <span className="text-zinc-500 text-sm">
                        {expandedScene === scene.id ? '▼' : '▶'}
                      </span>
                    </button>
                    <button 
                      onClick={() => deleteScene(scene.id)}
                      className="px-3 text-zinc-500 hover:text-red-400 hover:bg-zinc-700 transition-colors"
                      title="Delete Scene"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {expandedScene === scene.id && (
                    <div className="px-4 pb-4 pt-3 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">Scene Title</label>
                        <input
                          type="text"
                          value={scene.title}
                          onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                          className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                          placeholder="e.g. The Awakening"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">Description (Image Prompt)</label>
                        <textarea
                          value={scene.description}
                          onChange={(e) => updateScene(scene.id, { description: e.target.value })}
                          className="w-full mt-1 h-20 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                          placeholder="Describe what happens in this scene..."
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Mood</label>
                          <input
                            type="text"
                            value={scene.emotion}
                            onChange={(e) => updateScene(scene.id, { emotion: e.target.value })}
                            className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                            placeholder="e.g. intense"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Action</label>
                          <input
                            type="text"
                            value={scene.actionType}
                            onChange={(e) => updateScene(scene.id, { actionType: e.target.value })}
                            className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                            placeholder="e.g. combat"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase">Dialogue</label>
                        <textarea
                          value={scene.dialogue.join('\n')}
                          onChange={(e) => updateScene(scene.id, { dialogue: e.target.value.split('\n') })}
                          className="w-full mt-1 h-20 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                          placeholder="Character A: Hello!&#10;Character B: Oh hi!"
                        />
                        <p className="text-[10px] text-zinc-500 mt-1">Put each line of dialogue on a new line.</p>
                      </div>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleCopyPrompt(scene)}
                      >
                        📋 Copy Prompt to Clipboard
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              onClick={handleAddScene}
              className="w-full border-dashed border-2 border-zinc-700 hover:border-violet-500 hover:text-white"
            >
              + Add New Scene
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
