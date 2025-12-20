
import React, { useState } from 'react';
import { ArtStyle, Character } from '../types';
import { generateCharacterDetails, generateCharacterImage, generateSideCharacters } from '../services/geminiService';
import { Sparkles, Loader2, Check, RefreshCw, Plus } from 'lucide-react';

interface Props {
  artStyle: ArtStyle;
  genre: string;
  onComplete: (main: Character, sides: Character[]) => void;
}

const CharacterCreator: React.FC<Props> = ({ artStyle, genre, onComplete }) => {
  const [mainChar, setMainChar] = useState({ name: '', description: '' });
  const [generatedMain, setGeneratedMain] = useState<Character | null>(null);
  const [sideChars, setSideChars] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [sideLoading, setSideLoading] = useState(false);

  const handleGenerateMain = async () => {
    if (!mainChar.name || !mainChar.description) return;
    setLoading(true);
    try {
      const details = await generateCharacterDetails(mainChar.name, mainChar.description, artStyle);
      const imageUrl = await generateCharacterImage(details.visualPrompt, artStyle);
      
      setGeneratedMain({
        id: 'main',
        name: mainChar.name,
        role: 'Protagonist',
        description: details.personality,
        imageUrl: imageUrl || `https://picsum.photos/seed/${mainChar.name}/400/400`
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSides = async () => {
    if (!generatedMain) return;
    setSideLoading(true);
    try {
      const sides = await generateSideCharacters(generatedMain, genre, artStyle);
      const populatedSides = await Promise.all(sides.map(async (s: any, idx: number) => {
        const imageUrl = await generateCharacterImage(s.visualPrompt, artStyle);
        return {
          id: `side-${idx}`,
          name: s.name,
          role: s.role,
          description: s.description,
          imageUrl: imageUrl || `https://picsum.photos/seed/${s.name}/400/400`
        };
      }));
      setSideChars(populatedSides);
    } catch (error) {
      console.error(error);
    } finally {
      setSideLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Sparkles className="text-orange-500" /> Cast Your Manga
      </h2>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Main Character Section */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
            The Hero
            {generatedMain && <span className="text-green-500 flex items-center gap-1 text-sm font-medium"><Check className="w-4 h-4" /> Ready</span>}
          </h3>
          
          {!generatedMain ? (
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Character Name" 
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-black/5 outline-none"
                value={mainChar.name}
                onChange={e => setMainChar({ ...mainChar, name: e.target.value })}
              />
              <textarea 
                placeholder="Description: personality, quirks, visual style..."
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-black/5 outline-none h-32"
                value={mainChar.description}
                onChange={e => setMainChar({ ...mainChar, description: e.target.value })}
              />
              <button 
                disabled={loading || !mainChar.name}
                onClick={handleGenerateMain}
                className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                Generate Hero
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border-4 border-slate-100">
                <img src={generatedMain.imageUrl} alt={generatedMain.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-2xl">{generatedMain.name}</h4>
                <p className="text-slate-500 leading-relaxed mt-2">{generatedMain.description}</p>
              </div>
              <button 
                onClick={() => setGeneratedMain(null)}
                className="text-slate-400 font-medium text-sm hover:text-black transition-colors"
              >
                ← Back to Edit
              </button>
            </div>
          )}
        </section>

        {/* Side Characters Section */}
        <section className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Side Cast</h3>
            {generatedMain && sideChars.length === 0 && (
              <button 
                onClick={handleGenerateSides}
                disabled={sideLoading}
                className="text-sm bg-orange-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-orange-600 shadow-sm disabled:opacity-50"
              >
                {sideLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Auto-Generate Cast
              </button>
            )}
          </div>

          {!generatedMain ? (
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-10 text-slate-400 italic">
              Create your Hero first to generate a fitting cast.
            </div>
          ) : sideLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="font-medium animate-pulse">Gemini is sketching your characters...</p>
            </div>
          ) : sideChars.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[600px] pr-2">
              {sideChars.map(s => (
                <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-100 flex gap-4 shadow-sm">
                  <img src={s.imageUrl} alt={s.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{s.name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-bold uppercase">{s.role}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3">{s.description}</p>
                  </div>
                </div>
              ))}
              <button 
                onClick={handleGenerateSides}
                className="py-3 text-slate-400 hover:text-black font-medium text-sm border-2 border-dashed border-slate-200 rounded-xl"
              >
                Regenerate Cast
              </button>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-10 text-slate-400 italic">
              No side characters generated yet.
            </div>
          )}
        </section>
      </div>

      <div className="mt-12 flex justify-center">
        <button 
          disabled={!generatedMain}
          onClick={() => onComplete(generatedMain!, sideChars)}
          className="bg-black text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          Confirm Cast & Continue
        </button>
      </div>
    </div>
  );
};

export default CharacterCreator;
