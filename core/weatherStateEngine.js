/**
 * Aether Weather - Core Weather State Engine
 * Phase 4.1
 * 
 * Pure functions to map raw WeatherAPI conditions to canonical Aether states.
 * No side effects, no UI rendering, no API calls, no DOM manipulation.
 */

const CANONICAL_STATES = [
    'clear-day',
    'clear-night',
    'partly-cloudy-day',
    'partly-cloudy-night',
    'cloudy-day',
    'cloudy-night',
    'rain',
    'thunderstorm',
    'snow',
    'fog'
];

/**
 * Normalizes a raw WeatherAPI condition text into a canonical Aether state.
 * 
 * @param {string} conditionText - Raw text from WeatherAPI (e.g., "Partly cloudy", "Moderate rain")
 * @param {number} isDay - 1 for day, 0 for night
 * @returns {{ state: string }} The canonical state object
 */
export function normalizeWeatherState(conditionText, isDay) {
    if (!conditionText) return { state: isDay === 0 ? 'cloudy-night' : 'cloudy-day' }; // Safe fallback

    const condition = conditionText.toLowerCase().trim();
    const isNight = isDay === 0;

    // 1. Fog / Mist
    if (condition.includes('fog') || condition.includes('mist')) {
        return { state: 'fog' };
    }

    // 2. Thunderstorm
    if (condition.includes('thunder') || condition.includes('thundery')) {
        return { state: 'thunderstorm' };
    }

    // 3. Snow / Sleet / Freezing / Blizzard / Pellets
    if (condition.includes('snow') || condition.includes('sleet') || 
        condition.includes('ice pellets') || condition.includes('freezing rain') || condition.includes('blizzard') || condition.includes('pellets')) {
        return { state: 'snow' };
    }

    // 4. Rain / Drizzle / Showers
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
        return { state: 'rain' };
    }

    // 5. Partly Cloudy (Evaluated before Cloudy)
    if (condition.includes('partly cloudy')) {
        return { state: isNight ? 'partly-cloudy-night' : 'partly-cloudy-day' };
    }

    // 6. Cloudy / Overcast
    if (condition === 'cloudy' || condition === 'overcast') {
        return { state: isNight ? 'cloudy-night' : 'cloudy-day' };
    }

    // 7. Clear / Sunny
    if (condition.includes('clear') || condition.includes('sunny')) {
        return { state: isNight ? 'clear-night' : 'clear-day' };
    }

    // 8. Unknown fallback
    return { state: isNight ? 'cloudy-night' : 'cloudy-day' };
}

/**
 * Checks if a given state is a valid canonical Aether state.
 * 
 * @param {string} state - The state string to check
 * @returns {boolean}
 */
export function isValidWeatherState(state) {
    return CANONICAL_STATES.includes(state);
}

/**
 * Returns a new array of all supported canonical Aether states.
 * 
 * @returns {string[]}
 */
export function getSupportedWeatherStates() {
    return [...CANONICAL_STATES];
}

/*
// ==========================================
// INTERNAL TEST CASES
// ==========================================
// Sunny
console.assert(normalizeWeatherState('Sunny', 1).state === 'clear-day', 'Sunny -> clear-day');
// Clear
console.assert(normalizeWeatherState('Clear', 0).state === 'clear-night', 'Clear -> clear-night');
// Partly cloudy
console.assert(normalizeWeatherState('Partly cloudy', 1).state === 'partly-cloudy-day', 'Partly cloudy -> partly-cloudy-day');
console.assert(normalizeWeatherState('Partly cloudy', 0).state === 'partly-cloudy-night', 'Partly cloudy -> partly-cloudy-night');
// Cloudy
console.assert(normalizeWeatherState('Cloudy', 1).state === 'cloudy-day', 'Cloudy -> cloudy-day');
// Overcast
console.assert(normalizeWeatherState('Overcast', 0).state === 'cloudy-night', 'Overcast -> cloudy-night');
// Mist
console.assert(normalizeWeatherState('Mist', 1).state === 'fog', 'Mist -> fog');
// Fog
console.assert(normalizeWeatherState('Freezing fog', 0).state === 'fog', 'Freezing fog -> fog');
// Light rain
console.assert(normalizeWeatherState('Patchy light rain', 1).state === 'rain', 'Patchy light rain -> rain');
// Moderate rain
console.assert(normalizeWeatherState('Moderate rain', 0).state === 'rain', 'Moderate rain -> rain');
// Heavy rain
console.assert(normalizeWeatherState('Heavy rain', 1).state === 'rain', 'Heavy rain -> rain');
// Thunderstorm
console.assert(normalizeWeatherState('Thundery outbreaks possible', 1).state === 'thunderstorm', 'Thundery outbreaks -> thunderstorm');
// Snow
console.assert(normalizeWeatherState('Blowing snow', 0).state === 'snow', 'Blowing snow -> snow');
*/
