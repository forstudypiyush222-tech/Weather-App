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
    summaryRain: document.getElementById('summary-rain'),
    summaryWind: document.getElementById('summary-wind'),
    summaryUV: document.getElementById('summary-uv'),

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

let hourlyChartInstance = null;
let hourlyChartGradient = null;

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

function renderHero(current, location, todayDaily) {
    setText(DOM.heroTemperature, Number.isFinite(current.temperature) ? `${Math.round(current.temperature)}°` : '--°');
    setText(DOM.heroFeelsLike, Number.isFinite(current.feelsLike) ? `${Math.round(current.feelsLike)}°` : '--°');
    setText(DOM.heroCondition, current.condition || '--');
    
    const city = location.city || '--';
    const region = location.region || '--';
    const country = location.country || '--';
    setText(DOM.heroLocation, `${city}, ${region}, ${country}`);
    
    setIcon(DOM.heroIcon, current.icon || 'cloud'); // (Fallback if missing)

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
    setIcon(DOM.sidebarIcon, current.icon || 'cloud');
}

function renderSummary(todayDaily, current) {
    setIcon(DOM.summaryIcon, current.icon || 'cloud');
    setText(DOM.summaryCondition, current.condition || '--');
    
    const max = todayDaily?.maxTemp;
    const min = todayDaily?.minTemp;
    const rainProb = todayDaily?.rainChance;

    setText(DOM.summaryMaxTemp, Number.isFinite(max) ? `${Math.round(max)}°` : '--°');
    setText(DOM.summaryMinTemp, Number.isFinite(min) ? `${Math.round(min)}°` : '--°');
    setText(DOM.summaryRain, Number.isFinite(rainProb) ? `${rainProb}%` : '--%');
    
    setText(DOM.summaryWind, Number.isFinite(current.windSpeed) ? `${Math.round(current.windSpeed)} km/h` : '-- km/h');
    setText(DOM.summaryUV, getUVClassification(current.uv));

    setText(DOM.summarySecondary, 'Current Conditions'); 
}

function renderHourlyTimeline(hourlyData, selectedMetric = 'temp') {
    // Sync toggle active states
    const toggleBtns = document.querySelectorAll('#hourly-metric-toggles .toggle-btn');
    toggleBtns.forEach(btn => {
        if (btn.getAttribute('data-metric') === selectedMetric) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (!DOM.hourlyContainer) return;
    DOM.hourlyContainer.innerHTML = '';
    
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
        DOM.hourlyContainer.appendChild(item);
    });
}

let tooltipNodes = null;

function initTooltip() {
    if (tooltipNodes) return;
    const tooltipEl = document.getElementById('chart-tooltip');
    if (!tooltipEl) return;
    
    tooltipNodes = {
        root: tooltipEl,
        icon: tooltipEl.querySelector('.tooltip-icon'),
        condition: tooltipEl.querySelector('.tooltip-condition'),
        time: tooltipEl.querySelector('.tooltip-time'),
        metrics: {
            temp: {
                wrapper: tooltipEl.querySelector('.tooltip-metric[data-type="temp"]'),
                value: tooltipEl.querySelector('.tooltip-metric[data-type="temp"] .metric-value')
            },
            feelsLike: {
                wrapper: tooltipEl.querySelector('.tooltip-metric[data-type="feelsLike"]'),
                value: tooltipEl.querySelector('.tooltip-metric[data-type="feelsLike"] .metric-value')
            },
            rainChance: {
                wrapper: tooltipEl.querySelector('.tooltip-metric[data-type="rainChance"]'),
                value: tooltipEl.querySelector('.tooltip-metric[data-type="rainChance"] .metric-value')
            },
            windSpeed: {
                wrapper: tooltipEl.querySelector('.tooltip-metric[data-type="windSpeed"]'),
                value: tooltipEl.querySelector('.tooltip-metric[data-type="windSpeed"] .metric-value')
            }
        }
    };
}

