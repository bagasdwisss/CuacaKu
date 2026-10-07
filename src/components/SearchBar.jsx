import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { FaSearch, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import { autocompletePlaces } from '../services/geoService';

const DEBOUNCE_MS = 350; // jeda setelah berhenti mengetik sebelum memanggil Geoapify
const MIN_CHARS = 2;

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  const reset = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setLoading(false);
    setSearched(false);
    setFailed(false);
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  // Klik di luar komponen: tutup saran dan reset input (perilaku sama seperti sebelumnya)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) reset();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [reset]);

  // Autocomplete dengan debounce + pembatalan request lama
  useEffect(() => {
    const text = query.trim();
    if (text.length < MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      setSearched(false);
      setFailed(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await autocompletePlaces(text, { signal: controller.signal });
        setSuggestions(results);
        setFailed(false);
        setSearched(true);
        setActiveIndex(-1);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error('Autocomplete error:', err);
        setSuggestions([]);
        setFailed(true);
        setSearched(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Jaga item aktif (navigasi keyboard) tetap terlihat di dalam daftar
  useEffect(() => {
    if (activeIndex >= 0) {
      document.getElementById(`suggestion-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const handleSelect = (place) => {
    reset();
    onSearch(place); // objek { name, country, lat, lon } -> tidak perlu geocoding ulang
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) return handleSelect(suggestions[activeIndex]);

    const text = query.trim();
    if (!text) return undefined;
    if (suggestions.length > 0 && !loading) return handleSelect(suggestions[0]);

    reset();
    onSearch(text); // fallback: cari berdasarkan teks
    return undefined;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      reset();
    }
  };

  const showDropdown = open && query.trim().length >= MIN_CHARS && (loading || suggestions.length > 0 || searched);

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center text-gray-500 focus-within:text-blue-600">
          <span className="absolute left-3"> <FaSearch /> </span>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Cari kota atau daerah..."
            className="w-full pl-10 pr-10 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors duration-300"
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          />
          {loading && (
            <span className="absolute right-3">
              <FaSpinner className="animate-spin" size={14} />
            </span>
          )}
          <button type="submit" className="hidden">Search</button>
        </div>
      </form>

      {showDropdown && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          {suggestions.length > 0 ? (
            <ul
              id="search-suggestions"
              role="listbox"
              className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto
                         scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100
                         dark:scrollbar-thumb-blue-400 dark:scrollbar-track-slate-700
                         hover:scrollbar-thumb-blue-600 dark:hover:scrollbar-thumb-blue-500"
            >
              {suggestions.map((place, index) => (
                <li
                  key={place.id || `${place.name}-${index}`}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => handleSelect(place)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-start gap-3 px-4 py-2 cursor-pointer ${index === activeIndex ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-blue-500" size={14} />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{place.name}</p>
                    {place.label && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{place.label}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p id="search-suggestions" className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {loading
                ? 'Mencari lokasi...'
                : failed
                  ? 'Saran lokasi tidak tersedia. Tekan Enter untuk mencari langsung.'
                  : `Tidak ada hasil untuk "${query.trim()}". Tekan Enter untuk mencoba mencari langsung.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;