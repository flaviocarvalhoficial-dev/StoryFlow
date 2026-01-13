import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, ArrowLeft, Zap, Shield, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Pricing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-indigo-500/30">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-purple-600/20 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="flex justify-between items-center mb-16">
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white gap-2 transition-all hover:translate-x-[-4px]"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Studio
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">StoryFlow <span className="text-indigo-500">Pro</span></span>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="text-center mb-20">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        Poder ilimitado para suas <br /> histórias ganharem vida.
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Experimente o StoryFlow Studio sem restrições por 7 dias. Transforme sua visão em storyboards profissionais com ferramentas de IA avançadas.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">

                    {/* Trial Card */}
                    <div className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-slate-700/50 to-slate-800/50 hover:from-slate-600/50 hover:to-slate-700/50 transition-all">
                        <div className="relative bg-[#0f172a]/90 backdrop-blur-xl rounded-2xl h-full p-8 flex flex-col">
                            <div className="mb-8">
                                <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-4 border border-slate-700">
                                    FREE TRIAL
                                </span>
                                <h3 className="text-2xl font-bold mb-2">Teste de 7 Dias</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">R$ 0</span>
                                    <span className="text-slate-400">/7 dias</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {[
                                    'Acesso a todas as ferramentas CORE',
                                    'Até 3 projetos simultâneos',
                                    'Exportação em baixa resolução',
                                    'Biblioteca de prompts básica',
                                    'Histórico de alterações (24h)',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                                        <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-white h-12">
                                Começar Teste Grátis
                            </Button>
                        </div>
                    </div>

                    {/* Premium Card */}
                    <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20 transform hover:-translate-y-2 transition-all duration-300">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-xs font-bold text-white shadow-lg whitespace-nowrap">
                            MAIS POPULAR & RECOMENDADO
                        </div>

                        <div className="relative bg-[#1a103d]/95 backdrop-blur-xl rounded-2xl h-full p-8 flex flex-col border border-white/5">
                            <div className="mb-8">
                                <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-500/30">
                                    PREMIUM PRO
                                </span>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold">Acesso Vitalício</h3>
                                    <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-slate-400 line-through text-lg">R$ 197</span>
                                    <span className="text-4xl font-bold">R$ 97</span>
                                    <span className="text-slate-400">/pagamento único</span>
                                </div>
                                <p className="text-indigo-200/60 text-xs mt-2 italic">*Oferta de lançamento por tempo limitado</p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {[
                                    'Projetos e Sequências Ilimitadas',
                                    'Exportação em 4K e Ultra-HD',
                                    'Lattes/Prompts Exclusivos de IA',
                                    'Moodboards Ilimitados',
                                    'Suporte Prioritário 24/7',
                                    'Acesso a novas ferramentas BETA',
                                    'Remoção total de marca d\'água',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-indigo-400" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-600/30 h-12 text-md font-bold group-hover:scale-[1.02] transition-transform">
                                Assinar Premium Agora
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 pt-12 border-t border-slate-800/50">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-4 text-indigo-400">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold mb-2 text-sm">Pagamento Seguro</h4>
                        <p className="text-slate-500 text-xs text-balance leading-relaxed">Sua transação é protegida com criptografia de ponta a ponta.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-4 text-indigo-400">
                            <Rocket className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold mb-2 text-sm">Ativação Instantânea</h4>
                        <p className="text-slate-500 text-xs text-balance leading-relaxed">Comece a criar imediatamente após a confirmação do pagamento.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-4 text-indigo-400">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold mb-2 text-sm">Garantia de 7 Dias</h4>
                        <p className="text-slate-500 text-xs text-balance leading-relaxed">Não gostou? Devolvemos 100% do seu dinheiro sem perguntas.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
