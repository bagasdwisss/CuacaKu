// src/services/geoService.js
import axios from 'axios';

const GEO_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const GEO_BASE_URL = 'https://api.geoapify.com/v1/geocode';

// Hasil yang bukan "tempat" untuk keperluan cuaca disaring dari autocomplete
const NON_PLACE_TYPES = ['amenity', 'building', 'street', 'postcode'];

export const isCoordinates = (str) => /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(str);

// Error yang pesannya aman ditampilkan langsung ke pengguna
export const userError = (message) => {
    const error = new Error(message);
    error.userMessage = message;
    return error;
};

export const cleanPlaceName = (name) =>
    name ? name.replace(/^(city of|kota|kabupaten|regency of|special capital region of)\s/i, '').trim() : name;

const getPlaceName = (props) => {
    const byType = { city: 'city', suburb: 'suburb', district: 'district', county: 'county', state: 'state', country: 'country' };
    const key = byType[props.result_type];
    return (
        (key && props[key]) ||
        props.city || props.name || props.town || props.village ||
        props.suburb || props.district || props.county || props.state || props.country
    );
};

const toPlace = (props) => ({
    id: props.place_id,
    name: cleanPlaceName(getPlaceName(props)) || null,
    country: props.country || null,
    lat: props.lat,
    lon: props.lon,
    label: props.formatted || '',
});

const hasLatLon = (p) => p && typeof p.lat === 'number' && typeof p.lon === 'number';

// Saran lokasi saat mengetik
export const autocompletePlaces = async (text, { signal } = {}) => {
    const { data } = await axios.get(`${GEO_BASE_URL}/autocomplete`, {
        params: { text, limit: 8, apiKey: GEO_API_KEY },
        signal,
    });
    const all = (data?.features || []).map((f) => f.properties).filter(hasLatLon);
    const placesOnly = all.filter((p) => !NON_PLACE_TYPES.includes(p.result_type));

    const seen = new Set();
    return (placesOnly.length ? placesOnly : all)
        .map(toPlace)
        .filter((p) => p.name)
        .filter((p) => {
            const key = `${p.name}|${p.lat.toFixed(2)}|${p.lon.toFixed(2)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, 6);
};

// Teks bebas -> satu lokasi (dipakai saat Enter tanpa memilih saran)
export const geocodePlace = async (text, { signal } = {}) => {
    const { data } = await axios.get(`${GEO_BASE_URL}/search`, {
        params: { text, limit: 1, apiKey: GEO_API_KEY },
        signal,
    });
    const props = data?.features?.[0]?.properties;
    if (!hasLatLon(props)) throw userError(`Lokasi "${text}" tidak dapat ditemukan.`);
    return toPlace(props);
};

// Koordinat -> nama tempat (dipakai tombol "Deteksi Lokasi")
export const reverseGeocode = async (lat, lon, { signal } = {}) => {
    const { data } = await axios.get(`${GEO_BASE_URL}/reverse`, {
        params: { lat, lon, limit: 1, apiKey: GEO_API_KEY },
        signal,
    });
    const props = data?.features?.[0]?.properties;
    if (!props) return null;
    const name = cleanPlaceName(
        props.city || props.town || props.village || props.suburb ||
        props.county || props.state_district || props.state || props.name
    );
    return { name: name || null, country: props.country || null };
};