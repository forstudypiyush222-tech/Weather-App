/**
 * Aether Weather - Dashboard Controller
 * 
 * Lightweight orchestrator that subscribes to the store and
 * coordinates view rendering and chart updates. Contains no
 * view-specific rendering logic or chart implementation details.
 */

import { store } from '../data/store.js';

// View imports
import { renderHero } from '../views/dashboard/heroView.js';
import { renderSidebar } from '../views/dashboard/sidebarView.js';
import { renderSummary } from '../views/dashboard/summaryView.js';
import { renderHourlyTimeline } from '../views/dashboard/hourlyForecastView.js';
import { renderDailyForecast } from '../views/dashboard/dailyForecastView.js';
import { renderAQI } from '../views/dashboard/aqiView.js';
import { renderMetricsStrip } from '../views/dashboard/metricsView.js';

// Chart imports
import { updateHourlyChart, resizeHourlyChart } from '../charts/hourlyChart.js';

// ============================================================
// TOAST SYSTEM
// ============================================================
let currentToastTimeout = null;
let currentToastElement = null;

function showErrorToast(errorMessage) {
    const container = document.getElementById('toast-container');
    if (!container || !errorMessage) return;

    if (currentToastElement) {
        currentToastElement.remove();
        if (currentToastTimeout) clearTimeout(currentToastTimeout);
    }

    const toast = document.createElement('div');
    toast.className = 'glass-panel toast-message text-on-surface';
    toast.style.borderLeft = '4px solid var(--color-error)';
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <span class="material-symbols-outlined text-error" style="font-size: 24px;">error</span>
        <div class="flex-col">
            <span class="text-label-caps text-error">Error</span>
            <span class="text-body-md">${errorMessage}</span>
        </div>
    `;

    container.appendChild(toast);
    currentToastElement = toast;

    currentToastTimeout = setTimeout(() => {
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', () => {
            toast.remove();
            if (currentToastElement === toast) {
                currentToastElement = null;
            }
            store.setState({ error: null });
        });
    }, 5000);
}

// ============================================================
// STATE CHANGE HANDLER
// ============================================================
function handleStateChange(state) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        if (state.loading) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }

    if (state.loading) return;
    
    if (state.error) {
        showErrorToast(state.error);
    }
    
    if (state.current && state.location) {
        renderHero(state.current, state.location, state.daily?.[0]);
        renderSidebar(state.current, state.location);
    }
    
    if (state.hourly && state.ui) {
        renderHourlyTimeline(state.hourly, state.ui.selectedHourlyMetric);
        updateHourlyChart(state.hourly, state.ui.selectedHourlyMetric);
    }
    
    if (state.daily && state.daily.length > 0) {
        renderDailyForecast(state.daily);
        renderSummary(state.daily[0], state.current);
    }
    
    if (state.airQuality) {
        renderAQI(state.airQuality);
    }
    
    if (state.current && state.astronomy) {
        renderMetricsStrip(state.current, state.astronomy);
    }
}

// ============================================================
// INITIALIZATION
// ============================================================
export function initDashboardController() {
    const toggleContainer = document.getElementById('hourly-metric-toggles');
    if (toggleContainer) {
        toggleContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.toggle-btn');
            if (!btn) return;
            const metric = btn.getAttribute('data-metric');
            const currentState = store.getState();
            if (currentState.ui.selectedHourlyMetric !== metric) {
                store.setState({ 
                    ...currentState, 
                    ui: { ...currentState.ui, selectedHourlyMetric: metric } 
                });
            }
        });
    }

    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.addEventListener('transitionend', (e) => {
            // Only react to the main layout transition
            if (e.propertyName === 'width' || e.propertyName === 'max-width' || e.propertyName === 'min-width' || e.propertyName === 'flex-basis') {
                resizeHourlyChart();
            }
        });
    }

    store.subscribe(handleStateChange);
}
