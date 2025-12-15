
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart
} from 'recharts';
import { 
  Calendar, FileText, 
  TrendingUp, TrendingDown, DollarSign, Users, CheckCircle2, 
  Briefcase, FileSpreadsheet, Loader2, Layers, User as UserIcon, CalendarDays, Filter
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { User } from '../types';

// --- DATA GENERATORS ---

// Gera dados mensais consolidados (Visão Macro)
const FULL_FINANCIAL_DATA = [
  { month: 'Jan', dateISO: '2023-01-15', receita: 45000, despesas: 32000, lucro: 13000, year: 2023 },
  { month: 'Fev', dateISO: '2023-02-15', receita: 52000, despesas: 34000, lucro: 18000, year: 2023 },
  { month: 'Mar', dateISO: '2023-03-15', receita: 48000, despesas: 33000, lucro: 15000, year: 2023 },
  { month: 'Abr', dateISO: '2023-04-15', receita: 61000, despesas: 38000, lucro: 23000, year: 2023 },
  { month: 'Mai', dateISO: '2023-05-15', receita: 58000, despesas: 36000, lucro: 22000, year: 2023 },
  { month: 'Jun', dateISO: '2023-06-15', receita: 65000, despesas: 41000, lucro: 24000, year: 2023 },
  { month: 'Jul', dateISO: '2023-07-15', receita: 72000, despesas: 44000, lucro: 28000, year: 2023 },
  { month: 'Ago', dateISO: '2023-08-15', receita: 75000, despesas: 46000, lucro: 29000, year: 2023 },
  { month: 'Set', dateISO: '2023-09-15', receita: 68000, despesas: 42000, lucro: 26000, year: 2023 },
  { month: 'Out', dateISO: '2023-10-15', receita: 80000, despesas: 48000, lucro: 32000, year: 2023 },
  { month: 'Nov', dateISO: '2023-11-15', receita: 85000, despesas: 50000, lucro: 35000, year: 2023 },
  { month: 'Dez', dateISO: '2023-12-15', receita: 95000, despesas: 55000, lucro: 40000, year: 2023 },
  { month: 'Jan', dateISO: '2024-01-15', receita: 50000, despesas: 35000, lucro: 15000, year: 2024 },
  { month: 'Fev', dateISO: '2024-02-15', receita: 55000, despesas: 36000, lucro: 19000, year: 2024 },
  { month: 'Mar', dateISO: '2024-03-15', receita: 53000, despesas: 34500, lucro: 18500, year: 2024 },
  { month: 'Abr', dateISO: '2024-04-15', receita: 60000, despesas: 39000, lucro: 21000, year: 2024 },
  { month: 'Mai', dateISO: '2024-05-15', receita: 62000, despesas: 40000, lucro: 22000, year: 2024 },
  { month: 'Jun', dateISO: '2024-06-15', receita: 68000, despesas: 42000, lucro: 26000, year: 2024 },
  { month: 'Jul', dateISO: '2024-07-15', receita: 70000, despesas: 43000, lucro: 27000, year: 2024 },
];

// Gera dados DIÁRIOS para visualização granular (Custom Range)
const generateDailyFinancialData = () => {
    const data = [];
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2024-12-31');
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const iso = d.toISOString().split('T')[0];
        // Gera valores diários aleatórios baseados em uma média mensal dividida por 30
        // Média de receita ~60k/mês -> ~2k/dia com variação
        const baseRev = 1500 + Math.random() * 2000; 
        const baseExp = 800 + Math.random() * 1000;
        
        data.push({
            dateISO: iso,
            dateDisplay: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), // Formato DD/MM
            receita: Math.round(baseRev),
            despesas: Math.round(baseExp),
            lucro: Math.round(baseRev - baseExp),
            year: d.getFullYear(),
            month: d.toLocaleDateString('pt-BR', { month: 'short' })
        });
    }
    return data;
};

const DAILY_FINANCIAL_DATA = generateDailyFinancialData();

const FULL_PRODUCTIVITY_DATA = [
  { name: 'Ana Admin', concluidas: 45, atrasadas: 2, pendentes: 12, department: 'Gestão' },
  { name: 'Carlos Gestor', concluidas: 38, atrasadas: 5, pendentes: 18, department: 'Fiscal' },
  { name: 'Beatriz Usuário', concluidas: 52, atrasadas: 1, pendentes: 8, department: 'DP' },
  { name: 'João Estagiário', concluidas: 20, atrasadas: 0, pendentes: 5, department: 'Contábil' },
  { name: 'Maria Senior', concluidas: 60, atrasadas: 3, pendentes: 10, department: 'Fiscal' },
];

