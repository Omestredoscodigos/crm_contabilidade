import { 
  Client, Task, User, PipelineColumn, DashboardWidgetConfig, CompanyProfile, 
  Pipeline, UserPermissions, CalendarEvent, GoogleCalendarConfig, 
  Lead
} from './types';

const ADMIN_PERMISSIONS: UserPermissions = {
    access_settings: true,
    manage_users: true,
    view_audit_logs: true,
    manage_integrations: true,
    view_dashboard: true,
    view_financials: true,
    manage_financials: true,
    export_reports: true,
    view_pipelines: true,
    manage_pipelines: true,
    create_tasks: true,
    delete_tasks: true,
    bulk_task_edit: true,
    view_growth: true,
    manage_leads: true,
    delete_leads: true,
    view_clients: true,
    manage_clients: true,
    delete_clients: true,
    view_calendar: true,
    manage_calendar: true,
    use_ai: true,
    view_tickets: true,
    manage_tickets: true
};

const MANAGER_PERMISSIONS: UserPermissions = {
    access_settings: false,
    manage_users: false,
    view_audit_logs: true,
    manage_integrations: false,
    view_dashboard: true,
    view_financials: true,
    manage_financials: false,
    export_reports: true,
    view_pipelines: true,
    manage_pipelines: true,
    create_tasks: true,
    delete_tasks: true,
    bulk_task_edit: true,
    view_growth: true,
    manage_leads: true,
    delete_leads: false,
    view_clients: true,
    manage_clients: true,
    delete_clients: false,
    view_calendar: true,
    manage_calendar: true,
    use_ai: true,
    view_tickets: true,
    manage_tickets: true
};

const USER_PERMISSIONS: UserPermissions = {
    access_settings: false,
    manage_users: false,
    view_audit_logs: false,
    manage_integrations: false,
    view_dashboard: false,
    view_financials: false,
    manage_financials: false,
    export_reports: false,
    view_pipelines: true,
    manage_pipelines: false,
    create_tasks: true,
    delete_tasks: false,
    bulk_task_edit: false,
    view_growth: false,
    manage_leads: false,
    delete_leads: false,
    view_clients: true,
    manage_clients: false,
    delete_clients: false,
    view_calendar: true,
    manage_calendar: false,
    use_ai: true,
    view_tickets: true,
    manage_tickets: false
};

export const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'Ana Admin', 
    email: 'admin@crm.com', 
    role: 'ADMIN', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    password: '123',
    department: 'Gestão',
    permissions: ADMIN_PERMISSIONS
  },
  { 
    id: '2', 
    name: 'Carlos Gestor', 
    email: 'gestor@crm.com', 
    role: 'MANAGER', 
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    password: '123',
    department: 'Fiscal',
    permissions: MANAGER_PERMISSIONS
  },
  { 
    id: '3', 
    name: 'Beatriz Usuário', 
    email: 'user@crm.com', 
    role: 'USER', 
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    password: '123',
    department: 'DP',
    permissions: USER_PERMISSIONS
  },
];

export const ROLE_PERMISSIONS = {
    ADMIN: ADMIN_PERMISSIONS,
    MANAGER: MANAGER_PERMISSIONS,
    USER: USER_PERMISSIONS
};

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
    name: 'CRM CONTÁBIL',
    cnpj: '12.345.678/0001-00',
    email: 'contato@crmcontabil.com.br',
    phone: '(11) 3333-4444',
    website: 'https://crmcontabil.com.br',
    primaryColor: '#6366f1',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    borderRadius: 'md',
    loginBackgroundUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    faviconUrl: '',
    sidebarTheme: 'dark',
    loginTitle: 'CRM CONTÁBIL',
    loginMessage: 'Acesso seguro ao seu ecossistema'
};

export const DEFAULT_GOOGLE_CALENDAR_CONFIG: GoogleCalendarConfig = {
    clientId: '',
    apiKey: '',
    connected: false
};

