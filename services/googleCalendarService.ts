
import { CalendarEvent, GoogleCalendarConfig, CalendarListEntry } from '../types';
import { MOCK_EVENTS, DEFAULT_GOOGLE_CALENDAR_CONFIG } from '../constants';

declare var gapi: any;
declare var google: any;

class GoogleCalendarService {
    private config: GoogleCalendarConfig = DEFAULT_GOOGLE_CALENDAR_CONFIG;
    private localEvents: CalendarEvent[] = [];
    private accessToken: string | null = null;
    
    constructor() {
        this.loadLocalData();
    }

    private loadLocalData() {
        const savedConfig = localStorage.getItem('google_calendar_config');
        if (savedConfig) {
            try {
                this.config = JSON.parse(savedConfig);
            } catch (e) { console.error("Erro ao carregar config da agenda"); }
        }

        const savedEvents = localStorage.getItem('crm_calendar_events');
        if (savedEvents) {
            try {
                this.localEvents = JSON.parse(savedEvents);
            } catch (e) { 
                this.localEvents = [...MOCK_EVENTS]; 
            }
        } else {
            this.localEvents = [...MOCK_EVENTS];
            this.saveLocalEvents();
        }
    }

    private saveLocalEvents() {
        localStorage.setItem('crm_calendar_events', JSON.stringify(this.localEvents));
    }

    getConfig() {
        return this.config;
    }

    saveConfig(newConfig: GoogleCalendarConfig) {
        this.config = newConfig;
        localStorage.setItem('google_calendar_config', JSON.stringify(newConfig));
    }

    /**
     * Inicializa os scripts do Google e tenta autenticar
     */
    async connectAndValidate(config: GoogleCalendarConfig): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                if (!config.clientId || !config.apiKey) {
                    throw new Error("Client ID e API Key são obrigatórios.");
                }

                // Inicializa o Token Client (Google Identity Services)
                const tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: config.clientId,
                    scope: 'https://www.googleapis.com/auth/calendar',
                    callback: async (response: any) => {
                        if (response.error !== undefined) {
                            reject(response);
                            return;
                        }
                        this.accessToken = response.access_token;
                        
                        // Após obter o token, tentamos carregar a biblioteca de cliente (GAPI)
                        // para validar se as chaves funcionam na prática
                        await this.initGapiClient(config.apiKey);
                        
                        const isValid = await this.testConnection();
                        if (isValid) {
                            this.config = { ...config, connected: true };
                            this.saveConfig(this.config);
                            resolve(true);
                        } else {
                            reject(new Error("Falha na validação das chaves. Verifique o console."));
                        }
                    },
                });

                // Solicita o token (abre o popup)
                if (this.accessToken === null) {
                    tokenClient.requestAccessToken({ prompt: 'consent' });
                } else {
                    tokenClient.requestAccessToken({ prompt: '' });
                }
            } catch (err) {
                console.error("Erro no processo de conexão Google:", err);
                reject(err);
            }
        });
    }

    private async initGapiClient(apiKey: string) {
        return new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: apiKey,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                    });
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    private async testConnection(): Promise<boolean> {
        try {
            // Tenta uma chamada simples para ver se a API Key + Token estão OK
            await gapi.client.calendar.calendarList.list({ maxResults: 1 });
            return true;
        } catch (err) {
            console.error("Erro ao testar conexão GAPI:", err);
            return false;
        }
    }

    async listCalendars(): Promise<CalendarListEntry[]> {
        if (!this.config.connected) {
             return [{ id: 'primary', summary: 'Agenda Local CRM', primary: true, accessRole: 'owner', backgroundColor: '#6366f1' }];
        }

        try {
            if (typeof gapi !== 'undefined' && gapi.client?.calendar) {
                const response = await gapi.client.calendar.calendarList.list();
                return response.result.items.map((item: any) => ({
                    id: item.id,
                    summary: item.summary,
                    primary: item.primary || false,
                    backgroundColor: item.backgroundColor || '#6366f1',
                    accessRole: item.accessRole
                }));
            }
        } catch (error) {
            console.error("Erro ao listar agendas:", error);
        }
        
        return [{ id: 'primary', summary: 'Erro na Sincronização Google', primary: true, accessRole: 'reader', backgroundColor: '#ef4444' }];
    }

    async listEvents(calendarId: string = 'primary'): Promise<CalendarEvent[]> {
        if (this.config.connected && typeof gapi !== 'undefined' && gapi.client?.calendar) {
            try {
                const response = await gapi.client.calendar.events.list({
                    calendarId: calendarId,
                    timeMin: (new Date()).toISOString(),
                    showDeleted: false,
                    singleEvents: true,
                    orderBy: 'startTime',
                });
                
                return response.result.items.map((e: any) => ({
                    id: e.id,
                    title: e.summary,
                    start: e.start.dateTime || e.start.date,
                    end: e.end.dateTime || e.end.date,
                    description: e.description,
                    googleEventId: e.id,
                    calendarId: calendarId,
                    color: '#6366f1'
                }));
            } catch (err) {
                console.error("Erro ao puxar eventos:", err);
            }
        }
        return this.localEvents.filter(e => !e.calendarId || e.calendarId === calendarId);
    }

    async createEvent(event: Omit<CalendarEvent, 'id'>, targetCalendarId: string = 'primary'): Promise<CalendarEvent> {
        const startISO = new Date(event.start).toISOString();
        const endISO = new Date(event.end).toISOString();

        const newEvent: CalendarEvent = {
            ...event,
            id: 'evt_' + Math.random().toString(36).substr(2, 9),
            start: startISO,
            end: endISO,
            calendarId: targetCalendarId
        };
        
        this.localEvents.push(newEvent);
        this.saveLocalEvents();

        if (this.config.connected && typeof gapi !== 'undefined' && gapi.client?.calendar) {
            try {
                const response = await gapi.client.calendar.events.insert({
                    'calendarId': targetCalendarId,
                    'resource': {
                        'summary': event.title,
                        'description': event.description,
                        'start': { 'dateTime': startISO },
                        'end': { 'dateTime': endISO }
                    }
                });
                newEvent.googleEventId = response.result.id;
                this.localEvents = this.localEvents.map(e => e.id === newEvent.id ? newEvent : e);
                this.saveLocalEvents();
            } catch (error) {
                console.error("Erro ao inserir no Google:", error);
            }
        }

        return newEvent;
    }

    async deleteEvent(eventId: string, calendarId: string = 'primary'): Promise<void> {
        const event = this.localEvents.find(e => e.id === eventId);
        if (event?.googleEventId && this.config.connected && typeof gapi !== 'undefined' && gapi.client?.calendar) {
            try {
                await gapi.client.calendar.events.delete({
                    calendarId: calendarId,
                    eventId: event.googleEventId
                });
            } catch (e) { console.error("Erro ao deletar no Google"); }
        }
        this.localEvents = this.localEvents.filter(e => e.id !== eventId);
        this.saveLocalEvents();
    }
}

export const googleCalendarService = new GoogleCalendarService();
