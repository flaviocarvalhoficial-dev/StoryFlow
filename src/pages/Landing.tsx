import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, PlayCircle, Users, Zap, Layout, Share2 } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Landing() {
    const navigate = useNavigate();
    const { session } = useAuth();

    if (session) {
        return <Navigate to="/app" replace />;
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">StoryFlow</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Funcionalidades</a>
                            <a href="#solutions" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Soluções</a>
                            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Preços</a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="text-slate-600 hover:text-blue-600 font-medium" onClick={() => navigate('/login')}>
                            Entrar
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-medium" onClick={() => navigate('/login?signup=true')}>
                            Cadastre-se
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-20 pb-32 overflow-hidden relative">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                        Tudo começa com uma ideia
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                        Mapas mentais <br />
                        <span className="text-blue-600 relative inline-block">
                            colaborativos
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        O StoryFlow ajuda você e sua equipe a capturar pensamentos, conectar projetos e dar vida às suas ideias em um só lugar.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Button className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-lg shadow-lg shadow-blue-600/20" onClick={() => navigate('/login?signup=true')}>
                            Começar agora
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 text-lg">
                            <PlayCircle className="mr-2 w-5 h-5 text-blue-600" />
                            Ver como funciona
                        </Button>
                    </div>

                    {/* Abstract Hero Visualization (Mind Map style) */}
                    <div className="relative max-w-5xl mx-auto">
                        <div className="aspect-[16/9] bg-slate-50 rounded-2xl border border-slate-100 shadow-2xl overflow-hidden relative group">
                            {/* Central Node */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                <div className="bg-blue-600 text-white px-8 py-4 rounded-full shadow-xl text-xl font-bold flex items-center gap-3 transform group-hover:scale-105 transition-transform duration-500">
                                    <Zap className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                    Nova Ideia
                                </div>
                            </div>

                            {/* Connecting Lines (CSS/SVG) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300 stroke-2" style={{ strokeDasharray: '10,10' }}>
                                <path d="M500 280 C 600 280, 700 150, 800 150" fill="none" className="group-hover:stroke-blue-400 transition-colors duration-700" />
                                <path d="M500 280 C 400 280, 300 150, 200 150" fill="none" className="group-hover:stroke-purple-400 transition-colors duration-700" />
                                <path d="M500 280 C 600 280, 700 450, 800 450" fill="none" className="group-hover:stroke-green-400 transition-colors duration-700" />
                                <path d="M500 280 C 400 280, 300 450, 200 450" fill="none" className="group-hover:stroke-orange-400 transition-colors duration-700" />
                            </svg>

                            {/* Floating Nodes */}
                            <div className="absolute top-[20%] right-[15%] bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce hover:scale-110 transition-transform" style={{ animationDuration: '3s' }}>
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Layout className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-slate-700">Roteiro</span>
                            </div>

                            <div className="absolute top-[20%] left-[15%] bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce hover:scale-110 transition-transform" style={{ animationDuration: '4s' }}>
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Users className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-slate-700">Personagens</span>
                            </div>

                            <div className="absolute bottom-[20%] right-[15%] bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce hover:scale-110 transition-transform" style={{ animationDuration: '3.5s' }}>
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <Share2 className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-slate-700">Exportar</span>
                            </div>

                            <div className="absolute bottom-[20%] left-[15%] bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce hover:scale-110 transition-transform" style={{ animationDuration: '4.5s' }}>
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-slate-700">Brainstorm</span>
                            </div>
                        </div>

                        {/* Background Gradients */}
                        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-50 animate-blob"></div>
                        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-50 animate-blob" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-50 animate-blob" style={{ animationDelay: '4s' }}></div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-50" id="features">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">Recursos Poderosos</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Tudo que você precisa para criar</h2>
                        <p className="text-lg text-slate-600">Deixe sua criatividade fluir com ferramentas desenhadas para escritores, roteiristas e produtores.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Layout, title: 'Roteiros Estruturados', desc: 'Organize cenas e sequências com facilidade.', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { icon: Users, title: 'Colaboração Real', desc: 'Trabalhe com sua equipe no mesmo projeto.', color: 'text-purple-600', bg: 'bg-purple-50' },
                            { icon: Zap, title: 'Moodboards Infinitos', desc: 'Cole referências visuais em um canvas ilimitado.', color: 'text-orange-600', bg: 'bg-orange-50' },
                            { icon: Share2, title: 'Exportação Flexível', desc: 'Gere PDFs e compartilhe links num clique.', color: 'text-green-600', bg: 'bg-green-50' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Pronto para dar vida às suas ideias?</h2>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
                        Junte-se a milhares de criadores que usam o StoryFlow para organizar seus projetos.
                    </p>
                    <Button className="h-14 px-8 rounded-full bg-white text-blue-600 hover:bg-blue-50 text-lg font-bold shadow-lg" onClick={() => navigate('/login?signup=true')}>
                        Começar Gratuitamente
                    </Button>
                </div>

                {/* Decorative background circles */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-50"></div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">S</span>
                                </div>
                                <span className="text-xl font-bold text-white">StoryFlow</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">
                                A plataforma definitiva para roteiristas e produtores de conteúdo.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Produto</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Recursos</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Ajuda</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Legal</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
                        © 2024 StoryFlow. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
}