export const MOCK_CLIENTS: Client[] = [
  { 
    id: 'c1', 
    name: 'Tech Solutions', 
    companyName: 'Tech Soluções Digitais Ltda', 
    cnpj: '12.345.678/0001-90', 
    regime: 'Simples Nacional', 
    email: 'contato@techsol.com', 
    phone: '(11) 99999-0001', 
    status: 'ACTIVE', 
    monthlyFee: 1200,
    address: { street: 'Av. Paulista', number: '1000', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', zip: '01310-100' },
    responsible: { name: 'João Silva', email: 'joao@techsol.com', phone: '(11) 98888-8888', role: 'Sócio-Admin' },
    contract: { startDate: '2023-01-10', feeDueDate: 5, readjustmentMonth: 'Janeiro' },
    notes: 'Cliente prefere contato via e-mail.'
  },
];

export const DEFAULT_COLUMNS: PipelineColumn[] = [
  { id: 'TODO', label: 'A Fazer', dotColor: 'bg-gray-400' },
  { id: 'IN_PROGRESS', label: 'Em Andamento', dotColor: 'bg-blue-500' },
  { id: 'WAITING_CLIENT', label: 'Aguardando Cliente', dotColor: 'bg-amber-500' },
  { id: 'REVIEW', label: 'Revisão', dotColor: 'bg-purple-500' },
  { id: 'DONE', label: 'Concluído', dotColor: 'bg-emerald-500' },
];

export const DEFAULT_PIPELINES: Pipeline[] = [
    {
        id: 'default',
        name: 'Operacional Geral',
        columns: DEFAULT_COLUMNS
    }
];

export const MOCK_TASKS: Task[] = [
  { 
      id: 't1', 
      pipelineId: 'default',
      title: 'Apuração DAS Mensal', 
      description: 'Gerar guia do Simples Nacional competência 10/2023', 
      clientId: 'c1', 
      clientName: 'Tech Solutions', 
      isInternal: false, 
      assigneeId: '2', 
      dueDate: '2023-11-20', 
      priority: 'HIGH', 
      status: 'DONE', 
      type: 'FISCAL',
      subtasks: [],
      comments: [],
      tags: [],
      attachments: []
  },
];

export const MOCK_REVENUE_HISTORY = [
  { name: 'Jan', current: 12000, previous: 10000 },
  { name: 'Fev', current: 14500, previous: 11000 },
  { name: 'Mar', current: 13800, previous: 12500 },
  { name: 'Abr', current: 16000, previous: 13000 },
  { name: 'Mai', current: 19500, previous: 15000 },
  { name: 'Jun', current: 24200, previous: 18000 },
  { name: 'Jul', current: 22800, previous: 19000 },
];

export const MOCK_TAX_DISTRIBUTION = [
  { name: 'Simples Nacional', value: 45, color: '#6366f1' }, 
  { name: 'Lucro Presumido', value: 30, color: '#8b5cf6' }, 
  { name: 'Lucro Real', value: 15, color: '#ec4899' }, 
  { name: 'MEI', value: 10, color: '#06b6d4' }, 
];

export const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
    { id: 'REVENUE_CHART', label: 'Gráfico de Receita', isVisible: true, colSpan: 'lg:col-span-2' },
    { id: 'CLIENT_KPI', label: 'Total de Clientes', isVisible: true, colSpan: 'lg:col-span-1' },
    { id: 'PRODUCTIVITY_RADIAL', label: 'Produtividade', isVisible: true, colSpan: 'lg:col-span-1' },
    { id: 'TEAM_WORKLOAD', label: 'Equipe', isVisible: true, colSpan: 'lg:col-span-1' },
    { id: 'TAX_DISTRIBUTION', label: 'Mix de Clientes', isVisible: true, colSpan: 'lg:col-span-1' },
];

export const MOCK_LEADS: Lead[] = [
    {
        id: 'l1',
        name: 'Supermercado Silva',
        contactPerson: 'Roberto Silva',
        email: 'contato@supersilva.com',
        phone: '(11) 98888-1111',
        value: 2500,
        status: 'PROPOSAL',
        source: 'INDICATION',
        probability: 60,
        createdAt: '2023-11-01',
        lastInteraction: '2023-11-20',
        temperature: 'WARM',
        nextFollowUp: '2023-11-19',
        notes: [],
        history: []
    },
];

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Reunião de Alinhamento Fiscal',
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 3600000).toISOString(),
    allDay: false,
    type: 'MEETING'
  }
];
