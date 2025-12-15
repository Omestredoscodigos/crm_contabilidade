import React, { useState, useMemo, useRef } from 'react';
import { Task, Client, User, TaskPriority, AuditLogEntry, PipelineColumn, Subtask, Comment, Tag, Attachment, Pipeline as PipelineType } from '../types';
import { 
    Plus, Search, X, Calendar, CheckSquare, MessageSquare, 
    Trash2, Filter, LayoutGrid, List, MoreHorizontal, 
    Clock, Tag as TagIcon, Paperclip, Send, ChevronRight,
    AlignLeft, User as UserIcon, Upload, File as FileIcon, Download,
    Layout, CalendarPlus, Save, Palette, AlertCircle, GripVertical,
    CheckCircle2, Square, ChevronDown, ChevronUp, FileText, DownloadCloud,
    RotateCcw, Layers
} from 'lucide-react';

interface PipelineProps {
  tasks: Task[];
  clients: Client[];
  users: User[];
  currentUser: User;
  
  pipelines: PipelineType[];
  activePipelineId: string;
  onPipelineChange: (id: string) => void;
  onAddPipeline: (name: string) => void;
  onAddColumn: (pipelineId: string, label: string, color: string) => void;
  onDeleteColumn: (pipelineId: string, columnId: string) => void;

  onUpdateTask: (task: Task) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  auditLogs: AuditLogEntry[];
}