const getConditionFromIcon = (icon) => {
    const map = {
        'clear_day': 'Sunny',
        'clear_night': 'Clear',
        'partly_cloudy_day': 'Partly Cloudy',
        'partly_cloudy_night': 'Partly Cloudy',
        'cloudy': 'Cloudy',
        'rain': 'Rain',
        'snow': 'Snow',
        'thunderstorm': 'Thunderstorm',
        'fog': 'Fog',
        'water_drop': 'Rain'
    };
    return map[icon] || 'Cloudy';
};

const externalTooltipHandler = (context) => {
    initTooltip();
    if (!tooltipNodes) return;

    const { chart, tooltip } = context;

    if (tooltip.opacity === 0) {
        tooltipNodes.root.classList.remove('visible');
        return;
    }

    const dataIndex = tooltip.dataPoints[0].dataIndex;
    const state = store.getState();
    const hourlyData = state.hourly && state.hourly[dataIndex];
    const selectedMetric = state.ui.selectedHourlyMetric;

    if (hourlyData) {
        tooltipNodes.icon.textContent = hourlyData.icon || 'cloud';
        tooltipNodes.condition.textContent = getConditionFromIcon(hourlyData.icon);

        let timeLabel = hourlyData.time || '--:--';
        if (timeLabel.includes(':')) {
            const [hr] = timeLabel.split(':');
            const dateObj = new Date();
            dateObj.setHours(parseInt(hr, 10), 0, 0);
            if (!isNaN(dateObj.getTime())) {
                timeLabel = dateObj.toLocaleTimeString('en-US', { hour: 'numeric' });
            }
        }
        tooltipNodes.time.textContent = timeLabel;

        tooltipNodes.metrics.temp.value.textContent = Number.isFinite(hourlyData.temperature) ? `${Math.round(hourlyData.temperature)}°` : '--°';
        const feelsLikeVal = Number.isFinite(hourlyData.feelsLike) ? hourlyData.feelsLike : hourlyData.temperature;
        tooltipNodes.metrics.feelsLike.value.textContent = Number.isFinite(feelsLikeVal) ? `${Math.round(feelsLikeVal)}°` : '--°';
        tooltipNodes.metrics.rainChance.value.textContent = Number.isFinite(hourlyData.rainChance) ? `${hourlyData.rainChance}%` : '--%';
        tooltipNodes.metrics.windSpeed.value.textContent = Number.isFinite(hourlyData.windSpeed) ? `${Math.round(hourlyData.windSpeed)} km/h` : '-- km/h';

        Object.values(tooltipNodes.metrics).forEach(m => m.wrapper.classList.remove('primary'));
        
        let primaryMetricType = 'temp';
        if (selectedMetric === 'precipitation') primaryMetricType = 'rainChance';
        if (selectedMetric === 'wind') primaryMetricType = 'windSpeed';

        tooltipNodes.metrics[primaryMetricType].wrapper.classList.add('primary');
        
        tooltipNodes.metrics.temp.wrapper.style.order = primaryMetricType === 'temp' ? -1 : 1;
        tooltipNodes.metrics.rainChance.wrapper.style.order = primaryMetricType === 'rainChance' ? -1 : 2;
        tooltipNodes.metrics.windSpeed.wrapper.style.order = primaryMetricType === 'windSpeed' ? -1 : 3;
        tooltipNodes.metrics.feelsLike.wrapper.style.order = 4;
    }

    const canvasRect = chart.canvas.getBoundingClientRect();
    
    let left = canvasRect.left + tooltip.caretX;
    let top = canvasRect.top + tooltip.caretY - 10;

    const tooltipHeight = tooltipNodes.root.offsetHeight || 160;
    const tooltipWidth = tooltipNodes.root.offsetWidth || 200;

    top -= tooltipHeight;

    const viewportWidth = window.innerWidth;
    
    if (left < tooltipWidth / 2 + 10) {
        left = tooltipWidth / 2 + 10;
    } else if (left + tooltipWidth / 2 > viewportWidth - 10) {
        left = viewportWidth - tooltipWidth / 2 - 10;
    }

    if (top < 10) {
        top = canvasRect.top + tooltip.caretY + 20;
    }

    tooltipNodes.root.style.left = `${left}px`;
    tooltipNodes.root.style.top = `${top}px`;
    
    tooltipNodes.root.classList.add('visible');
};

