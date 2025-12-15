
import React, { useState, useEffect } from 'react';
import { 
    Shield, Zap, Sparkles, Building2, ArrowRight, CheckCircle2, 
    Globe, Layout, Users, Activity, Kanban, Check, Star, 
    MessageSquare, ShieldCheck, Cpu, Rocket, CreditCard,
    Lock, BarChart3, Database, Workflow, MousePointerClick,
    Layers, Search, Terminal, Smartphone, Target
} from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    color: string;
}

const PLANS: Plan[] = [
    {
        id: 'starter',
        name: 'Starter Individual',
        price: 'R$ 149',
        description: 'Ideal para contadores independentes iniciando a digitalização.',
        color: 'indigo',
        features: [
            'Até 30 Clientes Ativos',
            'Kanban Operacional Básico',
            'Gestão de Documentos (5GB)',
            'AI Advisor (100 queries/mês)',
            'Suporte via E-mail',
            '1 Workspace Exclusivo'
        ]
    },
    {
        id: 'professional',
        name: 'Professional Pro',
        price: 'R$ 389',
        description: 'Para escritórios em crescimento que precisam de CRM de vendas e IA ilimitada.',
        isPopular: true,
        color: 'purple',
        features: [
            'Clientes Ilimitados',
            'CRM de Vendas & SDR',
            'AI Advisor Ilimitado (Gemini 2.5)',
            'Gestão de Documentos (50GB)',
            'WhatsApp Gateway Integrado',
            'Relatórios Financeiros Avançados',
            'Suporte Prioritário'
        ]
    },
    {
        id: 'enterprise',
        name: 'Enterprise Plus',
        price: 'Consultar',
        description: 'Solução robusta para grandes empresas contábeis com múltiplas unidades.',
        color: 'emerald',
        features: [
            'Múltiplos Workspaces (Sub-tenants)',
            'White Label Completo (Domínio Próprio)',
            'API de Integração Aberta',
            'Treinamento de Equipe Onboarding',
            'Account Manager Dedicado',
            'Segurança de Dados Militar',
            'SLA de 99.9%'
        ]
    }
];

