import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatformStore } from '../../store/platformStore';
import { topicColors, sentimentColor } from '../../design-system';
import { TRENDING_POSTS } from '../../data/mockData';
import type { Topic } from '../../types';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    TrendingUp, Shield, Heart, Building2, Landmark, Users,
    ThumbsUp, Share2, MessageCircle, CheckCircle2, ChevronDown, ChevronUp,
    ExternalLink,
} from 'lucide-react';
/* eslint-enable @typescript-eslint/no-unused-vars */

const TOPICS: Topic[] = ['Economy', 'Security', 'Healthcare', 'Infrastructure', 'Governance', 'Identity'];

const TOPIC_ICONS: Record<Topic, React.ReactNode> = {
    Economy: <TrendingUp size={14} />,
    Security: <Shield size={14} />,
    Healthcare: <Heart size={14} />,
    Infrastructure: <Building2 size={14} />,
    Governance: <Landmark size={14} />,
    Identity: <Users size={14} />,
};

const PLATFORM_ICONS: Record<string, { icon: string; color: string }> = {
    twitter: { icon: '𝕏', color: '#1DA1F2' },
    youtube: { icon: '▶', color: '#FF0000' },
    reddit: { icon: '⬡', color: '#FF4500' },
    facebook: { icon: 'f', color: '#1877F2' },
    telegram: { icon: '✈', color: '#0088CC' },
    news: { icon: '📰', color: '#FFB300' },
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

const TopicPanel: React.FC = () => {
    const constituencies = usePlatformStore((s) => s.constituencies);
    const [expandedTopic, setExpandedTopic] = useState<Topic | null>(null);

    // Average salience across all constituencies
    const avgSalience = useMemo(() => {
        const keys = Object.keys(constituencies);
        const result: Record<string, number> = {};
        TOPICS.forEach((t) => {
            const vals = keys.map((k) => constituencies[k]?.topic_salience?.[t] || 0);
            result[t] = vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1);
        });
        return result;
    }, [constituencies]);

    const dominantTopic = useMemo(() => {
        let max = 0; let topic = 'Economy';
        Object.entries(avgSalience).forEach(([t, v]) => { if (v > max) { max = v; topic = t; } });
        return topic;
    }, [avgSalience]);

    // Group posts by topic
    const postsByTopic = useMemo(() => {
        const grouped: Record<string, typeof TRENDING_POSTS> = {};
        TOPICS.forEach((t) => { grouped[t] = TRENDING_POSTS.filter((p) => p.topic === t); });
        return grouped;
    }, []);

    return (
        <div className="card-glass" style={{ padding: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', color: '#90A4AE', textTransform: 'uppercase' }}>
                    Trending Topics — Live Ω(t)
                </h2>
                <span className="badge badge-amber" style={{ fontSize: 9 }}>
                    🔥 {dominantTopic.toUpperCase()}
                </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {TOPICS.map((topic, i) => {
                    const val = avgSalience[topic] || 0;
                    const pct = val * 100;
                    const isExpanded = expandedTopic === topic;
                    const posts = postsByTopic[topic] || [];
                    const topPost = posts[0];

                    return (
                        <motion.div
                            key={topic}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            {/* Topic bar row */}
                            <div
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    cursor: 'pointer', padding: '4px 0',
                                }}
                                onClick={() => setExpandedTopic(isExpanded ? null : topic)}
                            >
                                <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                    <span style={{ color: topicColors[topic] }}>{TOPIC_ICONS[topic]}</span>
                                    <span style={{ fontSize: 10, fontWeight: 500, color: '#F0F4FA' }}>{topic}</span>
                                </div>
                                <div style={{ flex: 1, height: 16, background: '#0B1829', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                                    <motion.div
                                        style={{ height: '100%', background: `linear-gradient(90deg, ${topicColors[topic]}88, ${topicColors[topic]})`, borderRadius: 8 }}
                                        animate={{ width: `${Math.max(3, pct)}%` }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                                    />
                                    {/* Mini post preview inside bar */}
                                    {topPost && (
                                        <div style={{
                                            position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                                            fontSize: 8, color: '#90A4AE', whiteSpace: 'nowrap', overflow: 'hidden',
                                            maxWidth: '60%', textOverflow: 'ellipsis',
                                        }}>
                                            {PLATFORM_ICONS[topPost.platform]?.icon} {topPost.content.substring(0, 40)}...
                                        </div>
                                    )}
                                </div>
                                <span className="mono" style={{ width: 40, textAlign: 'right', fontSize: 11, fontWeight: 600, color: topicColors[topic] }}>
                                    {pct.toFixed(1)}%
                                </span>
                                {isExpanded ? <ChevronUp size={12} color="#546E7A" /> : <ChevronDown size={12} color="#546E7A" />}
                            </div>

                            {/* Expanded: trending posts */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        style={{ overflow: 'hidden', paddingLeft: 8 }}
                                    >
                                        <div style={{ padding: '6px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <div style={{ fontSize: 9, color: '#546E7A', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 2 }}>
                                                Why {topic} is trending — {posts.length} signals detected
                                            </div>
                                            {posts.map((post) => {
                                                const pl = PLATFORM_ICONS[post.platform];
                                                return (
                                                    <motion.div
                                                        key={post.id}
                                                        className="card"
                                                        style={{
                                                            padding: '8px 10px',
                                                            borderLeft: `3px solid ${pl.color}`,
                                                            fontSize: 10,
                                                        }}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                    >
                                                        {/* Platform + Author */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                            <span style={{ fontSize: 12, width: 16, textAlign: 'center' }}>{pl.icon}</span>
                                                            <span style={{ fontWeight: 600, color: '#F0F4FA' }}>{post.author}</span>
                                                            {post.verified && <CheckCircle2 size={10} color="#1DA1F2" />}
                                                            <span style={{ color: '#546E7A' }}>{post.handle}</span>
                                                            <span style={{ marginLeft: 'auto', color: '#546E7A', fontSize: 9 }}>{timeAgo(post.timestamp)}</span>
                                                        </div>

                                                        {/* Content */}
                                                        <div style={{ color: '#F0F4FA', lineHeight: 1.4, marginBottom: 6, fontSize: 11 }}>
                                                            {post.content}
                                                        </div>

                                                        {/* Engagement + Sentiment */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#546E7A' }}>
                                                                <ThumbsUp size={9} /> {formatNum(post.engagement.likes)}
                                                            </span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#546E7A' }}>
                                                                <Share2 size={9} /> {formatNum(post.engagement.shares)}
                                                            </span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#546E7A' }}>
                                                                <MessageCircle size={9} /> {formatNum(post.engagement.comments)}
                                                            </span>
                                                            <span style={{ marginLeft: 'auto' }}>
                                                                <span className="mono" style={{
                                                                    fontSize: 10, fontWeight: 600,
                                                                    color: sentimentColor(post.sentiment),
                                                                    padding: '1px 6px',
                                                                    background: `${sentimentColor(post.sentiment)}15`,
                                                                    borderRadius: 4,
                                                                }}>
                                                                    s={post.sentiment > 0 ? '+' : ''}{post.sentiment.toFixed(2)}
                                                                </span>
                                                            </span>
                                                            <span style={{ color: '#546E7A', fontSize: 9 }}>{post.constituency.replace('_', ' ')}</span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(TopicPanel);
