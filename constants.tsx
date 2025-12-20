
import { Layout } from './types';

export const PANEL_LAYOUTS: Layout[] = [
  { 
    id: 'full', 
    name: 'Full Page', 
    panels: [{ id: 'p1', top: '0', left: '0', width: '100%', height: '100%' }] 
  },
  { 
    id: 'ref-image-1', 
    name: 'Dynamic Skew', 
    panels: [
      { id: 'p1', top: '0', left: '0', width: '33%', height: '33%', clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' },
      { id: 'p2', top: '0', left: '35%', width: '65%', height: '33%', clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)' },
      { id: 'p3', top: '35%', left: '0', width: '100%', height: '30%', clipPath: 'polygon(0 0, 100% 5%, 100% 95%, 0 100%)' },
      { id: 'p4', top: '67%', left: '0', width: '25%', height: '33%' },
      { id: 'p5', top: '67%', left: '27%', width: '40%', height: '33%', clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' },
      { id: 'p6', top: '67%', left: '69%', width: '31%', height: '33%', clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)' },
    ] 
  },
  { 
    id: 'ref-image-2', 
    name: 'Action Grid', 
    panels: [
      { id: 'p1', top: '0', left: '0', width: '100%', height: '22%' },
      { id: 'p2', top: '24%', left: '0', width: '30%', height: '42%' },
      { id: 'p3', top: '24%', left: '32%', width: '68%', height: '42%' },
      { id: 'p4', top: '68%', left: '0', width: '55%', height: '15%' },
      { id: 'p5', top: '85%', left: '0', width: '50%', height: '15%', clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' },
      { id: 'p6', top: '68%', left: '57%', width: '43%', height: '32%', clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' },
    ] 
  },
  {
    id: 'classic-3',
    name: 'Classic 3',
    panels: [
      { id: 'p1', top: '0', left: '0', width: '100%', height: '30%' },
      { id: 'p2', top: '32%', left: '0', width: '48%', height: '68%' },
      { id: 'p3', top: '32%', left: '52%', width: '48%', height: '68%' },
    ]
  }
];

export const GENRES = [
  'Action', 'Fantasy', 'Romance', 'Slice of Life', 'Horror', 'Sci-Fi'
];

export const ART_STYLES = [
  'Manga B&W', 'Soft Manga', 'Anime-like'
];

export const BUBBLE_STYLES = [
  { id: 'speech', label: 'Speech', class: 'border-2 border-black rounded-[50%] bg-white p-4 shadow-md' },
  { id: 'thought', label: 'Thought', class: 'border-2 border-dashed border-black rounded-[40%] bg-white p-4 shadow-md' },
  { id: 'shout', label: 'Shout', class: 'border-4 border-black polygon-[...] bg-white p-4 shadow-xl' },
];
