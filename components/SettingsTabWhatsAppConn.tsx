
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { whatsAppService } from '../services/whatsappService';
import { 
    QrCode, RefreshCw, Power, Smartphone, ShieldCheck, 
    AlertCircle, CheckCircle2, LogOut, Loader2, Zap, X,
    Maximize2, RefreshCcw
} from 'lucide-react';

interface Props {
    currentUser: User;
}

export const SettingsTabWhatsAppConn: React.FC<Props> = ({ currentUser }) => {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'CONNECTED' | 'DISCONNECTED' | 'QR_READY' | 'ERROR'>('IDLE');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    
    const instanceName = `crm_${currentUser.id}`;

    const fetchQR = useCallback(async () => {
        setStatus('LOADING');
        const qr = await whatsAppService.getConnectQR(instanceName);
        if (qr) {
            setQrCode(qr);
            setStatus('QR_READY');
            setLastUpdate(new Date());
        } else {
            setStatus('ERROR');
            setErrorMsg("Não foi possível buscar o código. Verifique se a instância está ativa.");
        }
    }, [instanceName]);

    const handleGenerateQR = async () => {
        setStatus('LOADING');
        setErrorMsg(null);

        // Verifica estado atual
        const state = await whatsAppService.checkConnectionState(instanceName);

        if (state === 'NOT_FOUND') {
            const created = await whatsAppService.createInstance(instanceName);
            if (!created) {
                setStatus('ERROR');
                setErrorMsg("Falha ao criar instância no servidor Evolution.");
                return;
            }
        } else if (state === 'open') {
            setStatus('CONNECTED');
            return;
        }

        // Busca o QR após garantir que instância existe
        await fetchQR();
    };

    const handleRefreshQR = async () => {
        await fetchQR();
    };

    const initializeStatus = useCallback(async () => {
        setStatus('LOADING');
        const state = await whatsAppService.checkConnectionState(instanceName);
        if (state === 'open') {
            setStatus('CONNECTED');
        } else {
            setStatus('IDLE');
        }
    }, [instanceName]);

    useEffect(() => {
        initializeStatus();
    }, [initializeStatus]);

    // Polling apenas se estiver conectado para manter sync ou se estiver no QR para detectar leitura
    useEffect(() => {
        let interval: any;
        if (status === 'QR_READY' || status === 'CONNECTED') {
            interval = setInterval(async () => {
                const state = await whatsAppService.checkConnectionState(instanceName);
                if (state === 'open' && status !== 'CONNECTED') {
                    setStatus('CONNECTED');
                    setQrCode(null);
                } else if (state !== 'open' && status === 'CONNECTED') {
                    setStatus('IDLE');
                }
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [status, instanceName]);

    const handleLogout = async () => {
        if (window.confirm("Deseja realmente desconectar o WhatsApp?")) {
            setStatus('LOADING');
            await whatsAppService.logoutInstance(instanceName);
            setStatus('IDLE');
            setQrCode(null);
        }
    };

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Gateway WhatsApp</h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2">Evolution API v1.8.2 • Instância: {instanceName}</p>
                </div>
                <div className={`px-6 py-2 rounded-full border flex items-center gap-2 transition-colors duration-500 ${status === 'CONNECTED' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' : 'bg-red-500/10 border-red-500/40 text-red-500'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{status === 'CONNECTED' ? 'Conectado' : 'Desconectado'}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-black/20">
                <div className="max-w-4xl mx-auto h-full flex flex-col items-center">
                    
                    {status === 'LOADING' && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest text-center">Processando requisição no servidor...</p>
                        </div>
                    )}

                    {status === 'IDLE' && (
                        <div className="bg-[#121214] border border-white/5 rounded-[50px] p-16 flex flex-col items-center text-center shadow-2xl animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center text-gray-600 mb-8">
                                <QrCode size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">Pronto para Conectar</h3>
                            <p className="text-gray-500 font-bold text-sm max-w-xs mb-10 leading-relaxed uppercase">Vincule o dispositivo do escritório para habilitar envios automáticos e chat integrado.</p>
                            
                            <button 
                                onClick={handleGenerateQR}
                                className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Zap size={18} /> Gerar QR Code
                            </button>
                        </div>
                    )}

                    {status === 'CONNECTED' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in zoom-in duration-500">
                            <div className="bg-[#121214] border border-white/5 rounded-[44px] p-10 flex flex-col items-center text-center space-y-8 shadow-2xl">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                                    <Smartphone size={48} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Escritório Online</h3>
                                    <p className="text-sm text-gray-500 mt-2 font-medium">Seu WhatsApp está pronto para enviar guias e relatórios automaticamente.</p>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="px-10 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                    <LogOut size={14} /> Desconectar Dispositivo
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-indigo-600/5 border border-indigo-500/10 p-8 rounded-[40px] space-y-4">
                                    <div className="flex items-center gap-3 text-indigo-500">
                                        <ShieldCheck size={24} />
                                        <h4 className="text-xs font-black text-white uppercase tracking-tight">Segurança Ativa</h4>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase">Sincronização em tempo real via Baileys v6 habilitada com sucesso.</p>
                                </div>
                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px]">
                                    <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Diagnóstico de Gateway</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                            <p className="text-[8px] font-black text-gray-500 uppercase">Uptime</p>
                                            <p className="text-sm font-black text-white">99.9%</p>
                                        </div>
                                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                            <p className="text-[8px] font-black text-gray-500 uppercase">Sinal</p>
                                            <p className="text-sm font-black text-emerald-500">Excelente</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'QR_READY' && qrCode && (
                        <div className="bg-[#121214] border border-white/5 rounded-[50px] p-12 flex flex-col items-center text-center shadow-2xl animate-in fade-in duration-700 relative w-full max-w-2xl">
                            <div className="mb-10">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Vincular Dispositivo</h3>
                                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2">Aguardando leitura do QR Code</p>
                            </div>
                            
                            <div className="p-8 bg-white rounded-[40px] shadow-[0_20px_80px_rgba(99,102,241,0.2)] border-[12px] border-gray-100 mb-10 relative">
                                <img src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} alt="WhatsApp QR Code" className="w-64 h-64" />
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-tighter animate-pulse shadow-xl">
                                    Pareamento Ativo
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <button 
                                    onClick={handleRefreshQR}
                                    className="px-8 py-4 bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <RefreshCcw size={16} /> Atualizar QR Code
                                </button>
                                <button 
                                    onClick={() => { setQrCode(null); setStatus('IDLE'); }}
                                    className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <X size={16} /> Cancelar
                                </button>
                            </div>

                            {lastUpdate && (
                                <p className="mt-8 text-[9px] text-gray-700 font-black uppercase tracking-widest">
                                    Última atualização: {lastUpdate.toLocaleTimeString()}
                                </p>
                            )}

                            <div className="mt-12 w-full max-w-sm flex items-start gap-4 text-left p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl"><Zap size={20}/></div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase">Instruções</p>
                                    <p className="text-[10px] text-gray-500 font-medium mt-1">Abra o WhatsApp > Aparelhos Conectados > Conectar um Aparelho. Aponte a câmera para o código acima.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'ERROR' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-[44px] p-16 text-center space-y-6 max-w-xl">
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Ocorreu um Erro</h3>
                                <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">{errorMsg || "Não foi possível realizar a operação no Gateway."}</p>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button 
                                    onClick={initializeStatus} 
                                    className="px-8 py-4 bg-white/5 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                                >
                                    Voltar
                                </button>
                                <button 
                                    onClick={handleGenerateQR} 
                                    className="px-10 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all"
                                >
                                    Tentar Novamente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
