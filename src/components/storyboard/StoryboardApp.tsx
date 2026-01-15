import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { StoryContextModal } from './StoryContextModal';
import { NotesModal } from './NotesModal';
import { FloatingWindow } from './FloatingWindow';
import { useProject } from '@/hooks/useProject';
import { ImageIcon, FileText, Upload, Plus, Palette, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PromptLibraryView } from './PromptLibraryView';
import { ProjectLibraryView } from './ProjectLibraryView';
import { MoodBoardView } from './MoodBoardView';
import { SequenceViewer } from './SequenceViewer';
import { ScriptSidebar } from './ScriptSidebar';
import { UserProfileModal } from './UserProfileModal';
import { PromptStyle, UserProfile } from '@/types/storyboard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function StoryboardApp() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('storyflow_theme');
      return saved === 'dark';
    }
    return false;
  });
  const [currentView, setCurrentView] = useState<'canvas' | 'prompts' | 'projects' | 'moodboard'>(() => {
    const saved = localStorage.getItem('storyflow_projects');
    if (!saved || JSON.parse(saved).length === 0) return 'projects';
    return 'canvas';
  });
  const [activeCategory, setActiveCategory] = useState<string>('Tudo');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('storyflow_user_profile');
    return saved ? JSON.parse(saved) : {
      firstName: 'Flavio',
      lastName: 'Carvalho',
      email: 'flaviocarvalhoficial@gmail.com',
      specialty: 'Filmmaker',
      plan: 'Pro',
      avatarUrl: ''
    };
  });

  // Interface Settings State
  const [sidebarFontSize, setSidebarFontSize] = useState<'01' | '02' | '03'>(() => {
    return (localStorage.getItem('storyflow_sidebar_font_size') as '01' | '02' | '03') || '01';
  });
  const [gridStyle, setGridStyle] = useState<'dots' | 'lines' | 'none'>(() => {
    const saved = localStorage.getItem('storyflow_grid_style');
    return (saved as 'dots' | 'lines' | 'none') || 'dots';
  });
  const [connectionStyle, setConnectionStyle] = useState<'smooth' | 'straight'>(() => {
    const saved = localStorage.getItem('storyflow_connection_style');
    return (saved as 'smooth' | 'straight') || 'smooth';
  });

  const [defaultRatio, setDefaultRatio] = useState<'16:9' | '9:16' | '4:3'>(() => {
    const saved = localStorage.getItem('storyflow_default_ratio');
    return (saved as '16:9' | '9:16' | '4:3') || '16:9';
  });

  useEffect(() => {
    localStorage.setItem('storyflow_sidebar_font_size', sidebarFontSize);
  }, [sidebarFontSize]);

  useEffect(() => {
    localStorage.setItem('storyflow_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('storyflow_grid_style', gridStyle);
  }, [gridStyle]);

  useEffect(() => {
    localStorage.setItem('storyflow_connection_style', connectionStyle);
  }, [connectionStyle]);

  useEffect(() => {
    localStorage.setItem('storyflow_default_ratio', defaultRatio);
  }, [defaultRatio]);

  const [isScriptSidebarOpen, setIsScriptSidebarOpen] = useState(false);

  const [contextModal, setContextModal] = useState<{ isOpen: boolean; sequenceId: string | null }>({
    isOpen: false,
    sequenceId: null,
  });
  const [notesModal, setNotesModal] = useState<{
    isOpen: boolean;
    sequenceId: string | null;
    sceneId: string | null;
  }>({
    isOpen: false,
    sequenceId: null,
    sceneId: null,
  });
  const [assetsWindow, setAssetsWindow] = useState(false);
  const [referencesWindow, setReferencesWindow] = useState(false);
  const [viewerSequenceId, setViewerSequenceId] = useState<string | null>(null);

  const {
    projects,
    currentProject,
    currentProjectId,
    isLoading, // Destructure isLoading
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
    addScene,
    updateScene,
    deleteScene,
    addConnection,
    deleteConnection,
    addPrompt,
    updatePrompt,
    deletePrompt,
    addPromptCategory,
    deletePromptCategory,
    toggleSequenceVisibility,
    toggleSceneVisibility,
    undo,
    redo,
    canUndo,
    canRedo,
    addMoodBoardItem,
    updateMoodBoardItem,
    deleteMoodBoardItem,
    updatePromptCategory
  } = useProject();

  useEffect(() => {
    if (projects.length === 0 && currentView !== 'projects') {
      setCurrentView('projects');
    }
  }, [projects.length, currentView]);

  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptStyle | null>(null);
  const [newPrompt, setNewPrompt] = useState({ name: '', prompt: '', imageUrl: '', category: '' });

  useEffect(() => {
    if (editingPrompt) {
      setNewPrompt({
        name: editingPrompt.name,
        prompt: editingPrompt.prompt,
        imageUrl: editingPrompt.imageUrl,
        category: editingPrompt.category,
      });
    } else {
      setNewPrompt({
        name: '',
        prompt: '',
        imageUrl: '',
        category: (activeCategory === 'Tudo' || activeCategory === '') ? '' : activeCategory
      });
    }
  }, [editingPrompt, activeCategory]);

  const handleSavePrompt = () => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, newPrompt);
    } else {
      addPrompt(newPrompt);
    }
    setPromptDialogOpen(false);
    setEditingPrompt(null);
  };

  useEffect(() => {
    localStorage.setItem('storyflow_theme', isDark ? 'dark' : 'light');

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleOpenContext = (sequenceId: string) => {
    setContextModal({ isOpen: true, sequenceId });
  };

  const handleCloseContext = () => {
    setContextModal({ isOpen: false, sequenceId: null });
  };

  const handleSaveContext = (content: string) => {
    if (contextModal.sequenceId) {
      updateSequence(contextModal.sequenceId, { storyContext: content });
    }
  };

  const handleOpenNotes = (sequenceId: string, sceneId: string) => {
    setNotesModal({ isOpen: true, sequenceId, sceneId });
  };

  const handleCloseNotes = () => {
    setNotesModal({ isOpen: false, sequenceId: null, sceneId: null });
  };

  const handleSaveNotes = (content: string) => {
    if (notesModal.sequenceId && notesModal.sceneId) {
      updateScene(notesModal.sequenceId, notesModal.sceneId, { notes: content });
    }
  };

  const currentSequence = contextModal.sequenceId
    ? currentProject?.sequences?.find(s => s.id === contextModal.sequenceId)
    : null;

  const currentScene = notesModal.sequenceId && notesModal.sceneId
    ? currentProject?.sequences?.find(s => s.id === notesModal.sequenceId)
      ?.scenes.find(sc => sc.id === notesModal.sceneId)
    : null;

  const handleAddSequenceFromSidebar = () => {
    let startY = 100;
    const padding = 400;

    if (currentProject?.sequences && currentProject.sequences.length > 0) {
      const maxY = Math.max(...currentProject.sequences.map(s => s.position.y));
      startY = maxY + padding;
    }

    addSequence({ x: 100, y: startY });
    setCurrentView('canvas');
  };

  const handleAddSubscene = (sequenceId: string, sceneId: string) => {
    addScene(sequenceId, { position: { x: 0, y: 0 }, parentId: sceneId, isSubscene: true });
  };

  const handleAddSceneToCanvas = (sequenceId: string, position: { x: number; y: number }) => {
    addScene(sequenceId, { position });
  };

  const handleSwitchToCategory = (category: string) => {
    setActiveCategory(category);
    setCurrentView('prompts');
  };

  const handleUpdateScriptScene = (sceneId: string, isCompleted: boolean) => {
    if (!currentProject?.structuredScript) return;

    const updatedScript = currentProject.structuredScript.map(scene =>
      scene.id === sceneId ? { ...scene, isCompleted } : scene
    );

    updateProjectMeta(currentProject.id, { structuredScript: updatedScript });
  };

  return (
    <div className={cn('h-screen flex', isDark && 'dark')}>
      {/* Left Sidebar */}
      <Sidebar
        projects={projects}
        currentProject={currentProject}
        onSelectProject={setCurrentProjectId}
        onCreateProject={createProject}
        onDeleteProject={deleteProject}
        onUpdateProject={updateProjectMeta}
        onSetCanvasBg={setCanvasBg}
        onAddPrompt={addPrompt}
        onUpdatePrompt={updatePrompt}
        onDeletePrompt={deletePrompt}
        onAddSequence={handleAddSequenceFromSidebar}
        onDeleteSequence={deleteSequence}
        onDuplicateSequence={duplicateSequence}
        onUpdateSequence={updateSequence}
        onUpdateScene={updateScene}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenAssets={() => setCurrentView('moodboard')}
        onOpenReferences={() => setReferencesWindow(true)}
        promptCategories={currentProject?.promptCategories || []}
        onAddPromptCategory={addPromptCategory}
        onDeletePromptCategory={deletePromptCategory}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSelectCategory={handleSwitchToCategory}
        activeCategory={activeCategory}
        onToggleSequenceVisibility={toggleSequenceVisibility}
        onToggleSceneVisibility={toggleSceneVisibility}
        fontSize={sidebarFontSize}
        onFontSizeChange={setSidebarFontSize}
        gridStyle={gridStyle}
        onGridStyleChange={setGridStyle}
        defaultRatio={defaultRatio}
        onDefaultRatioChange={setDefaultRatio}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      {currentView === 'canvas' ? (
        (isLoading || !currentProject) ? (
          <div className="flex-1 flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando projeto...</span>
          </div>
        ) : (
          <div className="flex-1 relative flex overflow-hidden">
            <Canvas
              project={currentProject}
              onAddSequence={addSequence}
              onUpdateSequence={updateSequence}
              onDeleteSequence={deleteSequence}
              onToggleCollapseSequence={toggleCollapseSequence}
              onAddScene={handleAddSceneToCanvas}
              onUpdateScene={updateScene}
              onDeleteScene={deleteScene}
              onOpenContext={handleOpenContext}
              onOpenNotes={handleOpenNotes}
              onSetCanvasBg={setCanvasBg}
              onToggleSequenceVisibility={toggleSequenceVisibility}
              onToggleSceneVisibility={toggleSceneVisibility}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              onAddSubscene={handleAddSubscene}
              onOpenViewer={setViewerSequenceId}
              gridStyle={gridStyle}
              connectionStyle={connectionStyle}
              defaultRatio={defaultRatio}
              sceneBorderStyle="solid"
            />
            <ScriptSidebar
              project={currentProject}
              isOpen={isScriptSidebarOpen}
              onToggle={() => setIsScriptSidebarOpen(!isScriptSidebarOpen)}
              onUpdateSceneStatus={handleUpdateScriptScene}
            />
          </div>
        )
      ) : currentView === 'prompts' ? (
        <PromptLibraryView
          category={activeCategory}
          categories={currentProject.promptCategories || []}
          onSelectCategory={handleSwitchToCategory}
          prompts={currentProject.prompts}
          onAddPrompt={() => {
            setEditingPrompt(null);
            setPromptDialogOpen(true);
          }}
          onEditPrompt={(prompt) => {
            setEditingPrompt(prompt);
            setPromptDialogOpen(true);
          }}
          onUpdatePrompt={updatePrompt}
          onDeletePrompt={deletePrompt}
          onUpdatePromptCategory={updatePromptCategory}
          onDeletePromptCategory={deletePromptCategory}
          projectId={currentProject.id}
        />
      ) : currentView === 'projects' ? (
        <ProjectLibraryView
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={(id) => {
            setCurrentProjectId(id);
            setCurrentView('canvas');
          }}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
          onUpdateProject={updateProjectMeta}
        />
      ) : (
        <MoodBoardView
          items={currentProject.moodboard || []}
          onAddItem={addMoodBoardItem}
          onUpdateItem={updateMoodBoardItem}
          onDeleteItem={deleteMoodBoardItem}
          projectId={currentProject.id}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      )}

      {/* Story Context Modal */}
      <StoryContextModal
        isOpen={contextModal.isOpen}
        title={currentSequence?.title || ''}
        content={currentSequence?.storyContext || ''}
        onClose={handleCloseContext}
        onSave={handleSaveContext}
      />

      {/* Notes Modal */}
      <NotesModal
        isOpen={notesModal.isOpen}
        title={currentScene?.title || ''}
        content={currentScene?.notes || ''}
        onClose={handleCloseNotes}
        onSave={handleSaveNotes}
      />

      {/* Assets Floating Window */}
      <FloatingWindow
        title="Assets"
        isOpen={assetsWindow}
        onClose={() => setAssetsWindow(false)}
        defaultPosition={{ x: 300, y: 100 }}
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Arraste imagens aqui ou clique para fazer upload
          </p>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:border-muted-foreground/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Upload de Assets</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* Placeholder for assets */}
          </div>
        </div>
      </FloatingWindow>

      {/* References Floating Window */}
      <FloatingWindow
        title="Referências"
        isOpen={referencesWindow}
        onClose={() => setReferencesWindow(false)}
        defaultPosition={{ x: 350, y: 150 }}
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Cole links ou faça upload de referências visuais
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Referência
          </Button>
          <div className="space-y-2">
            {/* Placeholder for references */}
          </div>
        </div>
      </FloatingWindow>
      {/* Prompt Dialog */}
      <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? 'Editar Prompt' : 'Novo Prompt'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Estilo</Label>
              <Input
                id="name"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Cinematic Dark"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={newPrompt.category}
                onChange={(e) => setNewPrompt(p => ({ ...p, category: e.target.value }))}
              >
                <option value="">Sem categoria</option>
                {(currentProject.promptCategories || []).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                value={newPrompt.prompt}
                onChange={(e) => setNewPrompt(p => ({ ...p, prompt: e.target.value }))}
                placeholder="Descreva o estilo visual..."
                className="font-mono text-xs"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
              <Input
                id="imageUrl"
                value={newPrompt.imageUrl}
                onChange={(e) => setNewPrompt(p => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <Button onClick={handleSavePrompt} className="w-full">
              {editingPrompt ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SequenceViewer
        sequence={viewerSequenceId ? currentProject.sequences.find(s => s.id === viewerSequenceId) || null : null}
        isOpen={!!viewerSequenceId}
        onClose={() => setViewerSequenceId(null)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdateProfile={setUserProfile}
        currentProfile={userProfile}
      />
    </div>
  );
}

