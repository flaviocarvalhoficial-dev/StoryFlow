import React, { useState, useRef } from 'react';
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
  EyeOff
} from 'lucide-react';
import { SequenceModule as SequenceModuleType, AspectRatio, Position } from '@/types/storyboard';
import { SceneCard } from './SceneCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
}

const aspectRatioIcons: Record<AspectRatio, React.ElementType> = {
  '3:4': RectangleVertical,
  '16:9': RectangleHorizontal,
  '9:16': RectangleVertical,
};

export function SequenceModule({
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
}: SequenceModuleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const moduleRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = (e.clientX - dragStart.current.x) / zoom;
    const newY = (e.clientY - dragStart.current.y) / zoom;
    onUpdatePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
  };

  const AspectIcon = aspectRatioIcons[sequence.aspectRatio];

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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Sequence Header Node */}
      <div
        className={cn(
          "module min-w-[200px] bg-background border-2 relative z-20 group transition-all duration-200",
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-module-border">
          <div className="flex items-center gap-2 flex-1">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            {isEditing ? (
              <input
                type="text"
                value={sequence.title}
                onChange={(e) => onUpdateSequence({ title: e.target.value })}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                className="no-drag bg-transparent border-b border-foreground/20 focus:border-foreground/50 outline-none text-sm font-medium flex-1"
                autoFocus
              />
            ) : (
              <span
                className="text-sm font-medium cursor-text"
                onDoubleClick={() => setIsEditing(true)}
              >
                {sequence.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 no-drag">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 transition-colors",
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
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <AspectIcon className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Renomear
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onUpdateSequence({ layoutDirection: sequence.layoutDirection === 'horizontal' ? 'vertical' : 'horizontal' })}>
                  {sequence.layoutDirection === 'horizontal' ? (
                    <>
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Mudar para Vertical
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Mudar para Horizontal
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onUpdateSequence({ aspectRatio: '3:4' })}>
                  <RectangleVertical className="w-4 h-4 mr-2" />
                  3:4
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateSequence({ aspectRatio: '16:9' })}>
                  <RectangleHorizontal className="w-4 h-4 mr-2" />
                  16:9
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateSequence({ aspectRatio: '9:16' })}>
                  <RectangleVertical className="w-4 h-4 mr-2 rotate-180" />
                  9:16
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onOpenContext}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
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
              className="h-7 w-7 text-destructive hover:text-destructive"
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
            : "-bottom-1.5 left-1/2 -translate-x-1/2"
        )} />
      </div>

      {/* Connection Line to First Scene (Hidden when collapsed) */}
      <div className={cn(
        "bg-border relative z-0 transition-all duration-500",
        sequence.layoutDirection === 'horizontal' ? "w-8 h-0.5" : "h-8 w-0.5",
        sequence.isCollapsed ? "w-4 opacity-0" : "opacity-100"
      )} />

      {/* Scenes Container */}
      <div className={cn(
        "flex items-center transition-all duration-500 ease-in-out relative",
        sequence.layoutDirection === 'horizontal' ? "flex-row" : "flex-col",
        // When collapsed, reduce padding/gap
        sequence.isCollapsed && "p-0 gap-0"
      )}>
        {sequence.scenes.filter(s => s.isVisible !== false).map((scene, index) => (
          <React.Fragment key={scene.id}>
            {/* Connector between scenes */}
            {index > 0 && (
              <div className={cn(
                "bg-border transition-all duration-500",
                sequence.layoutDirection === 'horizontal' ? "w-8 h-0.5" : "h-8 w-0.5",
                // When collapsed: shrink connector to 0
                sequence.isCollapsed && "w-0 h-0 opacity-0 m-0"
              )} />
            )}

            <div
              className={cn(
                "relative group transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                // Expanded: Normal flow
                // Collapsed: Negative margins to stack them up
                sequence.isCollapsed && (
                  sequence.layoutDirection === 'horizontal'
                    ? index === 0 ? "ml-0" : "-ml-[200px]"
                    : index === 0 ? "mt-0" : "-mt-[200px]" // Vertical stacking
                )
              )}
              style={sequence.isCollapsed ? {
                transform: `
                  translateX(${sequence.layoutDirection === 'horizontal' ? index * 8 : (index % 2) * 4}px) 
                  translateY(${sequence.layoutDirection === 'horizontal' ? (index % 2) * 4 : index * 8}px) 
                  rotate(${index % 2 === 0 ? 3 + index : -2 - index}deg)
                  scale(0.95)
                `,
                zIndex: sequence.scenes.length - index,
              } : {
                zIndex: 1,
                transform: 'none'
              }}
            >
              {/* Input Port (Hidden when collapsed) */}
              <div className={cn(
                "absolute w-2 h-2 bg-border rounded-full z-30 transition-opacity duration-200",
                sequence.layoutDirection === 'horizontal'
                  ? "-left-1 top-1/2 -translate-y-1/2"
                  : "-top-1 left-1/2 -translate-x-1/2",
                sequence.isCollapsed ? "opacity-0" : "opacity-100"
              )} />

              {/* Scene Content */}
              <div className={cn("transition-transform duration-500")}>
                <SceneCard
                  scene={scene}
                  aspectRatio={sequence.aspectRatio}
                  onUpdate={(updates) => onUpdateScene(scene.id, updates)}
                  onDelete={() => onDeleteScene(scene.id)}
                  onOpenNotes={() => onOpenNotes(scene.id)}
                />
              </div>

              {/* Output Port (Hidden when collapsed) */}
              <div className={cn(
                "absolute w-2 h-2 bg-foreground rounded-full border border-background z-30 transition-opacity duration-200",
                sequence.layoutDirection === 'horizontal'
                  ? "-right-1 top-1/2 -translate-y-1/2"
                  : "-bottom-1 left-1/2 -translate-x-1/2",
                sequence.isCollapsed ? "opacity-0" : "opacity-100"
              )} />
            </div>
          </React.Fragment>
        ))}

        {/* Connector to Add Button (Hidden when collapsed) */}
        <div className={cn(
          "bg-border transition-all hover:bg-primary/50 duration-300",
          sequence.layoutDirection === 'horizontal' ? "w-8 h-0.5" : "h-8 w-0.5",
          sequence.isCollapsed ? "w-0 h-0 opacity-0" : "opacity-100"
        )} />

        {/* Add Scene Button Node (Hidden when collapsed) */}
        <div
          className={cn(
            "group relative cursor-pointer transition-all duration-300 origin-left",
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
            "w-12 h-12 rounded-lg border-2 border-dashed border-border bg-background flex items-center justify-center transition-colors group-hover:border-primary group-hover:text-primary",
            sequence.layoutDirection === 'horizontal' ? "ml-0" : "mt-0"
          )}>
            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