export const LandingPage: React.FC = () => {
    const [step, setStep] = useState<'HOME' | 'REGISTER' | 'PLAN' | 'SUCCESS'>('HOME');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', company: '' });
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = () => {
        setStep('REGISTER');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('PLAN');
    };

    const handleFinishOnboarding = () => {
        setIsLoading(true);
        const slug = formData.company.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        
        setTimeout(() => {
            const workspaceKey = `tenant_${slug}_profile`;
            const userKey = `tenant_${slug}_users`;
            
            const newProfile = {
                name: formData.company,
                primaryColor: '#6366f1',
                borderRadius: 'md',
                sidebarTheme: 'dark',
                plan: selectedPlan?.id,
                loginTitle: 'Bem-vindo ao Futuro Contábil',
                loginMessage: 'Acesse seu painel exclusivo'
            };

            const adminUser = {
                id: 'admin-1',
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'ADMIN',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=6366f1&color=fff&bold=true`,
                permissions: { 
                    access_settings: true, manage_users: true, view_audit_logs: true, manage_integrations: true,
                    view_dashboard: true, view_financials: true, manage_financials: true, export_reports: true,
                    view_pipelines: true, manage_pipelines: true, create_tasks: true, delete_tasks: true,
                    bulk_task_edit: true, view_growth: true, manage_leads: true, delete_leads: true,
                    view_clients: true, manage_clients: true, delete_clients: true, view_calendar: true,
                    manage_calendar: true, use_ai: true, view_services: true, view_tickets: true, manage_tickets: true
                }
            };

            localStorage.setItem(workspaceKey, JSON.stringify(newProfile));
            localStorage.setItem(userKey, JSON.stringify([adminUser]));
            
            window.location.hash = `#/workspace/${slug}`;
        }, 2500);
    };

    if (step === 'REGISTER') {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="max-w-xl w-full bg-gray-900 border border-white/5 rounded-[50px] p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full"></div>
                    <div className="relative z-10 space-y-10">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
                                <Users size={32} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tighter">Crie sua Conta</h2>
                            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-2">Inicie seu teste de 7 dias agora</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome Completo</label>
                                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-6 py-4 font-bold outline-none focus:border-indigo-500 transition-all" placeholder="Seu nome" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome do Escritório</label>
                                <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-6 py-4 font-bold outline-none focus:border-indigo-500 transition-all" placeholder="Ex: Contabilidade Silva" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-6 py-4 font-bold outline-none focus:border-indigo-500 transition-all" placeholder="contato@escritorio.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
                                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-6 py-4 font-bold outline-none focus:border-indigo-500 transition-all" placeholder="••••••••" />
                            </div>
                            <button className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-500/40 transition-all flex items-center justify-center gap-3">
                                Próximo Passo <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'PLAN') {
        return (
            <div className="min-h-screen bg-gray-950 text-white p-8 lg:p-20 animate-in fade-in duration-500">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-5xl font-black tracking-tighter">Escolha o seu Plano</h2>
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">O ambiente para <span className="text-indigo-500">{formData.company}</span> será configurado agora</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {PLANS.map(plan => (
                            <div key={plan.id} className={`relative flex flex-col p-10 rounded-[44px] border-2 transition-all hover:scale-105 ${plan.isPopular ? 'bg-white dark:bg-gray-900 border-indigo-500 shadow-[0_0_80px_rgba(99,102,241,0.15)] text-white' : 'bg-gray-900/50 border-white/5 hover:border-white/10'}`}>
                                {plan.isPopular && <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Mais Vendido</div>}
                                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-black">{plan.price}</span><span className="text-gray-500 font-bold text-sm">/mês</span></div>
                                <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">{plan.description}</p>
                                <div className="flex-1 space-y-4 mb-10">
                                    {plan.features.map((f, i) => <div key={i} className="flex items-center gap-3 text-xs font-bold text-gray-300"><CheckCircle2 size={16} className="text-indigo-500 shrink-0" /> {f}</div>)}
                                </div>
                                <button onClick={() => { setSelectedPlan(plan); handleFinishOnboarding(); }} disabled={isLoading} className={`w-full py-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${plan.isPopular ? 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-500' : 'bg-white text-black hover:bg-indigo-500 hover:text-white'}`}>
                                    {isLoading ? <Zap className="animate-spin mx-auto" /> : 'Finalizar Setup'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden scroll-smooth">
            {/* Background Layers */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[140px] rounded-full animate-pulse"></div>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-[100] px-8 py-6 flex items-center justify-between max-w-7xl mx-auto bg-gray-950/80 backdrop-blur-2xl border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Building2 size={24} strokeWidth={3} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase">Contabil<span className="text-indigo-500">Flow</span></span>
                </div>
                <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <a href="#tecnologia" className="hover:text-indigo-400 transition-colors">Tecnologia</a>
                    <a href="#modulos" className="hover:text-indigo-400 transition-colors">Módulos</a>
                    <a href="#assinatura" className="hover:text-indigo-400 transition-colors">Planos</a>
                    <button onClick={handleStart} className="bg-white text-black px-8 py-3.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-xl font-black active:scale-95">Começar Agora</button>
                </div>
            </nav>

            {/* HERO IMPACT */}
            <section className="relative z-10 max-w-7xl mx-auto px-8 pt-32 pb-48">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-12 animate-in slide-in-from-left duration-1000">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                            <Sparkles size={14} className="animate-pulse" /> Inteligência Contábil Enterprise
                        </div>
                        <h1 className="text-7xl xl:text-[100px] font-black leading-[0.85] tracking-tighter">
                            O CRM que <br/> <span className="text-indigo-500">Trabalha</span> por você.
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed max-w-lg font-medium border-l-4 border-indigo-500/30 pl-8">
                            A primeira plataforma brasileira que une CRM de Vendas, Kanban Operacional e IA Generativa em um ecossistema multilocatário 100% isolado.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <button onClick={handleStart} className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-6 rounded-full font-black uppercase text-xs tracking-widest shadow-[0_20px_50px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 group">
                                Iniciar Teste Grátis <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="flex items-center gap-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <Shield size={16} className="text-emerald-500" /> Sem cartão necessário
                            </div>
                        </div>
                    </div>

                    <div className="relative animate-in zoom-in duration-1000">
                         <div className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-[70px] p-3 border border-white/10 shadow-[0_0_150px_rgba(99,102,241,0.25)]">
                            <div className="bg-gray-950 rounded-[60px] overflow-hidden border border-white/5 aspect-[4/3] flex flex-col">
                                <div className="h-12 bg-gray-900 flex items-center px-10 gap-2 border-b border-white/5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500/40"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/40"></div>
                                </div>
                                <div className="flex-1 p-10 grid grid-cols-12 gap-6">
                                    <div className="col-span-1 bg-white/5 rounded-2xl h-full flex flex-col items-center py-6 gap-6">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 shadow-glow"></div>
                                        <div className="w-8 h-8 rounded-lg bg-white/5"></div>
                                    </div>
                                    <div className="col-span-11 space-y-6">
                                        <div className="h-10 bg-white/5 rounded-2xl w-1/3"></div>
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="h-32 bg-white/5 rounded-3xl border border-white/5"></div>
                                            <div className="h-32 bg-indigo-600/10 rounded-3xl border border-indigo-500/20"></div>
                                            <div className="h-32 bg-white/5 rounded-3xl border border-white/5"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TECNOLOGIA */}
            <section id="tecnologia" className="py-40 relative border-t border-white/5">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="relative order-2 lg:order-1">
                             <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-[40px] space-y-4 translate-y-12">
                                    <Database className="text-indigo-500" size={32} />
                                    <h4 className="text-xl font-black">Isolamento Total</h4>
                                    <p className="text-xs text-gray-500 font-bold leading-relaxed">Arquitetura real multi-tenant. Dados blindados por workspace.</p>
                                </div>
                                <div className="p-8 bg-purple-600/5 border border-purple-500/10 rounded-[40px] space-y-4">
                                    <ShieldCheck className="text-purple-500" size={32} />
                                    <h4 className="text-xl font-black">Certificação Cloud</h4>
                                    <p className="text-xs text-gray-500 font-bold leading-relaxed">Criptografia de ponta a ponta e redundância global.</p>
                                </div>
                             </div>
                        </div>
                        <div className="space-y-8 order-1 lg:order-2">
                             <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">Blindagem de <span className="text-indigo-500">Dados.</span></h2>
                             <p className="text-lg text-gray-400 font-medium leading-relaxed">No ContabilFlow, privacidade não é um opcional. Cada escritório possui seu próprio container seguro, impedindo qualquer vazamento ou cruzamento indevido.</p>
                             <ul className="space-y-4">
                                {[
                                    'Auditoria completa de logs de sistema',
                                    'Backups automáticos em múltiplas regiões',
                                    'Controle de acesso granular (RBAC)',
                                    'Conformidade integral com a LGPD'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-black text-gray-300">
                                        <CheckCircle2 size={18} className="text-indigo-500" /> {item}
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* MÓDULOS */}
            <section id="modulos" className="bg-white text-gray-950 py-48 rounded-[100px] relative z-10">
                <div className="max-w-7xl mx-auto px-8 text-center mb-32">
                    <h2 className="text-6xl font-black tracking-tighter mb-6">Um ecossistema completo.</h2>
                    <p className="text-gray-500 font-bold text-xl max-w-2xl mx-auto">Tudo o que seu escritório precisa para escalar, desde a prospecção até a entrega fiscal.</p>
                </div>
                <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[
                        { title: 'CRM de Growth', icon: Target, desc: 'Gestão estratégica de leads, SDR e funis de vendas contábeis de alta conversão.' },
                        { title: 'IA Advisor 2.5', icon: Cpu, desc: 'Inteligência artificial integrada que analisa guias, cria tarefas e sugere automações.' },
                        { title: 'WhatsApp Gateway', icon: MessageSquare, desc: 'Centralize conversas do seu time. Vincule cada chat a uma demanda no CRM.' },
                        { title: 'Kanban Elite', icon: Workflow, desc: 'Obras de arte operacionais. Subtarefas e prazos automáticos por regime tributário.' },
                        { title: 'Relatórios BI', icon: BarChart3, desc: 'Dashboards premium de receita e produtividade em tempo real para sua gestão.' },
                        { title: 'White Label', icon: Layers, desc: 'Personalize cores e logos. Seus clientes acessam um portal com a SUA marca.' }
                    ].map((f, i) => (
                        <div key={i} className="group p-12 rounded-[60px] bg-gray-50 border border-gray-100 hover:bg-gray-950 hover:text-white transition-all duration-700">
                            <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-10 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 transition-all">
                                <f.icon size={28} />
                            </div>
                            <h4 className="text-2xl font-black mb-4 tracking-tight">{f.title}</h4>
                            <p className="text-gray-500 group-hover:text-gray-400 leading-relaxed font-bold text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-24 border-t border-white/5 bg-gray-950">
                <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-4 gap-16 mb-20">
                    <div className="col-span-2 space-y-8">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <Building2 size={24} strokeWidth={3} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter uppercase">Contabil<span className="text-indigo-500">Flow</span></span>
                        </div>
                        <p className="text-gray-500 font-medium max-w-xs">A plataforma definitiva para o escritório contábil de alta performance.</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-8 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-widest">© 2024 ContabilFlow SaaS • A Nova Era Contábil</p>
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                         <span className="text-[9px] font-black uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
