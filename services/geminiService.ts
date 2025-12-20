
import { GoogleGenAI, Type } from "@google/genai";
import { ArtStyle, Character, StoryPage } from "../types";

// Fix: AI instantiation moved inside functions to comply with the rule of using the most up-to-date API key from the environment.

export const generateCharacterDetails = async (name: string, description: string, artStyle: ArtStyle) => {
  // Fix: Instantiate right before call using strict apiKey parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Generate a detailed character profile and image prompt for a manga character. 
    Name: ${name}
    Description: ${description}
    Art Style: ${artStyle}
    Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personality: { type: Type.STRING },
          visualPrompt: { type: Type.STRING },
          traits: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["personality", "visualPrompt"]
      }
    }
  });
  // Fix: Directly access .text property
  return JSON.parse(response.text || '{}');
};

export const generateCharacterImage = async (prompt: string, artStyle: ArtStyle) => {
  // Fix: Instantiate right before call using strict apiKey parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image';
  const fullPrompt = `${artStyle} style: ${prompt}. High quality manga illustration, clean lines.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: fullPrompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  // Fix: Iterate through parts to find image data
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateSideCharacters = async (mainChar: Character, genre: string, artStyle: ArtStyle) => {
  // Fix: Instantiate right before call using strict apiKey parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Based on the main character ${mainChar.name} (${mainChar.description}) in a ${genre} manga, generate 3 side characters (e.g., rival, friend, mentor). Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            description: { type: Type.STRING },
            visualPrompt: { type: Type.STRING }
          },
          required: ["name", "role", "description", "visualPrompt"]
        }
      }
    }
  });
  // Fix: Directly access .text property
  return JSON.parse(response.text || '[]');
};

export const generateStoryline = async (title: string, mainChar: Character, pageCount: number, tone: string) => {
  // Fix: Instantiate right before call using strict apiKey parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Create a ${pageCount} page manga storyline for "${title}". 
    Main Character: ${mainChar.name}
    Tone: ${tone}
    Provide a brief scene description for each page.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            pageNumber: { type: Type.NUMBER },
            description: { type: Type.STRING },
            suggestedDialogue: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["pageNumber", "description"]
        }
      }
    }
  });
  // Fix: Directly access .text property
  return JSON.parse(response.text || '[]');
};

export const generateSceneAssets = async (pageDescription: string, artStyle: ArtStyle) => {
  // Fix: Instantiate right before call using strict apiKey parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image';
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: `${artStyle} background for: ${pageDescription}. Empty background without characters.` }] },
    config: { imageConfig: { aspectRatio: "3:4" } }
  });

  // Fix: Iterate through parts to find image data
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
