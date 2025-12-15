import React from 'react';
import { LayoutDashboard, Users, Kanban, Settings, LogOut, PieChart, Sparkles, Calendar, Megaphone, ExternalLink, DownloadCloud, LifeBuoy, Cloud } from 'lucide-react';
import { User, CompanyProfile } from '../types';

interface SidebarProps {
  currentUser: User;
  companyProfile: CompanyProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, companyProfile, activeTab, setActiveTab, isSidebarOpen, onLogout }) => {
  
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, visible: currentUser.permissions.view_dashboard },
    { id: 'growth', label: 'Vendas & CRM', icon: Megaphone, visible: currentUser.permissions.view_growth },
    { id: 'pipeline', label: 'Demandas', icon: Kanban, visible: true },
    { id: 'calendar', label: 'Agenda', icon: Calendar, visible: currentUser.permissions.view_calendar },
    { id: 'tickets', label: 'Atendimento', icon: LifeBuoy, visible: currentUser.permissions.view_tickets },
    { id: 'clients', label: 'Carteira', icon: Users, visible: currentUser.permissions.view_clients }, 
    { id: 'cloud', label: 'Nuvem Docs', icon: Cloud, visible: true },
    { id: 'reports', label: 'Relatórios', icon: PieChart, visible: currentUser.permissions.view_financials || currentUser.permissions.export_reports },
    { id: 'ai-assistant', label: 'AI Advisor', icon: Sparkles, visible: currentUser.permissions.use_ai },
    { id: 'export', label: 'Extrair Dados', icon: DownloadCloud, visible: currentUser.role === 'ADMIN' || currentUser.permissions.export_reports },
    { id: 'settings', label: 'Configurações', icon: Settings, visible: currentUser.permissions.access_settings },
  ];

  const primaryColor = companyProfile.primaryColor || '#6366f1';
  const theme = companyProfile.sidebarTheme || 'light';

  const getSidebarStyles = () => {
      switch (theme) {
          case 'dark':
              return {
                  container: 'bg-gray-950 border-gray-800 text-white',
                  itemActive: 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20',
                  itemInactive: 'text-gray-500 hover:text-gray-200 hover:bg-white/5',
                  brandText: 'text-white',
                  subText: 'text-gray-600'
              };
          case 'brand':
              return {
                  container: 'text-white border-white/10',
                  itemActive: 'bg-white/20 text-white shadow-lg',
                  itemInactive: 'text-white/60 hover:bg-white/10 hover:text-white',
                  brandText: 'text-white',
                  subText: 'text-white/50',
                  style: { backgroundColor: primaryColor }
              };
          default:
              return {
                  container: 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white',
                  itemActive: 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30',
                  itemInactive: 'text-gray-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/10',
                  brandText: 'text-gray-900 dark:text-white',
                  subText: 'text-gray-400 dark:text-gray-600'
              };
      }
  };

  const styles = getSidebarStyles();

  return (
    <aside 
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static z-40 w-72 h-screen border-r transition-all duration-500 ease-in-out flex flex-col ${styles.container}`}
        style={styles.style}
    >
      <div className="h-24 flex items-center px-8">
        <div className="flex items-center gap-3.5 group cursor-pointer transition-transform active:scale-95">
          {companyProfile.logoUrl ? (
             <img src={companyProfile.logoUrl} alt={companyProfile.name} className="h-9 w-auto object-contain" />
          ) : (
             <>
                <div 
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center text-white font-black text-base shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 animate-float"
                    style={{ backgroundColor: primaryColor }}
                >
                    {companyProfile.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <span className={`block font-black tracking-tight text-xl leading-none ${styles.brandText}`}>{companyProfile.name.split(' ')[0]}</span>
                    <span className={`block text-[9px] font-black uppercase tracking-[0.25em] mt-1.5 ${styles.subText}`}>Workspace</span>
                </div>
             </>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
        <div className={`mb-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${theme === 'brand' ? 'text-white' : 'text-gray-400'}`}>Menu Principal</div>
        
        {menuItems.filter(item => item.visible).map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 active:scale-[0.97] group relative ${
                  isActive ? styles.itemActive : styles.itemInactive
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 3 : 2} />
                <span className="flex-1 text-left tracking-tight">{item.label}</span>
                {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                )}
              </button>
            )
        })}

        {companyProfile.sidebarLinks && companyProfile.sidebarLinks.length > 0 && (
            <div className="mt-8">
                <div className={`mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${theme === 'brand' ? 'text-white' : 'text-gray-400'}`}>Links Rápidos</div>
                {companyProfile.sidebarLinks.map((link) => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[12px] font-bold transition-all duration-300 ${styles.itemInactive}`}
                    >
                        <ExternalLink size={14} />
                        <span className="flex-1 text-left tracking-tight">{link.label}</span>
                    </a>
                ))}
            </div>
        )}
      </nav>

      <div className="p-6">
        <div className="bg-gray-50/50 dark:bg-white/5 rounded-3xl p-4 transition-all hover:bg-gray-100 dark:hover:bg-white/10 group">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/20" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black truncate ${styles.brandText}`}>{currentUser.name}</p>
                    <p className={`text-[9px] font-black truncate uppercase tracking-widest ${styles.subText}`}>{currentUser.role}</p>
                </div>
                <div className="flex items-center gap-1">
                    {currentUser.permissions.access_settings && (
                        <button 
                            onClick={() => setActiveTab('settings')} 
                            className={`p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                            title="Configurações"
                        >
                            <Settings size={16} />
                        </button>
                    )}
                    <button 
                        onClick={onLogout} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl transition-all"
                        title="Sair"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};
