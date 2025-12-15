
import React, { useState, useRef, useMemo } from 'react';
import { 
    Search, Building2, MapPin, Globe, Loader2, Copy, 
    CheckCircle2, AlertCircle, FileText, Calculator, 
    Landmark, Calendar, ShieldAlert, Key, FileWarning, 
    ExternalLink, Download, FileSignature, Fingerprint,
    UserCheck, FileBadge, AlertTriangle, Info, Users as UsersIcon,
    ArrowRight, Percent, DollarSign as DollarIcon, TrendingUp, Briefcase
} from 'lucide-react';
import { CNPJData, CEPData, ECACResultData } from '../types';
import { whatsAppService } from '../services/whatsappService';

type ServiceTool = 'CNPJ' | 'CEP' | 'ECAC' | 'BANK' | 'HOLIDAYS' | 'CALC';

export const ServiceCenter: React.FC = () => {
    const [activeTool, setActiveTool] = useState<ServiceTool>('CNPJ');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Estados eCAC
    const [ecacPass, setEcacPass] = useState('');
    const [ecacCertBase64, setEcacCertBase64] = useState<string | null>(null);
    const [ecacCertName, setEcacCertName] = useState<string | null>(null);
    const [ecacResult, setEcacResult] = useState<ECACResultData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados Simulador (Simples Nacional)
    const [calcFaturamento, setCalcFaturamento] = useState<number>(0);
    const [calcAnexo, setCalcAnexo] = useState<number>(1);
    
    // Alíquotas aproximadas Simples Nacional (Faixa 1 - até 180k)
    const ALIQUOTAS_SIMPLES = [0, 0.04, 0.045, 0.06, 0.155, 0.155]; // Índice 1 a 5

    const simplesResult = useMemo(() => {
        if (!calcFaturamento) return null;
        const aliquota = ALIQUOTAS_SIMPLES[calcAnexo];
        const imposto = calcFaturamento * aliquota;
        const liquido = calcFaturamento - imposto;
        return { imposto, liquido, percentual: aliquota * 100 };
    }, [calcFaturamento, calcAnexo]);

    // Estados de resultados padrões
    const [cnpjResult, setCnpjResult] = useState<CNPJData | null>(null);
    const [cepResult, setCepResult] = useState<CEPData | null>(null);
    const [holidays, setHolidays] = useState<any[]>([]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!file.name.endsWith('.pfx') && !file.name.endsWith('.p12')) {
            setError("Por favor, selecione um arquivo de certificado A1 (.pfx ou .p12)");
            return;
        }

        setEcacCertName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = (event.target?.result as string).split(',')[1];
            setEcacCertBase64(base64);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const fetchCNPJ = async (cnpj: string) => {
        setIsLoading(true);
        setError(null);
        setCnpjResult(null);
        try {
            const cleanCnpj = cnpj.replace(/\D/g, '');
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado ou erro na API.');
            const data = await response.json();
            setCnpjResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCEP = async (cep: string) => {
        setIsLoading(true);
        setError(null);
        setCepResult(null);
        try {
            const cleanCep = cep.replace(/\D/g, '');
            const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
            if (!response.ok) throw new Error('CEP não encontrado.');
            const data = await response.json();
            setCepResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchECAC = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = whatsAppService.getConfig().infosimplesToken;
        
        if (!token) {
            setError("Token da Infosimples não configurado. Vá em Configurações > Integrações e insira sua chave de API.");
            return;
        }
        if (!ecacCertBase64 || !ecacPass) {
            setError("O Certificado A1 (.pfx) e a senha são obrigatórios para autenticação no eCAC.");
            return;
        }
        if (!searchQuery.trim()) {
            setError("Informe o CNPJ da empresa que deseja consultar.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setEcacResult(null);

        try {
            const formData = new URLSearchParams();
            formData.append('token', token);
            formData.append('perfil_procurador_cnpj', ''); 
            formData.append('pkcs12_cert', ecacCertBase64);
            formData.append('pkcs12_pass', ecacPass);
            formData.append('cpf_cnpj', searchQuery.replace(/\D/g, ''));

            const response = await fetch('https://api.infosimples.com/api/v2/consultas/receita-federal/ecac-situacao-fiscal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            const data = await response.json();

            if (data.code !== 200) {
                const apiError = data.errors?.[0] || data.message || "Erro desconhecido na consulta eCAC.";
                throw new Error(apiError);
            }

            if (!data.data || data.data.length === 0) {
                throw new Error("A API retornou sucesso mas nenhum dado foi encontrado para este CNPJ.");
            }

            setEcacResult(data.data[0]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHolidays = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const year = new Date().getFullYear();
            const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
            if (!response.ok) throw new Error('Erro ao buscar feriados.');
            const data = await response.json();
            setHolidays(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTool === 'CNPJ') fetchCNPJ(searchQuery);
        else if (activeTool === 'CEP') fetchCEP(searchQuery);
        else if (activeTool === 'ECAC') fetchECAC(e);
    };

    return (
        <div className="h-full flex flex-col gap-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                    Central de Serviços
                </h2>
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.5em] mt-2">Tecnologia de Consulta e Automação Fiscal</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { id: 'CNPJ', label: 'Consultar CNPJ', icon: Building2, color: 'text-blue-500' },
                    { id: 'CEP', label: 'Localizar CEP', icon: MapPin, color: 'text-emerald-500' },
                    { id: 'ECAC', label: 'Consultor de Débitos', icon: ShieldAlert, color: 'text-red-500' },
                    { id: 'BANK', label: 'Lista de Bancos', icon: Landmark, color: 'text-purple-500' },
                    { id: 'HOLIDAYS', label: 'Feriados Nacionais', icon: Calendar, color: 'text-orange-500' },
                    { id: 'CALC', label: 'Simuladores', icon: Calculator, color: 'text-pink-500' },
                ].map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => {
                            setActiveTool(tool.id as ServiceTool);
                            setError(null);
                            if (tool.id === 'HOLIDAYS') fetchHolidays();
                        }}
                        className={`p-6 rounded-[36px] border-2 transition-all flex flex-col items-center gap-4 active:scale-95 group relative overflow-hidden ${activeTool === tool.id ? 'bg-indigo-600 border-indigo-500 shadow-[0_20px_50px_rgba(99,102,241,0.3)] text-white' : 'bg-white dark:bg-[#09090b] border-gray-100 dark:border-white/5 text-gray-400 hover:border-indigo-500/30'}`}
                    >
                        <div className={`p-4 rounded-[22px] transition-all duration-500 ${activeTool === tool.id ? 'bg-white/20 scale-110' : 'bg-gray-50 dark:bg-gray-900 group-hover:scale-110'} ${activeTool === tool.id ? 'text-white' : tool.color}`}>
                            <tool.icon size={26} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center leading-tight">{tool.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 bg-white dark:bg-[#09090b] rounded-[50px] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
                
                {(activeTool === 'CNPJ' || activeTool === 'CEP' || activeTool === 'ECAC') && (
                    <div className="p-12 border-b border-white/5 bg-white/[0.01]">
                        <form onSubmit={handleSearch} className="max-w-5xl mx-auto space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                                <div className={`${activeTool === 'ECAC' ? 'md:col-span-4' : 'md:col-span-12'} space-y-3`}>
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] block ml-3">
                                        Identificador (CNPJ)
                                    </label>
                                    <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500 transition-colors" size={24} />
                                        <input
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="00.000.000/0001-00"
                                            className="w-full pl-16 pr-8 py-7 rounded-[32px] bg-white/[0.02] border border-white/10 outline-none font-black text-2xl text-white focus:border-indigo-600 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                {activeTool === 'ECAC' && (
                                    <>
                                        <div className="md:col-span-4 space-y-3">
                                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] block ml-3">
                                                Certificado Digital A1
                                            </label>
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="cursor-pointer bg-white/[0.02] border border-white/10 rounded-[32px] px-8 py-7 text-sm font-black text-gray-400 flex items-center gap-4 hover:border-indigo-500/50 hover:bg-white/[0.04] transition-all group"
                                            >
                                                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <FileSignature size={24} />
                                                </div>
                                                <span className="truncate flex-1">{ecacCertName || 'Upload .pfx / .p12'}</span>
                                                <input type="file" ref={fileInputRef} className="hidden" accept=".pfx,.p12" onChange={handleFileUpload} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-4 space-y-3">
                                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] block ml-3">
                                                Senha do Certificado
                                            </label>
                                            <div className="relative group">
                                                <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500 transition-colors" size={24} />
                                                <input
                                                    type="password"
                                                    value={ecacPass}
                                                    onChange={e => setEcacPass(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full pl-16 pr-8 py-7 rounded-[32px] bg-white/[0.02] border border-white/10 outline-none font-black text-2xl text-white focus:border-indigo-600 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-7 rounded-[36px] font-black uppercase text-xs tracking-[0.5em] shadow-[0_20px_60px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-4"
                            >
                                {isLoading ? <Loader2 size={28} className="animate-spin" /> : (
                                    <>
                                        <Fingerprint size={24} /> {activeTool === 'ECAC' ? 'Executar Diagnóstico Fiscal Federal' : 'Realizar Busca no Banco de Dados'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-black/20">
                    
                    {error && (
                        <div className="max-w-4xl mx-auto p-10 bg-red-500/10 border border-red-500/20 rounded-[44px] flex flex-col md:flex-row items-center gap-8 text-red-500 animate-in shake duration-500">
                            <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center"><ShieldAlert size={48} /></div>
                            <div>
                                <h4 className="font-black uppercase text-lg tracking-[0.2em]">Incidente de Segurança / Erro</h4>
                                <p className="font-bold text-sm mt-2 opacity-80 leading-relaxed">{error}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-4 text-red-400/60">Verifique suas credenciais na aba Integrações</p>
                            </div>
                        </div>
                    )}

                    {activeTool === 'CALC' && (
                        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in">
                            <div className="text-center space-y-4">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Simulador Simples Nacional</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Base de cálculo: Faixa 1 (até R$ 180.000 anuais)</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8 bg-white/[0.02] border border-white/5 p-10 rounded-[44px] shadow-2xl">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Faturamento Mensal (R$)</label>
                                        <div className="relative group">
                                            <DollarIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={24} />
                                            <input 
                                                type="number"
                                                value={calcFaturamento}
                                                onChange={e => setCalcFaturamento(Number(e.target.value))}
                                                className="w-full pl-16 pr-8 py-6 rounded-3xl bg-black/40 border border-white/10 outline-none text-2xl font-black text-white focus:border-indigo-600 transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Atividade Econômica (Anexo)</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 1, label: 'Comércio' },
                                                { id: 2, label: 'Indústria' },
                                                { id: 3, label: 'Serviços I' },
                                                { id: 4, label: 'Serviços II' },
                                                { id: 5, label: 'Serviços III' },
                                            ].map(an => (
                                                <button
                                                    key={an.id}
                                                    onClick={() => setCalcAnexo(an.id)}
                                                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${calcAnexo === an.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'}`}
                                                >
                                                    {an.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {simplesResult ? (
                                        <div className="p-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[44px] shadow-2xl space-y-8 animate-in zoom-in">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Imposto Estimado (DAS)</p>
                                                    <h4 className="text-5xl font-black text-white mt-1">R$ {simplesResult.imposto.toLocaleString('pt-BR')}</h4>
                                                </div>
                                                <div className="p-4 bg-white/20 rounded-2xl text-white"><Percent size={24}/></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/20">
                                                <div>
                                                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Alíquota Efetiva</p>
                                                    <p className="text-xl font-black text-white">{simplesResult.percentual.toFixed(2)}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Saldo Líquido</p>
                                                    <p className="text-xl font-black text-white">R$ {simplesResult.liquido.toLocaleString('pt-BR')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full border-2 border-dashed border-white/5 rounded-[44px] flex flex-col items-center justify-center p-12 text-center opacity-30">
                                            <Calculator size={64} className="mb-6" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Insira os valores para simular</p>
                                        </div>
                                    )}
                                    <div className="p-8 bg-black/40 rounded-[32px] border border-white/5 flex items-center gap-6">
                                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-500"><TrendingUp size={24}/></div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">Este simulador utiliza a tabela oficial do Simples Nacional 2024 para empresas com receita bruta anual de até R$ 180.000.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTool === 'ECAC' && ecacResult && (
                        <div className="max-w-6xl mx-auto space-y-12 animate-in slide-up duration-500 pb-20">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/5 pb-12 gap-8">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-[0.4em] bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/20">
                                        <ShieldAlert size={14}/> Diagnóstico Fiscal em Tempo Real
                                    </div>
                                    <h3 className="text-5xl font-black text-white tracking-tighter uppercase">{ecacResult.nome}</h3>
                                    <div className="flex items-center gap-6 text-gray-500 font-black text-lg">
                                        <span className="tracking-[0.2em]">{ecacResult.cnpj}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                                        <span className="text-indigo-400">ECAC ATIVO</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center xl:items-end gap-4">
                                    <div className={`px-12 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] border-2 shadow-2xl transition-all ${ecacResult.certidao_negativa ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-emerald-500/10' : 'bg-red-500/10 border-red-500/40 text-red-500 shadow-red-500/10'}`}>
                                        CERTIDÃO: {ecacResult.certidao_negativa ? 'NEGATIVA (REGULAR)' : 'COM PENDÊNCIAS'}
                                    </div>
                                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={12}/> Última Consulta: {new Date(ecacResult.data_hora_consulta).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                            {/* ... Rest of ECAC rendering from previous code ... */}
                        </div>
                    )}
                    {/* ... Rest of existing tool rendering ... */}
                </div>
            </div>
        </div>
    );
};
