import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatConversation, ChatMessage, User, Client, Lead } from '../types';
import { whatsAppService } from '../services/whatsappService';
import { 
    Search, Plus, Send, X, MoreVertical, Phone, 
    UserPlus, MessageSquare, History, ArrowLeft, 
    User as UserIcon, Loader2, Check, CheckCheck,
    MessageCircle, Paperclip, Smile, Zap, Info,
    Building2, FileText, Target,
    ExternalLink, Star, ChevronRight, FileCheck,
    AlertCircle, Image as ImageIcon, Mic
} from 'lucide-react';

interface WhatsAppChatProps {
    instanceName: string;
    currentUser: User;
    onClose: () => void;
    clients: Client[];
    leads: Lead[];
    conversations: ChatConversation[];
    onUpdateConversations: (conversations: ChatConversation[]) => void;
}

const QUICK_TEMPLATES = [
    { id: '1', title: 'Solicitar Notas', text: 'Olá! Notamos que ainda faltam algumas notas fiscais de entrada para o fechamento deste mês. Poderia nos enviar os XMLs?' },
    { id: '2', title: 'Guia de Imposto', text: 'Bom dia! Sua guia de impostos (DAS/GPS) já está disponível no portal e também segue em anexo aqui. Vencimento para o dia XX.' },
    { id: '3', title: 'Boas-vindas', text: 'Seja bem-vindo à nossa contabilidade! É um prazer ter sua empresa conosco. Este é o nosso canal oficial de atendimento.' },
    { id: '4', title: 'Assinatura Pendente', text: 'Olá! Enviamos um documento para sua assinatura eletrônica via portal. Por favor, verifique seu e-mail ou acesse o link enviado.' },
];

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ instanceName, currentUser, onClose, clients, leads, conversations, onUpdateConversations }) => {
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(true);
    const [showTemplates, setShowTemplates] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '' });
    const [isSending, setIsSending] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChatId, conversations]);

    const activeChat = useMemo(() => 
        conversations.find(c => c.id === activeChatId), 
    [conversations, activeChatId]);

    // Limpar unreadCount ao abrir o chat
    useEffect(() => {
        if (activeChatId) {
            const chat = conversations.find(c => c.id === activeChatId);
            if (chat && chat.unreadCount > 0) {
                onUpdateConversations(conversations.map(c => 
                    c.id === activeChatId ? { ...c, unreadCount: 0 } : c
                ));
            }
        }
    }, [activeChatId]);

    const crmContext = useMemo(() => {
        if (!activeChat) return null;
        const cleanPhone = activeChat.phoneNumber.replace(/\D/g, '');
        const client = clients.find(c => c.phone.replace(/\D/g, '').includes(cleanPhone));
        const lead = leads.find(l => l.phone.replace(/\D/g, '').includes(cleanPhone));
        return { client, lead };
    }, [activeChat, clients, leads]);

    const filteredConversations = useMemo(() => 
        conversations.filter(c => 
            c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.phoneNumber.includes(searchTerm)
        ), 
    [conversations, searchTerm]);

    const handleSendMessage = async (textOverride?: string) => {
        const textToSend = textOverride || newMessage;
        if (!textToSend.trim() || !activeChatId || isSending) return;
        
        const chat = activeChat!;
        setIsSending(true);
        setShowTemplates(false);

        const success = await whatsAppService.sendMessage(instanceName, chat.phoneNumber, textToSend);
        
        if (success) {
            const message: ChatMessage = {
                id: 'msg-' + Date.now(),
                text: textToSend,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isFromMe: true,
                status: 'SENT',
                type: 'text'
            };

            onUpdateConversations(conversations.map(c => 
                c.id === activeChatId 
                    ? { ...c, lastMessage: textToSend, lastMessageTime: message.timestamp, messages: [...c.messages, message] }
                    : c
            ));
            if (!textOverride) setNewMessage('');
        }
        
        setIsSending(false);
    };

    const handleAddContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContact.name || !newContact.phone) return;
        
        const cleanNewPhone = newContact.phone.replace(/\D/g, '');
        const exists = conversations.find(c => c.phoneNumber.replace(/\D/g, '').includes(cleanNewPhone));
        
        if (exists) {
            setActiveChatId(exists.id);
        } else {
            const newId = 'conv-' + Date.now();
            const newConv: ChatConversation = {
                id: newId,
                contactName: newContact.name,
                phoneNumber: newContact.phone,
                lastMessage: 'Iniciando conversa...',
                lastMessageTime: 'Agora',
                unreadCount: 0,
                messages: []
            };
            onUpdateConversations([newConv, ...conversations]);
            setActiveChatId(newId);
        }
        setIsAddingContact(false);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-[#09090b] w-full max-w-[1500px] h-[92vh] rounded-[48px] shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/10 flex overflow-hidden animate-in zoom-in-95">
                
                <div className={`w-full lg:w-[380px] flex flex-col border-r border-white/5 bg-white/[0.01] ${activeChatId ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-8 border-b border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <History size={20} className="text-indigo-500" /> Chats
                            </h2>
                            <button onClick={() => setIsAddingContact(true)} className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-90"><UserPlus size={18} /></button>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            <input placeholder="Filtrar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-5 py-4 bg-black/40 border border-white/5 rounded-2xl text-xs font-bold text-white outline-none focus:border-indigo-600 transition-all" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.02]">
                        {filteredConversations.map(conv => (
                            <div key={conv.id} onClick={() => setActiveChatId(conv.id)} className={`p-6 cursor-pointer transition-all hover:bg-white/[0.03] flex items-center gap-4 relative group ${activeChatId === conv.id ? 'bg-indigo-600/[0.07]' : ''}`}>
                                {activeChatId === conv.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-r-full shadow-glow"></div>}
                                <div className="w-14 h-14 rounded-[22px] bg-white/5 flex items-center justify-center text-gray-500 shrink-0 border border-white/5 group-hover:border-indigo-500/50 transition-all overflow-hidden shadow-lg">
                                    {conv.avatar ? <img src={conv.avatar} className="w-full h-full object-cover" /> : <UserIcon size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-black text-white truncate">{conv.contactName}</h4>
                                        <span className="text-[9px] font-bold text-gray-600 uppercase whitespace-nowrap ml-2">{conv.lastMessageTime}</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-500 truncate leading-relaxed">{conv.lastMessage}</p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="w-5 h-5 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col relative bg-black/20 overflow-hidden">
                    {activeChat ? (
                        <>
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-sm z-10">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setActiveChatId(null)} className="lg:hidden p-2 text-gray-500 hover:text-white"><ArrowLeft size={20}/></button>
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-xl overflow-hidden">
                                        {activeChat.avatar ? <img src={activeChat.avatar} className="w-full h-full object-cover" /> : <UserIcon size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-lg tracking-tight uppercase leading-none mb-1">{activeChat.contactName}</h3>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Atendimento Ativo</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-3 text-gray-500 hover:text-indigo-400 rounded-xl"><Phone size={18}/></button>
                                    <button onClick={() => setIsInfoOpen(!isInfoOpen)} className={`p-3 transition-all rounded-xl ${isInfoOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-indigo-400'}`}><Info size={20}/></button>
                                    <button onClick={onClose} className="p-3 text-gray-500 hover:text-red-500 rounded-xl"><X size={24}/></button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar bg-[url('https://w0.peakpx.com/wallpaper/580/650/wallpaper-whatsapp-dark-mode.jpg')] bg-repeat bg-fixed opacity-95">
                                {activeChat.messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.isFromMe ? 'justify-end animate-in slide-in-from-right-2' : 'justify-start animate-in slide-in-from-left-2'}`}>
                                        <div className={`max-w-[70%] px-5 py-4 rounded-[28px] shadow-2xl relative ${msg.isFromMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-[#182229] text-gray-200 rounded-bl-none border border-white/5'}`}>
                                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                            <div className="flex items-center justify-end gap-1.5 mt-2 opacity-50">
                                                <span className="text-[9px] font-bold uppercase">{msg.timestamp}</span>
                                                {msg.isFromMe && (msg.status === 'SENT' ? <Check size={12}/> : <CheckCheck size={12} className="text-indigo-200" />)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {showTemplates && (
                                <div className="absolute bottom-32 left-10 right-10 bg-[#121214] border border-white/10 rounded-[32px] shadow-2xl p-6 animate-in slide-in-from-bottom-4 z-20">
                                    <div className="flex justify-between items-center mb-6 px-2">
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2"><Zap size={14} className="fill-indigo-500" /> Respostas Rápidas</h4>
                                        <button onClick={() => setShowTemplates(false)} className="text-gray-500 hover:text-white"><X size={16}/></button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {QUICK_TEMPLATES.map(t => (
                                            <button key={t.id} onClick={() => handleSendMessage(t.text)} className="text-left p-4 bg-white/5 border border-white/5 hover:border-indigo-500/40 rounded-2xl transition-all group">
                                                <p className="text-[11px] font-black text-white uppercase mb-1 group-hover:text-indigo-400">{t.title}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{t.text}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-8 border-t border-white/5 bg-[#09090b] flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-[36px] p-2 focus-within:border-indigo-600/40 transition-all flex items-center shadow-inner group">
                                        <button className="p-3 text-gray-500 hover:text-indigo-400 transition-colors ml-2"><Smile size={22}/></button>
                                        <button className="p-3 text-gray-500 hover:text-indigo-400 transition-colors"><Paperclip size={22}/></button>
                                        <textarea rows={1} value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="Digite sua mensagem técnica..." className="flex-1 bg-transparent px-4 py-4 text-sm font-medium text-white outline-none resize-none max-h-32" />
                                        <button onClick={() => setShowTemplates(!showTemplates)} className={`p-3 rounded-2xl transition-all mr-2 ${showTemplates ? 'text-indigo-500 bg-indigo-500/10' : 'text-gray-500 hover:text-indigo-400'}`}><Zap size={22}/></button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {newMessage.trim() ? (
                                            <button onClick={() => handleSendMessage()} disabled={isSending} className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-full shadow-xl transition-all active:scale-90 flex items-center justify-center">
                                                {isSending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} strokeWidth={2.5} />}
                                            </button>
                                        ) : (
                                            <button className="w-16 h-16 bg-white/5 hover:bg-white/10 text-gray-400 rounded-full flex items-center justify-center"><Mic size={24} /></button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-8 text-[8px] font-black text-gray-700 uppercase tracking-[0.3em]">
                                    <span>Evolution API v1.8.2</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-10 animate-in fade-in duration-1000">
                            <div className="absolute top-10 right-10"><button onClick={onClose} className="p-5 text-gray-400 hover:text-white"><X size={40}/></button></div>
                            <MessageSquare size={160} className="mb-10 relative" />
                            <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-white">Inbox Contábil</h2>
                        </div>
                    )}
                </div>

                {activeChat && isInfoOpen && (
                    <div className="w-[380px] border-l border-white/5 bg-[#0c0c0e]/80 backdrop-blur-xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em]">Perfil no CRM</h3>
                            <button onClick={() => setIsInfoOpen(false)} className="text-gray-600 hover:text-white"><X size={18}/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-[36px] bg-white/5 border border-white/10 p-1 mb-6 shadow-2xl relative">
                                    {activeChat.avatar ? <img src={activeChat.avatar} className="w-full h-full rounded-[34px] object-cover" /> : <UserIcon size={40} className="m-auto h-full text-gray-700" />}
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white border-4 border-[#0c0c0e] shadow-xl"><Star size={14} fill="currentColor"/></div>
                                </div>
                                <h4 className="text-xl font-black text-white tracking-tight uppercase mb-2">{activeChat.contactName}</h4>
                                <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/5">{activeChat.phoneNumber}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h5 className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Vínculo de Sistema</h5>
                                    <div className="px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20 text-[8px] font-black text-indigo-500 uppercase">Auto Sync</div>
                                </div>

                                {crmContext?.client ? (
                                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[36px] space-y-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Building2 size={20}/></div>
                                            <div className="flex-1 min-w-0"><p className="text-[10px] font-black text-white truncate uppercase">{crmContext.client.companyName}</p><p className="text-[8px] font-bold text-emerald-500 uppercase">Cliente Ativo</p></div>
                                        </div>
                                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2">Ver Ficha Completa <ExternalLink size={12}/></button>
                                    </div>
                                ) : crmContext?.lead ? (
                                    <div className="p-6 bg-indigo-600/5 border border-indigo-600/20 rounded-[36px] space-y-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500"><Target size={20}/></div>
                                            <div className="flex-1 min-w-0"><p className="text-[10px] font-black text-white truncate uppercase">{crmContext.lead.name}</p><p className="text-[8px] font-bold text-indigo-500 uppercase">Negociação Aberta</p></div>
                                        </div>
                                        <button className="w-full py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center justify-center gap-2">Gerenciar Oportunidade <ChevronRight size={12}/></button>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-white/[0.02] border border-dashed border-white/10 rounded-[40px] text-center space-y-4 opacity-70">
                                        <AlertCircle size={28} className="mx-auto text-gray-600" />
                                        <p className="text-[10px] font-black text-gray-500 uppercase leading-relaxed px-4">Este contato ainda não possui um registro vinculado.</p>
                                        <button className="text-[10px] font-black text-indigo-500 hover:text-white uppercase transition-colors">Cadastrar Agora</button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-2">Ações Rápidas</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex flex-col items-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-indigo-500/40 transition-all group">
                                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl"><FileText size={18}/></div>
                                        <span className="text-[8px] font-black uppercase text-gray-500 group-hover:text-white">Criar Tarefa</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-emerald-500/40 transition-all group">
                                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xl"><FileCheck size={18}/></div>
                                        <span className="text-[8px] font-black uppercase text-gray-500 group-hover:text-white">Protocolo</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/5 bg-black/40">
                             <div className="flex items-center gap-3 text-red-500/30 group hover:text-red-500 cursor-pointer transition-all">
                                <X size={16}/>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Bloquear Contato</span>
                             </div>
                        </div>
                    </div>
                )}

                {isAddingContact && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsAddingContact(false)}></div>
                        <form onSubmit={handleAddContact} className="relative bg-[#121214] w-full max-w-md rounded-[48px] border border-white/10 p-12 shadow-[0_0_150px_rgba(0,0,0,1)] space-y-10 animate-in zoom-in-95">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-indigo-600/30"><UserPlus size={32}/></div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Nova Conexão</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-2">Adicionar canal de atendimento</p>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Identificação</label>
                                    <input autoFocus required value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-5 font-bold text-white outline-none focus:border-indigo-600 transition-all" placeholder="Ex: João Contábil" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">WhatsApp</label>
                                    <input required value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-5 font-bold text-white outline-none focus:border-indigo-600 font-mono" placeholder="5511999998888" />
                                </div>
                                <button type="submit" className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[28px] font-black uppercase text-xs tracking-[0.25em] shadow-xl transition-all active:scale-95">Abrir Chat Integrado</button>
                                <button type="button" onClick={() => setIsAddingContact(false)} className="w-full text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors py-2">Voltar</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};