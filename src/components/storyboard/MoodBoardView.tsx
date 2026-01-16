import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoodBoardItem, Position } from '@/types/storyboard';
import { cn } from '@/lib/utils';
import { X, ZoomIn, ZoomOut, Move, Trash2, Copy, Scissors, ClipboardPaste, BringToFront, Undo2, Redo2, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
    ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { toast } from "sonner";

interface MoodBoardViewProps {
    items: MoodBoardItem[];
    onAddItem: (item: MoodBoardItem) => void;
    onUpdateItem: (id: string, updates: Partial<MoodBoardItem>) => void;
    onDeleteItem: (id: string) => void;
    projectId: string;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export function MoodBoardView({ items, onAddItem, onUpdateItem, onDeleteItem, projectId, onUndo, onRedo, canUndo, canRedo }: MoodBoardViewProps) {
    // Initialize state from localStorage if available
    const [zoom, setZoom] = useState(() => {
        const saved = localStorage.getItem(`moodboard_zoom_${projectId}`);
        return saved ? parseFloat(saved) : 1;
    });
    const [pan, setPan] = useState(() => {
        const saved = localStorage.getItem(`moodboard_pan_${projectId}`);
        return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    });

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);
    const resizeHandle = useRef<string | null>(null);
    const startSize = useRef({ width: 0, height: 0 });
    const dragStartPos = useRef<Position>({ x: 0, y: 0 });
    const itemStartPos = useRef<Position>({ x: 0, y: 0 });

    const isPanningCanvas = useRef(false);
    const panStartPos = useRef<Position>({ x: 0, y: 0 });

    // Persist view state
    useEffect(() => {
        localStorage.setItem(`moodboard_zoom_${projectId}`, zoom.toString());
        localStorage.setItem(`moodboard_pan_${projectId}`, JSON.stringify(pan));
    }, [zoom, pan, projectId]);

    const handlePasteImageBlob = useCallback((blob: Blob, position?: Position) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const container = document.getElementById('moodboard-container');
                const rect = container?.getBoundingClientRect() || { width: 800, height: 600, left: 0, top: 0 };

                let centerX, centerY;

                if (position) {
                    centerX = (position.x - rect.left - pan.x) / zoom;
                    centerY = (position.y - rect.top - pan.y) / zoom;
                } else {
                    centerX = (rect.width / 2 - pan.x) / zoom;
                    centerY = (rect.height / 2 - pan.y) / zoom;
                }

                let width = img.width;
                let height = img.height;
                const maxSize = 500;

                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width *= ratio;
                    height *= ratio;
                }

                onAddItem({
                    id: crypto.randomUUID(),
                    type: 'image',
                    content: base64,
                    position: {
                        x: centerX - width / 2,
                        y: centerY - height / 2,
                    },
                    width,
                    height,
                    zIndex: (items?.length || 0) + 1
                });
            };
        };
        reader.readAsDataURL(blob);
    }, [items, onAddItem, pan, zoom]);

    const handleCopy = useCallback(async (item: MoodBoardItem) => {
        try {
            await navigator.clipboard.writeText(JSON.stringify({
                storyflow_type: 'moodboard_item',
                data: item
            }));
            toast.success("Copiado!", { position: 'bottom-center' });
        } catch (e) {
            toast.error("Erro ao copiar");
        }
    }, []);

    const handleCut = useCallback(async (item: MoodBoardItem) => {
        try {
            await handleCopy(item);
            onDeleteItem(item.id);
        } catch (e) {
            toast.error("Erro ao recortar");
        }
    }, [handleCopy, onDeleteItem]);

    const handlePasteFromMenu = useCallback(async () => {
        try {
            // 1. Try accessing text (internal item)
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    const parsed = JSON.parse(text);
                    if (parsed.storyflow_type === 'moodboard_item' && parsed.data) {
                        const item = parsed.data as MoodBoardItem;
                        // Add with slight offset or center
                        onAddItem({
                            ...item,
                            id: crypto.randomUUID(),
                            position: {
                                x: item.position.x + 20,
                                y: item.position.y + 20
                            },
                            zIndex: (items?.length || 0) + 1
                        });
                        toast.success("Colado!", { position: 'bottom-center' });
                        return;
                    }
                }
            } catch (e) {
                // Not JSON or permission denied, continue to images
            }

            // 2. Try accessing images
            const clipboardItems = await navigator.clipboard.read();
            let foundImage = false;
            for (const item of clipboardItems) {
                const imageType = item.types.find(t => t.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    handlePasteImageBlob(blob); // Will paste at center
                    foundImage = true;
                }
            }
            if (foundImage) {
                toast.success("Imagem colada!", { position: 'bottom-center' });
            } else {
                if (!foundImage) toast.info("Nenhuma imagem ou item compatível encontrado na área de transferência.", { position: 'bottom-center' });
            }

        } catch (e) {
            console.error(e);
            toast.error("Erro ao acessar área de transferência. Tente CTRL+V.", { position: 'bottom-center' });
        }
    }, [onAddItem, items, handlePasteImageBlob]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Copy (Ctrl+C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                if (selectedId) {
                    const item = items.find(i => i.id === selectedId);
                    if (item) handleCopy(item);
                }
            }

            // Paste (Ctrl+V) - Removed to avoid duplication with native 'paste' event

            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedId) {
                    onDeleteItem(selectedId);
                    setSelectedId(null);
                }
            }

            // Undo (Ctrl+Z)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) onUndo();
            }

            // Redo (Ctrl+Y or Ctrl+Shift+Z)
            if (
                ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
            ) {
                e.preventDefault();
                if (canRedo) onRedo();
            }

            // Zoom In (Ctrl + =)
            if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
                e.preventDefault();
                setZoom(z => Math.min(z * 1.2, 5));
            }

            // Zoom Out (Ctrl + -)
            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                setZoom(z => Math.max(z / 1.2, 0.1));
            }

            // Reset Zoom (Ctrl + 0)
            if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault();
                setZoom(1);
                setPan({ x: 0, y: 0 });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, items, handleCopy, onDeleteItem, canUndo, canRedo, onUndo, onRedo]);

    // Handle image pasting (native paste)
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            // 1. Try accessing text (internal item)
            const text = e.clipboardData?.getData('text');
            if (text) {
                try {
                    const parsed = JSON.parse(text);
                    if (parsed.storyflow_type === 'moodboard_item' && parsed.data) {
                        const item = parsed.data as MoodBoardItem;
                        onAddItem({
                            ...item,
                            id: crypto.randomUUID(),
                            position: {
                                x: item.position.x + 20,
                                y: item.position.y + 20
                            },
                            zIndex: (items?.length || 0) + 1
                        });
                        toast.success("Colado!", { position: 'bottom-center' });
                        e.preventDefault();
                        return;
                    }
                } catch (e) {
                    // Not valid JSON, ignore
                }
            }

            // 2. Try accessing images
            const clipboardItems = e.clipboardData?.items;
            if (!clipboardItems) return;

            for (const item of clipboardItems) {
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    if (blob) {
                        handlePasteImageBlob(blob);
                        e.preventDefault();
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [handlePasteImageBlob]);

    // Improved Wheel Handler for Zoom and Pan
    useEffect(() => {
        const container = document.getElementById('moodboard-container');
        if (!container) return;

        const handleWheelEvent = (e: WheelEvent) => {
            e.preventDefault();

            if (e.ctrlKey || e.metaKey) {
                // Zoom Logic
                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Calculate world coordinates before zoom
                const worldX = (mouseX - pan.x) / zoom;
                const worldY = (mouseY - pan.y) / zoom;

                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                const newZoom = Math.min(Math.max(zoom * delta, 0.1), 5);

                // Calculate new pan to keep world coordinates under mouse
                const newPanX = mouseX - worldX * newZoom;
                const newPanY = mouseY - worldY * newZoom;

                setZoom(newZoom);
                setPan({ x: newPanX, y: newPanY });

            } else {
                // Pan Logic
                // Support Shift+Wheel for horizontal scrolling
                // Standard mouse: deltaX is 0, shift key swaps it in some browsers/OS, but we enforce it here manually if needed
                let dx = e.deltaX;
                let dy = e.deltaY;

                if (e.shiftKey && dx === 0) {
                    dx = dy;
                    dy = 0;
                }

                setPan(prev => ({
                    x: prev.x - dx,
                    y: prev.y - dy
                }));
            }
        };

        container.addEventListener('wheel', handleWheelEvent, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheelEvent);
        };
    }, [zoom, pan]);

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0 && !draggingId) {
            isPanningCanvas.current = true;
            panStartPos.current = { x: e.clientX, y: e.clientY };
            setSelectedId(null);
        }
    };

    const handleItemMouseDown = (e: React.MouseEvent, id: string, position: Position) => {
        e.stopPropagation();
        if (e.button === 0) {
            if (e.altKey) {
                const itemToDuplicate = items.find(i => i.id === id);
                if (itemToDuplicate) {
                    const newId = crypto.randomUUID();
                    const newItem = {
                        ...itemToDuplicate,
                        id: newId,
                        zIndex: (items.length || 0) + 1
                    };
                    onAddItem(newItem);
                    setDraggingId(newId);
                    setSelectedId(newId);
                    dragStartPos.current = { x: e.clientX, y: e.clientY };
                    itemStartPos.current = { ...position };
                }
            } else {
                setDraggingId(id);
                setSelectedId(id);
                dragStartPos.current = { x: e.clientX, y: e.clientY };
                itemStartPos.current = { ...position };
            }
        }
    };

    const handleResizeMouseDown = (e: React.MouseEvent, id: string, handle: string, item: MoodBoardItem) => {
        e.stopPropagation();
        e.preventDefault();
        setResizingId(id);
        resizeHandle.current = handle;
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        startSize.current = { width: item.width, height: item.height };
        itemStartPos.current = { ...item.position };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        // ... existing resize/drag logic ...
        if (draggingId) {
            const dx = (e.clientX - dragStartPos.current.x) / zoom;
            const dy = (e.clientY - dragStartPos.current.y) / zoom;

            onUpdateItem(draggingId, {
                position: {
                    x: itemStartPos.current.x + dx,
                    y: itemStartPos.current.y + dy
                }
            });
        } else if (resizingId) {
            // ... copy existing resizing logic ...
            const dx = (e.clientX - dragStartPos.current.x) / zoom;
            const dy = (e.clientY - dragStartPos.current.y) / zoom;
            const handle = resizeHandle.current;

            let newWidth = startSize.current.width;
            let newHeight = startSize.current.height;
            let newX = itemStartPos.current.x;
            let newY = itemStartPos.current.y;

            if (handle?.includes('e')) newWidth = Math.max(20, startSize.current.width + dx);
            if (handle?.includes('s')) newHeight = Math.max(20, startSize.current.height + dy);

            if (handle?.includes('w')) {
                const deltaX = Math.min(dx, startSize.current.width - 20);
                newWidth = startSize.current.width - deltaX;
                newX = itemStartPos.current.x + deltaX;
            }
            if (handle?.includes('n')) {
                const deltaY = Math.min(dy, startSize.current.height - 20);
                newHeight = startSize.current.height - deltaY;
                newY = itemStartPos.current.y + deltaY;
            }

            onUpdateItem(resizingId, {
                width: newWidth,
                height: newHeight,
                position: { x: newX, y: newY }
            });
        } else if (isPanningCanvas.current) {
            const dx = e.clientX - panStartPos.current.x;
            const dy = e.clientY - panStartPos.current.y;

            setPan(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));
            panStartPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
        setResizingId(null);
        resizeHandle.current = null;
        isPanningCanvas.current = false;
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger className="w-full h-full block">
                <div
                    id="moodboard-container"
                    className="w-full h-full bg-[#1a1a1a] overflow-hidden relative cursor-grab active:cursor-grabbing outline-none"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                        backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                        backgroundPosition: `${pan.x}px ${pan.y}px`
                    }}
                >
                    {/* Toolbar (Top Right) */}
                    <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 text-white/70 hover:text-white hover:bg-white/10", !canUndo && "opacity-30 cursor-not-allowed")}
                            onClick={() => canUndo && onUndo()}
                            disabled={!canUndo}
                            title="Desfazer (Ctrl+Z)"
                        >
                            <Undo2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 text-white/70 hover:text-white hover:bg-white/10", !canRedo && "opacity-30 cursor-not-allowed")}
                            onClick={() => canRedo && onRedo()}
                            disabled={!canRedo}
                            title="Refazer (Ctrl+Y)"
                        >
                            <Redo2 className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-5 bg-white/10" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                            onClick={() => setZoom(z => Math.min(z * 1.2, 5))}
                            title="Zoom In (Ctrl +)"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-white/50 min-w-[40px] text-center select-none">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                            onClick={() => setZoom(z => Math.max(z / 1.2, 0.1))}
                            title="Zoom Out (Ctrl -)"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-5 bg-white/10" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                            title="Resetar Zoom (Ctrl+0)"
                        >
                            <Maximize className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Info Box (Moved to Bottom Left) */}
                    <div className="absolute bottom-4 left-4 z-50 bg-black/50 backdrop-blur-md p-3 rounded-lg text-white/70 pointer-events-none select-none shadow-lg border border-white/5">
                        <h2 className="text-base font-semibold text-white mb-1">MoodBoard Infinito</h2>
                        <p className="text-[10px] leading-tight opacity-80">Botão Direito: Menu de Contexto</p>
                        <p className="text-[10px] leading-tight opacity-80">ALT+Drag: Duplicar item</p>
                        <p className="text-[10px] leading-tight opacity-80">Scroll para navegar (CTRL+Scroll para zoom)</p>
                    </div>

                    <div
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: '0 0',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        {items?.map(item => (
                            <ContextMenu key={item.id}>
                                <ContextMenuTrigger asChild>
                                    <div
                                        className={cn(
                                            "absolute group shadow-xl hover:shadow-2xl transition-shadow select-none outline-none",
                                            selectedId === item.id && "ring-2 ring-primary ring-offset-2 ring-offset-[#1a1a1a]"
                                        )}
                                        style={{
                                            left: item.position.x,
                                            top: item.position.y,
                                            width: item.width,
                                            height: item.height,
                                            zIndex: item.zIndex
                                        }}
                                        onMouseDown={(e) => handleItemMouseDown(e, item.id, item.position)}
                                    >
                                        <img
                                            src={item.content}
                                            alt="moodboard-item"
                                            className="w-full h-full object-contain pointer-events-none"
                                        />

                                        {/* Resize Handles */}
                                        <div
                                            className="absolute -top-1 -left-1 w-3 h-3 bg-indigo-500 rounded-full border border-white opacity-0 group-hover:opacity-100 cursor-nw-resize z-50 transition-opacity"
                                            onMouseDown={(e) => handleResizeMouseDown(e, item.id, 'nw', item)}
                                        />
                                        <div
                                            className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border border-white opacity-0 group-hover:opacity-100 cursor-ne-resize z-50 transition-opacity"
                                            onMouseDown={(e) => handleResizeMouseDown(e, item.id, 'ne', item)}
                                        />
                                        <div
                                            className="absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-500 rounded-full border border-white opacity-0 group-hover:opacity-100 cursor-sw-resize z-50 transition-opacity"
                                            onMouseDown={(e) => handleResizeMouseDown(e, item.id, 'sw', item)}
                                        />
                                        <div
                                            className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border border-white opacity-0 group-hover:opacity-100 cursor-se-resize z-50 transition-opacity"
                                            onMouseDown={(e) => handleResizeMouseDown(e, item.id, 'se', item)}
                                        />

                                        {/* Action Buttons (visible on hover) */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-[60]">
                                            <button
                                                className="p-1.5 hover:bg-white/10 rounded-full text-white/70 hover:text-indigo-400 transition-colors"
                                                title="Trazer para Frente"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const maxZ = Math.max(...items.map(i => i.zIndex || 0), 0);
                                                    onUpdateItem(item.id, { zIndex: maxZ + 1 });
                                                }}
                                            >
                                                <Move className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="w-px h-3 bg-white/20 mx-0.5" />
                                            <button
                                                className="p-1.5 hover:bg-red-500/20 rounded-full text-white/70 hover:text-red-500 transition-colors"
                                                title="Excluir"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteItem(item.id);
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-48 bg-[#1e1e1e] border-[#333] text-white">
                                    <ContextMenuItem onClick={() => handleCut(item)} className="hover:bg-[#333] focus:bg-[#333]">
                                        <Scissors className="w-4 h-4 mr-2" />
                                        Recortar
                                        <ContextMenuShortcut>⌘X</ContextMenuShortcut>
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => handleCopy(item)} className="hover:bg-[#333] focus:bg-[#333]">
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copiar
                                        <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                                    </ContextMenuItem>
                                    <ContextMenuSeparator className="bg-[#333]" />
                                    <ContextMenuItem
                                        onClick={() => {
                                            const maxZ = Math.max(...items.map(i => i.zIndex || 0), 0);
                                            onUpdateItem(item.id, { zIndex: maxZ + 1 });
                                        }}
                                        className="hover:bg-[#333] focus:bg-[#333]"
                                    >
                                        <BringToFront className="w-4 h-4 mr-2" />
                                        Trazer para Frente
                                    </ContextMenuItem>
                                    <ContextMenuSeparator className="bg-[#333]" />
                                    <ContextMenuItem onClick={() => onDeleteItem(item.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Excluir
                                        <ContextMenuShortcut>⌫</ContextMenuShortcut>
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        ))}
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 bg-[#1e1e1e] border-[#333] text-white">
                <ContextMenuItem onClick={handlePasteFromMenu} className="hover:bg-[#333] focus:bg-[#333]">
                    <ClipboardPaste className="w-4 h-4 mr-2" />
                    Colar
                    <ContextMenuShortcut>⌘V</ContextMenuShortcut>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
