import React, { useState } from 'react';
import {
    Palette,
    ChevronRight,
    Trash2,
    Plus,
    ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';
import { Project, PromptStyle } from '@/types/storyboard';

interface PromptLibraryProps {
    isCollapsed: boolean;
    currentView: string;
    onViewChange: (view: 'canvas' | 'prompts' | 'projects' | 'moodboard') => void;
    activeCategory: string;
    onSelectCategory: (category: string) => void;
    currentProject: Project;
    promptCategories: string[];
    onDeletePrompt: (id: string) => void;
    onDeletePromptCategory: (category: string) => void;
    onUpdatePromptCategory?: (oldCategory: string, newCategory: string) => Promise<void>;
    onAddPromptCategory: (category: string) => void;
    onOpenAssets: () => void;
    fontStyles: { label: string; sub: string; icon: string };
}

export function PromptLibrary({
    isCollapsed,
    currentView,
    onViewChange,
    activeCategory,
    onSelectCategory,
    currentProject,
    promptCategories,
    onDeletePrompt,
    onDeletePromptCategory,
    onUpdatePromptCategory,
    onAddPromptCategory,
    onOpenAssets,
    fontStyles: fs
}: PromptLibraryProps) {
    const [promptsOpen, setPromptsOpen] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showCategoryInput, setShowCategoryInput] = useState(false);

    // Rename state
    const [renameCategoryOpen, setRenameCategoryOpen] = useState(false);
    const [categoryToRename, setCategoryToRename] = useState<string | null>(null);
    const [renameName, setRenameName] = useState('');

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            onAddPromptCategory(newCategoryName.trim());
            setNewCategoryName('');
            setShowCategoryInput(false);
        }
    };

    const handleRenameClick = (cat: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCategoryToRename(cat);
        setRenameName(cat);
        setRenameCategoryOpen(true);
    };

    const handleRenameSubmit = async () => {
        if (categoryToRename && renameName && renameName !== categoryToRename) {
            await onUpdatePromptCategory?.(categoryToRename, renameName);
            setRenameCategoryOpen(false);
            setCategoryToRename(null);
        }
    };

    if (isCollapsed) {
        return (
            <div className="flex flex-col items-center gap-1 py-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10",
                        currentView === 'prompts' ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted/50"
                    )}
                    onClick={() => onViewChange('prompts')}
                    title="Prompts"
                >
                    <Palette className={cn("w-5 h-5", currentView === 'prompts' ? "text-primary" : "text-foreground/70")} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10",
                        currentView === 'moodboard' ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted/50"
                    )}
                    onClick={onOpenAssets}
                    title="MoodBoard"
                >
                    <ImageIcon className={cn("w-5 h-5", currentView === 'moodboard' ? "text-primary" : "text-foreground/70")} />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <Collapsible open={promptsOpen} onOpenChange={setPromptsOpen}>
                <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-between text-left h-10 py-1.5 px-3 transition-all",
                                currentView === 'prompts' && activeCategory === 'Tudo' ? "bg-primary/10 text-primary hover:bg-primary/20 shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                fs.label
                            )}
                            onClick={() => {
                                onViewChange('prompts');
                                onSelectCategory('Tudo');
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Palette className={cn(fs.icon, "mr-3", currentView === 'prompts' && "text-primary")} />
                                <span className="font-medium tracking-tight">Prompts</span>
                            </div>
                            <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-200 opacity-40", promptsOpen && "rotate-90")} />
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-0.5 pl-1 mt-1">
                    {/* Uncategorized Prompts */}
                    {currentProject.prompts?.filter(p => !p.category).map(prompt => (
                        <div key={prompt.id} className="group/prompt flex items-center gap-1 pr-2 relative pl-2">
                            <div className="absolute left-0 top-1/2 w-2 h-px bg-border/40" />
                            <div className={cn("flex-1 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer truncate text-left", fs.sub)}>
                                {prompt.name}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePrompt(prompt.id);
                                }}
                                className="opacity-0 group-hover/prompt:opacity-100 transition-opacity p-1 hover:text-destructive"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    {/* Defined Categories */}
                    {promptCategories.map(cat => (
                        <Collapsible key={cat}>
                            <div className="group/cat flex items-center gap-1 pr-2 relative mt-1 pl-2">
                                <div className="absolute left-0 top-1/2 w-2 h-px bg-border/40" />
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "flex-1 justify-start h-8 group px-2",
                                            currentView === 'prompts' && activeCategory === cat ? "bg-primary/5 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                            fs.sub
                                        )}
                                        onClick={() => {
                                            onViewChange('prompts');
                                            onSelectCategory(cat);
                                        }}
                                        onDoubleClick={(e) => handleRenameClick(cat, e)}
                                    >
                                        <ChevronRight className={cn(
                                            "w-3 h-3 mr-1 transition-transform duration-200 opacity-40 group-data-[state=open]:rotate-90 group-hover/cat:opacity-100",
                                        )} />
                                        <span className="font-semibold">{cat}</span>
                                    </Button>
                                </CollapsibleTrigger>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeletePromptCategory(cat);
                                    }}
                                    className="opacity-0 group-hover/cat:opacity-100 transition-opacity p-1 hover:text-destructive"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                            <CollapsibleContent className="pl-6 space-y-0.5 border-l ml-3.5 border-border/40 mt-0.5">
                                {currentProject.prompts?.filter(p => p.category === cat).map(prompt => (
                                    <div key={prompt.id} className="group/prompt flex items-center gap-1 pr-2 relative">
                                        <div className="absolute -left-[11px] top-1/2 w-2 h-px bg-border/40" />
                                        <div className={cn("flex-1 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/30 cursor-pointer truncate text-left", fs.sub)}>
                                            {prompt.name}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeletePrompt(prompt.id);
                                            }}
                                            className="opacity-0 group-hover/prompt:opacity-100 transition-opacity p-1 hover:text-destructive"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {currentProject.prompts?.filter(p => p.category === cat).length === 0 && (
                                    <div className={cn("text-muted-foreground/30 px-4 py-1 italic", fs.sub)}>Vazio</div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}

                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn("w-full justify-start h-8 px-2 mt-2 text-muted-foreground hover:text-primary relative font-normal pl-4", fs.sub)}
                        onClick={() => setShowCategoryInput(true)}
                    >
                        <div className="absolute left-1 top-1/2 w-2 h-px bg-border/40" />
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Nova Categoria
                    </Button>

                    {showCategoryInput && (
                        <div className="px-2 mt-1 relative pl-4">
                            <div className="absolute left-1 top-1/2 w-2 h-px bg-border/40" />
                            <Input
                                placeholder="Nome..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                onBlur={() => !newCategoryName && setShowCategoryInput(false)}
                                className={cn("h-7 bg-background/50", fs.sub)}
                                autoFocus
                            />
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>

            <Button
                variant="ghost"
                className={cn(
                    "w-full justify-start text-left h-10 py-1.5 px-3",
                    currentView === 'moodboard' ? "bg-primary/10 text-primary hover:bg-primary/20 shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    fs.label
                )}
                onClick={onOpenAssets}
                title="MoodBoard"
            >
                <ImageIcon className={cn(fs.icon, "mr-3", currentView === 'moodboard' && "text-primary")} />
                <span className="font-medium tracking-tight">MoodBoard</span>
            </Button>

            {/* Rename Category Dialog */}
            <Dialog open={renameCategoryOpen} onOpenChange={setRenameCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renomear Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rename-name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="rename-name"
                                value={renameName}
                                onChange={(e) => setRenameName(e.target.value)}
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
