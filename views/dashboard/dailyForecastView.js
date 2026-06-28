/**
 * Aether Weather - Daily Forecast View
 * Renders the 7-day forecast card strip.
 */

const DOM = {
    container: document.getElementById('daily-forecast-container')
};

export function renderDailyForecast(dailyData) {
    if (!DOM.container) return;
    DOM.container.innerHTML = '';

    dailyData.forEach(day => {
        const card = document.createElement('div');
        card.className = 'daily-card';

        const dayLabel = day.day || day.date || '--';
        const maxTempText = Number.isFinite(day.maxTemp) ? `${Math.round(day.maxTemp)}°` : '--°';
        const minTempText = Number.isFinite(day.minTemp) ? `${Math.round(day.minTemp)}°` : '--°';
        const rainChanceText = Number.isFinite(day.rainChance) ? `${day.rainChance}%` : '--%';

        card.innerHTML = `
            <span class="text-label-caps text-on-surface-variant">${dayLabel}</span>
            <div class="daily-icon-box">
                <span class="material-symbols-outlined text-on-surface-variant" style="font-variation-settings: 'FILL' 1;">${day.icon || 'cloud'}</span>
            </div>
            <div class="flex-col align-center">
                <span class="text-data-point" style="font-size: 14px;">${maxTempText}</span>
                <span class="text-data-point text-on-surface-variant" style="font-size: 14px;">${minTempText}</span>
            </div>
            <div style="margin-top: auto; padding-top: 0.25rem;">
                <span class="text-data-point text-tertiary" style="font-size: 14px;">${rainChanceText}</span>
            </div>
        `;
        DOM.container.appendChild(card);
    });
}
