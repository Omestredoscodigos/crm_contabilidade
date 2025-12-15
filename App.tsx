import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Pipeline } from './components/Pipeline';
import { ClientList } from './components/ClientList';
import { Reports } from './components/Reports';
import { AIAssistant } from './components/AIAssistant';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { Calendar } from './components/Calendar';
import { SalesCRM } from './components/SalesCRM';
import { LandingPage } from './components/LandingPage';
import { Tickets } from './components/Tickets';
import { CloudDocs } from './components/CloudDocs';
import { ExportData } from './components/ExportData';
import { ServiceCenter } from './components/ServiceCenter';
import { MOCK_USERS, MOCK_CLIENTS, MOCK_TASKS, DEFAULT_COMPANY_PROFILE, DEFAULT_PIPELINES, MOCK_LEADS } from './constants';
import { User, Task, DashboardStats, Client, CompanyProfile, Pipeline as PipelineType, Lead, AuditLogEntry, AuditAction, LogBackup } from './types';
import { apiService } from './services/apiService';
import { Sun, Moon, Menu, Loader2 } from 'lucide-react';

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const workspaceSlug = useMemo(() => {
    const parts = currentHash.split('/');
    if (parts[1] === 'workspace' && parts[2]) return parts[2];
    return null;
  }, [currentHash]);

  const isRegistration = currentHash.startsWith('#/registrar');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estados principais do CRM
  const [pipelines, setPipelines] = useState<PipelineType[]>(DEFAULT_PIPELINES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogBackup, setAuditLogBackup] = useState<LogBackup | null>(null);
  const [activePipelineId, setActivePipelineId] = useState<string>('default');

  // Carregar dados reais do MySQL quando o Workspace é definido
  useEffect(() => {
    if (workspaceSlug) {
        const loadWorkspace = async () => {
            setIsLoadingData(true);
            try {
                const data = await apiService.getWorkspaceData(workspaceSlug);
                if (data.profile) setCompanyProfile(data.profile);
                if (data.users?.length) setUsers(data.users);
                if (data.clients?.length) setClients(data.clients);
                if (data.tasks?.length) setTasks(data.tasks);
                if (data.leads?.length) setLeads(data.leads);
                if (data.pipelines?.length) {
                    setPipelines(data.pipelines);
                    setActivePipelineId(data.pipelines[0].id);
                }
                if (data.audit_logs?.length) setAuditLogs(data.audit_logs);
            } catch (err) {
                console.error("Falha ao carregar workspace remoto, usando cache local.");
            } finally {
                setIsLoadingData(false);
            }
        };
        loadWorkspace();
    }
  }, [workspaceSlug]);

  const addLog = useCallback((action: AuditAction, targetName: string, type: AuditLogEntry['type'] = 'INFO', details?: string, undoPayload?: any) => {
      if (!currentUser) return;
      const newLog: AuditLogEntry = {
          id: 'log-' + Date.now(),
          action,
          targetName,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          timestamp: new Date().toISOString(),
          type,
          details,
          undoData: undoPayload ? JSON.stringify(undoPayload) : undefined,
          reverted: false
      };
      setAuditLogs(prev => [newLog, ...prev].slice(0, 1000));
  }, [currentUser]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const stats: DashboardStats = {
    totalClients: clients.length,
    pendingTasks: tasks.filter(t => t.status !== 'DONE').length,
    revenue: clients.reduce((acc, curr) => acc + curr.monthlyFee, 0),
    tasksDueToday: tasks.filter(t => new Date(t.dueDate).toDateString() === new Date().toDateString()).length
  };

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      addLog('LOGIN', 'Sistema', 'INFO', 'Usuário autenticou-se.');
  };

  const handleUpdateTask = (updatedTask: Task) => {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      if (workspaceSlug) apiService.updateTaskStatus(updatedTask.id, updatedTask.status);
  };

  const handleDeleteTask = (taskId: string) => {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (taskToDelete) {
          addLog('TASK_DELETE', taskToDelete.title, 'CRITICAL', 'Tarefa removida.', taskToDelete);
          setTasks(tasks.filter(t => t.id !== taskId));
      }
  };

  const handleAddTask = (nt: Omit<Task, 'id'>) => {
      const newId = 't-'+Date.now();
      const taskToAdd = {...nt, id: newId, subtasks:[], comments:[], tags:[], attachments:[]} as Task;
      addLog('TASK_CREATE', nt.title, 'SUCCESS', 'Nova tarefa criada.', { id: newId });
      setTasks([...tasks, taskToAdd]);
  };

  if (!workspaceSlug || isRegistration) return <LandingPage />;
  if (!isAuthenticated || !currentUser) return <Login onLogin={handleLogin} companyProfile={companyProfile} />;

  if (isLoadingData) {
      return (
          <div className="h-screen w-full bg-gray-950 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-indigo-500" size={40} />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Sincronizando Workspace...</p>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans overflow-hidden transition-colors duration-500">
      <Sidebar 
        currentUser={currentUser} companyProfile={companyProfile}
        activeTab={activeTab} setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} onLogout={() => setIsAuthenticated(false)} 
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-4">
                <button className="lg:hidden text-gray-500" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={20} /></button>
                <div className="flex flex-col">
                    <h2 className="text-xs font-black text-gray-900 dark:text-white uppercase leading-tight tracking-widest">
                        {activeTab}
                    </h2>
                    <span className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.2em]">{workspaceSlug}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-gray-400 hover:text-indigo-500 transition-colors">
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
            <div className="max-w-[1600px] mx-auto h-full">
                {activeTab === 'dashboard' && <Dashboard stats={stats} currentUser={currentUser} />}
                {activeTab === 'growth' && <SalesCRM leads={leads} clients={clients} onUpdateLeads={setLeads} />}
                {activeTab === 'pipeline' && (
                    <Pipeline 
                        tasks={tasks} users={users} clients={clients} currentUser={currentUser} 
                        pipelines={pipelines} activePipelineId={activePipelineId}
                        onPipelineChange={setActivePipelineId} 
                        onAddPipeline={(n) => { 
                            const newId = 'p-' + Date.now();
                            addLog('SETTINGS_CHANGE', 'Novo Quadro: ' + n); 
                            setPipelines([...pipelines, {id: newId, name: n, columns: [...DEFAULT_PIPELINES[0].columns]}]); 
                            setActivePipelineId(newId); 
                        }}
                        onAddColumn={(pid, l, c) => setPipelines(pipelines.map(p => p.id === pid ? {...p, columns: [...p.columns, {id: 'col-'+Date.now(), label: l, dotColor: c}]} : p))}
                        onDeleteColumn={(pid, cid) => setPipelines(pipelines.map(p => p.id === pid ? {...p, columns: p.columns.filter(c => c.id !== cid)} : p))}
                        onUpdateTask={handleUpdateTask}
                        onReorderTasks={setTasks} 
                        onAddTask={handleAddTask} 
                        onDeleteTask={handleDeleteTask}
                        auditLogs={auditLogs}
                    />
                )}
                {activeTab === 'calendar' && <Calendar />}
                {activeTab === 'tickets' && <Tickets clients={clients} users={users} currentUser={currentUser} />}
                {activeTab === 'reports' && <Reports currentUser={currentUser} />}
                {activeTab === 'cloud' && <CloudDocs />}
                {activeTab === 'export' && (
                    <ExportData 
                        clients={clients} 
                        tasks={tasks} 
                        leads={leads} 
                        users={users} 
                        logs={auditLogs} 
                        onImportClients={(c) => setClients([...clients, ...c])}
                        onImportTasks={(t) => setTasks([...tasks, ...t])}
                    />
                )}
                {activeTab === 'clients' && <ClientList clients={clients} onAddClient={(c) => setClients([...clients, {...c, id: 'c-'+Date.now()}])} onUpdateClient={(c) => setClients(clients.map(cl => cl.id === c.id ? c : cl))} onDeleteClient={(id) => setClients(clients.filter(cl => cl.id !== id))} />}
                {activeTab === 'ai-assistant' && <AIAssistant tasks={tasks} clients={clients} onAddTask={handleAddTask} />}
                {activeTab === 'settings' && (
                    <Settings 
                        currentUser={currentUser} companyProfile={companyProfile} 
                        onUpdateProfile={setCompanyProfile} 
                        users={users} 
                        onAddUser={(u) => setUsers([...users, u])} 
                        onUpdateUser={(u) => setUsers(users.map(us => us.id === u.id ? u : us))} 
                        onDeleteUser={(id) => setUsers(users.filter(us => us.id !== id))} 
                        auditLogs={auditLogs}
                        auditLogBackup={auditLogBackup}
                        onClearLogs={() => setAuditLogs([])}
                        onRestoreLogs={() => {}}
                    />
                )}
            </div>
        </main>
      </div>
    </div>
  );
}