const FULL_GROWTH_DATA = [
  { month: 'Jan', dateISO: '2023-01-15', novos: 4, cancelados: 1, total: 45 },
  { month: 'Fev', dateISO: '2023-02-15', novos: 6, cancelados: 0, total: 51 },
  { month: 'Mar', dateISO: '2023-03-15', novos: 3, cancelados: 2, total: 52 },
  { month: 'Abr', dateISO: '2023-04-15', novos: 8, cancelados: 1, total: 59 },
  { month: 'Mai', dateISO: '2023-05-15', novos: 5, cancelados: 0, total: 64 },
  { month: 'Jun', dateISO: '2023-06-15', novos: 7, cancelados: 1, total: 70 },
  { month: 'Jul', dateISO: '2023-07-15', novos: 9, cancelados: 0, total: 79 },
  { month: 'Ago', dateISO: '2023-08-15', novos: 6, cancelados: 2, total: 83 },
  { month: 'Set', dateISO: '2023-09-15', novos: 5, cancelados: 1, total: 87 },
  { month: 'Out', dateISO: '2023-10-15', novos: 8, cancelados: 0, total: 95 },
  { month: 'Nov', dateISO: '2023-11-15', novos: 10, cancelados: 1, total: 104 },
  { month: 'Dez', dateISO: '2023-12-15', novos: 12, cancelados: 0, total: 116 },
  { month: 'Jan', dateISO: '2024-01-15', novos: 15, cancelados: 1, total: 130 },
  { month: 'Fev', dateISO: '2024-02-15', novos: 10, cancelados: 2, total: 138 },
];

const TASK_DISTRIBUTION = [
  { name: 'Fiscal', value: 35, color: '#6366f1' },
  { name: 'Contábil', value: 25, color: '#8b5cf6' },
  { name: 'DP', value: 20, color: '#ec4899' },
  { name: 'Legal', value: 10, color: '#06b6d4' },
  { name: 'Adm', value: 10, color: '#f59e0b' },
];

interface ReportsProps {
    currentUser: User;
}

// --- COMPONENTS ---

