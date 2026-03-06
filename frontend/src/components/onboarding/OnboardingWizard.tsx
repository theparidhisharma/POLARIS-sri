import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlatformStore } from '../../store/platformStore';
import type { OnboardingConfig, Topic } from '../../types';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ChevronRight,
    ChevronLeft,
    Upload,
    X,
    Plus,
    Loader2,
    Rocket,
    CheckCircle2,
    TrendingUp,
    Shield,
    Heart,
    Building2,
    Landmark,
    Users,
} from 'lucide-react';
/* eslint-enable @typescript-eslint/no-unused-vars */

const LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi', 'Odia', 'Urdu', 'English'];
const TOPICS: Topic[] = ['Economy', 'Security', 'Healthcare', 'Infrastructure', 'Governance', 'Identity'];
const TOPIC_ICONS: Record<Topic, React.ReactNode> = {
    Economy: <TrendingUp size={20} />,
    Security: <Shield size={20} />,
    Healthcare: <Heart size={20} />,
    Infrastructure: <Building2 size={20} />,
    Governance: <Landmark size={20} />,
    Identity: <Users size={20} />,
};

// ─── Three.js Particles ────────────────────────────────────────
// Pre-generated particle positions (module-level to avoid purity issues)
const PARTICLE_POSITIONS = (() => {
    const arr = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 3 + Math.random() * 1.5;
        arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
})();

