export type AspectRatio = '3:4' | '16:9' | '9:16';

export interface Position {
  x: number;
  y: number;
}

export interface SceneModule {
  id: string;
  title: string;
  imageUrl?: string;
  notes: string;
  position: Position;
  aspectRatio: AspectRatio;
  parentId?: string;
  isExpanded?: boolean;
  isSubscene?: boolean;
  isVisible?: boolean;
}

export interface SequenceModule {
  id: string;
  title: string;
  storyContext: string;
  scenes: SceneModule[];
  position: Position;
  isCollapsed: boolean;
  aspectRatio: AspectRatio;
  layoutDirection: 'horizontal' | 'vertical';
  isVisible?: boolean;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  fromType: 'sequence' | 'scene';
  toType: 'sequence' | 'scene';
}

export interface PromptStyle {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string;
  category: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  sequences: SequenceModule[];
  connections: Connection[];
  prompts: PromptStyle[];
  promptCategories: string[];
  canvasBg: 'light' | 'medium' | 'dark' | 'black' | 'dark-gray' | 'light-gray' | 'white';
}

export interface CanvasState {
  zoom: number;
  panOffset: Position;
  selectedId: string | null;
  selectedType: 'sequence' | 'scene' | null;
}
