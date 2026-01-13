import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Unlock,
  Copy,
  Grid,
  Activity,
  Minus,
  Square,
  Ratio,
  Sparkles,
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
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onSetCanvasBg: (bg: 'light' | 'medium' | 'dark') => void;
  // Prompts
  onAddPrompt: (prompt: Omit<PromptStyle, 'id'>) => void;
  onUpdatePrompt: (id: string, updates: Partial<PromptStyle>) => void;
  onDeletePrompt: (id: string) => void;
  promptCategories: string[];
  onAddPromptCategory: (category: string) => void;
  onDeletePromptCategory: (category: string) => void;
  onAddSequence: () => void;
  onDeleteSequence: (id: string) => void;
  onUpdateSequence: (id: string, updates: Partial<SequenceModule>) => void;
  onUpdateScene: (sequenceId: string, sceneId: string, updates: Partial<SceneModule>) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAssets: () => void;
  onOpenReferences: () => void;
  currentView: 'canvas' | 'prompts' | 'projects' | 'moodboard';
  onViewChange: (view: 'canvas' | 'prompts' | 'projects' | 'moodboard') => void;
  onSelectCategory: (category: string) => void;
  activeCategory: string;
  onToggleSequenceVisibility: (id: string) => void;
  onDuplicateSequence: (id: string) => void;
  onToggleSceneVisibility: (sequenceId: string, sceneId: string) => void;
  // Interface Settings
  fontSize: '01' | '02' | '03';
  onFontSizeChange: (size: '01' | '02' | '03') => void;
  gridStyle: 'dots' | 'lines' | 'none';
  onGridStyleChange: (style: 'dots' | 'lines' | 'none') => void;
  connectionStyle: 'smooth' | 'straight';
  onConnectionStyleChange: (style: 'smooth' | 'straight') => void;
  defaultRatio: '16:9' | '9:16' | '4:3';
  onDefaultRatioChange: (ratio: '16:9' | '9:16' | '4:3') => void;
}

