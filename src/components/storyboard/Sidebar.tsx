import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  ImageIcon,
  FileText,
  Trash2,
  Edit2,
  Circle,
  Layout,
  Box,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Lock,
  Unlock
} from 'lucide-react';
import { Project, PromptStyle, SequenceModule, SceneModule } from '@/types/storyboard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SidebarProps {
  projects: Project[];
  currentProject: Project;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, name: string) => void;
  onSetCanvasBg: (bg: 'light' | 'medium' | 'dark') => void;
  // Prompts
  onAddPrompt: (prompt: Omit<PromptStyle, 'id'>) => void;
  onUpdatePrompt: (id: string, updates: Partial<PromptStyle>) => void;
  onDeletePrompt: (id: string) => void;
  promptCategories: string[];
  onAddPromptCategory: (category: string) => void;
  onDeletePromptCategory: (category: string) => void;
  onAddSequence: () => void;
  onUpdateSequence: (id: string, updates: Partial<SequenceModule>) => void;
  onUpdateScene: (sequenceId: string, sceneId: string, updates: Partial<SceneModule>) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAssets: () => void;
  onOpenReferences: () => void;
  currentView: 'canvas' | 'prompts' | 'projects';
  onViewChange: (view: 'canvas' | 'prompts' | 'projects') => void;
  onSelectCategory: (category: string) => void;
  activeCategory: string;
  onToggleSequenceVisibility: (id: string) => void;
  onToggleSceneVisibility: (sequenceId: string, sceneId: string) => void;
}

