import React from 'react';
import { PromptStyle } from '@/types/storyboard';
import { PromptCard } from './PromptCard';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PromptLibraryViewProps {
    category: string;
    prompts: PromptStyle[];
    onAddPrompt: () => void;
    onEditPrompt: (prompt: PromptStyle) => void;
    onUpdatePrompt: (id: string, updates: Partial<PromptStyle>) => void;
    onDeletePrompt: (id: string) => void;
}

export function PromptLibraryView({
    category,
    prompts,
    onAddPrompt,
    onEditPrompt,
    onUpdatePrompt,
    onDeletePrompt,
}: PromptLibraryViewProps) {
    const filteredPrompts = category === 'Tudo'
        ? prompts
        : prompts.filter(p => p.category === category);

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
            {/* Top Bar */}
            <div className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight">
                        Prompts: <span className="text-muted-foreground font-medium">{category}</span>
                    </h1>
                    <div className="relative w-64 ml-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar prompts..."
                            className="pl-9 h-9 bg-background/50"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filtrar
                    </Button>
                    <Button onClick={onAddPrompt} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Prompt
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {filteredPrompts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Plus className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-lg font-medium">Nenhum prompt encontrado</p>
                            <p className="text-sm">Comece adicionando um novo estilo para sua biblioteca.</p>
                        </div>
                        <Button onClick={onAddPrompt} variant="outline">
                            Criar Primeiro Prompt
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredPrompts.map(prompt => (
                            <div key={prompt.id} className="aspect-[4/5] transform transition-all hover:scale-[1.02]">
                                <PromptCard
                                    prompt={prompt}
                                    onEdit={() => onEditPrompt(prompt)}
                                    onUpdate={(updates) => onUpdatePrompt(prompt.id, updates)}
                                    onDelete={() => onDeletePrompt(prompt.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
