export type AspectRatio = '16:9' | '9:16' | '4:3';
export type ProjectStatus = 'Ideia' | 'Planejamento' | 'Em progresso' | 'Finalizado' | 'Arquivado';

export interface ChecklistStep {
  id: string;
  label: string;
  completed: boolean;
}


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
  scenesSpacing?: 'normal' | 'none';
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
  moodboard?: MoodBoardItem[];
  description?: string;
  script?: string;
  scriptMode?: 'simple' | 'structured';
  structuredScript?: ScriptScene[];
  status: ProjectStatus;
  progress: number;
  tags: ProjectTag[];
  checklist: ChecklistStep[];
  coverImage?: string;
  deadline?: Date;
}

export interface ProjectTag {
  id: string;
  label: string;
  color: string;
}

export interface ScriptScene {
  id: string;
  content: string;
  isCompleted: boolean;
}

export interface MoodBoardItem {
  id: string;
  type: 'image';
  content: string;
  position: Position;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

export interface CanvasState {
  zoom: number;
  panOffset: Position;
  selectedId: string | null;
  selectedType: 'sequence' | 'scene' | null;
}
