import React, { useState, useRef } from 'react';
import { X, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Position } from '@/types/storyboard';

interface FloatingWindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  defaultPosition?: Position;
}

export function FloatingWindow({
  title,
  isOpen,
  onClose,
  children,
  defaultPosition = { x: 100, y: 100 },
}: FloatingWindowProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        'fixed z-40 bg-card border border-border rounded-lg shadow-xl flex flex-col',
        isMaximized ? 'inset-4' : 'w-80 h-96'
      )}
      style={isMaximized ? {} : { left: position.x, top: position.y }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-border cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-auto">
        {children}
      </div>
    </div>
  );
}