export const Reports: React.FC<ReportsProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'FINANCIAL' | 'OPERATIONAL' | 'GROWTH'>('OPERATIONAL');
  
  // --- STATE: FILTERS ---
  const [dateRange, setDateRange] = useState('LAST_6_MONTHS');
  const [customStart, setCustomStart] = useState('2024-01-01');
  const [customEnd, setCustomEnd] = useState('2024-01-31');
  
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'PDF' | 'CSV' | null>(null);

  // --- FILTER LOGIC ---
  
  const filteredFinancial = useMemo(() => {
      // 1. SE PERSONALIZADO: Usa base de dados DIÁRIA (Granular)
      if (dateRange === 'CUSTOM') {
         const start = customStart || '1900-01-01';
         const end = customEnd || '2100-12-31';
         // Retorna os dados diários filtrados pelo range
         return DAILY_FINANCIAL_DATA.filter(d => d.dateISO >= start && d.dateISO <= end);
      }

      // 2. SE PADRÃO: Usa base de dados MENSAL (Consolidada)
      let data = [...FULL_FINANCIAL_DATA];

      if (yearFilter !== 'ALL') {
        data = data.filter(d => d.year.toString() === yearFilter);
      }

      // Filtros de conveniência
      if (dateRange === 'LAST_QUARTER') {
         data = data.slice(-3);
      } else if (dateRange === 'LAST_6_MONTHS') {
         data = data.slice(-6);
      } else if (dateRange === 'THIS_MONTH') {
         data = data.slice(-1);
      }
      
      return data;
  }, [dateRange, customStart, customEnd, yearFilter]);

  const filteredProductivity = useMemo(() => {
      let data = [...FULL_PRODUCTIVITY_DATA];
      
      if (departmentFilter !== 'ALL') {
        data = data.filter(p => p.department === departmentFilter);
      }
      
      if (employeeFilter !== 'ALL') {
        data = data.filter(p => p.name === employeeFilter);
      }

      return data;
  }, [departmentFilter, employeeFilter]);

  const filteredGrowth = useMemo(() => {
      let data = [...FULL_GROWTH_DATA];
      
      if (dateRange === 'CUSTOM') {
         const start = customStart || '1900-01-01';
         const end = customEnd || '2100-12-31';
         return data.filter(d => d.dateISO >= start && d.dateISO <= end);
      } 
      
      if (dateRange === 'LAST_QUARTER') {
         data = data.slice(-3);
      } else if (dateRange === 'LAST_6_MONTHS') {
         data = data.slice(-6);
      } else if (dateRange === 'THIS_MONTH') {
         data = data.slice(-1);
      }
      
      return data;
  }, [dateRange, customStart, customEnd]);

  // --- EXPORT FUNCTIONS ---

  const generateCSV = (data: any[], headers: string[], filename: string) => {
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            // Tenta encontrar a chave correspondente ignorando case e prefixos
            const key = Object.keys(row).find(k => k.toLowerCase().includes(header.toLowerCase().split(' ')[0])) || '';
            const val = row[key as keyof typeof row];
            const escaped = ('' + val).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = (title: string, headers: string[], data: any[]) => {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("ContabilFlow - Relatório Gerencial", 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Relatório: ${title}`, 14, 30);
      doc.text(`Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 14, 36);
      doc.text(`Filtro: ${dateRange === 'CUSTOM' ? `${customStart} a ${customEnd}` : dateRange.replace('_', ' ')}`, 14, 42);

      const tableBody = data.map(row => Object.values(row).map(val => 
         typeof val === 'number' ? val.toLocaleString('pt-BR') : val
      ));

      (doc as any).autoTable({
          head: [headers],
          body: tableBody,
          startY: 50,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] }, 
          styles: { fontSize: 10, cellPadding: 3 },
      });

      doc.save(`Relatorio_${title.replace(' ', '_')}.pdf`);
  };

  const handleExportClick = async (type: 'PDF' | 'CSV') => {
      setExportType(type);
      setIsExporting(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      try {
          if (activeTab === 'FINANCIAL') {
              const headers = ['Data', 'Receita', 'Despesa', 'Lucro'];
              const filename = 'Financeiro';
              // Ajusta dados para exportação limpa
              const exportData = filteredFinancial.map(({dateDisplay, month, receita, despesas, lucro}) => ({
                  Data: dateRange === 'CUSTOM' ? dateDisplay : month,
                  Receita: receita,
                  Despesas: despesas,
                  Lucro: lucro
              }));
              
              if (type === 'CSV') generateCSV(exportData, headers, filename);
              else generatePDF('Financeiro', headers, exportData);

          } else if (activeTab === 'OPERATIONAL') {
               const headers = ['Nome', 'Concluidas', 'Atrasadas', 'Pendentes', 'Departamento'];
               const filename = 'Produtividade';
               if (type === 'CSV') generateCSV(filteredProductivity, headers, filename);
               else generatePDF('Produtividade_Equipe', headers, filteredProductivity);
          } else {
              const headers = ['Mês', 'Data', 'Novos', 'Cancelados', 'Total'];
              const filename = 'Crescimento';
               if (type === 'CSV') generateCSV(filteredGrowth, headers, filename);
               else generatePDF('Crescimento', headers, filteredGrowth);
          }
      } catch (error) {
          console.error("Export failed", error);
          alert("Erro ao gerar relatório.");
      } finally {
          setIsExporting(false);
          setExportType(null);
      }
  };

  // --- RENDER HELPERS ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-800 text-xs font-bold z-50">
          <p className="mb-2 text-gray-400 border-b border-gray-700 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
             <div key={index} className="flex items-center gap-2 mb-1">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                 <span className="capitalize">{entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}</span>
             </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Central de Relatórios</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Análises detalhadas e exportação de dados.</p>
          </div>
          
          <div className="flex gap-2">
              <button 
                  onClick={() => handleExportClick('CSV')}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                  {isExporting && exportType === 'CSV' ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                  Excel / CSV
              </button>
              <button 
                  onClick={() => handleExportClick('PDF')}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                  {isExporting && exportType === 'PDF' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Gerar PDF
              </button>
          </div>
        </div>
        
        {/* --- FILTERS BAR --- */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-wrap items-center gap-4">
            
             <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mr-2">
                <Filter size={14} /> Filtros:
             </div>

             {/* OPERATIONAL FILTERS */}
             {activeTab === 'OPERATIONAL' && (
                <>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                      <Layers size={14} className="text-gray-400 mr-2" />
                      <select 
                          value={departmentFilter} 
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                          className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                      >
                          <option value="ALL">Todos Deptos.</option>
                          <option value="Fiscal">Fiscal</option>
                          <option value="Contábil">Contábil</option>
                          <option value="DP">DP</option>
                          <option value="Gestão">Gestão</option>
                      </select>
                  </div>

                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                      <UserIcon size={14} className="text-gray-400 mr-2" />
                      <select 
                          value={employeeFilter} 
                          onChange={(e) => setEmployeeFilter(e.target.value)}
                          className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                      >
                          <option value="ALL">Todos Colaboradores</option>
                          {FULL_PRODUCTIVITY_DATA.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                  </div>
                </>
             )}

             {/* FINANCIAL FILTERS */}
             {activeTab === 'FINANCIAL' && (
                 <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                    <CalendarDays size={14} className="text-gray-400 mr-2" />
                    <select 
                        value={yearFilter} 
                        onChange={(e) => setYearFilter(e.target.value)}
                        disabled={dateRange === 'CUSTOM'}
                        className={`bg-transparent text-sm font-semibold outline-none cursor-pointer ${dateRange === 'CUSTOM' ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}
                    >
                        <option value="ALL">Todos Anos</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                    </select>
                </div>
             )}

             {/* DATE RANGE FILTER (Shared for Fin & Growth) */}
             {(activeTab === 'FINANCIAL' || activeTab === 'GROWTH') && (
                <>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                      <Calendar size={14} className="text-gray-400 mr-2" />
                      <select 
                          value={dateRange} 
                          onChange={(e) => setDateRange(e.target.value)}
                          className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                      >
                          <option value="YEAR_TO_DATE">Ano Completo (YTD)</option>
                          <option value="LAST_6_MONTHS">Últimos 6 Meses</option>
                          <option value="LAST_QUARTER">Último Trimestre</option>
                          <option value="THIS_MONTH">Mês Atual</option>
                          <option value="CUSTOM">Personalizado</option>
                      </select>
                  </div>
                  
                  {/* CUSTOM DATE INPUTS */}
                  {dateRange === 'CUSTOM' && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <input 
                          type="date" 
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <span className="text-gray-400 text-xs">até</span>
                        <input 
                          type="date" 
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                  )}
                </>
            )}
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {[
            { id: 'OPERATIONAL', label: 'Produtividade & Equipe', icon: CheckCircle2, visible: true },
            { id: 'FINANCIAL', label: 'Financeiro & Receita', icon: DollarSign, visible: currentUser.permissions.view_financials },
            { id: 'GROWTH', label: 'Crescimento & Clientes', icon: TrendingUp, visible: true },
        ].filter(t => t.visible).map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <tab.icon size={18} />
                {tab.label}
            </button>
        ))}
      </div>

      {/* --- FINANCIAL REPORT --- */}
      {activeTab === 'FINANCIAL' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Cards Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase">Receita no Período</p>
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                          R$ {filteredFinancial.reduce((acc, curr) => acc + curr.receita, 0).toLocaleString('pt-BR')}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full mt-2">
                          <TrendingUp size={12}/> Receita Bruta
                      </span>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase">Ticket Médio</p>
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">R$ 1.850</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full mt-2">
                          <TrendingUp size={12}/> Estável
                      </span>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase">Despesas Totais</p>
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                          R$ {filteredFinancial.reduce((acc, curr) => acc + curr.despesas, 0).toLocaleString('pt-BR')}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full mt-2">
                          Controlado
                      </span>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase">Lucro Líquido</p>
                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                          R$ {filteredFinancial.reduce((acc, curr) => acc + curr.lucro, 0).toLocaleString('pt-BR')}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full mt-2">
                          Margem Saudável
                      </span>
                  </div>
              </div>

              {/* Main Chart */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <DollarSign size={20} className="text-indigo-500" /> 
                          Demonstrativo Financeiro ({dateRange === 'CUSTOM' ? 'Visualização Diária' : dateRange.replace('_', ' ').toLowerCase()})
                      </h3>
                  </div>
                  <div className="h-[400px] w-full">
                      {filteredFinancial.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={filteredFinancial} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107, 114, 128, 0.1)" />
                                {/* Dynamic X Axis: Shows Day/Month for Custom, Month Name for Standard */}
                                <XAxis 
                                  dataKey={dateRange === 'CUSTOM' ? "dateDisplay" : "month"} 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}} 
                                  dy={10} 
                                  interval={dateRange === 'CUSTOM' ? 'preserveStartEnd' : 0}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36}/>
                                {/* Bar Size adjusted based on data volume */}
                                <Bar dataKey="receita" name="Receita Bruta" barSize={dateRange === 'CUSTOM' ? 10 : 20} fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="despesas" name="Despesas" barSize={dateRange === 'CUSTOM' ? 10 : 20} fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="lucro" name="Lucro Líquido" stroke="#10b981" strokeWidth={3} dot={dateRange !== 'CUSTOM' ? {r:4} : false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                              Nenhum dado encontrado para este período.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* --- OPERATIONAL REPORT --- */}
      {activeTab === 'OPERATIONAL' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Team Workload */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Users size={20} className="text-indigo-500" /> 
                          Desempenho da Equipe
                      </h3>
                  </div>
                  <div className="h-[350px] w-full">
                      {filteredProductivity.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredProductivity} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(107, 114, 128, 0.1)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} width={100} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="concluidas" name="Concluídas" stackId="a" fill="#10b981" barSize={30} />
                                <Bar dataKey="pendentes" name="Pendentes" stackId="a" fill="#f59e0b" />
                                <Bar dataKey="atrasadas" name="Atrasadas" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                              Nenhum colaborador encontrado com este filtro.
                          </div>
                      )}
                  </div>
              </div>

              {/* Task Types */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Briefcase size={20} className="text-purple-500" /> 
                          Tipos de Demanda
                      </h3>
                  </div>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie 
                                  data={TASK_DISTRIBUTION} 
                                  cx="50%" cy="50%" 
                                  innerRadius={60} 
                                  outerRadius={80} 
                                  paddingAngle={5} 
                                  dataKey="value"
                              >
                                  {TASK_DISTRIBUTION.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                  ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-500">
                      <strong className="text-gray-900 dark:text-white block mb-1">Insight de IA:</strong>
                      A demanda Fiscal representa 35% da carga. Considere automação para importação de XMLs para reduzir este gargalo.
                  </div>
              </div>
          </div>
      )}

      {/* --- GROWTH REPORT --- */}
      {activeTab === 'GROWTH' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <TrendingUp size={20} className="text-emerald-500" /> 
                          Crescimento da Carteira ({dateRange === 'CUSTOM' ? 'Período Personalizado' : dateRange.replace('_', ' ').toLowerCase()})
                      </h3>
                  </div>
                  <div className="h-[400px] w-full">
                      {filteredGrowth.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107, 114, 128, 0.1)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                <Line type="monotone" dataKey="novos" name="Novos Contratos" stroke="#10b981" strokeWidth={2} dot={{r:3}} />
                                <Line type="monotone" dataKey="cancelados" name="Cancelamentos" stroke="#ef4444" strokeWidth={2} dot={{r:3}} />
                                <Legend />
                            </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                              Nenhum dado encontrado para este período.
                          </div>
                      )}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                       <h4 className="font-bold text-gray-900 dark:text-white mb-4">Taxa de Churn (Cancelamento)</h4>
                       <div className="flex items-end gap-2">
                           <span className="text-4xl font-black text-gray-900 dark:text-white">1.2%</span>
                           <span className="text-sm font-bold text-emerald-500 mb-1 flex items-center"><TrendingDown size={14}/> -0.5%</span>
                       </div>
                       <p className="text-xs text-gray-500 mt-2">Média do mercado contábil: 3% - 5%.</p>
                       <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-4">
                           <div className="bg-indigo-500 h-full w-[25%] rounded-full"></div>
                       </div>
                   </div>

                   <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                       <h4 className="font-bold text-gray-900 dark:text-white mb-4">Lifetime Value (LTV)</h4>
                       <div className="flex items-end gap-2">
                           <span className="text-4xl font-black text-gray-900 dark:text-white">R$ 22.400</span>
                           <span className="text-sm font-bold text-emerald-500 mb-1 flex items-center"><TrendingUp size={14}/> +R$ 1.200</span>
                       </div>
                       <p className="text-xs text-gray-500 mt-2">Valor médio que um cliente gera durante todo o contrato.</p>
                       <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-4">
                           <div className="bg-emerald-500 h-full w-[65%] rounded-full"></div>
                       </div>
                   </div>
              </div>
          </div>
      )}

    </div>
  );
};
