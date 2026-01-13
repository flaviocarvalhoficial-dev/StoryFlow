import React, { useState } from 'react';
import { Project, ProjectStatus, ChecklistStep } from '@/types/storyboard';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Search,
    MoreVertical,
    Trash2,
    ExternalLink,
    Calendar,
    Tag,
    ChevronRight,
    Circle,
    CheckCircle2,
    Clock,
    AlertCircle,
    Archive,
    FileText,
    ListTodo,
    X,
    GripVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProjectLibraryViewProps {
    projects: Project[];
    onSelectProject: (id: string) => void;
    onCreateProject: (name: string, initialData?: Partial<Project>) => void;
    onDeleteProject: (id: string) => void;
    onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

function LightbulbIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
        </svg>
    )
}

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ElementType; color: string }> = {
    'Ideia': { label: 'Ideia', icon: LightbulbIcon, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    'Planejamento': { label: 'Planejamento', icon: Calendar, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    'Em progresso': { label: 'Em progresso', icon: Clock, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    'Finalizado': { label: 'Finalizado', icon: CheckCircle2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    'Arquivado': { label: 'Arquivado', icon: Archive, color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
};

export function ProjectLibraryView({
    projects,
    onSelectProject,
    onCreateProject,
    onDeleteProject,
    onUpdateProject,
}: ProjectLibraryViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newProjectData, setNewProjectData] = useState({
        name: '',
        description: '',
        checklist: [] as { id: string; label: string; completed: boolean }[]
    });

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddStep = () => {
        setNewProjectData(prev => ({
            ...prev,
            checklist: [...prev.checklist, { id: Math.random().toString(36).substr(2, 9), label: '', completed: false }]
        }));
    };

    const handleUpdateStepLabel = (id: string, label: string) => {
        setNewProjectData(prev => ({
            ...prev,
            checklist: prev.checklist.map(s => s.id === id ? { ...s, label } : s)
        }));
    };

    const handleRemoveStep = (id: string) => {
        setNewProjectData(prev => ({
            ...prev,
            checklist: prev.checklist.filter(s => s.id !== id)
        }));
    };

    const handleSubmitCreate = () => {
        if (!newProjectData.name) return;
        onCreateProject(newProjectData.name, {
            description: newProjectData.description,
            checklist: newProjectData.checklist
        });
        setNewProjectData({ name: '', description: '', checklist: [] });
        setIsCreateDialogOpen(false);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-6 px-10 pt-12 pb-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
                        <p className="text-muted-foreground">Gerencie seus storyboards e fluxos criativos.</p>
                    </div>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="gap-2 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                <Plus className="w-5 h-5" />
                                Novo Projeto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Criar Novo Projeto</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do Projeto</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Curta Metragem Sci-Fi"
                                        value={newProjectData.name}
                                        onChange={(e) => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc">Descrição</Label>
                                    <Input
                                        id="desc"
                                        placeholder="Uma breve descrição do seu projeto..."
                                        value={newProjectData.description}
                                        onChange={(e) => setNewProjectData(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2">
                                            <ListTodo className="w-4 h-4 text-primary" />
                                            Checklist de Etapas
                                        </Label>
                                        <Button variant="outline" size="sm" onClick={handleAddStep} className="h-8 gap-1.5 border-primary/20 hover:bg-primary/5 text-primary">
                                            <Plus className="w-3.5 h-3.5" />
                                            Nova Etapa
                                        </Button>
                                    </div>

                                    <ScrollArea className="max-h-[200px] pr-4">
                                        <div className="space-y-2">
                                            {newProjectData.checklist.map((step) => (
                                                <div key={step.id} className="flex items-center gap-2 group animate-in slide-in-from-top-1 duration-200">
                                                    <div className="w-5 h-5 border border-muted rounded flex items-center justify-center bg-muted/50">
                                                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                                    </div>
                                                    <Input
                                                        placeholder="Nome da etapa..."
                                                        className="h-9 flex-1 bg-muted/20 border-transparent focus:bg-background transition-all"
                                                        value={step.label}
                                                        onChange={(e) => handleUpdateStepLabel(step.id, e.target.value)}
                                                        autoFocus={step.label === ''}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemoveStep(step.id)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {newProjectData.checklist.length === 0 && (
                                                <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
                                                    <p className="text-xs text-muted-foreground">Nenhuma etapa definida.</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                            <DialogFooter className="pt-6">
                                <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSubmitCreate} disabled={!newProjectData.name}>Criar Projeto</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center gap-4 max-w-md">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar por nome ou tags..."
                            className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-x-auto px-10">
                <div className="min-w-[1200px] pb-20">
                    <Table>
                        <TableHeader className="hover:bg-transparent">
                            <TableRow className="border-b border-border/50 hover:bg-transparent">
                                <TableHead className="w-[280px] font-medium text-xs uppercase tracking-wider text-muted-foreground py-4">Nome</TableHead>
                                <TableHead className="w-[220px] font-medium text-xs uppercase tracking-wider text-muted-foreground py-4">Descrição</TableHead>
                                <TableHead className="w-[160px] font-medium text-xs uppercase tracking-wider text-muted-foreground py-4">Status</TableHead>
                                <TableHead className="w-[240px] font-medium text-xs uppercase tracking-wider text-muted-foreground py-4">Processo (Checklist)</TableHead>
                                <TableHead className="w-[180px] font-medium text-xs uppercase tracking-wider text-muted-foreground py-4">Tags</TableHead>
                                <TableHead className="w-[150px] font-medium text-xs uppercase tracking-wider text-muted-foreground py-4">Última Modificação</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProjects.map((project) => (
                                <TableRow
                                    key={project.id}
                                    className="group border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                                    onClick={() => onSelectProject(project.id)}
                                >
                                    {/* Nome */}
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-primary" />
                                            </div>
                                            <input
                                                className="bg-transparent border-none focus:outline-none focus:ring-0 font-medium text-sm w-full truncate cursor-pointer focus:cursor-text"
                                                value={project.name}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => onUpdateProject(project.id, { name: e.target.value })}
                                            />
                                        </div>
                                    </TableCell>

                                    {/* Descrição */}
                                    <TableCell className="py-4">
                                        <input
                                            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-muted-foreground w-full truncate cursor-pointer focus:cursor-text"
                                            value={project.description || ''}
                                            placeholder="Sem descrição..."
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => onUpdateProject(project.id, { description: e.target.value })}
                                        />
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                        <Select
                                            value={project.status}
                                            onValueChange={(value: ProjectStatus) => onUpdateProject(project.id, { status: value })}
                                        >
                                            <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted shadow-none px-2 focus:ring-0">
                                                <SelectValue>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn("font-medium text-[10px] py-0 px-2 flex items-center gap-1.5", statusConfig[project.status].color)}
                                                    >
                                                        {React.createElement(statusConfig[project.status].icon, { className: "w-3 h-3" })}
                                                        {statusConfig[project.status].label}
                                                    </Badge>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(statusConfig).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <config.icon className="w-4 h-4" />
                                                            {config.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    {/* Checklist & Progresso */}
                                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between gap-3 pr-6">
                                                <div className="flex-1">
                                                    <Progress value={project.progress} className="h-2" />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground min-w-[30px] text-right">{project.progress}%</span>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group/edit-steps cursor-pointer">
                                                        <ListTodo className="w-3.5 h-3.5" />
                                                        <span>{project.checklist?.filter(s => s.completed).length || 0}/{project.checklist?.length || 0} etapas</span>
                                                        <ChevronRight className="w-3 h-3 opacity-0 group-hover/edit-steps:opacity-100 transition-all group-hover/edit-steps:translate-x-0.5" />
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-64 p-3 bg-card border-border shadow-xl" align="start">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Etapas do Projeto</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-primary hover:bg-primary/10"
                                                                onClick={() => {
                                                                    const label = prompt('Nome da nova etapa:');
                                                                    if (label) {
                                                                        const newStep = { id: Math.random().toString(36).substr(2, 9), label, completed: false };
                                                                        onUpdateProject(project.id, { checklist: [...(project.checklist || []), newStep] });
                                                                    }
                                                                }}
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                        <ScrollArea className="max-h-[250px]">
                                                            <div className="space-y-2 pb-2">
                                                                {project.checklist?.map((step) => (
                                                                    <div key={step.id} className="flex items-center gap-2 group/step">
                                                                        <Checkbox
                                                                            checked={step.completed}
                                                                            onCheckedChange={(checked) => {
                                                                                const updatedChecklist = project.checklist.map(s =>
                                                                                    s.id === step.id ? { ...s, completed: !!checked } : s
                                                                                );
                                                                                onUpdateProject(project.id, { checklist: updatedChecklist });
                                                                            }}
                                                                        />
                                                                        <input
                                                                            className={cn(
                                                                                "bg-transparent border-none focus:outline-none focus:ring-0 text-xs flex-1 truncate",
                                                                                step.completed && "text-muted-foreground line-through opacity-50"
                                                                            )}
                                                                            value={step.label}
                                                                            onChange={(e) => {
                                                                                const updatedChecklist = project.checklist.map(s =>
                                                                                    s.id === step.id ? { ...s, label: e.target.value } : s
                                                                                );
                                                                                onUpdateProject(project.id, { checklist: updatedChecklist });
                                                                            }}
                                                                        />
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-5 w-5 opacity-0 group-hover/step:opacity-100 hover:text-destructive"
                                                                            onClick={() => {
                                                                                const updatedChecklist = project.checklist.filter(s => s.id !== step.id);
                                                                                onUpdateProject(project.id, { checklist: updatedChecklist });
                                                                            }}
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                                {(!project.checklist || project.checklist.length === 0) && (
                                                                    <p className="text-[10px] text-muted-foreground italic text-center py-4">Sem etapas definidas.</p>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>

                                    {/* Tags */}
                                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                                            {(project.tags || []).map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="bg-muted/50 text-[10px] px-2 py-0 font-normal">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 rounded-md hover:bg-muted"
                                                onClick={() => {
                                                    const tag = prompt('Adicionar tag:');
                                                    if (tag) {
                                                        const currentTags = project.tags || [];
                                                        if (!currentTags.includes(tag)) {
                                                            onUpdateProject(project.id, { tags: [...currentTags, tag] });
                                                        }
                                                    }
                                                }}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </TableCell>

                                    {/* Última Modificação */}
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(project.updatedAt)}
                                        </div>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onSelectProject(project.id)}>
                                                    <ExternalLink className="w-4 h-4 mr-2" /> Abrir no Canvas
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => onDeleteProject(project.id)}>
                                                    <Trash2 className="w-4 h-4 mr-2" /> Excluir Projeto
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredProjects.length === 0 && (
                        <div className="h-[40vh] flex flex-col items-center justify-center text-center opacity-40 py-12">
                            <Search className="w-12 h-12 mb-4" />
                            <h3 className="text-lg font-medium">Nenhum projeto encontrado</h3>
                            <p className="text-sm">Tente uma busca diferente ou crie um novo projeto.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
