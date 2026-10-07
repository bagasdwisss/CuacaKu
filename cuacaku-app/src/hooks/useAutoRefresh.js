// src/hooks/useAutoRefresh.js
import { useEffect, useRef } from 'react';

// Memanggil onRefresh secara berkala (hanya saat tab terlihat) dan saat tab/koneksi kembali aktif.
// staleAfterMs mencegah refresh berulang-ulang bila pengguna sering berpindah tab (hemat kuota API).
export default function useAutoRefresh(
    onRefresh,
    { lastUpdated, enabled = true, intervalMs = 10 * 60 * 1000, staleAfterMs = 5 * 60 * 1000 }
) {
    const callbackRef = useRef(onRefresh);
    const lastUpdatedRef = useRef(lastUpdated);

    useEffect(() => {
        callbackRef.current = onRefresh;
        lastUpdatedRef.current = lastUpdated;
    });

    useEffect(() => {
        if (!enabled) return undefined;

        const refreshIfOlderThan = (thresholdMs) => {
            if (document.visibilityState !== 'visible') return;
            const last = lastUpdatedRef.current;
            if (!last || Date.now() - last >= thresholdMs) callbackRef.current();
        };

        const timer = setInterval(() => refreshIfOlderThan(intervalMs), 60 * 1000);
        const handleVisible = () => refreshIfOlderThan(staleAfterMs);

        document.addEventListener('visibilitychange', handleVisible);
        window.addEventListener('online', handleVisible);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisible);
            window.removeEventListener('online', handleVisible);
        };
    }, [enabled, intervalMs, staleAfterMs]);
}