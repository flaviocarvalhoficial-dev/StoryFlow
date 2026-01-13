import { useState, useCallback, useEffect } from 'react';
import { Project, SequenceModule, SceneModule, Connection, PromptStyle, AspectRatio, Position, MoodBoardItem } from '@/types/storyboard';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultProject = (): Project => ({
  id: generateId(),
  name: 'Novo Projeto',
  description: '',
  status: 'Ideia',
  progress: 0,
  tags: [],
  checklist: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  sequences: [],
  connections: [],
  prompts: [],
  promptCategories: [],
  canvasBg: 'light',
  moodboard: [],
});

export function useProject() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('storyflow_projects');
    let initialProjects: Project[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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
  const createProject = useCallback((name: string, initialData?: Partial<Project>) => {
    const newProject = { ...createDefaultProject(), name, ...initialData };
    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    return newProject;
  }, [setProjects]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (id === currentProjectId) {
        setCurrentProjectId(filtered[0]?.id || '');
      }
      return filtered;
    });
  }, [currentProjectId, setProjects]);

  const updateProjectMeta = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;

      let newProject = { ...p, ...updates, updatedAt: new Date() };

      // Auto-calculate progress if checklist is updated
      if (updates.checklist) {
        const total = updates.checklist.length;
        const completed = updates.checklist.filter(s => s.completed).length;
        newProject.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      }

      return newProject;
    }));
  }, [setProjects]);

  // Canvas background
  const setCanvasBg = useCallback((bg: 'light' | 'medium' | 'dark') => {
    updateProject({ canvasBg: bg });
  }, [updateProject]);

  // Sequence management
  const addSequence = useCallback((position: Position, aspectRatio?: '16:9' | '9:16' | '4:3') => {
    const newSequence: SequenceModule = {
      id: generateId(),
      title: `Sequência ${currentProject.sequences.length + 1}`,
      storyContext: '',
      scenes: [],
      position,
      isCollapsed: false,
      aspectRatio: aspectRatio || '16:9',
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

  const duplicateSequence = useCallback((id: string) => {
    const sequenceToDuplicate = currentProject.sequences.find(s => s.id === id);
    if (!sequenceToDuplicate) return;

    // Create a map of old scene IDs to new scene IDs to handle subscene relationships
    const sceneIdMap = new Map<string, string>();
    sequenceToDuplicate.scenes.forEach(scene => {
      sceneIdMap.set(scene.id, generateId());
    });

    const newScenes = sequenceToDuplicate.scenes.map(scene => ({
      ...scene,
      id: sceneIdMap.get(scene.id)!,
      // If it has a parentId (is a subscene), map it to the new parent's ID. 
      // If the parent isn't in this sequence (shouldn't happen for valid subscenes), keep it undefined or as is? 
      // Assuming valid structure where subscenes adhere to parent scenes within the same sequence.
      parentId: scene.parentId ? sceneIdMap.get(scene.parentId) : undefined,
    }));

    const newSequence: SequenceModule = {
      ...sequenceToDuplicate,
      id: generateId(),
      title: `${sequenceToDuplicate.title} (Cópia)`,
      position: {
        x: sequenceToDuplicate.position.x + 50,
        y: sequenceToDuplicate.position.y + 50,
      },
      scenes: newScenes,
    };

    updateProject({ sequences: [...currentProject.sequences, newSequence] });
  }, [currentProject.sequences, updateProject]);

  const addMoodBoardItem = useCallback((item: MoodBoardItem) => {
    updateProject({ moodboard: [...(currentProject.moodboard || []), item] });
  }, [currentProject.moodboard, updateProject]);

  const updateMoodBoardItem = useCallback((id: string, updates: Partial<MoodBoardItem>) => {
    updateProject({
      moodboard: (currentProject.moodboard || []).map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    });
  }, [currentProject.moodboard, updateProject]);

  const deleteMoodBoardItem = useCallback((id: string) => {
    updateProject({
      moodboard: (currentProject.moodboard || []).filter(item => item.id !== id)
    });
  }, [currentProject.moodboard, updateProject]);

  return {
    projects,
    currentProject,
    currentProjectId,
    setCurrentProjectId,
    createProject,
    deleteProject,
    updateProjectMeta,
    setCanvasBg,
    addSequence,
    updateSequence,
    deleteSequence,
    duplicateSequence,
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
    addMoodBoardItem,
    updateMoodBoardItem,
    deleteMoodBoardItem,
    undo,
    redo,
    canUndo,
    canRedo
  };
}
