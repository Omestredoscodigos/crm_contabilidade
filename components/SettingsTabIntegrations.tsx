
import React, { useState } from 'react';
import { GoogleCalendarConfig } from '../types';
import { RefreshCw, Save, Globe, Key, Lock, Database, CheckCircle2, Info, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { googleCalendarService } from '../services/googleCalendarService';

interface IntegrationsProps {
    googleConfig: GoogleCalendarConfig;
    setGoogleConfig: (config: GoogleCalendarConfig) => void;
    onSave: () => void;
    isSaving: boolean;
}

export const SettingsTabIntegrations: React.FC<IntegrationsProps> = ({ 
    googleConfig, setGoogleConfig, onSave, isSaving 
}) => {
    const [connError, setConnError] = useState<string | null>(null);
    const [localIsSaving, setLocalIsSaving] = useState(false);

    const handleConnect = async () => {
        setConnError(null);
        setLocalIsSaving(true);
        
        try {
            // Tenta o processo de autenticação OAuth2 real
            const success = await googleCalendarService.connectAndValidate(googleConfig);
            if (success) {
                // Se funcionou, salva globalmente
                onSave();
            }
        } catch (err: any) {
            console.error("Erro de conexão:", err);
            setConnError(err.message || "Erro na autenticação. Verifique o Client ID e a API Key.");
            setGoogleConfig({ ...googleConfig, connected: false });
        } finally {
            setLocalIsSaving(false);
        }
    };

    const isConnected = googleConfig.connected;

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Integrações Externas</h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2">Conecte sua agenda e serviços auxiliares</p>
                </div>
                
                <div className="flex items-center gap-4">
                    {isConnected && (
                        <button 
                            onClick={() => {
                                const newConf = { ...googleConfig, connected: false };
                                setGoogleConfig(newConf);
                                googleCalendarService.saveConfig(newConf);
                            }}
                            className="px-6 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                        >
                            Desconectar
                        </button>
                    )}
                    <button 
                        onClick={handleConnect} 
                        disabled={isSaving || localIsSaving}
                        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {(isSaving || localIsSaving) ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} 
                        {isConnected ? 'Atualizar e Sincronizar' : 'Salvar e Conectar'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-black/20">
                
                {connError && (
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center gap-4 text-red-500 animate-in shake">
                        <AlertTriangle size={24} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Erro na Conexão</p>
                            <p className="text-xs font-bold mt-1 opacity-80">{connError}</p>
                        </div>
                    </div>
                )}

                {/* Google Calendar Section */}
                <div className={`p-10 border-2 transition-all duration-500 rounded-[44px] flex flex-col xl:flex-row gap-12 ${isConnected ? 'bg-indigo-600/5 border-indigo-600/30' : 'bg-white/[0.02] border-white/5'}`}>
                    <div className="max-w-xs space-y-5">
                        <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center shadow-2xl transition-all duration-700 ${isConnected ? 'bg-indigo-600 text-white rotate-6 scale-110' : 'bg-white/5 text-gray-700'}`}>
                            <Globe size={48} className={(isSaving || localIsSaving) ? 'animate-spin' : ''} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Google Calendar</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed mt-2">
                                Ative a sincronização bidirecional em tempo real para gerenciar prazos diretamente na nuvem.
                            </p>
                        </div>
                        {isConnected ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/20">
                                    <ShieldCheck size={14} /> Conexão Verificada com Sucesso
                                </div>
                                <p className="text-[9px] text-gray-600 font-bold uppercase ml-2 tracking-widest italic">Dados sincronizando em background...</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-600 font-black text-[10px] uppercase tracking-widest">
                                <Info size={14} /> Aguardando Credenciais Válidas
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Key size={12}/> Client ID (OAuth 2.0)
                                </label>
                                <input 
                                    type="text" 
                                    value={googleConfig.clientId} 
                                    onChange={e => setGoogleConfig({...googleConfig, clientId: e.target.value})} 
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-xs font-mono text-indigo-400 outline-none focus:border-indigo-600 transition-all shadow-inner" 
                                    placeholder="458...apps.googleusercontent.com" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Lock size={12}/> API Key Pública
                                </label>
                                <input 
                                    type="password" 
                                    value={googleConfig.apiKey} 
                                    onChange={e => setGoogleConfig({...googleConfig, apiKey: e.target.value})} 
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-xs font-mono text-indigo-400 outline-none focus:border-indigo-600 transition-all shadow-inner" 
                                    placeholder="AIzaSy...jU" 
                                />
                            </div>
                            
                            <div className="p-6 bg-indigo-600/10 rounded-[28px] border border-indigo-600/20">
                                <h5 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><ShieldCheck size={12}/> Privacidade</h5>
                                <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tight">O sistema não armazena sua senha do Google. A conexão é feita via tokens encriptados de curta duração.</p>
                            </div>
                        </div>
                        
                        <div className="p-10 bg-white/[0.01] rounded-[44px] border border-white/5 space-y-6">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Info size={16} className="text-indigo-500" /> Guia de Ativação
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { step: '1', text: 'Vá ao Google Cloud Console', link: 'https://console.cloud.google.com' },
                                    { step: '2', text: 'Habilite "Google Calendar API"', link: null },
                                    { step: '3', text: 'Crie um "ID do Cliente OAuth" (Tipo: App Web)', link: null },
                                    { step: '4', text: 'Adicione este domínio às origens autorizadas', link: null }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white text-[10px] font-black border border-white/10 group-hover:bg-indigo-600 transition-colors">{item.step}</div>
                                        <div className="flex-1">
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">{item.text}</p>
                                            {item.link && <a href={item.link} target="_blank" className="text-[9px] text-indigo-500 hover:underline flex items-center gap-1 mt-0.5">Acessar Console <ExternalLink size={8}/></a>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Módulo de Integração Fiscal */}
                <div className="p-12 bg-white/[0.01] border border-dashed border-white/5 rounded-[50px] flex items-center justify-center py-24 opacity-30 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:via-indigo-500/[0.02] transition-all duration-1000"></div>
                    <div className="text-center space-y-4 relative z-10">
                        <Database size={48} className="mx-auto text-gray-700" />
                        <h4 className="text-sm font-black text-gray-500 uppercase tracking-[0.4em]">API de Serviços Fiscais</h4>
                        <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Em Breve: Importação Automática de XML e eSocial</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
