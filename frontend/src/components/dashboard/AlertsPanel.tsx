import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatformStore } from '../../store/platformStore';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AlertCircle, TrendingDown, Activity, Wifi, ChevronUp } from 'lucide-react';
import type { AlertType } from '../../types';
import { SYSTEM_STATUSES } from '../../data/mockData';

const ALERT_CONFIG: Record<AlertType, { icon: React.ReactNode; color: string; label: string; bgColor: string }> = {
    CRISIS: { icon: '🚨', color: '#EF5350', label: 'CRISIS', bgColor: 'rgba(239,83,80,0.1)' },
    DRIFT: { icon: '⚠️', color: '#FFB300', label: 'DRIFT', bgColor: 'rgba(255,179,0,0.1)' },
    INSTABILITY: { icon: '🔴', color: '#FF7043', label: 'INSTABILITY', bgColor: 'rgba(255,112,67,0.1)' },
    VIRALITY: { icon: '📡', color: '#AB47BC', label: 'VIRALITY', bgColor: 'rgba(171,71,188,0.1)' },
    ACCELERATION: { icon: '📉', color: '#EF5350', label: 'ACCEL', bgColor: 'rgba(239,83,80,0.1)' },
};

function timeAgo(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
}

const AlertsPanel: React.FC = () => {
    const alerts = usePlatformStore((s) => s.alerts);

    const counts = useMemo(() => {
        const c: Record<string, number> = { CRISIS: 0, DRIFT: 0, INSTABILITY: 0, VIRALITY: 0 };
        alerts.forEach((a) => {
            if (a.type in c) c[a.type]++;
        });
        return c;
    }, [alerts]);

    const counterItems = [
        { key: 'CRISIS', icon: <AlertCircle size={16} />, color: '#EF5350' },
        { key: 'DRIFT', icon: <TrendingDown size={16} />, color: '#FFB300' },
        { key: 'INSTABILITY', icon: <Activity size={16} />, color: '#FF7043' },
        { key: 'VIRALITY', icon: <Wifi size={16} />, color: '#AB47BC' },
    ];

    return (
        <div className="card-glass" style={{ padding: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', color: '#90A4AE', textTransform: 'uppercase', marginBottom: 12 }}>
                Alerts
            </h2>

            {/* Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                {counterItems.map((item) => (
                    <div
                        key={item.key}
                        className={`card ${item.key === 'CRISIS' && counts[item.key] > 0 ? 'crisis-pulse' : ''}`}
                        style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <div style={{ color: item.color }}>{item.icon}</div>
                        <div>
                            <motion.div
                                className="mono"
                                style={{ fontSize: 18, fontWeight: 700, color: item.color }}
                                key={counts[item.key]}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                                {counts[item.key]}
                            </motion.div>
                            <div style={{ fontSize: 9, color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {item.key}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Live Feed */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <AnimatePresence initial={false}>
                    {alerts.slice(0, 30).map((alert) => {
                        const cfg = ALERT_CONFIG[alert.type];
                        return (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                style={{
                                    display: 'flex',
                                    gap: 8,
                                    padding: '8px 10px',
                                    marginBottom: 4,
                                    borderRadius: 8,
                                    background: cfg.bgColor,
                                    borderLeft: `3px solid ${cfg.color}`,
                                    fontSize: 12,
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <span>{cfg.icon}</span>
                                        <span className="badge" style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40`, fontSize: 9, padding: '1px 6px' }}>
                                            {cfg.label}
                                        </span>
                                        <span style={{ fontWeight: 600, color: '#F0F4FA' }}>{alert.constituency.replace('_', ' ')}</span>
                                    </div>
                                    <div className="mono" style={{ fontSize: 10, color: '#90A4AE' }}>
                                        {alert.detail}
                                    </div>
                                </div>
                                <span style={{ fontSize: 9, color: '#546E7A', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
                                    {timeAgo(alert.timestamp)}
                                </span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* System Status */}
            <div style={{ borderTop: '1px solid #1E3A5F', paddingTop: 10, marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#546E7A', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                    System Status
                </div>
                {SYSTEM_STATUSES.map((sys) => (
                    <div key={sys.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span style={{ fontSize: 11, color: '#90A4AE' }}>{sys.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className={`status-dot ${sys.status === 'ok' ? 'connected' : sys.status === 'degraded' ? 'reconnecting' : 'disconnected'}`} />
                            <span className="mono" style={{ fontSize: 9, color: '#546E7A' }}>
                                {new Date(sys.lastPing).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(AlertsPanel);
