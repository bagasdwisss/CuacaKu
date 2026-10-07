// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export default function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw !== null ? JSON.parse(raw) : initialValue;
        } catch (e) {
            console.error(`Gagal membaca "${key}" dari localStorage`, e);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Gagal menyimpan "${key}" ke localStorage`, e);
        }
    }, [key, value]);

    return [value, setValue];
}