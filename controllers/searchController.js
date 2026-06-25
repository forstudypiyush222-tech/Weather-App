/**
 * Aether Weather - Search Controller
 * Phase 4.6
 */

import { store } from '../data/store.js';
import { fetchWeatherByCity, fetchWeatherByCoordinates, searchCities } from '../services/weatherService.js';
import { normalizeWeatherPayload } from '../services/normalizationService.js';

const DOM = {
    searchInput: document.getElementById('search-input'),
    searchContainer: document.getElementById('search-container')
};

let debounceTimeout = null;
let isFetching = false;
let autocompleteDropdown = null;

function handleSearchInput(event) {
    const query = event.target.value.trim();
    
    if (!query) {
        closeDropdown();
        return;
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
        try {
            const results = await searchCities(query);
            renderDropdown(results);
        } catch (error) {
            console.warn('Autocomplete fetch failed:', error);
            closeDropdown();
        }
    }, 500);
}

function handleSearchSubmit(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
            closeDropdown();
            selectCity(query);
        }
    }
}

function renderDropdown(results) {
    closeDropdown(); 
    if (!results || results.length === 0) return;
    if (!DOM.searchContainer) return;

    autocompleteDropdown = document.createElement('div');
    autocompleteDropdown.className = 'glass-panel custom-scrollbar search-dropdown';

    results.forEach(city => {
        const item = document.createElement('div');
        item.className = 'search-dropdown-item';
        item.textContent = `${city.name}, ${city.country}`;
        
        item.addEventListener('click', () => {
            closeDropdown();
            selectCity(city.name);
        });
        
        autocompleteDropdown.appendChild(item);
    });

    DOM.searchContainer.appendChild(autocompleteDropdown);
}

function closeDropdown() {
    if (autocompleteDropdown) {
        autocompleteDropdown.remove();
        autocompleteDropdown = null;
    }
}

document.addEventListener('click', (e) => {
    if (autocompleteDropdown && DOM.searchContainer && !DOM.searchContainer.contains(e.target)) {
        closeDropdown();
    }
});

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
        localStorage.setItem('lastCity', cityString);
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

export function initSearchController() {
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('input', handleSearchInput);
        DOM.searchInput.addEventListener('keypress', handleSearchSubmit);
    } else {
        console.warn('SearchController: search-input missing from DOM');
    }

    const allowBtn = document.getElementById('geo-allow-btn');
    const skipBtn = document.getElementById('geo-skip-btn');
    const locateBtn = document.getElementById('locate-me-btn');
    const onboarding = document.getElementById('geo-onboarding');

    if (allowBtn) {
        allowBtn.addEventListener('click', () => {
            localStorage.setItem('aether_geo_preference', 'accepted');
            if (onboarding) {
                onboarding.classList.add('onboarding-exit');
                document.body.classList.remove('onboarding-mode');
                setTimeout(() => onboarding.classList.add('hidden'), 300);
            }
            fetchCurrentLocation();
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            localStorage.setItem('aether_geo_preference', 'declined');
            if (onboarding) {
                onboarding.classList.add('onboarding-exit');
                document.body.classList.remove('onboarding-mode');
                setTimeout(() => onboarding.classList.add('hidden'), 300);
            }
            selectCity(localStorage.getItem('lastCity') || 'London');
        });
    }

    if (locateBtn) {
        locateBtn.addEventListener('click', fetchCurrentLocation);
    }
}

export async function fetchCurrentLocation() {
    if (isFetching) return;
    
    isFetching = true;
    if (DOM.searchInput) DOM.searchInput.disabled = true;
    store.setState({ loading: true, error: null });

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });

        const { latitude, longitude } = position.coords;
        const rawData = await fetchWeatherByCoordinates(latitude, longitude);
        const normalizedData = normalizeWeatherPayload(rawData);
        
        // Save the location string as lastCity so it restores nicely if geolocation is unavailable later
        if (normalizedData.location && normalizedData.location.city) {
            localStorage.setItem('lastCity', normalizedData.location.city);
        }
        
        store.setState({ ...normalizedData, loading: false });
    } catch (error) {
        console.warn('Geolocation failed or timed out:', error);
        store.setState({ 
            error: 'Unable to determine your location. Showing your saved city instead.',
            loading: false 
        });
        
        const lastCity = localStorage.getItem('lastCity') || 'London';
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

export async function bootApp() {
    const preference = localStorage.getItem('aether_geo_preference');
    const lastCity = localStorage.getItem('lastCity') || 'London';

    // Fast-path for returning users who previously accepted
    if (preference === 'accepted') {
        try {
            const status = await navigator.permissions.query({ name: 'geolocation' });
            if (status.state === 'granted') {
                fetchCurrentLocation();
                return;
            }
        } catch(e) {
            console.warn('Permissions query failed', e);
        }
        // Fallback if permissions lost or errored
        selectCity(lastCity);
    } else if (preference === 'declined') {
        // Declined preference -> Load last city immediately
        selectCity(lastCity);
    } else {
        // No preference -> Show onboarding. Do NOT load any weather.
        const onboarding = document.getElementById('geo-onboarding');
        if (onboarding) {
            document.body.classList.add('onboarding-mode');
            onboarding.classList.remove('hidden');
        }
    }
}
