
import React, { useState, useMemo } from 'react';
import { 
    Cloud, Folder, File, Search, Plus, Filter, 
    Download, Trash2, Share2, MoreVertical, 
    FileText, Image as ImageIcon, FileCode,
    ChevronRight, HardDrive, ShieldCheck, 
    Clock, Star, LayoutGrid, List, ArrowUpCircle,
    FileArchive, Eye, Lock
} from 'lucide-react';

interface CloudFile {
    id: string;
    name: string;
    type: 'pdf' | 'jpg' | 'png' | 'xlsx' | 'zip' | 'docx';
    category: 'FISCAL' | 'CONTABIL' | 'DP' | 'LEGAL' | 'OUTROS';
    size: string;
    updatedAt: string;
    owner: string;
    isFavorite?: boolean;
}

const MOCK_FILES: CloudFile[] = [
    { id: 'f1', name: 'Balancete_Outubro_2023.pdf', type: 'pdf', category: 'CONTABIL', size: '1.2 MB', updatedAt: '2023-11-01', owner: 'Carlos Gestor', isFavorite: true },
    { id: 'f2', name: 'Folha_Pagamento_TechSol.xlsx', type: 'xlsx', category: 'DP', size: '450 KB', updatedAt: '2023-11-05', owner: 'Beatriz Usuário' },
    { id: 'f3', name: 'Contrato_Social_Silva.pdf', type: 'pdf', category: 'LEGAL', size: '2.8 MB', updatedAt: '2023-10-15', owner: 'Ana Admin' },
    { id: 'f4', name: 'Notas_Servico_Entrada.zip', type: 'zip', category: 'FISCAL', size: '15.4 MB', updatedAt: '2023-11-10', owner: 'João Estagiário' },
];

export const CloudDocs: React.FC = () => {
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('ALL');
    const [files, setFiles] = useState<CloudFile[]>(MOCK_FILES);
    const [isUploadDragging, setIsUploadDragging] = useState(false);

    const filteredFiles = useMemo(() => {
        return files.filter(f => {
            const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'ALL' || f.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [files, searchTerm, activeCategory]);

    const categories = [
        { id: 'ALL', label: 'Todos', icon: Cloud },
        { id: 'FISCAL', label: 'Fiscal', icon: FileText },
        { id: 'CONTABIL', label: 'Contábil', icon: HardDrive },
        { id: 'DP', label: 'Pessoal / DP', icon: Star },
        { id: 'LEGAL', label: 'Societário', icon: ShieldCheck },
    ];

    const getFileIcon = (type: string) => {
        switch(type) {
            case 'pdf': return <FileText className="text-red-500" />;
            case 'xlsx': return <FileCode className="text-emerald-500" />;
            case 'zip': return <FileArchive className="text-amber-500" />;
            default: return <File className="text-indigo-500" />;
        }
    };

    return (
        <div className="h-full flex flex-col gap-8 animate-in fade-in duration-700">
            {/* Header / Stats */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                        Nuvem Docs <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full ml-2">Premium</span>
                    </h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-2">Armazenamento Seguro e Compartilhado</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-3 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="text-right px-4 border-r border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Espaço Utilizado</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">12.4 GB <span className="text-gray-500 text-[10px]">/ 50 GB</span></p>
                    </div>
                    <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: '25%' }}></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {/* Sidebar de Categorias */}
                <div className="w-64 shrink-0 flex flex-col gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                        >
                            <cat.icon size={16} /> {cat.label}
                        </button>
                    ))}
                    <div className="mt-auto p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-[32px] space-y-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Lock size={20}/></div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase leading-relaxed">Criptografia de ponta a ponta ativa no seu workspace.</p>
                    </div>
                </div>

                {/* Explorer Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#09090b] rounded-[50px] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-8 border-b border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex-1 max-w-md relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" size={16} />
                            <input 
                                placeholder="Pesquisar arquivos..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-transparent focus:border-indigo-600 outline-none text-xs font-bold"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mr-4">
                                <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-lg ${viewMode === 'GRID' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400'}`}><LayoutGrid size={16}/></button>
                                <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-lg ${viewMode === 'LIST' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400'}`}><List size={16}/></button>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                                <ArrowUpCircle size={16} /> Upload
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div 
                        className={`flex-1 overflow-y-auto p-10 custom-scrollbar relative transition-colors ${isUploadDragging ? 'bg-indigo-600/5' : ''}`}
                        onDragOver={e => { e.preventDefault(); setIsUploadDragging(true); }}
                        onDragLeave={() => setIsUploadDragging(false)}
                    >
                        {filteredFiles.length > 0 ? (
                            viewMode === 'GRID' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredFiles.map(file => (
                                        <div key={file.id} className="group bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[32px] p-6 hover:border-indigo-500/40 hover:bg-white/[0.03] transition-all duration-300">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center">
                                                    {getFileIcon(file.type)}
                                                </div>
                                                <button className="p-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all"><MoreVertical size={16}/></button>
                                            </div>
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate mb-1" title={file.name}>{file.name}</h4>
                                            <div className="flex items-center gap-2 mb-6">
                                                <span className="text-[9px] font-black text-gray-500 uppercase">{file.size}</span>
                                                <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                                                <span className="text-[9px] font-black text-indigo-500 uppercase">{file.category}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                                                <p className="text-[9px] font-bold text-gray-500">{file.updatedAt}</p>
                                                <div className="flex gap-2">
                                                    <button className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-500 rounded-lg transition-colors"><Eye size={14}/></button>
                                                    <button className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-indigo-500 rounded-lg transition-colors"><Download size={14}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-white/5">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Arquivo</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tamanho</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Atualizado em</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                        {filteredFiles.map(file => (
                                            <tr key={file.id} className="group hover:bg-white/[0.02] transition-all">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        {getFileIcon(file.type)}
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{file.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5"><span className="px-2 py-1 bg-indigo-500/10 text-indigo-500 text-[9px] font-black rounded-lg">{file.category}</span></td>
                                                <td className="px-6 py-5 text-[10px] font-bold text-gray-500">{file.size}</td>
                                                <td className="px-6 py-5 text-[10px] font-bold text-gray-500">{file.updatedAt}</td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"><Download size={16}/></button>
                                                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale py-32">
                                <Folder size={120} className="mb-6" />
                                <p className="text-xl font-black uppercase tracking-[0.5em]">Nenhum arquivo encontrado</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
