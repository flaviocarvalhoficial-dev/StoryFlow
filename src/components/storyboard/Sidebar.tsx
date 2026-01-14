import React, { useState, useCallback, useEffect } from 'react';
import {
  Layout,
  Layers,
  Lock,
  Unlock,
} from 'lucide-react';
import { Project, PromptStyle, SequenceModule, SceneModule } from '@/types/storyboard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarSettings } from './sidebar/SidebarSettings';
import { SidebarUpgradeCard } from './sidebar/SidebarUpgradeCard';
import { ProjectHierarchy } from './sidebar/ProjectHierarchy';
import { PromptLibrary } from './sidebar/PromptLibrary';

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

  // Resize Logic
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

      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <ScrollArea className="flex-1">
        <div className={cn("p-3 space-y-6", isCollapsed && "px-2")}>
          {/* Main Navigation */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-left h-10 py-1.5 px-3",
                currentView === 'projects' ? "bg-primary/10 text-primary hover:bg-primary/20 shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                isCollapsed ? "justify-center px-0" : "",
                fs.label
              )}
              onClick={() => onViewChange('projects')}
              title="Dashboard de Projetos"
            >
              <Layout className={cn(fs.icon, !isCollapsed && "mr-3", currentView === 'projects' && "text-primary")} />
              {!isCollapsed && <span className="font-medium tracking-tight">Dashboard de Projetos</span>}
            </Button>

            <PromptLibrary
              isCollapsed={isCollapsed}
              currentView={currentView}
              onViewChange={onViewChange}
              activeCategory={activeCategory}
              onSelectCategory={onSelectCategory}
              currentProject={currentProject}
              promptCategories={promptCategories}
              onDeletePrompt={onDeletePrompt}
              onDeletePromptCategory={onDeletePromptCategory}
              onAddPromptCategory={onAddPromptCategory}
              onOpenAssets={onOpenAssets}
              fontStyles={fs}
            />

            <div className="flex items-center gap-1 group/nav">
              <Button
                variant="ghost"
                className={cn(
                  "flex-1 justify-start text-left h-10 py-1.5 px-3",
                  currentView === 'canvas' ? "bg-primary/10 text-primary hover:bg-primary/20 shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  isCollapsed ? "justify-center px-0" : "",
                  fs.label
                )}
                onClick={() => onViewChange('canvas')}
                title="Storyboard (Canvas)"
              >
                <Layers className={cn(fs.icon, !isCollapsed && "mr-3", currentView === 'canvas' && "text-primary")} />
                {!isCollapsed && <span className="font-medium tracking-tight">Storyboard (Canvas)</span>}
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
            <ProjectHierarchy
              currentProject={currentProject}
              isCollapsed={isCollapsed}
              onUpdateProject={onUpdateProject}
              onAddSequence={onAddSequence}
              onUpdateSequence={onUpdateSequence}
              onDeleteSequence={onDeleteSequence}
              onDuplicateSequence={onDuplicateSequence}
              onToggleSequenceVisibility={onToggleSequenceVisibility}
              onUpdateScene={onUpdateScene}
              onToggleSceneVisibility={onToggleSceneVisibility}
              fontStyles={fs}
            />
          )}

        </div>
      </ScrollArea>

      <div className={cn("border-t border-sidebar-border p-2 space-y-1", isCollapsed && "px-0 flex flex-col items-center")}>
        <SidebarUpgradeCard isCollapsed={isCollapsed} />
        <SidebarSettings
          isCollapsed={isCollapsed}
          fontSize={fontSize}
          onFontSizeChange={onFontSizeChange}
          gridStyle={gridStyle}
          onGridStyleChange={onGridStyleChange}
          connectionStyle={connectionStyle}
          onConnectionStyleChange={onConnectionStyleChange}
          defaultRatio={defaultRatio}
          onDefaultRatioChange={onDefaultRatioChange}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          fontStyles={fs}
        />
      </div>
    </div >
  );
}
