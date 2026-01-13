import React, { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface StoryContextModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

export function StoryContextModal({
  isOpen,
  title,
  content,
  onClose,
  onSave,
}: StoryContextModalProps) {
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
          isMaximized ? 'w-full h-full' : 'w-full max-w-2xl h-[70vh]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Contexto: {title}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <Textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            placeholder="Descreva o contexto da história para esta sequência...

Exemplo:
- Cena noturna em uma cidade futurista
- Personagem principal caminha sozinho pela rua
- Clima: melancólico, reflexivo
- Elementos visuais: neon, chuva, reflexos"
            className="w-full h-full resize-none text-sm"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
