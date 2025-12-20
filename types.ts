
export type ArtStyle = 'Manga B&W' | 'Soft Manga' | 'Anime-like';

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

export interface PanelDefinition {
  id: string;
  top: string;
  left: string;
  width: string;
  height: string;
  clipPath?: string;
}

export interface Layout {
  id: string;
  name: string;
  panels: PanelDefinition[];
}

export interface StoryPage {
  pageNumber: number;
  description: string;
  elements: CanvasElement[];
  layoutId: string;
  panelImages: Record<string, string>; // Maps panel ID to background image URL
}

export interface CanvasElement {
  id: string;
  type: 'character' | 'background' | 'bubble' | 'text' | 'sfx';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  data: any; // e.g., imageUrl, textContent, style
  zIndex: number;
}

export interface MangaProject {
  id: string;
  title: string;
  genre: string;
  artStyle: ArtStyle;
  mainCharacter?: Character;
  sideCharacters: Character[];
  pages: StoryPage[];
}

export enum Step {
  SETUP = 'setup',
  CHARACTERS = 'characters',
  STORY = 'story',
  EDITOR = 'editor',
  EXPORT = 'export'
}
