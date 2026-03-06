import React from 'react';
import Sidebar from '../layout/Sidebar';
import DashboardHeader from '../layout/DashboardHeader';
import StatePanel from './StatePanel';
import MapPanel from './MapPanel';
import AlertsPanel from './AlertsPanel';
import TopicPanel from './TopicPanel';
import HistoryPanel from './HistoryPanel';
import StrategyModal from './StrategyModal';
import ConstituencyDetail from './ConstituencyDetail';
import CorrelationMatrix from './CorrelationMatrix';
import AnalyticsPage from './AnalyticsPage';
import { useWebSocket } from '../../hooks/useWebSocket';
import { usePlatformStore } from '../../store/platformStore';
import { Crosshair } from 'lucide-react';

// ─── Full Dashboard Grid ──────────────────────────────────
const DashboardGrid: React.FC = () => {
    const setStrategyModalOpen = usePlatformStore((s) => s.setStrategyModalOpen);

    return (
        <div
            style={{
                height: '100%',
                display: 'grid',
                gridTemplateAreas: `
          'map     state   alerts'
          'map     topics  alerts'
          'history history strategy'
        `,
                gridTemplateColumns: '2fr 1.5fr 1fr',
                gridTemplateRows: '1fr 1fr 320px',
                gap: 12,
            }}
        >
            <div style={{ gridArea: 'map', minHeight: 0 }}><MapPanel /></div>
            <div style={{ gridArea: 'state', minHeight: 0 }}><StatePanel /></div>
            <div style={{ gridArea: 'alerts', minHeight: 0 }}><AlertsPanel /></div>
            <div style={{ gridArea: 'topics', minHeight: 0 }}><TopicPanel /></div>
            <div style={{ gridArea: 'history', minHeight: 0 }}><HistoryPanel /></div>

            {/* Strategy area */}
            <div className="card-glass" style={{ gridArea: 'strategy', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Crosshair size={28} color="#FFB300" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#90A4AE' }}>Strategy Simulation</span>
                <span style={{ fontSize: 11, color: '#546E7A', textAlign: 'center' }}>
                    Run predictive trajectory analysis
                </span>
                <button
                    className="btn btn-amber"
                    style={{ marginTop: 8, fontSize: 12, padding: '8px 20px' }}
                    onClick={() => setStrategyModalOpen(true)}
                >
                    <Crosshair size={14} />
                    SIMULATE
                </button>
            </div>
        </div>
    );
};

// ─── Globe View ──────────────────────────────────────────
const GlobeView: React.FC = () => {
    return (
        <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 12 }}>
            <MapPanel />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <StatePanel />
            </div>
        </div>
    );
};

// ─── Alerts Full View ──────────────────────────────────────
const AlertsView: React.FC = () => {
    return (
        <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <HistoryPanel />
            <AlertsPanel />
        </div>
    );
};

// ─── Simulation View ──────────────────────────────────────
const SimulationView: React.FC = () => {
    const setStrategyModalOpen = usePlatformStore((s) => s.setStrategyModalOpen);
    React.useEffect(() => {
        setStrategyModalOpen(true);
    }, [setStrategyModalOpen]);

    return (
        <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MapPanel />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <StatePanel />
                <TopicPanel />
            </div>
        </div>
    );
};

// ─── Main Dashboard ──────────────────────────────────────
const Dashboard: React.FC = () => {
    useWebSocket();
    const activeView = usePlatformStore((s) => s.activeView);
    const setStrategyModalOpen = usePlatformStore((s) => s.setStrategyModalOpen);
    const wsStatus = usePlatformStore((s) => s.wsStatus);

    const renderView = () => {
        switch (activeView) {
            case 'globe':
                return <GlobeView />;
            case 'analytics':
                return <AnalyticsPage />;
            case 'alerts':
                return <AlertsView />;
            case 'simulation':
                return <SimulationView />;
            case 'correlation':
                return <CorrelationMatrix />;
            case 'dashboard':
            default:
                return <DashboardGrid />;
        }
    };

    return (
        <>
            {/* Animated background */}
            <div className="animated-bg">
                <div className="animated-bg-teal" />
            </div>

            {/* Loading bar while connecting */}
            {wsStatus === 'reconnecting' && <div className="loading-bar" />}

            {/* Sidebar */}
            <Sidebar />

            {/* Main area */}
            <div
                style={{
                    marginLeft: 64,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <DashboardHeader />

                {/* Content */}
                <div style={{ flex: 1, padding: 12, overflow: 'hidden', minHeight: 0 }}>
                    {renderView()}
                </div>
            </div>

            {/* Overlays */}
            <StrategyModal />
            <ConstituencyDetail />

            {/* FAB */}
            <button
                onClick={() => setStrategyModalOpen(true)}
                className="btn btn-amber ripple"
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    zIndex: 40,
                    boxShadow: '0 4px 16px rgba(255,179,0,0.3)',
                    padding: 0,
                }}
                title="Simulate Strategy"
            >
                <Crosshair size={22} />
            </button>
        </>
    );
};

export default Dashboard;
