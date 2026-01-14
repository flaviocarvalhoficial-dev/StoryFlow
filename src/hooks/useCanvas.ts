import { useState, useCallback, useRef, useEffect } from 'react';
import { Position, CanvasState } from '@/types/storyboard';

export function useCanvas() {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    selectedId: null,
    selectedType: null,
  });

  const isPanning = useRef(false);
  const isSpacePressed = useRef(false);
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        isSpacePressed.current = true;
        // Optional: Change cursor style here via a callback or state if needed, 
        // but Canvas.tsx handles cursor logic based on active state usually.
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressed.current = false;
        if (isPanning.current) {
          isPanning.current = false;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.altKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setCanvasState(prev => ({
        ...prev,
        zoom: Math.min(Math.max(prev.zoom * delta, 0.25), 3),
      }));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle click OR (Left click AND (Shift OR Space))
    if (e.button === 1 || (e.button === 0 && (e.shiftKey || isSpacePressed.current))) {
      isPanning.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setCanvasState(prev => ({
        ...prev,
        panOffset: {
          x: prev.panOffset.x + dx,
          y: prev.panOffset.y + dy,
        },
      }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const select = useCallback((id: string | null, type: 'sequence' | 'scene' | null) => {
    setCanvasState(prev => ({
      ...prev,
      selectedId: id,
      selectedType: type,
    }));
  }, []);

  const resetView = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      zoom: 1,
      panOffset: { x: 0, y: 0 },
    }));
  }, []);

  return {
    canvasState,
    setCanvasState,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    select,
    resetView,
  };
}
