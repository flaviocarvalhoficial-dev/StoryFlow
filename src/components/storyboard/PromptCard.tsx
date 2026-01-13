import React, { useState, useRef } from 'react';
import { Copy, Check, Trash2, Edit2, Upload, ImageIcon } from 'lucide-react';
import { PromptStyle } from '@/types/storyboard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromptCardProps {
  prompt: PromptStyle;
  onEdit: () => void;
  onUpdate: (updates: Partial<PromptStyle>) => void;
  onDelete: () => void;
}

export function PromptCard({ prompt, onEdit, onUpdate, onDelete }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdate({ imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={cn(
        "prompt-card group relative h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden transition-all duration-300",
        isDragging && "ring-2 ring-primary ring-inset border-primary"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
      />

      {/* Image preview */}
      <div className="flex-1 w-full bg-muted/50 overflow-hidden relative group/img">
        {prompt.imageUrl ? (
          <img
            src={prompt.imageUrl}
            alt={prompt.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-background/50 flex items-center justify-center mb-2">
              <ImageIcon className="w-6 h-6 opacity-20" />
            </div>
            <p className="text-[10px] font-medium uppercase tracking-wider opacity-40">Sem Imagem</p>
            <p className="text-[9px] mt-1 opacity-30">Arraste ou clique para enviar</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-[10px] gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleUploadClick}
            >
              <Upload className="w-3 h-3" />
              Upload
            </Button>
          </div>
        )}

        {/* Shadow Overlay on top image when image exists */}
        {prompt.imageUrl && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-[10px] gap-1.5"
              onClick={handleUploadClick}
            >
              <Upload className="w-3 h-3" />
              Trocar Imagem
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-card border-t border-border mt-auto">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold truncate pr-2">{prompt.name}</p>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium truncate max-w-[80px]">
            {prompt.category || 'Geral'}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
          {prompt.prompt}
        </p>
      </div>

      {/* Hover actions */}
      <div className={cn(
        'absolute top-2 right-2 flex flex-col gap-1.5 transition-all duration-300 transform',
        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
      )}>
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 shadow-lg backdrop-blur-md bg-background/80 hover:bg-background"
          onClick={handleCopy}
          title="Copiar Prompt"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 shadow-lg backdrop-blur-md bg-background/80 hover:bg-background"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          title="Editar Detalhes"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 shadow-lg backdrop-blur-md bg-background/80 hover:bg-background text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Excluir"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none transition-all">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 animate-bounce">
            <Upload className="w-4 h-4" />
            Solte para enviar
          </div>
        </div>
      )}
    </div>
  );
}
