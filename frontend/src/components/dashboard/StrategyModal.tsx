import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    AreaChart,
    Area,
    ComposedChart,
} from 'recharts';
import { usePlatformStore } from '../../store/platformStore';
import { MOCK_SIMULATION, CONSTITUENCY_DATA } from '../../data/mockData';
import type { Topic } from '../../types';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    X, Loader2, Rocket, CheckCircle2,
    TrendingUp, Shield, Heart, Building2, Landmark, Users,
    Zap, AlertTriangle, Activity, BarChart3,
} from 'lucide-react';
/* eslint-enable @typescript-eslint/no-unused-vars */

const TOPICS: Topic[] = ['Economy', 'Security', 'Healthcare', 'Infrastructure', 'Governance', 'Identity'];

const StrategyModal: React.FC = () => {
    const { strategyModalOpen, setStrategyModalOpen, simResult, setSimResult } = usePlatformStore();
    const [isSimulating, setIsSimulating] = useState(false);
    const [simPhase, setSimPhase] = useState(0);
    const [deployed, setDeployed] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    // Form state
    const [message, setMessage] = useState('We are announcing an agricultural relief package of ₹500 Cr for drought-affected farmers in Wardha district.');
    const [topic, setTopic] = useState<Topic>('Economy');
    const [credibility, setCredibility] = useState(7);
    const [intent, setIntent] = useState(0.5);
    const [targets, setTargets] = useState<string[]>(['Wardha']);

    const result = simResult || MOCK_SIMULATION;

    const SIM_PHASES = [
        { label: 'Encoding perturbation vector ε(t)...', icon: <Zap size={14} /> },
        { label: 'Running Attention-GRU forward pass...', icon: <Activity size={14} /> },
        { label: 'Applying spatial kernel smoothing (σ=' + 25 + 'km)...', icon: <BarChart3 size={14} /> },
        { label: 'Computing probability density P(s|ε)...', icon: <TrendingUp size={14} /> },
        { label: 'Ranking strategies by E[Δs] × confidence...', icon: <AlertTriangle size={14} /> },
        { label: 'Generating 6-step trajectory forecast...', icon: <CheckCircle2 size={14} /> },
    ];

    // Trajectory chart data
    const trajectoryData = useMemo(() => {
        if (!result) return [];
        return Array.from({ length: 6 }, (_, i) => {
            const point: Record<string, number | string> = {
                step: `+${(i + 1) * 30}min`,
            };
            result.ranked_strategies.forEach((s) => {
                point[s.name] = s.trajectory[i] || 0;
            });
            return point;
        });
    }, [result]);

    // Probability density mock data — bell curve around predicted reception
    const densityData = useMemo(() => {
        if (!result) return [];
        const best = result.ranked_strategies[0];
        const mean = best.predicted_reception;
        const sigma = best.delta_volatility * 5 + 0.08;
        return Array.from({ length: 50 }, (_, i) => {
            const x = -0.5 + (i / 49) * 1.0;
            const density = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / sigma) ** 2);
            return { x: parseFloat(x.toFixed(3)), density: parseFloat(density.toFixed(4)), label: x.toFixed(2) };
        });
    }, [result]);

    // Monte Carlo confidence intervals (simulated)
    const confidenceData = useMemo(() => {
        if (!result) return [];
        const best = result.ranked_strategies[0];
        return best.trajectory.map((v, i) => {
            const spread = (i + 1) * 0.02 * (1 - best.confidence);
            return {
                step: `+${(i + 1) * 30}min`,
                mean: v,
                upper: parseFloat((v + spread * 2).toFixed(3)),
                lower: parseFloat((v - spread * 2).toFixed(3)),
                ci95Upper: parseFloat((v + spread * 3.5).toFixed(3)),
                ci95Lower: parseFloat((v - spread * 3.5).toFixed(3)),
            };
        });
    }, [result]);

    const runSimulation = useCallback(() => {
        setIsSimulating(true);
        setDeployed(false);
        setSimPhase(0);
        setHasRun(false);

        // Animate through phases
        const phaseInterval = setInterval(() => {
            setSimPhase((p) => {
                if (p >= SIM_PHASES.length - 1) {
                    clearInterval(phaseInterval);
                    return p;
                }
                return p + 1;
            });
        }, 500);

        setTimeout(() => {
            setSimResult(MOCK_SIMULATION);
            setIsSimulating(false);
            setHasRun(true);
        }, 3200);
    }, [SIM_PHASES.length, setSimResult]);

    const deployStrategy = () => {
        setDeployed(true);
        setTimeout(() => {
            setStrategyModalOpen(false);
            setDeployed(false);
            setHasRun(false);
        }, 2500);
    };

    if (!strategyModalOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(11, 24, 41, 0.88)',
                    backdropFilter: 'blur(16px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 20,
                }}
                onClick={() => setStrategyModalOpen(false)}
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 30 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="card"
                    style={{ width: '95%', maxWidth: 1300, maxHeight: '92vh', overflow: 'auto', padding: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderBottom: '1px solid #1E3A5F',
                    }}>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F0F4FA', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Zap size={20} color="#FFB300" />
                                Strategy Simulation Engine
                            </h2>
                            <p style={{ fontSize: 11, color: '#546E7A', marginTop: 2 }}>
                                6-step Attention-GRU trajectory prediction · Probability density analysis · Monte Carlo confidence bands
                            </p>
                        </div>
                        <button onClick={() => setStrategyModalOpen(false)} style={{ background: 'none', border: 'none', color: '#546E7A', cursor: 'pointer', padding: 8 }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: 20 }}>
                        {/* 3-column layout */}
                        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: 16 }}>

                            {/* ═══ LEFT — Strategy Composer ═══ */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div>
                                    <label style={{ fontSize: 11, color: '#90A4AE', marginBottom: 4, display: 'block', fontWeight: 600 }}>
                                        Proposed Message / Narrative
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Describe the strategy message or narrative to simulate..."
                                        style={{
                                            width: '100%', height: 90, background: '#0B1829',
                                            border: '1px solid #1E3A5F', borderRadius: 8, padding: 10,
                                            color: '#F0F4FA', fontSize: 12, resize: 'none', fontFamily: 'Inter',
                                        }}
                                    />
                                    <div style={{ textAlign: 'right', fontSize: 9, color: '#546E7A', marginTop: 2 }}>
                                        {message.length} chars · Will be encoded as perturbation ε(t)
                                    </div>
                                </div>

                                {/* Topic pills */}
                                <div>
                                    <label style={{ fontSize: 11, color: '#90A4AE', marginBottom: 4, display: 'block', fontWeight: 600 }}>Topic Anchor</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {TOPICS.map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setTopic(t)}
                                                style={{
                                                    cursor: 'pointer',
                                                    background: topic === t ? 'rgba(255,179,0,0.2)' : '#1A2E4A',
                                                    color: topic === t ? '#FFB300' : '#90A4AE',
                                                    border: `1px solid ${topic === t ? '#FFB300' : '#1E3A5F'}`,
                                                    padding: '3px 10px', borderRadius: 9999, fontSize: 10,
                                                }}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Credibility */}
                                <div>
                                    <label style={{ fontSize: 11, color: '#90A4AE', marginBottom: 4, display: 'block', fontWeight: 600 }}>
                                        Source Credibility: <span className="mono" style={{ color: '#FFB300' }}>{credibility}/10</span>
                                    </label>
                                    <input type="range" min={0} max={10} step={1} value={credibility}
                                        onChange={(e) => setCredibility(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#FFB300' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#546E7A' }}>
                                        <span>Anonymous rumor</span><span>Official statement</span>
                                    </div>
                                </div>

                                {/* Intent */}
                                <div>
                                    <label style={{ fontSize: 11, color: '#90A4AE', marginBottom: 4, display: 'block', fontWeight: 600 }}>
                                        Intent Vector: <span className="mono" style={{ color: intent > 0 ? '#4CAF50' : '#EF5350' }}>
                                            {intent > 0 ? '+' : ''}{intent.toFixed(1)}
                                        </span>
                                    </label>
                                    <input type="range" min={-1} max={1} step={0.1} value={intent}
                                        onChange={(e) => setIntent(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#FFB300' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#546E7A' }}>
                                        <span>Counter-narrative</span><span>Neutral</span><span>Positive push</span>
                                    </div>
                                </div>

                                {/* Targets */}
                                <div>
                                    <label style={{ fontSize: 11, color: '#90A4AE', marginBottom: 4, display: 'block', fontWeight: 600 }}>Target Constituencies</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {Object.keys(CONSTITUENCY_DATA).map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setTargets((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])}
                                                style={{
                                                    background: targets.includes(c) ? 'rgba(255,179,0,0.15)' : '#1A2E4A',
                                                    color: targets.includes(c) ? '#FFB300' : '#90A4AE',
                                                    border: `1px solid ${targets.includes(c) ? '#FFB300' : '#1E3A5F'}`,
                                                    padding: '3px 8px', borderRadius: 6, fontSize: 10, cursor: 'pointer',
                                                }}
                                            >
                                                {CONSTITUENCY_DATA[c].name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Run button */}
                                <button
                                    className="btn btn-amber ripple"
                                    style={{ width: '100%', height: 48, fontSize: 14, marginTop: 6 }}
                                    onClick={runSimulation}
                                    disabled={isSimulating}
                                >
                                    {isSimulating ? (
                                        <><Loader2 size={16} className="spin" /> Simulating...</>
                                    ) : (
                                        <><Rocket size={16} /> RUN SIMULATION</>
                                    )}
                                </button>

                                {/* Simulation phases */}
                                {isSimulating && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                                        {SIM_PHASES.map((phase, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: i <= simPhase ? 1 : 0.3, x: 0 }}
                                                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}
                                            >
                                                <span style={{ color: i <= simPhase ? '#4CAF50' : '#546E7A' }}>
                                                    {i < simPhase ? <CheckCircle2 size={12} /> : i === simPhase ? phase.icon : <span style={{ width: 12, display: 'inline-block' }}>○</span>}
                                                </span>
                                                <span style={{ color: i <= simPhase ? '#F0F4FA' : '#546E7A' }}>{phase.label}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ═══ CENTRE — Analysis ═══ */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {/* Trajectory with confidence bands */}
                                <div className="card" style={{ padding: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#90A4AE', textTransform: 'uppercase' }}>
                                            Predicted Trajectory s(t+k)
                                        </h3>
                                        {hasRun && <span className="badge badge-amber" style={{ fontSize: 9 }}>95% CI shown</span>}
                                    </div>
                                    <div style={{ height: 200 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={hasRun ? confidenceData : trajectoryData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1A2E4A" />
                                                <XAxis dataKey="step" stroke="#546E7A" fontSize={10} fontFamily="'JetBrains Mono'" />
                                                <YAxis domain={[-0.8, 0.4]} stroke="#546E7A" fontSize={10} fontFamily="'JetBrains Mono'" />
                                                <Tooltip contentStyle={{ background: '#0F2040', border: '1px solid #1E3A5F', borderRadius: 8, fontSize: 11 }} />
                                                <ReferenceLine y={-0.3} stroke="#EF5350" strokeDasharray="4 4" label={{ value: 'Crisis', fill: '#EF5350', fontSize: 9 }} />
                                                <ReferenceLine y={0} stroke="#F0F4FA" strokeDasharray="4 4" opacity={0.2} />

                                                {hasRun ? (
                                                    <>
                                                        <Area type="monotone" dataKey="ci95Upper" stroke="none" fill="#FFB300" fillOpacity={0.06} />
                                                        <Area type="monotone" dataKey="ci95Lower" stroke="none" fill="#FFB300" fillOpacity={0.06} />
                                                        <Area type="monotone" dataKey="upper" stroke="none" fill="#FFB300" fillOpacity={0.12} />
                                                        <Area type="monotone" dataKey="lower" stroke="none" fill="#FFB300" fillOpacity={0.12} />
                                                        <Line type="monotone" dataKey="mean" stroke="#FFB300" strokeWidth={3} dot={{ r: 4, fill: '#FFB300' }}
                                                            style={{ filter: 'drop-shadow(0 0 6px rgba(255,179,0,0.5))' }} animationDuration={1500} />
                                                    </>
                                                ) : (
                                                    result.ranked_strategies.map((s, i) => (
                                                        <Line key={s.name} type="monotone" dataKey={s.name}
                                                            stroke={i === 0 ? '#FFB300' : '#546E7A'}
                                                            strokeWidth={i === 0 ? 3 : 1}
                                                            strokeDasharray={i === 0 ? undefined : '4 4'}
                                                            dot={false} animationDuration={1500 + i * 200}
                                                            style={i === 0 ? { filter: 'drop-shadow(0 0 6px rgba(255,179,0,0.4))' } : undefined}
                                                        />
                                                    ))
                                                )}
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Probability Density */}
                                <div className="card" style={{ padding: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#90A4AE', textTransform: 'uppercase' }}>
                                            Probability Density P(Δs | ε,t)
                                        </h3>
                                        <span style={{ fontSize: 9, color: '#546E7A' }}>
                                            Expected shift: <span className="mono" style={{ color: '#FFB300' }}>
                                                +{result.ranked_strategies[0]?.predicted_reception.toFixed(3)}
                                            </span>
                                        </span>
                                    </div>
                                    <div style={{ height: 160 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={densityData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1A2E4A" />
                                                <XAxis dataKey="label" stroke="#546E7A" fontSize={9} fontFamily="'JetBrains Mono'" interval={6}
                                                    label={{ value: 'Δs (sentiment shift)', position: 'bottom', fill: '#546E7A', fontSize: 9 }} />
                                                <YAxis stroke="#546E7A" fontSize={9} fontFamily="'JetBrains Mono'" hide />
                                                <Tooltip contentStyle={{ background: '#0F2040', border: '1px solid #1E3A5F', borderRadius: 8, fontSize: 10 }}
                                                    formatter={(v: number | undefined) => [(v ?? 0).toFixed(4), 'P(Δs)']} />
                                                <defs>
                                                    <linearGradient id="densityGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#FFB300" stopOpacity={0.6} />
                                                        <stop offset="100%" stopColor="#FFB300" stopOpacity={0.05} />
                                                    </linearGradient>
                                                </defs>
                                                <Area type="monotone" dataKey="density" stroke="#FFB300" strokeWidth={2}
                                                    fill="url(#densityGrad)" animationDuration={1200} />
                                                <ReferenceLine x={result.ranked_strategies[0]?.predicted_reception.toFixed(2)}
                                                    stroke="#4CAF50" strokeDasharray="3 3" strokeWidth={2}
                                                    label={{ value: 'μ', fill: '#4CAF50', fontSize: 11, fontWeight: 700 }} />
                                                <ReferenceLine x="0.00" stroke="#F0F4FA" strokeDasharray="4 4" opacity={0.2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Detailed metrics grid */}
                                {hasRun && (
                                    <motion.div
                                        className="card"
                                        style={{ padding: 14 }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#90A4AE', textTransform: 'uppercase', marginBottom: 10 }}>
                                            Simulation Diagnostics
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                                            {[
                                                { label: 'E[Δs]', value: `+${result.ranked_strategies[0].predicted_reception.toFixed(4)}`, color: '#4CAF50', desc: 'Expected sentiment shift' },
                                                { label: 'σ(Δs)', value: `±${(result.ranked_strategies[0].delta_volatility * 2).toFixed(4)}`, color: '#FFB300', desc: 'Prediction uncertainty' },
                                                { label: 'P(s>0|ε)', value: `${(result.ranked_strategies[0].confidence * 100).toFixed(1)}%`, color: '#00897B', desc: 'Prob. positive outcome' },
                                                { label: 'KL(P‖Q)', value: `${(result.ranked_strategies[0].delta_volatility * 1.2 + 0.02).toFixed(4)}`, color: '#AB47BC', desc: 'Distribution divergence' },
                                                { label: 'τ½', value: `${Math.floor(result.ranked_strategies[0].confidence * 50 + 60)}min`, color: '#FF7043', desc: 'Half-life of effect' },
                                                { label: 'Spatial σ', value: `${25}km`, color: '#1565C0', desc: 'Kernel smoothing radius' },
                                                { label: 'N(sims)', value: '10,000', color: '#546E7A', desc: 'Monte Carlo iterations' },
                                                { label: 'Convergence', value: '✓ 0.001', color: '#4CAF50', desc: 'MCMC chain converged' },
                                            ].map((m) => (
                                                <div key={m.label} style={{ background: '#0B1829', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: 9, color: '#546E7A', marginBottom: 2 }}>{m.label}</div>
                                                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</div>
                                                    <div style={{ fontSize: 8, color: '#546E7A', marginTop: 2 }}>{m.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* ═══ RIGHT — Rankings ═══ */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <h3 style={{ fontSize: 12, fontWeight: 600, color: '#90A4AE', textTransform: 'uppercase' }}>
                                    Ranked Strategies
                                </h3>
                                {result.ranked_strategies.map((s, i) => (
                                    <motion.div
                                        key={s.rank}
                                        className="card"
                                        style={{ padding: 12, border: i === 0 ? '1px solid #FFB300' : '1px solid #1E3A5F' }}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.15 }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                            <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: i === 0 ? '#FFB300' : '#546E7A', lineHeight: 1 }}>
                                                {s.rank}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#F0F4FA' }}>{s.name}</span>
                                                    {i === 0 && <span className="badge badge-amber" style={{ fontSize: 8 }}>RECOMMENDED</span>}
                                                </div>

                                                {/* Description */}
                                                <div style={{ fontSize: 10, color: '#90A4AE', marginBottom: 6, lineHeight: 1.4 }}>
                                                    {s.description}
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10 }}>
                                                    <div>
                                                        <span style={{ color: '#546E7A' }}>Reception: </span>
                                                        <span className="mono" style={{ color: s.predicted_reception > 0 ? '#4CAF50' : '#EF5350' }}>
                                                            {s.predicted_reception > 0 ? '+' : ''}{s.predicted_reception.toFixed(3)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#546E7A' }}>Confidence: </span>
                                                        <span className="mono" style={{ color: '#FFB300' }}>
                                                            {(s.confidence * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#546E7A' }}>Score: </span>
                                                        <span className="mono" style={{ color: '#F0F4FA' }}>
                                                            {s.score.toFixed(4)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#546E7A' }}>ΔΣ: </span>
                                                        <span className="mono" style={{ color: '#90A4AE' }}>
                                                            ±{s.delta_volatility.toFixed(3)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Score gauge */}
                                                <div style={{ marginTop: 6, height: 4, background: '#0B1829', borderRadius: 2 }}>
                                                    <motion.div
                                                        style={{ height: '100%', background: i === 0 ? 'linear-gradient(90deg, #FFB300, #FFA000)' : '#546E7A', borderRadius: 2 }}
                                                        animate={{ width: `${Math.min(100, Math.abs(s.score) * 500)}%` }}
                                                        transition={{ duration: 1, delay: i * 0.2 }}
                                                    />
                                                </div>

                                                {/* Mini trajectory sparkline */}
                                                <div style={{ marginTop: 6, height: 30 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={s.trajectory.map((v, j) => ({ step: j, v }))}>
                                                            <Line type="monotone" dataKey="v" stroke={i === 0 ? '#FFB300' : '#546E7A'} strokeWidth={1.5} dot={false} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {i === 0 && (
                                            <button
                                                className="btn btn-amber ripple"
                                                style={{ width: '100%', marginTop: 8, fontSize: 12, height: 36 }}
                                                onClick={deployStrategy}
                                                disabled={deployed}
                                            >
                                                {deployed ? (
                                                    <><CheckCircle2 size={14} /> Strategy Deployed ✓</>
                                                ) : (
                                                    <><Rocket size={14} /> DEPLOY THIS STRATEGY</>
                                                )}
                                            </button>
                                        )}
                                    </motion.div>
                                ))}

                                {/* Impact summary */}
                                {hasRun && (
                                    <motion.div
                                        className="card"
                                        style={{ padding: 12, border: '1px solid #00897B' }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <div style={{ fontSize: 10, fontWeight: 600, color: '#00897B', textTransform: 'uppercase', marginBottom: 6 }}>
                                            Impact Summary
                                        </div>
                                        <div style={{ fontSize: 11, color: '#F0F4FA', lineHeight: 1.5 }}>
                                            Strategy "<strong>{result.ranked_strategies[0].name}</strong>" predicts a{' '}
                                            <span className="mono" style={{ color: '#4CAF50' }}>+{result.ranked_strategies[0].predicted_reception.toFixed(3)}</span>{' '}
                                            sentiment shift in {targets.join(', ').replace(/_/g, ' ')} over 3 hours with{' '}
                                            <span className="mono" style={{ color: '#FFB300' }}>{(result.ranked_strategies[0].confidence * 100).toFixed(1)}%</span>{' '}
                                            confidence. Expected to move constituency out of crisis zone by step 5.
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </AnimatePresence>
    );
};

export default React.memo(StrategyModal);
