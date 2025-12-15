
import React, { useState, useMemo, useEffect } from 'react';
import { AuditLogEntry, LogBackup, AuditAction, User } from '../types';
import { 
    FileSpreadsheet, RotateCcw, DatabaseBackup, Timer, Search, 
    ArrowRight, CheckCircle2, Building2, Users, LogIn, 
    Settings as SettingsIcon, Info, Download, Trash2, Filter, AlertTriangle, Undo2, UserX
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface AuditProps {
    auditLogs: AuditLogEntry[];
    auditLogBackup: LogBackup | null;
    onClearLogs: () => void;
    onRestoreLogs: () => void;
    onUndoAction?: (log: AuditLogEntry) => void;
    currentUser: User;
}

export const SettingsTabAudit: React.FC<AuditProps> = ({ auditLogs, auditLogBackup, onClearLogs, onRestoreLogs, onUndoAction, currentUser }) => {
    const [logSearch, setLogSearch] = useState('');
    const [logActionFilter, setLogActionFilter] = useState<string>('ALL');
    const [timeLeft, setTimeLeft] = useState<string>('');

    // Timer de Expiração do Backup (24h)
    useEffect(() => {
        if (!auditLogBackup) return;
        const checkExpiration = () => {
            const clearedAt = new Date(auditLogBackup.clearedAt).getTime();
            const now = new Date().getTime();
            const diff = 24 * 60 * 60 * 1000 - (now - clearedAt);
            
            if (diff <= 0) {
                setTimeLeft('Expirado');
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours}h ${mins}m restantes`);
            }
        };

        checkExpiration();
        const interval = setInterval(checkExpiration, 10000);
        return () => clearInterval(interval);
    }, [auditLogBackup]);

    // Lógica de Filtro e Busca
    const filteredLogs = useMemo(() => {
        return auditLogs.filter(log => {
            const searchLower = logSearch.toLowerCase();
            const matchesSearch = 
                log.targetName.toLowerCase().includes(searchLower) || 
                log.userName.toLowerCase().includes(searchLower) ||
                (log.details || '').toLowerCase().includes(searchLower);
            
            const matchesAction = logActionFilter === 'ALL' || log.action === logActionFilter;
            
            return matchesSearch && matchesAction;
        });
    }, [auditLogs, logSearch, logActionFilter]);

    // Exportação Excel
    const downloadLogsExcel = (logsToDownload: AuditLogEntry[], filenameSuffix: string = '') => {
        if (logsToDownload.length === 0) return;
        const data = logsToDownload.map(log => ({
            "Data/Hora": new Date(log.timestamp).toLocaleString('pt-BR'),
            "Usuário": log.userName,
            "Ação": getLogActionLabel(log.action),
            "Objeto": log.targetName,
            "Status": log.reverted ? 'REVERTIDO' : 'ATIVO',
            "Detalhes": log.details || ""
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
        XLSX.writeFile(workbook, `logs_auditoria${filenameSuffix}.xlsx`);
    };

    const getLogActionLabel = (action: AuditAction) => {
        const map: Record<string, string> = {
            'TASK_CREATE': 'Criação de Tarefa', 
            'TASK_DELETE': 'Exclusão de Tarefa', 
            'TASK_UPDATE': 'Edição de Tarefa', 
            'TASK_COMPLETE': 'Conclusão de Tarefa',
            'CLIENT_CREATE': 'Cadastro de Cliente', 
            'CLIENT_DELETE': 'Remoção de Cliente', 
            'CLIENT_UPDATE': 'Edição de Cliente',
            'USER_INVITE': 'Convite de Membro', 
            'USER_DELETE': 'Remoção de Usuário', 
            'SETTINGS_CHANGE': 'Alteração de Sistema', 
            'LOGIN': 'Acesso Realizado',
            'ACTION_UNDO': 'Reversão de Ação'
        };
        return map[action] || action;
    };

    const getLogIcon = (action: AuditAction) => {
        if (action.includes('TASK')) return <CheckCircle2 size={16} />;
        if (action.includes('CLIENT')) return <Building2 size={16} />;
        if (action.includes('USER')) return <Users size={16} />;
        if (action.includes('LOGIN')) return <LogIn size={16} />;
        if (action.includes('SETTINGS')) return <SettingsIcon size={16} />;
        if (action === 'ACTION_UNDO') return <Undo2 size={16} />;
        return <Info size={16} />;
    };

    const isUndoable = (log: AuditLogEntry) => {
        // Ações que podem ser desfeitas (exclusões ou criações) e que possuem o snapshot (undoData)
        const revertible = ['TASK_CREATE', 'TASK_DELETE', 'CLIENT_CREATE', 'CLIENT_DELETE', 'USER_DELETE'];
        return revertible.includes(log.action) && !!log.undoData && !log.reverted;
    };

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="px-10 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                        Auditagem de Sistema
                    </h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-2">Segurança e rastreabilidade total de operações</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => downloadLogsExcel(auditLogs)} 
                        className="flex items-center gap-3 px-6 py-4 bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                    >
                        <FileSpreadsheet size={18} className="text-emerald-500" /> Exportar Excel
                    </button>
                    <button 
                        onClick={onClearLogs} 
                        className="flex items-center gap-3 px-6 py-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20"
                    >
                        <RotateCcw size={18} /> Zerar Base
                    </button>
                </div>
            </div>

            {/* Backup Alert */}
            {auditLogBackup && (
                <div className="mx-10 mb-8 p-8 bg-indigo-600/10 border-2 border-dashed border-indigo-500/30 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            <DatabaseBackup size={32}/>
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">Backup temporário ativo</h4>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                                {timeLeft} | {auditLogBackup.logs.length} Registros Preservados
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onRestoreLogs} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-indigo-500 transition-all">Restaurar Agora</button>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="px-10 pb-8 flex flex-col xl:flex-row items-center gap-4">
                <div className="flex-1 relative group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                    <input 
                        placeholder="Pesquisar por usuário, objeto ou detalhe..." 
                        value={logSearch} 
                        onChange={e => setLogSearch(e.target.value)} 
                        className="w-full pl-16 pr-8 py-5 rounded-[28px] bg-white/[0.02] border border-white/5 outline-none font-bold text-sm text-white focus:border-indigo-500/40 transition-all placeholder:text-gray-700" 
                    />
                </div>
                <div className="relative w-full xl:w-64">
                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <select 
                        value={logActionFilter} 
                        onChange={e => setLogActionFilter(e.target.value)} 
                        className="w-full pl-12 pr-10 py-5 bg-white/[0.02] text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-[28px] border border-white/5 outline-none appearance-none cursor-pointer hover:bg-white/[0.04]"
                    >
                        <option value="ALL">Todas Atividades</option>
                        <option value="TASK_DELETE">Remoções de Tarefas</option>
                        <option value="CLIENT_DELETE">Remoções de Clientes</option>
                        <option value="USER_DELETE">Remoções de Equipe</option>
                        <option value="LOGIN">Acessos ao Sistema</option>
                        <option value="ACTION_UNDO">Reversões Realizadas</option>
                    </select>
                </div>
            </div>

            {/* Lista de Logs (Layout Fiel à Imagem) */}
            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar space-y-4">
                {filteredLogs.length > 0 ? filteredLogs.map((log, idx) => (
                    <div 
                        key={log.id} 
                        className={`group p-6 bg-white/[0.01] border border-white/5 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-500/30 hover:bg-white/[0.03] transition-all duration-300 animate-in fade-in slide-up ${log.reverted ? 'opacity-40 grayscale' : ''}`}
                        style={{ animationDelay: `${idx * 15}ms` }}
                    >
                        <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center border transition-all duration-500 ${
                                log.action.includes('DELETE') || log.type === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                log.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                            }`}>
                                {log.action === 'USER_DELETE' ? <UserX size={18} /> : getLogIcon(log.action)}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                        log.action.includes('DELETE') ? 'bg-red-500/5 text-red-400 border-red-500/10' :
                                        log.type === 'SUCCESS' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' :
                                        'bg-indigo-500/5 text-indigo-400 border-indigo-500/10'
                                    }`}>
                                        {getLogActionLabel(log.action)} {log.reverted && '(REVERTIDO)'}
                                    </span>
                                    <ArrowRight size={12} className="text-gray-800"/>
                                    <span className="text-sm font-black text-white tracking-tight">{log.targetName}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <img src={log.userAvatar} className="w-4 h-4 rounded-full object-cover" />
                                        <p className="text-[10px] font-bold text-gray-500">{log.userName}</p>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-gray-800"></div>
                                    <p className="text-[10px] text-gray-600 font-bold">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            {/* BOTÃO DESFAZER (EXCLUSIVO ADMIN E PARA AÇÕES REVERSÍVEIS) */}
                            {currentUser.role === 'ADMIN' && isUndoable(log) && onUndoAction && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onUndoAction(log); }}
                                    className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-indigo-500/20 active:scale-95 group/undo shadow-xl shadow-indigo-600/5"
                                >
                                    <Undo2 size={14} className="group-hover/undo:rotate-[-45deg] transition-transform" />
                                    Restaurar Exclusão
                                </button>
                            )}
                            
                            {log.details && !isUndoable(log) && (
                                <div className="hidden xl:flex bg-black/20 px-4 py-2 rounded-xl border border-white/[0.02] items-center gap-2 max-w-xs">
                                    <Info size={12} className="text-gray-700 shrink-0" />
                                    <span className="text-[9px] font-medium text-gray-500 leading-relaxed truncate">{log.details}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-32 opacity-20 grayscale">
                        <Search size={48} className="text-gray-400 mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 text-center">Nenhum registro encontrado</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-10 py-6 border-t border-white/5 bg-black/20 flex items-center gap-3">
                <AlertTriangle size={14} className="text-gray-700" />
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                    Ações de exclusão podem ser revertidas pelo Administrador em até 90 dias após o evento.
                </p>
            </div>
        </div>
    );
};
