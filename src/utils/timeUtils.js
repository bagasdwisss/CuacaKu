// src/utils/timeUtils.js

// Jam (0-23) saat ini di zona waktu lokasi
export const getLocalHour = (timezone, nowMs = Date.now()) =>
    parseInt(
        new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', hourCycle: 'h23' }).format(nowMs),
        10
    );

// Siang atau malam, dihitung dari epoch sehingga tidak bergantung pada zona waktu browser
export const isDaytime = (current, nowMs = Date.now()) => {
    const nowSec = nowMs / 1000;
    return nowSec >= current.sunriseEpoch && nowSec < current.sunsetEpoch;
};

// Jam-jam yang masih berlaku mulai dari jam sekarang (slot jam yang sedang berjalan ikut dihitung)
export const getUpcomingHours = (hours, count = 24, nowMs = Date.now()) =>
    (hours || []).filter((h) => (h.datetimeEpoch + 3600) * 1000 > nowMs).slice(0, count);

export const formatLocalTime = (epochSec, timezone) =>
    new Date(epochSec * 1000).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: timezone,
    });