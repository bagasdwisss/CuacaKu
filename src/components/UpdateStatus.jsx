// src/components/UpdateStatus.jsx
import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

const formatAgo = (ms) => {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    return `${Math.floor(minutes / 60)} jam lalu`;
};

const UpdateStatus = ({ lastUpdated, refreshing, onRefresh }) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(timer);
    }, []);

    const elapsed = lastUpdated ? Math.max(0, now - lastUpdated) : 0;

    return (
        <div className="flex items-center justify-end gap-3 text-sm text-gray-500 dark:text-gray-400 -mb-4">
            {lastUpdated && (
                <span title="Data diperbarui otomatis setiap 10 menit saat halaman terbuka">
                    Diperbarui {formatAgo(elapsed)}
                </span>
            )}
            <button
                onClick={onRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-60 disabled:cursor-wait transition-all"
                aria-label="Perbarui data cuaca"
            >
                <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Perbarui
            </button>
        </div>
    );
};

export default UpdateStatus;