
/**
 * Marketing Service
 * Atualmente desativado conforme solicitação do usuário para remover mídias sociais.
 */
class MarketingService {
    getConfig() { return {}; }
    saveConfig() {}
    async getInstagramInsights() { return {}; }
    async getSocialPosts() { return []; }
    async getInstagramProfile() { return null; }
}

export const marketingService = new MarketingService();
