// src/utils/locationUtils.js

const norm = (s) => (s || '').toString().trim().toLowerCase();

export const hasCoords = (loc) =>
    typeof loc?.lat === 'number' && typeof loc?.lon === 'number' &&
    Number.isFinite(loc.lat) && Number.isFinite(loc.lon);

// Dua lokasi dianggap sama jika namanya sama dan (bila ada koordinat) jaraknya berdekatan
export const isSameLocation = (a, b) => {
    if (!a || !b || norm(a.name) !== norm(b.name)) return false;
    if (!hasCoords(a) || !hasCoords(b)) return true;
    return Math.abs(a.lat - b.lat) < 0.25 && Math.abs(a.lon - b.lon) < 0.25;
};

export const toStoredLocation = ({ name, country, lat, lon }) => ({
    name,
    country: country || null,
    lat,
    lon,
});

// Favorit lama disimpan sebagai string; favorit baru berupa objek {name, country, lat, lon}
export const normalizeFavorites = (list) =>
    (Array.isArray(list) ? list : [])
        .map((f) => (typeof f === 'string' ? { name: f } : f))
        .filter((f) => f && f.name);