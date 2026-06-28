/**
 * Aether Weather - Hourly Forecast View
 * Renders the hourly timeline strip with weather icons and metric values.
 */

const DOM = {
    container: document.getElementById('hourly-forecast-container')
};

export function renderHourlyTimeline(hourlyData, selectedMetric = 'temp') {
    // Sync toggle active states
    const toggleBtns = document.querySelectorAll('#hourly-metric-toggles .toggle-btn');
    toggleBtns.forEach(btn => {
        if (btn.getAttribute('data-metric') === selectedMetric) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (!DOM.container) return;
    DOM.container.innerHTML = '';

    hourlyData.forEach(hour => {
        const item = document.createElement('div');
        item.className = 'hourly-item';

        let valueText = '--';
        let iconName = hour.icon || 'cloud';
        let iconColor = 'text-on-surface-variant';

        if (selectedMetric === 'temp') {
            valueText = Number.isFinite(hour.temperature) ? `${Math.round(hour.temperature)}°` : '--°';
            iconColor = 'text-on-surface-variant';
        } else if (selectedMetric === 'precipitation') {
            valueText = Number.isFinite(hour.rainChance) ? `${hour.rainChance}%` : '--%';
            iconName = 'water_drop';
            iconColor = 'text-tertiary';
        } else if (selectedMetric === 'wind') {
            valueText = Number.isFinite(hour.windSpeed) ? `${Math.round(hour.windSpeed)} km/h` : '-- km/h';
            iconName = 'air';
            iconColor = 'text-secondary';
        }

        let timeLabel = hour.time || '--:--';
        if (timeLabel.includes(':')) {
            const [h] = timeLabel.split(':');
            const dateObj = new Date();
            dateObj.setHours(parseInt(h, 10), 0, 0);
            if (!isNaN(dateObj.getTime())) {
                timeLabel = dateObj.toLocaleTimeString('en-US', { hour: 'numeric' });
            }
        }

        item.innerHTML = `
            <span class="material-symbols-outlined ${iconColor}" style="font-size: 20px; font-variation-settings: 'FILL' 1;">${iconName}</span>
            <span class="text-data-point" style="font-size: 12px;">${valueText}</span>
            <span class="text-label-caps text-on-surface-variant" style="font-size: 10px; margin-top: 0.5rem;">${timeLabel}</span>
        `;
        DOM.container.appendChild(item);
    });
}
