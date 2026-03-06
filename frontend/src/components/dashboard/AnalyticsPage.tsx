import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatformStore } from '../../store/platformStore';
import { sentimentColor, statusColor, topicColors } from '../../design-system';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TRENDING_POSTS, type TrendingPost } from '../../data/mockData';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from 'recharts';
import type { Topic } from '../../types';
import {
    ThumbsUp, Share2, MessageCircle, CheckCircle2,
    TrendingUp, Filter, ExternalLink, Eye,
} from 'lucide-react';
/* eslint-enable @typescript-eslint/no-unused-vars */

const TOPICS: Topic[] = ['Economy', 'Security', 'Healthcare', 'Infrastructure', 'Governance', 'Identity'];

const PLATFORM_STYLES: Record<string, { icon: string; color: string; name: string }> = {
    twitter: { icon: '𝕏', color: '#1DA1F2', name: 'Twitter / X' },
    youtube: { icon: '▶', color: '#FF0000', name: 'YouTube' },
    reddit: { icon: '⬡', color: '#FF4500', name: 'Reddit' },
    facebook: { icon: 'f', color: '#1877F2', name: 'Facebook' },
    telegram: { icon: '✈', color: '#0088CC', name: 'Telegram' },
    news: { icon: '📰', color: '#FFB300', name: 'News' },
};

