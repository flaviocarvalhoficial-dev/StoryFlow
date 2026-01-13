import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { StoryContextModal } from './StoryContextModal';
import { NotesModal } from './NotesModal';
import { FloatingWindow } from './FloatingWindow';
import { useProject } from '@/hooks/useProject';
import { ImageIcon, FileText, Upload, Plus, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PromptLibraryView } from './PromptLibraryView';
import { ProjectLibraryView } from './ProjectLibraryView';
import { PromptStyle } from '@/types/storyboard';
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
  const [isDark, setIsDark] = useState(false);
  const [currentView, setCurrentView] = useState<'canvas' | 'prompts' | 'projects'>('canvas');
  const [activeCategory, setActiveCategory] = useState<string>('Tudo');

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

  const {
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
    canRedo
  } = useProject();

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
    ? currentProject.sequences.find(s => s.id === contextModal.sequenceId)
    : null;

  const currentScene = notesModal.sequenceId && notesModal.sceneId
    ? currentProject.sequences
      .find(s => s.id === notesModal.sequenceId)
      ?.scenes.find(sc => sc.id === notesModal.sceneId)
    : null;

  const handleAddSequenceFromSidebar = () => {
    let startY = 100;
    const padding = 400;

    if (currentProject.sequences.length > 0) {
      const maxY = Math.max(...currentProject.sequences.map(s => s.position.y));
      startY = maxY + padding;
    }

    addSequence({ x: 100, y: startY });
    setCurrentView('canvas');
  };

  const handleAddSubscene = (sequenceId: string, sceneId: string) => {
    addScene(sequenceId, { x: 0, y: 0 }, sceneId, true);
  };

  const handleSwitchToCategory = (category: string) => {
    setActiveCategory(category);
    setCurrentView('prompts');
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
        onRenameProject={renameProject}
        onSetCanvasBg={setCanvasBg}
        onAddPrompt={addPrompt}
        onUpdatePrompt={updatePrompt}
        onDeletePrompt={deletePrompt}
        onAddSequence={handleAddSequenceFromSidebar}
        onUpdateSequence={updateSequence}
        onUpdateScene={updateScene}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenAssets={() => setAssetsWindow(true)}
        onOpenReferences={() => setReferencesWindow(true)}
        promptCategories={currentProject.promptCategories || []}
        onAddPromptCategory={addPromptCategory}
        onDeletePromptCategory={deletePromptCategory}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSelectCategory={handleSwitchToCategory}
        activeCategory={activeCategory}
        onToggleSequenceVisibility={toggleSequenceVisibility}
        onToggleSceneVisibility={toggleSceneVisibility}
      />

      {/* Main Content Area */}
      {currentView === 'canvas' ? (
        <Canvas
          project={currentProject}
          onAddSequence={addSequence}
          onUpdateSequence={updateSequence}
          onDeleteSequence={deleteSequence}
          onToggleCollapseSequence={toggleCollapseSequence}
          onAddScene={addScene}
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
        />
      ) : currentView === 'prompts' ? (
        <PromptLibraryView
          category={activeCategory}
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
        />
      ) : (
        <ProjectLibraryView
          projects={projects}
          onSelectProject={(id) => {
            setCurrentProjectId(id);
            setCurrentView('canvas');
          }}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
          onRenameProject={renameProject}
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
    </div>
  );
}
