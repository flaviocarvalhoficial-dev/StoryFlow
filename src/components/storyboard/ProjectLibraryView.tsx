import React, { useState } from 'react';
import { Project, ProjectStatus, ChecklistStep } from '@/types/storyboard';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Search,
    MoreHorizontal,
    MoreVertical,
    Trash2,
    ExternalLink,
    Calendar as CalendarIcon,
    Tag,
    ChevronLeft,
    ChevronRight,
    Circle,
    CheckCircle2,
    Clock,
    AlertCircle,
    Archive,
    FileText,
    ListTodo,
    X,
    GripVertical,

    Edit,
    Image as ImageIcon,
    Upload
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from 'date-fns/locale';

const TAG_COLORS = [
    { name: 'Slate', value: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
    { name: 'Red', value: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
    { name: 'Orange', value: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
    { name: 'Amber', value: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    { name: 'Emerald', value: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { name: 'Blue', value: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    { name: 'Indigo', value: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
    { name: 'Purple', value: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
];

interface ProjectLibraryViewProps {
    projects: Project[];
    currentProjectId?: string;
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
    'Planejamento': { label: 'Planejamento', icon: CalendarIcon, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    'Em progresso': { label: 'Em progresso', icon: Clock, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    'Finalizado': { label: 'Finalizado', icon: CheckCircle2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    'Arquivado': { label: 'Arquivado', icon: Archive, color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
};

// Helper component for the Tag Cell to handle local state
function TagSelectorCell({
    projectTags,
    allProjects,
    onSelect
}: {
    projectTags: { id: string; label: string; color: string }[];
    allProjects: Project[];
    onSelect: (tag: { id: string; label: string; color: string }) => void;
}) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Create a list of unique existing tags across all projects
    const existingTags = React.useMemo(() => {
        const tags = new Map();
        allProjects.forEach(p => {
            p.tags?.forEach(t => {
                // Use label as key to deduplicate by name, but keep the object
                if (!tags.has(t.label.toLowerCase())) {
                    tags.set(t.label.toLowerCase(), t);
                }
            });
        });
        return Array.from(tags.values());
    }, [allProjects]);

    const handleCreateTag = (color: string) => {
        if (!inputValue.trim()) return;
        const newTag = {
            id: Math.random().toString(36).substr(2, 9),
            label: inputValue,
            color
        };
        onSelect(newTag);
        setOpen(false);
        setInputValue("");
    };

    const currentTag = projectTags?.[0];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "h-7 w-fit px-2 text-xs font-normal justify-start hover:bg-muted/50 transition-all",
                        !currentTag && "text-muted-foreground border border-dashed border-border"
                    )}
                >
                    {currentTag ? (
                        <div className="flex items-center gap-1.5">
                            <div className={cn("px-2 py-0.5 rounded-full flex items-center gap-1", currentTag.color)}>
                                <span className="truncate max-w-[100px]">{currentTag.label}</span>
                            </div>
                            {projectTags.length > 1 && (
                                <span className="text-[10px] text-muted-foreground font-medium">+{projectTags.length - 1}</span>
                            )}
                        </div>
                    ) : (
                        <span className="flex items-center gap-1.5"><Plus className="w-3 h-3" /> Adicionar Tag</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start" onClick={(e) => e.stopPropagation()}>
                <Command>
                    <CommandInput
                        placeholder="Procurar ou criar tag..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty className="pb-1">
                            {inputValue && (
                                <div className="p-2 space-y-2">
                                    <p className="text-xs text-muted-foreground px-2">Criar "{inputValue}" com cor:</p>
                                    <div className="grid grid-cols-4 gap-2 px-2 pb-2">
                                        {TAG_COLORS.map((color) => (
                                            <button
                                                key={color.name}
                                                className={cn(
                                                    "h-6 w-full rounded-sm border cursor-pointer hover:scale-105 transition-transform",
                                                    color.value
                                                )}
                                                onClick={() => handleCreateTag(color.value)}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {!inputValue && <p className="py-6 text-center text-sm text-muted-foreground">Digite para criar uma nova tag</p>}
                        </CommandEmpty>

                        {projectTags.length > 0 && (
                            <CommandGroup heading="Tags do Projeto">
                                {projectTags.map(tag => (
                                    <CommandItem
                                        key={tag.id}
                                        onSelect={() => {
                                            onSelect(tag);
                                            setOpen(false);
                                        }}
                                        className="cursor-pointer bg-muted/30"
                                    >
                                        <div className={cn("flex items-center gap-2 px-2 py-1 rounded text-xs", tag.color)}>
                                            {tag.label}
                                        </div>
                                        <CheckCircle2 className="w-3 h-3 ml-auto opacity-100 text-primary" />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        <CommandGroup heading="Outras Tags">
                            {existingTags.filter(t => !projectTags.some(pt => pt.id === t.id || pt.label.toLowerCase() === t.label.toLowerCase())).map(tag => (
                                <CommandItem
                                    key={tag.id}
                                    onSelect={() => {
                                        onSelect(tag);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <div className={cn("flex items-center gap-2 px-2 py-1 rounded text-xs", tag.color)}>
                                        {tag.label}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export function ProjectLibraryView({
    projects,
    currentProjectId,
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
        script: '',
        scriptMode: 'simple' as 'simple' | 'structured',
        structuredScript: [] as { id: string; content: string; isCompleted: boolean }[],
        tags: [] as { id: string; label: string; color: string }[],
        checklist: [] as { id: string; label: string; completed: boolean }[],
        deadline: undefined as Date | undefined
    });
    const [tagInput, setTagInput] = useState('');
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(tag => tag.label.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddTag = (label: string, color: string) => {
        if (!label) return;
        setNewProjectData(prev => ({
            ...prev,
            tags: [...prev.tags, { id: Math.random().toString(36).substr(2, 9), label, color }]
        }));
        setTagInput('');
        setIsTagPopoverOpen(false);
    };

    const handleUpdateTag = (id: string, updates: { label?: string, color?: string }) => {
        setNewProjectData(prev => ({
            ...prev,
            tags: prev.tags.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
    };

    const handleDeleteTag = (id: string) => {
        setNewProjectData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t.id !== id)
        }));
        if (editingTagId === id) setEditingTagId(null);
    };

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

    const handleEditProject = (project: Project) => {
        setEditingProjectId(project.id);
        setNewProjectData({
            name: project.name,
            description: project.description || '',
            script: project.script || '',
            scriptMode: project.scriptMode || 'simple',
            structuredScript: project.structuredScript || [],
            tags: project.tags || [],
            checklist: project.checklist || [],
            deadline: project.deadline ? new Date(project.deadline) : undefined
        });
        setIsCreateDialogOpen(true);
    };

    const handleSubmitCreate = () => {
        if (!newProjectData.name) return;

        if (editingProjectId) {
            onUpdateProject(editingProjectId, {
                name: newProjectData.name,
                description: newProjectData.description,
                script: newProjectData.script,
                scriptMode: newProjectData.scriptMode,
                structuredScript: newProjectData.structuredScript,
                tags: newProjectData.tags,
                checklist: newProjectData.checklist,
                deadline: newProjectData.deadline ? new Date(newProjectData.deadline) : undefined
            });
        } else {
            onCreateProject(newProjectData.name, {
                description: newProjectData.description,
                script: newProjectData.script,
                scriptMode: newProjectData.scriptMode,
                structuredScript: newProjectData.structuredScript,
                tags: newProjectData.tags,
                checklist: newProjectData.checklist,
                deadline: newProjectData.deadline ? new Date(newProjectData.deadline) : undefined
            });
        }

        setNewProjectData({ name: '', description: '', script: '', scriptMode: 'simple', structuredScript: [], tags: [], checklist: [], deadline: undefined });
        setEditingProjectId(null);
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

    const handleImageUpload = (file: File, projectId: string) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                onUpdateProject(projectId, { coverImage: result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-6 px-10 pt-12 pb-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Projetos</h1>
                        <p className="text-muted-foreground">Gerencie seus storyboards e fluxos criativos.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Buscar projetos..."
                                className="pl-10 h-10 bg-muted/40 border-border/50 focus:bg-background transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                            setIsCreateDialogOpen(open);
                            if (!open) {
                                setEditingProjectId(null);
                                setNewProjectData({ name: '', description: '', script: '', scriptMode: 'simple', structuredScript: [], tags: [], checklist: [], deadline: undefined });
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button
                                    className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
                                    onClick={() => {
                                        setEditingProjectId(null);
                                        setNewProjectData({ name: '', description: '', script: '', scriptMode: 'simple', structuredScript: [], tags: [], checklist: [], deadline: undefined });
                                    }}
                                >
                                    <Plus className="w-5 h-5" />
                                    Novo Projeto
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[800px] gap-4 max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl">{editingProjectId ? 'Editar Projeto' : 'Criar Novo Projeto'}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-2">
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-8 space-y-1.5">
                                            <Label htmlFor="name">Nome do Projeto</Label>
                                            <Input
                                                id="name"
                                                placeholder="Ex: Curta Metragem Sci-Fi"
                                                value={newProjectData.name}
                                                onChange={(e) => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-span-4 space-y-1.5">
                                            <Label htmlFor="deadline">Meta de Execução</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal h-10",
                                                            !newProjectData.deadline && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {newProjectData.deadline ? (
                                                            formatDate(newProjectData.deadline).split(',')[0]
                                                        ) : (
                                                            <span>Definir Meta</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-4" align="start">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="space-y-0.5">
                                                                <Label className="text-base">Data Término</Label>
                                                                <p className="text-[0.8rem] text-muted-foreground">
                                                                    Definir prazo final para o projeto
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                checked={!!newProjectData.deadline}
                                                                onCheckedChange={(checked) => {
                                                                    setNewProjectData(prev => ({
                                                                        ...prev,
                                                                        deadline: checked ? new Date() : undefined
                                                                    }))
                                                                }}
                                                            />
                                                        </div>
                                                        {newProjectData.deadline && (
                                                            <div className="rounded-md border animate-in fade-in zoom-in-95 duration-200">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={newProjectData.deadline}
                                                                    onSelect={(date) => setNewProjectData(prev => ({ ...prev, deadline: date }))}
                                                                    initialFocus
                                                                    locale={ptBR}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="col-span-12 space-y-1.5">
                                            <Label htmlFor="desc">Descrição</Label>
                                            <Input
                                                id="desc"
                                                placeholder="Breve descrição..."
                                                value={newProjectData.description}
                                                onChange={(e) => setNewProjectData(prev => ({ ...prev, description: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="flex items-center justify-between">
                                            Roteiro / História
                                            <span className="text-xs text-muted-foreground font-normal">Opcional</span>
                                        </Label>
                                        <Tabs
                                            defaultValue="simple"
                                            value={newProjectData.scriptMode}
                                            onValueChange={(val) => {
                                                const mode = val as 'simple' | 'structured';
                                                setNewProjectData(prev => {
                                                    const newData = { ...prev, scriptMode: mode };
                                                    // Auto-add first scene if empty when switching to structured
                                                    if (mode === 'structured' && prev.structuredScript.length === 0) {
                                                        newData.structuredScript = [{ id: Math.random().toString(36).substr(2, 9), content: '', isCompleted: false }];
                                                    }
                                                    return newData;
                                                });
                                            }}
                                            className="w-full"
                                        >
                                            <TabsList className="grid w-full grid-cols-2 mb-2 h-8">
                                                <TabsTrigger value="simple" className="text-xs">Texto Completo</TabsTrigger>
                                                <TabsTrigger value="structured" className="text-xs">Por Cenas</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="simple" className="mt-0">
                                                <Textarea
                                                    placeholder="Cole aqui sua história completa, roteiro ou descrição das cenas..."
                                                    className="h-[120px] resize-none font-mono text-sm leading-relaxed custom-scrollbar"
                                                    value={newProjectData.script}
                                                    onChange={(e) => setNewProjectData(prev => ({ ...prev, script: e.target.value }))}
                                                />
                                            </TabsContent>
                                            <TabsContent value="structured" className="mt-0 space-y-2">
                                                <ScrollArea className="h-[120px] w-full rounded-md border p-3">
                                                    <div className="space-y-2 pr-4">
                                                        {newProjectData.structuredScript.map((scene, index) => (
                                                            <div key={scene.id} className="flex gap-2 items-start group">
                                                                <div className="mt-2">
                                                                    <Checkbox
                                                                        checked={scene.isCompleted}
                                                                        onCheckedChange={(checked) => {
                                                                            setNewProjectData(prev => ({
                                                                                ...prev,
                                                                                structuredScript: prev.structuredScript.map(s => s.id === scene.id ? { ...s, isCompleted: !!checked } : s)
                                                                            }))
                                                                        }}
                                                                    />
                                                                </div>
                                                                <Textarea
                                                                    placeholder={`Cena ${index + 1}...`}
                                                                    className="min-h-[50px] resize-y flex-1 text-sm p-2"
                                                                    value={scene.content}
                                                                    onChange={(e) => {
                                                                        setNewProjectData(prev => ({
                                                                            ...prev,
                                                                            structuredScript: prev.structuredScript.map(s => s.id === scene.id ? { ...s, content: e.target.value } : s)
                                                                        }))
                                                                    }}
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                                                                    onClick={() => {
                                                                        setNewProjectData(prev => ({
                                                                            ...prev,
                                                                            structuredScript: prev.structuredScript.filter(s => s.id !== scene.id)
                                                                        }))
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        {newProjectData.structuredScript.length === 0 && (
                                                            <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg text-muted-foreground text-xs">
                                                                Adicione cenas para organizar seu roteiro.
                                                            </div>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-all hover:border-primary/40 h-8 text-xs"
                                                    onClick={() => {
                                                        setNewProjectData(prev => ({
                                                            ...prev,
                                                            structuredScript: [...prev.structuredScript, { id: Math.random().toString(36).substr(2, 9), content: '', isCompleted: false }]
                                                        }))
                                                    }}
                                                >
                                                    <Plus className="w-3 h-3 mr-2" /> Adicionar Cena
                                                </Button>
                                            </TabsContent>
                                        </Tabs>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Coluna Esquerda: Tags */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-primary" />
                                                    Tags do Projeto
                                                </Label>
                                            </div>
                                            <div className="border rounded-md p-2 h-[100px] overflow-y-auto flex flex-col gap-2 custom-scrollbar">
                                                <div className="flex gap-2">
                                                    <Popover open={isTagPopoverOpen} onOpenChange={(open) => {
                                                        setIsTagPopoverOpen(open);
                                                        if (!open) setEditingTagId(null);
                                                    }}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={isTagPopoverOpen}
                                                                className="w-full justify-between h-8 text-muted-foreground font-normal overflow-hidden text-xs"
                                                            >
                                                                {tagInput ? tagInput : "Adicionar ou gerenciar tags..."}
                                                                <Plus className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[300px] p-0" align="start">
                                                            {editingTagId ? (
                                                                <div className="p-2">
                                                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingTagId(null)}>
                                                                            <ChevronLeft className="h-4 w-4" />
                                                                        </Button>
                                                                        <span className="font-medium text-sm">Editar Tag</span>
                                                                    </div>
                                                                    <div className="space-y-3 p-1">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">Nome</Label>
                                                                            <Input
                                                                                value={newProjectData.tags.find(t => t.id === editingTagId)?.label || ''}
                                                                                onChange={(e) => handleUpdateTag(editingTagId, { label: e.target.value })}
                                                                                className="h-8"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">Cor</Label>
                                                                            <div className="grid grid-cols-4 gap-2">
                                                                                {TAG_COLORS.map((color) => (
                                                                                    <button
                                                                                        key={color.name}
                                                                                        className={cn(
                                                                                            "h-6 w-full rounded-sm border cursor-pointer hover:scale-105 transition-transform",
                                                                                            color.value,
                                                                                            newProjectData.tags.find(t => t.id === editingTagId)?.color === color.value && "ring-2 ring-primary ring-offset-1"
                                                                                        )}
                                                                                        onClick={() => handleUpdateTag(editingTagId, { color: color.value })}
                                                                                        title={color.name}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            className="w-full mt-2 h-8"
                                                                            onClick={() => handleDeleteTag(editingTagId)}
                                                                        >
                                                                            Excluir Tag
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Command>
                                                                    <CommandInput
                                                                        placeholder="Procurar ou criar tag..."
                                                                        value={tagInput}
                                                                        onValueChange={setTagInput}
                                                                        className="h-8 text-xs"
                                                                    />
                                                                    <CommandList>
                                                                        <CommandEmpty>
                                                                            {tagInput && (
                                                                                <div className="p-2 space-y-2">
                                                                                    <p className="text-xs text-muted-foreground px-2">Criar "{tagInput}" com cor:</p>
                                                                                    <div className="grid grid-cols-4 gap-2 px-2 pb-2">
                                                                                        {TAG_COLORS.map((color) => (
                                                                                            <button
                                                                                                key={color.name}
                                                                                                className={cn(
                                                                                                    "h-6 w-full rounded-sm border cursor-pointer hover:scale-105 transition-transform",
                                                                                                    color.value
                                                                                                )}
                                                                                                onClick={() => {
                                                                                                    handleAddTag(tagInput, color.value);
                                                                                                }}
                                                                                                title={color.name}
                                                                                            />
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {!tagInput && <p className="py-6 text-center text-sm text-muted-foreground">Digite para criar uma nova tag</p>}
                                                                        </CommandEmpty>
                                                                        {newProjectData.tags.length > 0 && (
                                                                            <CommandGroup heading="Tags Criadas">
                                                                                {newProjectData.tags.map(tag => (
                                                                                    <CommandItem key={tag.id} className="group flex justify-between items-center" onSelect={() => { }}>
                                                                                        <div className={cn("flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium border", tag.color)}>
                                                                                            {tag.label}
                                                                                        </div>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setEditingTagId(tag.id);
                                                                                            }}
                                                                                        >
                                                                                            <MoreHorizontal className="w-4 h-4" />
                                                                                        </Button>
                                                                                    </CommandItem>
                                                                                ))}
                                                                            </CommandGroup>
                                                                        )}
                                                                    </CommandList>
                                                                </Command>
                                                            )}
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <div className="flex flex-wrap gap-2 content-start">
                                                    {newProjectData.tags.map(tag => (
                                                        <Badge
                                                            key={tag.id}
                                                            variant="outline"
                                                            className={cn("px-2.5 py-0.5 flex items-center gap-1 cursor-pointer group hover:opacity-80 transition-all text-[10px] font-medium rounded-full border shadow-sm", tag.color)}
                                                            onClick={() => {
                                                                setEditingTagId(tag.id);
                                                                setIsTagPopoverOpen(true);
                                                            }}
                                                        >
                                                            {tag.label}
                                                        </Badge>
                                                    ))}
                                                    {newProjectData.tags.length === 0 && (
                                                        <span className="text-xs text-muted-foreground italic p-2">Sem tags adicionadas.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coluna Direita: Checklist */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="flex items-center gap-2">
                                                    <ListTodo className="w-4 h-4 text-primary" />
                                                    Etapas do Projeto
                                                </Label>
                                                <Button variant="outline" size="sm" onClick={handleAddStep} className="h-7 gap-1.5 border-primary/20 hover:bg-primary/5 text-primary text-xs px-2">
                                                    <Plus className="w-3 h-3" />
                                                    Nova
                                                </Button>
                                            </div>

                                            <ScrollArea className="h-[100px] w-full rounded-md border p-2">
                                                <div className="space-y-2 pr-2">
                                                    {newProjectData.checklist.map((step) => (
                                                        <div key={step.id} className="flex items-center gap-2 group animate-in slide-in-from-top-1 duration-200">
                                                            <div className="w-3 h-3 border border-muted rounded flex items-center justify-center bg-muted/50 flex-shrink-0">
                                                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                            </div>
                                                            <Input
                                                                placeholder="Nome da etapa..."
                                                                className="h-8 text-xs flex-1 bg-muted/20 border-transparent focus:bg-background transition-all"
                                                                value={step.label}
                                                                onChange={(e) => handleUpdateStepLabel(step.id, e.target.value)}
                                                                autoFocus={step.label === ''}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleRemoveStep(step.id)}
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {newProjectData.checklist.length === 0 && (
                                                        <div className="text-center py-12 text-muted-foreground text-xs">
                                                            Nenhuma etapa definida.
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="pt-6">
                                    <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                                    <Button onClick={handleSubmitCreate} disabled={!newProjectData.name}>{editingProjectId ? 'Salvar Alterações' : 'Criar Projeto'}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-10 pb-12">
                <div className="max-w-7xl mx-auto">
                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-20 opacity-50">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-lg text-muted-foreground">Nenhum projeto encontrado.</p>
                            <Button variant="link" onClick={() => setNewProjectData({ ...newProjectData })} className="mt-2">Criar um novo projeto</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => {
                                const isSelected = project.id === currentProjectId;
                                return (
                                    <div
                                        key={project.id}
                                        className={cn(
                                            "group relative flex flex-col bg-card rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
                                            isSelected
                                                ? "border-2 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] ring-2 ring-primary/20 scale-[1.02]"
                                                : "border border-border/40 hover:border-primary/50 shadow-sm hover:shadow-lg hover:-translate-y-1"
                                        )}
                                        style={isSelected ? {
                                            boxShadow: '0 0 15px 2px rgba(var(--primary-rgb, 59, 130, 246), 0.4)'
                                        } : undefined}
                                        onClick={() => onSelectProject(project.id)}
                                    >
                                        {/* Project Cover */}
                                        <div
                                            className="h-40 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden group-hover:from-primary/10 group-hover:to-secondary/10 transition-colors"
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                                                const file = e.dataTransfer.files?.[0];
                                                if (file) handleImageUpload(file, project.id);
                                            }}
                                        >
                                            {project.coverImage ? (
                                                <div className="absolute inset-0">
                                                    <img
                                                        src={project.coverImage}
                                                        alt={project.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.06] transition-opacity top-4">
                                                    <FileText className="w-32 h-32" />
                                                </div>
                                            )}

                                            {/* Upload Overlay */}
                                            <label
                                                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Upload className="w-8 h-8 text-white mb-2" />
                                                <span className="text-xs text-white font-medium">Alterar Capa</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload(file, project.id);
                                                    }}
                                                />
                                            </label>

                                            {/* Actions Menu (Top Right) */}
                                            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur-sm hover:bg-background">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => onSelectProject(project.id)} className="cursor-pointer">
                                                            <ExternalLink className="w-4 h-4 mr-2" /> Abrir no Canvas
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditProject(project)} className="cursor-pointer">
                                                            <Edit className="w-4 h-4 mr-2" /> Editar Projeto
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => onDeleteProject(project.id)}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> Excluir Projeto
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Status / Date Badge (Top Left) */}
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <div className="px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-md border border-border/50 text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 shadow-sm">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {formatDate(project.updatedAt)}
                                                </div>
                                                {project.deadline && (
                                                    <div className={cn(
                                                        "px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-medium flex items-center gap-1.5 shadow-sm",
                                                        new Date(project.deadline) < new Date() ? "bg-red-500/80 border-red-400 text-white" : "bg-background/60 border-border/50 text-muted-foreground"
                                                    )}>
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(project.deadline).toLocaleDateString('pt-BR')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="flex flex-col flex-1 p-5 gap-4">
                                            {/* Title & Desc */}
                                            <div className="space-y-2">
                                                <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                    {project.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 h-10 leading-relaxed">
                                                    {project.description || "Sem descrição..."}
                                                </p>
                                            </div>

                                            {/* Progress Section */}
                                            <div className="space-y-2 pt-2 border-t border-border/40">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                                                        <ListTodo className="w-3.5 h-3.5" />
                                                        Etapas ({project.checklist?.filter(s => s.completed).length || 0}/{project.checklist?.length || 0})
                                                    </span>
                                                    <span className="font-bold text-primary">{project.progress}%</span>
                                                </div>
                                                <Progress value={project.progress} className="h-1.5 bg-muted" />

                                                {/* Checklist Dropdown - Simplified for Card */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary w-full justify-between mt-1" onClick={(e) => e.stopPropagation()}>
                                                            <span>Gerenciar etapas</span>
                                                            <ChevronRight className="w-3 h-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-72 p-0 bg-popover/95 backdrop-blur-md border-border shadow-xl z-50">
                                                        <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/30">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Etapas do Projeto</span>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 hover:bg-background rounded-full"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent bubbling
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
                                                        <ScrollArea className="max-h-[250px] overflow-y-auto">
                                                            <div className="p-2 space-y-1">
                                                                {project.checklist?.map((step) => (
                                                                    <div key={step.id} className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-md group/step transition-colors">
                                                                        <Checkbox
                                                                            checked={step.completed}
                                                                            onCheckedChange={(checked) => {
                                                                                const updatedChecklist = project.checklist.map(s =>
                                                                                    s.id === step.id ? { ...s, completed: !!checked } : s
                                                                                );
                                                                                onUpdateProject(project.id, { checklist: updatedChecklist });
                                                                            }}
                                                                            className="mt-0.5"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                        <span className={cn("text-xs flex-1 pt-0.5", step.completed && "line-through text-muted-foreground opacity-70")}>
                                                                            {step.label}
                                                                        </span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-5 w-5 -mt-0.5 opacity-0 group-hover/step:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-full"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const updatedChecklist = project.checklist.filter(s => s.id !== step.id);
                                                                                onUpdateProject(project.id, { checklist: updatedChecklist });
                                                                            }}
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                                {!project.checklist?.length && (
                                                                    <p className="text-center py-4 text-xs text-muted-foreground">Nenhuma etapa.</p>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Footer: Tags */}
                                            <div className="mt-auto pt-3 flex items-center justify-between">
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <TagSelectorCell
                                                        projectTags={project.tags || []}
                                                        allProjects={projects}
                                                        onSelect={(tag) => {
                                                            const currentTags = project.tags || [];
                                                            const otherTags = currentTags.filter(t => t.id !== tag.id);
                                                            onUpdateProject(project.id, { tags: [tag, ...otherTags] });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
