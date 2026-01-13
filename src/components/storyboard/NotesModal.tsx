import React, { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface NotesModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

export function NotesModal({
  isOpen,
  title,
  content,
  onClose,
  onSave,
}: NotesModalProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={cn(
          'bg-card border border-border rounded-lg shadow-xl flex flex-col transition-all duration-200',
          isMaximized ? 'w-full h-full' : 'w-full max-w-md h-[50vh]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Notas: {title}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <Textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            placeholder="Adicione notas sobre esta cena..."
            className="w-full h-full resize-none text-sm"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
