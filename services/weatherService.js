/**
 * Aether Weather - Weather Service
 * Phase 4.4
 * 
 * Responsible exclusively for network communication with WeatherAPI.
 * Fetches raw data, handles network/timeout errors, and returns unmutated payloads.
 * Strictly no UI, DOM, store, or normalization logic allowed here.
 */

import { API_CONFIG } from '../config/apiConfig.js';

/**
 * Reusable internal request helper.
 * Manages URL construction, authentication, and error handling safely.
 * 
 * @param {string} endpoint - API endpoint (e.g., '/forecast.json')
 * @param {Object} queryParams - Query parameters to append
 * @returns {Promise<Object>} Raw JSON response
 */
async function fetchFromWeatherAPI(endpoint, queryParams = {}) {
    if (!API_CONFIG.API_KEY) {
        throw new Error('WeatherService: Missing API Key in API_CONFIG');
    }

    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.append('key', API_CONFIG.API_KEY);
    
    for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
        }
    }

    const controller = new AbortController();
    let timeoutId;

    // Utilize strictly the config timeout value, no hardcoded fallbacks
    if (API_CONFIG.REQUEST_TIMEOUT) {
        timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
    }

    try {
        const response = await fetch(url.toString(), {
            signal: controller.signal
        });

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            // Attempt to parse WeatherAPI's specific error payload
            const errorData = await response.json().catch(() => ({}));
            const apiMessage = errorData?.error?.message || response.statusText;
            throw new Error(`WeatherAPI Error: ${apiMessage}`);
        }

        return await response.json();
    } catch (error) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // Normalize network failure and timeout signatures
        if (error.name === 'AbortError') {
            throw new Error('WeatherAPI Error: Request timed out');
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('WeatherAPI Error: Network failure');
        }
        
        throw error;
    }
}

/**
 * Fetches the full weather forecast for a specific city name.
 * 
 * @param {string} city - The city name to query
 * @returns {Promise<Object>} Raw forecast JSON payload
 */
export async function fetchWeatherByCity(city) {
    if (!city || typeof city !== 'string' || !city.trim()) {
        throw new Error('WeatherService: Empty city query provided');
    }

    return await fetchFromWeatherAPI(API_CONFIG.ENDPOINTS.forecast, {
        q: city.trim(),
        days: 7,       // Requires forecast days array
        aqi: 'yes',    // Requires Air Quality indices
        alerts: 'no'   // Astronomy is natively bundled in the forecast response
    });
}

/**
 * Fetches the full weather forecast using geographical coordinates.
 * 
 * @param {number} lat - Latitude coordinate
 * @param {number} lon - Longitude coordinate
 * @returns {Promise<Object>} Raw forecast JSON payload
 */
export async function fetchWeatherByCoordinates(lat, lon) {
    if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
        throw new Error('WeatherService: Invalid coordinates provided');
    }

    return await fetchFromWeatherAPI(API_CONFIG.ENDPOINTS.forecast, {
        q: `${lat},${lon}`,
        days: 7,
        aqi: 'yes',
        alerts: 'no'
    });
}

/**
 * Searches for cities matching a query for autocomplete capabilities.
 * 
 * @param {string} query - The partial or full search string
 * @returns {Promise<Array>} Raw search JSON payload
 */
export async function searchCities(query) {
    if (!query || typeof query !== 'string' || !query.trim()) {
        throw new Error('WeatherService: Empty search query provided');
    }

    return await fetchFromWeatherAPI(API_CONFIG.ENDPOINTS.search, {
        q: query.trim()
    });
}
