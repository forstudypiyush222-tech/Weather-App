/**
 * Aether Weather - AQI View
 * Renders the Air Quality Index gauge, score, status, and health advisory.
 */

import { setText } from '../../utils/domHelpers.js';

const DOM = {
    gaugeFill: document.getElementById('aqi-gauge-fill'),
    score: document.getElementById('aqi-score'),
    status: document.getElementById('aqi-status'),
    mainPollutant: document.getElementById('aqi-main-pollutant'),
    healthAdvisory: document.getElementById('aqi-health-advisory')
};

export function renderAQI(airQuality) {
    const score = airQuality.aqiScore;
    setText(DOM.score, Number.isFinite(score) ? score : '--');

    if (DOM.status) {
        const status = airQuality.aqiStatus || 'Unknown';
        DOM.status.textContent = status;

        let colorClass = 'text-success';
        if (score > 50) colorClass = 'text-warning';
        if (score > 100) colorClass = 'text-error';

        DOM.status.className = `text-headline-md ${colorClass}`;
    }

    setText(DOM.mainPollutant, `Main Pollutant: ${airQuality.mainPollutant || '--'}`);
    setText(DOM.healthAdvisory, airQuality.healthAdvisory || 'No advisory data available.');

    if (DOM.gaugeFill) {
        const maxScore = 300;
        const boundedScore = Math.min(Number.isFinite(score) ? score : 0, maxScore);
        const ratio = boundedScore / maxScore;
        const offset = 276.46 - (276.46 * ratio);
        DOM.gaugeFill.style.strokeDashoffset = offset;
    }
}
