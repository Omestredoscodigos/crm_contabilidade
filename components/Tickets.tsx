
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority, Client, User, TicketMessage } from '../types';
import { 
    LifeBuoy, Search, Filter, Plus, Clock, MessageCircle, 
    User as UserIcon, Building2, AlertCircle, CheckCircle2, 
    MoreVertical, Send, ChevronRight, X, Inbox, UserCheck, 
    MessageSquare, History, ArrowRight, ShieldAlert, Tag,
    UserPlus, CheckCircle, Hourglass, Paperclip
} from 'lucide-react';

export const Tickets: React.FC<{ clients: Client[], users: User[], currentUser: User }> = ({ clients, users, currentUser }) => {
    // Estado inicial com alguns dados para demonstração
    const [tickets, setTickets] = useState<Ticket[]>([
        {
            id: 'tk-1',
            clientId: 'c1',
            clientName: 'Tech Solutions',
            subject: 'Dúvida sobre Folha de Pagamento',
            description: 'Não conseguimos conciliar o valor do FGTS deste mês.',
            status: 'OPEN',
            priority: 'HIGH',
            category: 'FISCAL',
            assigneeId: '2',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [
                {
                    id: 'm1',
                    senderId: 'client-1',
                    senderName: 'João Silva',
                    senderAvatar: 'https://ui-avatars.com/api/?name=JS&background=6366f1&color=fff',
                    text: 'Olá, preciso de ajuda com a guia de FGTS que veio com valor divergente.',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    isInternal: false
                }
            ]
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<TicketStatus | 'ALL'>('ALL');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Estado do Formulário de Novo Ticket
    const [newTicketData, setNewTicketData] = useState({
        clientId: '',
        subject: '',
        description: '',
        priority: 'MEDIUM' as TicketPriority,
        category: 'OTHER' as Ticket['category']
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedTicketId, tickets]);

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 t.clientName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [tickets, searchTerm, filterStatus]);

    const activeTicket = tickets.find(t => t.id === selectedTicketId);

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        const client = clients.find(c => c.id === newTicketData.clientId);
        if (!client) return;

        const newTicket: Ticket = {
            id: 'tk-' + Date.now(),
            clientId: client.id,
            clientName: client.name,
            subject: newTicketData.subject,
            description: newTicketData.description,
            status: 'OPEN',
            priority: newTicketData.priority,
            category: newTicketData.category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: []
        };

        setTickets([newTicket, ...tickets]);
        setIsCreateModalOpen(false);
        setNewTicketData({ clientId: '', subject: '', description: '', priority: 'MEDIUM', category: 'OTHER' });
        setSelectedTicketId(newTicket.id);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedTicketId) return;
        
        const msg: TicketMessage = {
            id: 'm-' + Date.now(),
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            text: newMessage,
            timestamp: new Date().toISOString(),
            isInternal: false
        };

        setTickets(tickets.map(t => t.id === selectedTicketId ? { 
            ...t, 
            messages: [...t.messages, msg], 
            updatedAt: new Date().toISOString(),
            status: t.status === 'OPEN' ? 'IN_PROGRESS' : t.status
        } : t));
        
        setNewMessage('');
    };

    const updateTicketStatus = (id: string, status: TicketStatus) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
    };

    const assignTicket = (id: string, userId: string) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, assigneeId: userId, updatedAt: new Date().toISOString() } : t));
    };

    const getPriorityColor = (p: TicketPriority) => {
        switch(p) {
            case 'URGENT': return 'bg-red-500 shadow-red-500/40';
            case 'HIGH': return 'bg-orange-500 shadow-orange-500/40';
            case 'MEDIUM': return 'bg-indigo-500 shadow-indigo-500/40';
            default: return 'bg-gray-400 shadow-gray-400/40';
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700">
            {/* HEADER COM DASHBOARD RÁPIDO */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                        Suporte Elite
                    </h2>
                    <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.5em] mt-2">Central de Atendimento ao Cliente</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-3 px-6 py-3 border-r border-gray-100 dark:border-white/5">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 font-black text-lg">
                            {tickets.filter(t => t.status !== 'CLOSED').length}
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ativos</p>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} /> Abrir Chamado
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden min-h-[600px]">
                {/* LISTA DE TICKETS (LADO ESQUERDO) */}
                <div className="w-full lg:w-[420px] flex flex-col bg-white dark:bg-[#09090b] rounded-[44px] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden shrink-0">
                    <div className="p-8 border-b border-gray-100 dark:border-white/5 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input 
                                placeholder="Buscar por assunto ou cliente..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-white/[0.03] border border-transparent focus:border-indigo-600 rounded-2xl text-xs font-bold outline-none transition-all shadow-inner" 
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {[
                                { id: 'ALL', label: 'Todos', icon: Inbox },
                                { id: 'OPEN', label: 'Abertos', icon: AlertCircle },
                                { id: 'IN_PROGRESS', label: 'Em curso', icon: Clock },
                                { id: 'CLOSED', label: 'Finais', icon: CheckCircle }
                            ].map(s => (
                                <button 
                                    key={s.id}
                                    onClick={() => setFilterStatus(s.id as any)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filterStatus === s.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:border-indigo-500/40'}`}
                                >
                                    <s.icon size={14} /> {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-50 dark:divide-white/[0.02]">
                        {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
                            <div 
                                key={ticket.id} 
                                onClick={() => setSelectedTicketId(ticket.id)}
                                className={`p-8 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-white/[0.02] relative group ${selectedTicketId === ticket.id ? 'bg-indigo-50/30 dark:bg-indigo-600/[0.03]' : ''}`}
                            >
                                {selectedTicketId === ticket.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>}
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ticket.category}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">{new Date(ticket.updatedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                
                                <h4 className="font-black text-gray-900 dark:text-white text-base truncate mb-2 leading-tight group-hover:text-indigo-500 transition-colors">{ticket.subject}</h4>
                                
                                <div className="flex items-center justify-between mt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500"><Building2 size={14}/></div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate max-w-[150px]">{ticket.clientName}</p>
                                    </div>
                                    {ticket.assigneeId && (
                                        <img 
                                            src={users.find(u => u.id === ticket.assigneeId)?.avatar} 
                                            className="w-8 h-8 rounded-xl ring-2 ring-white dark:ring-gray-900 shadow-xl" 
                                            title="Atribuído"
                                        />
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="p-20 text-center opacity-10 flex flex-col items-center">
                                <Inbox size={100} className="mb-6" />
                                <p className="text-xl font-black uppercase tracking-[0.5em]">Caixa Vazia</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* VISUALIZAÇÃO DO CHAMADO (LADO DIREITO) */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#09090b] rounded-[44px] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden relative">
                    {activeTicket ? (
                        <>
                            {/* Toolbar Chamado */}
                            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex flex-wrap justify-between items-center bg-gray-50/50 dark:bg-white/[0.01] gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/20">
                                        {activeTicket.subject.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 dark:text-white text-2xl tracking-tighter uppercase">{activeTicket.subject}</h3>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-1">{activeTicket.clientName} • Ticket #{activeTicket.id.split('-')[1]}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                                        <select 
                                            value={activeTicket.assigneeId || ''} 
                                            onChange={e => assignTicket(activeTicket.id, e.target.value)}
                                            className="bg-transparent text-[10px] font-black uppercase text-gray-500 px-4 py-2 outline-none cursor-pointer"
                                        >
                                            <option value="">Atribuir Atendente...</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <select 
                                        value={activeTicket.status} 
                                        onChange={e => updateTicketStatus(activeTicket.id, e.target.value as TicketStatus)}
                                        className="bg-indigo-600 text-[10px] font-black uppercase text-white rounded-2xl px-6 py-3.5 shadow-lg shadow-indigo-500/20 outline-none cursor-pointer border-none"
                                    >
                                        <option value="OPEN">Aberto</option>
                                        <option value="IN_PROGRESS">Em Atendimento</option>
                                        <option value="WAITING">Aguardando Cliente</option>
                                        <option value="CLOSED">Finalizado</option>
                                    </select>
                                </div>
                            </div>

                            {/* Chat de Interação */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-black/20 relative">
                                <div className="p-10 bg-indigo-600/5 border border-indigo-500/10 rounded-[40px] mb-12 shadow-inner">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><LifeBuoy size={20}/></div>
                                        <h5 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">Descrição do Incidente</h5>
                                    </div>
                                    <p className="text-sm font-medium text-gray-300 leading-relaxed italic">"{activeTicket.description}"</p>
                                </div>

                                {activeTicket.messages.map(msg => (
                                    <div key={msg.id} className={`flex gap-5 ${msg.senderId === currentUser.id ? 'flex-row-reverse animate-in slide-in-from-right-4' : 'animate-in slide-in-from-left-4'}`}>
                                        <img src={msg.senderAvatar} className="w-12 h-12 rounded-[20px] object-cover shadow-2xl ring-4 ring-white/5" />
                                        <div className={`max-w-[75%] space-y-2 ${msg.senderId === currentUser.id ? 'items-end text-right' : 'text-left'}`}>
                                            <div className="flex items-center gap-4 px-2">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{msg.senderName}</p>
                                                <p className="text-[9px] font-bold text-gray-700">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                            <div className={`p-6 rounded-[32px] text-sm font-medium leading-relaxed shadow-xl ${msg.senderId === currentUser.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/[0.04] text-gray-300 rounded-tl-none border border-white/5'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input de Resposta */}
                            <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/40">
                                {activeTicket.status === 'CLOSED' ? (
                                    <div className="flex flex-col items-center justify-center p-8 bg-emerald-500/10 text-emerald-500 rounded-[32px] border border-emerald-500/20 font-black text-xs uppercase tracking-widest animate-in zoom-in">
                                        <CheckCircle2 size={32} className="mb-3"/> Chamado Encerrado e Arquivado
                                        <button onClick={() => updateTicketStatus(activeTicket.id, 'OPEN')} className="mt-4 text-indigo-500 hover:underline">Reabrir Chamado</button>
                                    </div>
                                ) : (
                                    <div className="flex gap-4 items-end max-w-5xl mx-auto">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-2xl flex items-center gap-2">
                                            <button className="p-3 text-gray-400 hover:text-indigo-500 transition-colors"><Paperclip size={20}/></button>
                                        </div>
                                        <div className="flex-1 bg-white dark:bg-gray-950 border border-gray-100 dark:border-white/5 rounded-[32px] p-6 focus-within:border-indigo-600 transition-all shadow-inner">
                                            <textarea 
                                                rows={2} 
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                                placeholder="Digite sua resposta técnica ou orientação..." 
                                                className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white resize-none font-medium"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            className="p-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-[32px] shadow-2xl shadow-indigo-500/40 transition-all active:scale-90 flex items-center justify-center"
                                        >
                                            <Send size={28} strokeWidth={3} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-10 grayscale animate-in fade-in">
                            <MessageSquare size={160} className="mb-10" />
                            <p className="text-2xl font-black uppercase tracking-[1em]">Selecione um Atendimento</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE CRIAÇÃO DE CHAMADO */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsCreateModalOpen(false)}></div>
                    <form onSubmit={handleCreateTicket} className="relative bg-[#0c0c0e] w-full max-w-2xl rounded-[50px] shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/10 overflow-hidden animate-in zoom-in-95">
                        
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20"><LifeBuoy size={28}/></div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Nova Solicitação</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Abertura de ticket de suporte oficial</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-3 text-gray-600 hover:text-white transition-all"><X size={32}/></button>
                        </div>

                        <div className="p-12 space-y-8 custom-scrollbar max-h-[70vh] overflow-y-auto bg-black/20">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Cliente Solicitante</label>
                                <select 
                                    required 
                                    value={newTicketData.clientId} 
                                    onChange={e => setNewTicketData({...newTicketData, clientId: e.target.value})}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-indigo-600 appearance-none cursor-pointer"
                                >
                                    <option value="">Selecione o Cliente...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Assunto / Tópico Principal</label>
                                <input 
                                    required 
                                    value={newTicketData.subject} 
                                    onChange={e => setNewTicketData({...newTicketData, subject: e.target.value})}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-8 py-5 text-xl font-black text-white outline-none focus:border-indigo-600 transition-all placeholder-gray-800 shadow-inner" 
                                    placeholder="Ex: Divergência na SEFIP 11/2023" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Prioridade</label>
                                    <select 
                                        value={newTicketData.priority} 
                                        onChange={e => setNewTicketData({...newTicketData, priority: e.target.value as TicketPriority})}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-indigo-600 appearance-none cursor-pointer"
                                    >
                                        <option value="LOW">BAIXA</option>
                                        <option value="MEDIUM">MÉDIA</option>
                                        <option value="HIGH">ALTA</option>
                                        <option value="URGENT">URGENTE / CRÍTICA</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Categoria</label>
                                    <select 
                                        value={newTicketData.category} 
                                        onChange={e => setNewTicketData({...newTicketData, category: e.target.value as any})}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-indigo-600 appearance-none cursor-pointer"
                                    >
                                        <option value="TECHNICAL">DÚVIDA TÉCNICA</option>
                                        <option value="FISCAL">FISCAL / TRIBUTÁRIO</option>
                                        <option value="BILLING">FATURAMENTO / CONTAS</option>
                                        <option value="OTHER">OUTROS ASSUNTOS</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Descrição Detalhada do Problema</label>
                                <textarea 
                                    required
                                    rows={4} 
                                    value={newTicketData.description} 
                                    onChange={e => setNewTicketData({...newTicketData, description: e.target.value})}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-[32px] p-8 text-sm font-medium text-gray-300 outline-none border-2 border-transparent focus:border-indigo-600 resize-none transition-all" 
                                    placeholder="Descreva o que está acontecendo e o que já foi tentado..." 
                                />
                            </div>
                        </div>

                        <div className="p-10 border-t border-white/5 bg-black/60 flex items-center justify-between gap-6">
                             <div className="flex items-center gap-3 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                <ShieldAlert size={14}/> Atendimento auditado pelo sistema.
                             </div>
                             <div className="flex gap-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-10 py-5 text-[11px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Descartar</button>
                                <button type="submit" className="px-16 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[24px] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all uppercase text-[11px] tracking-widest">Criar Chamado</button>
                             </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
