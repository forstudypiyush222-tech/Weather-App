/**
 * Aether Weather - Theme Controller
 * Phase 4.6
 */

import { store } from '../data/store.js';

const DOM = {
    backgroundContainer: document.getElementById('dashboard-background')
};

let currentThemeState = null;

function handleStateChange(state) {
    if (state.weatherState && state.weatherState !== currentThemeState) {
        updateTheme(state.weatherState);
    }
}

function updateTheme(weatherState) {
    if (!DOM.backgroundContainer) {
        console.warn('ThemeController: #dashboard-background missing from DOM');
        return;
    }
    
    // Background swapping using inline style
    DOM.backgroundContainer.style.backgroundImage = `url('assets/Background/${weatherState}.webp')`;
    
    // Update data attribute for CSS variable bindings
    document.documentElement.setAttribute('data-theme', weatherState);
    
    currentThemeState = weatherState;
}

export function initThemeController() {
    store.subscribe(handleStateChange);
}
