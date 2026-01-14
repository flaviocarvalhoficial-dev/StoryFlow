import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoodBoardItem, Position } from '@/types/storyboard';
import { cn } from '@/lib/utils';
import { X, ZoomIn, ZoomOut, Move, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoodBoardViewProps {
    items: MoodBoardItem[];
    onAddItem: (item: MoodBoardItem) => void;
    onUpdateItem: (id: string, updates: Partial<MoodBoardItem>) => void;
    onDeleteItem: (id: string) => void;
}

export function MoodBoardView({ items, onAddItem, onUpdateItem, onDeleteItem }: MoodBoardViewProps) {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);
    const resizeHandle = useRef<string | null>(null);
    const startSize = useRef({ width: 0, height: 0 });
    const dragStartPos = useRef<Position>({ x: 0, y: 0 });
    const itemStartPos = useRef<Position>({ x: 0, y: 0 });

    const isPanningCanvas = useRef(false);
    const panStartPos = useRef<Position>({ x: 0, y: 0 });

    // Handle image pasting
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const clipboardItems = e.clipboardData?.items;
            if (!clipboardItems) return;

            for (const item of clipboardItems) {
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            const img = new Image();
                            img.src = base64;
                            img.onload = () => {
                                // Determine insertion point (center of view)
                                // View center in screen coords: width/2, height/2
                                // Convert to canvas coords: (screen - pan) / zoom
                                const container = document.getElementById('moodboard-container');
                                const rect = container?.getBoundingClientRect() || { width: 800, height: 600 };

                                const centerX = (rect.width / 2 - pan.x) / zoom;
                                const centerY = (rect.height / 2 - pan.y) / zoom;

                                let width = img.width;
                                let height = img.height;
                                const maxSize = 500;

                                // Scale down if too big
                                if (width > maxSize || height > maxSize) {
                                    const ratio = Math.min(maxSize / width, maxSize / height);
                                    width *= ratio;
                                    height *= ratio;
                                }

                                onAddItem({
                                    id: Math.random().toString(36).substr(2, 9),
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
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [onAddItem, pan, zoom, items]);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.min(Math.max(zoom * delta, 0.1), 5);

            // Zoom towards cursor would be better, but center zoom is easier for now
            // Or just simple zoom
            setZoom(newZoom);
        } else {
            // Pan
            setPan(prev => ({
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0 && !draggingId) {
            // Only pan if not dragging an item
            // Actually, let's use spacebar or middle click for panning if we want drag-select, 
            // but for now, clicking on empty space pans.
            isPanningCanvas.current = true;
            panStartPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleItemMouseDown = (e: React.MouseEvent, id: string, position: Position) => {
        e.stopPropagation();
        if (e.button === 0) {
            setDraggingId(id);
            dragStartPos.current = { x: e.clientX, y: e.clientY };
            itemStartPos.current = { ...position };
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
        <div
            id="moodboard-container"
            className="w-full h-full bg-[#1a1a1a] overflow-hidden relative cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
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
            <div className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-md p-3 rounded-lg text-white/70 pointer-events-none select-none shadow-lg border border-white/5">
                <h2 className="text-base font-semibold text-white mb-1">MoodBoard Infinito</h2>
                <p className="text-[10px] leading-tight opacity-80">CTRL+V para colar imagens</p>
                <p className="text-[10px] leading-tight opacity-80">Arraste para mover imagens</p>
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
                    <div
                        key={item.id}
                        className="absolute group shadow-xl hover:shadow-2xl transition-shadow select-none"
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
                ))}
            </div>
        </div>
    );
}
