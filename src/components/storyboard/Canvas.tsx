import React, { useEffect, useRef, useState } from 'react';
import { Plus, ZoomIn, ZoomOut, Maximize, Undo2, Redo2 } from 'lucide-react';
import { Project, Position, SequenceModule as SequenceType } from '@/types/storyboard';
import { SequenceModule } from './SequenceModule';
import { ConnectionLine, ConnectionDefs } from './ConnectionLine';
import { Button } from '@/components/ui/button';
import { useCanvas } from '@/hooks/useCanvas';
import { cn } from '@/lib/utils';

interface CanvasProps {
  project: Project;
  onAddSequence: (position: Position) => void;
  onUpdateSequence: (id: string, updates: Partial<SequenceType>, saveHistory?: boolean) => void;
  onDeleteSequence: (id: string) => void;
  onToggleCollapseSequence: (id: string) => void;
  onAddScene: (sequenceId: string, position: Position) => void;
  onUpdateScene: (sequenceId: string, sceneId: string, updates: any) => void;
  onDeleteScene: (sequenceId: string, sceneId: string) => void;
  onOpenContext: (sequenceId: string) => void;
  onOpenNotes: (sequenceId: string, sceneId: string) => void;
  onSetCanvasBg: (bg: Project['canvasBg']) => void;
  onToggleSequenceVisibility: (id: string) => void;
  onToggleSceneVisibility: (sequenceId: string, sceneId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddSubscene: (sequenceId: string, sceneId: string) => void;
}

export function Canvas({
  project,
  onAddSequence,
  onUpdateSequence,
  onDeleteSequence,
  onToggleCollapseSequence,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onOpenContext,
  onOpenNotes,
  onSetCanvasBg,
  onToggleSequenceVisibility,
  onToggleSceneVisibility,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAddSubscene
}: CanvasProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    canvasState,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    select,
    resetView,
  } = useCanvas();

