
export type Role = 'ADMIN' | 'MANAGER' | 'USER';

export interface UserPermissions {
    access_settings: boolean;
    manage_users: boolean;
    view_audit_logs: boolean;
    manage_integrations: boolean;
    view_dashboard: boolean;
    view_financials: boolean;
    manage_financials: boolean;
    export_reports: boolean;
    view_pipelines: boolean;
    manage_pipelines: boolean;
    create_tasks: boolean;
    delete_tasks: boolean;
    bulk_task_edit: boolean;
    view_growth: boolean;
    manage_leads: boolean;
    delete_leads: boolean;
    view_clients: boolean;
    manage_clients: boolean;
    delete_clients: boolean;
    view_calendar: boolean;
    manage_calendar: boolean;
    use_ai: boolean;
    view_tickets: boolean;
    manage_tickets: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar: string;
    password?: string;
    department?: string;
    permissions: UserPermissions;
}

export type TaxRegime = 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real' | 'MEI';

export interface Client {
    id: string;
    name: string;
    companyName: string;
    cnpj: string;
    regime: TaxRegime;
    email: string;
    phone: string;
    status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
    monthlyFee: number;
    address: {
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        zip: string;
    };
    responsible: {
        name: string;
        email: string;
        phone: string;
        role: string;
    };
    contract: {
        startDate: string;
        feeDueDate: number;
        readjustmentMonth: string;
    };
    notes?: string;
    documents?: {
        name: string;
        url: string;
        date: string;
    }[];
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Subtask {
    id: string;
    title: string;
    description?: string;
    notes?: string;
    completed: boolean;
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    createdAt: string;
}

export interface Tag {
    id: string;
    label: string;
    color: string;
}

export interface Attachment {
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
    uploadedAt: string;
}

export interface Task {
    id: string;
    pipelineId: string;
    title: string;
    description: string;
    clientId?: string;
    clientName?: string;
    isInternal: boolean;
    assigneeId?: string;
    dueDate: string;
    priority: TaskPriority;
    status: string;
    type: 'FISCAL' | 'CONTABIL' | 'DP' | 'LEGAL' | 'ADM';
    subtasks: Subtask[];
    comments: Comment[];
    tags: Tag[];
    attachments: Attachment[];
}

export interface PipelineColumn {
    id: string;
    label: string;
    dotColor: string;
}

export interface Pipeline {
    id: string;
    name: string;
    columns: PipelineColumn[];
}

export interface DashboardStats {
    totalClients: number;
    pendingTasks: number;
    revenue: number;
    tasksDueToday: number;
}

export interface GoogleCalendarConfig {
    clientId: string;
    apiKey: string;
    connected: boolean;
    selectedCalendarId?: string;
}

export interface CalendarListEntry {
    id: string;
    summary: string;
    primary?: boolean;
    backgroundColor?: string;
    accessRole: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    type: 'MEETING' | 'TASK' | 'DEADLINE' | 'PERSONAL';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    color?: string;
    description?: string;
    location?: string;
    googleEventId?: string;
    calendarId?: string;
}

export interface CompanyProfile {
    name: string;
    cnpj: string;
    email?: string;
    phone?: string;
    website?: string;
    primaryColor: string;
    address?: string;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    loginBackgroundUrl?: string;
    faviconUrl?: string;
    sidebarTheme: 'light' | 'dark' | 'brand';
    loginTitle: string;
    loginMessage: string;
    logoUrl?: string;
    sidebarLinks?: { id: string; label: string; url: string }[];
    plan?: string;
}

export type AuditAction = 
    'TASK_CREATE' | 'TASK_DELETE' | 'TASK_UPDATE' | 'TASK_COMPLETE' |
    'CLIENT_CREATE' | 'CLIENT_DELETE' | 'CLIENT_UPDATE' |
    'USER_INVITE' | 'USER_DELETE' | 'SETTINGS_CHANGE' | 'LOGIN' | 'ACTION_UNDO';

export interface AuditLogEntry {
    id: string;
    action: AuditAction;
    targetName: string;
    userName: string;
    userAvatar: string;
    timestamp: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
    details?: string;
    undoData?: string;
    reverted: boolean;
}

export interface LogBackup {
    logs: AuditLogEntry[];
    clearedAt: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    timestamp: string;
    isFromMe: boolean;
    status: 'SENT' | 'DELIVERED' | 'READ';
    type: 'text' | 'image' | 'file';
}

export interface ChatConversation {
    id: string;
    contactName: string;
    phoneNumber: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: ChatMessage[];
    avatar?: string;
}

// Added missing types to fix errors

/**
 * Added to fix errors in components/Dashboard.tsx and constants.ts
 */
export type WidgetType = 'REVENUE_CHART' | 'CLIENT_KPI' | 'PRODUCTIVITY_RADIAL' | 'TEAM_WORKLOAD' | 'TAX_DISTRIBUTION';

/**
 * Added to fix errors in components/Dashboard.tsx and constants.ts
 */
export interface DashboardWidgetConfig {
    id: WidgetType;
    label: string;
    isVisible: boolean;
    colSpan: string;
}

/**
 * Added to fix errors in SalesCRM, WhatsApp, ExportData, App, etc.
 */
export interface Lead {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    value: number;
    status: string;
    source: 'INDICATION' | 'OUTBOUND' | 'EVENT' | 'RECURRENCE';
    probability: number;
    createdAt: string;
    lastInteraction: string;
    temperature: 'COLD' | 'WARM' | 'HOT';
    nextFollowUp?: string;
    notes: string[];
    history: any[];
    pipelineId?: string;
}

/**
 * Added to fix error in components/SalesCRM.tsx
 */
export interface LeadPipelineColumn {
    id: string;
    label: string;
    color: string;
}

/**
 * Added to fix error in components/SalesCRM.tsx
 */
export interface LeadPipeline {
    id: string;
    name: string;
    columns: LeadPipelineColumn[];
}

/**
 * Added to fix error in components/WhatsApp.tsx
 */
export type WhatsAppConnectionState = 'IDLE' | 'LOADING' | 'CONNECTED' | 'DISCONNECTED' | 'QR_READY' | 'ERROR';

/**
 * Added to fix error in services/whatsappService.ts
 */
export interface WhatsAppConfig {
    gatewayUrl: string;
    apiKey: string;
    infosimplesToken: string;
}

/**
 * Added to fix error in services/whatsappService.ts
 */
export interface EvolutionConnectionStateResponse {
    instance: {
        state: string;
    };
}

/**
 * Added to fix error in services/whatsappService.ts
 */
export interface EvolutionWebhookPayload {
    data: {
        key: {
            remoteJid: string;
        };
        pushName: string;
    };
}

/**
 * Added to fix error in components/ServiceCenter.tsx
 */
export interface CNPJData {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    situacao_cadastral: string;
    data_inicio_atividade: string;
    cnae_fiscal: number;
    cnae_fiscal_descricao: string;
    municipio: string;
    uf: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cep: string;
}

/**
 * Added to fix error in components/ServiceCenter.tsx
 */
export interface CEPData {
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    service: string;
}

/**
 * Added to fix error in components/ServiceCenter.tsx
 */
export interface ECACResultData {
    cnpj: string;
    nome: string;
    data_hora_consulta: string;
    certidao_negativa: boolean;
    debitos_federais?: any[];
    pendencias_cadastrais?: any[];
}

/**
 * Added to fix error in components/Tickets.tsx
 */
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'CLOSED';

/**
 * Added to fix error in components/Tickets.tsx
 */
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/**
 * Added to fix error in components/Tickets.tsx
 */
export interface TicketMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    text: string;
    timestamp: string;
    isInternal: boolean;
}

/**
 * Added to fix error in components/Tickets.tsx
 */
export interface Ticket {
    id: string;
    clientId: string;
    clientName: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: 'TECHNICAL' | 'FISCAL' | 'BILLING' | 'OTHER';
    assigneeId?: string;
    createdAt: string;
    updatedAt: string;
    messages: TicketMessage[];
}
