// ─────────────────────────────────────────────────────────
// Mock Data — derived from political_ai_platform.py output
// ─────────────────────────────────────────────────────────
import type { ConstituencyState, Alert, SimulationResult, SystemStatus, Topic } from '../types';


const TOPICS: Topic[] = ['Economy', 'Security', 'Healthcare', 'Infrastructure', 'Governance', 'Identity'];

// ─── Trending Posts Mock Data ──────────────────────────────
export interface TrendingPost {
    id: string;
    platform: 'twitter' | 'youtube' | 'reddit' | 'facebook' | 'telegram' | 'news';
    author: string;
    handle: string;
    content: string;
    topic: Topic;
    engagement: { likes: number; shares: number; comments: number };
    sentiment: number;
    timestamp: string;
    verified: boolean;
    constituency: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PLATFORM_NAMES = { twitter: '𝕏 Twitter', youtube: '▶ YouTube', reddit: '⬡ Reddit', facebook: 'f Facebook', telegram: '✈ Telegram', news: '📰 News' };
export const TRENDING_POSTS: TrendingPost[] = [
    // Economy
    { id: 'tp-1', platform: 'twitter', author: 'Rajesh Kumar', handle: '@rajesh_econ', content: 'Inflation in Wardha has hit 8.2% — small farmers are struggling to afford basic inputs. Government subsidies are not reaching ground level. #AgriCrisis #WardhaFarmers', topic: 'Economy', engagement: { likes: 12400, shares: 5600, comments: 890 }, sentiment: -0.72, timestamp: new Date(Date.now() - 900000).toISOString(), verified: true, constituency: 'Wardha' },
    { id: 'tp-2', platform: 'youtube', author: 'Maharashtra Today', handle: '@maharashtra_today', content: '📺 "Why Are Prices Rising in Rural Maharashtra?" — 45 min documentary exposing the supply chain breakdown affecting crop prices in Nashik district', topic: 'Economy', engagement: { likes: 34000, shares: 8200, comments: 2100 }, sentiment: -0.58, timestamp: new Date(Date.now() - 1800000).toISOString(), verified: true, constituency: 'Nashik' },
    { id: 'tp-3', platform: 'reddit', author: 'u/pune_techie', handle: 'r/IndiaEconomy', content: 'Mumbai South IT sector salaries up 12% YoY — stark contrast to agricultural distress in interior regions. Two Indias are diverging fast.', topic: 'Economy', engagement: { likes: 2300, shares: 480, comments: 340 }, sentiment: 0.15, timestamp: new Date(Date.now() - 3600000).toISOString(), verified: false, constituency: 'Mumbai_South' },
    { id: 'tp-4', platform: 'news', author: 'Times of India', handle: '@TOI_Mumbai', content: 'BREAKING: RBI signals rate cut by Q3 — markets rally 2.1% on positive economic outlook. Pune manufacturing index up for third straight month.', topic: 'Economy', engagement: { likes: 45000, shares: 12000, comments: 3400 }, sentiment: 0.68, timestamp: new Date(Date.now() - 600000).toISOString(), verified: true, constituency: 'Pune' },

    // Healthcare
    { id: 'tp-5', platform: 'twitter', author: 'Dr. Priya Desai', handle: '@drpriya_health', content: 'Wardha district hospital has only 3 working ventilators for 200,000 population. We are running out of basic medicines. This is a healthcare emergency. 🏥', topic: 'Healthcare', engagement: { likes: 28000, shares: 15000, comments: 4200 }, sentiment: -0.82, timestamp: new Date(Date.now() - 1200000).toISOString(), verified: true, constituency: 'Wardha' },
    { id: 'tp-6', platform: 'youtube', author: 'Health Desk TV', handle: '@healthdesk_tv', content: '📺 "Maharashtra Health Report 2024" — New data shows 40% drop in child malnutrition in Thane after govt nutrition program rollout', topic: 'Healthcare', engagement: { likes: 18000, shares: 3800, comments: 920 }, sentiment: 0.45, timestamp: new Date(Date.now() - 5400000).toISOString(), verified: true, constituency: 'Thane' },

    // Security
    { id: 'tp-7', platform: 'telegram', author: 'Nashik Alert', handle: '@nashik_alert', content: '⚠ Reports of increased theft incidents in Nashik rural areas. Police deployment remains thin. Citizens demanding better law enforcement presence.', topic: 'Security', engagement: { likes: 5400, shares: 3200, comments: 780 }, sentiment: -0.55, timestamp: new Date(Date.now() - 2400000).toISOString(), verified: false, constituency: 'Nashik' },
    { id: 'tp-8', platform: 'news', author: 'NDTV Maharashtra', handle: '@NDTV_Maha', content: 'Maharashtra CM announces 500 new police stations across rural constituencies — Wardha and Nashik prioritized after rising crime reports', topic: 'Security', engagement: { likes: 22000, shares: 6800, comments: 1500 }, sentiment: 0.32, timestamp: new Date(Date.now() - 7200000).toISOString(), verified: true, constituency: 'Wardha' },

    // Infrastructure
    { id: 'tp-9', platform: 'twitter', author: 'Pune Metro Official', handle: '@PuneMetroRail', content: '🚇 Phase 2 of Pune Metro is 78% complete! Expected to reduce commute time by 40 mins for 2.5 lakh daily commuters. #PuneGrows #Infrastructure', topic: 'Infrastructure', engagement: { likes: 38000, shares: 9200, comments: 2800 }, sentiment: 0.78, timestamp: new Date(Date.now() - 4200000).toISOString(), verified: true, constituency: 'Pune' },
    { id: 'tp-10', platform: 'facebook', author: 'Wardha Citizens Forum', handle: 'Wardha Citizens', content: 'Main highway connecting Wardha to Nagpur still has 23 potholes reported in last month. No action from PWD despite multiple complaints. Tag your MLA!', topic: 'Infrastructure', engagement: { likes: 8900, shares: 4500, comments: 1200 }, sentiment: -0.65, timestamp: new Date(Date.now() - 3000000).toISOString(), verified: false, constituency: 'Wardha' },

    // Governance
    { id: 'tp-11', platform: 'twitter', author: 'RTI Activist MH', handle: '@rti_maharashtra', content: 'RTI reveals ₹450 Cr allocated for Wardha irrigation project — only ₹85 Cr spent in 3 years. Where is the remaining money? #Accountability #Governance', topic: 'Governance', engagement: { likes: 42000, shares: 18000, comments: 5600 }, sentiment: -0.75, timestamp: new Date(Date.now() - 1500000).toISOString(), verified: true, constituency: 'Wardha' },
    { id: 'tp-12', platform: 'news', author: 'Indian Express', handle: '@IndianExpress', content: 'Mumbai South civic body achieves 95% digital service delivery — ranked #1 among Indian constituencies in e-governance index 2024', topic: 'Governance', engagement: { likes: 15000, shares: 3200, comments: 680 }, sentiment: 0.62, timestamp: new Date(Date.now() - 9000000).toISOString(), verified: true, constituency: 'Mumbai_South' },

    // Identity
    { id: 'tp-13', platform: 'youtube', author: 'Culture Maharashtra', handle: '@culture_mh', content: '📺 "The Forgotten Traditions of Wardha" — Documentary on how industrial change is eroding traditional cotton weaving culture in Wardha villages', topic: 'Identity', engagement: { likes: 56000, shares: 22000, comments: 7800 }, sentiment: -0.25, timestamp: new Date(Date.now() - 6000000).toISOString(), verified: true, constituency: 'Wardha' },
    { id: 'tp-14', platform: 'reddit', author: 'u/mumbai_heritage', handle: 'r/Maharashtra', content: 'TIL: Thane has more than 300 heritage sites. New citizen initiative mapping and preserving them digitally. This is how we protect our identity 🏛️', topic: 'Identity', engagement: { likes: 3800, shares: 920, comments: 450 }, sentiment: 0.55, timestamp: new Date(Date.now() - 7800000).toISOString(), verified: false, constituency: 'Thane' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function randomSalience(): Record<Topic, number> {
    const raw = TOPICS.map(() => Math.random());
    const sum = raw.reduce((a, b) => a + b, 0);
    const result: Record<string, number> = {};
    TOPICS.forEach((t, i) => { result[t] = raw[i] / sum; });
    return result as Record<Topic, number>;
}

export const CONSTITUENCY_DATA: Record<string, ConstituencyState> = {
    Mumbai_South: {
        name: 'Mumbai South', lat: 18.90, lon: 72.83, tier: 1,
        s: 0.231, velocity: 0.018, acceleration: 0.003,
        volatility: 0.045, stability_index: 0.78,
        topic_salience: { Economy: 0.32, Security: 0.12, Healthcare: 0.18, Infrastructure: 0.15, Governance: 0.13, Identity: 0.10 },
        uncertainty: 0.008, last_updated: new Date().toISOString(),
    },
    Thane: {
        name: 'Thane', lat: 19.21, lon: 72.98, tier: 1,
        s: 0.142, velocity: 0.009, acceleration: -0.002,
        volatility: 0.038, stability_index: 0.72,
        topic_salience: { Economy: 0.25, Security: 0.18, Healthcare: 0.15, Infrastructure: 0.20, Governance: 0.12, Identity: 0.10 },
        uncertainty: 0.012, last_updated: new Date().toISOString(),
    },
    Nashik: {
        name: 'Nashik', lat: 19.99, lon: 73.79, tier: 2,
        s: -0.185, velocity: -0.045, acceleration: -0.018,
        volatility: 0.089, stability_index: 0.35,
        topic_salience: { Economy: 0.38, Security: 0.10, Healthcare: 0.20, Infrastructure: 0.12, Governance: 0.15, Identity: 0.05 },
        uncertainty: 0.025, last_updated: new Date().toISOString(),
    },
    Pune: {
        name: 'Pune', lat: 18.52, lon: 73.85, tier: 1,
        s: 0.089, velocity: -0.012, acceleration: 0.005,
        volatility: 0.052, stability_index: 0.65,
        topic_salience: { Economy: 0.22, Security: 0.15, Healthcare: 0.14, Infrastructure: 0.25, Governance: 0.14, Identity: 0.10 },
        uncertainty: 0.015, last_updated: new Date().toISOString(),
    },
    Wardha: {
        name: 'Wardha', lat: 20.75, lon: 78.60, tier: 2,
        s: -0.465, velocity: -0.065, acceleration: -0.028,
        volatility: 0.125, stability_index: 0.22,
        topic_salience: { Economy: 0.42, Security: 0.08, Healthcare: 0.22, Infrastructure: 0.10, Governance: 0.12, Identity: 0.06 },
        uncertainty: 0.035, last_updated: new Date().toISOString(),
    },
};

// Generate 24-step history for each constituency
export function generateHistory(): Record<string, number[]> {
    const history: Record<string, number[]> = {};
    Object.entries(CONSTITUENCY_DATA).forEach(([key, c]) => {
        const arr: number[] = [];
        let val = c.s + (Math.random() - 0.5) * 0.3;
        for (let i = 0; i < 24; i++) {
            val += (Math.random() - 0.5) * 0.04 + (c.s - val) * 0.05;
            arr.push(parseFloat(val.toFixed(3)));
        }
        arr[23] = c.s; // ensure last step matches current
        history[key] = arr;
    });
    return history;
}

let alertIdCounter = 0;
export function generateAlerts(): Alert[] {
    const alerts: Alert[] = [
        { id: `alert-${alertIdCounter++}`, type: 'CRISIS', constituency: 'Wardha', detail: 's=−0.465 v=−0.065/step', timestamp: new Date(Date.now() - 120000).toISOString(), read: false },
        { id: `alert-${alertIdCounter++}`, type: 'DRIFT', constituency: 'Nashik', detail: 's=−0.185 v=−0.045/step', timestamp: new Date(Date.now() - 300000).toISOString(), read: false },
        { id: `alert-${alertIdCounter++}`, type: 'INSTABILITY', constituency: 'Wardha', detail: 'SI=0.220', timestamp: new Date(Date.now() - 180000).toISOString(), read: false },
        { id: `alert-${alertIdCounter++}`, type: 'ACCELERATION', constituency: 'Wardha', detail: 's̈=−0.028 (crisis forming)', timestamp: new Date(Date.now() - 60000).toISOString(), read: false },
        { id: `alert-${alertIdCounter++}`, type: 'VIRALITY', constituency: 'Mumbai_South', detail: 'V=0.712', timestamp: new Date(Date.now() - 420000).toISOString(), read: false },
        { id: `alert-${alertIdCounter++}`, type: 'DRIFT', constituency: 'Pune', detail: 's=+0.089 v=−0.012/step', timestamp: new Date(Date.now() - 600000).toISOString(), read: true },
    ];
    return alerts;
}

export function generateNewAlert(): Alert {
    const types: Alert['type'][] = ['CRISIS', 'DRIFT', 'INSTABILITY', 'VIRALITY', 'ACCELERATION'];
    const constituencies = Object.keys(CONSTITUENCY_DATA);
    const type = types[Math.floor(Math.random() * types.length)];
    const constituency = constituencies[Math.floor(Math.random() * constituencies.length)];
    const c = CONSTITUENCY_DATA[constituency];
    const details: Record<string, string> = {
        CRISIS: `s=${c.s.toFixed(3)} v=${c.velocity.toFixed(3)}/step`,
        DRIFT: `s=${c.s.toFixed(3)} v=${c.velocity.toFixed(3)}/step`,
        INSTABILITY: `SI=${c.stability_index.toFixed(3)}`,
        VIRALITY: `V=${(Math.random() * 0.4 + 0.5).toFixed(3)}`,
        ACCELERATION: `s̈=${c.acceleration.toFixed(3)} (crisis forming)`,
    };
    return {
        id: `alert-${alertIdCounter++}`,
        type,
        constituency,
        detail: details[type],
        timestamp: new Date().toISOString(),
        read: false,
    };
}

export const MOCK_SIMULATION: SimulationResult = {
    target: 'Wardha',
    ranked_strategies: [
        {
            rank: 1, name: 'Direct Relief Announcement', score: 0.1847,
            predicted_reception: 0.231, confidence: 0.942, delta_volatility: 0.008,
            trajectory: [-0.465, -0.380, -0.290, -0.180, -0.050, 0.080],
            description: 'Direct announcement of agricultural relief package',
        },
        {
            rank: 2, name: 'Community Empowerment', score: 0.1203,
            predicted_reception: 0.152, confidence: 0.887, delta_volatility: 0.015,
            trajectory: [-0.465, -0.410, -0.340, -0.260, -0.170, -0.060],
            description: 'Community-led development narrative',
        },
        {
            rank: 3, name: 'Infrastructure Focus', score: 0.0891,
            predicted_reception: 0.098, confidence: 0.834, delta_volatility: 0.022,
            trajectory: [-0.465, -0.430, -0.380, -0.320, -0.250, -0.170],
            description: 'Redirect attention to infrastructure delivery',
        },
    ],
};

export const SYSTEM_STATUSES: SystemStatus[] = [
    { name: 'Data Ingestion', status: 'ok', lastPing: new Date().toISOString() },
    { name: 'Model Inference', status: 'ok', lastPing: new Date().toISOString() },
    { name: 'Spatial Smoothing', status: 'ok', lastPing: new Date().toISOString() },
    { name: 'Strategy Engine', status: 'ok', lastPing: new Date().toISOString() },
    { name: 'WebSocket Feed', status: 'ok', lastPing: new Date().toISOString() },
];

// Simulate a tiny random fluctuation of state
export function perturbState(state: ConstituencyState): ConstituencyState {
    const ds = (Math.random() - 0.48) * 0.012;
    const newS = parseFloat((state.s + ds).toFixed(3));
    const newV = parseFloat((newS - state.s).toFixed(4));
    const newA = parseFloat((newV - state.velocity).toFixed(4));
    const newVol = parseFloat(Math.max(0, state.volatility + (Math.random() - 0.5) * 0.005).toFixed(4));
    const newSI = parseFloat(Math.max(0, Math.min(1, state.stability_index + (Math.random() - 0.5) * 0.02)).toFixed(3));
    const newSalience = { ...state.topic_salience };
    const topics = Object.keys(newSalience) as (keyof typeof newSalience)[];
    const idx = Math.floor(Math.random() * topics.length);
    const idx2 = (idx + 1) % topics.length;
    const shift = Math.random() * 0.02;
    newSalience[topics[idx]] = Math.max(0, newSalience[topics[idx]] + shift);
    newSalience[topics[idx2]] = Math.max(0, newSalience[topics[idx2]] - shift);
    // Normalize
    const total = Object.values(newSalience).reduce((a, b) => a + b, 0);
    topics.forEach(t => { newSalience[t] = newSalience[t] / total; });

    return {
        ...state,
        s: newS,
        velocity: newV,
        acceleration: newA,
        volatility: newVol,
        stability_index: newSI,
        topic_salience: newSalience,
        last_updated: new Date().toISOString(),
    };
}
