
import React, { useState } from 'react';
import { GENRES, ART_STYLES } from '../constants';
import { MangaProject, ArtStyle } from '../types';
import { Wand2 } from 'lucide-react';

interface Props {
  onComplete: (data: Partial<MangaProject>) => void;
}

const ProjectSetup: React.FC<Props> = ({ onComplete }) => {
  // Fix: Explicitly type formData state to resolve ArtStyle incompatibility
  const [formData, setFormData] = useState<{
    title: string;
    genre: string;
    artStyle: ArtStyle;
  }>({
    title: '',
    genre: GENRES[0],
    artStyle: ART_STYLES[0] as ArtStyle
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-bold mb-4 manga-font tracking-tight">BRING YOUR OWN MANGA STORY</h2>
        <p className="text-slate-500 text-lg">From zero to chapter. Start your creative journey here.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 w-full space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Manga Title</label>
            <input 
              type="text" 
              placeholder="e.g. Neon Samurai Dreams" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-black/5 text-xl font-medium"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Genre</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-black/5"
                value={formData.genre}
                onChange={e => setFormData({ ...formData, genre: e.target.value })}
              >
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Art Style</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-black/5"
                value={formData.artStyle}
                // Fix: Cast the value as ArtStyle for type safety
                onChange={e => setFormData({ ...formData, artStyle: e.target.value as ArtStyle })}
              >
                {ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button 
            disabled={!formData.title}
            onClick={() => onComplete(formData)}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${formData.title ? 'bg-black text-white hover:scale-[1.02] shadow-lg active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Wand2 className="w-6 h-6" /> Create My Manga
          </button>
        </div>

        <div className="flex-1 hidden md:block">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-purple-500/20 to-orange-500/20 rounded-3xl blur-2xl" />
            <img 
              src="https://picsum.photos/seed/manga/800/800" 
              className="relative rounded-2xl shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500"
              alt="Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSetup;