function ParticleField() {
    const pointsRef = useRef<THREE.Points>(null);
    const positions = PARTICLE_POSITIONS;

    useFrame(() => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.001;
            pointsRef.current.rotation.x += 0.0003;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={500}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.03} color="#F0F4FA" transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

// ─── Step Components ─────────────────────────────────────────

const StepPartyIdentity: React.FC<{ config: OnboardingConfig; setConfig: (c: OnboardingConfig) => void }> = ({ config, setConfig }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
            <div>
                <label style={{ fontSize: 12, color: '#90A4AE', marginBottom: 6, display: 'block' }}>Party Name</label>
                <input
                    type="text"
                    value={config.partyName}
                    onChange={(e) => setConfig({ ...config, partyName: e.target.value })}
                    placeholder="Enter party name..."
                    style={{
                        width: '100%', padding: '10px 14px', background: '#0B1829',
                        border: '1px solid #1E3A5F', borderRadius: 8, color: '#F0F4FA',
                        fontSize: 14, fontFamily: 'Inter',
                    }}
                />
            </div>

            <div>
                <label style={{ fontSize: 12, color: '#90A4AE', marginBottom: 6, display: 'block' }}>Party Logo</label>
                <div
                    style={{
                        width: '100%', height: 100, background: '#0B1829',
                        border: '2px dashed #1E3A5F', borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#546E7A', cursor: 'pointer', flexDirection: 'column', gap: 4,
                    }}
                >
                    <Upload size={20} />
                    <span style={{ fontSize: 11 }}>Drag & drop or click to upload</span>
                </div>
            </div>

            <div>
                <label style={{ fontSize: 12, color: '#90A4AE', marginBottom: 6, display: 'block' }}>
                    Ideology Spectrum
                </label>
                <div style={{ position: 'relative' }}>
                    <input
                        type="range" min={-1} max={1} step={0.01}
                        value={config.ideology}
                        onChange={(e) => setConfig({ ...config, ideology: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: '#FFB300' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#546E7A', marginTop: 4 }}>
                        <span>← Left</span>
                        <span>Centre</span>
                        <span>Right →</span>
                    </div>
                </div>
            </div>

            <div>
                <label style={{ fontSize: 12, color: '#90A4AE', marginBottom: 6, display: 'block' }}>Primary Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }}
                    />
                    <span className="mono" style={{ fontSize: 12, color: '#90A4AE' }}>{config.primaryColor}</span>
                </div>
            </div>
        </div>

        {/* 3D Particle field */}
        <div style={{ borderRadius: 12, overflow: 'hidden', minHeight: 300 }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }} style={{ background: '#060E1A' }}>
                <ambientLight intensity={0.3} />
                <ParticleField />
            </Canvas>
        </div>
    </div>
);

const StepLanguageRegion: React.FC<{ config: OnboardingConfig; setConfig: (c: OnboardingConfig) => void }> = ({ config, setConfig }) => {
    const toggleLang = (lang: string) => {
        setConfig({
            ...config,
            languages: config.languages.includes(lang)
                ? config.languages.filter((l) => l !== lang)
                : [...config.languages, lang],
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <label style={{ fontSize: 12, color: '#90A4AE', marginBottom: 8, display: 'block' }}>Select Languages</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {LANGUAGES.map((l) => {
                        const selected = config.languages.includes(l);
                        return (
                            <button
                                key={l}
                                onClick={() => toggleLang(l)}
                                style={{
                                    padding: '6px 14px', borderRadius: 9999,
                                    background: selected ? '#FFB300' : '#0F2040',
                                    color: selected ? '#0B1829' : '#90A4AE',
                                    border: `1px solid ${selected ? '#FFB300' : '#1E3A5F'}`,
                                    fontSize: 12, fontWeight: selected ? 600 : 400,
                                    cursor: 'pointer', transition: 'all 150ms ease',
                                }}
                            >
                                {l}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <span className="badge badge-amber" style={{ fontSize: 12 }}>
                    {config.languages.length} languages · {config.states.length} states selected
                </span>
            </div>

            {/* Simplified India map */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="280" height="320" viewBox="0 0 280 320">
                    <path
                        d="M140 20 L180 50 L200 80 L220 120 L240 160 L230 200 L210 240 L185 280 L170 310 L155 305 L140 310 L125 305 L110 310 L95 280 L70 240 L50 200 L40 160 L60 120 L80 80 L100 50 Z"
                        fill="#0F2040"
                        stroke="#1E3A5F"
                        strokeWidth="1"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setConfig({ ...config, states: config.states.length > 0 ? [] : ['Maharashtra'] })}
                    />
                    <text x="140" y="180" textAnchor="middle" fontSize="12" fill="#546E7A" fontFamily="Inter">
                        Click to select regions
                    </text>
                </svg>
            </div>
        </div>
    );
};

const StepActors: React.FC<{ config: OnboardingConfig; setConfig: (c: OnboardingConfig) => void }> = ({ config, setConfig }) => {
    const [newOwn, setNewOwn] = useState('');
    const [newOpp, setNewOpp] = useState('');

    const addActor = (side: 'own' | 'opponents') => {
        const name = side === 'own' ? newOwn : newOpp;
        if (!name.trim()) return;
        const actor = { name: name.trim(), twitter: `@${name.trim().toLowerCase().replace(/\s/g, '')}`, facebook: '', youtube: '' };
        setConfig({
            ...config,
            actors: {
                ...config.actors,
                [side]: [...config.actors[side], actor],
            },
        });
        if (side === 'own') {
            setNewOwn('');
        } else {
            setNewOpp('');
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {(['own', 'opponents'] as const).map((side) => (
                <div key={side}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#F0F4FA', marginBottom: 12, textTransform: 'uppercase' }}>
                        {side === 'own' ? 'Own Party Actors' : 'Opponent Tracking'}
                    </h3>

                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        <input
                            type="text"
                            value={side === 'own' ? newOwn : newOpp}
                            onChange={(e) => side === 'own' ? setNewOwn(e.target.value) : setNewOpp(e.target.value)}
                            placeholder="Actor name..."
                            onKeyDown={(e) => e.key === 'Enter' && addActor(side)}
                            style={{
                                flex: 1, padding: '8px 12px', background: '#0B1829',
                                border: '1px solid #1E3A5F', borderRadius: 8,
                                color: '#F0F4FA', fontSize: 12,
                            }}
                        />
                        <button className="btn btn-amber" style={{ padding: '8px 12px' }} onClick={() => addActor(side)}>
                            <Plus size={14} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {config.actors[side].map((actor, i) => (
                            <div key={i} className="card" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#F0F4FA' }}>{actor.name}</div>
                                    <div style={{ fontSize: 10, color: '#546E7A' }}>{actor.twitter}</div>
                                </div>
                                <button
                                    onClick={() => setConfig({
                                        ...config,
                                        actors: { ...config.actors, [side]: config.actors[side].filter((_, j) => j !== i) },
                                    })}
                                    style={{ background: 'none', border: 'none', color: '#546E7A', cursor: 'pointer' }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const StepGeography: React.FC<{ config: OnboardingConfig; setConfig: (c: OnboardingConfig) => void }> = ({ config, setConfig }) => {
    const PRESET_CONSTITUENCIES = [
        { name: 'Mumbai South', lat: 18.90, lon: 72.83 },
        { name: 'Thane', lat: 19.21, lon: 72.98 },
        { name: 'Nashik', lat: 19.99, lon: 73.79 },
        { name: 'Pune', lat: 18.52, lon: 73.85 },
        { name: 'Wardha', lat: 20.75, lon: 78.60 },
        { name: 'Nagpur', lat: 21.14, lon: 79.08 },
        { name: 'Aurangabad', lat: 19.87, lon: 75.34 },
        { name: 'Kolhapur', lat: 16.70, lon: 74.24 },
    ];

    const toggleConstituency = (c: typeof PRESET_CONSTITUENCIES[0]) => {
        const exists = config.constituencies.find((x) => x.name === c.name);
        setConfig({
            ...config,
            constituencies: exists
                ? config.constituencies.filter((x) => x.name !== c.name)
                : [...config.constituencies, { ...c, tier: 2 as 1 | 2 | 3 }],
        });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
            {/* Map area */}
            <div style={{ background: '#0A1525', borderRadius: 12, position: 'relative', minHeight: 300 }}>
                <svg width="100%" height="100%" viewBox="0 0 400 400">
                    <path
                        d="M200 30 L260 70 L280 120 L300 160 L320 200 L310 250 L290 290 L260 330 L240 360 L220 380 L200 370 L180 380 L160 360 L140 330 L120 290 L100 250 L90 200 L100 160 L120 120 L140 70 Z"
                        fill="#0F2040"
                        stroke="#1E3A5F"
                        strokeWidth="1"
                    />
                    {PRESET_CONSTITUENCIES.map((c) => {
                        const x = ((c.lon - 68) / (84 - 68)) * 320 + 40;
                        const y = ((28 - c.lat) / (28 - 15)) * 350 + 20;
                        const selected = config.constituencies.some((x) => x.name === c.name);
                        return (
                            <g key={c.name} onClick={() => toggleConstituency(c)} style={{ cursor: 'pointer' }}>
                                <circle
                                    cx={x} cy={y} r={12}
                                    fill={selected ? 'rgba(255,179,0,0.3)' : 'rgba(30,58,95,0.3)'}
                                    stroke={selected ? '#FFB300' : '#1E3A5F'}
                                    strokeWidth={1.5}
                                />
                                <circle cx={x} cy={y} r={4} fill={selected ? '#FFB300' : '#546E7A'} />
                                <text x={x} y={y - 16} textAnchor="middle" fontSize="9" fill="#F0F4FA" fontWeight="500">{c.name}</text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="card" style={{ padding: 14, textAlign: 'center' }}>
                    <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#FFB300' }}>
                        {config.constituencies.length}
                    </div>
                    <div style={{ fontSize: 11, color: '#546E7A' }}>Constituencies Selected</div>
                </div>

                <div>
                    <label style={{ fontSize: 12, color: '#90A4AE', marginBottom: 6, display: 'block' }}>
                        Kernel Radius: <span className="mono" style={{ color: '#FFB300' }}>{config.kernelSigma}km</span>
                    </label>
                    <input
                        type="range" min={10} max={50} step={1}
                        value={config.kernelSigma}
                        onChange={(e) => setConfig({ ...config, kernelSigma: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: '#FFB300' }}
                    />
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {config.constituencies.map((c, i) => (
                        <div key={c.name} className="card" style={{ padding: '6px 10px', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: '#F0F4FA' }}>{c.name}</span>
                            <select
                                value={c.tier}
                                onChange={(e) => {
                                    const newConst = [...config.constituencies];
                                    newConst[i] = { ...newConst[i], tier: Number(e.target.value) as 1 | 2 | 3 };
                                    setConfig({ ...config, constituencies: newConst });
                                }}
                                style={{
                                    background: '#0B1829', border: '1px solid #1E3A5F', borderRadius: 4,
                                    color: '#FFB300', fontSize: 10, padding: '2px 6px',
                                }}
                            >
                                <option value={1}>T1 Priority</option>
                                <option value={2}>T2 Watch</option>
                                <option value={3}>T3 Monitor</option>
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StepTopicAnchors: React.FC<{ config: OnboardingConfig; setConfig: (c: OnboardingConfig) => void }> = ({ config, setConfig }) => {
    const [seedInputs, setSeedInputs] = useState<Record<string, string>>({});

    const addSeed = (topic: Topic) => {
        const input = seedInputs[topic]?.trim();
        if (!input) return;
        const anchor = config.topicAnchors.find((a) => a.topic === topic);
        if (anchor) {
            setConfig({
                ...config,
                topicAnchors: config.topicAnchors.map((a) =>
                    a.topic === topic ? { ...a, seeds: [...a.seeds, input] } : a
                ),
            });
        }
        setSeedInputs({ ...seedInputs, [topic]: '' });
    };

    const removeSeed = (topic: Topic, seed: string) => {
        setConfig({
            ...config,
            topicAnchors: config.topicAnchors.map((a) =>
                a.topic === topic ? { ...a, seeds: a.seeds.filter((s) => s !== seed) } : a
            ),
        });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {TOPICS.map((topic, i) => {
                const anchor = config.topicAnchors.find((a) => a.topic === topic);
                return (
                    <motion.div
                        key={topic}
                        className="card"
                        style={{ padding: 14 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#F0F4FA' }}>
                            {TOPIC_ICONS[topic]}
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{topic}</span>
                        </div>

                        {/* Seed input */}
                        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                            <input
                                type="text"
                                value={seedInputs[topic] || ''}
                                onChange={(e) => setSeedInputs({ ...seedInputs, [topic]: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && addSeed(topic)}
                                placeholder="Add seed phrase..."
                                style={{
                                    flex: 1, padding: '4px 8px', background: '#0B1829',
                                    border: '1px solid #1E3A5F', borderRadius: 6,
                                    color: '#F0F4FA', fontSize: 10,
                                }}
                            />
                        </div>

                        {/* Seed pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                            {(anchor?.seeds || []).map((s) => (
                                <span key={s} className="badge badge-amber" style={{ fontSize: 9, cursor: 'pointer' }} onClick={() => removeSeed(topic, s)}>
                                    {s} ×
                                </span>
                            ))}
                        </div>

                        {/* Weight slider */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#546E7A', marginBottom: 2 }}>
                                <span>Importance</span>
                                <span className="mono">{anchor?.weight || 50}</span>
                            </div>
                            <input
                                type="range" min={0} max={100}
                                value={anchor?.weight || 50}
                                onChange={(e) => setConfig({
                                    ...config,
                                    topicAnchors: config.topicAnchors.map((a) =>
                                        a.topic === topic ? { ...a, weight: Number(e.target.value) } : a
                                    ),
                                })}
                                style={{ width: '100%', accentColor: '#FFB300' }}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

const StepReviewLaunch: React.FC<{ config: OnboardingConfig; onLaunch: () => void }> = ({ config, onLaunch }) => {
    const [launching, setLaunching] = useState(false);
    const [launchStep, setLaunchStep] = useState(0);
    const launchMessages = ['Connecting data sources...', 'Calibrating models...', 'System online ✓'];

    const handleLaunch = () => {
        setLaunching(true);
        setLaunchStep(0);
        setTimeout(() => setLaunchStep(1), 1000);
        setTimeout(() => setLaunchStep(2), 2000);
        setTimeout(() => onLaunch(), 3000);
    };

    if (launching) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 }}>
                {/* Progress ring */}
                <svg width={80} height={80} viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#1A2E4A" strokeWidth="4" />
                    <motion.circle
                        cx="40" cy="40" r="34" fill="none" stroke="#FFB300" strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="213.6"
                        initial={{ strokeDashoffset: 213.6 }}
                        animate={{ strokeDashoffset: 213.6 - (213.6 * (launchStep + 1) / 3) }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        transform="rotate(-90 40 40)"
                    />
                </svg>
                <motion.div
                    key={launchStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: 16, fontWeight: 500, color: launchStep === 2 ? '#4CAF50' : '#FFB300' }}
                >
                    {launchMessages[launchStep]}
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F0F4FA' }}>Configuration Summary</h3>

            {[
                { label: 'Party', value: config.partyName || 'Not set' },
                { label: 'Ideology', value: config.ideology > 0.3 ? 'Right-leaning' : config.ideology < -0.3 ? 'Left-leaning' : 'Centre' },
                { label: 'Languages', value: config.languages.join(', ') || 'None selected' },
                { label: 'Actors', value: `${config.actors.own.length} own · ${config.actors.opponents.length} opponents` },
                { label: 'Constituencies', value: `${config.constituencies.length} selected` },
                { label: 'Kernel σ', value: `${config.kernelSigma} km` },
                { label: 'Topics', value: config.topicAnchors.map((a) => `${a.topic} (${a.seeds.length} seeds)`).join(', ') },
            ].map((item) => (
                <div key={item.label} className="card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#90A4AE' }}>{item.label}</span>
                    <span style={{ fontSize: 12, color: '#F0F4FA', textAlign: 'right', maxWidth: '60%' }}>{item.value}</span>
                </div>
            ))}

            <motion.button
                className="btn btn-amber ripple"
                style={{
                    width: '100%',
                    height: 56,
                    fontSize: 16,
                    fontWeight: 700,
                    marginTop: 12,
                    borderRadius: 12,
                }}
                onClick={handleLaunch}
                animate={{ boxShadow: ['0 0 0 0 rgba(255,179,0,0)', '0 0 20px 4px rgba(255,179,0,0.3)', '0 0 0 0 rgba(255,179,0,0)'] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <Rocket size={20} />
                LAUNCH INTELLIGENCE SYSTEM
            </motion.button>
        </div>
    );
};

// ─── Main Wizard ─────────────────────────────────────────────

const STEP_TITLES = [
    'Party Identity',
    'Languages & Region',
    'Actors & Opponents',
    'Geographic Scope',
    'Topic Anchors',
    'Review & Launch',
];

const initialConfig: OnboardingConfig = {
    partyName: '',
    logo: null,
    ideology: 0,
    primaryColor: '#FFB300',
    languages: [],
    states: [],
    actors: { own: [], opponents: [] },
    constituencies: [],
    kernelSigma: 25,
    topicAnchors: TOPICS.map((t) => ({ topic: t, seeds: [], weight: 50 })),
};

const OnboardingWizard: React.FC = () => {
    const navigate = useNavigate();
    const setStoreConfig = usePlatformStore((s) => s.setConfig);
    const [step, setStep] = useState(0);
    const [config, setConfig] = useState<OnboardingConfig>(initialConfig);

    const progress = ((step + 1) / 6) * 100;

    const handleLaunch = useCallback(() => {
        setStoreConfig(config);
        navigate('/dashboard');
    }, [config, navigate, setStoreConfig]);

    const stepContent = [
        <StepPartyIdentity config={config} setConfig={setConfig} />,
        <StepLanguageRegion config={config} setConfig={setConfig} />,
        <StepActors config={config} setConfig={setConfig} />,
        <StepGeography config={config} setConfig={setConfig} />,
        <StepTopicAnchors config={config} setConfig={setConfig} />,
        <StepReviewLaunch config={config} onLaunch={handleLaunch} />,
    ];

    return (
        <div style={{
            width: '100vw', height: '100vh', background: '#0B1829',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Animated background */}
            <div className="animated-bg"><div className="animated-bg-teal" /></div>

            {/* Progress bar */}
            <div style={{ height: 4, background: '#1A2E4A', position: 'relative', zIndex: 10 }}>
                <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #FFB300, #FFA000)', borderRadius: '0 2px 2px 0' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                />
                <span className="mono" style={{
                    position: 'absolute', right: 12, top: 8,
                    fontSize: 11, color: '#FFB300',
                }}>
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Header */}
            <div style={{ padding: '20px 32px 0', zIndex: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Step {step + 1} of 6
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F0F4FA', marginTop: 4 }}>
                    {STEP_TITLES[step]}
                </h1>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '24px 32px', overflow: 'auto', zIndex: 10, position: 'relative' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -60, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ height: '100%' }}
                    >
                        {stepContent[step]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                <button
                    className="btn btn-outline"
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    style={{ opacity: step === 0 ? 0.3 : 1 }}
                >
                    <ChevronLeft size={16} />
                    Back
                </button>

                {step === 5 ? (
                    <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
                        Skip to Dashboard
                        <ChevronRight size={16} />
                    </button>
                ) : (
                    <button className="btn btn-amber" onClick={() => setStep(Math.min(5, step + 1))}>
                        Continue
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default OnboardingWizard;
