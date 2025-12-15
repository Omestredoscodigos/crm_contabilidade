import React, { useState } from 'react';
import { User, Role, UserPermissions } from '../types';
import { ROLE_PERMISSIONS } from '../constants';
import { Plus, Mail, Edit2, Trash2, X, Shield, CheckCircle2, User as UserIcon, Info } from 'lucide-react';

interface UsersProps {
    users: User[];
    currentUser: User;
    onAddUser: (user: User) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (id: string) => void;
}

const PERMISSION_LABELS: Record<keyof UserPermissions, string> = {
    access_settings: 'Acessar Configurações',
    manage_users: 'Gerenciar Usuários',
    view_audit_logs: 'Ver Logs de Sistema',
    manage_integrations: 'Gerenciar Integrações',
    view_dashboard: 'Ver Dashboard Principal',
    view_financials: 'Ver Financeiro/Faturamento',
    manage_financials: 'Alterar Dados Financeiros',
    export_reports: 'Exportar Relatórios (PDF/Excel)',
    view_pipelines: 'Acessar Quadros Kanban',
    manage_pipelines: 'Criar/Editar Pipelines',
    create_tasks: 'Criar Novas Tarefas',
    delete_tasks: 'Excluir Tarefas do Quadro',
    bulk_task_edit: 'Edição em Massa de Tarefas',
    view_growth: 'Ver Módulo Sales Growth',
    manage_leads: 'Gerenciar Oportunidades',
    delete_leads: 'Excluir Leads/Negócios',
    view_clients: 'Ver Carteira de Clientes',
    manage_clients: 'Editar Ficha de Clientes',
    delete_clients: 'Excluir Clientes da Base',
    view_calendar: 'Acessar Agenda',
    manage_calendar: 'Gerenciar Compromissos',
    use_ai: 'Utilizar AI Advisor (Gemini)',
    view_tickets: 'Visualizar Chamados de Suporte',
    manage_tickets: 'Gerenciar e Responder Chamados'
};

const PERMISSION_GROUPS = [
    { title: 'Administração & Sistema', keys: ['access_settings', 'manage_users', 'view_audit_logs', 'manage_integrations'] as (keyof UserPermissions)[] },
    { title: 'BI & Financeiro', keys: ['view_dashboard', 'view_financials', 'manage_financials', 'export_reports'] as (keyof UserPermissions)[] },
    { title: 'Operacional (Demandas)', keys: ['view_pipelines', 'manage_pipelines', 'create_tasks', 'delete_tasks', 'bulk_task_edit'] as (keyof UserPermissions)[] },
    { title: 'Vendas & Growth', keys: ['view_growth', 'manage_leads', 'delete_leads'] as (keyof UserPermissions)[] },
    { title: 'Atendimento & Suporte', keys: ['view_tickets', 'manage_tickets'] as (keyof UserPermissions)[] },
    { title: 'Gestão de Clientes', keys: ['view_clients', 'manage_clients', 'delete_clients'] as (keyof UserPermissions)[] },
    { title: 'Produtividade & IA', keys: ['view_calendar', 'manage_calendar', 'use_ai'] as (keyof UserPermissions)[] },
];

