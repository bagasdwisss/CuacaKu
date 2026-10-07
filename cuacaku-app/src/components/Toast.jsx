// src/components/Toast.jsx
import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

const Toast = ({ message, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [message, onClose, duration]);

    return (
        <div
            className="fixed bottom-4 left-4 right-4 sm:w-auto sm:max-w-md sm:left-1/2 sm:-translate-x-1/2 sm:right-auto
                 bg-red-500 text-white p-4 rounded-lg shadow-2xl flex items-center justify-between gap-3 z-50 animate-toast-in"
            role="alert"
        >
            <div className="flex items-center gap-3">
                <FiAlertTriangle size={24} className="flex-shrink-0" />
                <p className="font-semibold text-sm">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-red-600 transition-colors"
                aria-label="Tutup notifikasi"
            >
                <FaTimes size={16} />
            </button>
        </div>
    );
};

export default Toast;