const interactiveCrosshairPlugin = {
    id: 'interactiveCrosshair',
    afterEvent(chart, args) {
        const { event } = args;
        const elements = chart.getElementsAtEventForMode(event, 'index', { intersect: false }, true);
        
        if (event.type === 'mousemove' && elements && elements.length > 0) {
            const activeIndex = elements[0].index;
            
            if (chart.pluginActiveIndex !== activeIndex) {
                const timelineItems = document.querySelectorAll('#hourly-forecast-container .hourly-item');
                
                if (chart.pluginActiveIndex !== undefined && timelineItems[chart.pluginActiveIndex]) {
                    timelineItems[chart.pluginActiveIndex].classList.remove('active');
                }
                
                if (timelineItems[activeIndex]) {
                    timelineItems[activeIndex].classList.add('active');
                }
                
                chart.pluginActiveIndex = activeIndex;
                chart.isHovering = true;
            }
        } else if (event.type === 'mouseout') {
            if (chart.pluginActiveIndex !== undefined) {
                const timelineItems = document.querySelectorAll('#hourly-forecast-container .hourly-item');
                if (timelineItems[chart.pluginActiveIndex]) {
                    timelineItems[chart.pluginActiveIndex].classList.remove('active');
                }
            }
            chart.pluginActiveIndex = undefined;
            chart.isHovering = false;
        }
    },
    beforeDatasetsDraw(chart) {
        if (!chart.isHovering || chart.pluginActiveIndex === undefined) return;

        const ctx = chart.ctx;
        const tooltip = chart.tooltip;
        
        const x = tooltip && tooltip.opacity > 0 ? tooltip.caretX : chart.getDatasetMeta(0).data[chart.pluginActiveIndex].x;
        
        const topY = chart.chartArea.top;
        const bottomY = chart.chartArea.bottom;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
        ctx.restore();
        
        // Dim native dataset
        ctx.globalAlpha = 0.5;
    },
    afterDatasetsDraw(chart) {
        if (!chart.isHovering || chart.pluginActiveIndex === undefined) return;
        
        const ctx = chart.ctx;
        ctx.globalAlpha = 1.0; // Restore alpha
        
        const tooltip = chart.tooltip;
        const x = tooltip && tooltip.opacity > 0 ? tooltip.caretX : chart.getDatasetMeta(0).data[chart.pluginActiveIndex].x;
        const y = tooltip && tooltip.opacity > 0 ? tooltip.caretY : chart.getDatasetMeta(0).data[chart.pluginActiveIndex].y;
        
        const borderColor = chart.data.datasets[0].borderColor || '#00d4ff';
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
        ctx.restore();
    },
    afterDraw(chart) {
        if (!chart.isHovering || chart.pluginActiveIndex === undefined) return;
        
        const ctx = chart.ctx;
        const tooltip = chart.tooltip;
        const x = tooltip && tooltip.opacity > 0 ? tooltip.caretX : chart.getDatasetMeta(0).data[chart.pluginActiveIndex].x;
        const bottomY = chart.chartArea.bottom;
        
        const label = chart.data.labels[chart.pluginActiveIndex];
        
        ctx.save();
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        const textWidth = ctx.measureText(label).width;
        const pillWidth = textWidth + 16;
        const pillHeight = 24;
        
        let pillX = x - pillWidth / 2;
        pillX = Math.max(chart.chartArea.left, Math.min(pillX, chart.chartArea.right - pillWidth));
        
        ctx.fillStyle = 'rgba(23, 31, 51, 0.8)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(pillX, bottomY - pillHeight, pillWidth, pillHeight, 12);
        } else {
            // Fallback for older browsers
            ctx.rect(pillX, bottomY - pillHeight, pillWidth, pillHeight);
        }
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, pillX + pillWidth / 2, bottomY - pillHeight / 2);
        ctx.restore();
    }
};

