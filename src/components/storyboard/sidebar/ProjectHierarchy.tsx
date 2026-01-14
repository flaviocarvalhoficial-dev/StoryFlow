import React, { useState } from 'react';
import {
    Box,
    Plus,
    ChevronRight,
    FolderOpen,
    Eye,
    EyeOff,
    Copy,
    Trash2,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Project, SequenceModule, SceneModule } from '@/types/storyboard';

interface ProjectHierarchyProps {
    currentProject: Project;
    isCollapsed: boolean;
    onUpdateProject: (id: string, updates: Partial<Project>) => void;
    onAddSequence: () => void;
    onUpdateSequence: (id: string, updates: Partial<SequenceModule>) => void;
    onDeleteSequence: (id: string) => void;
    onDuplicateSequence: (id: string) => void;
    onToggleSequenceVisibility: (id: string) => void;
    onUpdateScene: (sequenceId: string, sceneId: string, updates: Partial<SceneModule>) => void;
    onToggleSceneVisibility: (sequenceId: string, sceneId: string) => void;
    fontStyles: { icon: string; sub: string };
}

export function ProjectHierarchy({
    currentProject,
    isCollapsed,
    onUpdateProject,
    onAddSequence,
    onUpdateSequence,
    onDeleteSequence,
    onDuplicateSequence,
    onToggleSequenceVisibility,
    onUpdateScene,
    onToggleSceneVisibility,
    fontStyles
}: ProjectHierarchyProps) {
    const [isEditingProjectName, setIsEditingProjectName] = useState(false);
    const [editingProjectName, setEditingProjectName] = useState('');

    const [editingSequenceId, setEditingSequenceId] = useState<string | null>(null);
    const [editingSequenceName, setEditingSequenceName] = useState('');

    const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
    const [editingSceneName, setEditingSceneName] = useState('');

    const [sequenceToDelete, setSequenceToDelete] = useState<string | null>(null);

    const handleRenameProject = () => {
        if (editingProjectName.trim() && editingProjectName !== currentProject.name) {
            onUpdateProject(currentProject.id, { name: editingProjectName.trim() });
        }
        setIsEditingProjectName(false);
    };

    const handleRenameSequence = (id: string) => {
        if (editingSequenceName.trim()) {
            onUpdateSequence(id, { title: editingSequenceName.trim() });
            setEditingSequenceId(null);
            setEditingSequenceName('');
        }
    };

    const handleRenameScene = (sequenceId: string, sceneId: string) => {
        if (editingSceneName.trim()) {
            onUpdateScene(sequenceId, sceneId, { title: editingSceneName.trim() });
            setEditingSceneId(null);
            setEditingSceneName('');
        }
    };

    const confirmDeleteSequence = () => {
        if (sequenceToDelete) {
            onDeleteSequence(sequenceToDelete);
            setSequenceToDelete(null);
        }
    };

    if (isCollapsed) {
        return (
            <div className="flex justify-center py-2">
                <Box className="w-5 h-5 text-primary opacity-50" />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {!isCollapsed && (
                <div className={cn("px-1 text-[9px] uppercase font-bold text-muted-foreground/50 tracking-wider mb-0.5 ml-1", fontStyles.sub)}>
                    Projeto
                </div>
            )}
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-primary/5 border border-primary/20 mb-3 shadow-sm group/project-header">
                <Box className={cn(fontStyles.icon, "text-primary")} />
                {isEditingProjectName ? (
                    <input
                        type="text"
                        value={editingProjectName}
                        onChange={(e) => setEditingProjectName(e.target.value)}
                        onBlur={handleRenameProject}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameProject()}
                        className={cn("flex-1 bg-transparent border-b border-primary outline-none min-w-0 font-bold text-primary uppercase tracking-tight", fontStyles.sub)}
                        autoFocus
                    />
                ) : (
                    <span
                        className={cn("font-bold truncate text-primary uppercase tracking-tight flex-1 cursor-pointer", fontStyles.sub)}
                        onDoubleClick={() => {
                            setIsEditingProjectName(true);
                            setEditingProjectName(currentProject.name);
                        }}
                        title="Duplo clique para renomear"
                    >
                        {currentProject.name}
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-auto hover:bg-primary/10"
                    onClick={onAddSequence}
                    title="Nova Sequência"
                >
                    <Plus className="w-3 h-3" />
                </Button>
            </div>

            <ScrollArea className="flex-1 max-h-[400px]">
                <div className="space-y-1 relative pr-3">
                    <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border/40" />

                    {currentProject.sequences?.map((sequence) => (
                        <Collapsible key={sequence.id} defaultOpen>
                            <div className="flex items-center group/seq relative z-10">
                                <CollapsibleTrigger asChild>
                                    <div className={cn(
                                        "flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent/50 cursor-pointer transition-all bg-sidebar group",
                                        sequence.isVisible !== false ? "text-foreground" : "text-muted-foreground opacity-40",
                                        fontStyles.sub
                                    )}>
                                        <ChevronRight className="w-3 h-3 mr-0.5 transition-transform duration-200 group-data-[state=open]:rotate-90 opacity-40" />
                                        <div className="w-4 h-4 flex items-center justify-center">
                                            <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
                                        </div>

                                        {editingSequenceId === sequence.id ? (
                                            <input
                                                type="text"
                                                value={editingSequenceName}
                                                onChange={(e) => setEditingSequenceName(e.target.value)}
                                                onBlur={() => handleRenameSequence(sequence.id)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleRenameSequence(sequence.id)}
                                                className={cn("flex-1 bg-transparent border-b border-primary outline-none min-w-0", fontStyles.sub)}
                                                autoFocus
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span
                                                className="truncate flex-1 font-semibold tracking-tight"
                                                onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingSequenceId(sequence.id);
                                                    setEditingSequenceName(sequence.title);
                                                }}
                                            >
                                                {sequence.title}
                                            </span>
                                        )}
                                    </div>
                                </CollapsibleTrigger>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-6 w-6 transition-opacity",
                                            sequence.isVisible !== false ? "opacity-0 group-hover/seq:opacity-100" : "opacity-100"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleSequenceVisibility(sequence.id);
                                        }}
                                        title={sequence.isVisible !== false ? "Ocultar Sequência" : "Mostrar Sequência"}
                                    >
                                        {sequence.isVisible !== false ? (
                                            <Eye className="w-3.5 h-3.5" />
                                        ) : (
                                            <EyeOff className="w-3.5 h-3.5 text-primary" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover/seq:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onDuplicateSequence(sequence.id);
                                        }}
                                        title="Duplicar Sequência"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover/seq:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSequenceToDelete(sequence.id);
                                        }}
                                        title="Excluir Sequência"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>

                            <CollapsibleContent className="pl-6 pt-1 space-y-0.5">
                                {sequence.scenes.length === 0 ? (
                                    <div className={cn("text-muted-foreground/40 px-3 py-1 italic ml-4 border-l border-border/20", fontStyles.sub)}>Sem cenas</div>
                                ) : (
                                    sequence.scenes.filter(s => !s.parentId).map((scene) => {
                                        const subscenes = sequence.scenes.filter(s => s.parentId === scene.id);
                                        const hasSubscenes = subscenes.length > 0;

                                        return (
                                            <React.Fragment key={scene.id}>
                                                <Collapsible defaultOpen>
                                                    <div
                                                        className={cn("flex items-center group/scene relative transition-colors", fontStyles.sub)}
                                                    >
                                                        <div className="absolute -left-[9px] top-1/2 w-2 h-px bg-border/40" />
                                                        <div className={cn(
                                                            "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-sidebar-accent/30 cursor-pointer",
                                                            scene.isVisible !== false ? "text-foreground" : "text-muted-foreground opacity-40"
                                                        )}>
                                                            {hasSubscenes ? (
                                                                <CollapsibleTrigger asChild>
                                                                    <div className="p-0.5 hover:bg-muted rounded-sm cursor-pointer mr-0.5 group" onClick={(e) => e.stopPropagation()}>
                                                                        <ChevronRight className="w-3 h-3 transition-transform duration-200 group-data-[state=open]:rotate-90 opacity-60" />
                                                                    </div>
                                                                </CollapsibleTrigger>
                                                            ) : (
                                                                <div className="w-4" />
                                                            )}

                                                            <FileText className="w-3 h-3 opacity-40 group-hover/scene:opacity-100 transition-opacity" />
                                                            {editingSceneId === scene.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingSceneName}
                                                                    onChange={(e) => setEditingSceneName(e.target.value)}
                                                                    onBlur={() => handleRenameScene(sequence.id, scene.id)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameScene(sequence.id, scene.id)}
                                                                    className={cn("flex-1 bg-transparent border-b border-primary outline-none min-w-0", fontStyles.sub)}
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <span
                                                                    className="truncate flex-1"
                                                                    onDoubleClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingSceneId(scene.id);
                                                                        setEditingSceneName(scene.title);
                                                                    }}
                                                                >
                                                                    {scene.title}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={cn(
                                                                "h-6 w-6 transition-opacity ml-1",
                                                                scene.isVisible !== false ? "opacity-0 group-hover/scene:opacity-100" : "opacity-100"
                                                            )}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onToggleSceneVisibility(sequence.id, scene.id);
                                                            }}
                                                            title={scene.isVisible !== false ? "Ocultar Cena" : "Mostrar Cena"}
                                                        >
                                                            {scene.isVisible !== false ? (
                                                                <Eye className="w-3 h-3" />
                                                            ) : (
                                                                <EyeOff className="w-3 h-3 text-primary" />
                                                            )}
                                                        </Button>
                                                    </div>

                                                    {/* Subscenes */}
                                                    {hasSubscenes && (
                                                        <CollapsibleContent>
                                                            {subscenes.map((subScene) => (
                                                                <div
                                                                    key={subScene.id}
                                                                    className={cn("flex items-center group/scene relative transition-colors", fontStyles.sub)}
                                                                >
                                                                    <div className="absolute -left-[9px] top-1/2 w-2 h-px bg-border/40" />
                                                                    {/* Tree indicator for nesting */}
                                                                    <div className="absolute left-[0px] -top-3 bottom-1/2 w-px bg-border/40" />
                                                                    <div className="absolute left-[0px] top-1/2 w-3 h-px bg-border/40" />

                                                                    <div className={cn(
                                                                        "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-sidebar-accent/30 cursor-pointer ml-3",
                                                                        subScene.isVisible !== false ? "text-foreground" : "text-muted-foreground opacity-40"
                                                                    )}>
                                                                        <div className="w-4" /> {/* Spacer for alignment */}
                                                                        <div className="w-1 h-1 rounded-full bg-muted-foreground/40 mr-1" />
                                                                        <FileText className="w-3 h-3 opacity-40 group-hover/scene:opacity-100 transition-opacity" />
                                                                        {editingSceneId === subScene.id ? (
                                                                            <input
                                                                                type="text"
                                                                                value={editingSceneName}
                                                                                onChange={(e) => setEditingSceneName(e.target.value)}
                                                                                onBlur={() => handleRenameScene(sequence.id, subScene.id)}
                                                                                onKeyDown={(e) => e.key === 'Enter' && handleRenameScene(sequence.id, subScene.id)}
                                                                                className={cn("flex-1 bg-transparent border-b border-primary outline-none min-w-0", fontStyles.sub)}
                                                                                autoFocus
                                                                            />
                                                                        ) : (
                                                                            <span
                                                                                className="truncate flex-1"
                                                                                onDoubleClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setEditingSceneId(subScene.id);
                                                                                    setEditingSceneName(subScene.title);
                                                                                }}
                                                                            >
                                                                                {subScene.title}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className={cn(
                                                                            "h-6 w-6 transition-opacity ml-1",
                                                                            subScene.isVisible !== false ? "opacity-0 group-hover/scene:opacity-100" : "opacity-100"
                                                                        )}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onToggleSceneVisibility(sequence.id, subScene.id);
                                                                        }}
                                                                        title={subScene.isVisible !== false ? "Ocultar Cena" : "Mostrar Cena"}
                                                                    >
                                                                        {subScene.isVisible !== false ? (
                                                                            <Eye className="w-3 h-3" />
                                                                        ) : (
                                                                            <EyeOff className="w-3 h-3 text-primary" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </CollapsibleContent>
                                                    )}
                                                </Collapsible>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </ScrollArea>

            <AlertDialog open={!!sequenceToDelete} onOpenChange={() => setSequenceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a sequência e todas as cenas contidas nela.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteSequence} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
