import { useState, useCallback, useEffect } from 'react';
import { Project, SequenceModule, SceneModule, Connection, PromptStyle, AspectRatio, Position } from '@/types/storyboard';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultProject = (): Project => ({
  id: generateId(),
  name: 'Novo Projeto',
  createdAt: new Date(),
  updatedAt: new Date(),
  sequences: [],
  connections: [],
  prompts: [],
  promptCategories: [],
  canvasBg: 'light',
});

export function useProject() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('storyflow_projects');
    let initialProjects: Project[] = [createDefaultProject()];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialProjects = parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
        }
      } catch (e) {
        console.error('Failed to parse projects from localStorage', e);
      }
    }
    return {
      past: [] as Project[][],
      present: initialProjects,
      future: [] as Project[][]
    };
  });

  const projects = history.present;

  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('storyflow_current_project_id');
    const projectExists = saved && projects.find(p => p.id === saved);
    return projectExists ? saved : (projects[0]?.id || '');
  });

  const setProjects = useCallback((updater: Project[] | ((prev: Project[]) => Project[]), saveHistory = true) => {
    setHistory(current => {
      const nextPresent = typeof updater === 'function' ? updater(current.present) : updater;

      if (!saveHistory) {
        return { ...current, present: nextPresent };
      }

      return {
        past: [...current.past, current.present].slice(-50),
        present: nextPresent,
        future: []
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(current => {
      if (current.past.length === 0) return current;
      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, current.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(current => {
      if (current.future.length === 0) return current;
      const next = current.future[0];
      const newFuture = current.future.slice(1);
      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Persistence
  useEffect(() => {
    localStorage.setItem('storyflow_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('storyflow_current_project_id', currentProjectId);
  }, [currentProjectId]);

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0] || createDefaultProject();

  const updateProject = useCallback((updates: Partial<Project>, saveHistory = true) => {
    setProjects(prev => prev.map(p =>
      p.id === currentProjectId
        ? { ...p, ...updates, updatedAt: new Date() }
        : p
    ), saveHistory);
  }, [currentProjectId, setProjects]);

  // Project management
  const createProject = useCallback((name: string) => {
    const newProject = { ...createDefaultProject(), name };
    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    return newProject;
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (filtered.length === 0) {
        const defaultProject = createDefaultProject();
        setCurrentProjectId(defaultProject.id);
        return [defaultProject];
      }
      if (id === currentProjectId) {
        setCurrentProjectId(filtered[0].id);
      }
      return filtered;
    });
  }, [currentProjectId]);

  const renameProject = useCallback((id: string, name: string) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, name, updatedAt: new Date() } : p
    ));
  }, []);

  // Canvas background
  const setCanvasBg = useCallback((bg: 'light' | 'medium' | 'dark') => {
    updateProject({ canvasBg: bg });
  }, [updateProject]);

  // Sequence management
  const addSequence = useCallback((position: Position) => {
    const newSequence: SequenceModule = {
      id: generateId(),
      title: `Sequência ${currentProject.sequences.length + 1}`,
      storyContext: '',
      scenes: [],
      position,
      isCollapsed: false,
      aspectRatio: '16:9',
      layoutDirection: 'horizontal',
      isVisible: true,
    };
    updateProject({ sequences: [...currentProject.sequences, newSequence] });
    return newSequence;
  }, [currentProject.sequences, updateProject]);

  const updateSequence = useCallback((id: string, updates: Partial<SequenceModule>, saveHistory = true) => {
    updateProject({
      sequences: currentProject.sequences.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }, saveHistory);
  }, [currentProject.sequences, updateProject]);

  const deleteSequence = useCallback((id: string) => {
    console.log('Deletando sequência:', id);
    console.log('Sequências antes:', currentProject.sequences.length);
    const newSequences = currentProject.sequences.filter(s => s.id !== id);
    const newConnections = currentProject.connections.filter(c => c.fromId !== id && c.toId !== id);
    console.log('Sequências depois:', newSequences.length);
    updateProject({
      sequences: newSequences,
      connections: newConnections,
    }, true);
  }, [currentProject.sequences, currentProject.connections, updateProject]);

  const toggleCollapseSequence = useCallback((id: string) => {
    updateProject({
      sequences: currentProject.sequences.map(s =>
        s.id === id ? { ...s, isCollapsed: !s.isCollapsed } : s
      ),
    });
  }, [currentProject.sequences, updateProject]);

  const toggleSequenceVisibility = useCallback((id: string) => {
    updateProject({
      sequences: currentProject.sequences.map(s =>
        s.id === id ? { ...s, isVisible: s.isVisible === false ? true : false } : s
      ),
    });
  }, [currentProject.sequences, updateProject]);

  // Scene management
  const addScene = useCallback((sequenceId: string, position: Position, parentId?: string, isSubscene?: boolean) => {
    const sequence = currentProject.sequences.find(s => s.id === sequenceId);
    if (!sequence) return null;

    const newScene: SceneModule = {
      id: generateId(),
      title: isSubscene ? `Sub-Cena ${sequence.scenes.filter(s => s.parentId === parentId).length + 1}` : `Cena ${sequence.scenes.filter(s => !s.parentId).length + 1}`,
      notes: '',
      position,
      aspectRatio: sequence.aspectRatio,
      parentId,
      isSubscene,
      isExpanded: true,
      isVisible: true,
    };

    updateProject({
      sequences: currentProject.sequences.map(s =>
        s.id === sequenceId
          ? { ...s, scenes: [...s.scenes, newScene] }
          : s
      ),
    });
    return newScene;
  }, [currentProject.sequences, updateProject]);

  const updateScene = useCallback((sequenceId: string, sceneId: string, updates: Partial<SceneModule>) => {
    updateProject({
      sequences: currentProject.sequences.map(s =>
        s.id === sequenceId
          ? { ...s, scenes: s.scenes.map(sc => sc.id === sceneId ? { ...sc, ...updates } : sc) }
          : s
      ),
    });
  }, [currentProject.sequences, updateProject]);

  const deleteScene = useCallback((sequenceId: string, sceneId: string) => {
    updateProject({
      sequences: currentProject.sequences.map(s =>
        s.id === sequenceId
          ? { ...s, scenes: s.scenes.filter(sc => sc.id !== sceneId) }
          : s
      ),
      connections: currentProject.connections.filter(c => c.fromId !== sceneId && c.toId !== sceneId),
    });
  }, [currentProject.sequences, currentProject.connections, updateProject]);

  const toggleSceneVisibility = useCallback((sequenceId: string, sceneId: string) => {
    updateProject({
      sequences: currentProject.sequences.map(s =>
        s.id === sequenceId
          ? {
            ...s,
            scenes: s.scenes.map(sc =>
              sc.id === sceneId ? { ...sc, isVisible: sc.isVisible === false ? true : false } : sc
            )
          }
          : s
      ),
    });
  }, [currentProject.sequences, updateProject]);

  // Connection management
  const addConnection = useCallback((
    fromId: string,
    toId: string,
    fromType: 'sequence' | 'scene',
    toType: 'sequence' | 'scene'
  ) => {
    const newConnection: Connection = {
      id: generateId(),
      fromId,
      toId,
      fromType,
      toType,
    };
    updateProject({ connections: [...currentProject.connections, newConnection] });
    return newConnection;
  }, [currentProject.connections, updateProject]);

  const deleteConnection = useCallback((id: string) => {
    updateProject({
      connections: currentProject.connections.filter(c => c.id !== id),
    });
  }, [currentProject.connections, updateProject]);

  // Prompt management
  const addPromptCategory = useCallback((category: string) => {
    if (!currentProject.promptCategories?.includes(category)) {
      updateProject({ promptCategories: [...(currentProject.promptCategories || []), category] });
    }
  }, [currentProject.promptCategories, updateProject]);

  const deletePromptCategory = useCallback((category: string) => {
    updateProject({
      promptCategories: (currentProject.promptCategories || []).filter(c => c !== category),
      prompts: currentProject.prompts.filter(p => p.category !== category)
    });
  }, [currentProject.promptCategories, currentProject.prompts, updateProject]);

  const addPrompt = useCallback((prompt: Omit<PromptStyle, 'id'>) => {
    const newPrompt: PromptStyle = {
      id: generateId(),
      ...prompt,
    };
    updateProject({ prompts: [...currentProject.prompts, newPrompt] });
    return newPrompt;
  }, [currentProject.prompts, updateProject]);

  const updatePrompt = useCallback((id: string, updates: Partial<PromptStyle>) => {
    updateProject({
      prompts: currentProject.prompts.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    });
  }, [currentProject.prompts, updateProject]);

  const deletePrompt = useCallback((id: string) => {
    updateProject({
      prompts: currentProject.prompts.filter(p => p.id !== id),
    });
  }, [currentProject.prompts, updateProject]);

  return {
    projects,
    currentProject,
    currentProjectId,
    setCurrentProjectId,
    createProject,
    deleteProject,
    renameProject,
    setCanvasBg,
    addSequence,
    updateSequence,
    deleteSequence,
    toggleCollapseSequence,
    toggleSequenceVisibility,
    addScene,
    updateScene,
    deleteScene,
    toggleSceneVisibility,
    addConnection,
    deleteConnection,
    addPrompt,
    updatePrompt,
    deletePrompt,
    addPromptCategory,
    deletePromptCategory,
    undo,
    redo,
    canUndo,
    canRedo
  };
}
