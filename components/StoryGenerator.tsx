
import React, { useState } from 'react';
import { MangaProject, StoryPage } from '../types';
import { generateStoryline } from '../services/geminiService';
import { ScrollText, Loader2, BookOpen, PenTool } from 'lucide-react';

interface Props {
  project: MangaProject;
  onComplete: (pages: StoryPage[]) => void;
}

const StoryGenerator: React.FC<Props> = ({ project, onComplete }) => {
  const [pageCount, setPageCount] = useState(5);
  const [tone, setTone] = useState('Lighthearted');
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<any[]>([]);

  const handleGenerateStory = async () => {
    setLoading(true);
    try {
      const story = await generateStoryline(project.title, project.mainCharacter!, pageCount, tone);
      setPages(story);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const proceed = () => {
    const storyPages: StoryPage[] = pages.map(p => ({
      pageNumber: p.pageNumber,
      description: p.description,
      elements: [],
      layoutId: 'classic-3',
      panelImages: {}
    }));
    onComplete(storyPages);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
          <ScrollText className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Write the Script</h2>
          <p className="text-slate-500">How should your story unfold?</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-slate-400">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">PAGE COUNT</label>
                <input 
                  type="range" min="3" max="10" step="1" 
                  value={pageCount} 
                  onChange={e => setPageCount(parseInt(e.target.value))}
                  className="w-full accent-black" 
                />
                <div className="text-center font-bold mt-1">{pageCount} Pages</div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">TONE</label>
                <select 
                  className="w-full p-2 rounded border border-slate-200 text-sm"
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                >
                  <option>Lighthearted</option>
                  <option>Dramatic</option>
                  <option>Dark & Gritty</option>
                  <option>Comedic</option>
                  <option>Epic / Heroic</option>
                </select>
              </div>
              <button 
                onClick={handleGenerateStory}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
                Draft Script
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {loading ? (
            <div className="h-full bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-20 gap-4 text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              <p className="font-bold animate-pulse uppercase tracking-widest text-xs">Architecting your manga pages...</p>
            </div>
          ) : pages.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <span className="font-bold text-purple-600">Script Ready!</span>
                <button 
                  onClick={proceed}
                  className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-slate-800 transition-colors"
                >
                  Start Drawing
                </button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {pages.map(p => (
                  <div key={p.pageNumber} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs group-hover:bg-purple-100 group-hover:text-purple-600">P{p.pageNumber}</span>
                      <h4 className="font-bold text-slate-800">Scene Description</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4">"{p.description}"</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-20 gap-4 text-slate-400 text-center">
              <BookOpen className="w-16 h-16 opacity-10" />
              <p className="font-medium">Hit "Draft Script" to see your story take shape.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;
