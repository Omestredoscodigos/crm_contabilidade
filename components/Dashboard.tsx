import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadialBarChart, RadialBar, Cell
} from 'recharts';
import { DashboardStats, DashboardWidgetConfig, WidgetType, User } from '../types';
import { 
  MOCK_REVENUE_HISTORY, DEFAULT_WIDGETS 
} from '../constants';
import { 
  TrendingUp, Users, Settings2, Activity, Lock,
  Clock, Zap, ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, currentUser }) => {
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(DEFAULT_WIDGETS);
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleWidget = (id: WidgetType) => {
      setWidgets(prev => prev.map(w => w.id === id ? { ...w, isVisible: !w.isVisible } : w));
  };

  const isVisible = (id: WidgetType) => widgets.find(w => w.id === id)?.isVisible;
  const canViewFinancials = currentUser.permissions.view_financials;

  const productivityData = useMemo(() => [
    { name: 'Concluído', uv: 85, fill: '#6366f1' },
    { name: 'Pendente', uv: 100, fill: 'rgba(229, 231, 235, 0.1)' },
  ], []);

  const RestrictedWidget = () => (
      <div className="absolute inset-0 bg-white/60 dark:bg-gray-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center rounded-[32px] animate-in fade-in">
          <Lock size={24} className="text-gray-400 mb-3" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Acesso Restrito</span>
      </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in slide-up duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Estatísticas</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium italic mt-1">Bem-vindo de volta, {currentUser.name}.</p>
        </div>
        
        <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 ${
                isEditMode 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/30' 
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:border-indigo-500'
            }`}
        >
            <Settings2 size={14} className={isEditMode ? 'animate-spin' : ''} />
            {isEditMode ? 'Salvar Layout' : 'Configurar Painel'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
              { label: 'Receita Mensal', val: `R$ ${stats.revenue.toLocaleString('pt-BR')}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-500/10', restricted: !canViewFinancials, detail: '+12% este mês' },
              { label: 'Empresas Ativas', val: stats.totalClients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10', restricted: false, detail: 'Base estável' },
              { label: 'Demandas Abertas', val: stats.pendingTasks, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-500/10', restricted: false, detail: '5 finalizadas hoje' },
              { label: 'Vencendo Agora', val: stats.tasksDueToday, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-500/10', restricted: false, detail: 'Prioridade alta' }
          ].map((kpi, idx) => (
              <div key={idx} className={`relative bg-white dark:bg-gray-900 p-7 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group animate-in slide-up stagger-${idx+1}`}>
                  {kpi.restricted && <RestrictedWidget />}
                  <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform duration-500`}>
                          <kpi.icon size={22} />
                      </div>
                      <ArrowUpRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{kpi.label}</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{kpi.val}</h3>
                  <p className="mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.detail}</p>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {isVisible('REVENUE_CHART') && (
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-2xl animate-in slide-up stagger-1">
                  {!canViewFinancials && <RestrictedWidget />}
                  <div className="flex justify-between items-center mb-10">
                      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Curva de Faturamento</h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black">2024</span>
                      </div>
                  </div>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_REVENUE_HISTORY}>
                          <defs>
                            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107, 114, 128, 0.05)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 800}} dy={15} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 800}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', background: '#111827', color: '#fff' }}
                            itemStyle={{ color: '#6366f1' }}
                          />
                          <Area type="monotone" dataKey="current" stroke="#6366f1" strokeWidth={4} fill="url(#revGradient)" animationDuration={2000} />
                        </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          )}

          {isVisible('PRODUCTIVITY_RADIAL') && (
              <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center animate-in slide-up stagger-2">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 w-full">Eficiência</h3>
                  <div className="flex-1 min-h-[250px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="75%" outerRadius="100%" barSize={20} data={productivityData} startAngle={90} endAngle={-270}>
                          <RadialBar background cornerRadius={20} dataKey="uv" />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-4xl font-black text-gray-900 dark:text-white">85%</span>
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Meta Batida</span>
                      </div>
                  </div>
                  <div className="mt-6 flex justify-center gap-6 w-full pt-6 border-t border-gray-50 dark:border-gray-800">
                      <div className="text-center">
                          <p className="text-2xl font-black text-emerald-500">42</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Concluídas</p>
                      </div>
                      <div className="text-center">
                          <p className="text-2xl font-black text-gray-400">08</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Restantes</p>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {isEditMode && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-950/80 backdrop-blur-xl text-white p-8 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col gap-6 min-w-[400px] border border-white/10 animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-[0.25em] text-indigo-400">Ativar Widgets</h3>
                  <Zap size={16} className="text-indigo-500 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                  {widgets.map(w => (
                      <button 
                        key={w.id} 
                        onClick={() => toggleWidget(w.id)}
                        className={`px-5 py-4 rounded-[20px] text-[10px] font-black border-2 transition-all active:scale-90 uppercase tracking-widest ${w.isVisible ? 'bg-indigo-600 border-indigo-500 shadow-glow' : 'bg-gray-900 border-gray-800 text-gray-600'}`}
                      >
                          {w.label}
                      </button>
                  ))}
              </div>
              <button onClick={() => setIsEditMode(false)} className="w-full py-4 bg-white text-black font-black rounded-2xl text-[11px] mt-2 uppercase tracking-widest transition-transform active:scale-95">Concluir Edição</button>
          </div>
      )}
    </div>
  );
};