
import React, { useState, useMemo, useRef } from 'react';
import { Client, Task, Lead, User, AuditLogEntry, TaxRegime, TaskPriority } from '../types';
import { 
    DownloadCloud, FileSpreadsheet, FileJson, Search, Calendar, 
    Filter, CheckCircle2, Building2, Layers, Megaphone, 
    Users as UsersIcon, History, Loader2, Info, AlertCircle, UploadCloud,
    FileText, X, ChevronRight, Download, Upload, Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportDataProps {
    clients: Client[];
    tasks: Task[];
    leads: Lead[];
    users: User[];
    logs: AuditLogEntry[];
    onImportClients?: (clients: Client[]) => void;
    onImportTasks?: (tasks: Task[]) => void;
}

type SyncMode = 'EXPORT' | 'IMPORT';
type ExportCategory = 'CLIENTS' | 'TASKS' | 'LEADS' | 'USERS' | 'LOGS';

export const ExportData: React.FC<ExportDataProps> = ({ 
    clients, tasks, leads, users, logs, 
    onImportClients, onImportTasks 
}) => {
    const [mode, setMode] = useState<SyncMode>('EXPORT');
    const [selectedCategory, setSelectedCategory] = useState<ExportCategory>('CLIENTS');
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filtros de Exportação
    const [searchTerm, setSearchTerm] = useState('');

    // Estados de Importação
    const [importPreview, setImportPreview] = useState<any[]>([]);
    const [importSummary, setImportSummary] = useState<{ count: number, type: 'CLIENTS' | 'TASKS' | null }>({ count: 0, type: null });

    // --- LÓGICA DE EXPORTAÇÃO ---
    const getFilteredData = () => {
        let baseData: any[] = [];
        switch(selectedCategory) {
            case 'CLIENTS':
                baseData = clients.map(c => ({
                    "ID": c.id, "Nome Fantasia": c.name, "Razão Social": c.companyName, "CNPJ": c.cnpj, 
                    "Regime": c.regime, "Email": c.email, "Telefone": c.phone, "Status": c.status,
                    "Mensalidade": c.monthlyFee, "Responsável": c.responsible.name
                }));
                break;
            case 'TASKS':
                baseData = tasks.map(t => ({
                    "ID": t.id, "Título": t.title, "Cliente": t.clientName || 'Interno',
                    "Status": t.status, "Prioridade": t.priority, "Tipo": t.type,
                    "Vencimento": new Date(t.dueDate).toLocaleDateString('pt-BR')
                }));
                break;
            case 'LEADS':
                baseData = leads.map(l => ({
                    "Nome": l.name, "Contato": l.contactPerson, "Valor": l.value,
                    "Status": l.status, "Origem": l.source, "CriadoEm": new Date(l.createdAt).toLocaleDateString('pt-BR')
                }));
                break;
            case 'USERS':
                baseData = users.map(u => ({
                    "Nome": u.name, "Email": u.email, "Cargo": u.role, "Departamento": u.department || '-'
                }));
                break;
            case 'LOGS':
                baseData = logs.map(log => ({
                    "Data": new Date(log.timestamp).toLocaleString('pt-BR'),
                    "Usuário": log.userName, "Ação": log.action, "Objeto": log.targetName
                }));
                break;
        }

        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            baseData = baseData.filter(row => 
                Object.values(row).some(val => String(val).toLowerCase().includes(low))
            );
        }

        return baseData;
    };

    const handleExport = async (format: 'XLSX' | 'JSON') => {
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 1000));

        const data = getFilteredData();
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `ContabilFlow_${selectedCategory}_${timestamp}`;

        if (format === 'XLSX') {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, selectedCategory);
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
        } else {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.json`;
            link.click();
        }
        setIsProcessing(false);
    };

    // --- LÓGICA DE IMPORTAÇÃO ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target?.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);

                if (data.length > 0) {
                    setImportPreview(data);
                    // Inferir tipo pelo cabeçalho: "CNPJ" indica cliente, "Título" indica tarefa
                    const firstRow = data[0] as any;
                    const isTask = firstRow['Título'] || firstRow['Tarefa'] || firstRow['Title'];
                    setImportSummary({ 
                        count: data.length, 
                        type: isTask ? 'TASKS' : 'CLIENTS' 
                    });
                } else {
                    alert("O arquivo parece estar vazio.");
                }
            } catch (err) {
                alert("Erro ao ler o arquivo. Certifique-se de que é um Excel ou CSV válido.");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = ''; // Reset input
    };

    const confirmImport = () => {
        if (!importSummary.type || importPreview.length === 0) return;
        setIsProcessing(true);
        
        setTimeout(() => {
            if (importSummary.type === 'CLIENTS') {
                const newClients: Client[] = importPreview.map((raw: any) => ({
                    id: 'c-imp-' + Math.random().toString(36).substr(2, 9),
                    name: raw['Nome Fantasia'] || raw['Nome'] || 'Cliente Importado',
                    companyName: raw['Razão Social'] || raw['Empresa'] || '',
                    cnpj: raw['CNPJ'] || '00.000.000/0001-00',
                    regime: (raw['Regime'] || 'Simples Nacional') as TaxRegime,
                    email: raw['Email'] || '',
                    phone: raw['Telefone'] || '',
                    status: 'ACTIVE',
                    monthlyFee: Number(raw['Mensalidade']) || 0,
                    address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
                    responsible: { name: raw['Responsável'] || 'N/A', email: '', phone: '', role: '' },
                    contract: { startDate: new Date().toISOString(), feeDueDate: 5, readjustmentMonth: 'Janeiro' }
                }));
                onImportClients?.(newClients);
            } else {
                const newTasks: Task[] = importPreview.map((raw: any) => ({
                    id: 't-imp-' + Math.random().toString(36).substr(2, 9),
                    pipelineId: 'default',
                    title: raw['Título'] || raw['Tarefa'] || 'Nova Atividade',
                    description: raw['Descrição'] || '',
                    status: 'TODO',
                    priority: (raw['Prioridade']?.toUpperCase() || 'MEDIUM') as TaskPriority,
                    type: 'ADM',
                    dueDate: raw['Vencimento'] || new Date().toISOString(),
                    isInternal: true,
                    subtasks: [], comments: [], tags: [], attachments: []
                }));
                onImportTasks?.(newTasks);
            }
            setIsProcessing(false);
            setImportSummary({ count: 0, type: null });
            setImportPreview([]);
            alert("Importação finalizada com sucesso!");
        }, 1500);
    };

    const downloadTemplate = (type: 'CLIENTS' | 'TASKS') => {
        const data = type === 'CLIENTS' 
            ? [{ "Nome Fantasia": "Empresa Exemplo", "Razão Social": "Exemplo Ltda", "CNPJ": "12.345.678/0001-99", "Regime": "Simples Nacional", "Email": "financeiro@exemplo.com", "Telefone": "(11) 98888-7777", "Mensalidade": 1200, "Responsável": "João Silva" }]
            : [{ "Título": "Apuração Mensal", "Descrição": "Verificar notas fiscais", "Prioridade": "HIGH", "Vencimento": "2024-12-20" }];
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, `Template_ContabilFlow_${type}.xlsx`);
    };

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-700">
            {/* Header com Toggle de Operação */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                        Sincronização de Dados
                    </h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-2">Extração e Migração massiva do workspace</p>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <button 
                        onClick={() => setMode('EXPORT')} 
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'EXPORT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        <Download size={14} /> Extrair
                    </button>
                    <button 
                        onClick={() => setMode('IMPORT')} 
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'IMPORT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        <Upload size={14} /> Importar
                    </button>
                </div>
            </div>

            {mode === 'EXPORT' ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-left-4">
                    {/* Seção de Exportação */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">1. Selecione o Módulo</h3>
                        <div className="grid gap-3">
                            {[
                                { id: 'CLIENTS', label: 'Carteira de Clientes', icon: Building2, count: clients.length, color: 'text-blue-500' },
                                { id: 'TASKS', label: 'Demandas Operacionais', icon: Layers, count: tasks.length, color: 'text-indigo-500' },
                                { id: 'LEADS', label: 'Funil de Vendas', icon: Megaphone, count: leads.length, color: 'text-purple-500' },
                                { id: 'USERS', label: 'Equipe e Usuários', icon: UsersIcon, count: users.length, color: 'text-emerald-500' },
                                { id: 'LOGS', label: 'Logs de Auditoria', icon: History, count: logs.length, color: 'text-gray-400' },
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id as ExportCategory)}
                                    className={`group flex items-center justify-between p-6 rounded-[32px] border-2 transition-all active:scale-95 ${selectedCategory === cat.id ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20 text-white' : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-indigo-500/30'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-900'} ${cat.color} transition-colors group-hover:scale-110 duration-500`}>
                                            <cat.icon size={22} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black uppercase tracking-tight">{cat.label}</p>
                                            <p className={`text-[10px] font-bold ${selectedCategory === cat.id ? 'text-white/60' : 'text-gray-500'}`}>{cat.count} registros</p>
                                        </div>
                                    </div>
                                    {selectedCategory === cat.id && <CheckCircle2 size={20} className="text-white animate-in zoom-in" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="xl:col-span-2 space-y-4">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">2. Refine sua Extração</h3>
                        <div className="bg-white dark:bg-[#09090b] rounded-[44px] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col h-full">
                            <div className="p-8 border-b border-gray-100 dark:border-white/5 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filtro Rápido</label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input 
                                            placeholder="Buscar em qualquer campo..." 
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-transparent focus:border-indigo-500/40 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 bg-black/20 p-10 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="w-24 h-24 bg-indigo-600/10 rounded-[32px] flex items-center justify-center text-indigo-500 animate-float">
                                    <DownloadCloud size={48}/>
                                </div>
                                <div className="max-w-md">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Extrair {selectedCategory}</h3>
                                    <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed">
                                        Clique no formato desejado. O sistema processará os {getFilteredData().length} registros filtrados e iniciará o download automaticamente.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                    <button 
                                        onClick={() => handleExport('XLSX')}
                                        disabled={isProcessing}
                                        className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />} Excel (XLSX)
                                    </button>
                                    <button 
                                        onClick={() => handleExport('JSON')}
                                        disabled={isProcessing}
                                        className="flex-1 py-5 bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 rounded-[24px] font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <FileJson size={18} />} JSON
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-right-4">
                    {/* Seção de Importação */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#09090b] rounded-[44px] border border-gray-100 dark:border-white/5 shadow-2xl p-10 space-y-8">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto">
                                    <UploadCloud size={32}/>
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Carregar Planilha</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Migração massiva para o CRM</p>
                            </div>
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="group cursor-pointer border-2 border-dashed border-white/5 hover:border-indigo-500/40 rounded-[40px] p-14 flex flex-col items-center gap-4 transition-all bg-black/20"
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".xlsx,.xls,.csv" 
                                    onChange={handleFileChange} 
                                />
                                <div className="p-4 bg-white/[0.02] rounded-full group-hover:scale-110 group-hover:text-indigo-500 transition-all text-gray-600">
                                    <FileText size={40} />
                                </div>
                                <div className="text-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 block">Clique para selecionar</span>
                                    <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Excel (.xlsx) ou CSV</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => downloadTemplate('CLIENTS')} 
                                    className="flex items-center justify-center gap-3 p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all"
                                >
                                    <Download size={14} className="text-indigo-500" /> Baixar Template Clientes
                                </button>
                                <button 
                                    onClick={() => downloadTemplate('TASKS')} 
                                    className="flex items-center justify-center gap-3 p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all"
                                >
                                    <Download size={14} className="text-indigo-500" /> Baixar Template Tarefas
                                </button>
                            </div>
                        </div>

                        {/* Tabela de Exemplo Visual */}
                        <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[40px] p-8">
                             <div className="flex items-center gap-3 mb-6">
                                 <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500"><Info size={20}/></div>
                                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Exemplo de Formatação</h4>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-500/20 pb-2">Planilha de Clientes</p>
                                     <div className="overflow-x-auto">
                                        <table className="text-[9px] text-gray-500 font-bold uppercase w-full">
                                            <thead><tr className="text-gray-400"><th>Nome Fantasia</th><th>CNPJ</th><th>Mensalidade</th></tr></thead>
                                            <tbody>
                                                <tr><td>Empresa A</td><td>123...</td><td>1200</td></tr>
                                                <tr><td>Empresa B</td><td>987...</td><td>2500</td></tr>
                                            </tbody>
                                        </table>
                                     </div>
                                 </div>
                                 <div className="space-y-4">
                                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-500/20 pb-2">Planilha de Tarefas</p>
                                     <div className="overflow-x-auto">
                                        <table className="text-[9px] text-gray-500 font-bold uppercase w-full">
                                            <thead><tr className="text-gray-400"><th>Título</th><th>Descrição</th><th>Prioridade</th></tr></thead>
                                            <tbody>
                                                <tr><td>Apuração</td><td>Fazer guia</td><td>HIGH</td></tr>
                                                <tr><td>DAS</td><td>Vencimento</td><td>MEDIUM</td></tr>
                                            </tbody>
                                        </table>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Preview da Importação */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#09090b] rounded-[44px] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col h-full">
                            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Prévia dos Dados Detectados</h3>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                        {importSummary.type ? `${importSummary.count} ${importSummary.type === 'CLIENTS' ? 'Clientes' : 'Tarefas'} encontrados` : 'Aguardando carregar arquivo...'}
                                    </p>
                                </div>
                                {importPreview.length > 0 && (
                                    <button 
                                        onClick={() => {setImportPreview([]); setImportSummary({count: 0, type: null})}} 
                                        className="p-2 text-gray-500 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={20}/>
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 p-8 overflow-auto min-h-[400px] max-h-[500px] custom-scrollbar">
                                {importPreview.length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                {Object.keys(importPreview[0]).map(key => (
                                                    <th key={key} className="px-4 py-3 text-[9px] font-black text-gray-600 uppercase tracking-widest whitespace-nowrap">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {importPreview.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-white/[0.02]">
                                                    {Object.values(row).map((val: any, vIdx) => (
                                                        <td key={vIdx} className="px-4 py-4 text-[10px] font-bold text-gray-400 truncate max-w-[150px]">{String(val)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale py-20">
                                        <Layers size={80} className="mb-6" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Sem dados para prévia</p>
                                    </div>
                                )}
                            </div>

                            {importSummary.type && (
                                <div className="p-8 bg-black/40 border-t border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-emerald-500 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                        <AlertCircle size={18} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Atenção: Revise os dados acima antes de confirmar. Esta ação não pode ser desfeita em massa.</p>
                                    </div>
                                    <button 
                                        onClick={confirmImport}
                                        disabled={isProcessing}
                                        className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
                                        Validar e Inserir no Sistema
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
