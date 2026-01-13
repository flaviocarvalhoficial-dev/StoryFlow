import React, { useState } from 'react';
import { Project } from '@/types/storyboard';
import { Button } from '@/components/ui/button';
import { Plus, Search, FolderOpen, MoreVertical, Trash2, Edit2, Layout, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectLibraryViewProps {
    projects: Project[];
    onSelectProject: (id: string) => void;
    onCreateProject: (name: string) => void;
    onDeleteProject: (id: string) => void;
    onRenameProject: (id: string, name: string) => void;
}

export function ProjectLibraryView({
    projects,
    onSelectProject,
    onCreateProject,
    onDeleteProject,
    onRenameProject,
}: ProjectLibraryViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        if (newProjectName.trim()) {
            onCreateProject(newProjectName.trim());
            setNewProjectName('');
            setIsCreating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
            {/* Top Bar */}
            <div className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight">Meus Projetos</h1>
                    <div className="relative w-64 ml-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar projetos..."
                            className="pl-9 h-9 bg-background/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Button onClick={() => setIsCreating(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Projeto
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {/* Create New Card */}
                    {isCreating && (
                        <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary rounded-xl bg-primary/5 space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Layout className="w-6 h-6 text-primary" />
                            </div>
                            <Input
                                placeholder="Título do projeto..."
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                autoFocus
                                className="h-9 text-center"
                            />
                            <div className="flex gap-2 w-full">
                                <Button variant="ghost" className="flex-1 h-8 text-xs" onClick={() => setIsCreating(false)}>Cancelar</Button>
                                <Button className="flex-1 h-8 text-xs" onClick={handleCreate}>Criar</Button>
                            </div>
                        </div>
                    )}

                    {filteredProjects.map(project => {
                        const sequenceCount = project.sequences?.length || 0;
                        const sceneCount = project.sequences?.reduce((acc, seq) => acc + (seq.scenes?.length || 0), 0) || 0;

                        return (
                            <div
                                key={project.id}
                                className="group relative aspect-[4/3] bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col"
                                onClick={() => onSelectProject(project.id)}
                            >
                                {/* Visual Preview Area */}
                                <div className="flex-1 bg-muted/30 flex items-center justify-center relative">
                                    <div className="w-16 h-16 rounded-2xl bg-background/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <FolderOpen className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>

                                    {/* Overlay Actions */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* handle rename */ }}>
                                                    <Edit2 className="w-4 h-4 mr-2" /> Renomear
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Info Area */}
                                <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
                                    <h3 className="font-bold text-sm truncate mb-1">{project.name}</h3>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold">
                                            <Layers className="w-3 h-3" />
                                            {sequenceCount} {sequenceCount === 1 ? 'Sequência' : 'Sequências'}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-border" />
                                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold">
                                            <Layout className="w-3 h-3" />
                                            {sceneCount} {sceneCount === 1 ? 'Cena' : 'Cenas'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredProjects.length === 0 && !isCreating && (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <FolderOpen className="w-10 h-10" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">Nenhum projeto encontrado</p>
                            <p className="text-sm">Que tal começar um novo fluxo de história agora?</p>
                        </div>
                        <Button onClick={() => setIsCreating(true)} variant="outline" className="mt-4">
                            Criar Meu Primeiro Projeto
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
