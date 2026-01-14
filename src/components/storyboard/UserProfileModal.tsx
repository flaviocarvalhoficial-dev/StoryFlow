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
    onUpdateProfile?: (profile: UserProfile) => void;
}

export function UserProfileModal({ isOpen, onClose, onUpdateProfile }: UserProfileModalProps) {
    const { signOut } = useAuth();
    const [profile, setProfile] = useState<UserProfile>({
        firstName: 'Flavio',
        lastName: 'Carvalho',
        email: 'flaviocarvalhoficial@gmail.com',
        specialty: 'Filmmaker',
        plan: 'Pro',
        avatarUrl: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('storyflow_user_profile');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setProfile(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to parse user profile", e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('storyflow_user_profile', JSON.stringify(profile));
        if (onUpdateProfile) onUpdateProfile(profile);
        onClose();
    };

    const handleSignOut = async () => {
        await signOut();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setProfile(prev => ({ ...prev, avatarUrl: result }));
            };
            reader.readAsDataURL(file);
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
                                <AvatarImage src={profile.avatarUrl} objectFit="cover" />
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
