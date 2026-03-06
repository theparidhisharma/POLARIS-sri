import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatformStore } from '../../store/platformStore';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sentimentColor, statusColor, topicColors } from '../../design-system';
import type { Topic } from '../../types';
import { X, Crosshair } from 'lucide-react';
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';

const TOPICS: Topic[] = ['Economy', 'Security', 'Healthcare', 'Infrastructure', 'Governance', 'Identity'];

const ConstituencyDetail: React.FC = () => {
    const selectedKey = usePlatformStore((s) => s.selectedConstituency);
    const constituency = usePlatformStore((s) => selectedKey ? s.constituencies[selectedKey] : null);
    const history = usePlatformStore((s) => selectedKey ? s.history[selectedKey] : null);
    const setSelected = usePlatformStore((s) => s.setSelectedConstituency);
    const setStrategyModalOpen = usePlatformStore((s) => s.setStrategyModalOpen);

    const radarData = useMemo(() => {
        if (!constituency) return [];
        return TOPICS.map((t) => ({
            topic: t,
            value: (constituency.topic_salience[t] || 0) * 100,
        }));
    }, [constituency]);

    const sparklineData = useMemo(() => {
        if (!history) return [];
        return history.map((v, i) => ({ step: i, value: v }));
    }, [history]);

    if (!selectedKey || !constituency) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 360, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 360, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                    position: 'fixed',
                    right: 0,
                    top: 0,
                    width: 360,
                    height: '100vh',
                    background: '#0F2040',
                    borderLeft: '1px solid #1E3A5F',
                    boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
                    zIndex: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    padding: 20,
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F0F4FA' }}>{constituency.name}</h2>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <span className="badge badge-amber">Tier {constituency.tier}</span>
                            <span className="badge" style={{
                                background: `${sentimentColor(constituency.s)}20`,
                                color: sentimentColor(constituency.s),
                                border: `1px solid ${sentimentColor(constituency.s)}40`,
                            }}>
                                {constituency.s > 0 ? 'POSITIVE' : constituency.s < -0.3 ? 'CRISIS' : constituency.s < -0.1 ? 'NEGATIVE' : 'NEUTRAL'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelected(null)}
                        style={{ background: 'none', border: 'none', color: '#546E7A', cursor: 'pointer', padding: 4 }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* State vector */}
                <div className="card" style={{ padding: 14, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 11, fontWeight: 600, color: '#546E7A', textTransform: 'uppercase', marginBottom: 8 }}>
                        State Vector
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[
                            { label: 's(t)', value: constituency.s, decimals: 3 },
                            { label: 'ṡ(t)', value: constituency.velocity, decimals: 4 },
                            { label: 's̈(t)', value: constituency.acceleration, decimals: 4 },
                            { label: 'Σ(t)', value: constituency.volatility, decimals: 4 },
                            { label: 'σ²(t)', value: constituency.uncertainty, decimals: 4 },
                            { label: 'SI', value: constituency.stability_index, decimals: 3 },
                        ].map((item) => (
                            <div key={item.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 9, color: '#546E7A', marginBottom: 2 }}>{item.label}</div>
                                <div className="mono" style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: item.label === 'SI'
                                        ? statusColor(item.value)
                                        : item.label === 's(t)'
                                            ? sentimentColor(item.value)
                                            : '#F0F4FA',
                                }}>
                                    {item.value > 0 && item.label !== 'Σ(t)' && item.label !== 'σ²(t)' && item.label !== 'SI' ? '+' : ''}
                                    {item.value.toFixed(item.decimals)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sparkline */}
                <div className="card" style={{ padding: 14, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 11, fontWeight: 600, color: '#546E7A', textTransform: 'uppercase', marginBottom: 8 }}>
                        24-Step History
                    </h3>
                    <div style={{ height: 120 }}>
                        <ResponsiveContainer>
                            <LineChart data={sparklineData}>
                                <XAxis dataKey="step" hide />
                                <YAxis domain={[-1, 1]} hide />
                                <Tooltip
                                    contentStyle={{ background: '#0F2040', border: '1px solid #1E3A5F', borderRadius: 6, fontSize: 10 }}
                                    formatter={(v: number | undefined) => [(v ?? 0).toFixed(3), 'Sentiment']}
                                />
                                <Line type="monotone" dataKey="value" stroke="#FFB300" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar chart */}
                <div className="card" style={{ padding: 14, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 11, fontWeight: 600, color: '#546E7A', textTransform: 'uppercase', marginBottom: 8 }}>
                        Topic Salience
                    </h3>
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#1E3A5F" />
                                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: '#90A4AE' }} />
                                <PolarRadiusAxis tick={false} axisLine={false} />
                                <Radar
                                    dataKey="value"
                                    stroke="#00897B"
                                    fill="#00897B"
                                    fillOpacity={0.35}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Simulate button */}
                <button
                    className="btn btn-amber ripple"
                    style={{ width: '100%', height: 44, fontSize: 13 }}
                    onClick={() => setStrategyModalOpen(true)}
                >
                    <Crosshair size={16} />
                    SIMULATE STRATEGY
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export default React.memo(ConstituencyDetail);