const COLUMN_COLORS = [
    { label: 'Cinza', value: 'bg-gray-400' },
    { label: 'Azul', value: 'bg-blue-500' },
    { label: 'Índigo', value: 'bg-indigo-500' },
    { label: 'Roxo', value: 'bg-purple-500' },
    { label: 'Esmeralda', value: 'bg-emerald-500' },
    { label: 'Rosa', value: 'bg-pink-500' },
    { label: 'Laranja', value: 'bg-orange-500' },
    { label: 'Âmbar', value: 'bg-amber-500' },
];

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config: any = {
    LOW: { bg: 'bg-gray-800/50', text: 'text-gray-400', label: 'BAIXA' },
    MEDIUM: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'MÉDIA' },
    HIGH: { bg: 'bg-orange-950/40', text: 'text-orange-500', label: 'ALTA' },
    CRITICAL: { bg: 'bg-red-950/40', text: 'text-red-500', label: 'URGENTE' },
  };
  const style = config[priority] || config.LOW;
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${style.bg} ${style.text} border border-white/5`}>
      {style.label}
    </span>
  );
};

export const Pipeline: React.FC<PipelineProps> = ({ 
    tasks, onUpdateTask, onReorderTasks, onAddTask, onDeleteTask, 
    users, clients, currentUser,
    pipelines, activePipelineId, onPipelineChange, onAddPipeline, onAddColumn, onDeleteColumn
}) => {
  
  const [viewMode, setViewMode] = useState<'BOARD' | 'LIST'>('BOARD');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalTab, setModalTab] = useState<'CHECKLIST' | 'COMMENTS' | 'ATTACHMENTS'>('CHECKLIST');
  
  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // States for subtasks
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDesc, setNewSubtaskDesc] = useState('');
  const [newSubtaskNotes, setNewSubtaskNotes] = useState('');
  const [expandedSubtask, setExpandedSubtask] = useState<string | null>(null);

  // States for comments
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // States for pipelines/columns
  const [isNewPipelineModalOpen, setIsNewPipelineModalOpen] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [newColumnData, setNewColumnData] = useState({ label: '', color: 'bg-indigo-500' });

  const activePipeline = pipelines.find(p => p.id === activePipelineId) || pipelines[0];
  const columns = activePipeline ? activePipeline.columns : [];

  const filteredTasks = useMemo(() => {
      const pipelineTasks = tasks.filter(t => t.pipelineId === activePipelineId);
      return pipelineTasks.filter(t => {
          const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (t.clientName || '').toLowerCase().includes(searchTerm.toLowerCase());
          const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
          return matchesSearch && matchesPriority;
      });
  }, [tasks, searchTerm, filterPriority, activePipelineId]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
      setDraggedTaskId(taskId);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropColumn = (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      if (!draggedTaskId) return;
      const task = tasks.find(t => t.id === draggedTaskId);
      if (task && task.status !== columnId) {
          onUpdateTask({ ...task, status: columnId });
      }
      setDraggedTaskId(null);
  };

  const handleSaveTask = () => {
    if (!editingTask) return;
    if (editingTask.id) {
        onUpdateTask(editingTask);
    } else {
        onAddTask(editingTask);
    }
    setIsModalOpen(false);
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  const handleDeleteCurrentTask = (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      openConfirm(
          "Excluir Tarefa?",
          "Deseja realmente excluir esta atividade? Todos os dados vinculados serão perdidos permanentemente.",
          () => {
              onDeleteTask(id);
              if (editingTask?.id === id) setIsModalOpen(false);
              setConfirmDialog(p => ({ ...p, isOpen: false }));
          }
      );
  };

  const handleDeleteColumnRequest = (colId: string) => {
      const hasTasks = tasks.some(t => t.status === colId && t.pipelineId === activePipelineId);
      if (hasTasks) {
          openConfirm("Coluna Ocupada", "Esta etapa possui tarefas ativas e não pode ser removida no momento.", () => setConfirmDialog(p => ({...p, isOpen: false})));
          return;
      }
      openConfirm(
          "Excluir Etapa?",
          "Tem certeza que deseja remover esta etapa do funil?",
          () => {
              onDeleteColumn(activePipelineId, colId);
              setConfirmDialog(p => ({ ...p, isOpen: false }));
          }
      );
  };

  const handleCreatePipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPipelineName.trim()) return;
    onAddPipeline(newPipelineName);
    setNewPipelineName('');
    setIsNewPipelineModalOpen(false);
  };

  // --- SUBTASKS LOGIC ---
  const handleAddSubtask = () => {
    if (!editingTask || !newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
        id: 'st-' + Date.now(),
        title: newSubtaskTitle,
        description: newSubtaskDesc,
        notes: newSubtaskNotes,
        completed: false
    };
    setEditingTask({
        ...editingTask,
        subtasks: [...(editingTask.subtasks || []), newSub]
    });
    setNewSubtaskTitle('');
    setNewSubtaskDesc('');
    setNewSubtaskNotes('');
  };

  const toggleSubtask = (subId: string) => {
    if (!editingTask) return;
    setEditingTask({
        ...editingTask,
        subtasks: editingTask.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
    });
  };

  const removeSubtask = (subId: string) => {
    if (!editingTask) return;
    setEditingTask({
        ...editingTask,
        subtasks: editingTask.subtasks.filter(s => s.id !== subId)
    });
  };

  // --- COMMENTS LOGIC ---
  const handleAddComment = () => {
      if (!editingTask || !newComment.trim()) return;
      const comment: Comment = {
          id: 'c-' + Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text: newComment,
          createdAt: new Date().toISOString()
      };
      setEditingTask({
          ...editingTask,
          comments: [...(editingTask.comments || []), comment]
      });
      setNewComment('');
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // --- ATTACHMENTS LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editingTask) return;
      const newAttach: Attachment = {
          id: 'at-' + Date.now(),
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(1) + ' KB',
          url: '#',
          uploadedAt: new Date().toISOString()
      };
      setEditingTask({
          ...editingTask,
          attachments: [...(editingTask.attachments || []), newAttach]
      });
  };

  const removeAttachment = (id: string) => {
      if (!editingTask) return;
      setEditingTask({
          ...editingTask,
          attachments: editingTask.attachments.filter(a => a.id !== id)
      });
  };

  const markTaskAsDone = () => {
    if (!editingTask) return;
    setEditingTask({ ...editingTask, status: 'DONE' });
  };

  const handleAddNewColumn = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newColumnData.label) return;
      onAddColumn(activePipelineId, newColumnData.label, newColumnData.color);
      setIsAddColumnModalOpen(false);
      setNewColumnData({ label: '', color: 'bg-indigo-500' });
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
        
        {/* NAVEGAÇÃO DE QUADROS */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-4 no-scrollbar">
            {pipelines.map((pipeline) => (
                <button
                    key={pipeline.id}
                    onClick={() => onPipelineChange(pipeline.id)}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 whitespace-nowrap border-2 ${
                        activePipelineId === pipeline.id 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-500/40 translate-y-[-1px]' 
                        : 'bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-500 border-gray-100 dark:border-gray-800 hover:border-indigo-500/30'
                    }`}
                >
                    <Layout size={12} className={activePipelineId === pipeline.id ? 'animate-pulse' : ''} />
                    {pipeline.name}
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] ml-1 ${activePipelineId === pipeline.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {tasks.filter(t => t.pipelineId === pipeline.id).length}
                    </span>
                </button>
            ))}
            <button 
                onClick={() => setIsNewPipelineModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-[16px] text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 active:scale-95 uppercase tracking-widest"
            >
                <Plus size={12} strokeWidth={3} /> Criar Quadro
            </button>
        </div>

        {/* BARRA DE BUSCA E FILTROS */}
        <div className="flex flex-wrap items-center gap-4 mb-8 bg-white dark:bg-gray-950 p-3 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm animate-in slide-in-from-top-4">
            <div className="flex-1 relative group min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
                <input 
                    type="text" 
                    placeholder="Pesquisar demanda ou cliente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-indigo-500 outline-none text-xs font-bold text-gray-900 dark:text-white transition-all"
                />
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-transparent">
                    <Filter size={12} className="text-gray-400" />
                    <select 
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="bg-transparent text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest outline-none cursor-pointer"
                    >
                        <option value="ALL">Todas Prioridades</option>
                        <option value="LOW">Baixa</option>
                        <option value="MEDIUM">MÉDIA</option>
                        <option value="HIGH">Alta</option>
                        <option value="CRITICAL">Urgente</option>
                    </select>
                </div>

                {(searchTerm || filterPriority !== 'ALL') && (
                    <button 
                        onClick={() => { setSearchTerm(''); setFilterPriority('ALL'); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all uppercase tracking-widest"
                    >
                        <RotateCcw size={12} /> Limpar
                    </button>
                )}
            </div>
        </div>

        {viewMode === 'BOARD' && (
            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-4 h-full min-w-max px-1">
                    {columns.map((col, cIdx) => {
                        const colTasks = filteredTasks.filter(t => t.status === col.id);
                        return (
                            <div 
                                key={col.id}
                                onDragOver={e => e.preventDefault()}
                                onDrop={(e) => handleDropColumn(e, col.id)}
                                className={`w-[290px] flex flex-col h-full bg-gray-100/20 dark:bg-gray-900/10 rounded-[28px] border border-gray-100 dark:border-gray-800/40 group/col transition-all duration-500 animate-in slide-in-right stagger-${cIdx+1}`}
                            >
                                <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800/80">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shadow-glow`}></div>
                                        <span className="font-black text-gray-900 dark:text-white text-[10px] uppercase tracking-widest">{col.label}</span>
                                        <span className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-lg text-[9px] font-black border border-gray-200 dark:border-gray-700 shadow-sm">{colTasks.length}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteColumnRequest(col.id)}
                                        className="p-1.5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover/col:opacity-100"
                                    >
                                        <Trash2 size={12}/>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4 pt-4 custom-scrollbar">
                                    {colTasks.length > 0 ? colTasks.map((task) => {
                                        const progress = task.subtasks?.length > 0 
                                            ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100) 
                                            : 0;

                                        return (
                                            <div 
                                                key={task.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                                                className="bg-gray-950 p-5 rounded-[24px] border border-indigo-500/20 shadow-lg cursor-grab active:cursor-grabbing transition-all duration-300 group relative animate-in slide-up overflow-hidden"
                                            >
                                                <button 
                                                    onClick={(e) => handleDeleteCurrentTask(task.id, e)}
                                                    className="absolute top-3 right-3 p-1.5 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-20"
                                                >
                                                    <Trash2 size={10} strokeWidth={3} />
                                                </button>

                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-500/10">
                                                        {task.isInternal ? 'ESCRITÓRIO' : task.clientName?.toUpperCase()}
                                                    </span>
                                                    <PriorityBadge priority={task.priority} />
                                                </div>

                                                <h4 className="font-bold text-indigo-500 text-[14px] mb-6 leading-tight tracking-tight group-hover:translate-x-1 transition-transform">{task.title}</h4>

                                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-black">
                                                            <CheckSquare size={12} className={progress === 100 ? 'text-emerald-500' : 'text-gray-500'} />
                                                            <span className={progress === 100 ? 'text-emerald-500' : ''}>{progress}%</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-black">
                                                            <Clock size={12} className="text-gray-500" />
                                                            <span>{new Date(task.dueDate).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {task.assigneeId && (
                                                        <div className="relative">
                                                            <img 
                                                                src={users.find(u => u.id === task.assigneeId)?.avatar} 
                                                                className="relative w-7 h-7 rounded-lg ring-1 ring-indigo-500/20 object-cover shadow-md group-hover:scale-110 transition-transform" 
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-20 grayscale scale-90">
                                            <Layers size={32} className="mb-2 text-gray-500" />
                                            <p className="text-[9px] font-black uppercase tracking-widest">Sem tarefas</p>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => { setEditingTask({ id:'', pipelineId: activePipelineId, title:'', status: col.id, priority:'MEDIUM', dueDate: new Date().toISOString(), subtasks:[], comments:[], attachments:[], tags:[], isInternal: true, type:'ADM', description:'' }); setIsModalOpen(true); }}
                                        className="w-full py-4 border-2 border-dashed border-white/5 rounded-[24px] text-[9px] font-black text-gray-600 uppercase tracking-widest hover:border-indigo-500/40 hover:text-indigo-500 hover:bg-gray-900/40 transition-all active:scale-95"
                                    >
                                        + Nova Atividade
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <div className="w-[290px] shrink-0">
                        <button 
                            onClick={() => setIsAddColumnModalOpen(true)}
                            className="w-full h-full min-h-[400px] bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[28px] flex flex-col items-center justify-center gap-3 text-gray-600 hover:text-indigo-500 hover:border-indigo-500/30 transition-all group"
                        >
                            <div className="p-4 bg-gray-900 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                                <Plus size={24} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Adicionar Etapa</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL CRIAR NOVO QUADRO */}
        {isNewPipelineModalOpen && (
            <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsNewPipelineModalOpen(false)}></div>
                <form onSubmit={handleCreatePipeline} className="relative bg-white dark:bg-gray-950 w-full max-w-md rounded-[32px] shadow-2xl p-8 border border-white/5 animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Novo Quadro de Gestão</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Defina um novo escopo operacional</p>
                        </div>
                        <button type="button" onClick={() => setIsNewPipelineModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Nome do Quadro</label>
                            <input 
                                autoFocus
                                required 
                                value={newPipelineName} 
                                onChange={e => setNewPipelineName(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none font-bold text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20" 
                                placeholder="Ex: Onboarding de Clientes" 
                            />
                        </div>
                        <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 uppercase text-[10px] tracking-widest transition-all">
                            Criar Quadro
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* MODAL ADICIONAR COLUNA (ETAPA) */}
        {isAddColumnModalOpen && (
            <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddColumnModalOpen(false)}></div>
                <form onSubmit={handleAddNewColumn} className="relative bg-white dark:bg-gray-950 w-full max-w-md rounded-[32px] shadow-2xl p-8 border border-white/5 animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Nova Etapa do Funil</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Configure o fluxo operacional</p>
                        </div>
                        <button type="button" onClick={() => setIsAddColumnModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Nome da Etapa</label>
                            <input 
                                autoFocus
                                required 
                                value={newColumnData.label} 
                                onChange={e => setNewColumnData(prev => ({...prev, label: e.target.value}))} 
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none font-bold text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20" 
                                placeholder="Ex: Conferência DP" 
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Palette size={12}/> Cor de Identificação
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {COLUMN_COLORS.map(color => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setNewColumnData(prev => ({...prev, color: color.value}))}
                                        className={`h-10 rounded-xl border-2 transition-all ${newColumnData.color === color.value ? 'border-indigo-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'} ${color.value}`}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 uppercase text-[10px] tracking-widest transition-all">
                            Adicionar Etapa
                        </button>
                    </div>
                </form>
            </div>
        )}

        {isModalOpen && editingTask && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsModalOpen(false)}></div>
                <div className="relative bg-[#09090b] w-full max-w-6xl h-[85vh] rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 border border-white/5">
                    
                    <div className="flex justify-between items-center px-10 py-6 border-b border-white/5 bg-white/[0.01]">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-[18px] shadow-xl flex items-center justify-center">
                                <CheckSquare size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tighter">{editingTask.id ? 'Operação Contábil' : 'Nova Demanda'}</h2>
                                <div className="flex items-center gap-2.5 mt-1">
                                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{activePipeline.name}</p>
                                    <div className="w-0.5 h-0.5 rounded-full bg-gray-700"></div>
                                    <span className="px-2 py-0.5 bg-indigo-500/10 rounded-md text-[8px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                                        {columns.find(c => c.id === editingTask.status)?.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {editingTask.id && (
                                <button onClick={() => handleDeleteCurrentTask(editingTask.id!)} className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                    <Trash2 size={20} />
                                </button>
                            )}
                            {editingTask.status !== 'DONE' && (
                                <button onClick={markTaskAsDone} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white hover:bg-emerald-400 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all">
                                    <CheckCircle2 size={14} /> Finalizar
                                </button>
                            )}
                            <button onClick={() => setIsModalOpen(false)} className="p-3 text-gray-500 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10 bg-black/10">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Título da Demanda</label>
                                <input 
                                    type="text" 
                                    value={editingTask.title} 
                                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} 
                                    className="w-full text-2xl font-black bg-transparent border-b-2 border-white/5 pb-4 focus:border-indigo-600 transition-all text-white placeholder-gray-800 outline-none" 
                                    placeholder="Ex: Apuração DAS Mensal" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Empresa Vinculada</label>
                                    <select 
                                        value={editingTask.isInternal ? 'INTERNAL' : editingTask.clientId || ''} 
                                        onChange={(e) => {
                                            if(e.target.value === 'INTERNAL') setEditingTask({...editingTask, isInternal: true, clientId: undefined, clientName: undefined});
                                            else { const c = clients.find(cl => cl.id === e.target.value); setEditingTask({...editingTask, isInternal: false, clientId: c?.id, clientName: c?.name}); }
                                        }}
                                        className="w-full bg-white/[0.02] rounded-xl px-5 py-3.5 text-xs font-bold text-white border border-white/5 focus:border-indigo-600 outline-none appearance-none"
                                    >
                                        <option value="INTERNAL">INTERNO (ESCRITÓRIO)</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Nível de Urgência</label>
                                    <select 
                                        value={editingTask.priority} 
                                        onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as TaskPriority})} 
                                        className="w-full bg-white/[0.02] rounded-xl px-5 py-3.5 text-xs font-bold text-white border border-white/5 focus:border-indigo-600 outline-none appearance-none"
                                    >
                                        <option value="LOW">BAIXA PRIORIDADE</option>
                                        <option value="MEDIUM">MÉDIA PRIORIDADE</option>
                                        <option value="HIGH">ALTA PRIORIDADE</option>
                                        <option value="CRITICAL">URGENTE / CRÍTICA</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Instruções Operacionais</label>
                                <textarea 
                                    rows={4} 
                                    value={editingTask.description} 
                                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} 
                                    className="w-full bg-white/[0.02] rounded-2xl p-6 text-xs font-medium text-gray-300 outline-none border border-white/5 focus:border-indigo-600 transition-all resize-none" 
                                    placeholder="Descreva o procedimento detalhado..." 
                                />
                            </div>
                        </div>

                        {/* ABAS LATERAIS */}
                        <div className="w-full lg:w-[420px] bg-[#0d0d0d] border-l border-white/5 flex flex-col">
                            <div className="flex bg-[#0d0d0d]">
                                {[
                                    { id: 'CHECKLIST', label: 'Checklist', icon: CheckSquare },
                                    { id: 'COMMENTS', label: 'Conversa', icon: MessageSquare },
                                    { id: 'ATTACHMENTS', label: 'Arquivos', icon: Paperclip }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setModalTab(tab.id as any)}
                                        className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-6 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 ${modalTab === tab.id ? 'text-white border-indigo-600 bg-white/[0.02]' : 'text-gray-600 border-transparent hover:text-gray-400'}`}
                                    >
                                        <tab.icon size={16} className={modalTab === tab.id ? 'text-indigo-500' : ''} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {modalTab === 'CHECKLIST' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Subtarefas</h4>
                                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                                {editingTask.subtasks?.filter(s => s.completed).length}/{editingTask.subtasks?.length || 0}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {editingTask.subtasks?.map((sub) => (
                                                <div key={sub.id} className="flex flex-col gap-2 p-4 bg-white/[0.01] border border-white/5 rounded-xl group/item hover:border-indigo-500/20 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={() => toggleSubtask(sub.id)}
                                                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${sub.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'border-gray-800 hover:border-indigo-500'}`}
                                                        >
                                                            {sub.completed && <CheckCircle2 size={12} />}
                                                        </button>
                                                        <span className={`flex-1 text-[11px] font-black transition-all uppercase tracking-tight ${sub.completed ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                                                            {sub.title}
                                                        </span>
                                                        <button onClick={() => setExpandedSubtask(expandedSubtask === sub.id ? null : sub.id)} className="p-1.5 text-gray-600 hover:text-indigo-400 transition-colors">
                                                            {expandedSubtask === sub.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                                        </button>
                                                        <button onClick={() => removeSubtask(sub.id)} className="opacity-0 group-hover/item:opacity-100 p-1.5 text-gray-600 hover:text-red-500 transition-all">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    {expandedSubtask === sub.id && (
                                                        <div className="pl-9 space-y-3 animate-in slide-down duration-300">
                                                            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{sub.description || 'Sem descrição.'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-6 border-t border-white/5 space-y-3">
                                            <input 
                                                type="text" 
                                                value={newSubtaskTitle}
                                                onChange={e => setNewSubtaskTitle(e.target.value)}
                                                placeholder="Nova subtarefa..." 
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-[11px] font-black text-white outline-none focus:border-indigo-600 placeholder-gray-800" 
                                            />
                                            <button 
                                                onClick={handleAddSubtask}
                                                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                            >
                                                Adicionar ao Checklist
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {modalTab === 'COMMENTS' && (
                                    <div className="flex flex-col h-full animate-in fade-in duration-300">
                                        <div className="flex-1 space-y-6 pb-6 overflow-y-auto no-scrollbar">
                                            {editingTask.comments?.length > 0 ? editingTask.comments.map((msg) => (
                                                <div key={msg.id} className={`flex gap-3 ${msg.userId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                                                    <img src={msg.userAvatar} className="w-8 h-8 rounded-lg shadow-lg border border-white/5" />
                                                    <div className={`max-w-[85%] space-y-1 ${msg.userId === currentUser.id ? 'items-end' : ''}`}>
                                                        <div className="flex items-center gap-2 mb-0.5 px-1">
                                                            <p className="text-[9px] font-black text-gray-500 uppercase">{msg.userName}</p>
                                                            <p className="text-[8px] font-black text-gray-700">{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                                        </div>
                                                        <div className={`p-3.5 rounded-2xl text-[11px] font-medium leading-relaxed shadow-lg ${msg.userId === currentUser.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/[0.03] text-gray-300 rounded-tl-none border border-white/5'}`}>
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="h-full flex flex-col items-center justify-center opacity-10 py-16">
                                                    <MessageSquare size={48} className="mb-4 text-gray-400" />
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Mural Vazio</p>
                                                </div>
                                            )}
                                            <div ref={commentsEndRef} />
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <div className="flex gap-2 bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 focus-within:border-indigo-600/30 transition-all">
                                                <input 
                                                    value={newComment}
                                                    onChange={e => setNewComment(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                                                    placeholder="Digite uma nota..." 
                                                    className="flex-1 bg-transparent px-3 text-[11px] font-bold text-white outline-none placeholder-gray-800" 
                                                />
                                                <button onClick={handleAddComment} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg active:scale-90">
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {modalTab === 'ATTACHMENTS' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <label className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-500/10 border border-dashed border-indigo-500/30 text-indigo-400 rounded-2xl cursor-pointer hover:bg-indigo-500/20 transition-all font-black uppercase text-[10px] tracking-widest">
                                            <Upload size={16} /> Carregar Arquivo
                                            <input type="file" className="hidden" onChange={handleFileUpload} />
                                        </label>

                                        <div className="grid grid-cols-1 gap-3">
                                            {editingTask.attachments?.length > 0 ? editingTask.attachments.map((file) => (
                                                <div key={file.id} className="flex items-center gap-3 p-4 bg-white/[0.01] border border-white/5 rounded-xl group/file">
                                                    <div className="w-10 h-10 bg-indigo-500/5 text-indigo-500 rounded-lg flex items-center justify-center">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-black text-white truncate uppercase">{file.name}</p>
                                                        <p className="text-[8px] font-bold text-gray-600 uppercase">{file.size} • {new Date(file.uploadedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button className="p-2 bg-white/5 text-gray-400 hover:text-indigo-400 rounded-lg"><Download size={14}/></button>
                                                        <button onClick={() => removeAttachment(file.id)} className="p-2 bg-white/5 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 size={14}/></button>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="py-16 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center opacity-10 grayscale">
                                                    <DownloadCloud size={40} className="mb-4" />
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Repositório Vazio</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-black flex justify-end gap-4">
                        <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 rounded-xl font-black text-gray-600 hover:text-white transition-all uppercase text-[10px] tracking-widest">Descartar</button>
                        <button onClick={handleSaveTask} className="px-12 py-4 rounded-xl bg-indigo-600 text-white font-black shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 uppercase text-[10px] tracking-widest">Salvar Alterações</button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO CUSTOMIZADO */}
        {confirmDialog.isOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
                <div className="bg-white dark:bg-[#09090b] w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-white/5 text-center animate-in zoom-in-95">
                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 tracking-tight">{confirmDialog.title}</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-8 leading-relaxed px-2 font-medium">{confirmDialog.message}</p>
                    <div className="flex gap-2.5">
                        <button onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-3 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
                        <button onClick={confirmDialog.onConfirm} className="flex-1 py-3 bg-red-600 text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg transition-all active:scale-95">Confirmar</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};