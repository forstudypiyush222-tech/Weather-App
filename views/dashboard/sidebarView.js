/**
 * Aether Weather - Sidebar View
 * Renders the sidebar location card: city, region, local time, and current conditions.
 */

import { setText, setIcon } from '../../utils/domHelpers.js';

const DOM = {
    city: document.getElementById('sidebar-city'),
    region: document.getElementById('sidebar-region'),
    time: document.getElementById('sidebar-time'),
    date: document.getElementById('sidebar-date'),
    icon: document.getElementById('sidebar-weather-icon'),
    temp: document.getElementById('sidebar-temperature'),
    condition: document.getElementById('sidebar-condition')
};

export function renderSidebar(current, location) {
    setText(DOM.city, location.city || '--');
    setText(DOM.region, `${location.region || '--'}, ${location.country || '--'}`);

    if (location.localTime && location.localDate) {
        // Normalization returns localDate (YYYY-MM-DD) and localTime (HH:MM)
        // Combine them into a safe standard string to parse
        const dt = new Date(`${location.localDate}T${location.localTime}`);
        if (!isNaN(dt.getTime())) {
            setText(DOM.time, dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
            setText(DOM.date, dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        } else {
            setText(DOM.time, location.localTime);
            setText(DOM.date, location.localDate);
        }
    } else {
        setText(DOM.time, '--:--');
        setText(DOM.date, '--');
    }

    setText(DOM.temp, Number.isFinite(current.temperature) ? `${Math.round(current.temperature)}°` : '--°');
    setText(DOM.condition, current.condition || '--');
    setIcon(DOM.icon, current.icon || 'cloud');
}
