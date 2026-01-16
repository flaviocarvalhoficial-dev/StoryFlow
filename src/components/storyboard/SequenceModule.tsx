import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  StickyNote,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  GripVertical,
  Maximize2,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  ArrowRight,
  ArrowDown,
  Edit2,
  Eye,
  EyeOff,
  Film,
  Palette,
  MoveHorizontal,
  ChevronLeft,
  Type,
  X
} from 'lucide-react';
import { SequenceModule as SequenceModuleType, AspectRatio, Position, SceneModule } from '@/types/storyboard';
import { SceneCard } from './SceneCard';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface SequenceModuleProps {
  sequence: SequenceModuleType;
  isSelected: boolean;
  zoom: number;
  onSelect: () => void;
  onUpdatePosition: (position: Position) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onUpdateSequence: (updates: Partial<SequenceModuleType>) => void;
  onDelete: () => void;
  onToggleCollapse: () => void;
  onAddScene: () => void;
  onUpdateScene: (sceneId: string, updates: any) => void;
  onDeleteScene: (sceneId: string) => void;
  onOpenContext: () => void;
  onOpenNotes: (sceneId: string) => void;
  onToggleSceneVisibility: (sceneId: string) => void;
  onAddSubscene: (sceneId: string) => void;
  onOpenViewer: () => void;
  sceneBorderStyle?: 'solid' | 'none';
  onAddNarrativeMarker: (marker: { label: string, startSceneId: string, endSceneId: string, color?: string }) => void;
  onUpdateNarrativeMarker: (markerId: string, updates: any) => void;
  onDeleteNarrativeMarker: (markerId: string) => void;
}

const aspectRatioIcons: Record<AspectRatio, React.ElementType> = {
  '4:3': RectangleVertical,
  '16:9': RectangleHorizontal,
  '9:16': RectangleVertical,
};