export function Sidebar({
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onUpdateProject,
  onSetCanvasBg,
  onAddPrompt,
  onUpdatePrompt,
  onDeletePrompt,
  promptCategories,
  onAddPromptCategory,
  onDeletePromptCategory,
  onAddSequence,
  onDeleteSequence,
  onUpdateSequence,
  onDuplicateSequence,
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
  fontSize,
  onFontSizeChange,
  gridStyle,
  onGridStyleChange,
  connectionStyle,
  onConnectionStyleChange,
  defaultRatio,
  onDefaultRatioChange,
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
  const navigate = useNavigate();

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

  const sizeConfig = {
    '01': { base: '14px', sub: '12px', icon: '16px' },
    '02': { base: '16px', sub: '14px', icon: '20px' },
    '03': { base: '18px', sub: '16px', icon: '24px' },
  }[fontSize];

  const fs = {
    label: 'text-[length:var(--sidebar-font-size)]',
    sub: 'text-[length:var(--sidebar-font-size-sub)]',
    icon: 'w-[var(--sidebar-icon-size)] h-[var(--sidebar-icon-size)] shrink-0 text-foreground/70 group-hover:text-primary transition-colors'
  };

  const handleRenameProject = () => {
    if (editingProjectName.trim() && editingProjectName !== currentProject.name) {
      onUpdateProject(currentProject.id, { name: editingProjectName.trim() });
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
      style={{
        width: isCollapsed ? minWidth : width,
        '--sidebar-font-size': sizeConfig.base,
        '--sidebar-font-size-sub': sizeConfig.sub,
        '--sidebar-icon-size': sizeConfig.icon,
      } as React.CSSProperties}
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
              className={cn("w-full justify-start h-10 py-1.5 px-3", isCollapsed ? "justify-center px-0" : "", fs.label)}
              onClick={() => onViewChange('projects')}
              title="Dashboard de Projetos"
            >
              <Layout className={cn(fs.icon, !isCollapsed && "mr-3")} />
              {!isCollapsed && <span className="font-semibold tracking-tight">Dashboard de Projetos</span>}
            </Button>

            {/* Prompt Library Tools */}
            <div className="space-y-1">
              {isCollapsed ? (
                <div className="flex flex-col items-center gap-1 py-1">
                  <Button
                    variant={currentView === 'prompts' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => onViewChange('prompts')}
                    title="Prompts"
                  >
                    <Palette className="w-5 h-5 text-foreground/70" />
                  </Button>
                  <Button
                    variant={currentView === 'moodboard' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-10 w-10"
                    onClick={onOpenAssets}
                    title="MoodBoard"
                  >
                    <ImageIcon className="w-5 h-5 text-foreground/70" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Collapsible open={promptsOpen} onOpenChange={setPromptsOpen}>
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant={currentView === 'prompts' ? 'secondary' : 'ghost'}
                          className="w-full justify-between h-10 py-1.5 px-3 hover:bg-primary/5 group transition-all"
                          onClick={() => onViewChange('prompts')}
                        >
                          <div className="flex items-center gap-3">
                            <Palette className={fs.icon} />
                            <span className={cn("font-semibold tracking-tight", fs.label)}>Prompts</span>
                          </div>
                          <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]:rotate-90 opacity-40")} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-1 pl-1 mt-1">
                      {/* Geral / Root section */}
                      <Collapsible key="tudo" defaultOpen>
                        <div className="flex items-center gap-1 pr-2 group/cat">
                          <CollapsibleTrigger asChild>
                            <Button
                              variant={currentView === 'prompts' && activeCategory === 'Tudo' ? 'secondary' : 'ghost'}
                              size="sm"
                              className={cn("flex-1 justify-start h-8 group px-2", fs.sub)}
                              onClick={() => {
                                onViewChange('prompts');
                                onSelectCategory('Tudo');
                              }}
                            >
                              <ChevronRight className="w-3 h-3 mr-1 transition-transform duration-200 group-data-[state=open]:rotate-90 opacity-40 group-hover/cat:opacity-100" />
                              <span className="font-semibold">Geral</span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="pl-4 space-y-0.5 border-l ml-1.5 border-border/40 mt-0.5">
                          {/* Uncategorized Prompts */}
                          {currentProject.prompts?.filter(p => !p.category).map(prompt => (
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

                          {/* Defined Categories (Nested under Geral) */}
                          {promptCategories.map(cat => (
                            <Collapsible key={cat}>
                              <div className="group/cat flex items-center gap-1 pr-2 relative mt-1">
                                <div className="absolute -left-[11px] top-1/2 w-2 h-px bg-border/40" />
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

                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn("w-full justify-start h-8 px-2 mt-2 text-muted-foreground hover:text-primary relative font-normal", fs.sub)}
                            onClick={() => setShowCategoryInput(true)}
                          >
                            <div className="absolute -left-[11px] top-1/2 w-2 h-px bg-border/40" />
                            <Plus className="w-3.5 h-3.5 mr-2" />
                            Nova Categoria
                          </Button>

                          {showCategoryInput && (
                            <div className="px-2 mt-1 relative">
                              <div className="absolute -left-[11px] top-1/2 w-2 h-px bg-border/40" />
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
                    </CollapsibleContent>
                  </Collapsible>

                  <Button
                    variant={currentView === 'moodboard' ? 'secondary' : 'ghost'}
                    className={cn("w-full justify-start h-10 py-1.5 px-3", fs.label)}
                    onClick={onOpenAssets}
                    title="MoodBoard"
                  >
                    <ImageIcon className={cn(fs.icon, "mr-3")} />
                    <span className="font-semibold tracking-tight">MoodBoard</span>
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 group/nav">
              <Button
                variant={currentView === 'canvas' ? 'secondary' : 'ghost'}
                className={cn("flex-1 justify-start h-10 py-1.5 px-3", isCollapsed ? "justify-center px-0" : "", fs.label)}
                onClick={() => onViewChange('canvas')}
                title="Storyboard (Canvas)"
              >
                <Layers className={cn(fs.icon, !isCollapsed && "mr-3")} />
                {!isCollapsed && <span className="font-semibold tracking-tight">Storyboard (Canvas)</span>}
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

                  <ScrollArea className="flex-1 max-h-[400px]">
                    <div className="space-y-1 relative pr-3">
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
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-6 w-6 transition-opacity",
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover/seq:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onDuplicateSequence(sequence.id);
                                }}
                                title="Duplicar Sequência"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover/seq:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onDeleteSequence(sequence.id);
                                }}
                                title="Excluir Sequência (Clique duplo para confirmar)"
                                onDoubleClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>

                          <CollapsibleContent className="pl-6 pt-1 space-y-0.5">
                            {sequence.scenes.length === 0 ? (
                              <div className={cn("text-muted-foreground/40 px-3 py-1 italic ml-4 border-l border-border/20", fs.sub)}>Sem cenas</div>
                            ) : (
                              sequence.scenes.filter(s => !s.parentId).map((scene) => {
                                const subscenes = sequence.scenes.filter(s => s.parentId === scene.id);
                                const hasSubscenes = subscenes.length > 0;

                                return (
                                  <React.Fragment key={scene.id}>
                                    <Collapsible defaultOpen>
                                      <div
                                        className={cn("flex items-center group/scene relative transition-colors", fs.sub)}
                                      >
                                        <div className="absolute -left-[9px] top-1/2 w-2 h-px bg-border/40" />
                                        <div className={cn(
                                          "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-sidebar-accent/30 cursor-pointer",
                                          scene.isVisible !== false ? "text-foreground" : "text-muted-foreground opacity-40"
                                        )}>
                                          {hasSubscenes ? (
                                            <CollapsibleTrigger asChild>
                                              <div className="p-0.5 hover:bg-muted rounded-sm cursor-pointer mr-0.5 group" onClick={(e) => e.stopPropagation()}>
                                                <ChevronRight className="w-3 h-3 transition-transform duration-200 group-data-[state=open]:rotate-90 opacity-60" />
                                              </div>
                                            </CollapsibleTrigger>
                                          ) : (
                                            <div className="w-4" />
                                          )}

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

                                      {/* Subscenes */}
                                      {hasSubscenes && (
                                        <CollapsibleContent>
                                          {subscenes.map((subScene) => (
                                            <div
                                              key={subScene.id}
                                              className={cn("flex items-center group/scene relative transition-colors", fs.sub)}
                                            >
                                              <div className="absolute -left-[9px] top-1/2 w-2 h-px bg-border/40" />
                                              {/* Tree indicator for nesting */}
                                              <div className="absolute left-[0px] -top-3 bottom-1/2 w-px bg-border/40" />
                                              <div className="absolute left-[0px] top-1/2 w-3 h-px bg-border/40" />

                                              <div className={cn(
                                                "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-sidebar-accent/30 cursor-pointer ml-3",
                                                subScene.isVisible !== false ? "text-foreground" : "text-muted-foreground opacity-40"
                                              )}>
                                                <div className="w-4" /> {/* Spacer for alignment */}
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground/40 mr-1" />
                                                <FileText className="w-3 h-3 opacity-40 group-hover/scene:opacity-100 transition-opacity" />
                                                {editingSceneId === subScene.id ? (
                                                  <input
                                                    type="text"
                                                    value={editingSceneName}
                                                    onChange={(e) => setEditingSceneName(e.target.value)}
                                                    onBlur={() => handleRenameScene(sequence.id, subScene.id)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameScene(sequence.id, subScene.id)}
                                                    className={cn("flex-1 bg-transparent border-b border-primary outline-none min-w-0", fs.sub)}
                                                    autoFocus
                                                  />
                                                ) : (
                                                  <span
                                                    className="truncate flex-1"
                                                    onDoubleClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingSceneId(subScene.id);
                                                      setEditingSceneName(subScene.title);
                                                    }}
                                                  >
                                                    {subScene.title}
                                                  </span>
                                                )}
                                              </div>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                  "h-6 w-6 transition-opacity ml-1",
                                                  subScene.isVisible !== false ? "opacity-0 group-hover/scene:opacity-100" : "opacity-100"
                                                )}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  onToggleSceneVisibility(sequence.id, subScene.id);
                                                }}
                                                title={subScene.isVisible !== false ? "Ocultar Cena" : "Mostrar Cena"}
                                              >
                                                {subScene.isVisible !== false ? (
                                                  <Eye className="w-3 h-3" />
                                                ) : (
                                                  <EyeOff className="w-3 h-3 text-primary" />
                                                )}
                                              </Button>
                                            </div>
                                          ))}
                                        </CollapsibleContent>
                                      )}
                                    </Collapsible>
                                  </React.Fragment>
                                );
                              })
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          )}

        </div>
      </ScrollArea>

      <div className={cn("border-t border-sidebar-border p-2 space-y-1", isCollapsed && "px-0 flex flex-col items-center")}>
        {/* Upgrade Pro Card - Prominent but integrated */}
        <div className={cn(
          "mb-2 mx-1 p-3 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 group cursor-pointer hover:border-indigo-500/40 transition-all",
          isCollapsed ? "p-2 w-9 h-9 flex items-center justify-center overflow-hidden" : ""
        )}
          onClick={() => navigate('/pricing')}
        >
          {isCollapsed ? (
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Mudar para Pro</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mb-2">Acesso total e exportação ilimitada 4K.</p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-medium text-indigo-400">7 Dias Grátis</span>
                <ChevronRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </>
          )}
        </div>

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
                        onClick={() => onFontSizeChange(size.id as any)}
                      >
                        <span className="text-xs font-bold">{size.title}</span>
                        <span className="text-[10px] opacity-50">{size.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Box className="w-3 h-3" />
                    Canvas
                  </Label>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground uppercase">Estilo de Grade</Label>
                      <div className="flex bg-muted p-1 rounded-lg gap-1">
                        {[
                          { id: 'dots', label: 'Pontos', icon: Circle },
                          { id: 'lines', label: 'Linhas', icon: Grid },
                          { id: 'none', label: 'Nenhum', icon: Square }
                        ].map((item) => (
                          <Button
                            key={item.id}
                            variant={gridStyle === item.id ? 'secondary' : 'ghost'}
                            className={cn(
                              "flex-1 h-8 gap-2",
                              gridStyle === item.id ? "bg-background shadow-sm shadow-black/5" : ""
                            )}
                            onClick={() => onGridStyleChange(item.id as any)}
                          >
                            <item.icon className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground uppercase">Estilo de Conexão</Label>
                      <div className="flex bg-muted p-1 rounded-lg gap-1">
                        {[
                          { id: 'smooth', label: 'Curva', icon: Activity },
                          { id: 'straight', label: 'Reta', icon: Minus }
                        ].map((item) => (
                          <Button
                            key={item.id}
                            variant={connectionStyle === item.id ? 'secondary' : 'ghost'}
                            className={cn(
                              "flex-1 h-8 gap-2",
                              connectionStyle === item.id ? "bg-background shadow-sm shadow-black/5" : ""
                            )}
                            onClick={() => onConnectionStyleChange(item.id as any)}
                          >
                            <item.icon className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Layout className="w-3 h-3" />
                    Comportamento
                  </Label>

                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground uppercase">Proporção Padrão (Novas Sequências)</Label>
                    <div className="flex bg-muted p-1 rounded-lg gap-1">
                      {[
                        { id: '16:9', label: 'Cinema (16:9)', icon: Ratio },
                        { id: '9:16', label: 'Social (9:16)', icon: Ratio },
                        { id: '4:3', label: 'TV (4:3)', icon: Ratio }
                      ].map((item) => (
                        <Button
                          key={item.id}
                          variant={defaultRatio === item.id ? 'secondary' : 'ghost'}
                          className={cn(
                            "flex-1 h-8 gap-2",
                            defaultRatio === item.id ? "bg-background shadow-sm shadow-black/5" : ""
                          )}
                          onClick={() => onDefaultRatioChange(item.id as any)}
                        >
                          <item.icon className="w-3 h-3" />
                          <span className="text-[10px] font-medium">{item.label}</span>
                        </Button>
                      ))}
                    </div>
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
    </div >
  );
}
