import React, { useState } from 'react';
import { Play, Pause, X, Film } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SequenceModule } from '@/types/storyboard';
import { cn } from '@/lib/utils';

interface SequenceViewerProps {
    sequence: SequenceModule | null;
    isOpen: boolean;
    onClose: () => void;
}

export function SequenceViewer({ sequence, isOpen, onClose }: SequenceViewerProps) {
    const [isPlaying, setIsPlaying] = useState(true);

    if (!sequence) return null;

    // Filter scenes that have an image and are visible
    const scenesWithImages = (sequence.scenes || []).filter(s => s.imageUrl && s.isVisible !== false);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="max-w-[100vw] w-full h-[100vh] bg-black/95 border-none p-0 flex flex-col justify-center items-center gap-0 focus:outline-none"
                onEscapeKeyDown={onClose}
            >
                <DialogTitle className="sr-only">Visualizador de Sequência: {sequence.title}</DialogTitle>

                {/* Cinematic Header/Controls */}
                <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/90 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Film className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-white text-lg font-semibold tracking-tight">{sequence.title}</h2>
                            <p className="text-white/40 text-xs uppercase tracking-widest">{scenesWithImages.length} Cenas na Sequência</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10 flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/10 rounded-full w-12 h-12"
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-0.5 fill-current" />}
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full w-12 h-12 transition-all"
                            onClick={onClose}
                        >
                            <X className="w-8 h-8" />
                        </Button>
                    </div>
                </div>

                {/* Dynamic Viewer Container - Delimited Area */}
                <div
                    className={cn(
                        "w-full px-4 flex items-center justify-center overflow-hidden relative transition-all duration-500",
                        sequence.aspectRatio === '9:16' ? "max-w-[400px] h-[75vh]" : "max-w-6xl"
                    )}
                    style={{
                        aspectRatio: sequence.aspectRatio === '16:9' ? '16/9' : sequence.aspectRatio === '9:16' ? '9/16' : '4/3'
                    }}
                >
                    <div className="w-full h-full bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 rounded-2xl overflow-hidden relative flex items-center justify-center">
                        {scenesWithImages.length > 0 ? (
                            <div
                                className={cn(
                                    "flex h-full transition-all duration-1000 items-center justify-center",
                                    isPlaying ? "animate-sequence-scroll" : ""
                                )}
                                style={{
                                    animationDuration: `${Math.max(scenesWithImages.length * 2.5, 5)}s`,
                                    animationIterationCount: 'infinite',
                                    animationTimingFunction: 'linear'
                                } as React.CSSProperties}
                            >
                                {/* Double scenes for a seamless linear loop */}
                                {[...scenesWithImages, ...scenesWithImages].map((scene, idx) => (
                                    <div
                                        key={`${scene.id}-${idx}`}
                                        className="h-full flex-shrink-0 relative group border-x border-black/20"
                                    >
                                        <img
                                            src={scene.imageUrl}
                                            alt={scene.title}
                                            className="h-full w-auto object-cover bg-black"
                                            style={{
                                                aspectRatio: sequence.aspectRatio === '16:9' ? '16/9' : sequence.aspectRatio === '9:16' ? '9/16' : '4/3'
                                            }}
                                        />
                                        {/* Subtle overlay per scene */}
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <Film className="w-10 h-10 text-white/20" />
                                </div>
                                <div className="text-center">
                                    <p className="text-white/60 font-medium text-lg">Nenhuma imagem nesta sequência</p>
                                    <p className="text-white/30 text-sm">Adicione imagens às cenas para visualizar o preview.</p>
                                </div>
                            </div>
                        )}

                        {/* Inner Vignette for better focus */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
                    </div>
                </div>

                {/* Global Keyframes for the animation */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          @keyframes sequence-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-sequence-scroll {
            animation-name: sequence-scroll;
          }
        `}} />

                {/* Footer info/legend */}
                <div className="absolute bottom-8 text-white/20 text-[10px] uppercase tracking-[0.2em] font-medium animate-pulse">
                    Modo Visualização • Pressione ESC para sair
                </div>
            </DialogContent>
        </Dialog>
    );
}
