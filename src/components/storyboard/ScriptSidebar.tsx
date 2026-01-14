import React from 'react';
import { Project } from '@/types/storyboard';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronLeft, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScriptSidebarProps {
    project: Project;
    isOpen: boolean;
    onToggle: () => void;
    onUpdateSceneStatus?: (sceneId: string, isCompleted: boolean) => void;
}

export function ScriptSidebar({ project, isOpen, onToggle, onUpdateSceneStatus }: ScriptSidebarProps) {
    const hasScript = project.script || (project.structuredScript && project.structuredScript.length > 0);

    if (!isOpen) {
        return (
            <div className="absolute right-4 top-20 z-40">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onToggle}
                                className="h-10 w-10 rounded-full shadow-lg bg-background border-border hover:bg-muted transition-all hover:scale-105"
                            >
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Ver Roteiro / História</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        );
    }

    return (
        <div className="w-80 h-full border-l border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col shadow-xl z-40 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">Roteiro</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {!hasScript && (
                        <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                            <FileText className="w-12 h-12 mb-3 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">Nenhum roteiro definido para este projeto.</p>
                        </div>
                    )}

                    {project.scriptMode === 'simple' && project.script && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                {project.script}
                            </p>
                        </div>
                    )}

                    {project.scriptMode === 'structured' && project.structuredScript && (
                        <div className="space-y-4">
                            {project.structuredScript.map((scene, index) => (
                                <div
                                    key={scene.id}
                                    className={cn(
                                        "group relative pl-4 border-l-2 border-muted transition-all pb-1 duration-300",
                                        scene.isCompleted ? "opacity-40 hover:opacity-100 border-green-500/30" : "hover:border-primary/50"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full transition-colors duration-300",
                                        scene.isCompleted ? "bg-green-500" : "bg-muted group-hover:bg-primary"
                                    )} />
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className={cn(
                                            "text-xs font-semibold uppercase tracking-wider transition-colors",
                                            scene.isCompleted ? "text-green-600 dark:text-green-400 line-through decoration-green-500/50" : "text-muted-foreground"
                                        )}>
                                            Cena {index + 1}
                                        </span>
                                        <div className="flex items-center">
                                            <Checkbox
                                                checked={scene.isCompleted}
                                                onCheckedChange={(checked) => onUpdateSceneStatus?.(scene.id, !!checked)}
                                                className={cn(
                                                    "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500",
                                                    !scene.isCompleted && "opacity-0 group-hover:opacity-100 transition-opacity"
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "text-sm leading-relaxed whitespace-pre-wrap transition-colors",
                                        scene.isCompleted ? "text-muted-foreground/80 line-through decoration-border" : "text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        {scene.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
