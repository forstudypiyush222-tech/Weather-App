/**
 * Aether Weather - Dashboard Controller
 * Phase 4.6.1 (Data Contract Repair)
 */

import { store } from '../data/store.js';

const DOM = {
    // Hero
    heroTemperature: document.getElementById('hero-temperature'),
    heroFeelsLike: document.getElementById('hero-feels-like'),
    heroCondition: document.getElementById('hero-condition'),
    heroLocation: document.getElementById('hero-location'),
    heroMaxTemp: document.getElementById('hero-max-temp'),
    heroMinTemp: document.getElementById('hero-min-temp'),
    heroRainProb: document.getElementById('hero-rain-probability'),
    heroWind: document.getElementById('hero-wind'),
    heroIcon: document.getElementById('hero-weather-icon'),

    // Sidebar
    sidebarCity: document.getElementById('sidebar-city'),
    sidebarRegion: document.getElementById('sidebar-region'),
    sidebarTime: document.getElementById('sidebar-time'),
    sidebarDate: document.getElementById('sidebar-date'),
    sidebarIcon: document.getElementById('sidebar-weather-icon'),
    sidebarTemp: document.getElementById('sidebar-temperature'),
    sidebarCondition: document.getElementById('sidebar-condition'),

    // Summary
    summaryIcon: document.getElementById('summary-icon'),
    summaryCondition: document.getElementById('summary-condition'),
    summarySecondary: document.getElementById('summary-secondary-text'),
    summaryMaxTemp: document.getElementById('summary-max-temp'),
    summaryMinTemp: document.getElementById('summary-min-temp'),

    // Hourly/Daily
    hourlyContainer: document.getElementById('hourly-forecast-container'),
    dailyContainer: document.getElementById('daily-forecast-container'),

    // AQI
    aqiGaugeFill: document.getElementById('aqi-gauge-fill'),
    aqiScore: document.getElementById('aqi-score'),
    aqiStatus: document.getElementById('aqi-status'),
    aqiMainPollutant: document.getElementById('aqi-main-pollutant'),
    aqiHealthAdvisory: document.getElementById('aqi-health-advisory'),

    // Metrics
    metricFeelsLike: document.getElementById('metric-feels-like'),
    metricHumidity: document.getElementById('metric-humidity'),
    metricWind: document.getElementById('metric-wind'),
    metricPressure: document.getElementById('metric-pressure'),
    metricVisibility: document.getElementById('metric-visibility'),
    metricCloudCover: document.getElementById('metric-cloud-cover'),
    metricDewPoint: document.getElementById('metric-dew-point'),
    metricUV: document.getElementById('metric-uv'),
    metricSunrise: document.getElementById('metric-sunrise'),
    metricSunset: document.getElementById('metric-sunset'),
    metricMoonPhase: document.getElementById('metric-moon-phase')
};

function setText(element, text) {
    if (element) element.textContent = text;
}

function setIcon(element, iconName) {
    if (element) element.textContent = iconName;
}