function formatNum(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

function timeAgo(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

const AnalyticsPage: React.FC = () => {
    const constituencies = usePlatformStore((s) => s.constituencies);
    const alerts = usePlatformStore((s) => s.alerts);
    const [filterTopic, setFilterTopic] = useState<Topic | 'all'>('all');
    const [filterPlatform, setFilterPlatform] = useState<string | 'all'>('all');

    // Overall stats
    const avgSentiment = useMemo(() => {
        const cKeys = Object.keys(constituencies);
        const vals = cKeys.map((k) => constituencies[k].s);
        return vals.reduce((a, b) => a + b, 0) / vals.length;
    }, [constituencies]);

    const avgSI = useMemo(() => {
        const cKeys = Object.keys(constituencies);
        const vals = cKeys.map((k) => constituencies[k].stability_index);
        return vals.reduce((a, b) => a + b, 0) / vals.length;
    }, [constituencies]);

    const crisisCount = useMemo(() => Object.keys(constituencies).filter((k) => constituencies[k].stability_index < 0.3).length, [constituencies]);

    // Sentiment bar data
    const sentimentBarData = useMemo(() => {
        const cKeys = Object.keys(constituencies);
        return cKeys.map((k) => ({
            name: constituencies[k].name,
            sentiment: parseFloat(constituencies[k].s.toFixed(3)),
            fill: sentimentColor(constituencies[k].s),
        }));
    }, [constituencies]);

    // Topic distribution pie
    const topicPieData = useMemo(() => {
        const cKeys = Object.keys(constituencies);
        const totals: Record<string, number> = {};
        TOPICS.forEach((t) => { totals[t] = 0; });
        cKeys.forEach((k) => {
            TOPICS.forEach((t) => {
                totals[t] += constituencies[k].topic_salience?.[t] || 0;
            });
        });
        return TOPICS.map((t) => ({
            name: t,
            value: parseFloat((totals[t] / cKeys.length * 100).toFixed(1)),
            color: topicColors[t],
        }));
    }, [constituencies]);

    // Alert type breakdown
    const alertBreakdown = useMemo(() => {
        const counts: Record<string, number> = {};
        alerts.forEach((a) => { counts[a.type] = (counts[a.type] || 0) + 1; });
        return Object.entries(counts).map(([type, count]) => ({ type, count }));
    }, [alerts]);

    // Platform breakdown
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const platformCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        TRENDING_POSTS.forEach((p) => { counts[p.platform] = (counts[p.platform] || 0) + 1; });
        return counts;
    }, []);

    // Filtered trending posts
    const filteredPosts = useMemo(() => {
        return TRENDING_POSTS
            .filter((p) => filterTopic === 'all' || p.topic === filterTopic)
            .filter((p) => filterPlatform === 'all' || p.platform === filterPlatform)
            .sort((a, b) => (b.engagement.likes + b.engagement.shares) - (a.engagement.likes + a.engagement.shares));
    }, [filterTopic, filterPlatform]);



    const statCards = [
        { label: 'Avg Sentiment', value: avgSentiment.toFixed(3), color: sentimentColor(avgSentiment), prefix: avgSentiment > 0 ? '+' : '' },
        { label: 'Avg Stability', value: (avgSI * 100).toFixed(1) + '%', color: statusColor(avgSI) },
        { label: 'Crisis Zones', value: crisisCount.toString(), color: crisisCount > 0 ? '#EF5350' : '#4CAF50' },
        { label: 'Active Alerts', value: alerts.length.toString(), color: '#FFB300' },
        { label: 'Signals Tracked', value: TRENDING_POSTS.length.toString(), color: '#1565C0' },
    ];

    return (
        <div style={{ height: '100%', overflow: 'auto', padding: 24 }}>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F0F4FA' }}>Analytics & Trend Intelligence</h1>
                <p style={{ fontSize: 13, color: '#546E7A', marginTop: 4 }}>
                    Aggregated metrics, content signals, and source analysis across all constituencies
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        className="card-glass"
                        style={{ padding: 14, textAlign: 'center' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                    >
                        <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: card.color }}>
                            {card.prefix || ''}{card.value}
                        </div>
                        <div style={{ fontSize: 10, color: '#546E7A', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {card.label}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                {/* Sentiment Bar */}
                <div className="card-glass" style={{ padding: 14 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, color: '#90A4AE', textTransform: 'uppercase', marginBottom: 10 }}>
                        Sentiment by Constituency
                    </h3>
                    <div style={{ height: 180 }}>
                        <ResponsiveContainer>
                            <BarChart data={sentimentBarData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1A2E4A" />
                                <XAxis dataKey="name" stroke="#546E7A" fontSize={9} angle={-15} textAnchor="end" height={40} />
                                <YAxis domain={[-1, 1]} stroke="#546E7A" fontSize={9} fontFamily="'JetBrains Mono'" />
                                <Tooltip contentStyle={{ background: '#0F2040', border: '1px solid #1E3A5F', borderRadius: 8, fontSize: 10 }} />
                                <Bar dataKey="sentiment" radius={[3, 3, 0, 0]}>
                                    {sentimentBarData.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Topic Pie */}
                <div className="card-glass" style={{ padding: 14 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, color: '#90A4AE', textTransform: 'uppercase', marginBottom: 10 }}>
                        Topic Distribution
                    </h3>
                    <div style={{ height: 180 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={topicPieData} cx="50%" cy="50%" outerRadius={70} innerRadius={38} dataKey="value"
                                    isAnimationActive={false}
                                    label={({ name, value }) => `${name} ${value}%`} labelLine={{ stroke: '#546E7A' }}>
                                    {topicPieData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#0F2040', border: '1px solid #1E3A5F', borderRadius: 8, fontSize: 10 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alert Breakdown */}
                <div className="card-glass" style={{ padding: 14 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, color: '#90A4AE', textTransform: 'uppercase', marginBottom: 10 }}>
                        Alert Breakdown
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                        {alertBreakdown.map((item) => (
                            <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 80, fontSize: 10, fontWeight: 600, color: '#F0F4FA' }}>{item.type}</span>
                                <div style={{ flex: 1, height: 16, background: '#0B1829', borderRadius: 8, overflow: 'hidden' }}>
                                    <motion.div
                                        style={{
                                            height: '100%',
                                            background: item.type === 'CRISIS' ? '#EF5350' : item.type === 'DRIFT' ? '#FFB300' : item.type === 'VIRALITY' ? '#AB47BC' : '#FF7043',
                                            borderRadius: 8,
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (item.count / Math.max(alerts.length, 1)) * 100)}%` }}
                                        transition={{ duration: 0.8 }}
                                    />
                                </div>
                                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FA', width: 24, textAlign: 'right' }}>
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ TRENDING CONTENT FEED ═══ */}
            <div className="card-glass" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F0F4FA', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={18} color="#FFB300" />
                            Why Topics Are Trending — Signal Intelligence
                        </h3>
                        <p style={{ fontSize: 11, color: '#546E7A', marginTop: 2 }}>
                            Live content signals from social media, news, and video platforms driving topic salience
                        </p>
                    </div>
                    <span className="badge badge-amber">{filteredPosts.length} signals</span>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    {/* Topic filter */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <Filter size={12} color="#546E7A" />
                        <button
                            onClick={() => setFilterTopic('all')}
                            style={{
                                fontSize: 10, padding: '3px 10px', borderRadius: 9999, cursor: 'pointer',
                                background: filterTopic === 'all' ? '#FFB300' : '#1A2E4A',
                                color: filterTopic === 'all' ? '#0B1829' : '#90A4AE',
                                border: `1px solid ${filterTopic === 'all' ? '#FFB300' : '#1E3A5F'}`,
                                fontWeight: filterTopic === 'all' ? 600 : 400,
                            }}
                        >All Topics</button>
                        {TOPICS.map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilterTopic(t)}
                                style={{
                                    fontSize: 10, padding: '3px 10px', borderRadius: 9999, cursor: 'pointer',
                                    background: filterTopic === t ? `${topicColors[t]}30` : '#1A2E4A',
                                    color: filterTopic === t ? topicColors[t] : '#90A4AE',
                                    border: `1px solid ${filterTopic === t ? topicColors[t] : '#1E3A5F'}`,
                                    fontWeight: filterTopic === t ? 600 : 400,
                                }}
                            >{t}</button>
                        ))}
                    </div>

                    {/* Platform filter */}
                    <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', alignItems: 'center' }}>
                        <button
                            onClick={() => setFilterPlatform('all')}
                            style={{
                                fontSize: 10, padding: '3px 10px', borderRadius: 9999, cursor: 'pointer',
                                background: filterPlatform === 'all' ? '#FFB300' : '#1A2E4A',
                                color: filterPlatform === 'all' ? '#0B1829' : '#90A4AE',
                                border: `1px solid ${filterPlatform === 'all' ? '#FFB300' : '#1E3A5F'}`,
                                fontWeight: filterPlatform === 'all' ? 600 : 400,
                            }}
                        >All Platforms</button>
                        {Object.entries(PLATFORM_STYLES).map(([key, pl]) => (
                            <button
                                key={key}
                                onClick={() => setFilterPlatform(key)}
                                style={{
                                    fontSize: 10, padding: '3px 10px', borderRadius: 9999, cursor: 'pointer',
                                    background: filterPlatform === key ? `${pl.color}20` : '#1A2E4A',
                                    color: filterPlatform === key ? pl.color : '#90A4AE',
                                    border: `1px solid ${filterPlatform === key ? pl.color : '#1E3A5F'}`,
                                    fontWeight: filterPlatform === key ? 600 : 400,
                                }}
                            >{pl.icon} {pl.name}</button>
                        ))}
                    </div>
                </div>

                {/* Post Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <AnimatePresence>
                        {filteredPosts.map((post, i) => {
                            const pl = PLATFORM_STYLES[post.platform];
                            const totalEngagement = post.engagement.likes + post.engagement.shares + post.engagement.comments;
                            return (
                                <motion.div
                                    key={post.id}
                                    className="card"
                                    style={{
                                        padding: '12px 16px',
                                        borderLeft: `4px solid ${pl.color}`,
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto',
                                        gap: 12,
                                    }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    layout
                                >
                                    <div>
                                        {/* Platform bar */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                width: 24, height: 24, borderRadius: 6,
                                                background: `${pl.color}20`, color: pl.color,
                                                fontSize: 14, fontWeight: 700,
                                            }}>{pl.icon}</span>
                                            <span style={{ fontWeight: 600, color: '#F0F4FA', fontSize: 13 }}>{post.author}</span>
                                            {post.verified && <CheckCircle2 size={12} color="#1DA1F2" />}
                                            <span style={{ color: '#546E7A', fontSize: 11 }}>{post.handle}</span>
                                            <span style={{
                                                fontSize: 9, padding: '2px 8px', borderRadius: 9999,
                                                background: `${topicColors[post.topic]}20`,
                                                color: topicColors[post.topic],
                                                border: `1px solid ${topicColors[post.topic]}40`,
                                                fontWeight: 600,
                                            }}>{post.topic}</span>
                                            <span style={{ fontSize: 10, color: '#546E7A', marginLeft: 'auto' }}>{timeAgo(post.timestamp)}</span>
                                        </div>

                                        {/* Content */}
                                        <div style={{ fontSize: 13, color: '#F0F4FA', lineHeight: 1.5, marginBottom: 8 }}>
                                            {post.content}
                                        </div>

                                        {/* Engagement + Sentiment */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#546E7A' }}>
                                                <ThumbsUp size={12} /> <span className="mono">{formatNum(post.engagement.likes)}</span>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#546E7A' }}>
                                                <Share2 size={12} /> <span className="mono">{formatNum(post.engagement.shares)}</span>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#546E7A' }}>
                                                <MessageCircle size={12} /> <span className="mono">{formatNum(post.engagement.comments)}</span>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#546E7A' }}>
                                                <Eye size={12} /> <span className="mono">{formatNum(totalEngagement)}</span> reach
                                            </span>
                                            <span style={{ color: '#546E7A', fontSize: 10 }}>📍 {post.constituency.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>

                                    {/* Right: Sentiment indicator */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 80 }}>
                                        <div className="mono" style={{
                                            fontSize: 20, fontWeight: 700,
                                            color: sentimentColor(post.sentiment),
                                        }}>
                                            {post.sentiment > 0 ? '+' : ''}{post.sentiment.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: 9, color: '#546E7A', marginTop: 2 }}>SENTIMENT</div>
                                        <div style={{
                                            width: 60, height: 4, borderRadius: 2, marginTop: 6,
                                            background: '#0B1829', overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                width: `${Math.abs(post.sentiment) * 100}%`,
                                                height: '100%',
                                                borderRadius: 2,
                                                background: sentimentColor(post.sentiment),
                                            }} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filteredPosts.length === 0 && (
                        <div style={{ padding: 32, textAlign: 'center', color: '#546E7A' }}>
                            No signals match the current filters
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(AnalyticsPage);