export function Sidebar({
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
  onSetCanvasBg,
  onAddPrompt,
  onUpdatePrompt,
  onDeletePrompt,
  promptCategories,
  onAddPromptCategory,
  onDeletePromptCategory,
  onAddSequence,
  onUpdateSequence,
  onUpdateScene,
  isDark,
  onToggleTheme,
  onOpenAssets,
  onOpenReferences,
  currentView,
  onViewChange,
  onSelectCategory,
  activeCategory,
  onToggleSequenceVisibility,
  onToggleSceneVisibility,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHierarchyPinned, setIsHierarchyPinned] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [editingSequenceId, setEditingSequenceId] = useState<string | null>(null);
  const [editingSequenceName, setEditingSequenceName] = useState('');
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingSceneName, setEditingSceneName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [fontSize, setFontSize] = useState<'01' | '02' | '03'>('01');
  const [width, setWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const minWidth = 64;
  const expandedMinWidth = 200;
  const expandedMaxWidth = 500;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    let newWidth = e.clientX;
    if (!isCollapsed) {
      if (newWidth < expandedMinWidth) newWidth = expandedMinWidth;
      if (newWidth > expandedMaxWidth) newWidth = expandedMaxWidth;
      setWidth(newWidth);
    }
  }, [isResizing, isCollapsed]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const fs = ({
    '01': { label: 'text-[14px]', sub: 'text-[12px]', icon: 'w-4 h-4' },
    '02': { label: 'text-[16px]', sub: 'text-[14px]', icon: 'w-5 h-5' },
    '03': { label: 'text-[18px]', sub: 'text-[15px]', icon: 'w-6 h-6' },
  } as any)[fontSize] || { label: 'text-[14px]', sub: 'text-[12px]', icon: 'w-4 h-4' };

  const handleRenameProject = () => {
    if (editingProjectName.trim() && editingProjectName !== currentProject.name) {
      onRenameProject(currentProject.id, editingProjectName.trim());
    }
    setIsEditingProjectName(false);
  };

  const handleRenameSequence = (id: string) => {
    if (editingSequenceName.trim()) {
      onUpdateSequence(id, { title: editingSequenceName.trim() });
      setEditingSequenceId(null);
      setEditingSequenceName('');
    }
  };

  const handleRenameScene = (sequenceId: string, sceneId: string) => {
    if (editingSceneName.trim()) {
      onUpdateScene(sequenceId, sceneId, { title: editingSceneName.trim() });
      setEditingSceneId(null);
      setEditingSceneName('');
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddPromptCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowCategoryInput(false);
    }
  };

  return (
    <div
      className={cn(
        "h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out relative group/sidebar",
        isResizing && "transition-none"
      )}
      style={{ width: isCollapsed ? minWidth : width }}
    >
      {/* Resizer Handle */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50 hover:bg-primary/30 transition-colors",
          isResizing && "bg-primary/50"
        )}
        onMouseDown={handleMouseDown}
      />
      {/* Header */}
      <div className={cn(
        "flex items-center p-3 border-b border-sidebar-border min-h-[50px]",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && <span className="font-bold text-base bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">StoryFlow</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "h-7 w-7 transition-all duration-300 hover:bg-primary/10 flex items-center justify-center",
            isCollapsed ? "h-9 w-9 rotate-180" : ""
          )}
          title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          <ChevronLeft className="w-4 h-4 text-primary" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className={cn("p-3 space-y-6", isCollapsed && "px-2")}>
          {/* Main Navigation */}
          <div className="space-y-1">
            <Button
              variant={currentView === 'projects' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start h-auto py-2", isCollapsed ? "justify-center" : "", fs.label)}
              onClick={() => onViewChange('projects')}
              title="Dashboard de Projetos"
            >
              <Layout className={cn(fs.icon, !isCollapsed && "mr-2")} />
              {!isCollapsed && <span className="font-semibold">Dashboard de Projetos</span>}
            </Button>
            <div className="flex items-center gap-1 group/nav">
              <Button
                variant={currentView === 'canvas' ? 'secondary' : 'ghost'}
                className={cn("flex-1 justify-start h-auto py-2", isCollapsed ? "justify-center" : "", fs.label)}
                onClick={() => onViewChange('canvas')}
                title="Storyboard (Canvas)"
              >
                <Layers className={cn(fs.icon, !isCollapsed && "mr-2")} />
                {!isCollapsed && <span className="font-semibold">Storyboard (Canvas)</span>}
              </Button>
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 transition-all hover:bg-primary/10",
                    isHierarchyPinned ? "text-primary bg-primary/5" : "opacity-0 group-hover/nav:opacity-50 hover:opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHierarchyPinned(!isHierarchyPinned);
                  }}
                  title={isHierarchyPinned ? "Desafixar Estrutura" : "Fixar Estrutura"}
                >
                  {isHierarchyPinned ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </Button>
              )}
            </div>
          </div>

          {!isCollapsed && <Separator />}

          {/* Current Project Structure Hierarchy */}
          {(currentView === 'canvas' || isHierarchyPinned) && (
            <div className="space-y-2">
              {isCollapsed && (
                <div className="flex justify-center py-2">
                  <Box className="w-5 h-5 text-primary opacity-50" />
                </div>
              )}

              {!isCollapsed && (
                <>
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-primary/5 border border-primary/20 mb-3 shadow-sm group/project-header">
                    <Box className={cn(fs.icon, "text-primary")} />
                    {isEditingProjectName ? (
                      <input
                        type="text"
                        value={editingProjectName}
                        onChange={(e) => setEditingProjectName(e.target.value)}
                        onBlur={handleRenameProject}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameProject()}
                        className={cn("flex-1 bg-transparent border-b border-primary outline-none min-w-0 font-bold text-primary uppercase tracking-tight", fs.sub)}
                        autoFocus
                      />
                    ) : (
                      <span
                        className={cn("font-bold truncate text-primary uppercase tracking-tight flex-1 cursor-pointer", fs.sub)}
                        onDoubleClick={() => {
                          setIsEditingProjectName(true);
                          setEditingProjectName(currentProject.name);
                        }}
                        title="Duplo clique para renomear"
                      >
                        {currentProject.name}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-auto hover:bg-primary/10"
                      onClick={onAddSequence}
                      title="Nova Sequência"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="space-y-1 relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border/40" />

                    {currentProject.sequences?.map((sequence) => (
                      <Collapsible key={sequence.id} defaultOpen>
                        <div className="flex items-center group/seq relative z-10">
                          <CollapsibleTrigger asChild>
                            <div className={cn(
                              "flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent/50 cursor-pointer transition-all bg-sidebar group",
                              sequence.isVisible !== false ? "text-foreground" : "text-muted-foreground opacity-40",
                              fs.sub
                            )}>
                              <ChevronRight className="w-3 h-3 mr-0.5 transition-transform duration-200 group-data-[state=open]:rotate-90 opacity-40" />
                              <div className="w-4 h-4 flex items-center justify-center">
                                <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
                              </div>

                              {editingSequenceId === sequence.id ? (
                                <input
                                  type="text"
                                  value={editingSequenceName}
                                  onChange={(e) => setEditingSequenceName(e.target.value)}
                                  onBlur={() => handleRenameSequence(sequence.id)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleRenameSequence(sequence.id)}
                                  className={cn("flex-1 bg-transparent border-b border-primary outline-none min-w-0", fs.sub)}
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span
                                  className="truncate flex-1 font-semibold tracking-tight"
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSequenceId(sequence.id);
                                    setEditingSequenceName(sequence.title);
                                  }}
                                >
                                  {sequence.title}
                                </span>
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6 transition-opacity ml-auto",
                              sequence.isVisible !== false ? "opacity-0 group-hover/seq:opacity-100" : "opacity-100"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSequenceVisibility(sequence.id);
                            }}
                            title={sequence.isVisible !== false ? "Ocultar Sequência" : "Mostrar Sequência"}
                          >
                            {sequence.isVisible !== false ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-primary" />
                            )}
                          </Button>
                        </div>

                        <CollapsibleContent className="pl-6 pt-1 space-y-0.5">
                          {sequence.scenes.length === 0 ? (
                            <div className={cn("text-muted-foreground/40 px-3 py-1 italic ml-4 border-l border-border/20", fs.sub)}>Sem cenas</div>
                          ) : (
                            sequence.scenes.map((scene) => (
                              <div
                                key={scene.id}
                                className={cn("flex items-center group/scene relative transition-colors", fs.sub)}
                              >
                                <div className="absolute -left-[9px] top-1/2 w-2 h-px bg-border/40" />
                                <div className={cn(
                                  "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-sidebar-accent/30 cursor-pointer",
                                  scene.isVisible !== false ? "text-foreground" : "text-muted-foreground opacity-40"
                                )}>
                                  <FileText className="w-3 h-3 opacity-40 group-hover/scene:opacity-100 transition-opacity" />
                                  {editingSceneId === scene.id ? (
                                    <input
                                      type="text"
                                      value={editingSceneName}
                                      onChange={(e) => setEditingSceneName(e.target.value)}
                                      onBlur={() => handleRenameScene(sequence.id, scene.id)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleRenameScene(sequence.id, scene.id)}
                                      className={cn("flex-1 bg-transparent border-b border-primary outline-none min-w-0", fs.sub)}
                                      autoFocus
                                    />
                                  ) : (
                                    <span
                                      className="truncate flex-1"
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSceneId(scene.id);
                                        setEditingSceneName(scene.title);
                                      }}
                                    >
                                      {scene.title}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-6 w-6 transition-opacity ml-1",
                                    scene.isVisible !== false ? "opacity-0 group-hover/scene:opacity-100" : "opacity-100"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSceneVisibility(sequence.id, scene.id);
                                  }}
                                  title={scene.isVisible !== false ? "Ocultar Cena" : "Mostrar Cena"}
                                >
                                  {scene.isVisible !== false ? (
                                    <Eye className="w-3 h-3" />
                                  ) : (
                                    <EyeOff className="w-3 h-3 text-primary" />
                                  )}
                                </Button>
                              </div>
                            ))
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {!isCollapsed && <Separator />}

          {/* Prompt Library Tools */}
          <div className="space-y-2">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-4 py-2">
                <Palette className="w-5 h-5 text-muted-foreground opacity-50" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenAssets}>
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenReferences}>
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Collapsible open={promptsOpen} onOpenChange={setPromptsOpen}>
                  <div className="flex items-center justify-between mb-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="flex-1 justify-between h-8 px-2 hover:bg-primary/5 group">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-primary/70" />
                          <span className={cn("font-bold text-muted-foreground uppercase tracking-wider", fs.sub)}>Biblioteca</span>
                        </div>
                        <ChevronRight className={cn("w-3 h-3 transition-transform duration-200 group-data-[state=open]:rotate-90")} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="space-y-1 pl-1">
                    {/* All Prompts / Tudo section */}
                    <Collapsible key="tudo">
                      <div className="flex items-center gap-1 pr-2 group/cat">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant={currentView === 'prompts' && activeCategory === 'Tudo' ? 'secondary' : 'ghost'}
                            size="sm"
                            className={cn("flex-1 justify-start h-8 group", fs.sub)}
                            onClick={() => onSelectCategory('Tudo')}
                          >
                            <ChevronRight className="w-3 h-3 mr-1 transition-transform duration-200 group-data-[state=open]:rotate-90 opacity-40 group-hover/cat:opacity-100" />
                            <span className="font-semibold">Geral</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="pl-4 space-y-0.5 border-l ml-1.5 border-border/40 mt-0.5">
                        {currentProject.prompts?.length === 0 ? (
                          <div className={cn("text-muted-foreground/30 px-4 py-1 italic", fs.sub)}>Nenhum prompt</div>
                        ) : (
                          currentProject.prompts?.map(prompt => (
                            <div key={prompt.id} className="group/prompt flex items-center gap-1 pr-2 relative">
                              <div className="absolute -left-[11px] top-1/2 w-2 h-px bg-border/40" />
                              <div className={cn("flex-1 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/30 cursor-pointer truncate", fs.sub)}>
                                {prompt.name}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeletePrompt(prompt.id);
                                }}
                                className="opacity-0 group-hover/prompt:opacity-100 transition-opacity p-1 hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Defined Categories */}
                    {promptCategories.map(cat => (
                      <Collapsible key={cat}>
                        <div className="group/cat flex items-center gap-1 pr-2 relative">
                          <CollapsibleTrigger asChild>
                            <Button
                              variant={currentView === 'prompts' && activeCategory === cat ? 'secondary' : 'ghost'}
                              size="sm"
                              className={cn("flex-1 justify-start h-8 truncate px-2 group", fs.sub)}
                              onClick={() => onSelectCategory(cat)}
                            >
                              <ChevronRight className={cn(
                                "w-3 h-3 mr-1 transition-transform duration-200 opacity-40 group-data-[state=open]:rotate-90",
                              )} />
                              {cat}
                            </Button>
                          </CollapsibleTrigger>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePromptCategory(cat);
                            }}
                            className="opacity-0 group-hover/cat:opacity-100 transition-opacity p-1 hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <CollapsibleContent className="pl-4 space-y-0.5 border-l ml-1.5 border-border/40 mt-0.5">
                          {currentProject.prompts?.filter(p => p.category === cat).map(prompt => (
                            <div key={prompt.id} className="group/prompt flex items-center gap-1 pr-2 relative">
                              <div className="absolute -left-[11px] top-1/2 w-2 h-px bg-border/40" />
                              <div className={cn("flex-1 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/30 cursor-pointer truncate", fs.sub)}>
                                {prompt.name}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeletePrompt(prompt.id);
                                }}
                                className="opacity-0 group-hover/prompt:opacity-100 transition-opacity p-1 hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {currentProject.prompts?.filter(p => p.category === cat).length === 0 && (
                            <div className={cn("text-muted-foreground/30 px-4 py-1 italic", fs.sub)}>Vazio</div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}

                    {/* Add category button at the end */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("w-full justify-start h-8 px-2 mt-1 text-muted-foreground hover:text-primary", fs.sub)}
                      onClick={() => setShowCategoryInput(true)}
                    >
                      <Plus className="w-3.5 h-3.5 mr-2" />
                      Nova Categoria
                    </Button>

                    {showCategoryInput && (
                      <div className="px-2 mt-1">
                        <Input
                          placeholder="Nome..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                          onBlur={() => !newCategoryName && setShowCategoryInput(false)}
                          className={cn("h-7 bg-background/50", fs.sub)}
                          autoFocus
                        />
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                <div className="pt-2 space-y-1">
                  <Button variant="ghost" size="sm" className={cn("w-full justify-start h-9 px-2 gap-2", fs.sub)} onClick={onOpenAssets}>
                    <ImageIcon className="w-4 h-4 opacity-70" />
                    <span>Meus Assets</span>
                  </Button>
                  <Button variant="ghost" size="sm" className={cn("w-full justify-start h-9 px-2 gap-2", fs.sub)} onClick={onOpenReferences}>
                    <FileText className="w-4 h-4 opacity-70" />
                    <span>Referências</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className={cn("border-t border-sidebar-border p-2 space-y-1", isCollapsed && "px-0 flex flex-col items-center")}>
        {!isCollapsed && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn("w-full justify-start gap-2 h-9", fs.sub)}
              >
                <Settings className="w-4 h-4 opacity-70" />
                <span>Configurações</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-sidebar border-sidebar-border">
              <DialogHeader>
                <DialogTitle>Configurações da Interface</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tamanho da Fonte (Sidebar)</Label>
                  <div className="flex bg-muted p-1 rounded-lg gap-1">
                    {[
                      { id: '01', label: '14px', title: '01' },
                      { id: '02', label: '16px', title: '02' },
                      { id: '03', label: '18px', title: '03' }
                    ].map((size) => (
                      <Button
                        key={size.id}
                        variant={fontSize === size.id ? 'secondary' : 'ghost'}
                        className={cn(
                          "flex-1 h-10 gap-2",
                          fontSize === size.id ? "bg-background shadow-sm shadow-black/5" : ""
                        )}
                        onClick={() => setFontSize(size.id as any)}
                      >
                        <span className="text-xs font-bold">{size.title}</span>
                        <span className="text-[10px] opacity-50">{size.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full justify-start gap-2 h-9", isCollapsed ? "w-9 h-9 justify-center p-0" : "", fs.sub)}
          onClick={onToggleTheme}
          title={isDark ? "Modo Claro" : "Modo Escuro"}
        >
          {isDark ? <Sun className="w-4 h-4 opacity-70" /> : <Moon className="w-4 h-4 opacity-70" />}
          {!isCollapsed && <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </Button>
      </div>
    </div>
  );
}
