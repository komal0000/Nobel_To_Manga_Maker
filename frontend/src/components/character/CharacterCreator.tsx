'use client';

import { useState } from 'react';
import { useMangaStore } from '@/lib/store';
import { useGenerate } from '@/hooks/useGenerate';
import { Button } from '@/components/ui/Button';

export function CharacterCreator() {
  const currentProject = useMangaStore(s => s.currentProject);
  const addCharacter = useMangaStore(s => s.addCharacter);
  const deleteCharacter = useMangaStore(s => s.deleteCharacter);
  const setCharacterPortrait = useMangaStore(s => s.setCharacterPortrait);
  const { generatePortrait, isGenerating } = useGenerate();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [appearance, setAppearance] = useState('');
  const [outfit, setOutfit] = useState('');

  if (!currentProject) return null;

  const handleSave = () => {
    if (!name.trim() || !appearance.trim()) return;
    addCharacter(name, appearance, [], outfit);
    setName('');
    setAppearance('');
    setOutfit('');
    setIsCreating(false);
  };

  const handleGeneratePortrait = async (charId: string, desc: string, out: string) => {
    const fullDesc = `${desc}, wearing ${out || 'casual clothes'}`;
    const url = await generatePortrait(fullDesc);
    if (url) {
      setCharacterPortrait(charId, url);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <h4 className="text-sm font-bold text-white">👤 Characters</h4>
        {!isCreating && (
          <Button size="sm" onClick={() => setIsCreating(true)}>+ New</Button>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {/* Creator Form */}
        {isCreating && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kenji"
                className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400">Appearance</label>
              <textarea
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="Spiky black hair, intense eyes, scar on cheek..."
                className="w-full mt-1 h-20 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400">Default Outfit</label>
              <input
                type="text"
                value={outfit}
                onChange={(e) => setOutfit(e.target.value)}
                placeholder="School uniform with unbuttoned collar"
                className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={!name.trim() || !appearance.trim()}>Save</Button>
            </div>
          </div>
        )}

        {/* Character List */}
        <div className="space-y-4">
          {currentProject.characters.map(char => (
            <div key={char.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group relative">
              <button
                onClick={() => deleteCharacter(char.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center text-xs"
                title="Delete character"
              >
                ✕
              </button>
              
              <div className="flex gap-4 p-3">
                {/* Portrait */}
                <div className="w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-zinc-700 relative">
                  {char.portraitUrl ? (
                    <img src={char.portraitUrl} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-2xl">
                      👤
                    </div>
                  )}
                  {isGenerating && <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">⏳</div>}
                </div>
                
                {/* Info */}
                <div className="flex-1 overflow-hidden">
                  <h5 className="font-bold text-white truncate">{char.name}</h5>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-1" title={char.appearance}>
                    {char.appearance}
                  </p>
                  
                  <button
                    onClick={() => handleGeneratePortrait(char.id, char.appearance, char.outfit)}
                    disabled={isGenerating}
                    className="mt-2 text-xs text-violet-400 hover:text-violet-300 font-medium disabled:opacity-50"
                  >
                    {char.portraitUrl ? 'Regenerate Portrait' : 'Generate Portrait ✨'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!isCreating && currentProject.characters.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-zinc-500">No characters yet.</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setIsCreating(true)}>
                Create First Character
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