function SequenceModuleComponent({
  sequence,
  isSelected,
  zoom,
  onSelect,
  onUpdatePosition,
  onDragStart,
  onDragEnd,
  onUpdateSequence,
  onDelete,
  onToggleCollapse,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onOpenContext,
  onOpenNotes,
  onToggleSceneVisibility,
  onAddSubscene,
  onOpenViewer,
  sceneBorderStyle = 'solid',
  onAddNarrativeMarker,
  onUpdateNarrativeMarker,
  onDeleteNarrativeMarker
}: SequenceModuleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const moduleRef = useRef<HTMLDivElement>(null);

  // Grouping Logic for Markers
  const topLevelScenes = (sequence.scenes || []).filter(s => !s.parentId && s.isVisible !== false);

  const updateMarkerRange = (markerId: string, edge: 'start' | 'end', direction: 'forward' | 'backward') => {
    const marker = sequence.narrativeMarkers?.find(m => m.id === markerId);
    if (!marker) return;

    const startIndex = topLevelScenes.findIndex(s => s.id === marker.startSceneId);
    const endIndex = topLevelScenes.findIndex(s => s.id === marker.endSceneId);

    if (startIndex === -1 || endIndex === -1) return;

    let newStartIndex = startIndex;
    let newEndIndex = endIndex;

    if (edge === 'start') {
      if (direction === 'backward') newStartIndex = Math.max(0, startIndex - 1);
      if (direction === 'forward') newStartIndex = Math.min(endIndex, startIndex + 1);
    } else {
      if (direction === 'backward') newEndIndex = Math.max(startIndex, endIndex - 1);
      if (direction === 'forward') newEndIndex = Math.min(topLevelScenes.length - 1, endIndex + 1);
    }

    if (newStartIndex !== startIndex || newEndIndex !== endIndex) {
      onUpdateNarrativeMarker(markerId, {
        startSceneId: topLevelScenes[newStartIndex].id,
        endSceneId: topLevelScenes[newEndIndex].id
      });
    }
  };

  const getGroupedScenes = () => {
    const groups: { type: 'marker' | 'scene', data: any, key: string }[] = [];

    let i = 0;
    while (i < topLevelScenes.length) {
      const scene = topLevelScenes[i];
      // Check if this scene starts a marker (and that marker is valid/ends in this list)
      const marker = (sequence.narrativeMarkers || []).find(m => m.startSceneId === scene.id);
      const endIndex = marker ? topLevelScenes.findIndex(s => s.id === marker.endSceneId) : -1;

      if (marker && endIndex >= i) {
        // Group scenes
        const grouped = topLevelScenes.slice(i, endIndex + 1);
        groups.push({ type: 'marker', data: { marker, scenes: grouped }, key: marker.id });
        i = endIndex + 1;
      } else {
        groups.push({ type: 'scene', data: scene, key: scene.id });
        i++;
      }
    }
    return groups;
  };

  const groupedItems = sequence.isCollapsed
    ? topLevelScenes.map(s => ({ type: 'scene' as const, data: s, key: s.id }))
    : getGroupedScenes();

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    e.stopPropagation();
    setIsDragging(true);
    onDragStart?.();
    dragStart.current = {
      x: e.clientX - sequence.position.x * zoom,
      y: e.clientY - sequence.position.y * zoom,
    };
    onSelect();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const newX = (e.clientX - dragStart.current.x) / zoom;
      const newY = (e.clientY - dragStart.current.y) / zoom;
      onUpdatePosition({ x: newX, y: newY });
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
      onDragEnd?.();
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, zoom, onUpdatePosition, onDragEnd]);

  const AspectIcon = aspectRatioIcons[sequence.aspectRatio] || RectangleHorizontal;

  const getStackMargin = (ratio: AspectRatio) => {
    switch (ratio) {
      case '9:16': return "-mt-[350px]";
      case '4:3': return "-mt-[130px]";
      default: return "-mt-[90px]"; // 16:9
    }
  };

  const renderSceneWithChildren = (scene: SceneModule, isTopLevel = false, index = 0) => {
    const subscenes = (sequence.scenes || []).filter(s => s.parentId === scene.id && s.isVisible !== false);
    const isExpanded = scene.isExpanded !== false;

    return (
      <div
        key={scene.id}
        className={cn(
          "relative group transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex items-center",
          sequence.layoutDirection === 'horizontal' ? "flex-row" : "flex-col",
          isTopLevel && sequence.isCollapsed && (
            sequence.layoutDirection === 'horizontal'
              ? index === 0 ? "ml-0" : "-ml-[220px]"
              : index === 0 ? "mt-0" : getStackMargin(sequence.aspectRatio)
          )
        )}
        style={{
          zIndex: isTopLevel ? ((sequence.scenes.length + 50) - index) : 1,
          transform: isTopLevel && sequence.isCollapsed ? `
            translateX(${index === 0 ? 0 : (index % 3 - 1) * 6}px) 
            translateY(${index === 0 ? 0 : (index % 2 === 0 ? 4 : -4)}px) 
            rotate(${index === 0 ? 0 : (index % 2 === 0 ? 1 : -1) * (3 + (index % 3))}deg)
          ` : 'none'
        }}
      >
        <div className="relative group/scenewrap">
          {/* Input Port */}
          {(!isTopLevel || index > 0) && (
            <div className={cn(
              "absolute w-2 h-2 bg-border rounded-full z-30 transition-opacity duration-200",
              sequence.layoutDirection === 'horizontal'
                ? "-left-1 top-1/2 -translate-y-1/2"
                : "-top-1 left-1/2 -translate-x-1/2",
              sequence.isCollapsed ? "opacity-0" : "opacity-100"
            )} />
          )}

          {/* Right Node to Add Subscene */}
          {!sequence.isCollapsed && (
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover/scenewrap:opacity-100 transition-opacity z-50">
              <button
                className="w-6 h-6 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all hover:scale-110 no-drag"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSubscene(scene.id);
                }}
                title="Adicionar Sub-Cena"
              >
                <Plus className="w-4 h-4" />
              </button>

              {subscenes.length > 0 && (
                <button
                  className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground shadow-lg flex items-center justify-center transition-all hover:scale-110 no-drag"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateScene(scene.id, { isExpanded: !isExpanded });
                  }}
                >
                  {!isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          )}

          {/* Stack effect when collapsed */}
          {!sequence.isCollapsed && !isExpanded && subscenes.length > 0 && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              {subscenes.slice(0, 3).map((_, i) => (
                <div
                  key={`stack-${i}`}
                  className={cn(
                    "absolute bg-secondary/30 rounded-md transition-all duration-300",
                    sceneBorderStyle === 'solid' && "border border-module-border/30",
                    isTopLevel ? "w-[220px]" : "w-[160px]",
                    "aspect-video" // fallback to video if no ratio is passed? No, aspect ratio is on Sequence.
                  )}
                  style={{
                    // aspect ratio from parent? No, we need to match the card height roughly.
                    // Let's use top/left/right/bottom 0 and then offset it.
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: `translateY(${(i + 1) * 6}px) translateX(${(i % 2 === 0 ? 1 : -1) * 4}px) rotate(${(i % 2 === 0 ? 1 : -1) * 2}deg)`,
                    zIndex: -1 - i,
                  }}
                />
              ))}
            </div>
          )}

          <SceneCard
            scene={scene}
            isSmall={!isTopLevel}
            aspectRatio={sequence.aspectRatio}
            onUpdate={(updates) => onUpdateScene(scene.id, updates)}
            onDelete={() => onDeleteScene(scene.id)}
            borderStyle={sceneBorderStyle}
            onOpenNotes={() => onOpenNotes(scene.id)}
          />

          {/* Output Port */}
          <div className={cn(
            "absolute w-2 h-2 bg-foreground rounded-full border border-background z-30 transition-opacity duration-200",
            sequence.layoutDirection === 'horizontal'
              ? "-right-1 top-1/2 -translate-y-1/2"
              : "-bottom-1 left-1/2 -translate-x-1/2",
            sequence.isCollapsed ? "opacity-0" : "opacity-100"
          )} />
        </div>

        {/* Render Subscenes Chain */}
        {!sequence.isCollapsed && isExpanded && subscenes.length > 0 && (
          <div className={cn(
            "flex transition-all duration-500",
            sequence.layoutDirection === 'horizontal' ? "flex-row" : "flex-col"
          )}>
            {subscenes.map((sub, sIdx) => (
              <React.Fragment key={sub.id}>
                {/* Connector to subscene */}
                <div className={cn(
                  "bg-primary/20 transition-all duration-500",
                  sequence.layoutDirection === 'horizontal' ? "w-8 h-0.5" : "h-8 w-0.5"
                )} />
                {renderSceneWithChildren(sub)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={moduleRef}
      className={cn(
        'absolute cursor-move select-none flex gap-0',
        sequence.layoutDirection === 'horizontal' ? 'flex-row items-center' : 'flex-col items-center',
        isSelected ? 'z-50' : 'z-10',
        isDragging && 'opacity-90'
      )}
      style={{
        left: sequence.position.x,
        top: sequence.position.y,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Wrapper to ensure vertical stacking of title and module */}
      <div className="flex flex-col">
        {/* Title Label - External, Above Module */}
        <div className="mb-1.5 px-1">
          {isEditing ? (
            <input
              type="text"
              value={sequence.title}
              onChange={(e) => onUpdateSequence({ title: e.target.value })}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="no-drag bg-background border border-primary rounded px-1.5 py-0.5 outline-none text-xs font-semibold shadow-sm w-full"
              autoFocus
            />
          ) : (
            <div
              className="text-xs font-semibold cursor-text px-1.5 py-0.5 rounded bg-background/80 border border-border/50 hover:border-primary/50 transition-colors truncate shadow-sm backdrop-blur-sm"
              onDoubleClick={() => setIsEditing(true)}
              title={sequence.title}
            >
              {sequence.title}
            </div>
          )}
        </div>

        {/* Sequence Header Node - Icons Only */}
        <div
          className={cn(
            "module min-w-[140px] bg-background relative z-20 group transition-all duration-200",
            isSelected
              ? "border-2 border-primary ring-2 ring-primary/20"
              : cn(sceneBorderStyle === 'none' ? "border-0" : "border-2 border-border", "hover:border-primary/50")
          )}
        >
          <div className="flex items-center justify-between p-1.5">
            <div className="flex items-center gap-0.5 flex-1">
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-0.5 no-drag">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 transition-colors",
                  sequence.isVisible === false && "text-primary"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSequence({ isVisible: sequence.isVisible === false ? true : false });
                }}
                title={sequence.isVisible !== false ? "Ocultar Sequência" : "Mostrar Sequência"}
              >
                {sequence.isVisible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <AspectIcon className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-3.5 h-3.5 mr-2" />
                    Renomear
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    const topLevel = (sequence.scenes || []).filter(s => !s.parentId && s.isVisible !== false);
                    const existingMarkers = sequence.narrativeMarkers || [];

                    // Helper to get ranges
                    const coveredIndices = new Set<number>();
                    existingMarkers.forEach(m => {
                      const sIdx = topLevel.findIndex(s => s.id === m.startSceneId);
                      const eIdx = topLevel.findIndex(s => s.id === m.endSceneId);

                      if (sIdx !== -1 && eIdx !== -1) {
                        // Only mark range if it's valid (start <= end)
                        // If inverted (start > end), we treat it as just the start index to avoid phantom blocking
                        if (sIdx <= eIdx) {
                          for (let k = sIdx; k <= eIdx; k++) {
                            coveredIndices.add(k);
                          }
                        } else {
                          // Inverted marker - only count start
                          coveredIndices.add(sIdx);
                        }
                      } else if (sIdx !== -1) {
                        coveredIndices.add(sIdx);
                      } else if (eIdx !== -1) {
                        // Orphaned end? Ignore or mark
                        coveredIndices.add(eIdx);
                      }
                    });

                    // Find first free index
                    let startIdx = -1;
                    for (let i = 0; i < topLevel.length; i++) {
                      if (!coveredIndices.has(i)) {
                        startIdx = i;
                        break;
                      }
                    }

                    if (startIdx !== -1) {
                      // Try to grab the next one too if free
                      let endIdx = startIdx;

                      // Look ahead for contiguous free slot
                      if (startIdx + 1 < topLevel.length && !coveredIndices.has(startIdx + 1)) {
                        endIdx = startIdx + 1;
                      }

                      onAddNarrativeMarker({
                        label: `Seção ${(existingMarkers.length || 0) + 1}`,
                        startSceneId: topLevel[startIdx].id,
                        endSceneId: topLevel[endIdx].id,
                        color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][existingMarkers.length % 5]
                      });
                    } else {
                      // Fallback if full
                      if (topLevel.length === 0) {
                        alert("Adicione cenas à sequência antes de criar marcadores.");
                      } else {
                        alert("Todas as cenas já pertencem a um grupo. Adicione mais cenas ou ajuste o alcance dos marcadores existentes para liberar espaço.");
                      }
                    }
                  }}>
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Adicionar Marcador
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onUpdateSequence({ layoutDirection: sequence.layoutDirection === 'horizontal' ? 'vertical' : 'horizontal' })}>
                    {sequence.layoutDirection === 'horizontal' ? (
                      <>
                        <ArrowDown className="w-3.5 h-3.5 mr-2" />
                        Mudar para Vertical
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 mr-2" />
                        Mudar para Horizontal
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onUpdateSequence({ scenesSpacing: sequence.scenesSpacing === 'none' ? 'normal' : 'none' })}>
                    {sequence.scenesSpacing === 'none' ? (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 mr-2" />
                        Adicionar Espaço
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 mr-2" />
                        Remover Espaço
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onUpdateSequence({ aspectRatio: '4:3' })}>
                    <RectangleVertical className="w-3.5 h-3.5 mr-2" />
                    4:3
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateSequence({ aspectRatio: '16:9' })}>
                    <RectangleHorizontal className="w-3.5 h-3.5 mr-2" />
                    16:9
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateSequence({ aspectRatio: '9:16' })}>
                    <RectangleVertical className="w-3.5 h-3.5 mr-2 rotate-180" />
                    9:16
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenViewer();
                }}
                title="Visualizar Sequência (Sensação de Vídeo)"
              >
                <Film className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onOpenContext}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onToggleCollapse}
              >
                <ChevronRight className={cn(
                  "w-3.5 h-3.5 transition-transform duration-300",
                  !sequence.isCollapsed && "rotate-90"
                )} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Connector Port (Right/Bottom of Header) */}
          <div className={cn(
            "absolute w-3 h-3 bg-foreground rounded-full border-2 border-background z-30 transition-all",
            sequence.layoutDirection === 'horizontal'
              ? "-right-1.5 top-1/2 -translate-y-1/2"
              : "-bottom-1 left-1/2 -translate-x-1/2"
          )} />
        </div>
      </div>

      {/* Connection Line to First Scene (Hidden when collapsed) */}
      <div className={cn(
        "bg-border relative z-0 transition-all duration-500",
        sequence.layoutDirection === 'horizontal' ? "w-8 h-0.5" : "h-8 w-0.5",
        sequence.isCollapsed ? "w-4 opacity-0" : "opacity-100"
      )} />

      {/* Main Scenes Container */}
      <div className={cn(
        "flex items-center transition-all duration-500 ease-in-out relative",
        sequence.layoutDirection === 'horizontal' ? "flex-row" : "flex-col",
        // When collapsed, reduce padding/gap
        sequence.isCollapsed && "p-0 gap-0"
      )}>
        {groupedItems.map((item, index) => {
          // Determine if we need a connector before this item
          const needsConnector = index > 0;

          if (item.type === 'scene') {
            const scene = item.data;
            return (
              <React.Fragment key={scene.id}>
                {needsConnector && (
                  <div className={cn(
                    "bg-border transition-all duration-500",
                    sequence.layoutDirection === 'horizontal'
                      ? (sequence.scenesSpacing === 'none' ? "w-0 h-0 opacity-0" : "w-8 h-0.5")
                      : (sequence.scenesSpacing === 'none' ? "h-0 w-0 opacity-0" : "h-8 w-0.5"),
                    sequence.isCollapsed && "w-0 h-0 opacity-0 m-0"
                  )} />
                )}
                {renderSceneWithChildren(scene, true, index)}
              </React.Fragment>
            )
          } else {
            // Marker Group
            const marker = item.data.marker;
            const scenes = item.data.scenes;
            return (
              <React.Fragment key={marker.id}>
                {needsConnector && (
                  <div className={cn(
                    "bg-border transition-all duration-500",
                    sequence.layoutDirection === 'horizontal'
                      ? (sequence.scenesSpacing === 'none' ? "w-0 h-0 opacity-0" : "w-8 h-0.5")
                      : (sequence.scenesSpacing === 'none' ? "h-0 w-0 opacity-0" : "h-8 w-0.5"),
                    sequence.isCollapsed && "w-0 h-0 opacity-0 m-0"
                  )} />
                )}
                <div className={cn(
                  "relative border-t transition-all duration-300 flex items-center pt-2 mt-4 px-2 hover:bg-accent/5 rounded-md group/marker",
                  sequence.layoutDirection === 'horizontal' ? "flex-row" : "flex-col",
                  sequence.isCollapsed && "hidden"
                )}
                  style={{
                    borderColor: marker.color || 'var(--primary)',
                    borderTopWidth: '3px'
                  }}>
                  {/* Marker Label with Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 bg-background px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground border border-border/50 rounded-full cursor-pointer hover:text-foreground no-drag z-20 whitespace-nowrap shadow-sm flex items-center gap-2 hover:scale-105 transition-transform"
                        style={{ color: marker.color }}
                      >
                        {marker.label}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 no-drag" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground">Nome</label>
                          <div className="flex items-center gap-2">
                            <Type className="w-3 h-3 text-muted-foreground" />
                            <input
                              className="flex-1 bg-transparent border-b border-border text-xs focus:outline-none focus:border-primary py-1"
                              value={marker.label}
                              onChange={(e) => onUpdateNarrativeMarker(marker.id, { label: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground">Cor</label>
                          <div className="flex gap-1.5 flex-wrap">
                            {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280'].map(color => (
                              <button
                                key={color}
                                className={cn(
                                  "w-5 h-5 rounded-full border border-border/50 transition-transform hover:scale-110",
                                  marker.color === color && "ring-2 ring-offset-1 ring-primary"
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => onUpdateNarrativeMarker(marker.id, { color })}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground">Alcance</label>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground w-8">Início</span>
                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => updateMarkerRange(marker.id, 'start', 'backward')}>
                                  <ChevronLeft className="w-3 h-3" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => updateMarkerRange(marker.id, 'start', 'forward')}>
                                  <ChevronRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground w-8">Fim</span>
                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => updateMarkerRange(marker.id, 'end', 'backward')}>
                                  <ChevronLeft className="w-3 h-3" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => updateMarkerRange(marker.id, 'end', 'forward')}>
                                  <ChevronRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <DropdownMenuSeparator />

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive hover:text-destructive h-7 text-xs justify-start px-0"
                          onClick={() => onDeleteNarrativeMarker(marker.id)}
                        >
                          <X className="w-3 h-3 mr-2" />
                          Remover Marcador
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {scenes.map((s: any, idx: number) => (
                    <React.Fragment key={s.id}>
                      {idx > 0 && (
                        <div className={cn(
                          "bg-border transition-all duration-500",
                          sequence.layoutDirection === 'horizontal'
                            ? (sequence.scenesSpacing === 'none' ? "w-0 h-0 opacity-0" : "w-8 h-0.5")
                            : (sequence.scenesSpacing === 'none' ? "h-0 w-0 opacity-0" : "h-8 w-0.5"),
                        )} />
                      )}
                      {renderSceneWithChildren(s, true, index + idx)}
                    </React.Fragment>
                  ))}
                </div>
              </React.Fragment>
            )
          }
        })}

        {/* Connector to Add Button (Hidden when collapsed) */}
        <div className={cn(
          "bg-border transition-all hover:bg-primary/50 duration-300",
          sequence.layoutDirection === 'horizontal' ? "w-8 h-0.5" : "h-8 w-0.5",
          sequence.isCollapsed ? "w-0 h-0 opacity-0" : "opacity-100"
        )} />

        {/* Add Scene Button Node (Hidden when collapsed) */}
        <div
          className={cn(
            "group relative cursor-pointer transition-all duration-300 origin-left shrink-0",
            sequence.isCollapsed ? "scale-0 opacity-0 w-0 h-0 overflow-hidden ml-0" : "scale-100 opacity-100"
          )}
          onClick={onAddScene}
        >
          {/* Input Port for Button */}
          <div className={cn(
            "absolute w-2 h-2 bg-border rounded-full z-30",
            sequence.layoutDirection === 'horizontal'
              ? "-left-1 top-1/2 -translate-y-1/2"
              : "-top-1 left-1/2 -translate-x-1/2"
          )} />

          <div className={cn(
            "w-12 h-12 rounded-lg relative bg-background flex items-center justify-center transition-colors group-hover:text-primary overflow-hidden",
            sequence.layoutDirection === 'horizontal' ? "ml-0" : "mt-0"
          )}>
            {/* Animated Border */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <rect
                x="2" y="2" width="44" height="44" rx="6" ry="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="text-muted-foreground/30 group-hover:text-primary transition-colors duration-300 animate-dash"
              />
            </svg>
            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary relative z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const SequenceModule = React.memo(SequenceModuleComponent, (prev, next) => {
  // Custom comparison to ignore function props which change every render
  // Compare structural props that affect rendering
  if (prev.sequence !== next.sequence) return false;
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.zoom !== next.zoom) return false;
  if (prev.sceneBorderStyle !== next.sceneBorderStyle) return false;

  // Functions are ignored in comparison as they are assumed to be stable in intent
  return true;
});


