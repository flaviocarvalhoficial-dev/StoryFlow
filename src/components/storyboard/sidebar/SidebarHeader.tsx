
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    projectName?: string;
}

export function SidebarHeader({ isCollapsed, onToggleCollapse, projectName }: SidebarHeaderProps) {
    return (
        <div className={cn(
            "flex flex-col border-b border-sidebar-border min-h-[50px]",
            isCollapsed ? "items-center justify-center p-2" : "p-3"
        )}>
            <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && <span className="font-bold text-base bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">StoryFlow</span>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className={cn(
                        "h-7 w-7 transition-all duration-300 hover:bg-primary/10 flex items-center justify-center",
                        isCollapsed ? "h-9 w-9 rotate-180" : ""
                    )}
                    title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
                >
                    <ChevronLeft className="w-4 h-4 text-primary" />
                </Button>
            </div>

            {!isCollapsed && projectName && (
                <div className="mt-1 flex items-center px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/70 mr-2 animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[180px]" title={projectName}>
                        {projectName}
                    </span>
                </div>
            )}
        </div>
    );
}
