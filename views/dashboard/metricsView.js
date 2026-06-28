/**
 * Aether Weather - Metrics View
 * Renders the horizontal metrics strip with detailed weather values.
 */

function setText(element, text) {
    if (element) element.textContent = text;
}

const DOM = {
    feelsLike: document.getElementById('metric-feels-like'),
    humidity: document.getElementById('metric-humidity'),
    wind: document.getElementById('metric-wind'),
    pressure: document.getElementById('metric-pressure'),
    visibility: document.getElementById('metric-visibility'),
    cloudCover: document.getElementById('metric-cloud-cover'),
    dewPoint: document.getElementById('metric-dew-point'),
    uv: document.getElementById('metric-uv'),
    sunrise: document.getElementById('metric-sunrise'),
    sunset: document.getElementById('metric-sunset'),
    moonPhase: document.getElementById('metric-moon-phase')
};

export function renderMetricsStrip(current, astronomy) {
    setText(DOM.feelsLike, Number.isFinite(current.feelsLike) ? `${Math.round(current.feelsLike)}°` : '--°');
    setText(DOM.humidity, Number.isFinite(current.humidity) ? `${current.humidity}%` : '--%');
    setText(DOM.wind, Number.isFinite(current.windSpeed) ? `${Math.round(current.windSpeed)} km/h` : '-- km/h');
    setText(DOM.pressure, Number.isFinite(current.pressure) ? `${current.pressure} hPa` : '-- hPa');
    setText(DOM.visibility, Number.isFinite(current.visibility) ? `${current.visibility} km` : '-- km');
    setText(DOM.cloudCover, Number.isFinite(current.cloudCover) ? `${current.cloudCover}%` : '--%');
    setText(DOM.dewPoint, Number.isFinite(current.dewPoint) ? `${Math.round(current.dewPoint)}°` : '--°');
    setText(DOM.uv, Number.isFinite(current.uv) ? `${current.uv} UV` : '-- UV');

    setText(DOM.sunrise, astronomy.sunrise || '--:--');
    setText(DOM.sunset, astronomy.sunset || '--:--');
    setText(DOM.moonPhase, astronomy.moonPhase || '--');
}
