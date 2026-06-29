/**
 * Aether Weather - Storage Service
 * 
 * Abstracts all LocalStorage access behind a clean API.
 * No other module should call localStorage directly.
 */

const KEYS = {
    LAST_CITY: 'lastCity',
    GEO_PREFERENCE: 'aether_geo_preference'
};

/**
 * Returns the last searched city, or the fallback default.
 * @param {string} [fallback='London']
 * @returns {string}
 */
export function getLastCity(fallback = 'London') {
    return localStorage.getItem(KEYS.LAST_CITY) || fallback;
}

/**
 * Persists the city name for session restore.
 * @param {string} city
 */
export function setLastCity(city) {
    if (city) localStorage.setItem(KEYS.LAST_CITY, city);
}

/**
 * Returns the user's geolocation preference.
 * @returns {'accepted'|'declined'|null}
 */
export function getGeoPreference() {
    return localStorage.getItem(KEYS.GEO_PREFERENCE);
}

/**
 * Persists the user's geolocation preference.
 * @param {'accepted'|'declined'} value
 */
export function setGeoPreference(value) {
    localStorage.setItem(KEYS.GEO_PREFERENCE, value);
}
