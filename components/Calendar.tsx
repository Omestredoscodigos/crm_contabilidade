
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarEvent, CalendarListEntry } from '../types';
import { googleCalendarService } from '../services/googleCalendarService';
import { 
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, 
    Plus, RefreshCw, X, 
    Filter, Globe, Search, 
    CalendarDays, Zap, Trash2, Edit3, Loader2,
    LayoutGrid, List, Star, CheckCircle2, Layout, ChevronDown,
    LayoutDashboard
} from 'lucide-react';

export const Calendar: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [availableCalendars, setAvailableCalendars] = useState<CalendarListEntry[]>([]);
    const [activeCalendarId, setActiveCalendarId] = useState<string>('primary');
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'MONTH' | 'LIST'>('MONTH');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({ 
        title: '',
        description: '',
        type: 'MEETING', 
        priority: 'MEDIUM',
        color: '#6366f1',
        allDay: false,
        calendarId: 'primary'
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');

    const config = googleCalendarService.getConfig();
    const isConnected = !!(config.clientId && config.apiKey);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Puxa a lista dinâmica de todas as agendas (Minha, Escritório, Feriados, etc.)
            const calendars = await googleCalendarService.listCalendars();
            setAvailableCalendars(calendars);
            
            // Garante que o ID ativo ainda existe na lista, senão volta pro primário
            const stillExists = calendars.some(c => c.id === activeCalendarId);
            const targetId = stillExists ? activeCalendarId : (calendars[0]?.id || 'primary');
            if (!stillExists) setActiveCalendarId(targetId);

            // 2. Puxa os eventos da agenda que o usuário quer verificar agora
            const data = await googleCalendarService.listEvents(targetId);
            setEvents(data);
            setLastSync(new Date());
        } catch (error) {
            console.error("Erro ao puxar dados da agenda:", error);
        } finally {
            setIsLoading(false);
        }
    }, [activeCalendarId]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (date: Date) => {
        setSelectedDay(date);
        setIsDayDetailOpen(true);
    };

    const openCreateModal = (date?: Date) => {
        const targetDate = date || selectedDay || new Date();
        const start = new Date(targetDate);
        start.setHours(new Date().getHours() + 1, 0, 0, 0);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);

        setNewEvent({
            title: '',
            description: '',
            start: start.toISOString().slice(0, 16),
            end: end.toISOString().slice(0, 16),
            type: 'MEETING',
            priority: 'MEDIUM',
            color: '#6366f1',
            allDay: false,
            calendarId: activeCalendarId
        });
        setIsCreateModalOpen(true);
    };

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = e.title.toLowerCase().includes(searchLower) || 
                                 (e.description || '').toLowerCase().includes(searchLower);
            const matchesType = typeFilter === 'ALL' || e.type === typeFilter;
            return matchesSearch && matchesType;
        }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [events, searchTerm, typeFilter]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay();
        const days = [];
        for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const days = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const getEventsForDay = (date: Date) => {
        return filteredEvents.filter(e => {
            const eDate = new Date(e.start);
            return eDate.getDate() === date.getDate() && 
                   eDate.getMonth() === date.getMonth() && 
                   eDate.getFullYear() === date.getFullYear();
        });
    };

    const EVENT_TYPES = [
        { id: 'MEETING', label: 'Reunião', color: 'bg-indigo-500' },
        { id: 'TASK', label: 'Tarefa', color: 'bg-blue-500' },
        { id: 'DEADLINE', label: 'Prazo Fiscal', color: 'bg-red-500' },
        { id: 'PERSONAL', label: 'Pessoal', color: 'bg-emerald-500' },
    ];

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.start || !newEvent.end) return;
        
        setIsSaving(true);
        try {
            await googleCalendarService.createEvent(newEvent as any, newEvent.calendarId || activeCalendarId);
            await fetchAllData();
            setIsCreateModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!window.confirm("Remover este compromisso da agenda?")) return;
        setIsLoading(true);
        await googleCalendarService.deleteEvent(id, activeCalendarId);
        await fetchAllData();
        setIsLoading(false);
    };

    return (
        <div className="h-full flex flex-col gap-4 animate-in fade-in duration-700 overflow-hidden bg-gray-50 dark:bg-gray-950">
            
            {/* CABEÇALHO */}
            <header className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white dark:bg-[#0c0c0e] p-5 rounded-[28px] border border-gray-200 dark:border-white/10 shadow-xl shrink-0">
                <div className="flex items-center gap-6 w-full lg:w-auto">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <CalendarIcon size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{monthName}</h2>
                            <div className="mt-1 flex items-center gap-2">
                                <Globe size={10} className="text-indigo-500" />
                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest truncate max-w-[200px]">
                                    {availableCalendars.find(c => c.id === activeCalendarId)?.summary || 'Carregando...'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/10 ml-4">
                        <button onClick={handlePrevMonth} className="p-2 text-gray-500 hover:text-indigo-500 transition-all hover:bg-white dark:hover:bg-white/10 rounded-xl"><ChevronLeft size={20}/></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-5 text-[10px] font-black text-gray-500 hover:text-indigo-500 dark:text-gray-400 uppercase tracking-widest transition-all">Hoje</button>
                        <button onClick={handleNextMonth} className="p-2 text-gray-500 hover:text-indigo-500 transition-all hover:bg-white dark:hover:bg-white/10 rounded-xl"><ChevronRight size={20}/></button>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-center w-full lg:w-auto">
                    <div className="relative group flex-1 lg:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={16} />
                        <input 
                            placeholder="Pesquisar compromisso..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full lg:w-64 pl-12 pr-5 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 focus:border-indigo-600 outline-none text-xs font-bold transition-all shadow-inner"
                        />
                    </div>

                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/10">
                        <button onClick={() => setViewMode('MONTH')} className={`p-3 rounded-xl transition-all ${viewMode === 'MONTH' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-indigo-500'}`} title="Ver Grade"><LayoutGrid size={18}/></button>
                        <button onClick={() => setViewMode('LIST')} className={`p-3 rounded-xl transition-all ${viewMode === 'LIST' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-indigo-500'}`} title="Ver Lista"><List size={18}/></button>
                    </div>

                    <button 
                        onClick={() => openCreateModal()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-[20px] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-3"
                    >
                        <Plus size={16} strokeWidth={3} /> Agendar
                    </button>
                    
                    <button 
                        onClick={fetchAllData}
                        disabled={isLoading}
                        className={`p-3.5 rounded-2xl transition-all active:scale-95 ${isConnected ? 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-600 hover:text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}
                        title="Atualizar Agendas"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden relative min-h-0">
                
                {/* GRADE PRINCIPAL */}
                <div className="flex-1 bg-white dark:bg-[#0c0c0e] rounded-[40px] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col relative min-h-0">
                    
                    {isLoading && (
                        <div className="absolute inset-0 z-40 bg-[#09090b]/60 backdrop-blur-md flex items-center justify-center animate-in fade-in">
                            <div className="bg-white dark:bg-[#121214] p-10 rounded-[40px] shadow-2xl border border-white/5 flex flex-col items-center gap-6 animate-in zoom-in">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <Globe size={24} className="absolute inset-0 m-auto text-indigo-500 animate-pulse" />
                                </div>
                                <p className="text-sm font-black text-white uppercase tracking-[0.3em]">Buscando Dados Google</p>
                            </div>
                        </div>
                    )}

                    {viewMode === 'MONTH' ? (
                        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] shrink-0 sticky top-0 z-20">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                    <div key={day} className="py-4 text-center text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{day}</div>
                                ))}
                            </div>

                            <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-full">
                                {days.map((day, idx) => {
                                    if (!day) return <div key={idx} className="bg-gray-50/[0.02] dark:bg-white/[0.002] border-b border-r border-gray-200 dark:border-white/5"></div>;
                                    const dayEvents = getEventsForDay(day);
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    return (
                                        <div 
                                            key={idx} onClick={() => handleDateClick(day)}
                                            className={`relative border-b border-r border-gray-200 dark:border-white/5 p-3 transition-all hover:bg-indigo-600/[0.03] cursor-pointer group flex flex-col min-h-[130px] ${isToday ? 'bg-indigo-600/[0.04]' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-xl transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 dark:text-gray-600 group-hover:text-indigo-400'}`}>
                                                    {day.getDate()}
                                                </span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5">
                                                {dayEvents.map(event => (
                                                    <div 
                                                        key={event.id}
                                                        style={{ backgroundColor: `${event.color || '#6366f1'}15`, borderLeftColor: event.color || '#6366f1' }}
                                                        className={`text-[9px] font-bold px-2 py-1.5 rounded-lg border-l-[3px] shadow-sm truncate flex items-center gap-2 ${event.googleEventId ? 'text-indigo-400 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}
                                                    >
                                                        {event.googleEventId && <Globe size={10} className="shrink-0 text-blue-500" />}
                                                        <span className="truncate">{event.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar bg-black/20">
                            {filteredEvents.length > 0 ? (
                                <div className="max-w-4xl mx-auto space-y-12">
                                    {Array.from(new Set(filteredEvents.map((e: CalendarEvent) => new Date(e.start).toDateString()))).map((dateStr: string) => {
                                        const date = new Date(dateStr);
                                        const dateEvents = filteredEvents.filter((e: CalendarEvent) => new Date(e.start).toDateString() === dateStr);
                                        return (
                                            <div key={dateStr} className="animate-in slide-up">
                                                <div className="flex items-center gap-6 mb-6">
                                                    <div className="w-16 h-16 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center shadow-xl">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{date.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                                        <span className="text-3xl font-black text-gray-900 dark:text-white">{date.getDate()}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{date.toLocaleDateString('pt-BR', { weekday: 'long' })}</h4>
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{dateEvents.length} Atividades registradas</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {dateEvents.map((event: CalendarEvent) => (
                                                        <div 
                                                            key={event.id}
                                                            onClick={() => { setSelectedDay(new Date(event.start)); setIsDayDetailOpen(true); }}
                                                            className="p-6 bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-[32px] hover:border-indigo-500/40 hover:translate-y-[-4px] transition-all cursor-pointer group shadow-sm hover:shadow-2xl"
                                                        >
                                                            <div className="flex justify-between items-start mb-4">
                                                                <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">
                                                                    {new Date(event.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                                </span>
                                                                {event.googleEventId && <div className="p-1.5 bg-blue-500/10 rounded-lg"><Globe size={14} className="text-blue-500" /></div>}
                                                            </div>
                                                            <h5 className="text-base font-black text-gray-900 dark:text-white uppercase leading-tight mb-2 group-hover:text-indigo-500 transition-colors">{event.title}</h5>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale py-32 text-center">
                                    <CalendarDays size={120} className="mb-10 text-gray-500" />
                                    <p className="text-3xl font-black uppercase tracking-[0.5em] text-gray-500">Janela Livre</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* BARRA LATERAL DE SELEÇÃO DE AGENDAS (CONFORME IMAGEM) */}
                <aside className="hidden xl:flex w-72 shrink-0 flex-col gap-6 overflow-y-auto no-scrollbar">
                    
                    <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden shrink-0 group">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="p-3 bg-white/20 rounded-2xl w-fit"><Star size={24} fill="currentColor"/></div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">Visão Ativa</h3>
                                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest opacity-80">
                                    {events.length} Compromissos detectados nesta agenda.
                                </p>
                            </div>
                            <button onClick={() => openCreateModal()} className="w-full py-4 bg-white text-indigo-600 rounded-[20px] font-black uppercase text-[10px] tracking-widest shadow-xl transition-all hover:scale-[1.03] active:scale-95">
                                Agendar Novo
                            </button>
                        </div>
                    </div>

                    {/* LISTAGEM DE AGENDAS DISPONÍVEIS - DESIGN FIEL À IMAGEM */}
                    <div className="bg-white dark:bg-[#0c0c0e] p-8 rounded-[40px] border border-gray-200 dark:border-white/10 shadow-lg space-y-8 flex flex-col">
                        <div className="space-y-6">
                            <h4 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] flex items-center gap-3">
                                <LayoutDashboard size={18} className="text-indigo-500" /> AGENDAS DISPONÍVEIS
                            </h4>
                            
                            <div className="space-y-2">
                                {availableCalendars.length > 0 ? availableCalendars.map(cal => (
                                    <button 
                                        key={cal.id} 
                                        onClick={() => setActiveCalendarId(cal.id)}
                                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeCalendarId === cal.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl' : 'bg-white dark:bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full shadow-glow shrink-0`} style={{ backgroundColor: cal.backgroundColor || '#6366f1' }}></div>
                                        <span className="truncate flex-1 text-left">{cal.summary}</span>
                                        {activeCalendarId === cal.id && <ChevronRight size={14} />}
                                    </button>
                                )) : (
                                    <div className="py-10 text-center opacity-30 flex flex-col items-center gap-3">
                                        <Loader2 size={24} className="animate-spin" />
                                        <p className="text-[9px] font-black uppercase">Verificando Google...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto space-y-6 border-t border-gray-100 dark:border-white/5 pt-6">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Filter size={16} className="text-indigo-500" /> FILTROS RÁPIDOS
                            </h4>
                            <div className="space-y-2">
                                <button onClick={() => setTypeFilter('ALL')} className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                                    TODOS OS TIPOS
                                </button>
                                {EVENT_TYPES.map(t => (
                                    <button 
                                        key={t.id} 
                                        onClick={() => setTypeFilter(t.id)} 
                                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === t.id ? 'bg-white dark:bg-white/5 text-indigo-600 dark:text-indigo-400 border border-indigo-600/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${t.color} shadow-glow`}></div>
                                            {t.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* MODAL DE CRIAÇÃO (SIMPLIFICADO) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsCreateModalOpen(false)}></div>
                    <form onSubmit={handleSaveEvent} className="relative bg-[#09090b] w-full max-w-2xl rounded-[50px] shadow-[0_0_120px_rgba(0,0,0,1)] border border-white/10 overflow-hidden animate-in zoom-in-95">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-xl">
                                    <CalendarIcon size={32} strokeWidth={2.5}/>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Confirmar Agendamento</h3>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                                        Destino: {availableCalendars.find(c => c.id === (newEvent.calendarId || activeCalendarId))?.summary}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-4 text-gray-400 hover:text-white transition-all bg-white/5 rounded-2xl active:scale-90"><X size={32}/></button>
                        </div>

                        <div className="p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.4em] ml-2">Título do Evento</label>
                                <input 
                                    autoFocus required 
                                    value={newEvent.title} 
                                    onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-[28px] px-8 py-7 text-2xl font-black text-white outline-none focus:border-indigo-600 transition-all placeholder:text-gray-800 shadow-inner" 
                                    placeholder="Ex: Entrega Fiscal" 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.4em] ml-2">Início</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        value={newEvent.start} 
                                        onChange={e => setNewEvent({...newEvent, start: e.target.value})} 
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] px-8 py-5 font-black text-indigo-500 outline-none focus:border-indigo-600 transition-all shadow-inner" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.4em] ml-2">Fim</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        value={newEvent.end} 
                                        onChange={e => setNewEvent({...newEvent, end: e.target.value})} 
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] px-8 py-5 font-black text-indigo-500 outline-none focus:border-indigo-600 transition-all shadow-inner" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-gray-600 uppercase tracking-[0.4em] ml-2">Escolher Agenda Google</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {availableCalendars.map(cal => (
                                        <button 
                                            key={cal.id} type="button"
                                            onClick={() => setNewEvent({...newEvent, calendarId: cal.id})}
                                            className={`p-5 rounded-3xl border-2 transition-all flex items-center gap-3 ${newEvent.calendarId === cal.id ? 'bg-indigo-600/10 border-indigo-600 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cal.backgroundColor || '#6366f1' }}></div>
                                            <span className="text-[10px] font-black uppercase truncate">{cal.summary}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={isSaving} className="w-full py-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[32px] shadow-[0_30px_60px_rgba(99,102,241,0.3)] transition-all active:scale-95 uppercase text-sm tracking-[0.4em] flex items-center justify-center gap-4">
                                {isSaving ? <Loader2 className="animate-spin" size={24}/> : <CheckCircle2 size={24}/>}
                                {isSaving ? 'Sincronizando...' : 'Consolidar na Nuvem'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
