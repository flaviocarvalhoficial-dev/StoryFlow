import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarUpgradeCardProps {
    isCollapsed: boolean;
}

export function SidebarUpgradeCard({ isCollapsed }: SidebarUpgradeCardProps) {
    const navigate = useNavigate();

    return (
        <div className={cn(
            "mb-2 mx-1 p-3 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 group cursor-pointer hover:border-indigo-500/40 transition-all",
            isCollapsed ? "p-2 w-9 h-9 flex items-center justify-center overflow-hidden" : ""
        )}
            onClick={() => navigate('/pricing')}
        >
            {isCollapsed ? (
                <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Mudar para Pro</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mb-2">Acesso total e exportação ilimitada 4K.</p>
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-medium text-indigo-400">7 Dias Grátis</span>
                        <ChevronRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </>
            )}
        </div>
    );
}
