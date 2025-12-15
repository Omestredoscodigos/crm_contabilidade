
import React, { useState, useMemo, useEffect } from 'react';
import { Lead, Client, LeadPipeline, LeadPipelineColumn } from '../types';
import { 
    Activity, Kanban, Phone, MessageSquare, Search, Plus, X, Trash2, 
    TrendingUp, AlertCircle, Thermometer, History, MessageCircle, 
    Layers, Layout, CheckCircle2, DollarSign, Users, Clock, Calendar,
    ChevronRight, ArrowRightCircle, Sparkles, Mail, User, MapPin, 
    Target, Info, CalendarClock, ListTodo, Palette, BarChart3, PieChart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from 'recharts';

interface SalesCRMProps {
    leads: Lead[];
    clients: Client[];
    onUpdateLeads: (leads: Lead[]) => void;
}

type SubTab = 'OVERVIEW' | 'PIPELINE' | 'SDR' | 'FOLLOW_UP';
type LeadModalTab = 'BASIC' | 'CONTACT' | 'SCHEDULE' | 'HISTORY';

const INITIAL_LEAD_PIPELINES: LeadPipeline[] = [
    {
        id: 'main-sales',
        name: 'Vendas Principal',
        columns: [
            { id: 'NEW', label: 'Novo Lead', color: 'bg-blue-500' },
            { id: 'QUALIFIED', label: 'Qualificado', color: 'bg-indigo-500' },
            { id: 'PROPOSAL', label: 'Proposta', color: 'bg-purple-500' },
            { id: 'WON', label: 'Fechado', color: 'bg-emerald-500' }
        ]
    }
];

const COLUMN_COLORS = [
    { label: 'Azul', value: 'bg-blue-500' },
    { label: 'Índigo', value: 'bg-indigo-500' },
    { label: 'Roxo', value: 'bg-purple-500' },
    { label: 'Esmeralda', value: 'bg-emerald-500' },
    { label: 'Rosa', value: 'bg-pink-500' },
    { label: 'Laranja', value: 'bg-orange-500' },
    { label: 'Âmbar', value: 'bg-amber-500' },
    { label: 'Cinza', value: 'bg-gray-400' },
];

export const SalesCRM: React.FC<SalesCRMProps> = ({ leads, clients, onUpdateLeads }) => {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('PIPELINE');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [leadModalTab, setLeadModalTab] = useState<LeadModalTab>('BASIC');
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const [editingLead, setEditingLead] = useState<Partial<Lead> | null>(null);

    const [leadPipelines, setLeadPipelines] = useState<LeadPipeline[]>(() => {
        const saved = localStorage.getItem('lead_pipelines_config_v3');
        return saved ? JSON.parse(saved) : INITIAL_LEAD_PIPELINES;
    });
    const [activePipelineId, setActivePipelineId] = useState<string>(leadPipelines[0]?.id || 'main-sales');
    const [newColumnData, setNewColumnData] = useState({ label: '', color: 'bg-indigo-500' });

    useEffect(() => {
        localStorage.setItem('lead_pipelines_config_v3', JSON.stringify(leadPipelines));
    }, [leadPipelines]);

    const activePipeline = useMemo(() => {
        return leadPipelines.find(p => p.id === activePipelineId) || leadPipelines[0];
    }, [leadPipelines, activePipelineId]);

    const filteredLeads = useMemo(() => {
        return leads.filter(l => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = l.name.toLowerCase().includes(searchLower) || 
                                 (l.contactPerson || '').toLowerCase().includes(searchLower);
            const matchesPipeline = !l.pipelineId || l.pipelineId === activePipelineId;
            return matchesSearch && matchesPipeline;
        });
    }, [leads, searchTerm, activePipelineId]);

    const metrics = useMemo(() => {
        const active = leads.filter(l => l.status !== 'WON' && l.status !== 'LOST');
        const won = leads.filter(l => l.status === 'WON');
        const totalValue = active.reduce((acc, curr) => acc + (curr.value || 0), 0);
        const conversion = leads.length > 0 ? (won.length / leads.length) * 100 : 0;
        return { total: leads.length, active: active.length, value: totalValue, conversion };
    }, [leads]);

    const handleSaveLead = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLead?.name) return;

        if (editingLead.id) {
            onUpdateLeads(leads.map(l => l.id === editingLead.id ? (editingLead as Lead) : l));
        } else {
            const newLead: Lead = {
                ...editingLead as Lead,
                id: 'ld-' + Date.now(),
                createdAt: new Date().toISOString(),
                lastInteraction: new Date().toISOString(),
                status: editingLead.status || activePipeline.columns[0].id,
                pipelineId: activePipelineId,
                history: [],
                notes: [],
                source: editingLead.source || 'INDICATION',
                temperature: editingLead.temperature || 'WARM',
                probability: editingLead.probability || 50
            };
            onUpdateLeads([newLead, ...leads]);
        }
        setIsLeadModalOpen(false);
    };

    const onDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('taskId');
        if (!id) return;
        onUpdateLeads(leads.map(l => l.id === id ? { ...l, status, pipelineId: activePipelineId } : l));
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    {[
                        { id: 'OVERVIEW', label: 'Dashboard', icon: Activity },
                        { id: 'PIPELINE', label: 'Funil de Vendas', icon: Kanban },
                        { id: 'SDR', label: 'Qualificação SDR', icon: Phone },
                        { id: 'FOLLOW_UP', label: 'Agenda de Retorno', icon: Clock }
                    ].map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => setActiveSubTab(t.id as SubTab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <t.icon size={14} /> {t.label}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => { setEditingLead({ name: '', value: 0 }); setIsLeadModalOpen(true); setLeadModalTab('BASIC'); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus size={16} /> Novo Negócio
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {activeSubTab === 'OVERVIEW' && (
                    <div className="space-y-8 animate-in slide-up duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valor em Funil</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">R$ {metrics.value.toLocaleString('pt-BR')}</h3>
                                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                    <TrendingUp size={14} /> Pipeline Ativo
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Conversão</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{metrics.conversion.toFixed(1)}%</h3>
                                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-500">
                                    <CheckCircle2 size={14} /> Eficiência Comercial
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ticket Médio</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">R$ {(metrics.value / (metrics.active || 1)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</h3>
                                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-500">
                                    <DollarSign size={14} /> Por Contrato
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total de Leads</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{metrics.total}</h3>
                                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-orange-500">
                                    <Users size={14} /> Base Histórica
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-2">
                                    <BarChart3 size={18} className="text-indigo-500" /> Conversão por Etapa
                                </h4>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={activePipeline.columns.map(col => ({ name: col.label, count: leads.filter(l => l.status === col.id).length }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107, 114, 128, 0.05)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 800}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 800}} />
                                            <Tooltip cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="count" name="Leads" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 w-full text-left flex items-center gap-2">
                                    <PieChart size={18} className="text-purple-500" /> Origem dos Leads
                                </h4>
                                <div className="flex-1 min-h-[220px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Indicação', val: leads.filter(l => l.source === 'INDICATION').length },
                                                    { name: 'Outbound', val: leads.filter(l => l.source === 'OUTBOUND').length },
                                                    { name: 'Eventos', val: leads.filter(l => l.source === 'EVENT').length },
                                                    { name: 'Base', val: leads.filter(l => l.source === 'RECURRENCE').length }
                                                ]}
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={8}
                                                dataKey="val"
                                            >
                                                {['#6366f1', '#a855f7', '#ec4899', '#f59e0b'].map((color, index) => (
                                                    <Cell key={`cell-${index}`} fill={color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full mt-4 flex justify-center gap-4">
                                    {['Indicação', 'Outbound', 'Eventos', 'Base'].map((name, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b'][i] }}></div>
                                            {name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSubTab === 'PIPELINE' && (
                    <div className="h-full flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {leadPipelines.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => setActivePipelineId(p.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activePipelineId === p.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setIsColumnModalOpen(true)}
                                    className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 hover:border-indigo-500 transition-all"
                                >
                                    + Nova Etapa
                                </button>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input placeholder="Buscar lead..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 w-64" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex gap-6 overflow-x-auto pb-8 no-scrollbar min-h-[500px]">
                            {activePipeline.columns.map(col => {
                                const colLeads = filteredLeads.filter(l => l.status === col.id);
                                return (
                                    <div key={col.id} onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, col.id)} className="w-80 shrink-0 flex flex-col bg-gray-50/50 dark:bg-gray-900/40 rounded-[32px] border border-gray-100 dark:border-gray-800">
                                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                                                <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{col.label}</span>
                                                <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded text-[9px] font-black text-gray-400 border border-gray-100 dark:border-gray-800">{colLeads.length}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                                            {colLeads.map(lead => (
                                                <div 
                                                    key={lead.id} 
                                                    draggable 
                                                    onDragStart={e => { e.dataTransfer.setData('taskId', lead.id); }}
                                                    onClick={() => { setEditingLead(lead); setIsLeadModalOpen(true); setLeadModalTab('BASIC'); }}
                                                    className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-indigo-500 transition-all group cursor-grab active:cursor-grabbing relative"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate pr-6">{lead.name}</h4>
                                                        {lead.temperature === 'HOT' && <Thermometer size={14} className="text-red-500" />}
                                                    </div>
                                                    <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-gray-800/50">
                                                        <span className="text-xs font-black text-indigo-500">R$ {lead.value?.toLocaleString('pt-BR')}</span>
                                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{lead.source}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => { setEditingLead({ name: '', value: 0, status: col.id }); setIsLeadModalOpen(true); setLeadModalTab('BASIC'); }}
                                                className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-[9px] font-black text-gray-300 uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-500 transition-all"
                                            >
                                                + Novo Registro
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeSubTab === 'FOLLOW_UP' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-up duration-500">
                        {leads.filter(l => l.nextFollowUp && l.status !== 'WON').map(lead => (
                            <div key={lead.id} className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:border-indigo-500 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600"><Clock size={20}/></div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white text-sm">{lead.name}</h5>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Follow-up: {new Date(lead.nextFollowUp!).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setEditingLead(lead); setIsLeadModalOpen(true); setLeadModalTab('SCHEDULE'); }} className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"><ArrowRightCircle size={18}/></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL DE LEAD */}
            {isLeadModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsLeadModalOpen(false)}></div>
                    <form onSubmit={handleSaveLead} className="relative bg-white dark:bg-gray-950 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-white/5">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Oportunidade de Negócio</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Status: {activePipeline.columns.find(c => c.id === editingLead?.status)?.label || 'Novo'}</p>
                            </div>
                            <button type="button" onClick={() => setIsLeadModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
                        </div>

                        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-8">
                            {[
                                { id: 'BASIC', label: 'Geral', icon: Info },
                                { id: 'CONTACT', label: 'Contato', icon: User },
                                { id: 'SCHEDULE', label: 'Agenda', icon: CalendarClock },
                                { id: 'HISTORY', label: 'Histórico', icon: History }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setLeadModalTab(tab.id as LeadModalTab)}
                                    className={`flex items-center gap-2 px-6 py-5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${leadModalTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
                                >
                                    <tab.icon size={14} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">
                            {leadModalTab === 'BASIC' && (
                                <div className="space-y-6 animate-in slide-in-from-left-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Empresa / Prospect</label>
                                        <div className="relative">
                                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input required value={editingLead?.name || ''} onChange={e => setEditingLead(prev => ({...prev!, name: e.target.value}))} className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20" placeholder="Nome da empresa" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Honorário Estimado (R$)</label>
                                            <input type="number" value={editingLead?.value || 0} onChange={e => setEditingLead(prev => ({...prev!, value: parseFloat(e.target.value)}))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Origem do Lead</label>
                                            <select value={editingLead?.source || 'INDICATION'} onChange={e => setEditingLead(prev => ({...prev!, source: e.target.value as any}))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20">
                                                <option value="INDICATION">Indicação</option>
                                                <option value="OUTBOUND">Prospecção Ativa</option>
                                                <option value="EVENT">Evento / Palestra</option>
                                                <option value="RECURRENCE">Recorrência / Base</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3 p-6 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Probabilidade de Fechamento</label>
                                        <input type="range" min="0" max="100" value={editingLead?.probability || 50} onChange={e => setEditingLead(prev => ({...prev!, probability: parseInt(e.target.value)}))} className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                        <div className="flex justify-between items-center text-[10px] font-black text-indigo-500">
                                            <span>PESSIMISTA</span>
                                            <span className="text-xl">{editingLead?.probability || 50}%</span>
                                            <span>OTIMISTA</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {leadModalTab === 'CONTACT' && (
                                <div className="space-y-6 animate-in slide-in-from-right-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Decisor / Contato</label>
                                        <input value={editingLead?.contactPerson || ''} onChange={e => setEditingLead(prev => ({...prev!, contactPerson: e.target.value}))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20" placeholder="Nome completo" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                                            <input type="email" value={editingLead?.email || ''} onChange={e => setEditingLead(prev => ({...prev!, email: e.target.value}))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20" placeholder="email@exemplo.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                                            <input value={editingLead?.phone || ''} onChange={e => setEditingLead(prev => ({...prev!, phone: e.target.value}))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20" placeholder="(00) 00000-0000" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Temperatura do Negócio</label>
                                        <div className="flex gap-4">
                                            {(['COLD', 'WARM', 'HOT'] as const).map(temp => (
                                                <button
                                                    key={temp}
                                                    type="button"
                                                    onClick={() => setEditingLead(prev => ({...prev!, temperature: temp}))}
                                                    className={`flex-1 py-5 rounded-[24px] border-2 font-black text-[10px] uppercase tracking-widest transition-all ${editingLead?.temperature === temp ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                                >
                                                    <Thermometer size={18} className="mx-auto mb-2" /> {temp === 'COLD' ? 'Frio' : temp === 'WARM' ? 'Morno' : 'Quente'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {leadModalTab === 'SCHEDULE' && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                                    <div className="p-6 bg-indigo-50 dark:bg-indigo-500/5 rounded-[32px] flex items-center gap-4">
                                        <CalendarClock className="text-indigo-600" size={24} />
                                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight leading-relaxed">Agende o próximo contato. Este lead aparecerá na sua agenda de follow-up na data escolhida.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Próximo Contato</label>
                                        <input type="date" value={editingLead?.nextFollowUp || ''} onChange={e => setEditingLead(prev => ({...prev!, nextFollowUp: e.target.value}))} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none font-bold text-gray-900 dark:text-white" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50 dark:bg-gray-900/50 flex gap-4">
                            <button type="submit" className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[24px] shadow-xl shadow-indigo-500/20 uppercase text-[11px] tracking-widest transition-all active:scale-[0.98]">
                                Salvar Registro
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