function handleStateChange(state) {
    if (state.loading || state.error) return;
    
    if (state.current && state.location) {
        renderHero(state.current, state.location, state.daily?.[0]);
        renderSidebar(state.current, state.location);
    }
    
    if (state.hourly) {
        renderHourlyForecast(state.hourly);
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

function renderHero(current, location, todayDaily) {
    setText(DOM.heroTemperature, Number.isFinite(current.temperature) ? `${Math.round(current.temperature)}°` : '--°');
    setText(DOM.heroFeelsLike, Number.isFinite(current.feelsLike) ? `${Math.round(current.feelsLike)}°` : '--°');
    setText(DOM.heroCondition, current.condition || '--');
    
    const city = location.city || '--';
    const region = location.region || '--';
    const country = location.country || '--';
    setText(DOM.heroLocation, `${city}, ${region}, ${country}`);
    
    setIcon(DOM.heroIcon, current.icon_name || 'cloud'); // (Fallback if missing)

    if (todayDaily) {
        setText(DOM.heroMaxTemp, Number.isFinite(todayDaily.maxTemp) ? `${Math.round(todayDaily.maxTemp)}°` : '--°');
        setText(DOM.heroMinTemp, Number.isFinite(todayDaily.minTemp) ? `${Math.round(todayDaily.minTemp)}°` : '--°');
        setText(DOM.heroRainProb, Number.isFinite(todayDaily.rainChance) ? `${todayDaily.rainChance}%` : '--%');
    }
    setText(DOM.heroWind, Number.isFinite(current.windSpeed) ? `${Math.round(current.windSpeed)} km/h` : '-- km/h');
}

function renderSidebar(current, location) {
    setText(DOM.sidebarCity, location.city || '--');
    setText(DOM.sidebarRegion, `${location.region || '--'}, ${location.country || '--'}`);
    
    if (location.localTime && location.localDate) {
        // Normalization returns localDate (YYYY-MM-DD) and localTime (HH:MM)
        // Combine them into a safe standard string to parse
        const dt = new Date(`${location.localDate}T${location.localTime}`);
        if (!isNaN(dt.getTime())) {
            setText(DOM.sidebarTime, dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
            setText(DOM.sidebarDate, dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        } else {
            setText(DOM.sidebarTime, location.localTime);
            setText(DOM.sidebarDate, location.localDate);
        }
    } else {
        setText(DOM.sidebarTime, '--:--');
        setText(DOM.sidebarDate, '--');
    }

    setText(DOM.sidebarTemp, Number.isFinite(current.temperature) ? `${Math.round(current.temperature)}°` : '--°');
    setText(DOM.sidebarCondition, current.condition || '--');
    setIcon(DOM.sidebarIcon, current.icon_name || 'cloud');
}

function renderSummary(todayDaily, current) {
    setIcon(DOM.summaryIcon, current.icon_name || 'cloud');
    setText(DOM.summaryCondition, current.condition || '--');
    
    const max = todayDaily?.maxTemp;
    const min = todayDaily?.minTemp;
    setText(DOM.summaryMaxTemp, Number.isFinite(max) ? `${Math.round(max)}°` : '--°');
    setText(DOM.summaryMinTemp, Number.isFinite(min) ? `${Math.round(min)}°` : '--°');
    setText(DOM.summarySecondary, 'Current Conditions'); 
}

function renderHourlyForecast(hourlyData) {
    if (!DOM.hourlyContainer) return;
    DOM.hourlyContainer.innerHTML = '';
    
    hourlyData.forEach(hour => {
        const item = document.createElement('div');
        item.className = 'hourly-item';
        
        const tempText = Number.isFinite(hour.temperature) ? `${Math.round(hour.temperature)}°` : '--°';
        
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
            <span class="material-symbols-outlined text-on-surface-variant" style="font-size: 20px; font-variation-settings: 'FILL' 1;">${hour.icon_name || 'cloud'}</span>
            <span class="text-data-point" style="font-size: 12px;">${tempText}</span>
            <span class="text-label-caps text-on-surface-variant" style="font-size: 10px; margin-top: 0.5rem;">${timeLabel}</span>
        `;
        DOM.hourlyContainer.appendChild(item);
    });
}

function renderDailyForecast(dailyData) {
    if (!DOM.dailyContainer) return;
    DOM.dailyContainer.innerHTML = '';

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
                <span class="material-symbols-outlined text-on-surface-variant" style="font-variation-settings: 'FILL' 1;">${day.icon_name || 'cloud'}</span>
            </div>
            <div class="flex-col align-center">
                <span class="text-data-point" style="font-size: 14px;">${maxTempText}</span>
                <span class="text-data-point text-on-surface-variant" style="font-size: 14px;">${minTempText}</span>
            </div>
            <div style="margin-top: auto; padding-top: 0.25rem;">
                <span class="text-data-point text-tertiary" style="font-size: 14px;">${rainChanceText}</span>
            </div>
        `;
        DOM.dailyContainer.appendChild(card);
    });
}

function renderAQI(airQuality) {
    const score = airQuality.aqiScore; 
    setText(DOM.aqiScore, Number.isFinite(score) ? score : '--');
    
    if (DOM.aqiStatus) {
        const status = airQuality.aqiStatus || 'Unknown';
        DOM.aqiStatus.textContent = status;
        
        let colorClass = 'text-success';
        if (score > 50) colorClass = 'text-warning';
        if (score > 100) colorClass = 'text-error';
        
        DOM.aqiStatus.className = `text-headline-md ${colorClass}`;
    }

    setText(DOM.aqiMainPollutant, `Main Pollutant: ${airQuality.mainPollutant || '--'}`);
    setText(DOM.aqiHealthAdvisory, airQuality.healthAdvisory || 'No advisory data available.');
    
    if (DOM.aqiGaugeFill) {
        const maxScore = 300;
        const boundedScore = Math.min(Number.isFinite(score) ? score : 0, maxScore);
        const ratio = boundedScore / maxScore;
        const offset = 276.46 - (276.46 * ratio);
        DOM.aqiGaugeFill.style.strokeDashoffset = offset;
    }
}

function renderMetricsStrip(current, astronomy) {
    setText(DOM.metricFeelsLike, Number.isFinite(current.feelsLike) ? `${Math.round(current.feelsLike)}°` : '--°');
    setText(DOM.metricHumidity, Number.isFinite(current.humidity) ? `${current.humidity}%` : '--%');
    setText(DOM.metricWind, Number.isFinite(current.windSpeed) ? `${Math.round(current.windSpeed)} km/h` : '-- km/h');
    setText(DOM.metricPressure, Number.isFinite(current.pressure) ? `${current.pressure} hPa` : '-- hPa');
    setText(DOM.metricVisibility, Number.isFinite(current.visibility) ? `${current.visibility} km` : '-- km');
    setText(DOM.metricCloudCover, Number.isFinite(current.cloudCover) ? `${current.cloudCover}%` : '--%');
    setText(DOM.metricDewPoint, Number.isFinite(current.dewPoint) ? `${Math.round(current.dewPoint)}°` : '--°');
    setText(DOM.metricUV, Number.isFinite(current.uv) ? `${current.uv} UV` : '-- UV');
    
    setText(DOM.metricSunrise, astronomy.sunrise || '--:--');
    setText(DOM.metricSunset, astronomy.sunset || '--:--');
    setText(DOM.metricMoonPhase, astronomy.moonPhase || '--');
}

export function initDashboardController() {
    let missingIds = 0;
    Object.keys(DOM).forEach(key => {
        if (!DOM[key]) {
            console.warn(`DashboardController: Missing DOM element for ${key}`);
            missingIds++;
        }
    });
    
    if (missingIds > 0) {
        console.warn(`DashboardController: ${missingIds} render targets missing, updates will be gracefully skipped.`);
    }

    store.subscribe(handleStateChange);
}
