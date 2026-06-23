/**
 * Aether Weather - Search Controller
 * Phase 4.6
 */

import { store } from '../data/store.js';
import { fetchWeatherByCity, searchCities } from '../services/weatherService.js';
import { normalizeWeatherPayload } from '../services/normalizationService.js';

const DOM = {
    searchInput: document.getElementById('search-input'),
    searchContainer: document.getElementById('search-input')?.closest('button')
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
    autocompleteDropdown.className = 'glass-panel custom-scrollbar';
    autocompleteDropdown.style.position = 'absolute';
    autocompleteDropdown.style.top = '100%';
    autocompleteDropdown.style.left = '0';
    autocompleteDropdown.style.right = '0';
    autocompleteDropdown.style.zIndex = '100';
    autocompleteDropdown.style.marginTop = '0.5rem';
    autocompleteDropdown.style.maxHeight = '200px';
    autocompleteDropdown.style.overflowY = 'auto';
    autocompleteDropdown.style.display = 'flex';
    autocompleteDropdown.style.flexDirection = 'column';
    autocompleteDropdown.style.padding = '0.5rem 0';
    
    DOM.searchContainer.style.position = 'relative';

    results.forEach(city => {
        const item = document.createElement('div');
        item.style.padding = '0.75rem 1rem';
        item.style.cursor = 'pointer';
        item.style.color = 'var(--color-on-surface)';
        item.style.fontSize = '14px';
        item.textContent = `${city.name}, ${city.country}`;
        
        item.addEventListener('mouseenter', () => item.style.backgroundColor = 'rgba(255,255,255,0.1)');
        item.addEventListener('mouseleave', () => item.style.backgroundColor = 'transparent');
        
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
}
