import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { usePlatformStore } from '../../store/platformStore';
import { sentimentColor } from '../../design-system';

function latLonToVec3(lat: number, lon: number, radius: number): [number, number, number] {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return [x, y, z];
}

const Globe: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[2, 64, 64]} />
            <meshStandardMaterial
                color="#0F2040"
                wireframe={false}
                transparent
                opacity={0.85}
                metalness={0.3}
                roughness={0.7}
            />
            {/* Wireframe overlay */}
            <mesh>
                <sphereGeometry args={[2.005, 32, 32]} />
                <meshBasicMaterial color="#1E3A5F" wireframe transparent opacity={0.15} />
            </mesh>
        </mesh>
    );
};

const ConstituencyDot: React.FC<{
    lat: number;
    lon: number;
    sentiment: number;
    name: string;
    isCrisis: boolean;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ lat, lon, sentiment, name, isCrisis }) => {
    const pos = useMemo(() => latLonToVec3(lat, lon, 2.05), [lat, lon]);
    const color = sentimentColor(sentiment);
    const size = Math.max(0.03, Math.abs(sentiment) * 0.08);
    const meshRef = useRef<THREE.Mesh>(null);
    const haloRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (isCrisis && haloRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
            haloRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group position={pos}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            {isCrisis && (
                <mesh ref={haloRef}>
                    <ringGeometry args={[size * 1.5, size * 2.2, 32]} />
                    <meshBasicMaterial color="#EF5350" transparent opacity={0.3} side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    );
};

const GlobeScene: React.FC = () => {
    const constituencies = usePlatformStore((s) => s.constituencies);

    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 3, 5]} intensity={0.8} />
            <Stars radius={100} depth={50} count={1000} factor={3} fade speed={0.5} />
            <Globe />
            {Object.entries(constituencies).map(([key, c]) => (
                <ConstituencyDot
                    key={key}
                    lat={c.lat}
                    lon={c.lon}
                    sentiment={c.s}
                    name={c.name}
                    isCrisis={c.stability_index < 0.3}
                />
            ))}
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={3}
                maxDistance={10}
                autoRotate
                autoRotateSpeed={0.5}
            />
        </>
    );
};

const MapPanel: React.FC = () => {
    const [mode, setMode] = React.useState<'globe' | 'map'>('globe');
    const constituencies = usePlatformStore((s) => s.constituencies);
    const setSelected = usePlatformStore((s) => s.setSelectedConstituency);

    return (
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', padding: '8px 12px', gap: 4 }}>
                {(['globe', 'map'] as const).map((m) => (
                    <button
                        key={m}
                        className={`btn ${mode === m ? 'btn-amber' : 'btn-outline'}`}
                        style={{ fontSize: 11, padding: '4px 12px', flex: 1 }}
                        onClick={() => setMode(m)}
                    >
                        {m === 'globe' ? '3D GLOBE' : 'CONSTITUENCY MAP'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                {mode === 'globe' ? (
                    <Canvas
                        camera={{ position: [0, 0, 5], fov: 45 }}
                        style={{ background: '#000510' }}
                        gl={{ antialias: true }}
                    >
                        <GlobeScene />
                    </Canvas>
                ) : (
                    /* Constituency Map — simple interactive view without Mapbox */
                    <div style={{ width: '100%', height: '100%', background: '#0A1525', position: 'relative', overflow: 'hidden' }}>
                        {/* India outline placeholder with dots */}
                        <svg width="100%" height="100%" viewBox="0 0 400 400" style={{ position: 'absolute', inset: 0 }}>
                            {/* Simple India outline */}
                            <path
                                d="M200 40 L260 80 L280 120 L300 160 L320 200 L310 240 L290 280 L260 320 L240 360 L220 380 L200 370 L180 380 L160 360 L140 320 L120 280 L100 240 L90 200 L100 160 L120 120 L140 80 Z"
                                fill="none"
                                stroke="#1E3A5F"
                                strokeWidth="1"
                                opacity={0.4}
                            />
                            {/* Constituency dots */}
                            {Object.entries(constituencies).map(([key, c]) => {
                                const x = ((c.lon - 68) / (84 - 68)) * 320 + 40;
                                const y = ((28 - c.lat) / (28 - 15)) * 300 + 40;
                                const color = sentimentColor(c.s);
                                const isCrisis = c.stability_index < 0.3;
                                return (
                                    <g
                                        key={key}
                                        onClick={() => setSelected(key)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {isCrisis && (
                                            <circle cx={x} cy={y} r={18} fill="none" stroke="#EF5350" strokeWidth={1} opacity={0.3}>
                                                <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                                                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                                            </circle>
                                        )}
                                        <circle cx={x} cy={y} r={8 + Math.abs(c.s) * 15} fill={color} opacity={0.3} />
                                        <circle cx={x} cy={y} r={5} fill={color} stroke="#0B1829" strokeWidth={1.5} />
                                        <text
                                            x={x}
                                            y={y - 14}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fontWeight="600"
                                            fill="#F0F4FA"
                                            fontFamily="Inter"
                                        >
                                            {c.name}
                                        </text>
                                        <text
                                            x={x}
                                            y={y + 20}
                                            textAnchor="middle"
                                            fontSize="9"
                                            fontFamily="'JetBrains Mono'"
                                            fill={color}
                                        >
                                            {c.s > 0 ? '+' : ''}{c.s.toFixed(3)}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Color legend */}
                        <div style={{
                            position: 'absolute',
                            bottom: 12,
                            left: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 10px',
                            background: 'rgba(15,32,64,0.8)',
                            borderRadius: 8,
                            border: '1px solid #1E3A5F',
                        }}>
                            <span style={{ fontSize: 9, color: '#B71C1C' }}>−0.5</span>
                            <div style={{
                                width: 100,
                                height: 8,
                                borderRadius: 4,
                                background: 'linear-gradient(to right, #B71C1C, #EF5350, #1A2E4A, #26A69A, #004D40)',
                            }} />
                            <span style={{ fontSize: 9, color: '#004D40' }}>+0.5</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MapPanel);
