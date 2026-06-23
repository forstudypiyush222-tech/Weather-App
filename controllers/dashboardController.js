/**
 * Aether Weather - Dashboard Controller
 * Phase 4.6
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
    setText(DOM.heroTemperature, `${Math.round(current.temp_c)}°`);
    setText(DOM.heroFeelsLike, `${Math.round(current.feelslike_c)}°`);
    setText(DOM.heroCondition, current.condition.text);
    setText(DOM.heroLocation, `${location.name}, ${location.region}, ${location.country}`);
    setIcon(DOM.heroIcon, current.icon_name || 'cloud');

    if (todayDaily) {
        setText(DOM.heroMaxTemp, `${Math.round(todayDaily.day.maxtemp_c)}°`);
        setText(DOM.heroMinTemp, `${Math.round(todayDaily.day.mintemp_c)}°`);
        setText(DOM.heroRainProb, `${todayDaily.day.daily_chance_of_rain}%`);
    }
    setText(DOM.heroWind, `${Math.round(current.wind_kph)} km/h`);
}

function renderSidebar(current, location) {
    setText(DOM.sidebarCity, location.name);
    setText(DOM.sidebarRegion, `${location.region}, ${location.country}`);
    
    const dt = new Date(location.localtime);
    if (!isNaN(dt.getTime())) {
        setText(DOM.sidebarTime, dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
        setText(DOM.sidebarDate, dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    } else {
        setText(DOM.sidebarTime, location.localtime);
        setText(DOM.sidebarDate, '');
    }

    setText(DOM.sidebarTemp, `${Math.round(current.temp_c)}°`);
    setText(DOM.sidebarCondition, current.condition.text);
    setIcon(DOM.sidebarIcon, current.icon_name || 'cloud');
}

function renderSummary(todayDaily, current) {
    setIcon(DOM.summaryIcon, current.icon_name || 'cloud');
    setText(DOM.summaryCondition, current.condition.text);
    setText(DOM.summaryMaxTemp, `${Math.round(todayDaily.day.maxtemp_c)}°`);
    setText(DOM.summaryMinTemp, `${Math.round(todayDaily.day.mintemp_c)}°`);
    setText(DOM.summarySecondary, 'Current Conditions'); 
}

function renderHourlyForecast(hourlyData) {
    if (!DOM.hourlyContainer) return;
    DOM.hourlyContainer.innerHTML = '';
    
    hourlyData.forEach(hour => {
        const item = document.createElement('div');
        item.className = 'hourly-item';
        
        const dt = new Date(hour.time);
        const timeLabel = hour.time_label || (!isNaN(dt.getTime()) ? dt.toLocaleTimeString('en-US', { hour: 'numeric' }) : hour.time);
        
        item.innerHTML = `
            <span class="material-symbols-outlined text-on-surface-variant" style="font-size: 20px; font-variation-settings: 'FILL' 1;">${hour.icon_name || 'cloud'}</span>
            <span class="text-data-point" style="font-size: 12px;">${Math.round(hour.temp_c)}°</span>
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
        card.innerHTML = `
            <span class="text-label-caps text-on-surface-variant">${day.day_label || day.date}</span>
            <div class="daily-icon-box">
                <span class="material-symbols-outlined text-on-surface-variant" style="font-variation-settings: 'FILL' 1;">${day.icon_name || 'cloud'}</span>
            </div>
            <div class="flex-col align-center">
                <span class="text-data-point" style="font-size: 14px;">${Math.round(day.day.maxtemp_c)}°</span>
                <span class="text-data-point text-on-surface-variant" style="font-size: 14px;">${Math.round(day.day.mintemp_c)}°</span>
            </div>
            <div style="margin-top: auto; padding-top: 0.25rem;">
                <span class="text-data-point text-tertiary" style="font-size: 14px;">${day.day.daily_chance_of_rain}%</span>
            </div>
        `;
        DOM.dailyContainer.appendChild(card);
    });
}

function renderAQI(airQuality) {
    const score = airQuality.aqi || airQuality['us-epa-index'] || 50; 
    setText(DOM.aqiScore, score);
    
    let status = 'Good';
    let colorClass = 'text-success';
    if (score > 50) { status = 'Moderate'; colorClass = 'text-warning'; }
    if (score > 100) { status = 'Unhealthy for Sensitive Groups'; colorClass = 'text-error'; }
    if (score > 150) { status = 'Unhealthy'; colorClass = 'text-error'; }
    if (score > 200) { status = 'Very Unhealthy'; colorClass = 'text-error'; }
    if (score > 300) { status = 'Hazardous'; colorClass = 'text-error'; }

    if (DOM.aqiStatus) {
        DOM.aqiStatus.textContent = status;
        DOM.aqiStatus.className = `text-headline-md ${colorClass}`;
    }

    setText(DOM.aqiMainPollutant, `Main Pollutant: ${airQuality.main_pollutant || 'PM2.5'}`);
    setText(DOM.aqiHealthAdvisory, `Health Advisory for ${status} conditions.`);
    
    if (DOM.aqiGaugeFill) {
        const maxScore = 300;
        const boundedScore = Math.min(score, maxScore);
        const ratio = boundedScore / maxScore;
        const offset = 276.46 - (276.46 * ratio);
        DOM.aqiGaugeFill.style.strokeDashoffset = offset;
    }
}

function renderMetricsStrip(current, astronomy) {
    setText(DOM.metricFeelsLike, `${Math.round(current.feelslike_c)}°`);
    setText(DOM.metricHumidity, `${current.humidity}%`);
    setText(DOM.metricWind, `${Math.round(current.wind_kph)} km/h`);
    setText(DOM.metricPressure, `${current.pressure_mb} hPa`);
    setText(DOM.metricVisibility, `${current.vis_km} km`);
    setText(DOM.metricCloudCover, `${current.cloud}%`);
    setText(DOM.metricDewPoint, current.dewpoint_c !== undefined ? `${Math.round(current.dewpoint_c)}°` : '--');
    setText(DOM.metricUV, `${current.uv} UV`);
    setText(DOM.metricSunrise, astronomy.sunrise || '--');
    setText(DOM.metricSunset, astronomy.sunset || '--');
    setText(DOM.metricMoonPhase, astronomy.moon_phase || '--');
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
