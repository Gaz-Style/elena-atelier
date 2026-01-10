export interface MarketingMetrics {
    metaAds: {
        spend: number;
        roas: number;
        reach: number;
        conversions: number;
    };
    seoGeo: {
        aiRecommendations: number;
        organicTraffic: number;
        localRanking: number; // 1-10
    };
    whatsapp: {
        totalConversations: number;
        conversionRate: number;
        recoveryRate: number; // Abandoned cart/booking
    };
    influencers: {
        mentions: number;
        referralSales: number;
    };
}

export async function getMarketingMetrics(): Promise<MarketingMetrics> {
    // Simulated data representing high-performance 2026 marketing
    return {
        metaAds: {
            spend: 1200000,
            roas: 4.8,
            reach: 45000,
            conversions: 85,
        },
        seoGeo: {
            aiRecommendations: 42, // IA (ChatGPT/Perplexity) suggested Elena
            organicTraffic: 12500,
            localRanking: 1, // #1 in Vitacura for luxury restoration
        },
        whatsapp: {
            totalConversations: 320,
            conversionRate: 0.15,
            recoveryRate: 0.22,
        },
        influencers: {
            mentions: 12,
            referralSales: 15,
        }
    };
}
