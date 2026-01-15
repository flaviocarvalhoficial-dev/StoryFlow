import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, User, ArrowRight, Github, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const navigate = useNavigate();
    const { session } = useAuth();

    useEffect(() => {
        if (session) {
            navigate('/', { replace: true });
        }
    }, [session, navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Bem-vindo de volta! 🚀');
                // Navigation handled by useEffect
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                        },
                    },
                });
                if (error) throw error;
                toast.success('Conta criada com sucesso! Verifique seu email.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro na autenticação');
        } finally {
            setIsLoading(false);
        }
    };
    // ... rest of the file ...

    return (
        <div className="min-h-screen w-full flex bg-background overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-1000" />
            </div>

            {/* Left Side - Visuals */}
            <div className="hidden lg:flex flex-1 relative flex-col justify-center items-center bg-muted/30 backdrop-blur-sm border-r border-border/50 p-12">
                <div className="relative z-10 max-w-lg text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-primary/20 shadow-xl shadow-primary/10 rotate-3 hover:rotate-6 transition-all duration-500">
                            <Sparkles className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                        StoryFlow Studio
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Transforme suas ideias em narrativas visuais poderosas. Onde a criatividade encontra a estrutura.
                    </p>
                </div>

                {/* Animated Grid/Canvas abstract representation */}
                <div className="absolute inset-0 z-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            {isLogin
                                ? 'Entre com suas credenciais para acessar seus projetos.'
                                : 'Comece sua jornada criativa hoje mesmo.'}
                        </p>
                    </div>

                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-1 rounded-lg flex mb-6 relative">
                        <motion.div
                            className="absolute top-1 bottom-1 bg-background rounded-md shadow-sm border border-border/50"
                            initial={false}
                            animate={{
                                left: isLogin ? '4px' : '50%',
                                width: 'calc(50% - 4px)',
                                x: isLogin ? 0 : 0
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                        <button
                            onClick={() => setIsLogin(true)}
                            className={cn(
                                "flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-200",
                                isLogin ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={cn(
                                "flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-200",
                                !isLogin ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Registrar
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-2 gap-4 overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Nome</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="firstName"
                                                placeholder="João"
                                                className="pl-9"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Sobrenome</Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Silva"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required={!isLogin}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="pl-9 bg-background/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                {isLogin && (
                                    <a href="#" className="text-xs text-primary hover:underline">
                                        Esqueceu a senha?
                                    </a>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 bg-background/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Entrar' : 'Criar Conta'} <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Social Auth Separator */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <Button variant="outline" className="w-full bg-background/50 backdrop-blur-sm hover:bg-background/80" disabled={isLoading}>
                            <Github className="mr-2 h-4 w-4" /> Github
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
