
import React from 'react';
import { CompanyProfile } from '../types';
import { Save, RefreshCw, Monitor, Layout, LogIn, Image as ImageIcon } from 'lucide-react';

interface WhiteLabelProps {
    profileForm: CompanyProfile;
    setProfileForm: (profile: CompanyProfile) => void;
    onSave: () => void;
    isSaving: boolean;
}

export const SettingsTabWhiteLabel: React.FC<WhiteLabelProps> = ({ profileForm, setProfileForm, onSave, isSaving }) => {
    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Identidade Visual</h2>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2">Personalize o Workspace com sua marca</p>
                </div>
                <button 
                    onClick={onSave} disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all"
                >
                    {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} Salvar Alterações
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2"><Monitor size={14}/> Aparência Básica</h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Nome da Empresa</label>
                                <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-indigo-600" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Logo URL</label>
                                    <input value={profileForm.logoUrl} onChange={e => setProfileForm({...profileForm, logoUrl: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs text-gray-400 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Favicon URL</label>
                                    <input value={profileForm.faviconUrl} onChange={e => setProfileForm({...profileForm, faviconUrl: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs text-gray-400 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Cor Primária</label>
                                <div className="flex gap-4">
                                    <input type="color" value={profileForm.primaryColor} onChange={e => setProfileForm({...profileForm, primaryColor: e.target.value})} className="h-14 w-24 bg-white/[0.03] border border-white/5 rounded-2xl cursor-pointer" />
                                    <input value={profileForm.primaryColor} onChange={e => setProfileForm({...profileForm, primaryColor: e.target.value})} className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-6 font-mono text-sm text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2"><Layout size={14}/> Layout do Portal</h4>
                        <div className="space-y-6 bg-white/[0.01] p-8 rounded-[32px] border border-white/5">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Estilo de Bordas (Radius)</label>
                                <div className="flex flex-wrap gap-2">
                                    {(['none', 'sm', 'md', 'lg', 'full'] as const).map(r => (
                                        <button key={r} onClick={() => setProfileForm({...profileForm, borderRadius: r})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${profileForm.borderRadius === r ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}>{r}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Tema da Sidebar</label>
                                <div className="flex flex-wrap gap-2">
                                    {(['light', 'dark', 'brand'] as const).map(t => (
                                        <button key={t} onClick={() => setProfileForm({...profileForm, sidebarTheme: t})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${profileForm.sidebarTheme === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}>{t}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2"><LogIn size={14}/> Experiência de Login</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div className="space-y-4">
                            <input value={profileForm.loginTitle} onChange={e => setProfileForm({...profileForm, loginTitle: e.target.value})} placeholder="Título da tela de login" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 font-bold text-white outline-none" />
                            <textarea value={profileForm.loginMessage} onChange={e => setProfileForm({...profileForm, loginMessage: e.target.value})} placeholder="Mensagem de boas-vindas" rows={3} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 font-medium text-gray-300 outline-none" />
                        </div>
                        <div className="space-y-4">
                            <input value={profileForm.loginBackgroundUrl} onChange={e => setProfileForm({...profileForm, loginBackgroundUrl: e.target.value})} placeholder="URL da Imagem de Fundo" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs text-gray-400 outline-none" />
                            <div className="p-4 bg-indigo-500/5 rounded-[24px] border border-indigo-500/10 flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><ImageIcon size={18}/></div>
                                <p className="text-[9px] font-bold text-indigo-400 leading-relaxed uppercase">O sistema aplicará automaticamente opacidade para legibilidade.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
