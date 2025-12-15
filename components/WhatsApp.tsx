import React, { useState, useEffect, useCallback } from 'react';
import { WhatsAppConnectionState, CompanyProfile, Client, Lead, Task, Pipeline, ChatConversation } from '../types';
import { whatsAppService } from '../services/whatsappService';
import { 
    Smartphone, Zap, Loader2, RefreshCcw, 
    X, CheckCircle2, ShieldCheck, LogOut, Info,
    MonitorSmartphone, Wifi, MessageSquare
} from 'lucide-react';
import { WhatsAppChat } from './WhatsAppChat';

interface WhatsAppProps {
    companyProfile: CompanyProfile;
    clients: Client[];
    leads: Lead[];
    tasks: Task[];
    pipelines: Pipeline[];
    onAddTask: (task: Omit<Task, 'id'>) => void;
    conversations: ChatConversation[];
    onUpdateConversations: (conversations: ChatConversation[]) => void;
}

export const WhatsApp: React.FC<WhatsAppProps> = ({ companyProfile, clients, leads, conversations, onUpdateConversations }) => {
    const instanceName = `crm_${companyProfile.cnpj.replace(/\D/g, '')}`;
    const [status, setStatus] = useState<WhatsAppConnectionState>('LOADING');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const checkStatus = useCallback(async () => {
        if (isActionLoading) return;
        const state = await whatsAppService.checkConnectionState(instanceName);
        if (state === 'open') {
            setStatus('CONNECTED');
            setQrCode(null);
        } else if (status === 'CONNECTED' && state !== 'open') {
            setStatus('DISCONNECTED');
        } else if (status !== 'QR_READY' && status !== 'LOADING') {
            setStatus('DISCONNECTED');
        }
    }, [instanceName, status, isActionLoading]);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 15000);
        return () => clearInterval(interval);
    }, [checkStatus]);

    const handleConnect = async () => {
        setIsActionLoading(true);
        setStatus('LOADING');
        try {
            await whatsAppService.createInstance(instanceName);
            const qr = await whatsAppService.getConnectQR(instanceName);
            if (qr) {
                setQrCode(qr);
                setStatus('QR_READY');
            } else {
                const state = await whatsAppService.checkConnectionState(instanceName);
                if (state === 'open') setStatus('CONNECTED');
                else setStatus('DISCONNECTED');
            }
        } catch (err) {
            setStatus('DISCONNECTED');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleLogout = async () => {
        if (window.confirm("Deseja realmente desconectar o dispositivo? Isso interromperá as automações vinculadas a este CNPJ.")) {
            setIsActionLoading(true);
            try {
                await whatsAppService.logoutInstance(instanceName);
                await whatsAppService.deleteInstance(instanceName);
                setStatus('DISCONNECTED');
                setQrCode(null);
            } catch (e) {
                console.error("Erro ao desconectar", e);
                setStatus('DISCONNECTED');
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    const handleRefreshQR = async () => {
        setIsActionLoading(true);
        const qr = await whatsAppService.getConnectQR(instanceName);
        if (qr) setQrCode(qr);
        setIsActionLoading(false);
    };

    return (
        <div className="h-full flex items-start justify-center p-4 md:p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-4xl">
                
                {(status === 'LOADING' || isActionLoading) && (
                    <div className="bg-white dark:bg-[#09090b] border border-gray-100 dark:border-white/5 rounded-[32px] p-12 flex flex-col items-center justify-center space-y-4 shadow-xl">
                        <Loader2 size={32} className="text-indigo-500 animate-spin" />
                        <div className="text-center">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Sincronizando</h3>
                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mt-1">Comunicando com o Gateway Evolution</p>
                        </div>
                    </div>
                )}

                {status === 'DISCONNECTED' && !isActionLoading && (
                    <div className="bg-white dark:bg-[#111b21] border border-gray-100 dark:border-white/5 rounded-[40px] p-10 flex flex-col items-center text-center shadow-xl animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-white/5 rounded-[20px] flex items-center justify-center text-indigo-500 dark:text-gray-600 mb-6 shadow-inner">
                            <Smartphone size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase mb-3">WhatsApp Offline</h3>
                        <p className="text-gray-500 font-bold text-xs max-w-sm mb-8 uppercase tracking-wider leading-relaxed">
                            Vincule o dispositivo para habilitar o envio automático de DAS, folhas de pagamento e lembretes aos clientes.
                        </p>
                        <button 
                            onClick={handleConnect}
                            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-900/20 transition-all active:scale-95 flex items-center gap-3 group"
                        >
                            <Zap size={16} className="group-hover:animate-pulse" /> Vincular Agora
                        </button>
                    </div>
                )}

                {status === 'QR_READY' && qrCode && !isActionLoading && (
                    <div className="bg-white dark:bg-[#111b21] border border-gray-100 dark:border-white/5 rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-10 shadow-xl animate-in slide-up duration-500">
                        <div className="flex-1 space-y-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Pareamento</h3>
                                <p className="text-indigo-500 font-black uppercase text-[9px] tracking-widest mt-1 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div> Aguardando Sensor
                                </p>
                            </div>

                            <ul className="space-y-3">
                                {[
                                    'Abra o WhatsApp no celular',
                                    'Vá em Aparelhos Conectados',
                                    'Selecione Conectar um Aparelho',
                                    'Aponte para o código ao lado'
                                ].map((step, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-500 dark:text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                                        <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white text-[9px] font-black border border-gray-200 dark:border-white/10">{i + 1}</div>
                                        {step}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-3 pt-2">
                                <button onClick={handleRefreshQR} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                                    <RefreshCcw size={12}/> Novo QR
                                </button>
                                <button onClick={() => setStatus('DISCONNECTED')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                                    <X size={12}/> Cancelar
                                </button>
                            </div>
                        </div>

                        <div className="relative shrink-0">
                            <div className="p-6 bg-white rounded-[32px] shadow-lg border-[8px] border-gray-50 dark:border-gray-900">
                                <img src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} alt="QR Code" className="w-56 h-56 object-contain" />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-900 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 shadow-xl">
                                <MonitorSmartphone size={12} className="text-indigo-500" />
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Leitor Ativo</span>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'CONNECTED' && !isActionLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in zoom-in duration-500 items-start">
                        <div className="md:col-span-7 bg-white dark:bg-[#111b21] border border-gray-100 dark:border-white/5 rounded-[40px] p-8 flex flex-col items-center text-center shadow-lg">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                                <CheckCircle2 size={32} strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">Pareamento Ativo</h3>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8">Dispositivo Sincronizado</p>
                            
                            <div className="w-full grid grid-cols-2 gap-3 mb-8">
                                <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl text-left">
                                    <p className="text-[7px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Identificador</p>
                                    <p className="text-[10px] font-black text-gray-900 dark:text-white truncate">{instanceName}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl text-left">
                                    <p className="text-[7px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Status Rede</p>
                                    <p className="text-[10px] font-black text-emerald-500 flex items-center gap-2 uppercase">
                                        <Wifi size={12}/> Seguro
                                    </p>
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                <button 
                                    onClick={() => setIsChatOpen(true)}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                                >
                                    <MessageSquare size={18} className="group-hover:rotate-12 transition-transform" /> Abrir Mensagens
                                </button>
                                
                                <button 
                                    onClick={handleLogout}
                                    className="w-full py-4 bg-red-500/5 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 border border-red-500/10"
                                >
                                    <LogOut size={14} /> Desconectar Canal
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-5 flex flex-col gap-4">
                            <div className="p-6 bg-indigo-600 rounded-[32px] space-y-4 shadow-xl group">
                                <div className="flex items-center gap-3 text-white">
                                    <ShieldCheck size={24} />
                                    <h4 className="text-xs font-black uppercase tracking-tight">Canal Verificado</h4>
                                </div>
                                <p className="text-[10px] text-white/70 leading-relaxed font-bold uppercase tracking-wider">
                                    Criptografia total via Evolution API habilitada para envios de baixa latência e automação fiscal.
                                </p>
                            </div>

                            <div className="p-6 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[32px] flex items-center gap-4 shadow-sm">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 shrink-0">
                                    <Info size={20}/>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Ativo</h4>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Notificações configuradas.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isChatOpen && (
                    <WhatsAppChat 
                        instanceName={instanceName} 
                        currentUser={{ id: '1', name: 'Ana Admin', email: 'admin@crm.com', role: 'ADMIN', avatar: '', permissions: {} as any }} 
                        onClose={() => setIsChatOpen(false)} 
                        clients={clients}
                        leads={leads}
                        conversations={conversations}
                        onUpdateConversations={onUpdateConversations}
                    />
                )}

            </div>
        </div>
    );
};