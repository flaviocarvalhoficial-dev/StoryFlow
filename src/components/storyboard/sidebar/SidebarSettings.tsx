import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Settings,
    Sun,
    Moon,
    Box,
    Circle,
    Grid,
    Square,
    Activity,
    Minus,
    Layout,
    Ratio
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SidebarSettingsProps {
    isCollapsed: boolean;
    fontSize: '01' | '02' | '03';
    onFontSizeChange: (size: '01' | '02' | '03') => void;
    gridStyle: 'dots' | 'lines' | 'none';
    onGridStyleChange: (style: 'dots' | 'lines' | 'none') => void;
    defaultRatio: '16:9' | '9:16' | '4:3';
    onDefaultRatioChange: (ratio: '16:9' | '9:16' | '4:3') => void;
    isDark: boolean;
    onToggleTheme: () => void;
    fontStyles: { sub: string };
}

export function SidebarSettings({
    isCollapsed,
    fontSize,
    onFontSizeChange,
    gridStyle,
    onGridStyleChange,
    defaultRatio,
    onDefaultRatioChange,
    isDark,
    onToggleTheme,
    fontStyles
}: SidebarSettingsProps) {
    return (
        <>
            {!isCollapsed && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("w-full justify-start gap-2 h-9", fontStyles.sub)}
                        >
                            <Settings className="w-4 h-4 opacity-70" />
                            <span>Configurações</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-sidebar border-sidebar-border">
                        <DialogHeader>
                            <DialogTitle>Configurações da Interface</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tamanho da Fonte (Sidebar)</Label>
                                <div className="flex bg-muted p-1 rounded-lg gap-1">
                                    {[
                                        { id: '01', label: '14px', title: '01' },
                                        { id: '02', label: '16px', title: '02' },
                                        { id: '03', label: '18px', title: '03' }
                                    ].map((size) => (
                                        <Button
                                            key={size.id}
                                            variant={fontSize === size.id ? 'secondary' : 'ghost'}
                                            className={cn(
                                                "flex-1 h-10 gap-2",
                                                fontSize === size.id ? "bg-background shadow-sm shadow-black/5" : ""
                                            )}
                                            onClick={() => onFontSizeChange(size.id as any)}
                                        >
                                            <span className="text-xs font-bold">{size.title}</span>
                                            <span className="text-[10px] opacity-50">{size.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Box className="w-3 h-3" />
                                    Canvas
                                </Label>

                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] text-muted-foreground uppercase">Estilo de Grade</Label>
                                        <div className="flex bg-muted p-1 rounded-lg gap-1">
                                            {[
                                                { id: 'dots', label: 'Pontos', icon: Circle },
                                                { id: 'lines', label: 'Linhas', icon: Grid },
                                                { id: 'none', label: 'Nenhum', icon: Square }
                                            ].map((item) => (
                                                <Button
                                                    key={item.id}
                                                    variant={gridStyle === item.id ? 'secondary' : 'ghost'}
                                                    className={cn(
                                                        "flex-1 h-8 gap-2",
                                                        gridStyle === item.id ? "bg-background shadow-sm shadow-black/5" : ""
                                                    )}
                                                    onClick={() => onGridStyleChange(item.id as any)}
                                                >
                                                    <item.icon className="w-3 h-3" />
                                                    <span className="text-[10px] font-medium">{item.label}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Layout className="w-3 h-3" />
                                    Comportamento
                                </Label>

                                <div className="space-y-2">
                                    <Label className="text-[10px] text-muted-foreground uppercase">Proporção Padrão (Novas Sequências)</Label>
                                    <div className="flex bg-muted p-1 rounded-lg gap-1">
                                        {[
                                            { id: '16:9', label: 'Cinema (16:9)', icon: Ratio },
                                            { id: '9:16', label: 'Social (9:16)', icon: Ratio },
                                            { id: '4:3', label: 'TV (4:3)', icon: Ratio }
                                        ].map((item) => (
                                            <Button
                                                key={item.id}
                                                variant={defaultRatio === item.id ? 'secondary' : 'ghost'}
                                                className={cn(
                                                    "flex-1 h-8 gap-2",
                                                    defaultRatio === item.id ? "bg-background shadow-sm shadow-black/5" : ""
                                                )}
                                                onClick={() => onDefaultRatioChange(item.id as any)}
                                            >
                                                <item.icon className="w-3 h-3" />
                                                <span className="text-[10px] font-medium">{item.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <Button
                variant="ghost"
                size="sm"
                className={cn("w-full justify-start gap-2 h-9", isCollapsed ? "w-9 h-9 justify-center p-0" : "", fontStyles.sub)}
                onClick={onToggleTheme}
                title={isDark ? "Modo Claro" : "Modo Escuro"}
            >
                {isDark ? <Sun className="w-4 h-4 opacity-70" /> : <Moon className="w-4 h-4 opacity-70" />}
                {!isCollapsed && <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>}
            </Button>
        </>
    );
}
