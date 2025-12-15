import { WhatsAppConfig, EvolutionConnectionStateResponse, Client, Lead, EvolutionWebhookPayload, ChatConversation, ChatMessage } from '../types';

class WhatsAppService {
    private baseURL = 'https://api.crmcontabil.com';
    private apiKey = 'Erik107250@';
    private infosimplesToken = '';

    constructor() {
        const saved = localStorage.getItem('whatsapp_config');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                this.baseURL = config.gatewayUrl || this.baseURL;
                this.apiKey = config.apiKey || this.apiKey;
                this.infosimplesToken = config.infosimplesToken || '';
            } catch (e) {
                console.error("Error loading WhatsApp Config", e);
            }
        }
    }

    private getHeaders(isMultipart = false) {
        const headers: any = { 'apikey': this.apiKey };
        if (!isMultipart) headers['Content-Type'] = 'application/json';
        return headers;
    }

    async checkConnectionState(instanceName: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseURL}/instance/connectionState/${instanceName}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (response.status === 404) return 'NOT_FOUND';
            const data: EvolutionConnectionStateResponse = await response.json();
            return data.instance?.state || 'close';
        } catch (error) {
            return 'ERROR';
        }
    }

    async createInstance(instanceName: string): Promise<boolean> {
        try {
            const state = await this.checkConnectionState(instanceName);
            if (state !== 'NOT_FOUND') return true;

            const response = await fetch(`${this.baseURL}/instance/create`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ 
                    instanceName, 
                    token: "crm_token_" + instanceName,
                    qrcode: true 
                })
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async getConnectQR(instanceName: string): Promise<string | null> {
        try {
            const response = await fetch(`${this.baseURL}/instance/connect/${instanceName}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.base64 || data.qrcode?.base64 || data.code || null;
        } catch (error) {
            return null;
        }
    }

    async logoutInstance(instanceName: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/instance/logout/${instanceName}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async deleteInstance(instanceName: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/instance/delete/${instanceName}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async sendMessage(instanceName: string, number: string, text: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/message/sendText/${instanceName}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    number: number.replace(/\D/g, ''),
                    options: { delay: 1200, presence: "composing", linkPreview: false },
                    textMessage: { text }
                })
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    getConfig(): WhatsAppConfig {
        return { 
            gatewayUrl: this.baseURL, 
            apiKey: this.apiKey,
            infosimplesToken: this.infosimplesToken 
        };
    }

    saveConfig(config: WhatsAppConfig) {
        this.baseURL = config.gatewayUrl;
        this.apiKey = config.apiKey;
        this.infosimplesToken = config.infosimplesToken || '';
        localStorage.setItem('whatsapp_config', JSON.stringify(config));
    }

    processWebhookUpsert(payload: EvolutionWebhookPayload, clients: Client[], leads: Lead[]) {
        const remoteJid = payload.data.key.remoteJid;
        const pushName = payload.data.pushName;
        if (!pushName) return { updatedClients: clients, updatedLeads: leads, syncLog: null };

        const phoneNumber = remoteJid.split('@')[0];
        let syncLog: string | null = null;

        const updatedClients = clients.map(c => {
            const cleanPhone = c.phone.replace(/\D/g, '');
            if (phoneNumber.includes(cleanPhone)) {
                syncLog = `Contato ${c.name} sincronizado via WhatsApp para "${pushName}"`;
                return { ...c, name: pushName };
            }
            return c;
        });

        const updatedLeads = leads.map(l => {
            const cleanPhone = l.phone.replace(/\D/g, '');
            if (phoneNumber.includes(cleanPhone)) {
                syncLog = `Responsável do lead ${l.name} sincronizado via WhatsApp para "${pushName}"`;
                return { ...l, contactPerson: pushName };
            }
            return l;
        });

        return { updatedClients, updatedLeads, syncLog };
    }
}

export const whatsAppService = new WhatsAppService();