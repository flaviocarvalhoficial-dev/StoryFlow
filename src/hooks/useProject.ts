import { useState, useCallback, useEffect } from 'react';
import { Project, SequenceModule, SceneModule, Connection, PromptStyle, Position, MoodBoardItem } from '@/types/storyboard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const generateId = () => crypto.randomUUID();

export function useProject() {
  const { user } = useAuth();
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectIdState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load currentProjectId from localStorage (just for session persistence)
  useEffect(() => {
    const saved = localStorage.getItem('storyflow_current_project_id');
    if (saved) setCurrentProjectIdState(saved);
  }, []);

  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('storyflow_current_project_id', currentProjectId);
    }
  }, [currentProjectId]);

  // Fetch projects list (Lightweight)
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_tags (*),
          checklist_steps (*)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setProjectsState(prev => {
          // Merge strategy: Keep existing details if project exists in state, update metadata
          const currentMap = new Map(prev.map(p => [p.id, p]));

          return data.map((p: any) => {
            const existing = currentMap.get(p.id);

            // Base Project Data
            const baseData = {
              id: p.id,
              name: p.name,
              description: p.description,
              status: p.status,
              progress: p.progress,
              createdAt: new Date(p.created_at),
              updatedAt: new Date(p.updated_at),
              canvasBg: p.canvas_bg,
              coverImage: p.cover_image,
              scriptMode: p.script_mode,
              structuredScript: p.structured_script,
              user_id: p.user_id,
              tags: p.project_tags || [],
              checklist: p.checklist_steps || [],
              promptCategories: p.prompt_categories || [],
            };

            // Preserve loaded heavy data if it exists, otherwise initialize empty
            return {
              ...baseData,
              sequences: existing?.sequences || [],
              connections: existing?.connections || [],
              prompts: existing?.prompts || [],
              moodboard: existing?.moodboard || [],
            } as Project;
          });
        });

        // Initial selection logic relies on state; might need adjusting if state update is async, 
        // but useEffect below handles currentProjectId changes.
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Erro ao carregar projetos.');
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Removed currentProjectId

  // Fetch full details for a single project
  const fetchProjectDetails = useCallback(async (projectId: string) => {
    if (!user || !projectId) return;
    // Check if we need to load (optional optimization: track 'loaded' timestamp)

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
            sequences (
                *,
                scenes (*)
            ),
            connections (*),
            prompts (*),
            moodboard_items (*)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;

      if (data) {
        const mappedSequences = (data.sequences || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          storyContext: s.story_context,
          isCollapsed: s.is_collapsed,
          aspectRatio: s.aspect_ratio,
          layoutDirection: s.layout_direction,
          scenesSpacing: s.scenes_spacing,
          isVisible: s.is_visible !== false,
          position: { x: s.position_x || 0, y: s.position_y || 0 },
          scenes: (s.scenes || []).map((sc: any) => ({
            id: sc.id,
            title: sc.title,
            notes: sc.notes,
            imageUrl: sc.image_url,
            parentId: sc.parent_id,
            isExpanded: sc.is_expanded,
            isSubscene: sc.is_subscene,
            aspectRatio: sc.aspect_ratio,
            isVisible: sc.is_visible !== false,
            position: { x: sc.position_x || 0, y: sc.position_y || 0 }
          })).sort((a: any, b: any) => {
            if (a.position?.y !== b.position?.y) return (a.position?.y || 0) - (b.position?.y || 0);
            if (a.position?.x !== b.position?.x) return (a.position?.x || 0) - (b.position?.x || 0);
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          })
        }));

        const mappedConnections = (data.connections || []).map((c: any) => ({
          id: c.id,
          fromId: c.from_id,
          toId: c.to_id,
          fromType: c.from_type,
          toType: c.to_type
        }));

        const mappedPrompts = (data.prompts || []).map((pr: any) => ({
          ...pr,
          imageUrl: pr.image_url
        }));

        const mappedMoodboard = (data.moodboard_items || []).map((m: any) => ({
          ...m,
          imageUrl: m.image_url
        }));

        setProjectsState(prev => prev.map(p => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            sequences: mappedSequences,
            connections: mappedConnections,
            prompts: mappedPrompts,
            moodboard: mappedMoodboard
          };
        }));
      }

    } catch (e) {
      console.error("Error loading project details", e);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Lazy load details when project selected
  useEffect(() => {
    if (currentProjectId) {
      // Optimization: check if sequences are empty? 
      // But what if it's a new project with 0 sequences?
      // We can check a flag or just fetch. Fetching single project is cheap.
      // Let's check if we have data to avoid loop if possible, or naive fetch.
      // For robustness against "empty project" being confused with "not loaded", 
      // we might ideally have a `_loaded` flag. 
      // Given constraints, we'll fetch every time we switch project ID, which is reasonable behavior (refresh data).
      fetchProjectDetails(currentProjectId);
    }
  }, [currentProjectId, fetchProjectDetails]);

  // Derived state
  const currentProject = projects.find(p => p.id === currentProjectId) || null;

  // -- CRUD Operations --

  // 1. Create Project
  const createProject = useCallback(async (name: string, initialData?: Partial<Project>) => {
    if (!user) return;
    try {
      // Separate relations and non-column data
      const { tags, checklist, sequences, connections, prompts, moodboard, ...projectData } = initialData || {} as any;

      const newProject = {
        name,
        user_id: user.id,
        status: 'Ideia',
        progress: 0,
        canvas_bg: 'light',
        // Map other scalar fields if present in initialData
        description: projectData.description,
        script: projectData.script,
        script_mode: projectData.scriptMode,
        structured_script: projectData.structuredScript, // Assuming this IS a JSONB column in projects
        cover_image: projectData.coverImage,
        deadline: projectData.deadline
      };

      // Clean undefineds
      Object.keys(newProject).forEach(key => (newProject as any)[key] === undefined && delete (newProject as any)[key]);

      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();

      if (error) throw error;

      const projectId = data.id;

      // Insert related data if present
      if (tags && tags.length > 0) {
        const tagsPayload = tags.map((t: any) => ({
          project_id: projectId,
          label: t.label,
          color: t.color
        }));
        await supabase.from('project_tags').insert(tagsPayload);
      }

      if (checklist && checklist.length > 0) {
        const checklistPayload = checklist.map((c: any) => ({
          project_id: projectId,
          label: c.label,
          completed: c.completed
        }));
        await supabase.from('checklist_steps').insert(checklistPayload);
      }

      // We ignore other relations (sequences, etc) for "Create Project" usually, 
      // unless duplicating, which needs a separate deep copy logic.
      // For a fresh "New Project", these are usually empty.

      await fetchProjects();
      setCurrentProjectIdState(projectId);
      return data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(`Erro ao criar projeto: ${error.message || 'Erro desconhecido'}`);
    }
  }, [user, fetchProjects]);

  // 2. Delete Project
  const deleteProject = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      await fetchProjects();
      if (currentProjectId === id) setCurrentProjectIdState('');
      toast.success('Projeto deletado.');
    } catch (error) {
      toast.error('Erro ao deletar projeto.');
    }
  }, [fetchProjects, currentProjectId]);

  // 3. Update Project Meta
  const updateProjectMeta = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      // Map keys to snake_case
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
      if (updates.canvasBg) dbUpdates.canvas_bg = updates.canvasBg;
      if (updates.coverImage) dbUpdates.cover_image = updates.coverImage;
      if (updates.script) dbUpdates.script = updates.script;
      if (updates.scriptMode) dbUpdates.script_mode = updates.scriptMode;
      if (updates.structuredScript) dbUpdates.structured_script = updates.structuredScript;
      if (updates.promptCategories) dbUpdates.prompt_categories = updates.promptCategories;

      // 3.1. Handle Checklist Updates (Relation) & Progress Calculation
      if (updates.checklist) {
        // Calculate new progress
        const total = updates.checklist.length;
        const completed = updates.checklist.filter(s => s.completed).length;
        const newProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

        dbUpdates.progress = newProgress;

        // Replace checklist steps in DB
        // First delete all steps for this project (simple sync strategy)
        const { error: delError } = await supabase
          .from('checklist_steps')
          .delete()
          .eq('project_id', id);

        if (delError) throw delError;

        // Then insert new ones
        if (updates.checklist.length > 0) {
          const checklistPayload = updates.checklist.map((c: any) => ({
            project_id: id,
            label: c.label,
            completed: c.completed
          }));
          const { error: insError } = await supabase
            .from('checklist_steps')
            .insert(checklistPayload);

          if (insError) throw insError;
        }
      }

      // 3.2. Handle Tags Updates
      if (updates.tags) {
        // Replace tags
        const { error: delError } = await supabase.from('project_tags').delete().eq('project_id', id);
        if (delError) throw delError;

        if (updates.tags.length > 0) {
          const tagsPayload = updates.tags.map((t: any) => ({
            project_id: id,
            label: t.label,
            color: t.color
          }));
          const { error: insError } = await supabase.from('project_tags').insert(tagsPayload);
          if (insError) throw insError;
        }
      }

      // 3.3. Execute Main Project Update (Once)
      if (Object.keys(dbUpdates).length > 0) {
        const { error: projectError } = await supabase
          .from('projects')
          .update(dbUpdates)
          .eq('id', id);

        if (projectError) throw projectError;
      }

      // Optimistic update
      setProjectsState(prev => prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...updates,
          progress: dbUpdates.progress !== undefined ? dbUpdates.progress : p.progress,
          updatedAt: new Date()
        };
      }));
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Erro ao atualizar projeto");
    }
  }, []);

  const setCanvasBg = useCallback((bg: 'light' | 'medium' | 'dark') => {
    if (currentProjectId) updateProjectMeta(currentProjectId, { canvasBg: bg });
  }, [currentProjectId, updateProjectMeta]);


  // 4. Sequences


  // History State
  interface HistoryCommand {
    undo: () => Promise<void>;
    redo: () => Promise<void>;
  }
  const [past, setPast] = useState<HistoryCommand[]>([]);
  const [future, setFuture] = useState<HistoryCommand[]>([]);

  // Clear history on project change
  useEffect(() => {
    setPast([]);
    setFuture([]);
  }, [currentProjectId]);

  const addToHistory = (cmd: HistoryCommand) => {
    setPast(prev => [...prev, cmd]);
    setFuture([]);
  };

  const undo = useCallback(async () => {
    if (past.length === 0) return;
    const cmd = past[past.length - 1];
    setPast(prev => prev.slice(0, -1));

    try {
      await cmd.undo();
      setFuture(prev => [cmd, ...prev]);
    } catch (e) {
      console.error("Undo failed", e);
      // Revert state if failed?
    }
  }, [past]);

  const redo = useCallback(async () => {
    if (future.length === 0) return;
    const cmd = future[0];
    setFuture(prev => prev.slice(1));

    try {
      await cmd.redo();
      setPast(prev => [...prev, cmd]);
    } catch (e) {
      console.error("Redo failed", e);
    }
  }, [future]);

  // ... (previous code)

  // 4. Sequences (Modified for History)
  // We accept `trackHistory` default true. When undoing/redoing, we pass false.
  const updateSequence = useCallback(async (id: string, updates: Partial<SequenceModule>, trackHistory = true, previousStateOverride?: any) => {
    try {
      // 1. Capture Previous State for History
      if (trackHistory && currentProjectId) {
        const project = projects.find(p => p.id === currentProjectId);
        const sequence = project?.sequences.find(s => s.id === id);

        if (sequence) {
          const previousState = previousStateOverride || {
            title: sequence.title,
            storyContext: sequence.storyContext,
            isCollapsed: sequence.isCollapsed,
            position: sequence.position, // {x, y}
            aspectRatio: sequence.aspectRatio
          };

          // Only include keys that are being updated
          const relevantPrev: any = {};
          Object.keys(updates).forEach(k => {
            relevantPrev[k] = (previousState as any)[k];
          });

          addToHistory({
            undo: async () => updateSequence(id, relevantPrev, false),
            redo: async () => updateSequence(id, updates, false)
          });
        }
      }

      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.storyContext !== undefined) dbUpdates.story_context = updates.storyContext;
      if (updates.isCollapsed !== undefined) dbUpdates.is_collapsed = updates.isCollapsed;
      // Map position to x/y columns
      if (updates.position) {
        dbUpdates.position_x = updates.position.x;
        dbUpdates.position_y = updates.position.y;
      }
      if (updates.aspectRatio) dbUpdates.aspect_ratio = updates.aspectRatio;

      const { error } = await supabase.from('sequences').update(dbUpdates).eq('id', id);
      if (error) throw error;

      setProjectsState(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        return {
          ...p,
          sequences: p.sequences.map(s => s.id === id ? { ...s, ...updates } : s)
        }
      }));
    } catch (error) {
      console.error(error);
    }
  }, [currentProjectId, projects]); // Added projects dependency for snapshot

  const deleteSequence = useCallback(async (id: string, trackHistory = true) => {
    // 0. Preliminary Check & Capture State
    if (!currentProjectId) return;
    const project = projects.find(p => p.id === currentProjectId);
    const sequence = project?.sequences.find(s => s.id === id);

    if (!sequence) return;

    // 1. Optimistic Delete (Remove from UI immediately)
    setProjectsState(prev => prev.map(p => {
      if (p.id !== currentProjectId) return p;
      return {
        ...p,
        sequences: p.sequences.filter(s => s.id !== id),
        connections: p.connections.filter(c => c.fromId !== id && c.toId !== id)
      }
    }));

    try {
      // 2. Perform DB Deletion
      const { error } = await supabase.from('sequences').delete().eq('id', id);
      if (error) throw error;

      // 3. History Tracking (Post-success or Pre-success? Ideally pre, but here is fine)
      if (trackHistory) {
        // Define restoration command (Optimistic Restore)
        const restoreSequence = async () => {
          // Optimistic Restore UI
          setProjectsState(prev => prev.map(p => {
            if (p.id !== currentProjectId) return p;
            return { ...p, sequences: [...p.sequences, sequence] }; // Add back
          }));

          // Restore Sequence Record
          const { error: seqError } = await supabase.from('sequences').insert({
            id: sequence.id,
            project_id: currentProjectId,
            title: sequence.title,
            story_context: sequence.storyContext,
            position_x: sequence.position.x,
            position_y: sequence.position.y,
            aspect_ratio: sequence.aspectRatio,
            is_collapsed: sequence.isCollapsed
          });
          if (seqError) { console.error("Undo restore seq failed", seqError); return; }

          // Restore Scenes
          if (sequence.scenes.length > 0) {
            const scenesPayload = sequence.scenes.map(s => ({
              id: s.id,
              sequence_id: sequence.id,
              title: s.title,
              notes: s.notes,
              image_url: s.imageUrl,
              aspect_ratio: s.aspectRatio,
              is_expanded: s.isExpanded,
              is_subscene: s.isSubscene,
              parent_id: s.parentId,
              position_x: s.position?.x || 0,
              position_y: s.position?.y || 0
            }));
            const { error: sceneError } = await supabase.from('scenes').insert(scenesPayload);
            if (sceneError) console.error("Undo restore scenes failed", sceneError);
          }
        };

        addToHistory({
          undo: async () => restoreSequence(),
          redo: async () => deleteSequence(id, false) // Recurse to delete again, no history
        });
      }

    } catch (e) {
      toast.error('Erro ao deletar sequência');
      // Rollback (Add it back if delete failed)
      setProjectsState(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        return {
          ...p,
          sequences: [...p.sequences, sequence]
        };
      }));
    }
  }, [currentProjectId, projects]); // Removed fetchProjects dependency



  const addSequence = useCallback(async (position: Position, aspectRatio?: '16:9' | '9:16' | '4:3') => {
    if (!currentProjectId) return;

    const tempId = `temp-seq-${Date.now()}`;
    const optimisticSeq: SequenceModule = {
      id: tempId,
      title: 'Sequência',
      position,
      aspectRatio: aspectRatio || '16:9',
      isCollapsed: false,
      storyContext: '',
      scenes: [],
      layoutDirection: 'horizontal'
    };

    // 1. Optimistic Update
    setProjectsState(prev => prev.map(p => {
      if (p.id !== currentProjectId) return p;
      return { ...p, sequences: [...p.sequences, optimisticSeq] };
    }));

    try {
      const newSeq = {
        project_id: currentProjectId,
        title: 'Sequência',
        position_x: position.x,
        position_y: position.y,
        aspect_ratio: aspectRatio || '16:9',
        is_collapsed: false,
        story_context: ''
      };

      const { data, error } = await supabase.from('sequences').insert(newSeq).select().single();
      if (error) throw error;

      if (data) {
        // 2. Commit Update (Swap Temp ID)
        setProjectsState(prev => prev.map(p => {
          if (p.id !== currentProjectId) return p;
          return {
            ...p,
            sequences: p.sequences.map(s => s.id === tempId ? {
              ...s,
              id: data.id,
              // Sync any server-side defaults if necessary
            } : s)
          };
        }));

        // 3. History
        addToHistory({
          undo: async () => deleteSequence(data.id, false),
          redo: async () => addSequence(position, aspectRatio)
        });
      }
    } catch (error) {
      toast.error('Erro ao criar sequência');
      console.error(error);
      // Rollback
      setProjectsState(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        return { ...p, sequences: p.sequences.filter(s => s.id !== tempId) };
      }));
    }
  }, [currentProjectId, deleteSequence]);

  const toggleCollapseSequence = useCallback((id: string) => {
    const seq = currentProject?.sequences.find(s => s.id === id);
    if (seq) updateSequence(id, { isCollapsed: !seq.isCollapsed });
  }, [currentProject, updateSequence]);

  const toggleSequenceVisibility = useCallback((id: string) => {
    setProjectsState(prev => prev.map(p => {
      if (p.id !== currentProjectId) return p;
      return {
        ...p,
        sequences: p.sequences.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s)
      }
    }));
  }, [currentProjectId]);

  // 5. Scenes
  const addScene = useCallback(async (sequenceId: string, scene: Partial<SceneModule> = {}) => {
    const tempId = `temp-${Date.now()}`;
    const newSceneBase = {
      title: scene.title || 'Nova Cena',
      notes: scene.notes || '',
      position: scene.position || { x: 0, y: 0 },
      aspectRatio: scene.aspectRatio || '16:9',
      isSubscene: scene.isSubscene || false,
      isExpanded: scene.isExpanded || false,
      isVisible: true,
      parentId: scene.parentId,
      imageUrl: scene.imageUrl
    };

    const optimisticScene: SceneModule = {
      id: tempId,
      ...newSceneBase,
      title: newSceneBase.title, // Ensure compatibility
      position: newSceneBase.position,
      aspectRatio: newSceneBase.aspectRatio as any,
      notes: newSceneBase.notes,
      // ... any checks
    };

    // 1. Optimistic Update
    setProjectsState(prev => prev.map(p => {
      if (p.id !== currentProjectId) return p;
      return {
        ...p,
        sequences: p.sequences.map(s => {
          if (s.id !== sequenceId) return s;
          return {
            ...s,
            scenes: [...s.scenes, optimisticScene]
          };
        })
      };
    }));

    try {
      const dbPayload = {
        sequence_id: sequenceId,
        title: newSceneBase.title,
        notes: newSceneBase.notes,
        position_x: newSceneBase.position.x,
        position_y: newSceneBase.position.y,
        aspect_ratio: newSceneBase.aspectRatio,
        is_subscene: newSceneBase.isSubscene,
        is_expanded: newSceneBase.isExpanded,
        is_visible: true,
        parent_id: newSceneBase.parentId || null,
        image_url: newSceneBase.imageUrl
      };

      const { data, error } = await supabase.from('scenes').insert(dbPayload).select().single();
      if (error) throw error;

      // 2. Commit Update (Swap Temp ID for Real ID)
      if (data) {
        setProjectsState(prev => prev.map(p => {
          if (p.id !== currentProjectId) return p;
          return {
            ...p,
            sequences: p.sequences.map(s => {
              if (s.id !== sequenceId) return s;
              return {
                ...s,
                scenes: s.scenes.map(sc => sc.id === tempId ? {
                  ...sc,
                  id: data.id,
                  position: { x: data.position_x, y: data.position_y } // Ensure consistent shape
                } : sc)
              };
            })
          };
        }));

        // History for Creation (Undo = Delete)
        addToHistory({
          undo: async () => deleteScene(sequenceId, data.id, false),
          redo: async () => {
            // Redo re-adds. Ideally calls addScene again.
            // We can't reuse the exact same ID easily without soft delete.
            addScene(sequenceId, scene);
          }
        });
      }

      // 3. Fallback Fetch (Mental sanity check, maybe debounced or removed if confident)
      // fetchProjects(); 
      // Removed immediate fetchProjects to prevent UI flicker/replacement of the optimistic state
      // unless we really need it. Only fetch if there's drift risk.

    } catch (e) {
      console.error(e);
      toast.error('Erro ao adicionar cena');
      // Rollback
      setProjectsState(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        return {
          ...p,
          sequences: p.sequences.map(s => {
            if (s.id !== sequenceId) return s;
            return {
              ...s,
              scenes: s.scenes.filter(sc => sc.id !== tempId)
            };
          })
        };
      }));
    }
  }, [currentProjectId, deleteSequence]); // Removed fetchProjects dependency if not calling it

  const updateScene = useCallback(async (sequenceId: string, sceneId: string, updates: Partial<SceneModule>, trackHistory = true, previousStateOverride?: any) => {
    try {
      // 1. Capture Previous State
      if (trackHistory && currentProjectId) {
        const project = projects.find(p => p.id === currentProjectId);
        const sequence = project?.sequences.find(s => s.id === sequenceId);
        const scene = sequence?.scenes.find(s => s.id === sceneId);

        if (scene) {
          const previousState = previousStateOverride || {
            title: scene.title,
            notes: scene.notes,
            imageUrl: scene.imageUrl,
            aspectRatio: scene.aspectRatio,
            isExpanded: scene.isExpanded,
            isSubscene: scene.isSubscene,
            parentId: scene.parentId,
            isVisible: scene.isVisible,
            position: scene.position
          };
          const relevantPrev: any = {};
          Object.keys(updates).forEach(k => {
            relevantPrev[k] = (previousState as any)[k];
          });

          addToHistory({
            undo: async () => updateScene(sequenceId, sceneId, relevantPrev, false),
            redo: async () => updateScene(sequenceId, sceneId, updates, false)
          });
        }
      }

      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.aspectRatio) dbUpdates.aspect_ratio = updates.aspectRatio;
      if (updates.isExpanded !== undefined) dbUpdates.is_expanded = updates.isExpanded;
      if (updates.isSubscene !== undefined) dbUpdates.is_subscene = updates.isSubscene;
      if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
      if (updates.isVisible !== undefined) dbUpdates.is_visible = updates.isVisible;

      if (updates.position) {
        dbUpdates.position_x = updates.position.x;
        dbUpdates.position_y = updates.position.y;
      }

      setProjectsState(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        return {
          ...p,
          sequences: p.sequences.map(s =>
            s.id === sequenceId
              ? { ...s, scenes: s.scenes.map(sc => sc.id === sceneId ? { ...sc, ...updates } : sc) }
              : s
          )
        }
      }));

      const { error } = await supabase.from('scenes').update(dbUpdates).eq('id', sceneId);
      if (error) throw error;
    } catch (e) {
      console.error(e);
    }
  }, [currentProjectId, projects]);

  const deleteScene = useCallback(async (sequenceId: string, sceneId: string, trackHistory = true) => {
    try {
      if (trackHistory && currentProjectId) {
        const project = projects.find(p => p.id === currentProjectId);
        const sequence = project?.sequences.find(s => s.id === sequenceId);
        const scene = sequence?.scenes.find(s => s.id === sceneId);

        if (scene) {
          const restoreScene = async () => {
            const { error } = await supabase.from('scenes').insert({
              id: scene.id,
              sequence_id: sequenceId,
              title: scene.title,
              notes: scene.notes,
              image_url: scene.imageUrl,
              aspect_ratio: scene.aspectRatio,
              is_subscene: scene.isSubscene,
              is_expanded: scene.isExpanded,
              parent_id: scene.parentId,
              position_x: scene.position?.x || 0,
              position_y: scene.position?.y || 0
            });
            if (!error) fetchProjects();
          };

          addToHistory({
            undo: async () => restoreScene(),
            redo: async () => deleteScene(sequenceId, sceneId, false)
          });
        }
      }

      const { error } = await supabase.from('scenes').delete().eq('id', sceneId);
      if (error) throw error;

      setProjectsState(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        return {
          ...p,
          sequences: p.sequences.map(s =>
            s.id === sequenceId
              ? { ...s, scenes: s.scenes.filter(sc => sc.id !== sceneId) }
              : s
          )
        }
      }));
    } catch (e) {
      toast.error('Erro ao deletar cena');
    }
  }, [currentProjectId, projects, fetchProjects]);

  const toggleSceneVisibility = useCallback((sequenceId: string, sceneId: string) => {
    const project = projects.find(p => p.id === currentProjectId);
    const sequence = project?.sequences.find(s => s.id === sequenceId);
    const scene = sequence?.scenes.find(s => s.id === sceneId);
    if (scene) {
      updateScene(sequenceId, sceneId, { isVisible: !scene.isVisible });
    }
  }, [projects, currentProjectId, updateScene]);

  // 6. Connections
  const addConnection = useCallback(async (fromId: string, toId: string, fromType: string, toType: string) => {
    if (!currentProjectId) return;
    try {
      const newConn = {
        project_id: currentProjectId,
        from_id: fromId,
        to_id: toId,
        from_type: fromType, // Schema uses from_type
        to_type: toType     // Schema uses to_type
      };
      const { error } = await supabase.from('connections').insert(newConn);
      if (error) throw error;
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  }, [currentProjectId, fetchProjects]);

  const deleteConnection = useCallback(async (id: string) => {
    try {
      setProjectsState(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        return { ...p, connections: p.connections.filter(c => c.id !== id) };
      }));
      await supabase.from('connections').delete().eq('id', id);
    } catch (e) { console.error(e); }
  }, [currentProjectId]);

  // 7. Prompts
  const addPrompt = useCallback(async (prompt: any) => {
    if (!currentProjectId) return;
    try {
      const newPrompt = {
        project_id: currentProjectId,
        name: prompt.name,
        prompt: prompt.prompt,
        category: prompt.category, // Schema uses category
        image_url: prompt.imageUrl // Schema uses image_url
      };
      await supabase.from('prompts').insert(newPrompt);
      fetchProjects();
    } catch (e) { console.error(e); }
  }, [currentProjectId, fetchProjects]);

  const updatePrompt = useCallback(async (id: string, updates: any) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.prompt) dbUpdates.prompt = updates.prompt;
      if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
      if (updates.category) dbUpdates.category = updates.category;

      const { error } = await supabase.from('prompts').update(dbUpdates).eq('id', id);
      if (error) throw error;
      fetchProjects();
    } catch (e) { }
  }, [fetchProjects]);

  const deletePrompt = useCallback(async (id: string) => {
    await supabase.from('prompts').delete().eq('id', id);
    fetchProjects();
  }, [fetchProjects]);

  const addPromptCategory = useCallback((category: string) => {
    if (currentProject && !currentProject.promptCategories?.includes(category)) {
      updateProjectMeta(currentProject.id, {
        promptCategories: [...(currentProject.promptCategories || []), category]
      });
    }
  }, [currentProject, updateProjectMeta]);

  const deletePromptCategory = useCallback(async (category: string) => {
    if (!currentProject) return;

    // 1. Update categories list
    const newCategories = (currentProject.promptCategories || []).filter(c => c !== category);
    updateProjectMeta(currentProject.id, { promptCategories: newCategories });

    // 2. Delete prompts with this category
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('project_id', currentProject.id)
        .eq('category', category);

      if (error) throw error;
      fetchProjects();
    } catch (e) {
      console.error("Error deleting prompt category", e);
      toast.error("Erro ao deletar categoria");
    }
  }, [currentProject, updateProjectMeta, fetchProjects]);

  // Placeholder functions for now
  // 8. Moodboard
  const addMoodBoardItem = useCallback(async (item: MoodBoardItem) => {
    if (!currentProjectId) return;

    // Optimistic Update
    setProjectsState(prev => prev.map(p => {
      if (p.id !== currentProjectId) return p;
      return {
        ...p,
        moodboard: [...(p.moodboard || []), item]
      };
    }));

    try {
      const newItem = {
        project_id: currentProjectId,
        type: item.type,
        content: item.content,
        image_url: item.imageUrl,
        color: item.color,
        position: item.position,
        width: item.width,
        height: item.height,
        rotation: item.rotation,
        z_index: item.zIndex || 0
      };
      const { error } = await supabase.from('moodboard_items').insert(newItem);
      if (error) throw error;

      // No need to fetch if optimistic is correct, or fetch details:
      // fetchProjectDetails(currentProjectId);
    } catch (e) {
      console.error("Error adding moodboard item", e);
      toast.error("Erro ao salvar item no moodboard");
      // Rollback
      setProjectsState(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        return {
          ...p,
          moodboard: (p.moodboard || []).filter(m => m.id !== item.id)
        };
      }));
    }
  }, [currentProjectId]); // Removed fetchProjects dependency

  const updateMoodBoardItem = useCallback(async (id: string, updates: Partial<MoodBoardItem>) => {
    try {
      const dbUpdates: any = {};
      if (updates.position) dbUpdates.position = updates.position;
      if (updates.width) dbUpdates.width = updates.width;
      if (updates.height) dbUpdates.height = updates.height;
      if (updates.rotation) dbUpdates.rotation = updates.rotation;
      if (updates.zIndex) dbUpdates.z_index = updates.zIndex;
      if (updates.content) dbUpdates.content = updates.content;
      if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
      if (updates.color) dbUpdates.color = updates.color;

      // Optimistic
      setProjectsState(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        return {
          ...p,
          moodboard: (p.moodboard || []).map(m => m.id === id ? { ...m, ...updates } : m)
        };
      }));

      const { error } = await supabase.from('moodboard_items').update(dbUpdates).eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error(e);
    }
  }, [currentProjectId]);

  const deleteMoodBoardItem = useCallback(async (id: string) => {
    try {
      // Optimistic
      setProjectsState(prev => prev.map(p => {
        if (p.id !== currentProjectId) return p;
        return {
          ...p,
          moodboard: (p.moodboard || []).filter(m => m.id !== id)
        };
      }));

      const { error } = await supabase.from('moodboard_items').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      toast.error("Erro ao deletar item");
    }
  }, [currentProjectId]);

  const duplicateSequence = useCallback(async (id: string) => {
    // Implement duplication logic if needed later
    console.log("Duplicate sequence not implemented for Supabase yet");
  }, []);


  return {
    projects,
    currentProject: currentProject || { id: 'loading' } as any,
    currentProjectId,
    setCurrentProjectId: setCurrentProjectIdState,
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
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
}