  const [showAddButton, setShowAddButton] = useState(false);
  const [addPosition, setAddPosition] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    canvas.addEventListener('wheel', wheelHandler, { passive: false });

    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === 'z';
      const isY = e.key.toLowerCase() === 'y';
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isCtrl && isZ) {
        if (isShift) {
          e.preventDefault();
          if (canRedo) onRedo();
        } else {
          e.preventDefault();
          if (canUndo) onUndo();
        }
      } else if (isCtrl && isY) {
        e.preventDefault();
        if (canRedo) onRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, onUndo, onRedo, canUndo, canRedo]);

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.module')) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - canvasState.panOffset.x) / canvasState.zoom;
    const y = (e.clientY - rect.top - canvasState.panOffset.y) / canvasState.zoom;

    setAddPosition({ x, y });
    setShowAddButton(true);
    setTimeout(() => setShowAddButton(false), 3000);
  };

  const handleAddSequence = () => {
    onAddSequence(addPosition);
    setShowAddButton(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.module')) return;
    select(null, null);
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).closest('.module')) return;
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const getCanvasBg = () => {
    switch (project.canvasBg) {
      case 'black': return '#000000';
      case 'dark-gray': return '#1a1a1a';
      case 'light-gray': return '#cccccc';
      case 'white': return '#ffffff';
      case 'medium': return 'var(--background-canvas)'; // Fallback to theme variable
      case 'dark': return 'var(--background-canvas)';
      case 'light':
      default: return 'var(--background-canvas)';
    }
  };

  const getCanvasDotColor = () => {
    switch (project.canvasBg) {
      case 'white':
      case 'light-gray':
      case 'light':
        return 'rgba(0,0,0,0.1)';
      case 'black':
      case 'dark-gray':
      case 'dark':
      case 'medium':
        return 'rgba(255,255,255,0.1)';
      default:
        return 'rgba(0,0,0,0.1)';
    }
  };

  const [guides, setGuides] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });

  const handleSequenceDrag = (id: string, newPos: Position) => {
    const SNAP_THRESHOLD = 8;
    let snappedX = newPos.x;
    let snappedY = newPos.y;
    let guideX: number | null = null;
    let guideY: number | null = null;

    // Compare with all other sequences
    project.sequences.forEach(other => {
      if (other.id === id) return;

      // Vertical alignment (X)
      if (Math.abs(newPos.x - other.position.x) < SNAP_THRESHOLD) {
        snappedX = other.position.x;
        guideX = snappedX;
      }

      // Horizontal alignment (Y)
      if (Math.abs(newPos.y - other.position.y) < SNAP_THRESHOLD) {
        snappedY = other.position.y;
        guideY = snappedY;
      }
    });

    setGuides({ x: guideX, y: guideY });
    onUpdateSequence(id, { position: { x: snappedX, y: snappedY } }, false);
  };

  return (
    <div className={cn("flex-1 relative overflow-hidden transition-colors duration-300", getCanvasBg())}>
      {/* Alignment Guides */}
      <div
        className="absolute inset-0 pointer-events-none z-[100]"
        style={{
          transform: `translate(${canvasState.panOffset.x}px, ${canvasState.panOffset.y}px) scale(${canvasState.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {guides.x !== null && (
          <div
            className="absolute top-[-20000px] bottom-[-20000px] w-px bg-foreground/20 shadow-[0_0_10px_rgba(0,0,0,0.05),0_0_5px_rgba(255,255,255,0.1)] z-[100]"
            style={{ left: guides.x }}
          />
        )}
        {guides.y !== null && (
          <div
            className="absolute left-[-20000px] right-[-20000px] h-px bg-foreground/20 shadow-[0_0_10px_rgba(0,0,0,0.05),0_0_5px_rgba(255,255,255,0.1)] z-[100]"
            style={{ top: guides.y }}
          />
        )}
      </div>

      {/* Canvas controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg p-1 border border-border shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", !canUndo && "opacity-30 cursor-not-allowed")}
          onClick={() => canUndo && onUndo()}
          disabled={!canUndo}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", !canRedo && "opacity-30 cursor-not-allowed")}
          onClick={() => canRedo && onRedo()}
          disabled={!canRedo}
          title="Refazer (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            onAddSequence({
              x: (rect.width / 2 - canvasState.panOffset.x) / canvasState.zoom - 140,
              y: (rect.height / 2 - canvasState.panOffset.y) / canvasState.zoom - 100,
            });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            const newZoom = Math.min(canvasState.zoom * 1.2, 3);
            handleWheel({ deltaY: -1, altKey: true, preventDefault: () => { } } as any);
          }}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[40px] text-center">
          {Math.round(canvasState.zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            handleWheel({ deltaY: 1, altKey: true, preventDefault: () => { } } as any);
          }}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={resetView}
        >
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas hint */}
      <div className="absolute bottom-4 right-4 z-10 text-xs text-muted-foreground bg-card/60 backdrop-blur-sm px-2 py-1 rounded border border-border">
        Alt + Scroll para zoom • Shift + Drag para mover • Duplo clique para adicionar
      </div>

      {/* Main canvas area */}
      <div
        ref={canvasRef}
        className={cn(
          'w-full h-full canvas-grid select-none outline-none'
        )}
        style={{
          cursor: showAddButton ? 'crosshair' : 'grab',
          backgroundColor: getCanvasBg(),
          '--canvas-dot': getCanvasDotColor(),
        } as any}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
        onClick={handleCanvasClick}
        onContextMenu={handleContextMenu}
      >
        {/* Transform container */}
        <div
          style={{
            transform: `translate(${canvasState.panOffset.x}px, ${canvasState.panOffset.y}px) scale(${canvasState.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Connection lines SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              width: '10000px',
              height: '10000px',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <ConnectionDefs />
            {project.connections.map(conn => {
              const fromSequence = project.sequences.find(s => s.id === conn.fromId || s.scenes.some(sc => sc.id === conn.fromId));
              const toSequence = project.sequences.find(s => s.id === conn.toId || s.scenes.some(sc => sc.id === conn.toId));

              if (!fromSequence || !toSequence) return null;

              const getPos = (seq: any, id: string, type: string) => {
                if (type === 'sequence') {
                  return {
                    x: seq.position.x + 200, // Right edge of header
                    y: seq.position.y + 25   // Mid header
                  };
                }
                const sceneIdx = seq.scenes.findIndex((s: any) => s.id === id);
                if (sceneIdx === -1) return seq.position;

                // Approximate position inside the flex layout
                if (seq.layoutDirection === 'horizontal') {
                  const x = seq.position.x + 200 + 40 + (sceneIdx * (220 + 32)) + 110;
                  const y = seq.position.y + 100;
                  return { x, y };
                } else {
                  const x = seq.position.x + 100;
                  const y = seq.position.y + 50 + 40 + (sceneIdx * (150 + 32)) + 75;
                  return { x, y };
                }
              };

              const fromPos = getPos(fromSequence, conn.fromId, conn.fromType);
              const toPos = getPos(toSequence, conn.toId, conn.toType);

              return (
                <ConnectionLine
                  key={conn.id}
                  connection={conn}
                  fromPos={fromPos}
                  toPos={toPos}
                />
              );
            })}
          </svg>

          {/* Sequence modules */}
          {project.sequences.filter(s => s.isVisible !== false).map(sequence => (
            <SequenceModule
              key={sequence.id}
              sequence={sequence}
              isSelected={canvasState.selectedId === sequence.id}
              zoom={canvasState.zoom}
              onSelect={() => select(sequence.id, 'sequence')}
              onUpdatePosition={(pos) => handleSequenceDrag(sequence.id, pos)}
              onDragEnd={() => {
                setGuides({ x: null, y: null });
                onUpdateSequence(sequence.id, { position: sequence.position }, true);
              }}
              onUpdateSequence={(updates) => onUpdateSequence(sequence.id, updates)}
              onDelete={() => onDeleteSequence(sequence.id)}
              onToggleCollapse={() => onToggleCollapseSequence(sequence.id)}
              onAddScene={() => onAddScene(sequence.id, { x: 0, y: 0 })}
              onUpdateScene={(sceneId, updates) => onUpdateScene(sequence.id, sceneId, updates)}
              onDeleteScene={(sceneId) => onDeleteScene(sequence.id, sceneId)}
              onOpenContext={() => onOpenContext(sequence.id)}
              onOpenNotes={(sceneId) => onOpenNotes(sequence.id, sceneId)}
              onToggleSceneVisibility={(sceneId) => onToggleSceneVisibility(sequence.id, sceneId)}
              onAddSubscene={(sceneId) => onAddSubscene(sequence.id, sceneId)}
            />
          ))}

          {/* Add button on double click */}
          {showAddButton && (
            <div
              className="absolute animate-scale-in"
              style={{
                left: addPosition.x,
                top: addPosition.y,
              }}
            >
              <Button
                variant="secondary"
                size="sm"
                className="shadow-lg"
                onClick={handleAddSequence}
              >
                <Plus className="w-4 h-4 mr-1" />
                Nova Sequência
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu / Background Picker */}
      {contextMenu && (
        <div
          className="fixed z-[1000] bg-popover border border-border rounded-lg shadow-xl py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-200"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cor do Fundo</div>
          {[
            { id: 'white', label: 'Branco', color: '#ffffff' },
            { id: 'light-gray', label: 'Cinza Claro', color: '#cccccc' },
            { id: 'dark-gray', label: 'Cinza Escuro', color: '#1a1a1a' },
            { id: 'black', label: 'Preto', color: '#000000' }
          ].map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent transition-colors text-left"
              onClick={() => {
                onSetCanvasBg(item.id as any);
                setContextMenu(null);
              }}
            >
              <div
                className="w-3 h-3 rounded-full border border-border"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
              {project.canvasBg === item.id && <div className="ml-auto w-1 h-1 rounded-full bg-primary" />}
            </button>
          ))}
          <div className="h-px bg-border my-1" />
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent transition-colors text-left italic opacity-70"
            onClick={() => {
              onSetCanvasBg('light');
              setContextMenu(null);
            }}
          >
            Resetar Tema
          </button>
        </div>
      )}
    </div>
  );
}
