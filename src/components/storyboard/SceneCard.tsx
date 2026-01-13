import React, { useState } from 'react';
import { Trash2, StickyNote, ImageIcon, GripVertical } from 'lucide-react';
import { SceneModule, AspectRatio } from '@/types/storyboard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SceneCardProps {
  scene: SceneModule;
  aspectRatio: AspectRatio;
  onUpdate: (updates: Partial<SceneModule>) => void;
  onDelete: () => void;
  onOpenNotes: () => void;
  isSmall?: boolean;
}

const aspectRatioClasses: Record<AspectRatio, string> = {
  '3:4': 'aspect-[3/4]',
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
};

export function SceneCard({
  scene,
  aspectRatio,
  onUpdate,
  onDelete,
  onOpenNotes,
  isSmall = false,
}: SceneCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onUpdate({ imageUrl: result });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  return (
    <div
      className={cn(
        "group relative bg-secondary/50 border border-module-border rounded-md overflow-hidden no-drag shadow-sm transition-all hover:shadow-md",
        isSmall ? "w-[160px]" : "w-[220px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 p-2 border-b border-module-border/50 bg-background/80 backdrop-blur-sm absolute top-0 left-0 right-0 z-10 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
        <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
        {isEditing ? (
          <input
            type="text"
            value={scene.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="bg-transparent border-b border-foreground/20 focus:border-foreground/50 outline-none text-xs font-medium flex-1"
            autoFocus
          />
        ) : (
          <span
            className="text-xs font-medium cursor-text flex-1 truncate"
            onDoubleClick={() => setIsEditing(true)}
          >
            {scene.title}
          </span>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onOpenNotes}
          >
            <StickyNote className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Title overlay when not hovering (clean view) */}
      <div className="absolute top-2 left-2 z-0 opacity-100 group-hover:opacity-0 transition-opacity bg-black/40 text-white px-2 py-1 rounded text-[10px] pointer-events-none truncate max-w-[180px]">
        {scene.title}
      </div>

      <div
        className={cn(
          'relative bg-muted flex items-center justify-center w-full cursor-pointer transition-colors',
          aspectRatioClasses[aspectRatio],
          isDragging && "bg-primary/20 border-2 border-dashed border-primary"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {scene.imageUrl ? (
          <img
            src={scene.imageUrl}
            alt={scene.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <ImageIcon className="w-8 h-8" />
            <span className="text-[10px] font-medium">
              {isDragging ? "Solte a imagem" : "Upload imagem"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
