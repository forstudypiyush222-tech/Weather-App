/**
 * Aether Weather - Hero View
 * Renders the main hero section: temperature, condition, location, and mini-cards.
 */

import { setText, setIcon } from '../../utils/domHelpers.js';

const DOM = {
    temperature: document.getElementById('hero-temperature'),
    feelsLike: document.getElementById('hero-feels-like'),
    condition: document.getElementById('hero-condition'),
    location: document.getElementById('hero-location'),
    maxTemp: document.getElementById('hero-max-temp'),
    minTemp: document.getElementById('hero-min-temp'),
    rainProb: document.getElementById('hero-rain-probability'),
    wind: document.getElementById('hero-wind'),
    icon: document.getElementById('hero-weather-icon')
};

export function renderHero(current, location, todayDaily) {
    setText(DOM.temperature, Number.isFinite(current.temperature) ? `${Math.round(current.temperature)}°` : '--°');
    setText(DOM.feelsLike, Number.isFinite(current.feelsLike) ? `${Math.round(current.feelsLike)}°` : '--°');
    setText(DOM.condition, current.condition || '--');

    const city = location.city || '--';
    const region = location.region || '--';
    const country = location.country || '--';
    setText(DOM.location, `${city}, ${region}, ${country}`);

    setIcon(DOM.icon, current.icon || 'cloud');

    if (todayDaily) {
        setText(DOM.maxTemp, Number.isFinite(todayDaily.maxTemp) ? `${Math.round(todayDaily.maxTemp)}°` : '--°');
        setText(DOM.minTemp, Number.isFinite(todayDaily.minTemp) ? `${Math.round(todayDaily.minTemp)}°` : '--°');
        setText(DOM.rainProb, Number.isFinite(todayDaily.rainChance) ? `${todayDaily.rainChance}%` : '--%');
    }
    setText(DOM.wind, Number.isFinite(current.windSpeed) ? `${Math.round(current.windSpeed)} km/h` : '-- km/h');
}
