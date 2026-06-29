/**
 * Aether Weather - Search Controller
 * 
 * Lightweight orchestrator for the search subsystem.
 * Coordinates between the search dropdown view, weather service,
 * geolocation service, and storage service.
 * 
 * Does not contain DOM creation, browser API calls, or
 * localStorage access directly.
 */

import { store } from '../data/store.js';
import { fetchWeatherByCity, fetchWeatherByCoordinates, searchCities } from '../services/weatherService.js';
import { normalizeWeatherPayload } from '../services/normalizationService.js';
import { getCurrentPosition, queryGeoPermission } from '../services/geoService.js';
import { getLastCity, setLastCity, getGeoPreference, setGeoPreference } from '../services/storageService.js';
import {
    renderDropdown,
    closeDropdown,
    moveHighlight,
    getHighlightedResult,
    isOpen,
    setOriginalQuery,
    restoreOriginalQuery
} from '../views/search/searchDropdownView.js';

// ============================================================
// DOM CACHE
// ============================================================
const DOM = {
    searchInput: document.getElementById('search-input'),
    searchContainer: document.getElementById('search-container')
};

// ============================================================
// CONTROLLER STATE
// ============================================================
let debounceTimeout = null;
let isFetching = false;

// ============================================================
// SEARCH INPUT HANDLERS
// ============================================================
function handleSearchInput(event) {
    const query = event.target.value.trim();
    setOriginalQuery(event.target.value);

    if (!query) {
        closeDropdown(DOM.searchInput);
        return;
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
        try {
            const results = await searchCities(query);
            renderDropdown(results, DOM.searchContainer, DOM.searchInput, selectCity);
        } catch (error) {
            console.warn('Autocomplete fetch failed:', error);
            closeDropdown(DOM.searchInput);
        }
    }, 500);
}

function handleSearchKeydown(event) {
    if (!isOpen()) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const query = event.target.value.trim();
            if (query) {
                closeDropdown(DOM.searchInput);
                selectCity(query);
            }
        }
        return;
    }

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            moveHighlight('down', DOM.searchInput);
            break;
        case 'ArrowUp':
            event.preventDefault();
            moveHighlight('up', DOM.searchInput);
            break;
        case 'Enter':
            event.preventDefault();
            const highlighted = getHighlightedResult();
            if (highlighted) {
                closeDropdown(DOM.searchInput);
                selectCity(highlighted.name);
            } else {
                const query = event.target.value.trim();
                if (query) {
                    closeDropdown(DOM.searchInput);
                    selectCity(query);
                }
            }
            break;
        case 'Escape':
            event.preventDefault();
            closeDropdown(DOM.searchInput);
            restoreOriginalQuery(DOM.searchInput);
            break;
    }
}

// ============================================================
// CITY SELECTION (API Orchestration)
// ============================================================
export async function selectCity(cityString) {
    if (isFetching) return;
    if (!cityString) return;

    isFetching = true;

    if (DOM.searchInput) {
        DOM.searchInput.disabled = true;
    }

    store.setState({ loading: true, error: null });

    try {
        const rawData = await fetchWeatherByCity(cityString);
        const normalizedData = normalizeWeatherPayload(rawData);
        setLastCity(cityString);
        store.setState({ ...normalizedData, loading: false });
    } catch (error) {
        console.error('Weather fetch failed:', error);
        store.setState({ loading: false, error: error.message });
    } finally {
        isFetching = false;
        if (DOM.searchInput) {
            DOM.searchInput.disabled = false;
            DOM.searchInput.value = '';
        }
    }
}

// ============================================================
// GEOLOCATION FLOW
// ============================================================
export async function fetchCurrentLocation() {
    if (isFetching) return;

    isFetching = true;
    if (DOM.searchInput) DOM.searchInput.disabled = true;
    store.setState({ loading: true, error: null });

    try {
        const { latitude, longitude } = await getCurrentPosition({ timeout: 10000 });
        const rawData = await fetchWeatherByCoordinates(latitude, longitude);
        const normalizedData = normalizeWeatherPayload(rawData);

        // Save the location string as lastCity so it restores nicely if geolocation is unavailable later
        if (normalizedData.location && normalizedData.location.city) {
            setLastCity(normalizedData.location.city);
        }

        store.setState({ ...normalizedData, loading: false });
    } catch (error) {
        console.warn('Geolocation failed or timed out:', error);
        store.setState({
            error: 'Unable to determine your location. Showing your saved city instead.',
            loading: false
        });

        const lastCity = getLastCity();
        // Delay slightly to let the error toast be seen, then fallback
        setTimeout(() => {
            isFetching = false;
            selectCity(lastCity);
        }, 100);
    } finally {
        if (!store.getState().error) {
            isFetching = false;
        }
        if (DOM.searchInput) DOM.searchInput.disabled = false;
    }
}

// ============================================================
// INITIALIZATION
// ============================================================
export function initSearchController() {
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('input', handleSearchInput);
        DOM.searchInput.addEventListener('keydown', handleSearchKeydown);
    } else {
        console.warn('SearchController: search-input missing from DOM');
    }

    const allowBtn = document.getElementById('geo-allow-btn');
    const skipBtn = document.getElementById('geo-skip-btn');
    const locateBtn = document.getElementById('locate-me-btn');
    const onboarding = document.getElementById('geo-onboarding');

    if (allowBtn) {
        allowBtn.addEventListener('click', () => {
            setGeoPreference('accepted');
            if (onboarding) {
                onboarding.classList.add('onboarding-exit');
                document.body.classList.remove('onboarding-mode');
                setTimeout(() => onboarding.classList.add('hidden'), 300);
            }
            if (DOM.searchInput) DOM.searchInput.focus();
            fetchCurrentLocation();
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            setGeoPreference('declined');
            if (onboarding) {
                onboarding.classList.add('onboarding-exit');
                document.body.classList.remove('onboarding-mode');
                setTimeout(() => onboarding.classList.add('hidden'), 300);
            }
            if (DOM.searchInput) DOM.searchInput.focus();
            selectCity(getLastCity());
        });
    }

    if (locateBtn) {
        locateBtn.addEventListener('click', fetchCurrentLocation);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (isOpen() && DOM.searchContainer && !DOM.searchContainer.contains(e.target)) {
            closeDropdown(DOM.searchInput);
        }
    });
}

// ============================================================
// APP BOOT
// ============================================================
export async function bootApp() {
    const preference = getGeoPreference();
    const lastCity = getLastCity();

    // Fast-path for returning users who previously accepted
    if (preference === 'accepted') {
        const permissionState = await queryGeoPermission();
        if (permissionState === 'granted') {
            fetchCurrentLocation();
            return;
        }
        // Fallback if permissions lost or errored
        selectCity(lastCity);
    } else if (preference === 'declined') {
        // Declined preference -> Load last city immediately
        selectCity(lastCity);
    } else {
        // No preference -> Show onboarding. Do NOT load any weather.
        const onboarding = document.getElementById('geo-onboarding');
        const allowBtn = document.getElementById('geo-allow-btn');
        if (onboarding) {
            document.body.classList.add('onboarding-mode');
            onboarding.classList.remove('hidden');
            if (allowBtn) allowBtn.focus();
        }
    }
}
