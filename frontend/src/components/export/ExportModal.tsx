'use client';

import { useState } from 'react';
import { useMangaStore } from '@/lib/store';
import { Check, Download, Video } from 'lucide-react';

export function ExportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const currentProject = useMangaStore(s => s.currentProject);

  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'png' | 'webtoon'>('pdf');

  if (!isOpen || !currentProject) return null;

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export progress
    try {
      const { exportAsPDF, exportAsPNG, exportAsWebtoon } = await import('@/lib/exportPDF');
      
      // Grab all page elements
      const pageElements = Array.from(document.querySelectorAll('.manga-page')) as HTMLElement[];
      if (pageElements.length === 0) throw new Error('No pages found to export');

      if (exportType === 'pdf') await exportAsPDF(pageElements, currentProject.title);
      else if (exportType === 'png') await exportAsPNG(pageElements, currentProject.title);
      else if (exportType === 'webtoon') await exportAsWebtoon(pageElements, currentProject.title);
      
      onClose();
    } catch (e) {
      console.error(e);
      alert('Export failed. Ensure all images are fully loaded.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        <h2 className="text-2xl font-black text-white mb-2">Export Manga</h2>
        <p className="text-zinc-400 mb-8">{currentProject.pages.length} Pages · {currentProject.title}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setExportType('pdf')}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
              exportType === 'pdf' ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
            }`}
          >
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-bold text-white mb-1">PDF Book</h3>
            <p className="text-xs text-zinc-400">Best for sharing as a complete comic book or printing.</p>
            {exportType === 'pdf' && <div className="absolute top-3 right-3 text-violet-500"><Check size={20} /></div>}
          </button>
          
          <button
            onClick={() => setExportType('webtoon')}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
              exportType === 'webtoon' ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
            }`}
          >
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-bold text-white mb-1">Webtoon</h3>
            <p className="text-xs text-zinc-400">Stitches all pages vertically into one long scrolling image.</p>
            {exportType === 'webtoon' && <div className="absolute top-3 right-3 text-violet-500"><Check size={20} /></div>}
          </button>

          <button
            onClick={() => setExportType('png')}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
              exportType === 'png' ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
            }`}
          >
            <div className="text-3xl mb-3">🖼️</div>
            <h3 className="font-bold text-white mb-1">PNG Images</h3>
            <p className="text-xs text-zinc-400">Downloads individual high-res PNG files for each page.</p>
            {exportType === 'png' && <div className="absolute top-3 right-3 text-violet-500"><Check size={20} /></div>}
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>⏳ Preparing Export...</>
            ) : (
              <><Download size={18} /> Export {exportType.toUpperCase()}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
