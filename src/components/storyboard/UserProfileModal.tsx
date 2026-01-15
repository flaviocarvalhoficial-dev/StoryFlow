import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Briefcase, Star, Upload, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    specialty: string;
    plan: string;
    avatarUrl: string;
}

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateProfile: (profile: UserProfile) => void;
    currentProfile: UserProfile;
}

export function UserProfileModal({ isOpen, onClose, onUpdateProfile, currentProfile }: UserProfileModalProps) {
    const { signOut } = useAuth();
    const [profile, setProfile] = useState<UserProfile>(currentProfile);

    // Update local state when modal opens or currentProfile changes
    useEffect(() => {
        if (isOpen) {
            setProfile(currentProfile);
        }
    }, [isOpen, currentProfile]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        try {
            onUpdateProfile(profile);
            onClose();
        } catch (e) {
            console.error("Failed to save profile", e);
            alert("Erro ao salvar perfil.");
        }
    };

    const handleSignOut = async () => {
        await signOut();
        onClose();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Resize and compress image to avoid LocalStorage quota limits
                const compressedImage = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = (event) => {
                        const img = new Image();
                        img.src = event.target?.result as string;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const maxSize = 300; // Max dimension
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > maxSize) {
                                    height *= maxSize / width;
                                    width = maxSize;
                                }
                            } else {
                                if (height > maxSize) {
                                    width *= maxSize / height;
                                    height = maxSize;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            resolve(canvas.toDataURL('image/jpeg', 0.7));
                        };
                    };
                });

                setProfile(prev => ({ ...prev, avatarUrl: compressedImage }));
            } catch (error) {
                console.error("Error processing image", error);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Perfil do Usuário</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Avatar className="w-24 h-24 border-2 border-border group-hover:border-primary transition-colors">
                                <AvatarImage src={profile.avatarUrl} className="object-cover" />
                                <AvatarFallback className="text-2xl bg-muted">
                                    {profile.firstName[0]}{profile.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="font-semibold text-lg">{profile.firstName} {profile.lastName}</h3>
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                <Star className="w-3 h-3 text-primary fill-primary" />
                                {profile.plan} Member
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nome</Label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="firstName"
                                        value={profile.firstName}
                                        onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Sobrenome</Label>
                                <Input
                                    id="lastName"
                                    value={profile.lastName}
                                    onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specialty">Especialidade</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="specialty"
                                    value={profile.specialty}
                                    onChange={(e) => setProfile(p => ({ ...p, specialty: e.target.value }))}
                                    className="pl-9"
                                    placeholder="Ex: Diretor de Arte"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="plan">Plano Atual</Label>
                            <div className="flex w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm h-9 items-center justify-between pointer-events-none opacity-80">
                                <span className="text-sm">{profile.plan}</span>
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">ATIVO</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSignOut}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Sair da Conta"
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar Alterações</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
