/**
 * Aether Weather - Summary View
 * Renders today's summary card: condition, high/low temps, rain, wind, UV.
 */

function setText(element, text) {
    if (element) element.textContent = text;
}

function setIcon(element, iconName) {
    if (element) element.textContent = iconName;
}

function getUVClassification(uv) {
    if (!Number.isFinite(uv)) return '--';
    if (uv <= 2) return `${uv} Low`;
    if (uv <= 5) return `${uv} Moderate`;
    if (uv <= 7) return `${uv} High`;
    if (uv <= 10) return `${uv} Very High`;
    return `${uv} Extreme`;
}

const DOM = {
    icon: document.getElementById('summary-icon'),
    condition: document.getElementById('summary-condition'),
    secondary: document.getElementById('summary-secondary-text'),
    maxTemp: document.getElementById('summary-max-temp'),
    minTemp: document.getElementById('summary-min-temp'),
    rain: document.getElementById('summary-rain'),
    wind: document.getElementById('summary-wind'),
    uv: document.getElementById('summary-uv')
};

export function renderSummary(todayDaily, current) {
    setIcon(DOM.icon, current.icon || 'cloud');
    setText(DOM.condition, current.condition || '--');

    const max = todayDaily?.maxTemp;
    const min = todayDaily?.minTemp;
    const rainProb = todayDaily?.rainChance;

    setText(DOM.maxTemp, Number.isFinite(max) ? `${Math.round(max)}°` : '--°');
    setText(DOM.minTemp, Number.isFinite(min) ? `${Math.round(min)}°` : '--°');
    setText(DOM.rain, Number.isFinite(rainProb) ? `${rainProb}%` : '--%');

    setText(DOM.wind, Number.isFinite(current.windSpeed) ? `${Math.round(current.windSpeed)} km/h` : '-- km/h');
    setText(DOM.uv, getUVClassification(current.uv));

    setText(DOM.secondary, 'Current Conditions');
}
