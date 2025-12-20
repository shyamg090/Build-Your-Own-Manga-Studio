
import React, { useState, useRef, useEffect } from 'react';
import { MangaProject, StoryPage, CanvasElement, Character } from '../types';
import { generateSceneAssets } from '../services/geminiService';
import { PANEL_LAYOUTS, BUBBLE_STYLES } from '../constants';
import { 
  Users, Image as ImageIcon, MessageSquare, 
  ChevronLeft, ChevronRight, Layers, Trash2, 
  RotateCw, Plus, Minus, Download, Sparkles, Loader2, Layout as LayoutIcon,
  MousePointer2, Eraser
} from 'lucide-react';

interface Props {
  project: MangaProject;
  setProject: React.Dispatch<React.SetStateAction<MangaProject | null>>;
}

const MangaEditor: React.FC<Props> = ({ project, setProject }) => {
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cast' | 'bubbles' | 'layouts'>('cast');
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [draggedImageUrl, setDraggedImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentPage = project.pages[currentPageIdx];
  const currentLayout = PANEL_LAYOUTS.find(l => l.id === currentPage.layoutId) || PANEL_LAYOUTS[0];

  const updatePage = (updates: Partial<StoryPage>) => {
    setProject(prev => {
      if (!prev) return null;
      const newPages = [...prev.pages];
      newPages[currentPageIdx] = { ...newPages[currentPageIdx], ...updates };
      return { ...prev, pages: newPages };
    });
  };

  const addElement = (type: CanvasElement['type'], data: any) => {
    // If a panel is selected, filling it takes precedence for backgrounds/chars
    if (selectedPanelId && (type === 'character' || type === 'background')) {
      const panelImages = { ...currentPage.panelImages };
      panelImages[selectedPanelId] = data.url;
      updatePage({ panelImages });
      return;
    }

    const newElement: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 150,
      y: 150,
      width: type === 'bubble' ? 120 : 180,
      height: type === 'bubble' ? 80 : 180,
      rotation: 0,
      zIndex: currentPage.elements.length + 1,
      data
    };
    updatePage({ elements: [...currentPage.elements, newElement] });
    setSelectedElementId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    updatePage({
      elements: currentPage.elements.map(el => el.id === id ? { ...el, ...updates } : el)
    });
  };

  const deleteElement = (id: string) => {
    updatePage({
      elements: currentPage.elements.filter(el => el.id !== id)
    });
    setSelectedElementId(null);
  };

  const moveZ = (id: string, dir: 'up' | 'down') => {
    const current = currentPage.elements.find(e => e.id === id);
    if (!current) return;
    const newZ = dir === 'up' ? current.zIndex + 1 : Math.max(0, current.zIndex - 1);
    updateElement(id, { zIndex: newZ });
  };

  const handleGenerateBg = async () => {
    setIsGeneratingAsset(true);
    try {
      const url = await generateSceneAssets(currentPage.description, project.artStyle);
      if (url) {
        if (selectedPanelId) {
          const panelImages = { ...currentPage.panelImages };
          panelImages[selectedPanelId] = url;
          updatePage({ panelImages });
        } else {
          addElement('background', { url });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  const clearPanel = (panelId: string) => {
    const panelImages = { ...currentPage.panelImages };
    delete panelImages[panelId];
    updatePage({ panelImages });
  };

  // Drag and Drop Logic for Panels
  const onDragStart = (url: string) => {
    setDraggedImageUrl(url);
  };

  const onDropOnPanel = (panelId: string) => {
    if (draggedImageUrl) {
      const panelImages = { ...currentPage.panelImages };
      panelImages[panelId] = draggedImageUrl;
      updatePage({ panelImages });
      setDraggedImageUrl(null);
    }
  };

  // Drag logic for elements
  const selectedElement = currentPage.elements.find(el => el.id === selectedElementId);
  const [isDragging, setIsDragging] = useState(false);
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedElementId(id);
    setSelectedPanelId(null);
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedElementId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - (selectedElement?.width || 0) / 2;
        const y = e.clientY - rect.top - (selectedElement?.height || 0) / 2;
        updateElement(selectedElementId, { x, y });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedElementId, selectedElement?.width, selectedElement?.height]);

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden">
      {/* Assets Library Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('cast')}
            className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'cast' ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Users className="w-4 h-4 mx-auto mb-1" /> Assets
          </button>
          <button 
            onClick={() => setActiveTab('bubbles')}
            className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'bubbles' ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <MessageSquare className="w-4 h-4 mx-auto mb-1" /> Text
          </button>
          <button 
            onClick={() => setActiveTab('layouts')}
            className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'layouts' ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutIcon className="w-4 h-4 mx-auto mb-1" /> Grid
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'cast' && (
            <div className="space-y-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase italic mb-2">Drag into a panel to set background</p>
              <div className="grid grid-cols-2 gap-3">
                {[project.mainCharacter!, ...project.sideCharacters].map(char => (
                  <div 
                    key={char.id}
                    draggable
                    onDragStart={() => onDragStart(char.imageUrl)}
                    onClick={() => addElement('character', { url: char.imageUrl })}
                    className="group relative rounded-xl overflow-hidden border-2 border-slate-100 hover:border-black transition-all cursor-grab active:cursor-grabbing bg-slate-50"
                  >
                    <img src={char.imageUrl} alt={char.name} className="w-full h-24 object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[9px] p-1 text-center font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {char.name}
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleGenerateBg}
                  className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50 transition-all text-slate-400 hover:text-purple-500"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase">Gen Asset</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'bubbles' && (
            <div className="grid grid-cols-2 gap-2">
              {BUBBLE_STYLES.map(style => (
                <button 
                  key={style.id}
                  onClick={() => addElement('bubble', { styleId: style.id, text: 'Dialogue...' })}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 flex flex-col items-center gap-2"
                >
                  <div className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center ${style.id === 'shout' ? 'bg-yellow-100' : 'bg-white'}`}>T</div>
                  {style.label}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'layouts' && (
            <div className="space-y-4">
              {PANEL_LAYOUTS.map(layout => (
                <button 
                  key={layout.id}
                  onClick={() => updatePage({ layoutId: layout.id, panelImages: {} })}
                  className={`w-full p-2 rounded-xl border-2 transition-all group ${currentPage.layoutId === layout.id ? 'border-black bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="aspect-[3/4] bg-white border border-slate-200 relative overflow-hidden mb-2 pointer-events-none">
                    {layout.panels.map(p => (
                      <div 
                        key={p.id} 
                        className="absolute border border-black/30 bg-slate-100" 
                        style={{ top: p.top, left: p.left, width: p.width, height: p.height, clipPath: p.clipPath }} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{layout.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex flex-col gap-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Editor Tools</h4>
            <div className="grid grid-cols-2 gap-2">
               <button 
                onClick={() => setSelectedElementId(null)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white border border-slate-200 text-[10px] font-bold hover:bg-slate-100 transition-all"
              >
                <MousePointer2 className="w-3 h-3" /> SELECT
              </button>
              <button 
                disabled={!selectedPanelId}
                onClick={() => selectedPanelId && clearPanel(selectedPanelId)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white border border-slate-200 text-[10px] font-bold hover:bg-red-50 hover:text-red-500 disabled:opacity-30 transition-all"
              >
                <Eraser className="w-3 h-3" /> CLEAR
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Editor Main Area */}
      <section className="flex-1 bg-slate-200 flex flex-col overflow-hidden relative">
        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 p-2 flex items-center justify-between px-6 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPageIdx === 0}
              onClick={() => setCurrentPageIdx(idx => idx - 1)}
              className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20 border border-slate-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="bg-black text-white px-6 py-2 rounded-full text-xs font-black tracking-widest shadow-inner">
              PAGE {currentPage.pageNumber}
            </div>
            <button 
              disabled={currentPageIdx === project.pages.length - 1}
              onClick={() => setCurrentPageIdx(idx => idx + 1)}
              className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20 border border-slate-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {selectedElement && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-300 shadow-md">
                <button onClick={() => updateElement(selectedElement.id, { width: selectedElement.width + 20, height: selectedElement.height + 20 })} className="p-2 bg-white hover:bg-slate-50 rounded-xl shadow-sm"><Plus className="w-4 h-4" /></button>
                <button onClick={() => updateElement(selectedElement.id, { width: Math.max(20, selectedElement.width - 20), height: Math.max(20, selectedElement.height - 20) })} className="p-2 bg-white hover:bg-slate-50 rounded-xl shadow-sm"><Minus className="w-4 h-4" /></button>
                <button onClick={() => updateElement(selectedElement.id, { rotation: selectedElement.rotation + 15 })} className="p-2 bg-white hover:bg-slate-50 rounded-xl shadow-sm"><RotateCw className="w-4 h-4" /></button>
                <button onClick={() => moveZ(selectedElement.id, 'up')} className="p-2 bg-white hover:bg-slate-50 rounded-xl shadow-sm"><Layers className="w-4 h-4" /></button>
                <button onClick={() => deleteElement(selectedElement.id)} className="p-2 bg-white hover:bg-red-50 rounded-xl shadow-sm text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
            <div className="h-6 w-px bg-slate-300" />
            <button className="bg-black text-white px-6 py-3 rounded-full font-black text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg" onClick={() => window.print()}>
              <Download className="w-4 h-4" /> EXPORT PDF
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-8 overflow-auto flex justify-center bg-slate-400">
          <div className="relative">
            {/* Main Canvas Paper */}
            <div 
              ref={canvasRef}
              onClick={() => {
                setSelectedElementId(null);
                setSelectedPanelId(null);
              }}
              className="bg-white w-[620px] h-[880px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden border-[6px] border-black/10"
              style={{
                backgroundImage: 'linear-gradient(rgba(241, 245, 249, .5) 1px, transparent 1px), linear-gradient(90deg, rgba(241, 245, 249, .5) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            >
              {/* Panels Background Layer - matching ref image style */}
              <div className="absolute inset-0 z-0 p-4 bg-white">
                {currentLayout.panels.map(panel => (
                  <div 
                    key={panel.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPanelId(panel.id);
                      setSelectedElementId(null);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      onDropOnPanel(panel.id);
                    }}
                    className={`absolute border-[5px] border-black overflow-hidden transition-all duration-300 group cursor-pointer ${selectedPanelId === panel.id ? 'ring-4 ring-blue-500 ring-offset-4 z-20 scale-[1.02] shadow-2xl' : 'hover:border-slate-800'}`}
                    style={{
                      top: panel.top,
                      left: panel.left,
                      width: panel.width,
                      height: panel.height,
                      clipPath: panel.clipPath,
                      backgroundColor: currentPage.panelImages[panel.id] ? 'black' : '#fff'
                    }}
                  >
                    {currentPage.panelImages[panel.id] ? (
                      <img 
                        src={currentPage.panelImages[panel.id]} 
                        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-110" 
                        alt="Panel Background" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 group-hover:bg-slate-50 transition-colors">
                        <div className="p-3 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 group-hover:border-slate-400 group-hover:text-slate-500">
                          <ImageIcon className="w-8 h-8 opacity-20" />
                        </div>
                        <span className="mt-2 text-[9px] font-black uppercase tracking-widest opacity-30">Drop Here</span>
                      </div>
                    )}
                    
                    {/* Panel Selection Indicator */}
                    {selectedPanelId === panel.id && (
                      <div className="absolute inset-0 border-4 border-blue-400 pointer-events-none animate-pulse opacity-50" />
                    )}
                  </div>
                ))}
              </div>

              {/* Floating Elements Layer */}
              <div className="absolute inset-0 z-30 pointer-events-none">
                {currentPage.elements.sort((a,b) => a.zIndex - b.zIndex).map(el => (
                  <div 
                    key={el.id}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    className={`absolute cursor-move select-none transition-shadow pointer-events-auto ${selectedElementId === el.id ? 'ring-4 ring-blue-500 shadow-2xl scale-105 z-[100]' : 'hover:ring-2 hover:ring-slate-400'}`}
                    style={{
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      transform: `rotate(${el.rotation}deg)`,
                      zIndex: el.zIndex + 100,
                      transformOrigin: 'center center'
                    }}
                  >
                    {el.type === 'character' || el.type === 'background' ? (
                      <img src={el.data.url} className="w-full h-full object-contain pointer-events-none filter drop-shadow-xl" draggable={false} />
                    ) : el.type === 'bubble' ? (
                      <div className={`w-full h-full flex items-center justify-center text-center p-3 relative ${BUBBLE_STYLES.find(s => s.id === el.data.styleId)?.class}`}>
                        <textarea 
                          className="bg-transparent border-none outline-none resize-none text-black font-bold manga-font w-full h-full text-center leading-none flex items-center justify-center p-0 m-0 overflow-hidden text-sm"
                          value={el.data.text}
                          onChange={(e) => updateElement(el.id, { data: { ...el.data, text: e.target.value } })}
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="absolute bottom-[-8px] left-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-black rotate-45 -translate-x-1/2 shadow-sm" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pages Navigator */}
      <aside className="w-24 bg-white border-l border-slate-200 flex flex-col items-center py-6 gap-5 shadow-inner overflow-y-auto custom-scrollbar">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest vertical-rl mb-2">CHAPTER</h3>
        {project.pages.map((p, idx) => (
          <button 
            key={p.pageNumber}
            onClick={() => setCurrentPageIdx(idx)}
            className={`w-16 h-24 rounded-xl border-[3px] transition-all flex flex-col items-center justify-center gap-1 shadow-sm ${currentPageIdx === idx ? 'border-black bg-slate-900 text-white shadow-xl scale-110 z-10' : 'border-slate-100 bg-white text-slate-300 hover:border-slate-400'}`}
          >
            <span className="text-[11px] font-black">{p.pageNumber}</span>
            <div className={`w-10 h-14 bg-current opacity-10 rounded shadow-inner ${currentPageIdx === idx ? 'opacity-30' : ''}`} />
          </button>
        ))}
        <div className="mt-auto p-4 opacity-20 hover:opacity-100 transition-opacity">
           <LayoutIcon className="w-6 h-6" />
        </div>
      </aside>
    </div>
  );
};

export default MangaEditor;