export const SettingsTabUsers: React.FC<UsersProps> = ({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userForm, setUserForm] = useState<Partial<User>>({
        name: '', email: '', role: 'USER', permissions: { ...ROLE_PERMISSIONS.USER }
    });

    const handleOpenModal = (user?: User) => {
        if (user) { 
            setEditingUser(user); 
            setUserForm({ ...user }); 
        } else { 
            setEditingUser(null); 
            setUserForm({ name: '', email: '', role: 'USER', permissions: { ...ROLE_PERMISSIONS.USER } }); 
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userForm.name || !userForm.email) return;
        if (editingUser) onUpdateUser({ ...editingUser, ...userForm } as User);
        else {
            onAddUser({
                ...userForm as User, id: 'u-' + Date.now(),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userForm.name!)}&background=6366f1&color=fff&bold=true`
            });
        }
        setIsModalOpen(false);
    };

    const togglePermission = (key: keyof UserPermissions) => {
        if (!userForm.permissions) return;
        setUserForm(prev => ({
            ...prev,
            permissions: { ...prev.permissions!, [key]: !prev.permissions![key] }
        }));
    };

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Equipe & Acesso</h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2">Gerencie colaboradores e permissões RBAC</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all"
                >
                    <Plus size={16} /> Convidar Membro
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
                {users.map(user => (
                    <div key={user.id} className="group p-6 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center justify-between hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-6">
                            <img src={user.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/5" />
                            <div>
                                <h4 className="font-black text-white tracking-tight">{user.name}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest"><Mail size={12} className="inline mr-1"/> {user.email}</p>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${user.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-500'}`}>{user.role}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => handleOpenModal(user)} className="p-3 bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all"><Edit2 size={16}/></button>
                            {user.id !== currentUser.id && (
                                <button onClick={() => onDeleteUser(user.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={16}/></button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsModalOpen(false)}></div>
                    <form onSubmit={handleSave} className="relative bg-[#0c0c0e] w-full max-w-4xl h-[90vh] rounded-[50px] shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-[0_10px_40px_rgba(99,102,241,0.4)]"><UserIcon size={28}/></div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{editingUser ? 'Editar Colaborador' : 'Novo Membro'}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Configuração de credenciais e privilégios</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 text-gray-600 hover:text-white transition-all hover:rotate-90 duration-300"><X size={32}/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar bg-black/40">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome Completo</label>
                                    <input required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] px-8 py-5 font-bold text-white outline-none focus:border-indigo-600 transition-all placeholder-gray-800" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Corporativo</label>
                                    <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] px-8 py-5 font-bold text-white outline-none focus:border-indigo-600 transition-all placeholder-gray-800" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block">Nível de Permissão (RBAC)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {(['ADMIN', 'MANAGER', 'USER'] as Role[]).map(role => (
                                        <button key={role} type="button" onClick={() => setUserForm({...userForm, role, permissions: ROLE_PERMISSIONS[role]})} className={`p-8 rounded-[36px] border-2 transition-all flex flex-col items-center gap-4 ${userForm.role === role ? 'bg-indigo-600/10 border-indigo-600 text-white shadow-xl' : 'bg-white/[0.02] border-white/5 text-gray-600 hover:border-white/10'}`}>
                                            <Shield size={24} className={userForm.role === role ? 'text-indigo-400' : ''}/>
                                            <span className="text-xs font-black uppercase tracking-widest">{role}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-10 pt-4">
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block border-b border-white/5 pb-6">Regras Granulares</label>
                                <div className="space-y-12">
                                    {PERMISSION_GROUPS.map((group, gIdx) => (
                                        <div key={gIdx} className="space-y-6">
                                            <h4 className="text-[11px] font-black text-gray-600 uppercase tracking-widest px-1">{group.title}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {group.keys.map((key) => (
                                                    <button key={key} type="button" onClick={() => togglePermission(key)} className={`p-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all border-2 text-left ${userForm.permissions?.[key] ? 'bg-indigo-600/10 border-indigo-600/40 text-indigo-400 shadow-xl' : 'bg-black/20 border-white/5 text-gray-700 opacity-60 hover:opacity-100'}`}>
                                                        <span className="flex-1 pr-4">{PERMISSION_LABELS[key]}</span>
                                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${userForm.permissions?.[key] ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-900 border border-white/5'}`}>
                                                            {userForm.permissions?.[key] ? <CheckCircle2 size={14} strokeWidth={4}/> : <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-white/5 bg-black/60 backdrop-blur-md flex items-center justify-between">
                            <div className="hidden md:flex items-center gap-3 text-[9px] font-black text-gray-700 uppercase tracking-widest">
                                <Info size={14}/> Perfis Admin possuem controle total.
                            </div>
                            <div className="flex gap-6 w-full md:w-auto">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 md:flex-none px-10 py-5 font-black text-gray-500 hover:text-white transition-all uppercase text-[11px] tracking-widest">Cancelar</button>
                                <button type="submit" className="flex-1 md:flex-none px-16 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[24px] shadow-xl transition-all active:scale-95 uppercase text-[11px] tracking-widest">Salvar Acesso</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
