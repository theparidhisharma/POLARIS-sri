// ─────────────────────────────────────────────────────────
// Mock WebSocket Hook — simulates real-time data stream
// ─────────────────────────────────────────────────────────
import { useEffect, useRef, useCallback } from 'react';
import { usePlatformStore } from '../store/platformStore';
import { perturbState, generateNewAlert } from '../data/mockData';

export function useWebSocket() {
    const wsStatus = usePlatformStore((s) => s.wsStatus);
    const setWsStatus = usePlatformStore((s) => s.setWsStatus);
    const updateConstituency = usePlatformStore((s) => s.updateConstituency);
    const addAlert = usePlatformStore((s) => s.addAlert);
    const intervalRef = useRef<number | null>(null);
    const alertIntervalRef = useRef<number | null>(null);

    const connect = useCallback(() => {
        setWsStatus('reconnecting');

        // Simulate connection delay
        setTimeout(() => {
            setWsStatus('connected');

            // Simulate state updates every 3 seconds
            intervalRef.current = window.setInterval(() => {
                const constituencies = usePlatformStore.getState().constituencies;
                const keys = Object.keys(constituencies);
                const key = keys[Math.floor(Math.random() * keys.length)];
                const current = constituencies[key];
                if (current) {
                    updateConstituency(key, perturbState(current));
                }
            }, 3000);

            // Simulate alerts every 8-15 seconds
            alertIntervalRef.current = window.setInterval(() => {
                addAlert(generateNewAlert());
            }, 8000 + Math.random() * 7000);
        }, 1500);
    }, [setWsStatus, updateConstituency, addAlert]);

    const disconnect = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (alertIntervalRef.current) clearInterval(alertIntervalRef.current);
        setWsStatus('disconnected');
    }, [setWsStatus]);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return { status: wsStatus, connect, disconnect };
}