function updateHourlyChart(hourlyData, selectedMetric) {
    if (!hourlyData || hourlyData.length === 0) return;
    
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded yet.');
        return;
    }

    const canvas = document.getElementById('hourly-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Cache the gradient
    if (!hourlyChartGradient) {
        hourlyChartGradient = ctx.createLinearGradient(0, 0, 0, 300);
        hourlyChartGradient.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
        hourlyChartGradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');
    }

    // Prepare Data
    const labels = hourlyData.map(h => {
        let timeLabel = h.time || '--:--';
        if (timeLabel.includes(':')) {
            const [hr] = timeLabel.split(':');
            const dateObj = new Date();
            dateObj.setHours(parseInt(hr, 10), 0, 0);
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toLocaleTimeString('en-US', { hour: 'numeric' });
            }
        }
        return timeLabel;
    });

    let data = [];
    let chartType = 'line';
    let borderColor = '#00d4ff';
    let backgroundColor = hourlyChartGradient;
    let tooltipSuffix = '';
    let tooltipTitle = '';
    let yAxisMin = undefined;
    let yAxisMax = undefined;
    let tension = 0.4;
    let borderWidth = 3;
    let pointRadius = 4;
    let pointHoverRadius = 6;
    let fill = true;

    if (selectedMetric === 'temp') {
        data = hourlyData.map(h => Number.isFinite(h.temperature) ? h.temperature : null);
        tooltipSuffix = '°';
        tooltipTitle = 'Temperature';
    } else if (selectedMetric === 'precipitation') {
        data = hourlyData.map(h => Number.isFinite(h.rainChance) ? h.rainChance : null);
        chartType = 'bar';
        backgroundColor = 'rgba(0, 150, 255, 0.6)';
        borderColor = 'rgba(0, 150, 255, 1)';
        borderWidth = 1;
        yAxisMin = 0;
        yAxisMax = 100;
        tooltipSuffix = '%';
        tooltipTitle = 'Rain Chance';
        fill = false;
    } else if (selectedMetric === 'wind') {
        data = hourlyData.map(h => Number.isFinite(h.windSpeed) ? h.windSpeed : null);
        borderColor = '#aaaaff';
        // Subtly different gradient for wind if desired, but we can reuse a simple fill
        backgroundColor = 'rgba(170, 170, 255, 0.2)'; 
        tooltipSuffix = ' km/h';
        tooltipTitle = 'Wind Speed';
        fill = true;
    }

    if (!hourlyChartInstance) {
        // Initialize once
        hourlyChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: tooltipTitle,
                    data: data,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    borderWidth: borderWidth,
                    tension: tension,
                    pointRadius: chartType === 'line' ? pointRadius : 0,
                    pointHoverRadius: chartType === 'line' ? pointHoverRadius : 0,
                    fill: fill,
                    borderRadius: chartType === 'bar' ? 4 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false,
                        external: externalTooltipHandler,
                        animation: {
                            duration: 150
                        }
                    }
                },
                hover: {
                    animationDuration: 150
                },
                animation: {
                    duration: 400 // initial
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { display: false }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                        min: yAxisMin,
                        max: yAxisMax
                    }
                },
                plugins: [interactiveCrosshairPlugin]
            },
            plugins: [interactiveCrosshairPlugin]
        });
    } else {
        // Update efficiently
        hourlyChartInstance.config.type = chartType;
        hourlyChartInstance.data.labels = labels;
        const dataset = hourlyChartInstance.data.datasets[0];
        
        dataset.label = tooltipTitle;
        dataset.data = data;
        dataset.borderColor = borderColor;
        dataset.backgroundColor = backgroundColor;
        dataset.borderWidth = borderWidth;
        dataset.tension = tension;
        dataset.pointRadius = chartType === 'line' ? pointRadius : 0;
        dataset.pointHoverRadius = chartType === 'line' ? pointHoverRadius : 0;
        dataset.fill = fill;
        dataset.borderRadius = chartType === 'bar' ? 4 : 0;

        hourlyChartInstance.options.scales.y.min = yAxisMin;
        hourlyChartInstance.options.scales.y.max = yAxisMax;
        
        hourlyChartInstance.update();
    }
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
                if (hourlyChartInstance) {
                    hourlyChartInstance.resize();
                    hourlyChartInstance.update('none');
                }
            }
        });
    }

    store.subscribe(handleStateChange);
}
