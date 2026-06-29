/**
 * Aether Weather - Theme Controller
 * Phase 4.6
 */

import { store } from '../data/store.js';

const DOM = {
    layer1: document.getElementById('bg-layer-1'),
    layer2: document.getElementById('bg-layer-2')
};

let currentThemeState = null;
let transitionId = 0;
let activeLayer = 1;
let currentDeviceCategory = getDeviceCategory();

function getDeviceCategory() {
    return window.innerWidth <= 768 ? 'Mobile' : 'Desktop';
}

function handleStateChange(state) {
    if (state.weatherState && state.weatherState !== currentThemeState) {
        updateTheme(state.weatherState);
    }
}

function updateTheme(weatherState) {
    if (!DOM.layer1 || !DOM.layer2) {
        console.warn('ThemeController: Background layers missing from DOM');
        return;
    }
    
    const currentId = ++transitionId;
    
    // Determine responsive asset path
    const folder = currentDeviceCategory === 'Mobile' ? 'mobile/' : '';
    const imageUrl = `assets/Background/${folder}${weatherState}.webp`;
    
    // Preload image
    const img = new Image();
    img.onload = () => {
        // Race protection: discard if a newer transition has started
        if (currentId !== transitionId) return;

        // Determine which layer is inactive and buffer the new image
        const bufferLayer = activeLayer === 1 ? DOM.layer2 : DOM.layer1;
        const currentActiveLayer = activeLayer === 1 ? DOM.layer1 : DOM.layer2;

        bufferLayer.style.backgroundImage = `url('${imageUrl}')`;
        
        // Force reflow to ensure the CSS transition fires smoothly
        void bufferLayer.offsetWidth;
        
        // Crossfade
        bufferLayer.classList.add('active');
        currentActiveLayer.classList.remove('active');
        
        // Swap active layer tracker
        activeLayer = activeLayer === 1 ? 2 : 1;
        
        // Update state to the successfully applied theme
        currentThemeState = weatherState;
        
        // Update data attribute for CSS variable bindings
        document.documentElement.setAttribute('data-theme', weatherState);
    };
    
    // Fallback if image fails to load
    img.onerror = () => {
        if (currentId === transitionId) {
            console.warn(`ThemeController: Failed to load background ${imageUrl}`);
        }
    };
    
    img.src = imageUrl;
}

export function initThemeController() {
    // Check DOM requirements
    if (!DOM.layer1 || !DOM.layer2) {
        console.warn('ThemeController: Background layers missing from DOM');
        return;
    }
    
    store.subscribe(handleStateChange);
    
    // Phase R1: Responsive background switching on category change
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newCategory = getDeviceCategory();
            if (newCategory !== currentDeviceCategory) {
                currentDeviceCategory = newCategory;
                if (currentThemeState) {
                    updateTheme(currentThemeState);
                }
            }
        }, 150);
    });
}
