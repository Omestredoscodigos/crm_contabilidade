
import { Client, Task, User, CompanyProfile } from '../types';

const BASE_URL = '/api';

export const apiService = {
    async getWorkspaceData(slug: string) {
        const response = await fetch(`${BASE_URL}/workspace/${slug}`);
        if (!response.ok) throw new Error("Erro ao conectar com servidor");
        return await response.json();
    },

    async saveClient(client: Client, workspaceSlug: string) {
        const response = await fetch(`${BASE_URL}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...client, workspace_slug: workspaceSlug })
        });
        return await response.json();
    },

    async updateTaskStatus(taskId: string, status: string) {
        const response = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return await response.json();
    }
};
