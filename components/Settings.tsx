import React, { useState } from 'react';
import { User, CompanyProfile, GoogleCalendarConfig, AuditLogEntry, LogBackup } from '../types';
import { Palette, Users, Link2, History } from 'lucide-react';
import { googleCalendarService } from '../services/googleCalendarService';
import { SettingsTabWhiteLabel } from './SettingsTabWhiteLabel';
import { SettingsTabUsers } from './SettingsTabUsers';
import { SettingsTabIntegrations } from './SettingsTabIntegrations';
import { SettingsTabAudit } from './SettingsTabAudit';

interface SettingsProps {
    currentUser: User;
    companyProfile: CompanyProfile;
    onUpdateProfile: (profile: CompanyProfile) => void;
    users: User[];
    onAddUser: (user: User) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (id: string) => void;
    auditLogs: AuditLogEntry[];
    auditLogBackup: LogBackup | null;
    onClearLogs: () => void;
    onRestoreLogs: () => void;
    onUndoAction?: (log: AuditLogEntry) => void;
}

export const Settings: React.FC<SettingsProps> = (props) => {
    const { currentUser, companyProfile, onUpdateProfile, users, onAddUser, onUpdateUser, onDeleteUser, auditLogs, auditLogBackup, onClearLogs, onRestoreLogs, onUndoAction } = props;
    
    const [activeTab, setActiveTab] = useState<'WHITELABEL' | 'USERS' | 'INTEGRATIONS' | 'AUDIT'>('WHITELABEL');
    const [profileForm, setProfileForm] = useState<CompanyProfile>(companyProfile);
    const [googleConfig, setGoogleConfig] = useState<GoogleCalendarConfig>(googleCalendarService.getConfig());
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = () => {
        setIsSaving(true);
        setTimeout(() => {
            onUpdateProfile(profileForm);
            setIsSaving(false);
        }, 800);
    };

    const handleSaveIntegrations = () => {
        setIsSaving(true);
        setTimeout(() => {
            googleCalendarService.saveConfig(googleConfig);
            setIsSaving(false);
        }, 800);
    };

    const menuItems = [
        { id: 'WHITELABEL', label: 'MARCA / WHITE LABEL', icon: Palette, desc: 'Identidade visual do CRM', visible: currentUser.role === 'ADMIN' },
        { id: 'USERS', label: 'EQUIPE E ACESSO', icon: Users, desc: 'Colaboradores e permissões', visible: currentUser.permissions.manage_users },
        { id: 'INTEGRATIONS', label: 'OUTRAS APIS', icon: Link2, desc: 'Google e Serviços Fiscais', visible: currentUser.permissions.manage_integrations },
        { id: 'AUDIT', label: 'LOGS DE SISTEMA', icon: History, desc: 'Histórico de ações críticas', visible: currentUser.permissions.view_audit_logs },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-20 h-full animate-in fade-in duration-500">
            {/* Menu Lateral Config */}
            <div className="w-full lg:w-80 flex-shrink-0">
                <div className="bg-[#121214] rounded-[40px] border border-white/5 p-4 shadow-2xl">
                    {menuItems.filter(item => item.visible).map(item => (
                        <button
                            key={item.id} onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-4 p-5 rounded-3xl transition-all text-left mb-2 group ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'hover:bg-white/5 text-gray-400'}`}
                        >
                            <div className={`p-3 rounded-2xl ${activeTab === item.id ? 'bg-white/20' : 'bg-white/5'}`}><item.icon size={20} /></div>
                            <div>
                                <p className="font-black text-[11px] uppercase tracking-widest">{item.label}</p>
                                <p className={`text-[9px] font-bold mt-0.5 ${activeTab === item.id ? 'text-white/70' : 'text-gray-600'}`}>{item.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 bg-[#09090b] rounded-[50px] border border-white/5 shadow-2xl flex flex-col overflow-hidden relative min-h-[600px]">
                {activeTab === 'WHITELABEL' && (
                    <SettingsTabWhiteLabel 
                        profileForm={profileForm} 
                        setProfileForm={setProfileForm} 
                        onSave={handleSaveProfile} 
                        isSaving={isSaving} 
                    />
                )}
                {activeTab === 'USERS' && (
                    <SettingsTabUsers 
                        users={users} 
                        currentUser={currentUser} 
                        onAddUser={onAddUser} 
                        onUpdateUser={onUpdateUser} 
                        onDeleteUser={onDeleteUser} 
                    />
                )}
                {activeTab === 'INTEGRATIONS' && (
                    <SettingsTabIntegrations 
                        googleConfig={googleConfig} 
                        setGoogleConfig={setGoogleConfig} 
                        onSave={handleSaveIntegrations} 
                        isSaving={isSaving} 
                    />
                )}
                {activeTab === 'AUDIT' && (
                    <SettingsTabAudit 
                        auditLogs={auditLogs} 
                        auditLogBackup={auditLogBackup} 
                        onClearLogs={onClearLogs} 
                        onRestoreLogs={onRestoreLogs} 
                        onUndoAction={onUndoAction}
                        currentUser={currentUser}
                    />
                )}
            </div>
        </div>
    );
};
