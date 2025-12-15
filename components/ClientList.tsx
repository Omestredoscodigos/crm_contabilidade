import React, { useState } from 'react';
import { Client, TaxRegime } from '../types';
import { Search, Filter, MoreHorizontal, Building2, Mail, Phone, ArrowUpRight, Plus, X, MapPin, UserSquare, ScrollText, Trash2, FileText, Upload, Download, AlertCircle } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const EmptyClient: Omit<Client, 'id'> = {
    name: '', companyName: '', cnpj: '', regime: 'Simples Nacional', email: '', phone: '', status: 'ACTIVE', monthlyFee: 0,
    address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
    responsible: { name: '', email: '', phone: '', role: '' },
    contract: { startDate: '', feeDueDate: 5, readjustmentMonth: '' },
    notes: '',
    documents: []
};

export const ClientList: React.FC<ClientListProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'address' | 'contact' | 'contract' | 'documents'>('general');
  const [editingClient, setEditingClient] = useState<Partial<Client>>(EmptyClient);
  const [isEditing, setIsEditing] = useState(false);

  // --- ESTADO DO DIÁLOGO DE CONFIRMAÇÃO ---
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cnpj.includes(searchTerm)
  );

  const handleOpenDrawer = (client?: Client) => {
      if (client) {
          setEditingClient({ ...client, documents: client.documents || [] });
          setIsEditing(true);
      } else {
          setEditingClient(EmptyClient);
          setIsEditing(false);
      }
      setActiveTab('general');
      setIsDrawerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (isEditing && editingClient.id) {
          onUpdateClient(editingClient as Client);
      } else {
          onAddClient(editingClient as Omit<Client, 'id'>);
      }
      setIsDrawerOpen(false);
  };

  const handleDeleteRequest = () => {
      if (!editingClient.id) return;
      setConfirmDialog({
        isOpen: true,
        title: "Excluir Cliente?",
        message: `Deseja realmente remover o cliente ${editingClient.name}? Todos os dados vinculados serão perdidos.`,
        onConfirm: () => {
            onDeleteClient(editingClient.id!);
            setIsDrawerOpen(false);
            setConfirmDialog(p => ({ ...p, isOpen: false }));
        }
      });
  };

  const updateField = (field: keyof Client, value: any) => {
      setEditingClient(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: 'address' | 'responsible' | 'contract', field: string, value: any) => {
      setEditingClient(prev => ({
          ...prev,
          [parent]: { ...prev[parent] as any, [field]: value }
      }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const newDoc = {
          name: file.name,
          url: URL.createObjectURL(file),
          date: new Date().toISOString()
      };

      setEditingClient(prev => ({
          ...prev,
          documents: [...(prev.documents || []), newDoc]
      }));
      e.target.value = '';
  };

  const handleDeleteDocument = (index: number) => {
      setEditingClient(prev => ({
          ...prev,
          documents: prev.documents?.filter((_, i) => i !== index)
      }));
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Carteira de Clientes</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Gestão de empresas e contratos ativos.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CNPJ..." 
              className="pl-11 pr-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none w-72 shadow-sm transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => handleOpenDrawer()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-indigo-500/30">
            <Plus size={18} /> Novo Cliente
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden flex-1">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm sticky top-0 z-10">
              <tr>
                <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Empresa</th>
                <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Regime Trib.</th>
                <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Contato</th>
                <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Honorários</th>
                <th className="px-8 py-5 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredClients.map((client) => (
                <tr key={client.id} onClick={() => handleOpenDrawer(client)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-700">
                          {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{client.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5 tracking-wide">{client.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1.5 rounded-lg w-fit border border-gray-100 dark:border-gray-800">
                      <Building2 size={12} className="text-gray-400" />
                      <span className="text-xs">{client.regime}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-xs hover:text-indigo-500 transition-colors">
                            <Mail size={12} /> {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Phone size={12} /> {client.phone}
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300">
                        R$ {client.monthlyFee.toLocaleString('pt-BR')}
                     </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      client.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                          : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {client.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowUpRight size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DETAILS & EDIT DRAWER --- */}
      {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
              <div className="relative w-full max-w-2xl h-full bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800 flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
                      <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                              {isEditing ? editingClient.name : 'Novo Cliente'}
                          </h3>
                          <p className="text-sm text-gray-500">{isEditing ? 'Visualizando e editando dados' : 'Preencha a ficha cadastral'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                          {isEditing && (
                              <button onClick={handleDeleteRequest} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Excluir Cliente">
                                  <Trash2 size={20} />
                              </button>
                          )}
                          <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                              <X size={24} />
                          </button>
                      </div>
                  </div>

                  <div className="flex border-b border-gray-100 dark:border-gray-800 px-8 overflow-x-auto">
                       {[
                           { id: 'general', label: 'Dados Gerais', icon: Building2 },
                           { id: 'address', label: 'Endereço', icon: MapPin },
                           { id: 'contact', label: 'Responsável', icon: UserSquare },
                           { id: 'contract', label: 'Contrato', icon: ScrollText },
                           { id: 'documents', label: 'Documentos', icon: FileText },
                       ].map(tab => (
                           <button 
                             key={tab.id}
                             onClick={() => setActiveTab(tab.id as any)}
                             className={`flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                                 activeTab === tab.id 
                                 ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                             }`}
                           >
                               <tab.icon size={16} /> {tab.label}
                           </button>
                       ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-8">
                      <form id="clientForm" onSubmit={handleSave} className="space-y-6">
                          {activeTab === 'general' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Nome Fantasia</label>
                                        <input required type="text" value={editingClient.name} onChange={e => updateField('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">CNPJ</label>
                                        <input required type="text" value={editingClient.cnpj} onChange={e => updateField('cnpj', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Razão Social</label>
                                    <input required type="text" value={editingClient.companyName} onChange={e => updateField('companyName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Regime Tributário</label>
                                        <select value={editingClient.regime} onChange={e => updateField('regime', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium">
                                            {['Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'MEI'].map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                                        <select value={editingClient.status} onChange={e => updateField('status', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium">
                                            <option value="ACTIVE">Ativo</option>
                                            <option value="PENDING">Pendente</option>
                                            <option value="INACTIVE">Inativo</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Email Geral</label>
                                        <input type="email" value={editingClient.email} onChange={e => updateField('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Telefone</label>
                                        <input type="text" value={editingClient.phone} onChange={e => updateField('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium" />
                                    </div>
                                </div>
                            </div>
                          )}

                          {activeTab === 'address' && (
                             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">CEP</label>
                                    <input type="text" value={editingClient.address?.zip} onChange={e => updateNestedField('address', 'zip', e.target.value)} className="w-1/3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                 </div>
                                 <div className="grid grid-cols-3 gap-6">
                                     <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Logradouro</label>
                                        <input type="text" value={editingClient.address?.street} onChange={e => updateNestedField('address', 'street', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Número</label>
                                        <input type="text" value={editingClient.address?.number} onChange={e => updateNestedField('address', 'number', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                     </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-6">
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Bairro</label>
                                        <input type="text" value={editingClient.address?.neighborhood} onChange={e => updateNestedField('address', 'neighborhood', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Cidade</label>
                                        <input type="text" value={editingClient.address?.city} onChange={e => updateNestedField('address', 'city', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                     </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Estado (UF)</label>
                                    <input type="text" value={editingClient.address?.state} onChange={e => updateNestedField('address', 'state', e.target.value)} className="w-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                 </div>
                             </div>
                          )}

                          {activeTab === 'contact' && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mb-4">
                                      <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Informações do Sócio ou Responsável principal para assinatura e contato direto.</p>
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-xs font-bold text-gray-400 uppercase">Nome do Responsável</label>
                                     <input type="text" value={editingClient.responsible?.name} onChange={e => updateNestedField('responsible', 'name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                         <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                                         <input type="email" value={editingClient.responsible?.email} onChange={e => updateNestedField('responsible', 'email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-xs font-bold text-gray-400 uppercase">Telefone/Celular</label>
                                         <input type="text" value={editingClient.responsible?.phone} onChange={e => updateNestedField('responsible', 'phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-xs font-bold text-gray-400 uppercase">Cargo / Função</label>
                                     <input type="text" value={editingClient.responsible?.role} onChange={e => updateNestedField('responsible', 'role', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" placeholder="Ex: Sócio Administrador" />
                                  </div>
                              </div>
                          )}

                          {activeTab === 'contract' && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                   <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                         <label className="text-xs font-bold text-gray-400 uppercase">Valor Mensal (R$)</label>
                                         <input type="number" value={editingClient.monthlyFee} onChange={e => updateField('monthlyFee', parseFloat(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium font-mono" />
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-xs font-bold text-gray-400 uppercase">Dia Vencimento</label>
                                         <input type="number" max={31} min={1} value={editingClient.contract?.feeDueDate} onChange={e => updateNestedField('contract', 'feeDueDate', parseInt(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                      </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                         <label className="text-xs font-bold text-gray-400 uppercase">Início do Contrato</label>
                                         <input type="date" value={editingClient.contract?.startDate} onChange={e => updateNestedField('contract', 'startDate', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium" />
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-xs font-bold text-gray-400 uppercase">Mês Reajuste</label>
                                         <select value={editingClient.contract?.readjustmentMonth} onChange={e => updateNestedField('contract', 'readjustmentMonth', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium">
                                            {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map(m => <option key={m} value={m}>{m}</option>)}
                                         </select>
                                      </div>
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-xs font-bold text-gray-400 uppercase">Observações Internas</label>
                                      <textarea rows={4} value={editingClient.notes} onChange={e => updateField('notes', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 outline-none text-sm font-medium resize-none" placeholder="Detalhes importantes sobre o cliente..." />
                                   </div>
                              </div>
                          )}

                          {activeTab === 'documents' && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                  <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Arquivos e Anexos</h4>
                                      <label className="cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                                          <Upload size={14} />
                                          Adicionar Arquivo
                                          <input type="file" className="hidden" onChange={handleFileUpload} />
                                      </label>
                                  </div>

                                  <div className="space-y-3">
                                      {editingClient.documents?.map((doc, idx) => (
                                          <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/30 group">
                                              <div className="flex items-center gap-3">
                                                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                                      <FileText size={18} />
                                                  </div>
                                                  <div>
                                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{doc.name}</p>
                                                      <p className="text-[10px] text-gray-500">{new Date(doc.date).toLocaleDateString()} às {new Date(doc.date).toLocaleTimeString()}</p>
                                                  </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                  <a href={doc.url} download={doc.name} className="p-2 text-gray-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" target="_blank" rel="noreferrer">
                                                      <Download size={16} />
                                                  </a>
                                                  <button type="button" onClick={() => handleDeleteDocument(idx)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                      <Trash2 size={16} />
                                                  </button>
                                              </div>
                                          </div>
                                      ))}

                                      {(!editingClient.documents || editingClient.documents.length === 0) && (
                                          <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 mb-3">
                                                  <FileText size={24} />
                                              </div>
                                              <p className="text-sm text-gray-500 font-medium">Nenhum documento anexado.</p>
                                              <p className="text-xs text-gray-400 mt-1">Contratos, procurações ou documentos fiscais.</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}
                      </form>
                  </div>

                  <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
                      <button type="submit" form="clientForm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 transform hover:-translate-y-0.5">
                          Salvar Dados
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO CUSTOMIZADO */}
      {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="bg-white dark:bg-gray-950 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-white/5 text-center animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <AlertCircle size={32} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{confirmDialog.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed px-2">{confirmDialog.message}</p>
                  <div className="flex gap-3">
                      <button onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-4 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
                      <button onClick={confirmDialog.onConfirm} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-95">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};