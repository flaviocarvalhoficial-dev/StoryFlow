import React, { useState } from 'react';
import { PromptStyle } from '@/types/storyboard';
import { PromptCard } from './PromptCard';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, FolderOpen, ArrowLeft, MoreVertical, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface PromptLibraryViewProps {
    category: string;
    categories?: string[];
    onSelectCategory?: (category: string) => void;
    prompts: PromptStyle[];
    onAddPrompt: () => void;
    onEditPrompt: (prompt: PromptStyle) => void;
    onUpdatePrompt: (id: string, updates: Partial<PromptStyle>) => void;
    onDeletePrompt: (id: string) => void;
    onUpdatePromptCategory?: (oldCategory: string, newCategory: string) => Promise<void>;
    onDeletePromptCategory?: (category: string) => Promise<void>;
}

export function PromptLibraryView({
    category,
    categories = [],
    onSelectCategory,
    prompts,
    onAddPrompt,
    onEditPrompt,
    onUpdatePrompt,
    onDeletePrompt,
}: PromptLibraryViewProps) {
    const isOverview = category === 'Tudo';
    const [renameCategoryOpen, setRenameCategoryOpen] = useState(false);
    const [categoryToRename, setCategoryToRename] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    const handleRenameClick = (cat: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCategoryToRename(cat);
        setNewName(cat);
        setRenameCategoryOpen(true);
    };

    const handleRenameSubmit = async () => {
        if (categoryToRename && newName && newName !== categoryToRename) {
            await onUpdatePromptCategory?.(categoryToRename, newName);
            setRenameCategoryOpen(false);
            setCategoryToRename(null);
        }
    };

    const handleDeleteClick = (cat: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Tem certeza que deseja excluir a categoria "${cat}" e todos os seus prompts?`)) {
            onDeletePromptCategory?.(cat);
        }
    };

    // Filter prompts based on category
    const filteredPrompts = isOverview
        ? prompts // Just in case, though we render categories instead
        : prompts.filter(p => p.category === category || (category === 'Sem Categoria' && !p.category));

    if (isOverview) {
        return (
            <div className="flex-1 flex flex-col bg-background overflow-hidden">
                <div className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm">
                    <h1 className="text-xl font-bold tracking-tight">Biblioteca de Prompts</h1>
                    <Button onClick={onAddPrompt} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Prompt
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* Defined Categories */}
                        {categories.map(cat => {
                            const count = prompts.filter(p => p.category === cat).length;
                            return (
                                <div
                                    key={cat}
                                    onClick={() => onSelectCategory?.(cat)}
                                    onDoubleClick={(e) => handleRenameClick(cat, e)}
                                    className="group aspect-[3/2] bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all hover:scale-[1.02] relative"
                                >
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => handleRenameClick(cat, e)}>
                                                    <Pencil className="w-4 h-4 mr-2" />
                                                    Renomear
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert('Funcionalidade de capa em desenvolvimento'); }}>
                                                    <ImageIcon className="w-4 h-4 mr-2" />
                                                    Imagem de Capa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleDeleteClick(cat, e)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <FolderOpen className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-semibold text-lg">{cat}</h3>
                                        <p className="text-sm text-muted-foreground">{count} prompts</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Uncategorized Card */}
                        <div
                            onClick={() => onSelectCategory?.('Sem Categoria')}
                            className="group aspect-[3/2] bg-card border border-border border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all hover:scale-[1.02]"
                        >
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                                <FolderOpen className="w-6 h-6 text-muted-foreground opacity-50" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-semibold text-lg text-muted-foreground">Sem Categoria</h3>
                                <p className="text-sm text-muted-foreground/70">{prompts.filter(p => !p.category).length} prompts</p>
                            </div>
                        </div>

                        {/* New Category Button (Optional) */}
                        <div
                            className="aspect-[3/2] border border-border border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer opacity-50 hover:opacity-100 hover:border-primary/50 hover:bg-muted/30 transition-all"
                        // Note: We'd need a handler for adding category here, but for now just visual or sidebar handles it
                        >
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm">Nova Categoria</span>
                        </div>
                    </div>
                </div>
                <Dialog open={renameCategoryOpen} onOpenChange={setRenameCategoryOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Renomear Categoria</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nome
                                </Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="col-span-3"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRenameSubmit();
                                    }}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRenameCategoryOpen(false)}>Cancelar</Button>
                            <Button onClick={handleRenameSubmit}>Salvar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
            {/* Top Bar with Back functionality */}
            <div className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelectCategory?.('Tudo')}
                        title="Voltar para categorias"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <h1 className="text-xl font-bold tracking-tight">
                        <span className="text-muted-foreground/50 font-medium">Categoria:</span> {category}
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
                            <p className="text-sm">Comece adicionando um novo estilo para esta categoria.</p>
                        </div>
                        <Button onClick={onAddPrompt} variant="outline">
                            Criar Primeiro Prompt
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredPrompts.map(prompt => (
                            <div key={prompt.id} className="aspect-[4/5] transform transition-all hover:scale-[1.02] relative group">
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
