import React from 'react';
import { usePlatformStore } from '../../store/platformStore';
import { Bell, Zap, Wifi, WifiOff } from 'lucide-react';

const DashboardHeader: React.FC = () => {
    const config = usePlatformStore((s) => s.config);
    const wsStatus = usePlatformStore((s) => s.wsStatus);
    const alerts = usePlatformStore((s) => s.alerts);
    const unreadCount = alerts.filter((a) => !a.read).length;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <header
            style={{
                height: 56,
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                borderBottom: '1px solid rgba(80, 60, 160, 0.15)',
                flexShrink: 0,
                position: 'relative',
                background: 'linear-gradient(90deg, rgba(14, 12, 26, 0.7) 0%, rgba(19, 16, 43, 0.5) 100%)',
                backdropFilter: 'blur(16px)',
            }}
        >
            {/* Subtle bottom glow */}
            <div style={{
                position: 'absolute',
                bottom: -1,
                left: '10%',
                width: '80%',
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(245, 200, 66, 0.06), rgba(139, 108, 246, 0.06), transparent)',
            }} />

            {/* Left — Logo & title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, rgba(245, 200, 66, 0.12), rgba(245, 200, 66, 0.04))',
                    border: '1px solid rgba(245, 200, 66, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Zap size={16} color="#F5C842" />
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#EEEDF5', letterSpacing: '-0.01em' }}>
                        {config?.partyName || 'POLARIS'}
                    </div>
                </div>
            </div>

            {/* Centre */}
            <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
            }}>
                <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    color: '#706B9E',
                    textTransform: 'uppercase',
                }}>
                    POLARIS — Live Intelligence Dashboard
                </span>
            </div>

            {/* Right */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className="mono" style={{ fontSize: 12, color: '#706B9E', fontWeight: 500 }}>
                    {timeStr}
                </span>

                {/* WS Status */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: wsStatus === 'connected'
                        ? 'rgba(54, 214, 181, 0.06)'
                        : 'rgba(239, 83, 80, 0.06)',
                    border: `1px solid ${wsStatus === 'connected' ? 'rgba(54, 214, 181, 0.12)' : 'rgba(239, 83, 80, 0.12)'}`,
                }}>
                    {wsStatus === 'connected' ? (
                        <Wifi size={12} color="#36D6B5" />
                    ) : (
                        <WifiOff size={12} color="#EF5350" />
                    )}
                    <span className={`status-dot ${wsStatus === 'connected' ? 'status-dot-ok' : 'status-dot-error'}`} />
                    <span style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: wsStatus === 'connected' ? '#36D6B5' : '#EF5350',
                    }}>
                        {wsStatus === 'connected' ? 'Connected' : wsStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
                    </span>
                </div>

                {/* Alerts */}
                <button
                    style={{
                        position: 'relative',
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        border: '1px solid rgba(80, 60, 160, 0.15)',
                        background: unreadCount > 0 ? 'rgba(239, 83, 80, 0.05)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#706B9E',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(139, 108, 246, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(139, 108, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = unreadCount > 0 ? 'rgba(239, 83, 80, 0.05)' : 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(80, 60, 160, 0.15)';
                    }}
                >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: -3,
                            right: -3,
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            background: 'linear-gradient(135deg, #EF5350, #C62828)',
                            color: '#fff',
                            fontSize: 9,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(239, 83, 80, 0.4)',
                            border: '2px solid #08070F',
                        }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
};

export default React.memo(DashboardHeader);
