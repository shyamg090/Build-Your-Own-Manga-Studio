
import React, { useState, useEffect } from 'react';
import { MangaProject, Step, Character, StoryPage } from './types';
import ProjectSetup from './components/ProjectSetup';
import CharacterCreator from './components/CharacterCreator';
import StoryGenerator from './components/StoryGenerator';
import MangaEditor from './components/MangaEditor';
import { Book, ChevronRight, Save, Download, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [project, setProject] = useState<MangaProject | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(Step.SETUP);
  const [loading, setLoading] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('byoms_project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProject(parsed);
        // Determine step based on project progress
        if (parsed.pages?.length > 0) setCurrentStep(Step.EDITOR);
        else if (parsed.mainCharacter) setCurrentStep(Step.STORY);
        else if (parsed.id) setCurrentStep(Step.CHARACTERS);
      } catch (e) {
        console.error("Failed to parse saved project", e);
      }
    }
  }, []);

  // Save to local storage on project change
  useEffect(() => {
    if (project) {
      localStorage.setItem('byoms_project', JSON.stringify(project));
    }
  }, [project]);

  const resetProject = () => {
    if (confirm("Are you sure? This will delete your current progress.")) {
      localStorage.removeItem('byoms_project');
      setProject(null);
      setCurrentStep(Step.SETUP);
    }
  };

  const handleProjectSetup = (data: Partial<MangaProject>) => {
    const newProject: MangaProject = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title || 'My New Manga',
      genre: data.genre || 'Action',
      artStyle: data.artStyle || 'Manga B&W',
      sideCharacters: [],
      pages: []
    };
    setProject(newProject);
    setCurrentStep(Step.CHARACTERS);
  };

  const handleCharacterComplete = (main: Character, sides: Character[]) => {
    setProject(prev => prev ? { ...prev, mainCharacter: main, sideCharacters: sides } : null);
    setCurrentStep(Step.STORY);
  };

  const handleStoryComplete = (pages: StoryPage[]) => {
    setProject(prev => prev ? { ...prev, pages } : null);
    setCurrentStep(Step.EDITOR);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-black p-2 rounded-lg">
            <Book className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter manga-font">BYOMS</h1>
        </div>
        
        {project && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-slate-500 font-medium">Currently Editing</span>
              <span className="font-bold text-slate-800">{project.title}</span>
            </div>
            <button 
              onClick={resetProject}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Reset Project"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <button 
              className="bg-black text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 transition-all text-sm"
              onClick={() => alert("Auto-saved to local storage!")}
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {!project && currentStep === Step.SETUP && (
          <ProjectSetup onComplete={handleProjectSetup} />
        )}

        {project && currentStep === Step.CHARACTERS && (
          <CharacterCreator 
            artStyle={project.artStyle} 
            genre={project.genre}
            onComplete={handleCharacterComplete} 
          />
        )}

        {project && currentStep === Step.STORY && project.mainCharacter && (
          <StoryGenerator 
            project={project} 
            onComplete={handleStoryComplete} 
          />
        )}

        {project && currentStep === Step.EDITOR && (
          <MangaEditor 
            project={project} 
            setProject={setProject}
          />
        )}
      </main>

      {/* Step Indicator */}
      {project && (
        <footer className="bg-white border-t border-slate-200 px-6 py-3 flex justify-center items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-400 overflow-x-auto">
          <div className={`flex items-center gap-2 ${currentStep === Step.CHARACTERS ? 'text-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${currentStep === Step.CHARACTERS ? 'border-black bg-black text-white' : 'border-slate-300'}`}>1</span>
            Characters
          </div>
          <ChevronRight className="w-4 h-4" />
          <div className={`flex items-center gap-2 ${currentStep === Step.STORY ? 'text-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${currentStep === Step.STORY ? 'border-black bg-black text-white' : 'border-slate-300'}`}>2</span>
            Story
          </div>
          <ChevronRight className="w-4 h-4" />
          <div className={`flex items-center gap-2 ${currentStep === Step.EDITOR ? 'text-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${currentStep === Step.EDITOR ? 'border-black bg-black text-white' : 'border-slate-300'}`}>3</span>
            Canvas
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
