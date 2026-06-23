/**
 * Aether Weather - Central Application Store
 * Phase 4.2
 * 
 * Simple Vanilla JS reactive store pattern utilizing factory functions and closures.
 * Acts as the single source of truth for the Aether dashboard.
 */

const createStore = () => {
    // Definitive Aether State Shape
    const initialState = {
        location: {
            city: null, // Canonical city name returned by the WeatherAPI
            region: null,
            country: null,
            timezone: null,
            localTime: null,
            localDate: null
        },
        current: {
            temperature: null,
            feelsLike: null,
            condition: null,
            conditionCode: null,
            humidity: null,
            pressure: null,
            visibility: null,
            windSpeed: null,
            windDirection: null,
            cloudCover: null,
            uv: null,
            dewPoint: null
        },
        hourly: [], // Array of normalized hourly objects
        daily: [],  // Array of normalized daily objects
        airQuality: {
            aqiScore: null,
            aqiStatus: null,
            mainPollutant: null,
            healthAdvisory: null
        },
        astronomy: {
            sunrise: null,
            sunset: null,
            moonPhase: null,
            moonIllumination: null
        },
        weatherState: null, // Canonical state from weatherStateEngine.js
        ui: {
            selectedCity: null, // ONLY holds the user's raw search input string before validation
            selectedHourlyMetric: 'temp',
            sidebarOpen: false,
            searchOpen: false
        },
        loading: false,
        error: null
    };

    // Internal encapsulated state
    let state = JSON.parse(JSON.stringify(initialState));
    
    // Set of subscriber callbacks
    const subscribers = new Set();

    /**
     * Helper utility for safe, immutable deep merging.
     * Prevents nested object mutation.
     */
    const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);
    
    const mergeDeep = (target, source) => {
        let output = { ...target };
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    } else {
                        output[key] = mergeDeep(target[key], source[key]);
                    }
                } else {
                    // For arrays and primitives, directly assign (overwrite)
                    output[key] = source[key];
                }
            });
        }
        return output;
    };

    return {
        /**
         * Returns a safe, readonly, deeply cloned copy of the current state.
         * Prevents external consumers from mutating state directly.
         * 
         * @returns {Object} The complete application state
         */
        getState: () => {
            return JSON.parse(JSON.stringify(state));
        },

        /**
         * Updates state immutably and notifies all subscribers.
         * Performs a deep merge against existing state.
         * 
         * @param {Object} partialState - The state partial to merge
         */
        setState: (partialState) => {
            if (!isObject(partialState)) return;
            
            // Sever incoming references (arrays/objects) to prevent external mutation leaks
            const safePartial = JSON.parse(JSON.stringify(partialState));
            
            state = mergeDeep(state, safePartial);
            
            // Notify subscribers with the updated immutable clone
            const immutableState = JSON.parse(JSON.stringify(state));
            subscribers.forEach(callback => callback(immutableState));
        },

        /**
         * Subscribe to state changes.
         * 
         * @example
         * // CORRECT: Store and execute the returned cleanup function
         * const unsubscribe = store.subscribe(handler);
         * unsubscribe(); 
         * 
         * // INCORRECT: Cannot be unsubscribed, causes memory leak
         * store.subscribe(() => { ... });
         * 
         * @param {Function} callback - Function executed on state change
         * @returns {Function} An unsubscribe cleanup function
         */
        subscribe: (callback) => {
            subscribers.add(callback);
            return () => {
                subscribers.delete(callback);
            };
        },

        /**
         * Unsubscribe from state changes manually.
         * 
         * @param {Function} callback - The callback to remove
         */
        unsubscribe: (callback) => {
            subscribers.delete(callback);
        },

        /**
         * Resets state back to the initial shape and notifies subscribers.
         */
        reset: () => {
            state = JSON.parse(JSON.stringify(initialState));
            const immutableState = JSON.parse(JSON.stringify(state));
            subscribers.forEach(callback => callback(immutableState));
        }
    };
};

// Export a single singleton instance of the store
export const store = createStore();
